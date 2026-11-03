import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import type { OutboundRuntimeStatus } from '@/api/node-observability';
import { getNodeStatuses } from '@/api/node-observability';
import { TCPStackPanel } from './tcp-stack';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/component/v2/button', () => ({ Button: ({ children, onClick, disabled }: React.ComponentProps<'button'>) => <button onClick={onClick} disabled={disabled}>{children}</button> }));
vi.mock('@/api/tools', () => ({ getTCPStackDiagnostics: async () => ({ startedAt: '2026-11-03T00:00:00Z', tcpStacks: [] }) }));
vi.mock('@/api/connections', () => ({ getTotalFlow: async () => ({}), getConnections: async () => ({ connections: [] }) }));
vi.mock('@/api/inbounds', () => ({ listInboundStatuses: async () => [] }));
vi.mock('@/api/nodes', () => ({ activeNodes: async () => ({ items: [{ id: 'a', name: 'masque', chain: [] }] }), selectedNodes: async () => ({}) }));
vi.mock('@/api/node-observability', () => ({ getNodeStatuses: vi.fn() }));

let host: HTMLDivElement;
let root: Root;
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
    await act(async () => host.querySelector('button')!.click());
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
