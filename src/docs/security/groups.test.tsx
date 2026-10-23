import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { SWRConfig } from 'swr';
import { Groups } from './groups';
import { clearSession, establishSession } from '@/auth/session';
import { setApiUrl } from '@/common/apiurl';
vi.mock('react-i18next', () => { const t = (key: string) => key; return { useTranslation: () => ({ t }) }; });
vi.mock('@/component/v2/confirmation', () => ({ confirmAction: vi.fn(async () => true) }));
afterEach(() => { clearSession(); localStorage.clear(); vi.unstubAllGlobals(); });
it('edits membership and preserves the group revision, then deletes with the current revision', async () => {
    setApiUrl('https://controller.example');
    establishSession('test', { userId: 'admin', credentialType: 'session', permissions: ['users:manage'] }, Math.floor(Date.now() / 1000) + 600, 'https://controller.example');
    let groups = [{ id: 'finance', name: 'Finance', description: '', members: ['alice'], revision: 7, createdAt: 1, updatedAt: 1 }];
    const fetch = vi.fn(async (url: URL, init: RequestInit) => {
        if (url.pathname.endsWith('/users')) return Response.json([{ id: 'alice', login: 'Alice' }, { id: 'bob', login: 'Bob' }]);
        if (init.method === 'PUT') {
            expect(JSON.parse(String(init.body))).toEqual({ name: 'Finance', description: '', members: ['alice', 'bob'], revision: 7 });
            groups = [{ ...groups[0], members: ['alice', 'bob'], revision: 8 }];
            return Response.json(groups[0]);
        }
        if (init.method === 'DELETE') { expect(url.search).toBe('?revision=8'); groups = []; return Response.json({}); }
        return Response.json(groups);
    });
    vi.stubGlobal('fetch', fetch);
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><Groups /></SWRConfig>));
    const form = host.querySelector('form[aria-label=Finance]')!;
    await act(async () => { form.querySelectorAll<HTMLInputElement>('input[type=checkbox]')[1].click(); });
    await act(async () => { form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });
    expect(fetch.mock.calls.filter(([, init]) => init.method === 'PUT')).toHaveLength(1);
    await act(async () => { [...host.querySelectorAll('button')].find(button => button.textContent === 'delete')!.click(); });
    expect(host.querySelector('form')).toBeNull();
    act(() => root.unmount()); host.remove();
});
it('shows a conflict and retains edited members after a rejected save', async () => {
    setApiUrl('https://controller.example');
    establishSession('test', { userId: 'admin', credentialType: 'session', permissions: ['users:manage'] }, Math.floor(Date.now() / 1000) + 600, 'https://controller.example');
    vi.stubGlobal('fetch', vi.fn(async (url: URL, init: RequestInit) => {
        if (init.method === 'PUT') return Response.json({ error: 'Conflict' }, { status: 409 });
        return Response.json(url.pathname.endsWith('/users') ? [{ id: 'alice', login: 'Alice' }] : [{ id: 'finance', name: 'Finance', description: '', members: [], revision: 1 }]);
    }));
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><Groups /></SWRConfig>));
    await act(async () => { host.querySelector<HTMLInputElement>('input[type=checkbox]')!.click(); });
    await act(async () => { host.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });
    expect(host.querySelector('[role=alert]')!.textContent).toBe('groups.conflict');
    expect(host.querySelector<HTMLInputElement>('input[type=checkbox]')!.checked).toBe(true);
    act(() => root.unmount()); host.remove();
});
