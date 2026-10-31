import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { SWRConfig } from 'swr';
import { normalizeNode } from '@/contract/node';
import NodePicker from './node-picker';
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
const api = vi.hoisted(() => ({ getNode: vi.fn(), listNodes: vi.fn(), listNodeGroups: vi.fn() }));
vi.mock('@/api/nodes', () => api);
it('lazily loads candidates, excludes itself and preserves selected ordering across pages', async () => {
    const first = normalizeNode({ id: 'a', name: 'First node', group: 'manual', enabled: true });
    const second = normalizeNode({ id: 'b', name: 'Second node', group: 'manual', enabled: true });
    api.getNode.mockImplementation(async id => id === 'a' ? first : second);
    api.listNodeGroups.mockResolvedValue({ items: [{ name: 'manual', count: 41, enabled: 41 }] });
    api.listNodes.mockImplementation(async ({ page }) => ({ items: page === 1 ? [normalizeNode({ id: 'self', name: 'This set', group: 'manual', enabled: true }), first] : [second], page: { page, pageSize: 40, total: 41 } }));
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host); const onChange = vi.fn();
    try {
        await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><NodePicker value={['a', 'b']} excludeId="self" onChange={onChange} /></SWRConfig>));
        expect(api.listNodes).not.toHaveBeenCalled();
        act(() => host.querySelector<HTMLButtonElement>('button[aria-label="moveLater First node"]')!.click());
        expect(onChange).toHaveBeenLastCalledWith(['b', 'a']);
        await act(async () => [...host.querySelectorAll('button')].find(button => button.textContent?.trim() === 'chooseNode')!.click());
        expect(api.listNodes).toHaveBeenCalledTimes(1); expect(document.body.textContent).not.toContain('This set');
        const next = [...document.querySelectorAll('button')].find(button => button.textContent?.trim() === 'nextPage')!;
        await act(async () => next.click());
        expect(api.listNodes).toHaveBeenLastCalledWith({ page: 2, pageSize: 40, group: 'manual', query: '', enabledOnly: true });
        await act(async () => document.querySelector<HTMLButtonElement>('button[aria-pressed="true"]')!.click());
        expect(onChange).toHaveBeenLastCalledWith(['a']);
    } finally { act(() => root.unmount()); host.remove(); }
});
it('opens on the group of the last selected node and stays there while toggling', async () => {
    const manual = normalizeNode({ id: 'a', name: 'Manual node', group: 'manual', enabled: true });
    const work = normalizeNode({ id: 'b', name: 'Work node', group: 'work', enabled: true });
    api.getNode.mockImplementation(async id => id === 'a' ? manual : work);
    api.listNodeGroups.mockResolvedValue({ items: [{ name: 'manual', count: 1, enabled: 1 }, { name: 'work', count: 1, enabled: 1 }] });
    api.listNodes.mockReset();
    api.listNodes.mockImplementation(async ({ group, page }) => ({ items: group === 'work' ? [work] : [manual], page: { page, pageSize: 40, total: 1 } }));
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    const tree = (value: string[]) => <SWRConfig value={{ provider: () => new Map() }}><NodePicker value={value} onChange={vi.fn()} /></SWRConfig>;
    try {
        await act(async () => root.render(tree(['a', 'b'])));
        await act(async () => [...host.querySelectorAll('button')].find(button => button.textContent?.trim() === 'chooseNode')!.click());
        expect(api.listNodes).toHaveBeenCalledExactlyOnceWith({ page: 1, pageSize: 40, group: 'work', query: '', enabledOnly: true });
        await act(async () => root.render(tree(['a'])));
        expect(api.listNodes.mock.calls.every(([request]) => request.group === 'work')).toBe(true);
    } finally { act(() => root.unmount()); host.remove(); }
});
