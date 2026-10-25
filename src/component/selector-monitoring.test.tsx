import { act, useEffect, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { SWRConfig } from 'swr';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { Go } from '@/api/generated-contracts';
import { MonitoringSettings, SelectorMonitoringEditor } from './selector-monitoring';
import { authorizeTest, resetTestAuth } from '@/test/auth';

const api = vi.hoisted(() => ({ getMonitoring: vi.fn(), saveMonitoring: vi.fn() }));
vi.mock('@/api/monitoring', () => api);
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string, options?: Record<string, unknown>) => key === 'monitor.measurementSlots' ? `${options?.active} / ${options?.limit}` : key }) }));
vi.mock('@/component/v2/confirmation', () => ({ confirmAction: vi.fn(async () => true) }));
let host: HTMLDivElement;
let root: Root;
let latest: Go.node.SelectorPolicy;
beforeEach(() => {
    vi.clearAllMocks(); authorizeTest();
    host = document.createElement('div'); document.body.append(host); root = createRoot(host);
    const status = { activeMeasurements: 2, measurementLimit: 4, policyState: 'enforced', config: { probe: { enabled: false }, speed: { enabled: false, test: { url: '' } } }, network: { online: true, metered: false, foreground: true }, jobs: 0, running: 0, workers: 0, completed: 0, failed: 0, skipped: 0, platform: 'linux' };
    api.getMonitoring.mockResolvedValue(status);
    api.saveMonitoring.mockImplementation(async config => ({ ...status, config }));
});
afterEach(() => { act(() => root.unmount()); host.remove(); resetTestAuth(); });
async function toggle(label: string) {
    const button = document.querySelector<HTMLButtonElement>(`[role="switch"][aria-label="${label}"]`)!;
    if (!button) throw Error(`Missing ${label}`);
    await act(async () => button.click());
}
it('requires separate explicit enablement when creating selector overrides', async () => {
    function Harness() {
        const [value, setValue] = useState<Go.node.SelectorPolicy>({ mode: 'failover', candidates: [{ nodeId: 'a', enabled: true, priority: 0, weight: 1 }], weights: {} });
        useEffect(() => { latest = value; }, [value]);
        return <SelectorMonitoringEditor value={value} onChange={setValue} />;
    }
    await act(async () => root.render(<Harness />));
    expect(latest.probe).toBeUndefined(); expect(latest.periodicSpeed).toBeUndefined();
    await toggle('monitor.overrideProbe'); expect(latest.probe?.enabled).toBe(false);
    await toggle('monitor.probeEnabled'); expect(latest.probe?.enabled).toBe(true);
    await toggle('monitor.overrideSpeed'); expect(latest.periodicSpeed?.enabled).toBe(false);
    await toggle('monitor.allowMobile'); expect(latest.probe?.allowMobile).toBe(true);
    await toggle('monitor.overrideProbe'); expect(latest.probe).toBeUndefined();
    expect(latest.mode).toBe('failover'); expect(latest.candidates?.[0].nodeId).toBe('a');
    expect(api.saveMonitoring).not.toHaveBeenCalled();
});
it('loads global settings only when opened and saves actual enabled state', async () => {
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><MonitoringSettings /></SWRConfig>));
    expect(api.getMonitoring).not.toHaveBeenCalled();
    await act(async () => [...host.querySelectorAll('button')].find(b => b.textContent === 'monitor.defaults')!.click());
    expect(api.getMonitoring).toHaveBeenCalledTimes(1);
    await toggle('monitor.probeEnabled');
    const save = [...document.querySelectorAll<HTMLButtonElement>('button')].find(b => b.textContent === 'save')!;
    expect(save.disabled).toBe(false);
    await act(async () => save.click());
    expect(api.saveMonitoring).toHaveBeenCalledWith(expect.objectContaining({ probe: expect.objectContaining({ enabled: true }), speed: expect.objectContaining({ enabled: false }) }));
});

it('explains that measurements wait for policy readiness without changing saved enablement', async () => {
    const status = await api.getMonitoring();
    api.getMonitoring.mockResolvedValue({ ...status, policyState: 'waiting' });
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><MonitoringSettings /></SWRConfig>));
    await act(async () => [...host.querySelectorAll('button')].find(b => b.textContent === 'monitor.defaults')!.click());
    expect(document.querySelector('[role="alert"]')?.textContent).toBe('monitor.policyStates.waiting');
    expect(api.saveMonitoring).not.toHaveBeenCalled();
});

it('shows shared admission status and the inclusive daily budget explanation', async () => {
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><MonitoringSettings /></SWRConfig>));
    await act(async () => [...host.querySelectorAll('button')].find(b => b.textContent === 'monitor.defaults')!.click());
    expect(document.querySelector('[data-testid="measurement-slots"]')?.textContent).toBe('2 / 4');
    expect(document.body.textContent).toContain('auto.budgetHint');
    expect(api.saveMonitoring).not.toHaveBeenCalled();
});
