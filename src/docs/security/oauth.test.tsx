import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { SWRConfig } from 'swr';
import { OAuthLinks } from './oauth-links';
import { OAuthSettingsPanel } from './oauth-settings';
import { clearSession, establishSession } from '@/auth/session';
import { setApiUrl } from '@/common/apiurl';
import { beginOAuth } from '@/auth/oauth';
vi.mock('react-i18next', () => { const t = (key: string) => key; return { useTranslation: () => ({ t }) }; });
vi.mock('@/component/v2/confirmation', () => ({ confirmAction: vi.fn(async () => true) }));
vi.mock('@/auth/oauth', async original => ({ ...await original<typeof import('@/auth/oauth')>(), beginOAuth: vi.fn(async () => {}) }));
afterEach(() => { clearSession(); localStorage.clear(); vi.unstubAllGlobals(); vi.clearAllMocks(); });
function authenticate() { setApiUrl('https://controller.example'); establishSession('test', { userId: 'admin', credentialType: 'session', permissions: ['identity:read', 'users:manage'] }, Math.floor(Date.now() / 1000) + 600, 'https://controller.example'); }
it('lists connections, starts a session-bound link, and removes only the selected provider', async () => {
    authenticate();
    let links = [{ provider: 'github', subject: '123', displayName: 'github-user', createdAt: 1 }];
    const fetch = vi.fn(async (url: URL, init: RequestInit) => {
        if (url.pathname.endsWith('/providers')) return Response.json(['github', 'google']);
        if (init.method === 'DELETE') { expect(url.pathname).toMatch(/\/links\/github$/); links = []; return Response.json({}); }
        return Response.json(links);
    }); vi.stubGlobal('fetch', fetch);
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><OAuthLinks /></SWRConfig>));
    expect(host.textContent).toContain('github-user');
    await act(async () => { [...host.querySelectorAll('button')].find(button => button.textContent === 'bindOAuth')!.click(); });
    expect(beginOAuth).toHaveBeenCalledWith('google', true, expect.any(AbortSignal));
    await act(async () => { [...host.querySelectorAll('button')].find(button => button.textContent === 'unlink')!.click(); });
    expect(host.textContent).not.toContain('github-user'); expect(host.textContent).toContain('noOAuthAccounts');
    act(() => root.unmount()); host.remove();
});
it('never displays an existing app secret and sends blank to preserve it when updating settings', async () => {
    authenticate();
    const fetch = vi.fn(async (url: URL, init: RequestInit) => {
        if (init.method === 'PUT') { expect(url.pathname).toMatch(/\/settings\/github$/); expect(JSON.parse(String(init.body))).toMatchObject({ clientId: 'client-id', clientSecret: '', redirectUrl: 'https://controller.example/api/v2/auth/oauth/github/callback' }); return Response.json({}); }
        if (url.pathname.endsWith('/providers')) return Response.json(['github']);
        return Response.json([{ provider: 'github', clientId: 'client-id', secretConfigured: true, redirectUrl: 'https://controller.example/api/v2/auth/oauth/github/callback' }]);
    }); vi.stubGlobal('fetch', fetch);
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><OAuthSettingsPanel /></SWRConfig>));
    const form = host.querySelector('form[aria-label=GitHub]')!;
    expect(form.querySelector<HTMLInputElement>('input[type=password]')!.value).toBe('');
    expect(form.querySelector<HTMLInputElement>('input[type=password]')!.required).toBe(false);
    await act(async () => { form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });
    expect(fetch.mock.calls.filter(([, init]) => init.method === 'PUT')).toHaveLength(1);
    act(() => root.unmount()); host.remove();
});
it('guides an unconfigured administrator through setup and then opens the provider binding flow', async () => {
    authenticate();
    let configured = false;
    const fetch = vi.fn(async (url: URL, init: RequestInit) => {
        if (url.pathname.endsWith('/providers')) return Response.json(configured ? ['github'] : []);
        if (url.pathname.endsWith('/links')) return Response.json([]);
        if (init.method === 'PUT') {
            expect(url.pathname).toMatch(/\/settings\/github$/);
            expect(JSON.parse(String(init.body))).toMatchObject({ clientId: 'admin-client', clientSecret: 'admin-secret' });
            configured = true; return Response.json({});
        }
        return Response.json(configured ? [{ provider: 'github', clientId: 'admin-client', secretConfigured: true, redirectUrl: 'https://controller.example/api/v2/auth/oauth/github/callback' }] : []);
    }); vi.stubGlobal('fetch', fetch);
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><OAuthLinks /></SWRConfig>));
    expect(host.textContent).toContain('oauthConfigureFirst'); expect(host.querySelector('input')).toBeNull();
    await act(async () => { [...host.querySelectorAll('button')].find(button => button.textContent === 'oauthSettings')!.click(); });
    const form = document.querySelector('form[aria-label=GitHub]')!;
    const fields = form.querySelectorAll('input');
    await act(async () => {
        for (const [field, value] of [[fields[0], 'admin-client'], [fields[1], 'admin-secret']] as const) {
            Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(field, value);
            field.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });
    await act(async () => { form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });
    expect(host.textContent).toContain('oauthReadyToBind'); expect(beginOAuth).not.toHaveBeenCalled();
    await act(async () => { [...host.querySelectorAll('button')].find(button => button.textContent === 'bindOAuth')!.click(); });
    expect(beginOAuth).toHaveBeenCalledWith('github', true, expect.any(AbortSignal));
    act(() => root.unmount()); host.remove();
});
it('shows an unconfigured notice without administrator app settings for ordinary users', async () => {
    setApiUrl('https://controller.example'); establishSession('reader', { userId: 'reader', credentialType: 'session', permissions: ['identity:read'] }, Math.floor(Date.now() / 1000) + 600, 'https://controller.example');
    const fetch = vi.fn(async () => Response.json([])); vi.stubGlobal('fetch', fetch);
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><OAuthLinks /></SWRConfig>));
    expect(host.textContent).toContain('oauthAskAdmin'); expect(host.textContent).not.toContain('oauthSettings'); expect(document.querySelector('form[aria-label=GitHub]')).toBeNull();
    act(() => root.unmount()); host.remove();
});
