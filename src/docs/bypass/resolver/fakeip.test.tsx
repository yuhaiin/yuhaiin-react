import { confirmAction } from '@/component/v2/confirmation';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { SWRConfig } from 'swr';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { FakeIPList } from './fakeip';

const api = vi.hoisted(() => ({ listFakeIPEntries: vi.fn(), deleteFakeIPEntry: vi.fn() }));
vi.mock('@/api/resolvers', () => api);
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string, values?: { domain: string; ip: string }) => values?.domain ? `${key} ${values.domain} ${values.ip}` : key }) }));
vi.mock('@/component/v2/confirmation', () => ({ confirmAction: vi.fn(async () => true) }));
let root: Root, host: HTMLDivElement;
let items: { domain: string; ip: string }[];
beforeEach(() => {
    vi.clearAllMocks();
    items = Array.from({ length: 51 }, (_, index) => ({ domain: `host-${String(index).padStart(2, '0')}.example`, ip: `198.18.0.${index}` }));
    api.listFakeIPEntries.mockImplementation(async (page: number, size: number, query: string) => {
        const filtered = items.filter(item => item.domain.includes(query) || item.ip === query);
        return { items: filtered.slice((page - 1) * size, page * size), page: { page, pageSize: size, total: filtered.length } };
    });
    api.deleteFakeIPEntry.mockImplementation(async (entry: typeof items[0]) => {
        items = items.filter(item => item.domain !== entry.domain || item.ip !== entry.ip);
        return { removed: 1 };
    });
    host = document.createElement('div'); document.body.append(host); root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); vi.restoreAllMocks(); vi.useRealTimers(); });
async function render() { await act(async () => root.render(<SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}><FakeIPList /></SWRConfig>)); }
async function click(label: string) {
    const button = [...document.querySelectorAll('button')].find(button => button.getAttribute('aria-label') === label || button.textContent?.trim() === label);
    if (!button) throw Error('Missing ' + label);
    await act(async () => button.click());
}
function change(value: string) {
    const input = host.querySelector('input')!;
    act(() => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value); input.dispatchEvent(new Event('input', { bubbles: true })); });
}

it('requests only the active page and resets to page one with debounced server search', async () => {
    await render();
    expect(api.listFakeIPEntries).toHaveBeenCalledWith(1, 25, '');
    expect(host.querySelectorAll('li')).toHaveLength(25);
    await click('pagination.next');
    expect(api.listFakeIPEntries).toHaveBeenLastCalledWith(2, 25, '');
    vi.useFakeTimers();
    change('198.18.0.50');
    expect(api.listFakeIPEntries).toHaveBeenLastCalledWith(2, 25, '');
    await act(async () => { await vi.advanceTimersByTimeAsync(250); });
    expect(api.listFakeIPEntries).toHaveBeenLastCalledWith(1, 25, '198.18.0.50');
    expect(host.querySelectorAll('li')).toHaveLength(1);
    expect(host.textContent).toContain('host-50.example');
});

it('confirms exact mapping deletion and returns to the last valid page', async () => {
    await render(); await click('pagination.next'); await click('pagination.next');
    expect(host.querySelectorAll('li')).toHaveLength(1);
    vi.mocked(confirmAction).mockResolvedValueOnce(false);
    await click('deleteFakeIPMapping host-50.example 198.18.0.50');
    expect(api.deleteFakeIPEntry).not.toHaveBeenCalled();
    vi.mocked(confirmAction).mockResolvedValue(true);
    await click('deleteFakeIPMapping host-50.example 198.18.0.50');
    expect(api.deleteFakeIPEntry).toHaveBeenCalledExactlyOnceWith({ domain: 'host-50.example', ip: '198.18.0.50' });
    expect(api.listFakeIPEntries).toHaveBeenLastCalledWith(2, 25, '');
    expect(host.querySelectorAll('li')).toHaveLength(25);
    expect(host.textContent).not.toContain('host-50.example');
});

it('retains entries after a failed delete and supports retry after a failed query', async () => {
    api.listFakeIPEntries.mockRejectedValueOnce({ code: 503, msg: 'FakeIP unavailable' });
    await render();
    expect(host.textContent).toContain('FakeIP unavailable');
    await click('action.retry');
    expect(host.querySelectorAll('li')).toHaveLength(25);
    api.deleteFakeIPEntry.mockRejectedValueOnce({ msg: 'Delete failed' });
    vi.mocked(confirmAction).mockResolvedValue(true);
    await click('deleteFakeIPMapping host-00.example 198.18.0.0');
    expect(host.textContent).toContain('host-00.example');
});
