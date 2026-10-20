import { confirmAction } from '@/component/v2/confirmation';
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { SWRConfig } from 'swr';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { normalizeNode, type Node } from '@/contract/node';
import { GlobalToastContext } from '@/component/v2/toast';
import Group from './page';

const api = vi.hoisted(() => ({ listNodeGroups: vi.fn(), listNodes: vi.fn(), getNode: vi.fn(), saveNode: vi.fn(), createNode: vi.fn(), deleteNode: vi.fn(), useNode: vi.fn(), selectedNodes: vi.fn(), latencyNode: vi.fn() }));
const statusApi = vi.hoisted(() => ({ getNodeStatuses: vi.fn() }));
const viewport = vi.hoisted(() => ({ desktop: true }));
vi.mock('@/api/nodes', () => api);
vi.mock('@/api/node-observability', () => statusApi);
vi.mock('@/hooks/use-media-query', () => ({ useMediaQuery: () => viewport.desktop }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('./NodeImportModal', () => ({ default: () => null }));
// Directory paging and draft behavior do not depend on layout virtualization.
vi.mock('virtua', () => ({ VList: ({ data, children }: { data: Node[]; children: (item: Node) => ReactNode }) => <div>{data.map(children)}</div> }));
// Use the real load/save/guard controller while keeping connection field widgets out of workspace tests.
vi.mock('../node/NodeEditor', () => ({
    NodeEditor: ({ value, onChange }: { value: Node; onChange: (patch: Partial<Node>) => void }) => <div><output>{value.name}</output><button onClick={() => onChange({ name: 'Changed' })}>Edit draft</button></div>,
    NodeProtocolChain: () => null,
}));
let host: HTMLDivElement;
let root: Root;
let nodes: Node[];
let defaultId: string;
beforeEach(() => {
    vi.clearAllMocks(); viewport.desktop = true; localStorage.clear(); defaultId = 'a';
    window.history.replaceState(null, '', '#/docs/group');
    nodes = ['a', 'b'].map((id, index) => normalizeNode({ id, name: index ? 'Second' : 'First', group: 'manual', enabled: true }));
    api.listNodeGroups.mockImplementation(async () => {
        const names = [...new Set(nodes.map(node => node.group || 'manual'))].sort();
        return { items: names.map(name => ({ name, count: nodes.filter(node => (node.group || 'manual') === name).length, enabled: nodes.filter(node => (node.group || 'manual') === name && node.enabled).length })) };
    });
    api.listNodes.mockImplementation(async ({ group, page, pageSize, query }: { group: string; page: number; pageSize: number; query: string }) => {
        const matches = nodes.filter(node => (node.group || 'manual') === group && (!query || node.name.toLowerCase().includes(query.toLowerCase())));
        return { items: matches.slice((page - 1) * pageSize, page * pageSize), page: { page, pageSize, total: matches.length } };
    });
    api.getNode.mockImplementation(async id => nodes.find(node => node.id === id));
    api.saveNode.mockImplementation(async (saved: Node) => { nodes = nodes.map(node => node.id === saved.id ? saved : node); return saved; });
    api.createNode.mockImplementation(async (saved: Node) => { nodes.push(saved); return saved; });
    api.deleteNode.mockImplementation(async id => { nodes = nodes.filter(node => node.id !== id); });
    api.useNode.mockImplementation(async id => { defaultId = id; });
    api.selectedNodes.mockImplementation(async () => ({ tcp: nodes.find(node => node.id === defaultId), udp: nodes.find(node => node.id === defaultId) }));
    api.latencyNode.mockResolvedValue({ ok: true, latencyMs: 42 });
    statusApi.getNodeStatuses.mockResolvedValue({});
    host = document.createElement('div'); document.body.append(host); root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); vi.restoreAllMocks(); });
async function render() {
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}><GlobalToastContext.Provider value={{ Info: vi.fn(), Error: vi.fn() }}><Group /></GlobalToastContext.Provider></SWRConfig>));
}
function settings() { return host.querySelector('section[aria-label="nodeSettings"]'); }
function button(label: string) {
    const matches = (button: HTMLElement) => button.getAttribute('aria-label') === label || button.textContent === label;
    const found = Array.from(settings()?.querySelectorAll<HTMLElement>('button,[role="menuitem"]') ?? []).find(matches) ?? Array.from(document.querySelectorAll<HTMLElement>('button,[role="menuitem"]')).find(matches);
    if (!found) throw new Error(`Missing button: ${label}`); return found;
}
async function click(label: string) { await act(async () => { const target = button(label); if (target.getAttribute('aria-haspopup') === 'menu') target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); else target.click(); }); }

