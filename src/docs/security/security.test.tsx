import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { SWRConfig } from 'swr';
import { Users } from './users';
import { Tokens } from './tokens';
import { clearSession, establishSession } from '@/auth/session';
import { setApiUrl } from '@/common/apiurl';
vi.mock('react-i18next', () => { const t = (key: string) => key; return { useTranslation: () => ({ t }) }; });
afterEach(() => { clearSession(); localStorage.clear(); vi.unstubAllGlobals(); });
function authenticate(permissions: string[]) { setApiUrl('https://controller.example'); establishSession('test', { userId: 'admin', credentialType: 'session', permissions }, Math.floor(Date.now() / 1000) + 600, 'https://controller.example'); }
it('protects the last enrolled administrator while permitting a fresh user with an enrollment capability', async () => {
    authenticate(['users:manage', 'identity:read']);
    const fetch = vi.fn(async (_url: URL, init: RequestInit) => {
        if (init.method === 'POST') return Response.json({ user: { id: 'new' }, enrollment: { userId: 'new', kind: 'enrollment', scopes: [], secret: 'only-once-enrollment', expiresAt: 0 } });
        return Response.json([{ id: 'admin', login: 'admin', role: 'admin', disabled: false, enrolled: true, updatedAt: 1 }]);
    }); vi.stubGlobal('fetch', fetch);
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><Users /></SWRConfig>));
    expect(host.querySelector<HTMLInputElement>('input[type=checkbox]')!.disabled).toBe(true);
    const remove = [...host.querySelectorAll('button')].find(button => button.textContent === 'delete')!; expect(remove.disabled).toBe(true);
    await act(async () => { host.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });
    expect(document.body.textContent).toContain('only-once-enrollment');
    await act(async () => { [...document.querySelectorAll('button')].find(button => button.textContent === 'done')!.click(); });
    expect(document.body.textContent).not.toContain('only-once-enrollment');
    act(() => root.unmount()); host.remove();
});
it('shows a generated token once with owner/scopes and keeps the secret out of token-list responses', async () => {
    authenticate(['tokens:own', 'nodes:read', 'identity:read']);
    const fetch = vi.fn(async (_url: URL, init: RequestInit) => {
        if (init.method === 'POST') { expect(JSON.parse(String(init.body))).toMatchObject({ owner: 'admin', scopes: ['nodes:read'], expiresAt: 0 }); return Response.json({ id: 'token', kind: 'token', userId: 'admin', secret: 'only-once-token', scopes: ['nodes:read'], expiresAt: 0 }); }
        return Response.json([]);
    }); vi.stubGlobal('fetch', fetch);
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><Tokens /></SWRConfig>));
    await act(async () => { host.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });
    const dialog = document.querySelector('[role=dialog]')!;
    expect(dialog.textContent).toContain('copyOnce'); expect(dialog.textContent).toContain('nodes:read'); expect(dialog.textContent).toContain('admin');
    expect(document.querySelector<HTMLTextAreaElement>('textarea')!.value).toBe('only-once-token');
    await act(async () => { [...document.querySelectorAll('button')].find(button => button.textContent === 'done')!.click(); });
    expect(document.querySelector('textarea')).toBeNull(); act(() => root.unmount()); host.remove();
});
