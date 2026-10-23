import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { SWRConfig } from 'swr';
import { afterEach, expect, it, vi } from 'vitest';
import { clearSession, establishSession } from '@/auth/session';
import { setApiUrl } from '@/common/apiurl';
import { TrafficAccess } from './traffic-access';

vi.mock('react-i18next', () => { const t = (key: string) => key; return { useTranslation: () => ({ t }) }; });
vi.mock('@/component/v2/confirmation', () => ({ confirmAction: vi.fn(async () => true) }));
afterEach(() => { clearSession(); localStorage.clear(); vi.unstubAllGlobals(); });
const initial = { revision: 7, enabled: true, scope: { allInbounds: true, inbounds: [] }, defaultAction: 'deny', rules: [
    { id: 'one', name: 'First', action: 'deny', disabled: false, conditions: [{ type: 'always', always: {} }] },
    { id: 'two', name: 'Second', action: 'allow', disabled: false, conditions: [{ type: 'always', always: {} }] },
] };
function session() { setApiUrl('https://controller.example'); establishSession('test', { userId: 'admin', credentialType: 'session', permissions: ['traffic-access:read', 'traffic-access:write'] }, Math.floor(Date.now() / 1000) + 600, 'https://controller.example'); }
it('preserves explicit ordering and revisions through validation and activation', async () => {
    session();
    const calls: RequestInit[] = [];
    vi.stubGlobal('fetch', vi.fn(async (url: URL, init: RequestInit) => {
        calls.push(init);
        if (url.pathname.endsWith('/validate')) return Response.json({ valid: true, errors: [] });
        if (init.method === 'PUT') { const config = JSON.parse(String(init.body)); expect(config.revision).toBe(7); expect(config.rules.map((rule: { id: string }) => rule.id)).toEqual(['two', 'one']); return Response.json({ ...config, revision: 8 }); }
        return Response.json(initial);
    }));
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><TrafficAccess writable /></SWRConfig>));
    await act(async () => { [...host.querySelectorAll('button')].find(button => button.textContent === 'access.moveDown')!.click(); });
    await act(async () => { host.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });
    expect(calls.filter(call => call.method === 'PUT')).toHaveLength(1);
    expect(host.querySelector('[role=status]')!.textContent).toBe('access.saved');
    act(() => root.unmount()); host.remove();
});
it('shows validation failures without activating and keeps a conflicting draft', async () => {
    session(); let valid = false;
    const fetch = vi.fn(async (url: URL, init: RequestInit) => {
        if (url.pathname.endsWith('/validate')) return Response.json({ valid, errors: valid ? [] : ['choose a destination'] });
        if (init.method === 'PUT') return Response.json({}, { status: 409 });
        return Response.json(initial);
    }); vi.stubGlobal('fetch', fetch);
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><TrafficAccess writable /></SWRConfig>));
    await act(async () => { host.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });
    expect(host.querySelector('[role=alert]')!.textContent).toBe('choose a destination');
    expect(fetch.mock.calls.filter(([, init]) => init.method === 'PUT')).toHaveLength(0);
    valid = true;
    await act(async () => { [...host.querySelectorAll('button')].find(button => button.textContent === 'access.moveDown')!.click(); host.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });
    expect(host.querySelector('[role=alert]')!.textContent).toBe('access.conflict');
    expect(host.querySelector<HTMLInputElement>('section input[aria-label=credentialName]')!.value).toBe('Second');
    act(() => root.unmount()); host.remove();
});
it('disables mutation controls for readers while allowing a policy preview', async () => {
    session();
    vi.stubGlobal('fetch', vi.fn(async () => Response.json(initial)));
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><TrafficAccess writable={false} /></SWRConfig>));
    expect(host.querySelector('fieldset')!.disabled).toBe(true);
    expect(host.querySelectorAll('fieldset')[1].disabled).toBe(false);
    act(() => root.unmount()); host.remove();
});
