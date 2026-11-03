import { expect, it, vi } from 'vitest';

vi.mock('uplot', () => ({ default: class {} }));
vi.mock('uplot/dist/uPlot.min.css', () => ({}));

const { chartMax, niceMax } = await import('./TrafficChartv2');

it('rounds the axis maximum to four round 1024-unit steps', () => {
    expect(niceMax(300 * 1024)).toBe(400 * 1024);
    expect(niceMax(30 * 1024)).toBe(40 * 1024);
    expect(niceMax(1.2 * 1024 ** 2)).toBe(2 * 1024 ** 2);
    expect(niceMax(0)).toBe(1024);
});

it('clips a lone burst instead of flattening the rest of the chart', () => {
    const quiet = Array.from({ length: 60 }, () => 20 * 1024);
    expect(chartMax([...quiet, 300 * 1024], quiet, 300 * 1024)).toBe(40 * 1024);
    expect(chartMax([10, 20], [30], 30)).toBe(niceMax(30));
});
