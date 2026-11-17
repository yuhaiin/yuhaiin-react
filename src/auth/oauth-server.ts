import { authAPI } from './api';
import { getSession } from './session';

/**
 * Yuhaiin's own OAuth 2.1 Authorization Server. It is unrelated to the
 * GitHub/Google/OIDC sign-in providers in oauth.ts: here Yuhaiin issues tokens
 * to applications a signed-in user authorizes.
 */
export interface OAuthServerSettings {
    enabled: boolean; issuer: string; dynamicRegistration: boolean; disabledResources: string[];
    accessTokenTtl: number; refreshTokenTtl: number; grantTtl: number; revision: number;
}
export interface OAuthResource { id: string; name: string; uri?: string; metadataUrl?: string; scopes: string[]; required?: string; enabled: boolean; legacyCredentials: boolean }
export interface OAuthServerOverview {
    settings: OAuthServerSettings; metadataUrl?: string; authorizationEndpoint?: string; tokenEndpoint?: string;
    revocationEndpoint?: string; registrationEndpoint?: string; resources: OAuthResource[];
}
export type OAuthClientType = 'public' | 'confidential';
export interface OAuthClient {
    id: string; name: string; type: OAuthClientType; registration: 'manual' | 'dynamic'; redirectUris: string[];
    tokenEndpointAuthMethod: string; grantTypes: string[]; scopes: string[]; resources: string[]; clientUri: string;
    createdBy: string; createdAt: number; updatedAt: number; disabled: boolean; activeGrants: number;
}
export interface OAuthClientRequest { name: string; type?: OAuthClientType; redirectUris: string[]; tokenEndpointAuthMethod?: string; scopes: string[]; resources: string[]; clientUri: string; disabled: boolean }
export interface OAuthGrant {
    id: string; clientId: string; clientName: string; clientType: OAuthClientType; registration: 'manual' | 'dynamic';
    userId: string; userLogin: string; resource: string; resourceId: string; scopes: string[];
    createdAt: number; expiresAt: number; lastUsedAt: number; revoked: boolean; revokedReason: string; activeTokens: number;
}
export interface OAuthToken { id: string; grantId: string; kind: 'access' | 'refresh'; prefix: string; scopes: string[]; createdAt: number; expiresAt: number; lastSeen: number; revoked: boolean }
export interface ConsentScope { id: string; category: string; description: string; access: 'read' | 'write' | 'connect'; required: boolean; available: boolean; previouslyGranted: boolean }
export interface AuthorizationDetails {
    id: string; clientId: string; clientName: string; clientType: OAuthClientType; clientUri: string; registration: 'manual' | 'dynamic';
    redirectOrigin: string; redirectUri: string; resource: string; resourceId: string; resourceName: string;
    scopes: ConsentScope[]; expiresAt: number; accessTokenTtl: number; grantTtl: number; existingGrant: boolean;
}

const base = '/oauth-server';
export const oauthServer = {
    overview: () => authAPI<OAuthServerOverview>('GET', `${base}/settings`),
    saveSettings: (settings: OAuthServerSettings) => authAPI<OAuthServerSettings>('PUT', `${base}/settings`, settings),
    clients: () => authAPI<OAuthClient[]>('GET', `${base}/clients`),
    createClient: (request: OAuthClientRequest) => authAPI<OAuthClient & { secret?: string }>('POST', `${base}/clients`, request),
    updateClient: (id: string, request: OAuthClientRequest) => authAPI<OAuthClient>('PUT', `${base}/clients/${encodeURIComponent(id)}`, request),
    deleteClient: (id: string) => authAPI('DELETE', `${base}/clients/${encodeURIComponent(id)}`),
    grants: (all = false) => authAPI<OAuthGrant[]>('GET', `${base}/grants${all ? '?scope=all' : ''}`),
    revokeGrant: (id: string) => authAPI('DELETE', `${base}/grants/${encodeURIComponent(id)}`),
    tokens: (grant: string) => authAPI<OAuthToken[]>('GET', `${base}/grants/${encodeURIComponent(grant)}/tokens`),
    authorization: (id: string, signal?: AbortSignal) => authAPI<AuthorizationDetails>('GET', `${base}/authorizations/${encodeURIComponent(id)}`, undefined, signal),
    decide: (id: string, approve: boolean, scopes: string[]) => authAPI<{ redirectUri: string }>('POST', `${base}/authorizations/${encodeURIComponent(id)}`, { approve, scopes }),
};

/** A grant is active until revoked or expired. */
export function grantActive(grant: OAuthGrant, now = Date.now()) { return !grant.revoked && grant.expiresAt * 1000 > now; }

/**
 * After a consent decision the browser leaves the Web UI for the client's
 * redirect URI. Only absolute URIs returned by the server are followed, never
 * a value from the page URL.
 */
export function followRedirect(uri: string, assign: (url: string) => void = url => window.location.assign(url)) {
    const url = new URL(uri);
    if (['javascript:', 'data:', 'file:', 'vbscript:', 'blob:'].includes(url.protocol)) throw new Error('Unsafe redirect');
    assign(url.href);
}

// The consent route survives a sign-in in between. Only this exact route shape
// is remembered, so the return path can never become an open redirect.
const returnKey = 'yuhaiin-sign-in-return';
const consentRoute = /^\/oauth\/consent\/[A-Za-z0-9_-]{43}$/;
export function rememberReturn(path: string) {
    if (!consentRoute.test(path)) return;
    try { sessionStorage.setItem(returnKey, path); } catch { /* Storage can be unavailable. */ }
}
export function takeReturn(): string | null {
    try {
        const path = sessionStorage.getItem(returnKey);
        sessionStorage.removeItem(returnKey);
        return path && consentRoute.test(path) ? path : null;
    } catch { return null; }
}
/** Where to go after any successful sign-in. */
export function landingPath() {
    return takeReturn() ?? (getSession()?.principal.permissions.includes('connections:read') ? '/' : '/docs/security');
}
