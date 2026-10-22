import { getApiUrl } from '@/common/apiurl';
import { authHeaders, authScope, clearSession, getSession } from './session';

export function apiURL(path: string) {
    const url = new URL(getApiUrl() || window.location.href);
    if (url.username || url.password || url.searchParams.has('token')) throw new Error('Use an API URL without credentials');
    return new URL(path, url.origin);
}
export function requireSecureController(controller = getApiUrl()) {
    const url = new URL(controller || window.location.href);
    if (url.username || url.password || url.searchParams.has('token')) throw new Error('Use an API URL without credentials');
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))) {
        throw new Error('Remote management requires HTTPS');
    }
}
export async function authorizedFetch(path: string | URL, init: RequestInit = {}) {
    const scope = authScope();
    const url = path instanceof URL ? path : apiURL(path);
    if (url.origin !== apiURL('/').origin || !/^\/(api\/v2\/|debug\/profiler\/|debug\/pprof\/|metrics$)/.test(url.pathname) || url.searchParams.has('token')) {
        throw new Error('Invalid management endpoint');
    }
    if (getSession()?.principal.credentialType === 'session' || new Headers({ ...authHeaders(), ...Object.fromEntries(new Headers(init.headers)) }).has('Authorization')) requireSecureController();
    const response = await fetch(url, { ...init, credentials: 'include', cache: 'no-store', redirect: 'error', referrerPolicy: 'no-referrer',
        headers: { ...authHeaders(), ...Object.fromEntries(new Headers(init.headers)) } });
    if (response.status === 401 && scope === authScope()) { clearSession(); window.location.hash = '/login'; }
    if (response.status === 403 && scope === authScope()) window.dispatchEvent(new Event('management-permissions'));
    return response;
}
export async function directJSON<T>(method: string, path: string, body?: unknown, authorization?: string): Promise<T> {
    const response = await authorizedFetch(path, { method, headers: {
        Accept: 'application/json', 'Content-Type': 'application/json', ...(authorization ? { Authorization: authorization } : {}),
    }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    if (!response.ok) throw { code: response.status, msg: response.statusText || `HTTP ${response.status}` };
    return response.status === 204 ? undefined as T : response.json();
}
