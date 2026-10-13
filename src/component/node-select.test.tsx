import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { SWRConfig } from 'swr';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { normalizeNode } from '@/contract/node';
import { NodeSelect } from './node-select';

const api = vi.hoisted(() => ({ getNode: vi.fn(), listNodeGroups: vi.fn(), listNodes: vi.fn() }));
vi.mock('@/api/nodes', () => api);
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
let host: HTMLDivElement;
let root: Root;
const onChange = vi.fn();
const first = normalizeNode({ id: 'a', name: 'First node', group: 'manual', enabled: true });
const second = normalizeNode({ id: 'b', name: 'Second node', group: 'manual', enabled: true });
beforeEach(() => {
    vi.clearAllMocks();
    api.getNode.mockResolvedValue(first);
    api.listNodeGroups.mockResolvedValue({ items: [{ name: 'manual', count: 41, enabled: 41 }, { name: 'work', count: 9000, enabled: 9000 }] });
    api.listNodes.mockImplementation(async ({ page, query }) => ({ items: page === 2 || query ? [second] : [first], page: { page, pageSize: 40, total: query ? 1 : 41 } }));
    host = document.createElement('div'); document.body.append(host); root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); });
async function render() {
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><NodeSelect label="Destination" value="a" onChange={onChange} /></SWRConfig>));
}
async function click(label: string) {
    const button = [...document.querySelectorAll<HTMLButtonElement>('button')].find(button => button.getAttribute('aria-label') === label || button.textContent?.trim() === label);
    if (!button) throw Error(`Missing button ${label}`);
    await act(async () => button.click());
}
it('reads only the selected node until opened, then loads one group page at a time', async () => {
    await render();
    expect(host.textContent).toContain('First node');
    expect(api.getNode).toHaveBeenCalledExactlyOnceWith('a');
    expect(api.listNodeGroups).not.toHaveBeenCalled(); expect(api.listNodes).not.toHaveBeenCalled();
    await click('Destination');
    expect(api.listNodes).toHaveBeenCalledExactlyOnceWith({ page: 1, pageSize: 40, group: 'manual', query: '', enabledOnly: true });
    await click('nextPage');
    expect(api.listNodes).toHaveBeenLastCalledWith({ page: 2, pageSize: 40, group: 'manual', query: '', enabledOnly: true });
    await click('Second node'); expect(onChange).toHaveBeenCalledExactlyOnceWith(second);
    expect(api.listNodes.mock.calls.some(([request]) => request.group === 'work')).toBe(false);
});
it('searches the whole selected group on the server and resets pagination', async () => {
    await render(); await click('Destination'); await click('nextPage');
    const input = document.querySelector<HTMLInputElement>('input[aria-label="nodeSearch"]')!;
    act(() => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'Second'); input.dispatchEvent(new Event('input', { bubbles: true })); });
    await click('searchNodes');
    expect(api.listNodes).toHaveBeenLastCalledWith({ page: 1, pageSize: 40, group: 'manual', query: 'Second', enabledOnly: true });
    expect(document.querySelector('button[aria-label="Destination"]')?.textContent).toContain('First node');
});
