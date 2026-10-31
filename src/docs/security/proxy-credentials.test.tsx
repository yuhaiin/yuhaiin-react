import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { SWRConfig } from 'swr';
import { ProxyCredentials, UpstreamCredentials } from './proxy-credentials';
import { clearSession, establishSession } from '@/auth/session';
import { setApiUrl } from '@/common/apiurl';
import { confirmAction } from '@/component/v2/confirmation';
vi.mock('@/component/v2/confirmation', () => ({ confirmAction: vi.fn() }));
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
        if (init.method === 'POST') { expect(JSON.parse(String(init.body))).toMatchObject({ owner: 'alice', name: 'phone', expiresAt: 0 }); return Response.json({ id: 'phone', userId: 'alice', name: 'phone', secret: 'device-secret-once', protocols: [], inbounds: [], expiresAt: 0 }); }
        return Response.json([{ id: 'phone', userId: 'alice', name: 'phone', protocols: [], inbounds: [], expiresAt: 0, revoked: false }]);
    });
    await act(async () => host.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(document.querySelector<HTMLTextAreaElement>('textarea')!.value).toBe('device-secret-once');
    await act(async () => [...document.querySelectorAll('button')].find(button => button.textContent === 'done')!.click());
    expect(document.querySelector('textarea')).toBeNull(); expect([...Array(localStorage.length)].map((_, index) => localStorage.getItem(localStorage.key(index)!)).join('')).not.toContain('device-secret-once');
    act(() => root.unmount()); host.remove();
});
it('offers permanent validity by default and requires a future date when it is disabled', async () => {
    authenticate(['identity:read', 'proxy-credentials:own']);
    const fetch = vi.fn(async (_url: URL, init: RequestInit) => init.method === 'POST'
        ? Response.json({ id: 'phone', userId: 'alice', name: 'phone', secret: 'once', inbounds: [], protocols: [], expiresAt: 0 })
        : Response.json([]));
    vi.stubGlobal('fetch', fetch);
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><ProxyCredentials /></SWRConfig>));
    const permanent = host.querySelector<HTMLButtonElement>('[role=switch]')!;
    expect(permanent.parentElement!.textContent).toContain('permanentCredential');
    expect(permanent.getAttribute('aria-checked')).toBe('true');
    expect(host.querySelector('input[type=datetime-local]')).toBeNull();
    const input = host.querySelector('input')!;
    await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'phone'); input.dispatchEvent(new Event('input', { bubbles: true })); permanent.click(); });
    const date = host.querySelector<HTMLInputElement>('input[type=datetime-local]')!;
    expect(date.required).toBe(true);
    const submit = async () => { await act(async () => host.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))); };
    await submit();
    expect(host.textContent).toContain('proxyCredentialValidation');
    const setDate = async (value: string) => { await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(date, value); date.dispatchEvent(new Event('input', { bubbles: true })); }); };
    await setDate('2000-01-01T12:00'); await submit();
    expect(fetch.mock.calls.filter(([, init]) => init.method === 'POST')).toHaveLength(0);
    const future = new Date(); future.setFullYear(future.getFullYear() + 1);
    const localDate = `${future.getFullYear()}-12-01T12:00`;
    await setDate(localDate); await submit();
    expect(JSON.parse(String(fetch.mock.calls.find(([, init]) => init.method === 'POST')![1].body)).expiresAt).toBe(Date.parse(localDate) / 1000);
    await act(async () => [...document.querySelectorAll('button')].find(button => button.textContent === 'done')!.click());
    await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'phone'); input.dispatchEvent(new Event('input', { bubbles: true })); permanent.click(); });
    await submit();
    expect(JSON.parse(String(fetch.mock.calls.filter(([, init]) => init.method === 'POST')[1][1].body)).expiresAt).toBe(0);
    act(() => root.unmount()); host.remove();
});
it('keeps revoked records until deletion and refreshes the list after confirmed deletion', async () => {
    authenticate(['identity:read', 'proxy-credentials:own']);
    let records = [{ id: 'phone', userId: 'alice', name: 'phone', inbounds: [], protocols: [], expiresAt: 0, revoked: false }];
    const fetch = vi.fn(async (_url: URL, init: RequestInit) => {
        if (init.method === 'POST') { records = records.map(item => ({ ...item, revoked: true })); return Response.json({}); }
        if (init.method === 'DELETE') { records = []; return Response.json({}); }
        return Response.json(records);
    }); vi.stubGlobal('fetch', fetch);
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><ProxyCredentials /></SWRConfig>));
    const click = async (label: string) => { await act(async () => [...host.querySelectorAll('button')].find(button => button.textContent === label)!.click()); };
    vi.mocked(confirmAction).mockResolvedValueOnce(false);
    await click('delete');
    expect(fetch.mock.calls.some(([, init]) => init.method === 'DELETE')).toBe(false);
    expect(host.querySelector('section')).not.toBeNull();
    vi.mocked(confirmAction).mockResolvedValueOnce(true);
    await click('revoke');
    expect(fetch.mock.calls.some(([url, init]) => String(url).endsWith('/proxy-credentials/phone/revoke') && init.method === 'POST')).toBe(true);
    expect(host.querySelector('section')!.textContent).toContain('revoked');
    expect([...host.querySelectorAll('button')].find(button => button.textContent === 'revoke')!.disabled).toBe(true);
    vi.mocked(confirmAction).mockResolvedValueOnce(true);
    await click('delete');
    expect(confirmAction).toHaveBeenLastCalledWith('deleteProxyCredentialConfirm');
    expect(fetch.mock.calls.some(([url, init]) => String(url).endsWith('/proxy-credentials/phone') && init.method === 'DELETE')).toBe(true);
    expect(host.querySelector('section')).toBeNull();
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