it('guards switching nodes, retains drafts through search and keeps the saved node open', async () => {
    await render(); expect(settings()?.querySelector('output')?.textContent).toBe('First');
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    await click('Edit draft');
    const confirm = vi.mocked(confirmAction).mockResolvedValue(false);
    await click('Second'); expect(settings()?.querySelector('output')?.textContent).toBe('Changed');
    const input = host.querySelector<HTMLInputElement>('input[aria-label="searchNodes"]')!;
    await act(async () => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'Second');
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(settings()?.querySelector('output')?.textContent).toBe('Changed');
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 300)); });
    expect(api.listNodes).toHaveBeenLastCalledWith({ group: 'manual', page: 1, pageSize: 80, query: 'Second' });
    confirm.mockResolvedValue(true); await click('Second');
    expect(settings()?.querySelector('output')?.textContent).toBe('Second');
    await click('Edit draft'); await click('common:action.save');
    expect(api.saveNode).toHaveBeenCalledWith(expect.objectContaining({ id: 'b', name: 'Changed' }));
    expect(settings()?.querySelector('output')?.textContent).toBe('Changed');
});

it('shows the mobile directory first and protects returning from an edited node', async () => {
    viewport.desktop = false; await render(); expect(settings()).toBeNull();
    await click('Second'); await click('Edit draft');
    const confirm = vi.mocked(confirmAction).mockResolvedValue(false);
    await click('backToNodes'); expect(settings()).not.toBeNull();
    confirm.mockResolvedValue(true); await click('backToNodes'); expect(settings()).toBeNull();
    await click('Second'); expect(settings()?.querySelector('output')?.textContent).toBe('Second');
});

it('tests and selects the displayed node, then updates the default destination badges', async () => {
    await render(); await click('Second');
    await click('test'); await click('TCP Ping');
    expect(api.latencyNode).toHaveBeenCalledWith('b', 'tcp', expect.any(Object));
    expect(host.textContent).toContain('42ms');
    await click('setDefaultNode'); expect(api.useNode).toHaveBeenCalledWith('b');
    expect(host.textContent).toContain('defaultForTCP'); expect(host.textContent).toContain('defaultForUDP');
});

it('does not recreate a new node when setting its default destination fails after saving', async () => {
    await render(); await click('new'); await click('Edit draft');
    await click('useAsDefault');
    api.useNode.mockRejectedValueOnce(new Error('Default failed'));
    await click('common:action.save');
    expect(api.createNode).toHaveBeenCalledTimes(1);
    expect(settings()?.querySelector('[role="alert"]')?.textContent).toBe('Default failed');
    expect(host.querySelector('[aria-label="Changed"]')).not.toBeNull();
    await click('common:action.save');
    expect(api.createNode).toHaveBeenCalledTimes(1);
    expect(api.saveNode).toHaveBeenCalledWith(expect.objectContaining({ name: 'Changed' }));
    expect(settings()?.querySelector('output')?.textContent).toBe('Changed');
});

it('retains the selected node after a failed deletion and closes it after a successful retry', async () => {
    await render();
    api.deleteNode.mockRejectedValueOnce(new Error('Referenced node'));
    await click('common:action.remove'); await click('common:action.confirmDelete');
    expect(settings()?.querySelector('[role="alert"]')?.textContent).toBe('Referenced node');
    expect(settings()?.querySelector('output')?.textContent).toBe('First');
    await click('common:action.remove'); await click('common:action.confirmDelete');
    expect(api.deleteNode).toHaveBeenCalledTimes(2); expect(settings()).toBeNull();
});

it('moves from the group filter to a matching choice with the keyboard', async () => {
    nodes[1] = { ...nodes[1], group: 'work' };
    await render();
    const groupTrigger = Array.from(host.querySelectorAll<HTMLElement>('button')).find(button => button.textContent?.includes('manual') && button.getAttribute('aria-haspopup') === 'menu')!;
    await act(async () => groupTrigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
    const input = document.querySelector<HTMLInputElement>('input[placeholder="filterGroups"]')!;
    await act(async () => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'work');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.focus();
    });
    act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })));
    expect(document.activeElement?.textContent).toContain('work');
    await act(async () => document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
    expect(settings()?.querySelector('output')?.textContent).toBe('Second');
});

it('loads only the active group page and retains the open draft when paging', async () => {
    nodes = Array.from({ length: 83 }, (_, index) => normalizeNode({ id: String(index), name: `Node ${index}`, group: 'manual', enabled: true }));
    nodes.push(normalizeNode({ id: 'other', name: 'Other group', group: 'work', enabled: true }));
    await render();
    expect(api.listNodeGroups).toHaveBeenCalledTimes(1);
    expect(api.listNodes).toHaveBeenCalledExactlyOnceWith({ group: 'manual', page: 1, pageSize: 80, query: '' });
    await click('Edit draft');
    await click('pagination.next');
    expect(api.listNodes).toHaveBeenLastCalledWith({ group: 'manual', page: 2, pageSize: 80, query: '' });
    expect(settings()?.querySelector('output')?.textContent).toBe('Changed');
    expect(host.querySelector('[aria-label="Node 82"]')).not.toBeNull();
    expect(api.listNodes.mock.calls.some(([request]) => request.group === 'work')).toBe(false);
});

vi.mock('@/component/v2/confirmation', () => ({ confirmAction: vi.fn(async () => true) }));
