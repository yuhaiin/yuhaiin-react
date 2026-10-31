import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { HistoryList, formatHistoryTime, matchesHistorySearch } from './history-list';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

it('matches any field and ignores missing ones', () => {
    expect(matchesHistorySearch('', undefined)).toBe(true);
    expect(matchesHistorySearch('host', undefined, 'My-Host:443')).toBe(true);
    expect(matchesHistorySearch('host', undefined, 'other')).toBe(false);
});

it('returns to the top when the page or filters change, but not on a data refresh', () => {
    const scroller = document.createElement('div');
    scroller.dataset.uiTransition = 'page';
    const host = scroller.appendChild(document.createElement('div'));
    const root = createRoot(host);
    const render = (page: number, resetKey: string, items: string[]) => act(() => root.render(
        <HistoryList items={items} getKey={item => item} onClickItem={() => undefined} renderRow={item => item} page={page} totalItems={90} pageSize={30} onPageChange={() => undefined} resetKey={resetKey} />,
    ));

    render(1, 'a', ['one']);
    scroller.scrollTop = 500;
    render(1, 'a', ['one', 'refreshed']);
    expect(scroller.scrollTop).toBe(500);
    render(2, 'a', ['two']);
    expect(scroller.scrollTop).toBe(0);
    scroller.scrollTop = 500;
    render(2, 'b', ['two']);
    expect(scroller.scrollTop).toBe(0);
    act(() => root.unmount());
});

it('marks only rows a refresh added as fresh', () => {
    const host = document.createElement('div');
    const root = createRoot(host);
    const render = (page: number, items: string[]) => act(() => root.render(
        <HistoryList items={items} getKey={item => item} onClickItem={() => undefined} renderRow={item => item} page={page} totalItems={90} pageSize={30} onPageChange={() => undefined} resetKey="a" />,
    ));
    const fresh = () => [...host.querySelectorAll('[data-history-fresh]')].map(row => row.textContent);

    render(1, ['one']);
    expect(fresh()).toEqual([]);
    render(1, ['new', 'one']);
    expect(fresh()).toEqual(['new']);
    render(2, ['two']);
    expect(fresh()).toEqual([]);
    act(() => root.unmount());
});

it('adds the date only to records from another day', () => {
    const now = new Date(2026, 9, 31, 12, 0, 0);
    const today = new Date(2026, 9, 31, 9, 5, 7);
    const yesterday = new Date(2026, 9, 30, 9, 5, 7);
    const lastYear = new Date(2025, 9, 31, 9, 5, 7);
    expect(formatHistoryTime(today, now)).toBe(today.toLocaleTimeString());
    expect(formatHistoryTime(yesterday, now)).toBe(yesterday.toLocaleString(undefined, { month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit' }));
    expect(formatHistoryTime(lastYear, now)).toContain('2025');
});
