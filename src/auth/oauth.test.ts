import { afterEach, expect, it, vi } from 'vitest';
import { beginOAuth } from './oauth';
import { clearSession, establishSession, getSession } from './session';
import { setApiUrl } from '@/common/apiurl';

afterEach(() => { clearSession(); localStorage.clear(); vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });
const principal = { userId: 'reader', credentialType: 'session', permissions: ['identity:read'] };
function setup(link = false) {
    setApiUrl('https://controller.example');
    if (link) establishSession('existing', principal, Math.floor(Date.now() / 1000) + 1000, 'https://controller.example');
    const popup = { location: { href: 'about:blank' }, close: vi.fn(), closed: false };
    vi.spyOn(window, 'open').mockReturnValue(popup as unknown as Window);
    const fetch = vi.fn(async (url: URL, init: RequestInit) => {
        expect(init.credentials).toBe('include'); expect(url.search).toBe('');
        if (url.pathname.endsWith('/start') || url.pathname.endsWith('/link')) return Response.json({ state: 'state', secret: 'start-proof', authorizationUrl: 'https://github.com/login/oauth/authorize?state=state', expiresAt: 12345 });
        if (url.pathname.endsWith('/complete')) {
            expect(JSON.parse(String(init.body))).toEqual({ state: 'state', secret: 'start-proof', completion: 'one-use-proof' });
            return Response.json(link ? null : { secret: 'session-secret', expiresAt: Math.floor(Date.now() / 1000) + 1000 });
        }
        expect(new Headers(init.headers).get('Authorization')).toBe('Session session-secret'); return Response.json(principal);
    });
    vi.stubGlobal('fetch', fetch);
    return { popup, fetch };
}
function message(popup: object, options: Partial<MessageEventInit> = {}) {
    window.dispatchEvent(new MessageEvent('message', { origin: 'https://controller.example', source: popup as Window, data: { type: 'yuhaiin-oauth', state: 'state', completion: 'one-use-proof' }, ...options }));
}
async function startReady() { await new Promise(resolve => setTimeout(resolve, 0)); }
it('requires the exact popup, controller origin and state before completing an OAuth login', async () => {
    const { popup, fetch } = setup();
    const operation = beginOAuth('github', false, new AbortController().signal); await startReady();
    expect(popup.location.href).toContain('https://github.com/');
    message(popup, { origin: 'https://evil.example' }); message(window); message(popup, { data: { type: 'yuhaiin-oauth', state: 'other', completion: 'one-use-proof' } });
    expect(fetch).toHaveBeenCalledTimes(1); expect(getSession()).toBeNull();
    message(popup); await operation;
    expect(getSession()?.principal.userId).toBe('reader'); expect(popup.close).toHaveBeenCalledTimes(1);
    expect([...Array(localStorage.length)].map((_, i) => localStorage.getItem(localStorage.key(i)!)).join('')).not.toContain('proof');
});
it('keeps the existing session when linking and submits its authorization', async () => {
    const { popup, fetch } = setup(true); const original = getSession();
    const operation = beginOAuth('github', true, new AbortController().signal); await startReady();
    expect(fetch.mock.calls[0][0].pathname).toMatch(/\/link$/);
    message(popup); await operation;
    expect(getSession()).toBe(original); expect(new Headers(fetch.mock.calls[1][1].headers).get('Authorization')).toBe('Session existing');
});
it('cancels cleanly, rejects blocked popups and cannot finish after switching controller', async () => {
    const { popup, fetch } = setup(); const abort = new AbortController();
    const operation = beginOAuth('github', false, abort.signal); await startReady(); abort.abort();
    await expect(operation).rejects.toThrow('cancelled'); expect(popup.close).toHaveBeenCalledTimes(1);
    message(popup); expect(fetch).toHaveBeenCalledTimes(1);
    vi.spyOn(window, 'open').mockReturnValue(null);
    await expect(beginOAuth('github', false, new AbortController().signal)).rejects.toThrow('blocked');
    vi.spyOn(window, 'open').mockReturnValue(popup as unknown as Window);
    const switched = beginOAuth('github', false, new AbortController().signal); await startReady(); setApiUrl('https://new.example'); message(popup);
    await expect(switched).rejects.toThrow('changed'); expect(getSession()).toBeNull();
});
it('accepts a configured generic OIDC authorization endpoint while binding completion to the controller', async () => {
    const { popup, fetch } = setup();
    fetch.mockImplementationOnce(async () => Response.json({ state: 'state', secret: 'start-proof', authorizationUrl: 'https://enterprise-idp.example/authorize?state=state&nonce=nonce&code_challenge_method=S256', expiresAt: 12345 }));
    const operation = beginOAuth('oidc-12345678-1234-1234-1234-123456789abc', false, new AbortController().signal);
    await startReady(); expect(popup.location.href).toContain('https://enterprise-idp.example/');
    message(popup, { origin: 'https://enterprise-idp.example' }); expect(fetch).toHaveBeenCalledTimes(1);
    message(popup); await operation; expect(getSession()?.principal.userId).toBe('reader');
});
it('rejects insecure OIDC authorization URLs before navigating the popup', async () => {
    const { popup, fetch } = setup();
    fetch.mockImplementationOnce(async () => Response.json({ state: 'state', secret: 'start-proof', authorizationUrl: 'http://enterprise-idp.example/authorize', expiresAt: 12345 }));
    await expect(beginOAuth('oidc-12345678-1234-1234-1234-123456789abc', false, new AbortController().signal)).rejects.toThrow('Invalid authorization');
    expect(popup.location.href).toBe('about:blank'); expect(popup.close).toHaveBeenCalled();
});
