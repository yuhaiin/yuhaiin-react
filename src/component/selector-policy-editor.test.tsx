import { act, useEffect, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { SWRConfig } from 'swr';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { Selector } from '@/contract/node';
import { SelectorLiveStatus, SelectorPolicyEditor } from './selector-policy-editor';
import { authorizeTest, resetTestAuth } from '@/test/auth';

const api = vi.hoisted(() => ({ getSelectorStatus: vi.fn(), measureNodeSpeed: vi.fn(), requestJSON: vi.fn() }));
vi.mock('@/api/selectors', () => api);
vi.mock('@/api/client', () => api);
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('./node-select', () => ({ NodeSelect: ({ onChange, label }: { onChange: (node: { id: string }) => void; label: string }) => <button onClick={() => onChange({ id: 'b' })}>{label}</button> }));
vi.mock('./v2/forms', async importOriginal => {
    const original = await importOriginal<typeof import('./v2/forms')>();
    return { ...original, Select: ({ value, onValueChange, items, ariaLabel }: { value: string; onValueChange: (value: string) => void; items: { value: string; label: string }[]; ariaLabel: string }) => <select aria-label={ariaLabel} value={value} onChange={e => onValueChange(e.target.value)}>{items.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select> };
});
let host: HTMLDivElement;
let root: Root;
let latest: Selector;
const base: Selector = { id: 's', name: 'Work', nodeId: 'a', revision: 7 };
beforeEach(() => {
    vi.clearAllMocks(); authorizeTest();
    host = document.createElement('div'); document.body.append(host); root = createRoot(host);
    api.getSelectorStatus.mockResolvedValue({ id: 's', revision: 7, tcp: { nodeId: 'a', reason: 'lowest_latency', candidates: [{ nodeId: 'a', state: 'healthy', eligible: true, reason: 'eligible', samples: 3, rttMs: 52, downloadMbps: 20, uploadMbps: 0, failureRate: 0, activeConnections: 2, score: .7, components: { rtt: .8 } }] }, udp: { nodeId: '', reason: 'no_healthy_candidate', candidates: [] }, switches: 1, suppressed: 2, events: [{ at: 1000, network: 'tcp', from: 'b', to: 'a', reason: 'lowest_latency' }] });
    api.measureNodeSpeed.mockResolvedValue({ ok: true }); api.requestJSON.mockResolvedValue({ ok: true });
});
afterEach(() => { act(() => root.unmount()); host.remove(); resetTestAuth(); });
async function editor(value = base) {
    function Harness() { const [draft, setDraft] = useState(value); useEffect(() => { latest = draft; }, [draft]); return <SelectorPolicyEditor value={draft} onChange={setDraft} />; }
    await act(async () => root.render(<Harness />));
}
function setMode(mode: string) {
    const control = host.querySelector<HTMLSelectElement>('select[aria-label="auto.mode"]')!;
    act(() => { control.value = mode; control.dispatchEvent(new Event('change', { bubbles: true })); });
}
async function click(text: string) { await act(async () => [...host.querySelectorAll<HTMLButtonElement>('button')].find(b => b.textContent === text)!.click()); }
it('keeps legacy manual selection unchanged and seeds automatic candidates explicitly', async () => {
    await editor(); expect(latest).toEqual(base); expect(host.textContent).not.toContain('auto.addCandidate');
    setMode('failover');
    expect(latest.policy).toMatchObject({ mode: 'failover', candidates: [{ nodeId: 'a', enabled: true, priority: 0, weight: 1 }] });
    await click('auto.addCandidate'); await click('auto.addCandidate');
    expect(latest.policy?.candidates?.map(c => c.nodeId)).toEqual(['a', 'b']);
    setMode('manual'); expect(latest.nodeId).toBe('a'); expect(latest.revision).toBe(7);
});
it('retains a custom scoring profile while editing weights and allows manual lock', async () => {
    await editor({ ...base, policy: { mode: 'balanced', weights: { rtt: 1 }, candidates: [{ nodeId: 'a', enabled: true, priority: 0, weight: 1 }] } });
    const label = [...host.querySelectorAll('label')].find(l => l.textContent === 'auto.weightLabels.download')!;
    const input = document.getElementById(label.htmlFor) as HTMLInputElement;
    expect(input.value).toBe('0');
    act(() => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, '2'); input.dispatchEvent(new Event('input', { bubbles: true })); });
    expect(latest.policy?.weights).toEqual({ rtt: 1, download: 2 });
    const lock = host.querySelector<HTMLButtonElement>('[role="switch"][aria-label="auto.locked"]')!;
    act(() => lock.click()); expect(latest.policy?.locked).toBe(true); expect(latest.nodeId).toBe('a');
});
it('shows measured throughput, raw RTT, score explanation, and separate UDP choice', async () => {
    const value = { ...base, policy: { mode: 'lowest_latency', speedTarget: 'https://speed.example/data', weights: {} } };
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><SelectorLiveStatus value={value} /></SWRConfig>));
    expect(host.textContent).toContain('52.0 ms (3)'); expect(host.textContent).toContain('20.00 Mbps');
    expect(host.textContent).toContain('auto.measuredDownload'); expect(host.textContent).toContain('auto.weightLabels.rtt: 0.800');
    await click('auto.measureNow'); expect(api.measureNodeSpeed).toHaveBeenCalledWith('a', { url: 'https://speed.example/data' });
    await click('auto.probeNow'); expect(api.requestJSON).toHaveBeenCalledWith('POST', '/api/v2/nodes/a/latency', { type: 'http', url: '' });
    await click('UDP'); expect(host.textContent).toContain('auto.reasons.no_healthy_candidate');
    expect(host.textContent).not.toContain('52.0 ms');
});
