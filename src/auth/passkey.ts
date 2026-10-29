import { getApiUrl } from '@/common/apiurl';
import { authAPI, directJSON, type Issued } from './api';
import { authScope, establishSession } from './session';
import { requireSecureController } from './transport';

export interface PasskeyInfo {
    id: string;
    name: string;
    rpId: string;
    createdAt: number;
    lastUsedAt: number;
}

type Ceremony = { flowId: string; options: { publicKey: Record<string, unknown> } };

// WebAuthn sends binary values, whereas the JSON HTTP contract uses base64url.
export function fromBase64URL(value: string): Uint8Array<ArrayBuffer> {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
    return Uint8Array.from(binary, c => c.charCodeAt(0));
}

export function toBase64URL(value: ArrayBuffer): string {
    const bytes = new Uint8Array(value);
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function creationOptions(options: Ceremony['options']): PublicKeyCredentialCreationOptions {
    const p = options.publicKey as unknown as {
        challenge: string;
        user: { id: string };
        excludeCredentials?: Array<{ id: string }>;
    };
    return {
        ...p, challenge: fromBase64URL(p.challenge),
        user: { ...p.user, id: fromBase64URL(p.user.id) },
        excludeCredentials: p.excludeCredentials?.map(item => ({ ...item, id: fromBase64URL(item.id) })),
    } as PublicKeyCredentialCreationOptions;
}

function requestOptions(options: Ceremony['options']): PublicKeyCredentialRequestOptions {
    const p = options.publicKey as unknown as {
        challenge: string;
        allowCredentials?: Array<{ id: string }>;
    };
    return {
        ...p, challenge: fromBase64URL(p.challenge),
        allowCredentials: p.allowCredentials?.map(item => ({ ...item, id: fromBase64URL(item.id) })),
    } as PublicKeyCredentialRequestOptions;
}

function serializedCredential(credential: PublicKeyCredential) {
    const response = credential.response;
    const output = {
        id: credential.id,
        rawId: toBase64URL(credential.rawId),
        type: credential.type,
        authenticatorAttachment: credential.authenticatorAttachment,
        clientExtensionResults: credential.getClientExtensionResults(),
    };
    if (response instanceof AuthenticatorAttestationResponse) {
        return { ...output, response: {
            clientDataJSON: toBase64URL(response.clientDataJSON),
            attestationObject: toBase64URL(response.attestationObject),
            transports: response.getTransports?.() ?? [],
        } };
    }
    const assertion = response as AuthenticatorAssertionResponse;
    return { ...output, response: {
        clientDataJSON: toBase64URL(assertion.clientDataJSON),
        authenticatorData: toBase64URL(assertion.authenticatorData),
        signature: toBase64URL(assertion.signature),
        userHandle: assertion.userHandle ? toBase64URL(assertion.userHandle) : null,
    } };
}

export function passkeySupported(): boolean {
    return typeof window !== 'undefined' && window.isSecureContext && !!navigator.credentials && !!window.PublicKeyCredential;
}

function ensurePasskey() {
    if (!passkeySupported()) throw new Error('Passkeys require a secure browser context and WebAuthn support');
    requireSecureController();
}

function unchanged(controller: string, scope: string) {
    if (controller !== getApiUrl() || scope !== authScope()) throw new Error('Controller or session changed');
}

export async function loginWithPasskey() {
    ensurePasskey();
    const controller = getApiUrl();
    const scope = authScope();
    const begin = await directJSON<Ceremony>('POST', '/api/v2/auth/passkeys/login/begin', {});
    unchanged(controller, scope);
    const credential = await navigator.credentials.get({ publicKey: requestOptions(begin.options) }) as PublicKeyCredential | null;
    if (!credential) throw new Error('Passkey authentication was cancelled');
    unchanged(controller, scope);
    const issued = await directJSON<Issued>('POST', '/api/v2/auth/passkeys/login/finish', {
        flowId: begin.flowId, credential: serializedCredential(credential),
    });
    unchanged(controller, scope);
    const principal = await directJSON<import('./session').Principal>('GET', '/api/v2/auth/me', undefined, `Session ${issued.secret}`);
    unchanged(controller, scope);
    establishSession(issued.secret, principal, issued.expiresAt, controller);
}

export async function addPasskey(name: string) {
    ensurePasskey();
    const controller = getApiUrl(), scope = authScope();
    const begin = await authAPI<Ceremony>('POST', '/passkeys/register/begin', { name });
    unchanged(controller, scope);
    const credential = await navigator.credentials.create({ publicKey: creationOptions(begin.options) }) as PublicKeyCredential | null;
    if (!credential) throw new Error('Passkey registration was cancelled');
    unchanged(controller, scope);
    await authAPI('POST', '/passkeys/register/finish', {
        flowId: begin.flowId, credential: serializedCredential(credential),
    });
}

export async function listPasskeys() {
    return authAPI<PasskeyInfo[]>('GET', '/passkeys');
}

export async function removePasskey(id: string) {
    return authAPI('DELETE', `/passkeys/${encodeURIComponent(id)}`);
}
