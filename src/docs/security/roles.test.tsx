import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { SWRConfig } from 'swr';
import { afterEach, expect, it, vi } from 'vitest';
import { clearSession, establishSession, getSession } from '@/auth/session';
import { setApiUrl } from '@/common/apiurl';
import { ManagementRoles } from './roles';

vi.mock('react-i18next', () => { const t = (key: string) => key; return { useTranslation: () => ({ t }) }; });
vi.mock('@/component/v2/confirmation', () => ({ confirmAction: vi.fn(async () => true) }));
let root: Root | undefined;
let host: HTMLDivElement | undefined;
afterEach(() => { if (root) act(() => root!.unmount()); host?.remove(); root = undefined; host = undefined; clearSession(); localStorage.clear(); vi.unstubAllGlobals(); });
function session(writable = true) {
    setApiUrl('https://controller.example');
    establishSession('test', { userId: 'admin', credentialType: 'session', permissions: ['identity:read', 'roles:read', 'nodes:read', ...(writable ? ['roles:write', 'users:manage'] : [])] }, Math.floor(Date.now() / 1000) + 600, 'https://controller.example');
}
const roles = [{ id: 'admin', name: 'admin', description: '', builtIn: true, revision: 0, permissions: ['nodes:read', 'nodes:write'] }, { id: 'operator', name: 'Operator', description: '', builtIn: false, revision: 3, permissions: ['nodes:read'] }];
function mock(conflict = false) {
    const fetch = vi.fn(async (url: URL, init: RequestInit) => {
        if (init.method === 'PUT') return Response.json({}, { status: conflict ? 409 : 200 });
        if (url.pathname.endsWith('/me')) return Response.json(getSession()!.principal);
        if (url.pathname.endsWith('/users')) return Response.json([{ id: 'admin', login: 'admin' }]);
        if (url.pathname.endsWith('/users/admin/roles')) return Response.json({ userId: 'admin', baseRole: 'none', roleIds: ['operator'], revision: 2, permissions: ['nodes:read'] });
        if (url.pathname.endsWith('/permissions')) return Response.json([{ id: 'nodes:read', category: 'nodes' }, { id: 'nodes:write', category: 'nodes' }]);
        return Response.json(roles);
    });
    vi.stubGlobal('fetch', fetch); return fetch;
}
async function render() {
    host = document.createElement('div'); document.body.append(host); root = createRoot(host);
    await act(async () => root!.render(<SWRConfig value={{ provider: () => new Map(), shouldRetryOnError: false }}><ManagementRoles /></SWRConfig>));
    return host;
}
async function enter(input: HTMLInputElement, value: string) {
    await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value); input.dispatchEvent(new Event('input', { bubbles: true })); });
}
it('protects built-ins and prevents granting unavailable permissions in the editor', async () => {
    session(); const fetch = mock(); const view = await render();
    expect(view.querySelector<HTMLFieldSetElement>('form[aria-label="admin"] > fieldset')!.disabled).toBe(true);
    const unavailable = view.querySelector<HTMLInputElement>('form[aria-label="Operator"] input[aria-label="nodes:write"]')!;
    expect(unavailable.disabled).toBe(true);
    await act(async () => view.querySelector('form[aria-label="admin"]')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(fetch.mock.calls.every(([, init]) => init.method === 'GET')).toBe(true);
});
it('submits a revisioned role and retains edits on conflict', async () => {
    session(); const fetch = mock(true); const view = await render();
    const form = view.querySelector<HTMLFormElement>('form[aria-label="Operator"]')!;
    const input = form.querySelector<HTMLInputElement>('input:not([type="checkbox"])')!;
    await enter(input, 'Changed operator');
    await act(async () => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    const writes = fetch.mock.calls.filter(([, init]) => init.method === 'PUT');
    expect(writes).toHaveLength(1);
    expect(writes[0][0].pathname).toBe('/api/v2/auth/roles/operator');
    expect(JSON.parse(String(writes[0][1].body))).toMatchObject({ name: 'Changed operator', permissions: ['nodes:read'], revision: 3 });
    expect(input.value).toBe('Changed operator');
    expect(view.textContent).toContain('roles.conflict');
});
it('lets readers inspect roles and their own effective assignment without writes or user enumeration', async () => {
    session(false); const fetch = mock(); const view = await render();
    expect(view.textContent).toContain('roles.effective');
    expect(view.querySelectorAll('button[type="submit"]')).toHaveLength(0);
    expect(fetch.mock.calls.some(([url]) => url.pathname.endsWith('/users'))).toBe(false);
    expect(fetch.mock.calls.some(([url]) => url.pathname.endsWith('/users/admin/roles'))).toBe(true);
    expect(fetch.mock.calls.every(([, init]) => init.method === 'GET')).toBe(true);
});
it('replaces custom assignments with their optimistic revision', async () => {
    session(); const fetch = mock(); const view = await render();
    const form = view.querySelector<HTMLFormElement>('form[aria-label="roles.assignments"]')!;
    await act(async () => form.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click());
    await act(async () => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    const writes = fetch.mock.calls.filter(([, init]) => init.method === 'PUT');
    expect(writes).toHaveLength(1);
    expect(writes[0][0].pathname).toBe('/api/v2/auth/users/admin/roles');
    expect(JSON.parse(String(writes[0][1].body))).toEqual({ revision: 2, roleIds: [] });
});
