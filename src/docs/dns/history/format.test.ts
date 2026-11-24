import { describe, expect, it } from 'vitest';
import { activeFilterCount, clientAddress, emptyFilters, failedOutcomes, formatLatency, outcomeTone, processName, toRequestFilter } from './format';

describe('DNS history formatting', () => {
    it('separates delivered answers from failures', () => {
        expect(failedOutcomes).not.toContain('nxdomain');
        expect(failedOutcomes).toContain('servfail');
        expect(outcomeTone('success')).toBe('success');
        expect(outcomeTone('nxdomain')).toBe('neutral');
        expect(outcomeTone('timeout')).toBe('danger');
        expect(outcomeTone('refused')).toBe('warning');
    });
    it('formats latency across units', () => {
        expect(formatLatency(4_200)).toBe('4.2 µs');
        expect(formatLatency(2_500_000)).toBe('2.5 ms');
        expect(formatLatency(25_000_000)).toBe('25 ms');
        expect(formatLatency(3_000_000_000)).toBe('3.00 s');
        expect(formatLatency(undefined)).toBe('—');
    });
    it('formats clients and processes', () => {
        expect(clientAddress({ clientIp: '2001:db8::1', clientPort: 53 })).toBe('[2001:db8::1]:53');
        expect(clientAddress({ clientIp: '10.0.0.2', clientPort: 0 })).toBe('10.0.0.2');
        expect(processName('C:\\Program Files\\App\\app.exe')).toBe('app');
        expect(processName('/usr/bin/curl')).toBe('curl');
    });
    it('turns the filter state into a request with a fixed time window', () => {
        const filters = { ...emptyFilters, queryType: 'AAAA', range: '1h' as const };
        expect(activeFilterCount(filters)).toBe(2);
        expect(toRequestFilter(filters, 'x', 10_000_000)).toMatchObject({ queryType: 'AAAA', query: 'x', from: 10_000_000 - 3600_000 });
        expect(toRequestFilter({ ...emptyFilters, range: 'all' }, '', 1).from).toBeUndefined();
    });
});
