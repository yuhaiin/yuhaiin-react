import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { SWRConfig } from 'swr';
import { Tokens } from './tokens';
import { clearSession, establishSession } from '@/auth/session';
import { setApiUrl } from '@/common/apiurl';
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/component/v2/confirmation', () => ({ confirmAction: vi.fn(async () => true) }));
afterEach(() => { clearSession(); localStorage.clear(); vi.unstubAllGlobals(); });
const setValue = (element: HTMLInputElement | HTMLTextAreaElement, value: string) => {
    const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value')!.set!;
    setter.call(element, value); element.dispatchEvent(new Event('input', { bubbles: true }));
};
it('creates a named token and edits its name and note', async () => {
    setApiUrl('https://controller.example'); establishSession('test', { userId: 'reader', credentialType: 'session', permissions: ['tokens:own', 'nodes:read'] }, Math.floor(Date.now() / 1000) + 600, 'https://controller.example');
    const tokens: Record<string, unknown>[] = [];
    const bodies: { method: string; path: string; body: Record<string, unknown> }[] = [];
    const fetch = vi.fn(async (url: URL | string, init: RequestInit) => {
        const path = new URL(url).pathname; const body = init.body ? JSON.parse(String(init.body)) : {};
        bodies.push({ method: init.method ?? 'GET', path, body });
        if (init.method === 'POST') { const token = { id: 't1', userId: 'reader', kind: 'token', prefix: 'yu_abcdefgh', scopes: body.scopes, createdAt: 1, expiresAt: 0, revoked: false, name: body.name, note: body.note }; tokens.push(token); return Response.json({ ...token, secret: 'yu_secret' }); }
        if (init.method === 'PATCH') { Object.assign(tokens[0], body); return Response.json(tokens[0]); }
        return Response.json(tokens);
    }); vi.stubGlobal('fetch', fetch);
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><Tokens /></SWRConfig>));
    const form = host.querySelector('form')!;
    await act(async () => { setValue(form.querySelector('input:not([type])')!, '  CI deploy '); setValue(form.querySelector('textarea')!, 'GitHub Actions'); });
    await act(async () => { form.requestSubmit(); });
    expect(bodies.find(item => item.method === 'POST')?.body).toMatchObject({ name: 'CI deploy', note: 'GitHub Actions', scopes: ['nodes:read'] });
    const card = () => host.querySelector('section[aria-label="CI deploy"], section[aria-label="renamed"]')!;
    expect(card().textContent).toContain('GitHub Actions');
    await act(async () => { [...card().querySelectorAll('button')].find(button => button.textContent === 'editToken')!.click(); });
    const edit = card().querySelector('form')!;
    await act(async () => { setValue(edit.querySelector('input')!, 'renamed'); setValue(edit.querySelector('textarea')!, ''); });
    await act(async () => { edit.requestSubmit(); });
    expect(bodies.find(item => item.method === 'PATCH')).toMatchObject({ path: '/api/v2/auth/tokens/t1', body: { name: 'renamed', note: '' } });
    expect(host.querySelector('section[aria-label="renamed"]')).not.toBeNull();
    act(() => root.unmount()); host.remove();
});
