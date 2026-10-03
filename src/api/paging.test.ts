import { expect, it, vi } from 'vitest';
import { collectPages } from './paging';

it('collects every capped server page rather than silently truncating at 100 items', async () => {
    const fetch = vi.fn(async ({ page, pageSize }: { page: number; pageSize: number }) => ({
        items: Array.from({ length: Math.min(pageSize, 235 - (page - 1) * pageSize) }, (_, i) => (page - 1) * pageSize + i),
        page: { page, pageSize, total: 235 },
    }));
    const result = await collectPages(fetch);
    expect(result.items).toHaveLength(235);
    expect(result.items[234]).toBe(234);
    expect(fetch).toHaveBeenCalledTimes(3);
});

it('rejects inconsistent empty pages instead of looping forever', async () => {
    await expect(collectPages(async () => ({ items: [], page: { page: 1, pageSize: 100, total: 235 } }))).rejects.toThrow('empty page');
});
