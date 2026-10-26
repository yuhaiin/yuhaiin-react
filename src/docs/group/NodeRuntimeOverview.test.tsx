import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { OutboundRuntimeStatus } from '@/api/node-observability';
import { NodeRuntimeOverview } from './NodeRuntimeOverview';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
let host: HTMLDivElement;
let root: Root;
const status: OutboundRuntimeStatus = {
    id: 'a', state: 'healthy', uploadBytes: '1', downloadBytes: '2', uploadBps: '0', downloadBps: '0',
    udpSentPackets: '0', udpRecvPackets: '0', tcpAttempts: '1', tcpConnections: '1', udpAttempts: '0',
    udpSessions: '0', pingAttempts: '0', failures: '0', activeTCP: 0, activeUDP: 0,
    lastSuccessAt: 0, lastFailureAt: 0, lastUsedAt: 0,
};
beforeEach(() => { host = document.createElement('div'); document.body.append(host); root = createRoot(host); });
afterEach(() => { act(() => root.unmount()); host.remove(); });
it('keeps control configuration distinct from passive channel health and shows observation time', () => {
    act(() => root.render(<NodeRuntimeOverview status={{ ...status, protocol: { state: 'configured', updatedAt: 123 } }} />));
    expect(host.textContent).toContain('outboundState_healthy');
    expect(host.textContent).toContain('outboundNativeStates.configured');
    expect(host.textContent).toContain('outboundProtocolObservedAt');
    expect(host.querySelector('[data-testid="native-status-help"]')?.textContent).toBe('outboundNativeHelp');
    expect(host.querySelector('[role="alert"]')).toBeNull();
});
it('explains authentication state without replacing passive traffic statistics', () => {
    act(() => root.render(<NodeRuntimeOverview status={{ ...status, protocol: { state: 'authentication_failed', updatedAt: 123 } }} />));
    expect(host.textContent).toContain('outboundNativeStates.authentication_failed');
    expect(host.textContent).toContain('outboundTCPSuccess');
});
it('treats unfamiliar protocol states as unknown and supports servers without native state', () => {
    act(() => root.render(<NodeRuntimeOverview status={{ ...status, protocol: { state: 'untrusted-provider-state', updatedAt: 0 } }} />));
    expect(host.textContent).toContain('outboundNativeStates.unknown');
    expect(host.textContent).not.toContain('untrusted-provider-state');
    act(() => root.render(<NodeRuntimeOverview status={status} />));
    expect(host.querySelector('[data-testid="native-status-help"]')).toBeNull();
});
