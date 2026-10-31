import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { SWRConfig } from 'swr';
import { afterEach, expect, it, vi } from 'vitest';
import { clearSession, establishSession } from '@/auth/session';
import { setApiUrl } from '@/common/apiurl';
import { ChangeReview, StageChangeButton, configurationDiff } from './configuration-change';
import { ConfigurationChanges } from '@/docs/security/configuration-changes';
import type { ConfigurationChange } from '@/api/configuration-changes';
vi.mock('react-i18next', () => { const t = (key: string) => key; return { useTranslation: () => ({ t }) }; });
vi.mock('@/component/v2/confirmation', () => ({ confirmAction: vi.fn(async () => true) }));
let root: Root | undefined; let host: HTMLDivElement | undefined;
afterEach(() => { if (root) act(() => root!.unmount()); host?.remove(); root = undefined; host = undefined; clearSession(); localStorage.clear(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
const change: ConfigurationChange = { store: 'identity', id: 'draft', kind: 'group', resourceId: 'finance', state: 'staged', origin: 'staged', createdBy: 'actor', committedBy: '', createdAt: 100, committedAt: 0, expiresAt: Date.now() + 10000, revision: '2', rollbackOf: '', activation: 'staged', diff: { before: { name: 'Old', members: ['alice'] }, after: { name: 'Finance', members: ['alice', 'bob'] } } };
function session(permissions = ['configuration:read', 'configuration:write', 'configuration:rollback', 'users:manage']) { setApiUrl('https://controller.example'); establishSession('test', { userId: 'actor', credentialType: 'session', permissions }, Math.floor(Date.now() / 1000) + 600, 'https://controller.example'); }
async function render(node: React.ReactNode) { host = document.createElement('div'); document.body.append(host); root = createRoot(host); await act(async () => root!.render(<SWRConfig value={{ provider: () => new Map(), shouldRetryOnError: false, dedupingInterval: 0 }}>{node}</SWRConfig>)); return host; }
function button(view: HTMLElement, text: string) { return [...view.querySelectorAll<HTMLButtonElement>('button')].find(node => node.textContent === text)!; }
it('shows changed fields and preserves array order in the diff', () => {
    expect(configurationDiff({ a: 1, b: ['a', 'b'] }, { a: 1, b: ['b', 'a'] })).toEqual([{ path: 'b', before: ['a', 'b'], after: ['b', 'a'] }]);
    expect(configurationDiff({ a: { b: true } }, { a: { b: false } })[0].path).toBe('a.b');
});
it('requires validation before commit and retains the draft after a revision conflict', async () => {
    session(); const changed = vi.fn();
    const fetch = vi.fn(async (url: URL) => Response.json(url.pathname.endsWith('/validate') ? { valid: true } : {}, { status: url.pathname.endsWith('/commit') ? 409 : 200 })); vi.stubGlobal('fetch', fetch);
    const view = await render(<ChangeReview initial={change} writable rollback onChanged={changed} />);
    expect(view.textContent).toContain('Finance'); expect(view.textContent).toContain('actor');
    expect(button(view, 'changes.commit').disabled).toBe(true);
    await act(async () => button(view, 'changes.validate').click()); expect(button(view, 'changes.commit').disabled).toBe(false);
    await act(async () => button(view, 'changes.commit').click());
    expect(view.textContent).toContain('changes.conflict'); expect(view.textContent).toContain('Finance'); expect(button(view, 'changes.commit').disabled).toBe(true); expect(changed).not.toHaveBeenCalled();
});
it('prepares rollback as a new draft and never commits it automatically', async () => {
    session(); const changed = vi.fn(); const fetch = vi.fn(async () => Response.json({ ...change, id: 'rollback-draft', rollbackOf: 'old' })); vi.stubGlobal('fetch', fetch);
    const view = await render(<ChangeReview initial={{ ...change, id: 'old', state: 'committed', activation: 'active' }} writable rollback onChanged={changed} />);
    await act(async () => button(view, 'changes.rollback').click());
    expect(fetch.mock.calls).toHaveLength(1); expect(view.textContent).toContain('changes.rollbackOf'); expect(button(view, 'changes.commit').disabled).toBe(true);
    expect(changed).toHaveBeenCalledWith(expect.objectContaining({ id: 'rollback-draft', state: 'staged' }));
});
it('gates staging on configuration and resource permissions', async () => {
    session(['configuration:read', 'configuration:write']); const view = await render(<StageChangeButton request={{ store: 'identity', kind: 'group', payload: {} }} />);
    expect(view.querySelector('button')).toBeNull();
});
it('aborts an in-flight validation when the review closes', async () => {
    session(); const fetch = vi.fn(async (_url: URL, _init: RequestInit) => new Promise<Response>(() => {})); vi.stubGlobal('fetch', fetch);
    const view = await render(<ChangeReview initial={change} writable rollback onChanged={() => {}} />);
    await act(async () => button(view, 'changes.validate').click()); const signal = fetch.mock.calls[0][1].signal!; expect(signal.aborted).toBe(false);
    act(() => root!.unmount()); root = undefined; expect(signal.aborted).toBe(true);
});
it('loads history details separately and hides mutation controls for an auditor', async () => {
    session(['configuration:read', 'users:manage']);
    const fetch = vi.fn(async (url: URL) => Response.json(url.pathname.endsWith('/targets') ? [{ kind: 'group', store: 'identity', writable: false, rollback: false }] : url.pathname.endsWith('/draft') ? change : [{ ...change, diff: null }])); vi.stubGlobal('fetch', fetch);
    const view = await render(<ConfigurationChanges />); expect(view.textContent).not.toContain('Finance');
    await act(async () => button(view, 'changes.inspect').click()); expect(view.textContent).toContain('Finance'); expect(button(view, 'changes.commit')).toBeUndefined(); expect(button(view, 'changes.discard')).toBeUndefined();
});
