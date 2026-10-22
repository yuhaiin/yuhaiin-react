import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { SWRConfig } from 'swr';
import { ProxyCredentials, UpstreamCredentials } from './proxy-credentials';
import { clearSession, establishSession } from '@/auth/session';
import { setApiUrl } from '@/common/apiurl';
vi.mock('react-i18next', () => { const t = (key: string) => key; return { useTranslation: () => ({ t }) }; });
afterEach(() => { clearSession(); localStorage.clear(); vi.unstubAllGlobals(); });
function authenticate(permissions: string[]) { setApiUrl('https://controller.example'); establishSession('test', { userId: 'alice', credentialType: 'session', permissions }, Math.floor(Date.now() / 1000) + 600, 'https://controller.example'); }
it('creates an independent device credential and shows its secret only until dismissed', async () => {
    authenticate(['identity:read', 'proxy-credentials:own']);
    const fetch = vi.fn(async (_url: URL, init: RequestInit) => {
        if (init.method === 'POST') {
            expect(JSON.parse(String(init.body))).toEqual({ owner: 'alice', name: '', inbounds: [], protocols: [], expiresAt: 0 });
            return Response.json({ id: 'phone', userId: 'alice', name: 'phone', secret: 'device-secret-once', protocols: [], inbounds: [], expiresAt: 0 });
        }
        return Response.json([]);
    }); vi.stubGlobal('fetch', fetch);
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><ProxyCredentials /></SWRConfig>));
    // A missing name is rejected before issuing any credential.
    await act(async () => host.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(host.textContent).toContain('proxyCredentialValidation');
    expect(fetch.mock.calls.some(([, init]) => init.method === 'POST')).toBe(false);
    const input = host.querySelector('input')!;
    await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'phone'); input.dispatchEvent(new Event('input', { bubbles: true })); });
    fetch.mockImplementation(async (_url: URL, init: RequestInit) => {
        if (init.method === 'POST') { expect(JSON.parse(String(init.body))).toMatchObject({ owner: 'alice', name: 'phone' }); return Response.json({ id: 'phone', userId: 'alice', name: 'phone', secret: 'device-secret-once', protocols: [], inbounds: [], expiresAt: 0 }); }
        return Response.json([{ id: 'phone', userId: 'alice', name: 'phone', protocols: [], inbounds: [], expiresAt: 0, revoked: false }]);
    });
    await act(async () => host.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(document.querySelector<HTMLTextAreaElement>('textarea')!.value).toBe('device-secret-once');
    await act(async () => [...document.querySelectorAll('button')].find(button => button.textContent === 'done')!.click());
    expect(document.querySelector('textarea')).toBeNull(); expect([...Array(localStorage.length)].map((_, index) => localStorage.getItem(localStorage.key(index)!)).join('')).not.toContain('device-secret-once');
    act(() => root.unmount()); host.remove();
});
it('renders only metadata for upstream secrets and provides an empty replacement form', async () => {
    authenticate(['identity:read', 'upstream-credentials:manage']);
    vi.stubGlobal('fetch', vi.fn(async () => Response.json([{ id: 'shared', name: 'office', type: 'username-password', revision: 1 }])));
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><UpstreamCredentials /></SWRConfig>));
    expect(host.textContent).toContain('office');
    await act(async () => [...host.querySelectorAll('button')].find(button => button.textContent === 'replaceCredential')!.click());
    expect(host.querySelector<HTMLInputElement>('input[type=password]')!.value).toBe('');
    expect(host.querySelector<HTMLInputElement>('input[type=password]')!.required).toBe(true);
    act(() => root.unmount()); host.remove();
});
