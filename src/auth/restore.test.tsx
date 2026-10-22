import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { logout, restoreSession } from './api';
import { SessionBootstrap } from './context';
import { authorizedFetch } from './transport';
import { authHeaders, clearSession, establishSession, getSession } from './session';
import { setApiUrl } from '@/common/apiurl';
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
afterEach(() => { clearSession(); localStorage.clear(); vi.unstubAllGlobals(); });
const principal = { credentialId: 'session-id', userId: 'reader', credentialType: 'session', permissions: ['identity:read'] };
it('restores a session after page memory is lost using only the HttpOnly controller cookie', async () => {
    setApiUrl('https://controller.example'); clearSession();
    const fetch = vi.fn(async (url: URL, init: RequestInit) => {
        expect(init.credentials).toBe('include'); expect(new Headers(init.headers).has('Authorization')).toBe(false);
        return url.pathname.endsWith('/session') ? Response.json({ principal, expiresAt: Math.floor(Date.now() / 1000) + 600 }) : Response.json(principal);
    }); vi.stubGlobal('fetch', fetch);
    expect(await restoreSession(new AbortController().signal)).toBe(true);
    expect(getSession()?.principal).toEqual(principal); expect(authHeaders()).toEqual({});
    await authorizedFetch('/api/v2/auth/me');
    for (let i = 0; i < localStorage.length; i++) expect(localStorage.getItem(localStorage.key(i)!)).not.toContain('session-id');
});
it('treats revoked cookies as anonymous and discards restore responses from another controller', async () => {
    setApiUrl('https://controller.example');
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 401 })));
    expect(await restoreSession(new AbortController().signal)).toBe(false); expect(getSession()).toBeNull();
    let release!: (value: Response) => void;
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(resolve => { release = resolve; })));
    const operation = restoreSession(new AbortController().signal); setApiUrl('https://new.example');
    release(Response.json({ principal, expiresAt: Math.floor(Date.now() / 1000) + 600 }));
    expect(await operation).toBe(false); expect(getSession()).toBeNull();
});
it('waits for restoration before mounting routes so a refresh preserves the requested page', async () => {
    setApiUrl('https://controller.example');
    let release!: (value: Response) => void;
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(resolve => { release = resolve; })));
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    await act(async () => root.render(<SessionBootstrap><div>protected-route</div></SessionBootstrap>));
    expect(host.textContent).toBe('restoringSession'); expect(host.textContent).not.toContain('protected-route');
    await act(async () => release(Response.json({ principal, expiresAt: Math.floor(Date.now() / 1000) + 600 })));
    expect(host.textContent).toBe('protected-route'); expect(getSession()?.principal.userId).toBe('reader');
    act(() => root.unmount()); host.remove();
});

it('keeps the current login if logout cannot revoke its cookie on the controller', async () => {
    setApiUrl('https://controller.example'); establishSession('', principal, Math.floor(Date.now() / 1000) + 600, 'https://controller.example');
    const current = getSession();
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline'); }));
    await expect(logout()).rejects.toThrow('offline'); expect(getSession()).toBe(current);
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({})));
    await logout(); expect(getSession()).toBeNull();
});
