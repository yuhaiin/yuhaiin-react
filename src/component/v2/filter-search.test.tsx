import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { FilterSearch } from './card';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

let host: HTMLDivElement;
let root: Root;
const search = vi.fn();
const input = () => host.querySelector('input')!;
const type = (value: string) => act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input(), value);
    input().dispatchEvent(new Event('input', { bubbles: true }));
});

beforeEach(() => {
    vi.useFakeTimers();
    search.mockClear();
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
    act(() => root.render(<FilterSearch onSearch={search} />));
});
afterEach(() => {
    act(() => root.unmount());
    host.remove();
    vi.useRealTimers();
});

it('searches shortly after typing stops, and at once on Enter', () => {
    type('Ho');
    type('Host');
    expect(search).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(200); });
    expect(search.mock.calls).toEqual([['host']]);
    type('Host-1');
    act(() => input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
    expect(search).toHaveBeenLastCalledWith('host-1');
    act(() => { vi.advanceTimersByTime(200); });
    expect(search).toHaveBeenCalledTimes(2);
});

it('waits for an IME to finish converting', () => {
    act(() => input().dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true })));
    type('かな');
    act(() => { vi.advanceTimersByTime(500); });
    expect(search).not.toHaveBeenCalled();
    type('仮名');
    act(() => input().dispatchEvent(new CompositionEvent('compositionend', { bubbles: true })));
    act(() => { vi.advanceTimersByTime(200); });
    expect(search.mock.calls).toEqual([['仮名']]);
});

it('clears from the button and with Escape', () => {
    expect(host.querySelector('button')).toBeNull();
    type('host');
    act(() => host.querySelector('button')!.click());
    expect(input().value).toBe('');
    expect(search).toHaveBeenLastCalledWith('');
    type('other');
    act(() => input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    expect(input().value).toBe('');
    act(() => { vi.advanceTimersByTime(200); });
    expect(search).toHaveBeenCalledTimes(2);
});
