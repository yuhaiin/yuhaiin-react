import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { SWRConfig } from 'swr';
import { afterEach, expect, it, vi } from 'vitest';
import { clearSession, establishSession } from '@/auth/session';
import { setApiUrl } from '@/common/apiurl';
import { blankProfile } from '@/contract/traffic-control';
import { blankResourcePolicy } from './resource-policy';
import { IdentityResourcePolicies } from './resources';

vi.mock('react-i18next', () => { const t = (key: string) => key; return { useTranslation: () => ({ t }) }; });
vi.mock('@/component/v2/confirmation', () => ({ confirmAction: vi.fn(async () => true) }));

let root: Root | undefined;
let host: HTMLDivElement | undefined;
afterEach(() => { if (root) act(() => root!.unmount()); host?.remove(); root = undefined; host = undefined; clearSession(); localStorage.clear(); vi.unstubAllGlobals(); });
function session(write = true) {
    setApiUrl('https://controller.example');
    establishSession('test', { userId: 'admin', credentialType: 'session', permissions: ['resources:read', ...(write ? ['resources:write'] : [])] }, Math.floor(Date.now() / 1000) + 600, 'https://controller.example');
}
function initial() {
    const policy = blankResourcePolicy();
    policy.quotas = [{ id: 'quota', period: 'monthly', upload: '0', download: '0', combined: '9007199254740993', action: 'block_new', reducedSpeed: blankProfile(), thresholds: [80, 90, 100] }];
    return { revision: 7, enabled: true, defaultUser: policy, groups: [], users: [], credentials: [] };
}
async function render() {
    host = document.createElement('div'); document.body.append(host); root = createRoot(host);
    await act(async () => root!.render(<SWRConfig value={{ provider: () => new Map() }}><IdentityResourcePolicies /></SWRConfig>));
    return host;
}
async function enter(input: HTMLInputElement, value: string) {
    await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value); input.dispatchEvent(new Event('input', { bubbles: true })); });
}

it('validates then activates exact decimal quotas without leaking editor keys', async () => {
    session(); const calls: Array<{ path: string; init: RequestInit }> = [];
    vi.stubGlobal('fetch', vi.fn(async (url: URL, init: RequestInit) => {
        calls.push({ path: url.pathname, init });
        if (url.pathname.endsWith('/validate')) return Response.json({ valid: true, errors: [] });
        if (init.method === 'PUT') return Response.json({ ...JSON.parse(String(init.body)), revision: 8 });
        return Response.json(initial());
    }));
    const view = await render();
    await enter(view.querySelector<HTMLInputElement>('[aria-label="resources.quotaCombined"]')!, '9223372036854775807');
    await act(async () => view.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(calls.filter(call => call.init.method === 'PUT')).toHaveLength(1);
    const saved = JSON.parse(String(calls.find(call => call.init.method === 'PUT')!.init.body));
    expect(saved.revision).toBe(7);
    expect(saved.defaultUser.quotas[0].combined).toBe('9223372036854775807');
    expect(Object.keys(saved).sort()).toEqual(['credentials', 'defaultUser', 'enabled', 'groups', 'revision', 'users']);
    expect(view.querySelector('[role="status"]')!.textContent).toBe('resources.saved');
});

it('retains conflicting drafts and stops activation for invalid byte input', async () => {
    session();
    const fetch = vi.fn(async (url: URL, init: RequestInit) => {
        if (url.pathname.endsWith('/validate')) return Response.json({ valid: true, errors: [] });
        if (init.method === 'PUT') return Response.json({}, { status: 409 });
        return Response.json(initial());
    });
    vi.stubGlobal('fetch', fetch);
    const view = await render();
    const input = view.querySelector<HTMLInputElement>('[aria-label="resources.quotaCombined"]')!;
    await enter(input, '9223372036854775808');
    await act(async () => view.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(fetch.mock.calls.filter(([, init]) => init.method === 'PUT')).toHaveLength(0);
    await enter(input, '999');
    await act(async () => view.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(view.querySelector('[role="alert"]')!.textContent).toBe('resources.conflict');
    expect(input.value).toBe('999');
});

it('allows readers to inspect policies without submitting mutations', async () => {
    session(false);
    const fetch = vi.fn(async (_url: URL, _init: RequestInit) => Response.json(initial())); vi.stubGlobal('fetch', fetch);
    const view = await render();
    expect(view.querySelector('fieldset')!.disabled).toBe(true);
    await act(async () => view.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(fetch.mock.calls.every(([, init]) => !init || init.method === 'GET')).toBe(true);
});
