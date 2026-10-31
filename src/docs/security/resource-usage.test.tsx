import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { SWRConfig } from 'swr';
import { clearSession, establishSession } from '@/auth/session';
import { setApiUrl } from '@/common/apiurl';
import { blankProfile } from '@/contract/traffic-control';
import { ResourceUsage } from './resource-usage';

vi.mock('react-i18next', () => { const t = (key: string, values?: Record<string, unknown>) => `${key}${values ? ` ${JSON.stringify(values)}` : ''}`; return { useTranslation: () => ({ t }) }; });
let root: Root | undefined;
let host: HTMLDivElement | undefined;
const cache = () => new Map();
afterEach(() => { if (root) act(() => root!.unmount()); host?.remove(); root = undefined; host = undefined; clearSession(); localStorage.clear(); vi.unstubAllGlobals(); });
function session() {
    setApiUrl('https://controller.example');
    establishSession('test', { userId: 'alice', credentialType: 'session', permissions: ['usage:own', 'usage:read'] }, Math.floor(Date.now() / 1000) + 600, 'https://controller.example');
}
async function render(owner = 'alice') {
    if (!root) { host = document.createElement('div'); document.body.append(host); root = createRoot(host); }
    await act(async () => root!.render(<SWRConfig value={{ provider: cache, shouldRetryOnError: false }}><ResourceUsage owner={owner} /></SWRConfig>));
    return host!;
}
function report() {
    const zero = { upload: '0', download: '0', combined: '0' };
    return { enabled: true, revision: 2, userId: 'alice', persistenceDegraded: true,
        scopes: [{ scope: 'user', scopeId: 'alice', name: 'Alice', enforcedProfile: blankProfile(), enforcedLimits: { maxTcpSessions: 4, maxUdpSessions: 2, maxSessions: 5, connectionsPerSecond: 3, packetsPerSecond: 8 }, sessions: { tcp: 2, udp: 1, total: 3 }, rejectedSessions: '9007199254740993', rejectedPackets: '7', lastRejection: 'session_limit', lastRejectedAt: 1700000000 }],
        quotas: [{ scope: 'user', scopeId: 'alice', quotaId: 'month', period: 'monthly', startsAt: 1700000000, resetsAt: 1704067200, action: 'block_new', violations: '9', used: { ...zero, combined: '9007199254740993' }, measured: { ...zero, combined: '9007199254740000' }, recoveryCharge: { ...zero, combined: '993' }, limit: { ...zero, combined: '18014398509481986' }, remaining: { ...zero, combined: '9007199254740993' } }] };
}
it('shows exact quota values, UTC reset, live limits and persistence diagnostics', async () => {
    session();
    const fetch = vi.fn(async (url: URL) => Response.json(url.pathname.endsWith('/resources') ? report() : { items: [], next: '' })); vi.stubGlobal('fetch', fetch);
    const view = await render();
    expect(view.querySelector('[title="9007199254740993 / 18014398509481986"]')).not.toBeNull();
    expect(view.querySelector('meter')!.value).toBe(50);
    expect(view.textContent).toContain('2024-01-01T00:00:00.000Z');
    expect(view.textContent).toContain('TCP 2 / 4');
    expect(view.textContent).toContain('resources.persistenceWarning');
    expect(view.textContent).toContain('resources.reasons.session_limit');
    expect(view.textContent).toContain('9007199254740993');
    for (const [url] of fetch.mock.calls) expect(url.searchParams.get('owner')).toBe('alice');
});
it('keeps alert cursors exact and resets pagination when switching owners', async () => {
    session();
    const fetch = vi.fn(async (url: URL) => Response.json(url.pathname.endsWith('/resources') ? { ...report(), persistenceDegraded: false } : { items: [], next: url.searchParams.get('before') ? '' : '9007199254740993' })); vi.stubGlobal('fetch', fetch);
    const view = await render();
    const next = () => Array.from(view.querySelectorAll('button')).find(button => button.textContent === 'resources.nextAlerts')!;
    await act(async () => next().click());
    expect(fetch.mock.calls.some(([url]) => url.searchParams.get('before') === '9007199254740993')).toBe(true);
    await render('bob');
    const bob = fetch.mock.calls.filter(([url]) => url.searchParams.get('owner') === 'bob');
    expect(bob.length).toBeGreaterThan(0);
    expect(bob.every(([url]) => !url.searchParams.get('before'))).toBe(true);
});
it('hides absent endpoints and skips unattributed requests', async () => {
    session();
    const fetch = vi.fn(async (_url: URL) => Response.json({}, { status: 404 })); vi.stubGlobal('fetch', fetch);
    const view = await render('unattributed');
    expect(fetch).not.toHaveBeenCalled();
    await render();
    expect(view.children.length).toBe(0);
});
it('displays request failures without fabricating usage', async () => {
    session(); vi.stubGlobal('fetch', vi.fn(async (_url: URL) => Response.json({}, { status: 403 })));
    const view = await render();
    expect(view.querySelectorAll('[role="alert"]')).toHaveLength(2);
    expect(view.querySelector('meter')).toBeNull();
});
