import { expect, it, vi } from 'vitest';
import { importNodeBatch, parseNodeImport } from './node-import';

it.each(['null', '42', '{}', '[]', '{"chain":[{"type":"unknown"}]}'])('rejects invalid import %s', value => {
    expect(() => parseNodeImport(value, 'manual')).toThrow();
});

it('bounds concurrent requests, retains partial successes and retries only failures', async () => {
    const nodes = parseNodeImport(JSON.stringify(Array.from({ length: 12 }, (_, index) => ({
        id: String(index), name: String(index), chain: [{ type: 'direct', direct: {} }],
    }))), 'manual');
    let concurrent = 0;
    let peak = 0;
    const create = vi.fn(async (node: typeof nodes[number]) => {
        peak = Math.max(peak, ++concurrent);
        await Promise.resolve();
        concurrent--;
        if (node.id === '2') throw new Error('Failed');
    });
    const first = await importNodeBatch(nodes, create);
    expect(peak).toBeLessThanOrEqual(4);
    expect(first.filter(result => result.status === 'success')).toHaveLength(11);
    const retry = vi.fn(async () => undefined);
    const second = await importNodeBatch(nodes, retry, first);
    expect(retry).toHaveBeenCalledExactlyOnceWith(nodes[2]);
    expect(second.every(result => result.status === 'success')).toBe(true);
});
