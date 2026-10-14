import { expect, it } from 'vitest';
import { formatTrafficTicks } from './format';

it('distinguishes low and sub-byte traffic ticks, including idle axes', () => {
    for (const ticks of [[0, 0.2, 0.4, 0.6, 0.8, 1], [0, 0.00002, 0.00004], [0, 1e-9, 2e-9]]) {
        const labels = formatTrafficTicks(ticks, '/s');
        expect(new Set(labels).size).toBe(ticks.length);
        expect(labels[0]).toBe('0 B/s');
    }
});
it('keeps one unit across a burst axis and at unit boundaries', () => {
    const labels = formatTrafficTicks([0, 512, 1024, 1536, 2048], '/s');
    expect(labels).toEqual(['0 KB/s', '0.5 KB/s', '1.0 KB/s', '1.5 KB/s', '2.0 KB/s']);
    expect(formatTrafficTicks([0, 256, 512, 768, 1023]).every(label => label.endsWith(' B'))).toBe(true);
    expect(new Set(formatTrafficTicks([0, 1024 ** 3 / 4, 1024 ** 3 / 2, 1024 ** 3])).size).toBe(4);
});
it('handles duplicate ticks and a single zero tick without invalid labels', () => {
    expect(formatTrafficTicks([0])).toEqual(['0 B']);
    expect(formatTrafficTicks([])).toEqual([]);
    expect(formatTrafficTicks([0, 1, 1])).toEqual(['0 B', '1 B', '1 B']);
});
