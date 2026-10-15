import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { normalizeConnection } from '@/contract/connection';
import { ConnectionRow, ConnectionTableHeader, sortConnections } from './connection-table';
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('motion/react', async importOriginal => ({ ...await importOriginal<typeof import('motion/react')>(), useReducedMotion: () => true }));

it('orders numeric IDs and actual counters without changing the source list', () => {
    const items = [normalizeConnection({ id: '2', addr: 'z.example' }), normalizeConnection({ id: '10', addr: 'a.example' }), normalizeConnection({ id: '3', addr: 'c.example' })];
    const counters = { '2': { download: '300', upload: '50' }, '10': { download: '10', upload: '400' }, '3': { download: '100', upload: '20' } };
    const ids = (field: Parameters<typeof sortConnections>[1], order: 'asc' | 'desc') => sortConnections(items, field, order, counters).map(item => item.id);
    expect(ids('id', 'desc')).toEqual(['10', '3', '2']);
    expect(ids('id', 'asc')).toEqual(['2', '3', '10']);
    expect(ids('name', 'asc')).toEqual(['10', '3', '2']);
    expect(ids('download', 'desc')).toEqual(['2', '3', '10']);
    expect(ids('upload', 'asc')).toEqual(['3', '2', '10']);
    expect(items.map(item => item.id)).toEqual(['2', '10', '3']);
    expect(sortConnections(items, 'download', 'desc')).toEqual(items);
});

it('exposes the current sort and opens one detail action for a row button click', () => {
    const host = document.createElement('div'); document.body.append(host);
    const root = createRoot(host);
    const onSort = vi.fn(), onSelect = vi.fn();
    const conn = normalizeConnection({ id: '2', addr: 'long.example:443', mode: 'proxy', nodeName: 'Work node' });
    try {
        act(() => root.render(<><ConnectionTableHeader sortBy="download" sortOrder="desc" onSort={onSort} /><ConnectionRow conn={conn} onSelect={onSelect} animated={false} /></>));
        expect(host.querySelector('[aria-sort="descending"]')?.textContent).toContain('download');
        act(() => host.querySelector<HTMLButtonElement>('[aria-sort="descending"] button')!.click());
        expect(onSort).toHaveBeenCalledExactlyOnceWith('download');
        act(() => host.querySelector<HTMLButtonElement>('[data-connection-id="2"] button')!.click());
        expect(onSelect).toHaveBeenCalledExactlyOnceWith(conn);
        expect(host.textContent).toContain('Work node');
    } finally { act(() => root.unmount()); host.remove(); }
});
