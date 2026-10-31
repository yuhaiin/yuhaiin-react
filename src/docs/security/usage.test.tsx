import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { SWRConfig } from 'swr';
import { clearSession, establishSession } from '@/auth/session';
import { setApiUrl } from '@/common/apiurl';
import { UserUsage } from './usage';
import { usageBytes, usageRange, type UsageReport } from './usage-api';

vi.mock('react-i18next', () => { const t = (key: string) => key; return { useTranslation: () => ({ t }) }; });
afterEach(() => { clearSession(); localStorage.clear(); vi.unstubAllGlobals(); });

const counters = { upload: '9007199254740993', download: '2048', opened: '3', failed: '1', sessionMillis: '60000', firstSeen: 1700000000000, lastSeen: 1700000060000 };
const health = { pendingAudit: 0, droppedAudit: '0', lastFlush: 1700000060000, persistenceError: false };
const report: UsageReport = { summary: { userId: 'alice', lifetime: counters, period: counters, activeTcp: 2, activeUdp: 1, peakTcp: 4, peakUdp: 2, activeMinutes: '8', periodActiveMinutes: '2', uploadRate: '1024', downloadRate: '2048' }, series: [{ ...counters, start: 1700000000 }], nodes: [{ ...counters, id: 'node', name: 'Office' }], inbounds: [], credentials: [], protocols: [], interval: 'hour', from: 1700000000, to: 1700003600, updatedAt: 1700000060000, health };

function authenticate(permissions: string[]) { setApiUrl('https://controller.example'); establishSession('test', { userId: 'alice', credentialType: 'session', permissions }, Math.floor(Date.now() / 1000) + 600, 'https://controller.example'); }
async function renderUsage() {
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}><UserUsage /></SWRConfig>));
    return { host, close: () => { act(() => root.unmount()); host.remove(); } };
}

it('preserves large counter precision and validates UTC date ranges', () => {
    expect(usageBytes('9007199254740993')).toBe('8.00 PiB');
    expect(usageBytes('18446744073709551615')).toBe('15.99 EiB');
    expect(usageBytes('1024')).toBe('1.00 KiB');
    const range = usageRange('today', '', '', Date.parse('2026-10-23T12:00:00Z'));
    expect(range.from).toBe(String(Date.parse('2026-10-23T00:00:00Z') / 1000));
    expect(() => usageRange('custom', '2026-10-24', '2026-10-20')).toThrow();
});

it('only requests the current owner and shows precise totals without management controls', async () => {
    authenticate(['identity:read', 'usage:own']);
    const fetch = vi.fn(async (url: URL) => url.pathname.endsWith('/audit') ? Response.json({ items: [], next: '', health }) : Response.json(report)); vi.stubGlobal('fetch', fetch);
    const view = await renderUsage();
    expect(view.host.textContent).toContain('Office');
    expect(view.host.querySelector('[title="9007199254740993"]')).not.toBeNull();
    expect(view.host.textContent).not.toContain('usage.retention');
    expect(view.host.textContent).not.toContain('usage.unattributed');
    for (const [url] of fetch.mock.calls) expect(url.searchParams.get('owner')).toBe('alice');
    view.close();
});

it('displays audit details, follows the cursor and restores the previous page', async () => {
    authenticate(['identity:read', 'usage:own']);
    const item = { id: 'one', userId: 'alice', credentialId: 'phone', inboundId: 'entry', inboundName: 'Front door', nodeId: 'node', nodeName: 'Office', selectorId: '', selectorName: '', ruleId: 'rule', ruleName: 'Work', protocol: 'tcp', mode: 'proxy', source: '192.0.2.1:1234', target: 'example.com:443', ip: '192.0.2.2', startedAt: 1700000000000, endedAt: 1700000060000, lastSeen: 1700000060000, durationMillis: '60000', upload: '10', download: '20', result: 'closed', reason: 'closed' };
    const fetch = vi.fn(async (url: URL) => url.pathname.endsWith('/audit') ? Response.json({ items: [{ ...item, id: url.searchParams.has('before') ? 'two' : 'one', target: url.searchParams.has('before') ? 'second.example:443' : item.target }], next: url.searchParams.has('before') ? '' : 'cursor-next', health }) : Response.json(report)); vi.stubGlobal('fetch', fetch);
    const view = await renderUsage();
    expect(fetch.mock.calls.some(([url]) => url.pathname.endsWith('/audit'))).toBe(false);
    await act(async () => { [...view.host.querySelectorAll('[role=tab]')].find(tab => tab.textContent === 'usage.audit')!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 })); });
    expect(view.host.textContent).toContain('example.com:443'); expect(view.host.textContent).toContain('Front door'); expect(view.host.textContent).toContain('phone');
    await act(async () => { [...view.host.querySelectorAll('button')].find(button => button.textContent === 'usage.next')!.click(); });
    expect(view.host.textContent).toContain('second.example:443');
    await act(async () => { [...view.host.querySelectorAll('button')].find(button => button.textContent === 'usage.previous')!.click(); });
    expect(fetch.mock.calls.some(([url]) => url.searchParams.get('before') === 'cursor-next')).toBe(true);
    view.close();
});

it('reports incomplete coverage and does not expose data without the usage scope', async () => {
    authenticate(['identity:read', 'usage:own']);
    const fetch = vi.fn(async (url: URL) => url.pathname.endsWith('/audit') ? Response.json({ items: [], next: '', health }) : Response.json({ ...report, health: { ...health, droppedAudit: '4' } })); vi.stubGlobal('fetch', fetch);
    const view = await renderUsage(); expect(view.host.querySelector('[role="alert"]')?.textContent).toContain('usage.incomplete'); view.close();
    authenticate(['identity:read']); fetch.mockClear();
    const denied = await renderUsage(); expect(fetch).not.toHaveBeenCalled(); expect(denied.host.textContent).toBe(''); denied.close();
});

it('reads every series for a hovered or focused bucket and leaves no tooltip behind', async () => {
    authenticate(['identity:read', 'usage:own']);
    const point = (start: number, upload: string, download: string) => ({ ...counters, start, upload, download });
    const series = [point(1700000000, '1024', '2048'), point(1700003600, '0', '1048576')];
    const fetch = vi.fn(async (url: URL) => url.pathname.endsWith('/audit') ? Response.json({ items: [], next: '', health }) : Response.json({ ...report, series, from: 1700000000, to: 1700003700 })); vi.stubGlobal('fetch', fetch);
    const view = await renderUsage();
    const bars = view.host.querySelectorAll<HTMLButtonElement>('figure button');
    expect(bars).toHaveLength(2);
    expect(view.host.querySelector('figure [role=status]')).toBeNull();
    await act(async () => { bars[0].focus(); });
    const tip = view.host.querySelector('figure [role=status]')!.textContent;
    expect(tip).toContain('2023-11-14 22:13 UTC');
    expect(tip).toContain('1.00 KiB'); expect(tip).toContain('2.00 KiB'); expect(tip).toContain('3.00 KiB');
    await act(async () => { bars[0].blur(); });
    expect(view.host.querySelector('figure [role=status]')).toBeNull();
    view.close();
});
