import { expect, it, vi } from 'vitest';

vi.mock('uplot', () => ({ default: class {} }));
vi.mock('uplot/dist/uPlot.min.css', () => ({}));

const { niceMax } = await import('./TrafficChartv2');

it('rounds the axis maximum to four round 1024-unit steps', () => {
    expect(niceMax(300 * 1024)).toBe(400 * 1024);
    expect(niceMax(30 * 1024)).toBe(40 * 1024);
    expect(niceMax(1.2 * 1024 ** 2)).toBe(2 * 1024 ** 2);
    expect(niceMax(0)).toBe(1024);
});

it('keeps the largest sample inside the axis', () => {
    for (const peak of [300 * 1024, 391 * 1024, 1000 * 1024, 1.2 * 1024 ** 2]) expect(niceMax(peak)).toBeGreaterThanOrEqual(peak);
});
