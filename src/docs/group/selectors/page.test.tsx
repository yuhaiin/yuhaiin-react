import { confirmAction } from '@/component/v2/confirmation';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { SWRConfig } from 'swr';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { normalizeNode, type Selector } from '@/contract/node';
import { GlobalToastContext } from '@/component/v2/toast';
import SelectorsPage from './page';

const api = vi.hoisted(() => ({ listSelectors: vi.fn(), saveSelector: vi.fn(), deleteSelector: vi.fn(), selectorReferences: vi.fn(), getNode: vi.fn(), listNodeGroups: vi.fn(), listNodes: vi.fn() }));
const viewport = vi.hoisted(() => ({ desktop: true }));
vi.mock('@/api/selectors', () => api);
vi.mock('@/api/nodes', () => api);
vi.mock('@/docs/node/modal', () => ({ NodeModal: () => null }));
vi.mock('@/hooks/use-media-query', () => ({ useMediaQuery: () => viewport.desktop }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
let host: HTMLDivElement;
let root: Root;
let selectors: Selector[];
beforeEach(() => {
    vi.clearAllMocks(); viewport.desktop = true;
    window.history.replaceState(null, '', '#/docs/group/selectors');
    selectors = [{ id: 'work', name: 'Work', nodeId: 'a', revision: 1 }, { id: 'travel', name: 'Travel', nodeId: 'b', revision: 1 }];
    api.listSelectors.mockImplementation(async () => ({ items: [...selectors] }));
    api.saveSelector.mockImplementation(async (item: Selector) => { const saved = { ...item, revision: item.revision + 1 }; selectors = selectors.map(value => value.id === item.id ? saved : value); return saved; });
    api.selectorReferences.mockResolvedValue({ items: [] });
    api.getNode.mockImplementation(async id => normalizeNode({ id, name: `Node ${id}`, group: 'manual', enabled: true }));
    api.listNodeGroups.mockResolvedValue({ items: [{ name: 'manual', count: 10000, enabled: 10000 }] });
    api.listNodes.mockResolvedValue({ items: [normalizeNode({ id: 'c', name: 'Node c', group: 'manual', enabled: true })], page: { page: 1, pageSize: 40, total: 10000 } });
    host = document.createElement('div'); document.body.append(host); root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); vi.restoreAllMocks(); });
async function render() {
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}><GlobalToastContext.Provider value={{ Info: vi.fn(), Error: vi.fn() }}><SelectorsPage /></GlobalToastContext.Provider></SWRConfig>));
}
function editor() { return host.querySelector('section[aria-label="selectorDetails"]'); }
async function click(text: string) {
    const button = [...document.querySelectorAll<HTMLButtonElement>('button')].find(button => button.getAttribute('aria-label') === text || button.textContent?.trim() === text);
    if (!button) throw Error(`Missing button ${text}`);
    await act(async () => button.click());
}
function editName(name: string) {
    const input = editor()!.querySelector<HTMLInputElement>('input')!;
    act(() => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, name); input.dispatchEvent(new Event('input', { bubbles: true })); });
}
it('guards inline switching and retains the saved shared destination', async () => {
    await render(); expect(editor()?.textContent).toContain('Work');
    expect(api.listNodes).not.toHaveBeenCalled(); expect(api.listNodeGroups).not.toHaveBeenCalled();
    editName('Changed'); const confirm = vi.mocked(confirmAction).mockResolvedValue(false);
    await click('Travel'); expect(editor()?.querySelector('input')?.value).toBe('Changed');
    confirm.mockResolvedValue(true); await click('Travel'); expect(editor()?.querySelector('input')?.value).toBe('Travel');
    editName('Updated travel'); await click('save');
    expect(api.saveSelector).toHaveBeenCalledWith(expect.objectContaining({ id: 'travel', name: 'Updated travel', nodeId: 'b' }));
    expect(editor()?.querySelector('input')?.value).toBe('Updated travel');
    expect(host.querySelector('[aria-label="Updated travel"]')?.getAttribute('aria-current')).toBe('true');
});
it('uses the lazy group browser and saves the selected node ID', async () => {
    await render(); await click('selectedNode');
    expect(api.listNodes).toHaveBeenCalledExactlyOnceWith({ page: 1, pageSize: 40, group: 'manual', query: '', enabledOnly: true });
    await click('Node c'); await click('save');
    expect(api.saveSelector).toHaveBeenCalledWith(expect.objectContaining({ id: 'work', nodeId: 'c' }));
});
it('opens the editor from the mobile directory and guards returning', async () => {
    viewport.desktop = false; await render(); expect(editor()).toBeNull();
    await click('Travel'); editName('Changed'); vi.mocked(confirmAction).mockResolvedValue(false);
    await click('backToSelectors'); expect(editor()).not.toBeNull();
});

vi.mock('@/component/v2/confirmation', () => ({ confirmAction: vi.fn(async () => true) }));
