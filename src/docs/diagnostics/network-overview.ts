import type { TCPStackDiagnostic } from '@/contract/tools';

// Counts are only combined within a single observation layer. Traffic from an
// inbound can cross an outbound and MUST NOT be added twice.
export function stackScopeSummary(stacks: TCPStackDiagnostic[], scope: 'inbound' | 'outbound') {
    const matched = stacks.filter(s => (s.scope || 'inbound') === scope);
    return {
        covered: matched.length,
        retransmissions: matched.reduce((sum, stack) => sum + stack.statistics.retransmissions, 0),
        drops: matched.reduce((sum, stack) => sum + stack.statistics.drops, 0),
        rstSent: matched.reduce((sum, stack) => sum + stack.statistics.rstSent, 0),
        rstReceived: matched.reduce((sum, stack) => sum + stack.statistics.rstReceived, 0),
    };
}

// Full-size counter strings are never converted through JS Number.
export function formatCounter(raw: string | undefined): string {
    if (raw === undefined) return '—';
    try {
        return BigInt(raw).toLocaleString();
    } catch {
        return raw;
    }
}

export function formatBytes(raw: string | undefined): string {
    if (raw === undefined) return '—';
    try {
        let bytes = BigInt(raw);
        if (bytes < 0n) return raw;
        const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
        let unit = 0;
        let scale = 1n;
        while (unit + 1 < units.length && bytes >= scale * 1024n) {
            scale *= 1024n;
            unit++;
        }
        if (unit === 0) return `${bytes.toLocaleString()} B`;
        const tenths = bytes * 10n / scale;
        return `${(tenths / 10n).toLocaleString()}.${tenths % 10n} ${units[unit]}`;
    } catch {
        return raw;
    }
}
