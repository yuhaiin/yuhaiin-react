import { authorizeTest, resetTestAuth } from '@/test/auth';
import { confirmAction } from '@/component/v2/confirmation';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { SWRConfig } from 'swr';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { allowNavigation } from '@/hooks/navigation-guard';
import { Hosts } from './hosts';

const api = vi.hoisted(() => ({ listHostEntries: vi.fn(), saveHostEntry: vi.fn(), deleteHostEntry: vi.fn() }));
vi.mock('@/api/resolvers', () => api);
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string, values?: { host: string }) => values?.host ? `${key} ${values.host}` : key }) }));
let root: Root, host: HTMLDivElement;
let items: { host: string; target: string }[];
beforeEach(() => {
    vi.clearAllMocks();
    items = Array.from({ length: 41 }, (_, index) => ({ host: `host-${String(index).padStart(2, '0')}.example`, target: '192.0.2.1' }));
    api.listHostEntries.mockImplementation(async (page: number, size: number, query: string) => {
        const filtered = items.filter(item => item.host.includes(query));
        return { items: filtered.slice((page - 1) * size, page * size), page: { page, pageSize: size, total: filtered.length } };
    });
    api.saveHostEntry.mockImplementation(async (next: typeof items[0]) => { items = items.map(item => item.host === next.host ? next : item); return next; });
    api.deleteHostEntry.mockImplementation(async (name: string) => { items = items.filter(item => item.host !== name); });
    host = document.createElement('div'); document.body.append(host); root = createRoot(host);
});
beforeEach(authorizeTest);
afterEach(() => { act(() => root.unmount()); host.remove(); vi.restoreAllMocks(); });
async function render() { await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><Hosts /></SWRConfig>)); }
async function click(label: string) {
    const button = [...document.querySelectorAll('button')].find(button => button.getAttribute('aria-label') === label || button.textContent?.trim() === label);
    if (!button) throw Error('Missing ' + label);
    await act(async () => button.click());
}
function change(input: HTMLInputElement, value: string) {
    act(() => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value); input.dispatchEvent(new Event('input', { bubbles: true })); });
}

it('loads server pages, retains a failed edit, and saves just the selected entry', async () => {
    await render();
    expect(api.listHostEntries).toHaveBeenCalledWith(1, 20, '');
    expect(host.querySelectorAll('li')).toHaveLength(20);
    await click('pagination.next');
    expect(api.listHostEntries).toHaveBeenLastCalledWith(2, 20, '');
    await click('editHostMapping host-20.example');
    const target = document.querySelector<HTMLInputElement>('[role=dialog] input[value="192.0.2.1"]')!;
    change(target, 'alias.example');
    api.saveHostEntry.mockRejectedValueOnce({ msg: 'Retry this entry' });
    await click('save');
    expect(document.querySelector('[role=alert]')?.textContent).toBe('Retry this entry');
    expect(target.value).toBe('alias.example');
    vi.mocked(confirmAction).mockResolvedValue(false);
    expect(await allowNavigation()).toBe(false);
    await click('save');
    expect(api.saveHostEntry).toHaveBeenLastCalledWith({ host: 'host-20.example', target: 'alias.example' }, false);
    expect(items[0].target).toBe('192.0.2.1');
    expect(host.textContent).toContain('alias.example');
});

it('refetches the last valid server page after its only entry is removed', async () => {
    await render(); await click('pagination.next'); await click('pagination.next');
    expect(host.querySelectorAll('li')).toHaveLength(1);
    vi.mocked(confirmAction).mockResolvedValue(true);
    await click('deleteHostMapping host-40.example');
    expect(api.deleteHostEntry).toHaveBeenCalledExactlyOnceWith('host-40.example');
    expect(api.listHostEntries).toHaveBeenLastCalledWith(2, 20, '');
    expect(host.querySelectorAll('li')).toHaveLength(20);
});

vi.mock('@/component/v2/confirmation', () => ({ confirmAction: vi.fn(async () => true) }));

afterEach(resetTestAuth);
