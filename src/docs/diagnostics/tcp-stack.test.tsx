import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { getConnections, getTotalFlow } from '@/api/connections';
import { normalizeConnection } from '@/contract/connection';
import type { OutboundRuntimeStatus } from '@/api/node-observability';
import { getNodeStatuses } from '@/api/node-observability';
import { TCPStackPanel } from './tcp-stack';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string, options?: { shown: number; total: number }) => options?.shown !== undefined ? `${key} (${options.shown} / ${options.total})` : key }) }));
vi.mock('@/component/v2/button', () => ({ Button: ({ children, onClick, disabled }: React.ComponentProps<'button'>) => <button onClick={onClick} disabled={disabled}>{children}</button> }));
vi.mock('@/api/tools', () => ({ getTCPStackDiagnostics: async () => ({ startedAt: '2026-11-03T00:00:00Z', tcpStacks: [] }) }));
vi.mock('@/api/connections', () => ({ getTotalFlow: vi.fn(), getConnections: vi.fn() }));
vi.mock('@/api/inbounds', () => ({ listInboundStatuses: async () => [] }));
vi.mock('@/api/nodes', () => ({ activeNodes: async () => ({ items: [{ id: 'a', name: 'masque', chain: [] }] }), selectedNodes: async () => ({}) }));
vi.mock('@/api/node-observability', () => ({ getNodeStatuses: vi.fn() }));

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
    vi.stubGlobal('matchMedia', () => ({ matches: true, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
    vi.mocked(getConnections).mockResolvedValue({ connections: [] });
    vi.mocked(getTotalFlow).mockResolvedValue({ upload: '0', download: '0', counters: {} });
});
afterEach(() => { act(() => root.unmount()); host.remove(); vi.clearAllMocks(); });
const status: OutboundRuntimeStatus = {
    id: 'a', state: 'degraded', uploadBytes: '1', downloadBytes: '2', uploadBps: '0', downloadBps: '0',
    udpSentPackets: '0', udpRecvPackets: '0', tcpAttempts: '1', tcpConnections: '1', udpAttempts: '0',
    udpSessions: '0', pingAttempts: '0', failures: '1', activeTCP: 0, activeUDP: 0,
    lastSuccessAt: 0, lastFailureAt: 100, lastUsedAt: 100, lastError: 'lightweight: connection reset by peer',
};
function mount() {
    host = document.createElement('div'); document.body.append(host); root = createRoot(host);
    act(() => root.render(<TCPStackPanel />));
}
async function refresh(value: OutboundRuntimeStatus) {
    vi.mocked(getNodeStatuses).mockResolvedValue({ a: value });
    await act(async () => [...host.querySelectorAll('button')].find(button => button.textContent?.includes('tcp.snapshot'))!.click());
}
it('moves recovered outbound errors into collapsed history on the next snapshot', async () => {
    mount();
    await refresh(status);
    expect(host.querySelector('[role="alert"]')?.textContent).toContain(status.lastError);
    for (const state of ['healthy', 'unknown', 'disabled'] as const) {
        await refresh({ ...status, state, lastSuccessAt: 200 });
        expect(host.querySelector('[role="alert"]')).toBeNull();
        const history = host.querySelector<HTMLDetailsElement>('[data-testid="outbound-error-history"]');
        expect(history?.open).toBe(false);
        expect(history?.textContent).toContain(status.lastError);
    }
    await refresh({ ...status, lastError: 'new failure' });
    expect(host.querySelector('[role="alert"]')?.textContent).toContain('new failure');
});
it('shows native failures independently of passive connection health', async () => {
    mount();
    await refresh({ ...status, state: 'healthy', protocol: { state: 'failed', lastError: 'native tunnel session failed', updatedAt: 200 } });
    expect(host.querySelector('[role="alert"]')?.textContent).toContain('native tunnel session failed');
});

it('shows UDP sources and counters for the matching node without requiring a TCP stack', async () => {
    const udp = normalizeConnection({ id: '114', nodeId: 'a', source: '192.168.1.20:50000', inboundName: 'LAN', addr: '172.16.102.14:2598', localAddr: '10.0.0.2:60000', network: { connType: 'udp', underlyingType: '' } });
    vi.mocked(getConnections).mockResolvedValue({ connections: [
        udp,
        { ...udp, id: '115', source: '192.168.1.20:50001', inboundName: '', inboundId: 'lan-id' },
        { ...udp, id: '116', nodeId: 'other-node', source: 'other-node-source' },
        { ...udp, id: '117', source: 'tcp-source', network: { connType: 'tcp', underlyingType: '' } },
    ] });
    vi.mocked(getTotalFlow).mockResolvedValue({ upload: '999999', download: '999999', counters: { '114': { upload: '1024', download: '2048' } } });
    mount();
    expect(getConnections).not.toHaveBeenCalled();
    await refresh(status);
    const sessions = host.querySelector('[data-testid="udp-sessions"]')!;
    expect(sessions.textContent).toContain('tcp.udpSessions (2 / 2)');
    expect(sessions.textContent).toContain(udp.source);
    expect(sessions.textContent).toContain('192.168.1.20:50001');
    expect(sessions.textContent).toContain(udp.addr);
    expect(sessions.textContent).toContain(udp.localAddr);
    expect(sessions.textContent).toContain('LAN');
    expect(sessions.textContent).toContain('lan-id');
    expect(sessions.textContent).toContain('1.0 KiB');
    expect(sessions.textContent).toContain('2.0 KiB');
    expect(sessions.textContent).not.toContain('other-node-source');
    expect(sessions.textContent).not.toContain('tcp-source');
    expect(sessions.querySelectorAll('tbody tr')).toHaveLength(2);
    expect(sessions.querySelectorAll('tbody tr')[1].querySelectorAll('td')[3].textContent).toBe('—');
    vi.mocked(getConnections).mockResolvedValue({ connections: [] });
    await refresh(status);
    expect(host.textContent).toContain('tcp.noUdpSessions');
    expect(host.textContent).not.toContain(udp.source);
});

it('bounds UDP samples without merging sessions that share a source address', async () => {
    const udp = normalizeConnection({ nodeId: 'a', source: '[2001:db8::1]:50000', network: { connType: 'udp', underlyingType: '' } });
    vi.mocked(getConnections).mockResolvedValue({ connections: Array.from({ length: 33 }, (_, i) => ({ ...udp, id: String(i) })) });
    mount();
    await refresh(status);
    const sessions = host.querySelector('[data-testid="udp-sessions"]')!;
    expect(sessions.textContent).toContain('tcp.udpSessions (32 / 33)');
    expect(sessions.querySelectorAll('tbody tr')).toHaveLength(32);
    expect(sessions.textContent).toContain(udp.source);
});

it('distinguishes unavailable connections from an empty UDP session list', async () => {
    vi.mocked(getConnections).mockRejectedValue(new Error('permission denied'));
    mount();
    await refresh(status);
    expect(host.textContent).toContain('tcp.unavailableConnections');
    expect(host.textContent).not.toContain('tcp.noUdpSessions');
    expect(host.querySelector('[data-testid="udp-sessions"]')).toBeNull();
});

it('lists nodes with a status summary and switches to inbounds', async () => {
    mount();
    await refresh(status);
    const row = host.querySelector<HTMLButtonElement>('aside li button')!;
    expect(row.getAttribute('aria-current')).toBe('true');
    expect(row.textContent).toContain('masque');
    expect(row.textContent).toContain('↑0 B/s ↓0 B/s');
    expect(row.textContent).not.toContain('tcp.failures');
    await refresh({ ...status, failures: '4', uploadBps: '2048', trafficWindow: { at: 1, windowMs: 30000, uploadBps: '1024', downloadBps: '0' } });
    const updated = host.querySelector<HTMLButtonElement>('aside li button')!;
    expect(updated.textContent).toContain('↑1.0 KiB/s');
    expect(updated.textContent).toContain('tcp.failures +3');
    const inboundTab = [...host.querySelectorAll<HTMLButtonElement>('[role="radio"]')].find(tab => tab.textContent?.includes('tcp.inboundsTitle'))!;
    await act(async () => inboundTab.click());
    expect(host.textContent).toContain('tcp.noInbounds');
    expect(host.textContent).toContain('tcp.selectItem');
});

it('polls on the saved interval and pauses while the tab is hidden', async () => {
    vi.useFakeTimers();
    localStorage.setItem('diagnostics.tcp.autoRefresh', '5');
    vi.mocked(getNodeStatuses).mockResolvedValue({ a: status });
    try {
        mount();
        await act(async () => { await vi.advanceTimersByTimeAsync(0); });
        expect(getConnections).toHaveBeenCalledTimes(1);
        expect(host.textContent).toContain('masque');
        await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
        expect(getConnections).toHaveBeenCalledTimes(2);
        Object.defineProperty(document, 'hidden', { configurable: true, value: true });
        await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
        expect(getConnections).toHaveBeenCalledTimes(2);
    } finally {
        Object.defineProperty(document, 'hidden', { configurable: true, value: false });
        localStorage.removeItem('diagnostics.tcp.autoRefresh');
        vi.useRealTimers();
    }
});
