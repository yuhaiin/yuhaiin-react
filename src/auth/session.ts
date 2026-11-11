import { getApiUrl } from '@/common/apiurl';
import { operationPermissions } from './operations';

export interface Principal { credentialId?: string; userId: string; credentialType: string; permissions: string[] }
export interface Session { authorization: string; principal: Principal; expiresAt: number; controller: string }
let session: Session | null = null;
let enrollment: { secret: string; controller: string } | null = null;
let version = 0;
let expiry: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();
function changed() { version++; listeners.forEach(listener => listener()); }
export function subscribeAuth(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
export function authScope() { return JSON.stringify([getApiUrl(), version]); }
export function getSession() { return session?.controller === getApiUrl() ? session : null; }
export function authHeaders(): Record<string, string> { const current = getSession(); return current?.authorization ? { Authorization: current.authorization } : {}; }
export function clearSession() { clearTimeout(expiry); session = null; changed(); }
export function establishSession(secret: string, principal: Principal, expiresAt: number, controller: string) {
    if (controller !== getApiUrl() || expiresAt * 1000 <= Date.now()) throw new Error('Session expired or controller changed');
    clearTimeout(expiry);
    session = { authorization: secret ? `Session ${secret}` : '', principal, expiresAt, controller };
    enrollment = null;
    expiry = setTimeout(clearSession, expiresAt * 1000 - Date.now());
    changed();
}
/** Anonymous mode is local-only, except for Android's explicit HTTPS Allow LAN opt-in.
 * The candidate must be the page's own origin; a remote controller supplied by a
 * different page must not become an anonymous session. The backend independently
 * enforces the peer, TLS and Origin policy.
 */
export function allowsAnonymousController(controller: string, lanManagement = false, documentOrigin = window.location.origin): boolean {
    try {
        const url = new URL(controller || window.location.href);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
        if (['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) return true;
        return lanManagement && url.protocol === 'https:' && url.origin === documentOrigin;
    } catch { return false; }
}
/** An identity-free controller creates a client-side connection state, never credentials. */
export function establishLocalConnection(controller: string, lanManagement = false) {
    if (controller !== getApiUrl() || !allowsAnonymousController(controller, lanManagement)) throw new Error('Anonymous management requires loopback or opted-in same-origin HTTPS Android');
    clearTimeout(expiry);
    session = { authorization: '', controller, expiresAt: 0, principal: { userId: '', credentialType: 'local', permissions: [...new Set(Object.values(operationPermissions))] } };
    enrollment = null;
    changed();
}
export function updatePrincipal(principal: Principal) {
    if (!getSession() || JSON.stringify(session!.principal) === JSON.stringify(principal)) return;
    session = { ...session!, principal }; changed();
}
export function can(permission: string) { return getSession()?.principal.permissions.includes(permission) ?? false; }
export function setPendingEnrollment(secret: string) { enrollment = { secret, controller: getApiUrl() }; }
export function pendingEnrollment() { return enrollment?.controller === getApiUrl() ? enrollment.secret : ''; }
export function discardEnrollment() { enrollment = null; }
// Remove credentials left by older releases. Nothing replaces them in storage.
try { localStorage.removeItem('auth_token'); } catch { /* Storage can be unavailable. */ }
window.addEventListener('local-storage', () => {
    if (session && session.controller !== getApiUrl()) clearSession();
    if (enrollment && enrollment.controller !== getApiUrl()) enrollment = null;
});
window.addEventListener('storage', () => { if (session && session.controller !== getApiUrl()) clearSession(); });
