import { getApiUrl } from '@/common/apiurl';
import { type Issued } from './api';
import { authScope, establishSession, type Principal } from './session';
import { apiURL, authorizedFetch, directJSON, requireSecureController } from './transport';

export type OAuthProvider = 'github' | 'google' | `oidc-${string}`;
export type OAuthChoice = OAuthProvider | { provider: OAuthProvider; name: string };
export const providerID = (choice: OAuthChoice): OAuthProvider => typeof choice === 'string' ? choice : choice.provider;
export function providerLabel(choice: OAuthChoice): string { const id = providerID(choice); return oauthNames[id] || (typeof choice === 'object' && choice.name) || 'OpenID Connect'; }
export function validOAuthProvider(value: unknown): value is OAuthProvider { return typeof value === 'string' && (value === 'github' || value === 'google' || /^oidc-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value)); }
export const oauthNames: Record<string, string> = { github: 'GitHub', google: 'Google' };
export interface OAuthLink { provider: OAuthProvider; subject: string; displayName: string; createdAt: number; issuer?: string }
export interface OAuthSettings { provider: OAuthProvider; clientId: string; redirectUrl: string; secretConfigured: boolean; issuer?: string; name?: string; enabled?: boolean; revision?: number }
interface OAuthStart { state: string; secret: string; authorizationUrl: string; expiresAt: number }

export async function oauthProviders(controller: string, signal: AbortSignal): Promise<OAuthChoice[]> {
    requireSecureController(controller);
    const response = await fetch(new URL('/api/v2/auth/oauth/providers?details=1', new URL(controller || window.location.href).origin), {
        signal, credentials: 'omit', cache: 'no-store', redirect: 'error', referrerPolicy: 'no-referrer',
    });
    if (!response.ok) throw new Error('Unable to load OAuth providers');
    const providers: unknown = await response.json();
    if (!Array.isArray(providers)) throw new Error('Invalid OAuth providers');
    return normalizeOAuthChoices(providers);
}

export function normalizeOAuthChoices(raw: unknown): OAuthChoice[] {
    if (!Array.isArray(raw)) throw new Error('Invalid OAuth providers');
    return raw.slice(0,32).flatMap((item): OAuthChoice[] => {
        if (validOAuthProvider(item)) return [item];
        if (item && typeof item === 'object' && validOAuthProvider(item.provider) && typeof item.name === 'string' && item.name.length <= 128) return [{ provider: item.provider, name: item.name }];
        return [];
    });
}

async function oauthRequest<T>(path: string, body: unknown, signal: AbortSignal): Promise<T> {
    const response = await authorizedFetch(`/api/v2/auth${path}`, { method: 'POST', signal,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) });
    if (!response.ok) throw { code: response.status };
    return response.json();
}

/** Open synchronously from a click. Only a callback from this popup and the
 * captured controller can complete the one-use, memory-only exchange. */
export async function beginOAuth(provider: OAuthProvider, link: boolean, signal: AbortSignal) {
    requireSecureController();
    if (!validOAuthProvider(provider)) throw new Error('Invalid identity provider');
    const controller = getApiUrl(); const scope = authScope(); const origin = apiURL('/').origin;
    if (signal.aborted) throw new Error('OAuth cancelled');
    const popup = window.open('about:blank', '_blank', 'popup,width=620,height=760');
    if (!popup) throw new Error('OAuth popup blocked');
    let start: OAuthStart | undefined;
    let cleanup = () => {};
    try {
        const completion = new Promise<string>((resolve, reject) => {
            const finish = (error?: Error, proof?: string) => { cleanup(); if (error) reject(error); else resolve(proof!); };
            const message = (event: MessageEvent) => {
                if (event.origin !== origin || event.source !== popup || !start || !event.data || event.data.type !== 'yuhaiin-oauth' || event.data.state !== start.state) return;
                if (event.data.failed || typeof event.data.completion !== 'string' || !event.data.completion) finish(new Error('OAuth denied'));
                else finish(undefined, event.data.completion);
            };
            const cancel = () => finish(new Error('OAuth cancelled'));
            const timer = window.setTimeout(() => finish(new Error('OAuth expired')), 300000);
            const closed = window.setInterval(() => { if (popup.closed) finish(new Error('OAuth popup closed')); }, 1000);
            cleanup = () => { window.clearTimeout(timer); window.clearInterval(closed); window.removeEventListener('message', message); signal.removeEventListener('abort', cancel); };
            window.addEventListener('message', message); signal.addEventListener('abort', cancel, { once: true });
        });
        // Attach a handler immediately; cancellation can precede the start response.
        void completion.catch(() => undefined);
        start = await oauthRequest<OAuthStart>(`/oauth/${provider}/${link ? 'link' : 'start'}`, {}, signal);
        if (scope !== authScope() || signal.aborted) throw new Error('Controller or session changed');
        const authorization = new URL(start.authorizationUrl);
        const expectedHost = provider === 'github' ? 'github.com' : 'accounts.google.com';
        if (authorization.protocol !== 'https:' || (!provider.startsWith('oidc-') && authorization.hostname !== expectedHost) || authorization.username || authorization.password || authorization.hash) throw new Error('Invalid authorization URL');
        popup.location.href = authorization.href;
        const proof = await completion;
        if (scope !== authScope() || signal.aborted) throw new Error('Controller or session changed');
        const issued = await oauthRequest<Issued | null>(`/oauth/${provider}/complete`, { state: start.state, secret: start.secret, completion: proof }, signal);
        if (scope !== authScope() || signal.aborted) throw new Error('Controller or session changed');
        if (!link) {
            if (!issued?.secret) throw new Error('Missing OAuth session');
            const principal = await directJSON<Principal>('GET', '/api/v2/auth/me', undefined, `Session ${issued.secret}`);
            if (scope !== authScope() || signal.aborted) throw new Error('Controller or session changed');
            establishSession(issued.secret, principal, issued.expiresAt, controller);
        }
    } finally { cleanup(); popup.close(); }
}
