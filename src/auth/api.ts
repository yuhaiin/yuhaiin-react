import { getApiUrl } from '@/common/apiurl';
import { directJSON, requireSecureController } from './transport';
import { authScope, getSession, establishSession, clearSession, type Principal } from './session';

export interface PasswordParameters { algorithm: string; salt: string; iterations: number; digest: string; bytes: number; normalization: string; encoding: string }
export interface User { id: string; login: string; role: 'admin' | 'read-only'; disabled: boolean; enrolled: boolean; createdAt: number; updatedAt: number }
export interface Token { id: string; userId: string; kind: string; prefix: string; scopes: string[]; createdAt: number; expiresAt: number; revoked: boolean }
export interface Issued extends Token { secret: string }
export const authAPI = <T>(method: string, path: string, body?: unknown) => directJSON<T>(method, `/api/v2/auth${path}`, body);

export async function deriveCredential(password: string, parameters: PasswordParameters): Promise<string> {
    if (parameters.algorithm !== 'pbkdf2-sha256-v1' || parameters.iterations !== 600000 || parameters.digest !== 'SHA-256' ||
        parameters.bytes !== 32 || parameters.normalization !== 'NFC' || parameters.encoding !== 'utf-8/base64url-unpadded') throw new Error('Unsupported password KDF parameters');
    for (const character of password) { const point = character.codePointAt(0)!; if (point >= 0xd800 && point <= 0xdfff) throw new Error('Invalid Unicode password'); }
    const input = new TextEncoder().encode(password.normalize('NFC'));
    if (!input.length || input.length > 1024) throw new Error('Password must contain 1 to 1024 UTF-8 bytes');
    const salt = Uint8Array.from(atob(parameters.salt.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    if (salt.length !== 16) throw new Error('Invalid client salt');
    const key = await crypto.subtle.importKey('raw', input, 'PBKDF2', false, ['deriveBits']);
    const result = new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', iterations: 600000, salt }, key, 256));
    return btoa(String.fromCharCode(...result)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export async function login(name: string, password: string) {
    requireSecureController();
    const controller = getApiUrl();
    const scope = authScope();
    const parameters = await authAPI<PasswordParameters>('POST', '/parameters', { login: name });
    const clientCredential = await deriveCredential(password, parameters);
    if (controller !== getApiUrl() || scope !== authScope()) throw new Error('Controller changed');
    const issued = await authAPI<Issued>('POST', '/login', { login: name, clientCredential });
    if (controller !== getApiUrl() || scope !== authScope()) throw new Error('Controller changed');
    const principal = await directJSON<Principal>('GET', '/api/v2/auth/me', undefined, `Session ${issued.secret}`);
    if (controller !== getApiUrl() || scope !== authScope()) throw new Error('Controller or session changed');
    establishSession(issued.secret, principal, issued.expiresAt, controller);
}
export async function enroll(secret: string, password: string) {
    requireSecureController();
    const controller = getApiUrl();
    const parameters = await directJSON<PasswordParameters>('POST', '/api/v2/auth/enrollment/parameters', {}, `Enrollment ${secret}`);
    const clientCredential = await deriveCredential(password, parameters);
    if (controller !== getApiUrl()) throw new Error('Controller changed');
    await directJSON('POST', '/api/v2/auth/enrollment', { clientCredential }, `Enrollment ${secret}`);
}
export async function logout() { const session = getSession(); try { await authAPI('DELETE', '/session'); } finally { if (getSession() === session) clearSession(); } }
