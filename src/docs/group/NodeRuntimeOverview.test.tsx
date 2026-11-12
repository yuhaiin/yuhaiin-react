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
it('moves a recovered connection error into collapsed history and alerts on a new failure', () => {
    const failure = { ...status, state: 'degraded' as const, lastError: 'write on closed stream 1148', lastFailureAt: 100 };
    act(() => root.render(<NodeRuntimeOverview status={failure} />));
    expect(host.querySelector('[role="alert"]')?.textContent).toContain(failure.lastError);
    for (const state of ['healthy', 'unknown', 'disabled'] as const) {
        act(() => root.render(<NodeRuntimeOverview status={{ ...failure, state, lastSuccessAt: 200 }} />));
        expect(host.querySelector('[role="alert"]')).toBeNull();
        const history = host.querySelector<HTMLDetailsElement>('[data-testid="outbound-error-history"]');
        expect(history?.open).toBe(false);
        expect(history?.textContent).toContain(failure.lastError);
        expect(history?.textContent).toContain(new Date(100000).toLocaleString());
    }
    act(() => root.render(<NodeRuntimeOverview status={{ ...failure, lastError: 'new failure' }} />));
    expect(host.querySelector('[role="alert"]')?.textContent).toContain('new failure');
});
it('still alerts on a native protocol failure while passive connections are healthy', () => {
    act(() => root.render(<NodeRuntimeOverview status={{ ...status, lastError: 'old reset', protocol: { state: 'failed', lastError: 'native tunnel session failed', updatedAt: 123 } }} />));
    expect(host.querySelector('[role="alert"]')?.textContent).toContain('native tunnel session failed');
    expect(host.querySelector('[role="alert"]')?.textContent).not.toContain('old reset');
});
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

it('separates current traffic, actual mean coverage and target-specific measurements', () => {
    act(() => root.render(<NodeRuntimeOverview status={{ ...status,
        trafficWindow: { at: 1000, windowMs: 15000, uploadBps: '1024', downloadBps: '2048' },
        recentTcpDials: { windowMs: 120000, sampleLimit: 64, samples: 4, failures: 1, failureRate: .25 },
        throughput: { direction: 'download', at: 2000, ok: true, downloadMbps: 80, bytes: 8192, durationMs: 100, samples: 3, target: 'https://download.example/test' },
        uploadThroughput: { direction: 'upload', at: 3000, ok: true, downloadMbps: 0, uploadMbps: 25, bytes: 8192, durationMs: 100, samples: 2, target: 'https://upload.example/test' },
    }} />));
    const details = host.querySelector<HTMLDetailsElement>('[data-testid="node-measurement-summary"]')!;
    expect(details.open).toBe(false);
    expect(details.textContent).toContain('1.0 KiB/s');
    expect(details.textContent).toContain('2.0 KiB/s');
    expect(details.textContent).toContain('25.0% (1 / 4)');
    expect(details.textContent).toContain('80.00 Mbps (3)');
    expect(details.textContent).toContain('25.00 Mbps (2)');
    expect(details.textContent).toContain('https://upload.example/test');
    expect(details.textContent).toContain('outboundMeasurementSeparation');
    expect(host.textContent).toContain('outboundUploadSpeed');
});
it('handles old servers and failed measurements without inventing zero error rates or capacity', () => {
    act(() => root.render(<NodeRuntimeOverview status={{ ...status, uploadThroughput: { at: 3000, ok: false, downloadMbps: 0, uploadMbps: 999, bytes: 0, durationMs: 0, samples: 0, target: 'https://upload.example/test' } }} />));
    const details = host.querySelector('[data-testid="node-measurement-summary"]')!;
    expect(details.textContent).toContain('outboundNoTrafficWindow');
    expect(details.textContent).toContain('loadFailed');
    expect(details.textContent).not.toContain('999');
    expect(details.textContent).not.toContain('outboundRecentDialFailures');
});
