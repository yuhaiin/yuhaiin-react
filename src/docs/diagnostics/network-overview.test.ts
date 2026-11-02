import { describe, expect, it } from 'vitest';
import type { TCPStackDiagnostic } from '@/contract/tools';
import { formatBytes, formatCounter, stackScopeSummary } from './network-overview';

function stack(scope: string, retransmissions: number, drops: number): TCPStackDiagnostic {
    return { scope, inboundId: scope === 'inbound' ? 'tun' : '', nodeId: scope === 'outbound' ? 'vpn' : '',
        mtu: 1500, flows: [], statistics: {
            connections: 1, memoryBytes: 0, packetsIn: 0, packetsOut: 0,
            retransmissions, drops, rstSent: 1, rstReceived: 2,
            invalidInputDrops: 0, rateLimitedDrops: 0, outputAqmDrops: 0,
            outputRejected: 0, outputOverloadDrops: 0, outputQueuedPackets: 0, outputQueuedBytes: 0,
        },
    };
}

describe('network overview', () => {
    it('does not double-count traffic crossing an inbound and outbound stack', () => {
        const stacks = [stack('inbound', 3, 2), stack('outbound', 3, 2)];
        expect(stackScopeSummary(stacks, 'inbound')).toMatchObject({ covered: 1, retransmissions: 3, drops: 2 });
        expect(stackScopeSummary(stacks, 'outbound')).toMatchObject({ covered: 1, retransmissions: 3, drops: 2 });
    });

    it('separates missing data from genuine zero counters', () => {
        expect(formatCounter(undefined)).toBe('—');
        expect(formatBytes(undefined)).toBe('—');
        expect(formatBytes('0')).toBe('0 B');
    });

    it('formats 64-bit byte counters without floating point rounding', () => {
        expect(formatCounter('9007199254740993')).toContain('9,007,199,254,740,993');
        expect(formatBytes('1048576')).toBe('1.0 MiB');
    });
});
