import { expect, it } from 'vitest';
import { normalizeConnection } from '@/contract/connection';
import { applyConnectionEvents } from './connection-events';

it('applies snapshots and ordered deltas together while retaining unchanged rows', () => {
    const first = normalizeConnection({ id: '1', addr: 'first' });
    const stale = normalizeConnection({ id: '2' });
    const third = normalizeConnection({ id: '3' });
    const previous = { '1': first, '2': stale };
    const next = applyConnectionEvents(previous, [
        { type: 'snapshot', connections: [{ ...first }] },
        { type: 'added', connections: [third] },
        { type: 'removed', ids: ['3'] },
    ]);
    expect(Object.keys(next)).toEqual(['1']);
    expect(next['1']).toBe(first);
    expect(previous['2']).toBe(stale);
    expect(applyConnectionEvents(next, [{ type: 'added', connections: [{ ...first }] }])).toBe(next);
});
