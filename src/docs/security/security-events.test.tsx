import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { SWRConfig } from 'swr';
import { afterEach, expect, it, vi } from 'vitest';
import { clearSession, establishSession } from '@/auth/session';
import { setApiUrl } from '@/common/apiurl';
import { SecurityEvents, type AuditSettings } from './security-events';
vi.mock('react-i18next', () => { const t = (key: string) => key; return { useTranslation: () => ({ t }) }; });
vi.mock('@/component/v2/confirmation', () => ({ confirmAction: vi.fn(async () => true) }));
let root: Root | undefined; let host: HTMLDivElement | undefined;
afterEach(() => { if (root) act(() => root!.unmount()); host?.remove(); root = undefined; host = undefined; clearSession(); localStorage.clear(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
const settings: AuditSettings = { instanceId: 'instance', revision: 3, maxEvents: 10000, maxAgeDays: 90, outboxLimit: 4096, forwardEnabled: true, transport: 'https', endpoint: '', endpointConfigured: true, destination: 'https://siem.example', tokenConfigured: true };
const event = { id: '9007199254740993', event: 'role.updated', actorId: 'actor', subjectId: 'role', occurredAt: 100, source: '127.0.0.1', method: 'PUT', path: '/roles/{id}', credentialId: 'credential', result: 'succeeded', changes: '{"before":{"name":"old"},"after":{"name":"new"}}', authMethod: 'oidc-provider', policyRevision: '42', reason: '' };
function session(extra: string[] = []) { setApiUrl('https://controller.example'); establishSession('test', { userId: 'admin', credentialType: 'session', permissions: ['identity:read', 'security:read', ...extra] }, Math.floor(Date.now() / 1000) + 600, 'https://controller.example'); }
function mock(conflict = false) {
    const fetch = vi.fn(async (url: URL, init: RequestInit) => {
        if (init.method === 'PUT') return Response.json({ ...settings, revision: 4 }, { status: conflict ? 409 : 200 });
        if (url.pathname.endsWith('/settings')) return Response.json(settings);
        if (url.pathname.endsWith('/status')) return Response.json({ running: true, backlog: 5, dropped: '9007199254740993', delivered: '0', deliveryFailures: '2', localWriteFailures: '0', lastError: 'delivery_unavailable' });
        if (url.pathname.endsWith('/export')) return Response.json({ instanceId: 'instance', items: [event], nextCursor: '' });
        return Response.json({ instanceId: 'instance', items: [{ ...event, id: url.searchParams.has('cursor') ? '9007199254740991' : event.id }], nextCursor: url.searchParams.has('cursor') ? '' : 'opaque-cursor' });
    }); vi.stubGlobal('fetch', fetch); return fetch;
}
async function render() { host = document.createElement('div'); document.body.append(host); root = createRoot(host); await act(async () => root!.render(<SWRConfig value={{ provider: () => new Map(), shouldRetryOnError: false, dedupingInterval: 0 }}><SecurityEvents /></SWRConfig>)); return host; }
async function input(node: HTMLInputElement, value: string) { await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(node, value); node.dispatchEvent(new Event('input', { bubbles: true })); }); }
function button(view: HTMLElement, text: string) { return [...view.querySelectorAll<HTMLButtonElement>('button')].find(node => node.textContent === text)!; }
it('uses server filters and cursors while preserving exact decimal event IDs', async () => {
    session(); const fetch = mock(); const view = await render();
    expect(view.textContent).toContain('9007199254740993'); expect(view.textContent).toContain('oidc-provider'); expect(view.textContent).toContain('42');
    await act(async () => button(view, 'audit.next').click());
    expect(fetch.mock.calls.some(([url]) => url.searchParams.get('cursor') === 'opaque-cursor')).toBe(true);
    expect(view.textContent).toContain('9007199254740991');
    const filters = view.querySelector<HTMLFormElement>('form[aria-label="audit.filters"]')!;
    await input(filters.querySelector<HTMLInputElement>('input')!, '%_literal');
    await act(async () => filters.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    const pages = fetch.mock.calls.filter(([url]) => url.pathname.endsWith('/page')); const last = pages[pages.length - 1][0];
    expect(last.searchParams.get('search')).toBe('%_literal'); expect(last.searchParams.has('cursor')).toBe(false);
    expect(button(view, 'audit.previous').disabled).toBe(true);
});
it('gates settings and exports and never renders saved endpoint proofs or bearer tokens', async () => {
    session(); const fetch = mock(); const view = await render();
    expect(button(view, 'audit.exportPage')).toBeUndefined();
    const form = view.querySelector<HTMLFormElement>('form[aria-label="audit.settings"]')!;
    expect(form.querySelector('fieldset')!.disabled).toBe(true);
    expect([...form.querySelectorAll<HTMLInputElement>('input[type="password"]')].every(node => node.value === '')).toBe(true);
    expect(view.textContent).toContain('https://siem.example');
    await act(async () => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(fetch.mock.calls.every(([, init]) => init.method === 'GET')).toBe(true);
});
it('preserves blank secrets and retains edited retention settings after a conflict', async () => {
    session(['security:write']); const fetch = mock(true); const view = await render();
    const form = view.querySelector<HTMLFormElement>('form[aria-label="audit.settings"]')!;
    const max = form.querySelector<HTMLInputElement>('input[type="number"]')!; await input(max, '5000');
    expect([...form.querySelectorAll<HTMLInputElement>('input[type="password"]')].every(node => node.disabled)).toBe(true);
    await act(async () => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    const write = fetch.mock.calls.find(([, init]) => init.method === 'PUT')!;
    expect(JSON.parse(String(write[1].body))).toMatchObject({ revision: 3, maxEvents: 5000, endpoint: '', token: '', clearToken: false, clearEndpoint: false });
    expect(view.textContent).toContain('audit.conflict'); expect(max.value).toBe('5000');
    await act(async () => button(form, 'refresh').click());
    expect(view.querySelector<HTMLInputElement>('form[aria-label="audit.settings"] input[type="number"]')!.value).toBe('10000');
});
it('exports only the filtered page through authenticated fetch with no URL token', async () => {
    session(['security:export']); const fetch = mock(); const view = await render();
    const create = vi.fn(() => 'blob:test'); const revoke = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', { value: create, configurable: true }); Object.defineProperty(URL, 'revokeObjectURL', { value: revoke, configurable: true });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    await act(async () => button(view, 'audit.exportPage').click());
    const call = fetch.mock.calls.find(([url]) => url.pathname.endsWith('/export'))!;
    expect(call[0].searchParams.get('limit')).toBe('100'); expect(call[0].searchParams.has('token')).toBe(false);
    expect(new Headers(call[1].headers).get('Authorization')).toBe('Session test');
    expect(create).toHaveBeenCalledOnce(); expect(revoke).toHaveBeenCalledWith('blob:test');
});
it('aborts pending settings writes on unmount and ignores late replies', async () => {
    session(['security:write', 'secrets:manage']); const fetch = mock(); const view = await render(); let finish: ((response: Response) => void) | undefined;
    fetch.mockImplementation(async (url, init) => init.method === 'PUT' ? new Promise<Response>(resolve => { finish = resolve; }) : Response.json(url.pathname.endsWith('/settings') ? settings : {}));
    const form = view.querySelector<HTMLFormElement>('form[aria-label="audit.settings"]')!;
    await input(form.querySelector<HTMLInputElement>('input[type="password"]')!, 'https://siem.example/private-webhook-proof');
    await act(async () => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    const call = fetch.mock.calls.find(([, init]) => init.method === 'PUT')!;
    expect(call[1].signal?.aborted).toBe(false);
    await act(async () => root!.unmount()); root = undefined;
    expect(call[1].signal?.aborted).toBe(true);
    const count = fetch.mock.calls.length; await act(async () => finish!(Response.json({ ...settings, revision: 4 })));
    expect(fetch.mock.calls).toHaveLength(count);
});
