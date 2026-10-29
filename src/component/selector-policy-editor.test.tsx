import { act, useEffect, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { SWRConfig } from 'swr';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { Selector } from '@/contract/node';
import { SelectorLiveStatus, SelectorPolicyEditor } from './selector-policy-editor';
import { authorizeTest, resetTestAuth } from '@/test/auth';

const api = vi.hoisted(() => ({ getSelectorStatus: vi.fn(), measureNodeSpeed: vi.fn(), requestJSON: vi.fn(), getNodeStatuses: vi.fn() }));
vi.mock('@/api/selectors', () => api);
vi.mock('@/api/client', () => api);
vi.mock('@/api/node-observability', () => api);
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
    api.getSelectorStatus.mockResolvedValue({ id: 's', revision: 7, tcp: { nodeId: 'a', reason: 'lowest_latency', candidates: [{ nodeId: 'a', state: 'healthy', eligible: true, reason: 'eligible', samples: 3, rttMs: 52, downloadMbps: 20, uploadMbps: 0, failureRate: .4, timeoutRate: .2, healthSamples: 5, activeConnections: 2, score: .7, components: { rtt: .8 } }] }, udp: { nodeId: '', reason: 'no_healthy_candidate', candidates: [] }, switches: 1, suppressed: 2, events: [{ at: 1000, network: 'tcp', from: 'b', to: 'a', reason: 'lowest_latency' }] });
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
    await click('auto.probeNow'); expect(api.requestJSON).toHaveBeenCalledWith('POST', '/api/v2/nodes/a/latency', { type: 'https', url: 'https://www.gstatic.com/generate_204' });
    await click('UDP'); expect(host.textContent).toContain('auto.reasons.no_healthy_candidate');
    expect(host.textContent).not.toContain('52.0 ms');
});

it('requires upload consent and sends only the saved upload target and budget', async () => {
    const value: Selector = { ...base, policy: { mode: 'balanced', weights: { upload: 1 }, uploadTarget: 'https://upload.example/test', uploadTest: { url: '', allowUpload: true, maxBytes: 8192, dailyBudgetBytes: 1048576 }, speedTest: { url: 'https://download.example/test', maxBytes: 1024 } } };
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><SelectorLiveStatus value={value} /></SWRConfig>));
    await click('auto.measureUploadNow');
    expect(api.measureNodeSpeed).toHaveBeenCalledWith('a', { direction: 'upload', url: 'https://upload.example/test', allowUpload: true, maxBytes: 8192, dailyBudgetBytes: 1048576 });
    expect(api.requestJSON.mock.calls.filter(([method]) => method === 'POST')).toEqual([]);
    api.measureNodeSpeed.mockClear();
    const noConsent = { ...value, policy: { ...value.policy!, uploadTest: { url: '', allowUpload: false } } };
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><SelectorLiveStatus value={noConsent} /></SWRConfig>));
    const control = [...host.querySelectorAll<HTMLButtonElement>('button')].find(b => b.textContent === 'auto.measureUploadNow')!;
    expect(control.disabled).toBe(true);
    await act(async () => control.click());
    expect(api.measureNodeSpeed).not.toHaveBeenCalled();
});
it('keeps upload consent and manual controls separate from automatic schedule enablement', async () => {
    await editor({ ...base, policy: { mode: 'balanced', weights: { upload: 1 }, candidates: [{ nodeId: 'a', enabled: true, priority: 0, weight: 1 }] } });
    const fields = host.querySelector('[data-testid="upload-test-fields"]')!;
    const label = [...fields.querySelectorAll('label')].find(l => l.textContent === 'auto.uploadTarget')!;
    const input = document.getElementById(label.htmlFor) as HTMLInputElement;
    act(() => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'https://upload.example/test'); input.dispatchEvent(new Event('input', { bubbles: true })); });
    expect(latest.policy?.uploadTarget).toBe('https://upload.example/test');
    expect(latest.policy?.uploadTest?.direction).toBe('upload');
    expect(latest.policy?.uploadTest?.allowUpload).toBeUndefined();
    const consent = fields.querySelector<HTMLButtonElement>('[role="switch"][aria-label="auto.allowUpload"]')!;
    await act(async () => consent.click());
    expect(latest.policy?.uploadTest?.allowUpload).toBe(true);
    expect(latest.policy?.periodicUpload).toBeUndefined();
    expect(latest.policy?.periodicSpeed).toBeUndefined();
    expect(api.measureNodeSpeed).not.toHaveBeenCalled();
});
it('labels upload history using upload Mbps rather than the zero download field', async () => {
    api.getNodeStatuses.mockResolvedValue({ a: { throughputHistory: [{ direction: 'upload', at: 1000, ok: true, uploadMbps: 25, downloadMbps: 0, bytes: 8192, durationMs: 20, target: 'https://upload.example/test' }] } });
    const value = { ...base, policy: { mode: 'balanced', weights: { upload: 1 } } };
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><SelectorLiveStatus value={value} /></SWRConfig>));
    const details = [...host.querySelectorAll('summary')].find(s => s.textContent === 'monitor.measurementHistory')!.parentElement as HTMLDetailsElement;
    await act(async () => { details.open = true; details.dispatchEvent(new Event('toggle')); });
    expect(details.textContent).toContain('auto.measuredUpload');
    expect(details.textContent).toContain('25.00 Mbps');
    expect(details.textContent).not.toContain('0.00 Mbps');
});


