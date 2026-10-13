import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { RuleItem } from '@/contract/route';
import { RuleList } from './rule-list';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string, options?: { name?: string }) => options?.name ? `${key}: ${options.name}` : key }) }));
const items: RuleItem[] = ['First', 'Second', 'Third'].map((name, index) => ({ id: String(index), name, index: index + 1, disabled: false, mode: 'proxy', target: { type: 'default' }, resolver: '', ruleCount: 1 }));
let host: HTMLDivElement;
let root: Root;
const onDrop = vi.fn();
const onOpen = vi.fn();
const onMove = vi.fn();
beforeEach(() => {
    vi.useFakeTimers(); vi.clearAllMocks();
    host = document.createElement('div'); document.body.append(host); root = createRoot(host);
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
        const index = Number(this.dataset.ruleId ?? 0);
        const top = this.matches('li') ? index * 60 : 0;
        const height = this.matches('li') ? 60 : 200;
        return { top, left: 0, right: 280, bottom: top + height, width: 280, height, x: 0, y: top, toJSON: () => ({}) };
    });
});
afterEach(() => { act(() => root.unmount()); host.remove(); vi.restoreAllMocks(); vi.useRealTimers(); });
function render(busy = false, filtered = false) {
    act(() => root.render(<RuleList items={items} destinations={{}} resolverNames={{}} page={1} pageSize={3} total={3} busy={busy} filtered={filtered}
        onOpen={onOpen} onMove={onMove} onDrop={onDrop} />));
}
function handle(index = 0) { return host.querySelectorAll<HTMLButtonElement>('button[aria-describedby]')[index]; }
function pointer(target: EventTarget, type: string, y: number, pointerType = 'mouse') {
    const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: 14, clientY: y, button: 0 });
    Object.defineProperties(event, { pointerType: { value: pointerType }, pointerId: { value: 1 }, isPrimary: { value: true } });
    act(() => target.dispatchEvent(event));
}
it('drags from the handle to an insertion position without opening the editor', () => {
    render(); pointer(handle(), 'pointerdown', 30); pointer(document, 'pointermove', 170); pointer(document, 'pointerup', 170);
    expect(onDrop).toHaveBeenCalledExactlyOnceWith(items[0], { target: items[2], placement: 'insert_after' });
    expect(onOpen).not.toHaveBeenCalled(); expect(host.querySelector('[role="status"]')).toBeNull();
});
it('lets an early touch swipe scroll and does not activate sorting', () => {
    render(); pointer(handle(), 'pointerdown', 30, 'touch'); pointer(document, 'pointermove', 55, 'touch');
    act(() => vi.advanceTimersByTime(500)); pointer(document, 'pointerup', 170, 'touch');
    expect(onDrop).not.toHaveBeenCalled(); expect(host.querySelector('[role="status"]')).toBeNull();
});
it('activates a held touch and blocks native scrolling only during that drag', () => {
    render(); pointer(handle(), 'pointerdown', 30, 'touch');
    const touch = () => { const event = new Event('touchmove', { cancelable: true, bubbles: true }); Object.defineProperty(event, 'touches', { value: [{}] }); act(() => document.dispatchEvent(event)); return event.defaultPrevented; };
    expect(touch()).toBe(false); act(() => vi.advanceTimersByTime(400)); expect(touch()).toBe(true);
    pointer(document, 'pointermove', 170, 'touch'); pointer(document, 'pointerup', 170, 'touch');
    expect(onDrop).toHaveBeenCalledExactlyOnceWith(items[0], { target: items[2], placement: 'insert_after' }); expect(touch()).toBe(false);
});
it('cancels Escape, pointer cancellation and no-op drops without saving', () => {
    render(); pointer(handle(), 'pointerdown', 30); pointer(document, 'pointermove', 170);
    act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))); pointer(document, 'pointerup', 170);
    pointer(handle(), 'pointerdown', 30); pointer(document, 'pointermove', 170); pointer(document, 'pointercancel', 170);
    pointer(handle(), 'pointerdown', 30); pointer(document, 'pointermove', 65); pointer(document, 'pointerup', 65);
    expect(onDrop).not.toHaveBeenCalled();
});
it('blocks sorting while a draft is dirty or the directory is filtered, and supports keyboard handles', () => {
    render(true); expect(handle().disabled).toBe(true); pointer(handle(), 'pointerdown', 30); pointer(document, 'pointermove', 170); pointer(document, 'pointerup', 170);
    render(false, true); expect(handle().disabled).toBe(true); expect(onDrop).not.toHaveBeenCalled();
    render(); act(() => handle().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })));
    expect(onMove).toHaveBeenCalledExactlyOnceWith(items[0], 1);
});