it('preserves preference when replacing a candidate and hides it for weighted distribution', async () => {
    await editor({ ...base, policy: { mode: 'lowest_latency', weights: {}, candidates: [{ nodeId: 'a', enabled: true, priority: 0, weight: 1 }], preferredId: 'a' } });
    expect(host.textContent).toContain('auto.metricRecoveryHint');
    await click('auto.candidate');
    expect(latest.policy?.preferredId).toBe('b');
    expect(latest.policy?.candidates?.[0].nodeId).toBe('b');
    const control = host.querySelector<HTMLButtonElement>('[role="switch"][aria-label="auto.returnToPreferred"]')!;
    await act(async () => control.click());
    expect(latest.policy?.returnToPreferred).toBe(true);
    await click('auto.preferred');
    expect(latest.policy?.preferredId).toBeUndefined();
    setMode('weighted');
    expect(host.textContent).toContain('auto.weightedRecoveryHint');
    expect(host.querySelector('[aria-label="auto.returnToPreferred"]')).toBeNull();
    expect(host.textContent).not.toContain('auto.prefer');
    setMode('failover');
    expect(host.textContent).toContain('auto.failoverRecoveryHint');
    expect(latest.nodeId).toBe('a');
});

it('explains a suppressed preferred return in live status', async () => {
    api.getSelectorStatus.mockResolvedValue({ id: 's', revision: 7, tcp: { nodeId: 'b', reason: 'preferred_return_disabled', candidates: [] }, udp: { nodeId: '', reason: 'no_healthy_candidate', candidates: [] }, events: [], switches: 0, suppressed: 1 });
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><SelectorLiveStatus value={{ ...base, policy: { mode: 'lowest_latency', weights: {} } }} /></SWRConfig>));
    expect(host.textContent).toContain('auto.reasons.preferred_return_disabled');
});

it('explains when a candidate needs another RTT sample for jitter', async () => {
    api.getSelectorStatus.mockResolvedValue({ id: 's', revision: 7, tcp: { nodeId: '', reason: 'no_healthy_candidate', candidates: [{ nodeId: 'a', state: 'healthy', eligible: false, reason: 'insufficient_comparable_jitter', samples: 1, rttMs: 52, downloadMbps: 0, uploadMbps: 0, failureRate: 0, healthSamples: 1, activeConnections: 0, score: 0 }] }, udp: { nodeId: '', reason: 'no_healthy_candidate', candidates: [] }, events: [], switches: 0, suppressed: 0 });
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><SelectorLiveStatus value={{ ...base, policy: { mode: 'balanced', weights: { jitter: 1 } } }} /></SWRConfig>));
    expect(host.textContent).toContain('auto.reasons.insufficient_comparable_jitter');
    const jitter = [...host.querySelectorAll('dt')].find(item => item.textContent === 'auto.weightLabels.jitter');
    expect(jitter?.nextElementSibling?.textContent).toBe('auto.unmeasured');
});

it('shows measured RTT jitter separately from its scoring component', async () => {
    api.getSelectorStatus.mockResolvedValue({ id: 's', revision: 7, tcp: { nodeId: 'a', reason: 'balanced', candidates: [{ nodeId: 'a', state: 'healthy', eligible: true, reason: 'eligible', samples: 3, rttMs: 52, jitterMs: 4.5, downloadMbps: 0, uploadMbps: 0, failureRate: 0, healthSamples: 3, activeConnections: 0, score: .8, components: { jitter: .95 } }] }, udp: { nodeId: '', reason: 'no_healthy_candidate', candidates: [] }, events: [], switches: 0, suppressed: 0 });
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><SelectorLiveStatus value={{ ...base, policy: { mode: 'balanced', weights: { jitter: 1 } } }} /></SWRConfig>));
    const jitter = [...host.querySelectorAll('dt')].find(item => item.textContent === 'auto.weightLabels.jitter');
    expect(jitter?.nextElementSibling?.textContent).toBe('4.5 ms');
    expect(host.textContent).toContain('auto.weightLabels.jitter: 0.950');
});


it('shows timeout outcomes separately from comparable RTT sample counts', async () => {
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><SelectorLiveStatus value={base} /></SWRConfig>));
    expect(host.textContent).toContain('auto.timeoutRate');
    expect(host.textContent).toContain('20.0% (5)');
    expect(host.textContent).toContain('52.0 ms (3)');
    expect(host.textContent).toContain('auto.timeoutRateHint');
});
