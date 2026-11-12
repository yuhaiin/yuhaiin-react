const mocks = vi.hoisted(() => ({
    source: null as null | (new (path: string) => object),
    platform: null as null | { session: boolean },
    androidLogs: vi.fn<(lines: number) => Promise<string>>(),
    snapshots: vi.fn(),
    scrollTo: vi.fn(),
}));
vi.mock('@/auth/event-stream', () => ({ AuthenticatedEventSource: function (path: string) { return new mocks.source!(path); } }));
vi.mock('@/hooks/use-android-platform', () => ({ useAndroidPlatform: () => mocks.platform }));
vi.mock('@/api/android', () => ({ getAndroidLogs: mocks.androidLogs, exportAndroidLogs: vi.fn(), startDownload: vi.fn() }));
import { act, type ReactNode, type UIEvent as ReactUIEvent } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { LogEntry } from './log-buffer';
import LogComponent from './page';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string, options?: { count?: number }) => options?.count === undefined ? key : `${key}:${options.count}` }),
}));
// The level picker is a Radix popover; a native select exercises the same handler.
vi.mock('@/component/v2/select', async () => {
    const { createElement } = await import('react');
    return {
        Select: ({ value, onValueChange, items }: { value: string; onValueChange: (value: string) => void; items: { value: string }[] }) =>
            createElement('select', { 'data-testid': 'level', value, onChange: (event: { target: { value: string } }) => onValueChange(event.target.value) },
                items.map(item => createElement('option', { key: item.value, value: item.value }, item.value))),
    };
});
vi.mock('virtua', async () => {
    const { createElement, forwardRef, useImperativeHandle } = await import('react');
    const VList = forwardRef(function FakeVList(
        { data, children, onScroll, onScrollEnd }: {
            data: LogEntry[];
            children: (entry: LogEntry) => ReactNode;
            onScroll: (offset: number) => void;
            onScrollEnd: () => void;
        },
        ref,
    ) {
        useImperativeHandle(ref, () => ({ scrollTo: mocks.scrollTo, scrollSize: data.length * 40, viewportSize: 400 }));
        mocks.snapshots(data.map(entry => entry.line));
        return createElement('div', {
            'data-testid': 'virtual-log',
            // jsdom lays nothing out; give the scroller a width so its scrollbar edge can be told from its rows.
            ref: (node: HTMLDivElement | null) => { if (node) Object.defineProperty(node, 'clientWidth', { value: 400, configurable: true }); },
            onScroll: (event: ReactUIEvent<HTMLDivElement>) => onScroll(event.currentTarget.scrollTop),
            onScrollEnd,
        }, data.slice(0, 2).map(children));
    });
    return { VList };
});

const sources: FakeSource[] = [];
class FakeSource {
    private onLog?: (event: MessageEvent<string>) => void;
    close = vi.fn();
    constructor(_url: string) { sources.push(this); }
    addEventListener(type: string, listener: (event: MessageEvent<string>) => void) {
        if (type === 'log') this.onLog = listener;
    }
    emit(lines: string[]) {
        this.onLog?.(new MessageEvent('log', { data: JSON.stringify({ log: lines }) }));
    }
}

let host: HTMLDivElement;
let root: Root;

beforeEach(async () => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    sources.length = 0;
    mocks.platform = null;
    mocks.source = FakeSource;
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => setTimeout(() => callback(0), 0));
    vi.stubGlobal('cancelAnimationFrame', (handle: number) => clearTimeout(handle));
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
});

afterEach(async () => {
    await act(async () => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
    vi.useRealTimers();
});

const render = () => act(async () => root.render(<LogComponent />));
const advance = (ms: number) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });
/** Delivers one stream batch and lets the render batch and the follow frame run. */
async function receive(lines: string[]) {
    act(() => sources[sources.length - 1].emit(lines));
    await advance(301);
}
const viewport = () => host.querySelector<HTMLElement>('[data-testid="virtual-log"]')!;
const shown = () => mocks.snapshots.mock.lastCall?.[0] as string[];
const newLogsButton = () => [...host.querySelectorAll('button')].find(node => node.textContent?.includes('newLogCount'));
const pending = () => newLogsButton()?.textContent ?? null;
function scrollTo(offset: number) {
    act(() => {
        viewport().scrollTop = offset;
        viewport().dispatchEvent(new Event('scroll', { bubbles: true }));
    });
}
/** A real user scroll: input first, then the list reports the new offset. */
function userScrollDown(offset = 400) {
    act(() => { viewport().dispatchEvent(new WheelEvent('wheel', { bubbles: true, deltaY: 100 })); });
    scrollTo(offset);
}
/** The fake scroller is 400px wide, so its scrollbar edge starts at x = 384. */
function press(target: HTMLElement, pointerType: string, offsetX: number) {
    const event = new MouseEvent('pointerdown', { bubbles: true });
    Object.defineProperties(event, { pointerType: { value: pointerType }, offsetX: { value: offsetX } });
    target.dispatchEvent(event);
}
function touch(type: 'touchstart' | 'touchmove', clientY: number) {
    const event = new Event(type, { bubbles: true });
    Object.defineProperty(event, 'touches', { value: [{ clientY }] });
    viewport().dispatchEvent(event);
}
async function search(term: string) {
    const input = host.querySelector<HTMLInputElement>('input')!;
    act(() => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, term);
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await advance(250);
}
function selectLevel(level: string) {
    const select = host.querySelector<HTMLSelectElement>('[data-testid="level"]')!;
    act(() => {
        select.value = level;
        select.dispatchEvent(new Event('change', { bubbles: true }));
    });
}
const clickButton = (label: string) => act(() => host.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!.click());

it('shows no new-logs button while following', async () => {
    await render();
    await receive(['a']);
    await receive(['b', 'c']);
    expect(shown()).toEqual(['c', 'b', 'a']);
    expect(pending()).toBeNull();
});

it('keeps following when a row is only clicked, even if the list then repositions itself', async () => {
    await render();
    await receive(Array.from({ length: 20 }, (_, index) => `seed ${index}`));
    const row = host.querySelector<HTMLElement>('[data-log-id]')!;
    act(() => {
        press(row, 'mouse', 395);
        row.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        // While the list scrolls its rows ignore the pointer, so a press can land on the scroller itself.
        press(viewport(), 'mouse', 100);
        press(viewport(), 'touch', 395);
    });
    // A prepend makes the virtual list move its own offset; that is not the user leaving.
    scrollTo(600);
    await receive(['b']);
    expect(shown()).toHaveLength(21);
    expect(shown()[0]).toBe('b');
    expect(pending()).toBeNull();
});

it('keeps following when scroll input moves nothing because the list is too short', async () => {
    await render();
    await receive(['a']);
    act(() => {
        viewport().dispatchEvent(new WheelEvent('wheel', { bubbles: true, deltaY: 100 }));
        viewport().dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'PageDown' }));
        touch('touchstart', 300);
        touch('touchmove', 200);
    });
    // The stale input must not turn the list's next own repositioning into a user scroll.
    await receive(['b']);
    scrollTo(600);
    await receive(['c']);
    expect(shown()).toEqual(['c', 'b', 'a']);
    expect(pending()).toBeNull();
});

it.each([
    ['wheel', () => viewport().dispatchEvent(new WheelEvent('wheel', { bubbles: true, deltaY: 100 }))],
    ['keyboard', () => viewport().dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'PageDown' }))],
    ['touch', () => { touch('touchstart', 300); touch('touchmove', 200); }],
    ['scrollbar', () => press(viewport(), 'mouse', 395)],
])('stops following when the user scrolls away by %s and counts what arrives', async (_name, input) => {
    await render();
    await receive(Array.from({ length: 20 }, (_, index) => `seed ${index}`));
    act(() => { input(); });
    scrollTo(400);
    await receive(Array.from({ length: 10 }, (_, index) => `line ${index}`));
    expect(shown()).toHaveLength(20);
    expect(pending()).toBe('newLogCount:10');
});

it('ignores a press on the empty area under a list too short to scroll', async () => {
    await render();
    await receive(['a']);
    act(() => { press(viewport(), 'mouse', 395); });
    scrollTo(600);
    await receive(['b']);
    expect(shown()).toEqual(['b', 'a']);
    expect(pending()).toBeNull();
});

it('lets a user scroll that is under way finish instead of pulling it back to the top', async () => {
    await render();
    await receive(['a']);
    mocks.scrollTo.mockClear();
    // Still within reach of the newest line when the next batch is shown.
    userScrollDown(20);
    await receive(['b']);
    expect(shown()).toEqual(['b', 'a']);
    expect(mocks.scrollTo).not.toHaveBeenCalled();

    scrollTo(300);
    await receive(['c']);
    expect(shown()).toEqual(['b', 'a']);
    expect(pending()).toBe('newLogCount:1');
});

it('follows again after a scroll that ended near the newest line', async () => {
    await render();
    await receive(['a']);
    userScrollDown(20);
    act(() => { viewport().dispatchEvent(new Event('scrollend', { bubbles: true })); });
    mocks.scrollTo.mockClear();
    await receive(['b']);
    // The list repositioning itself for the prepend is no longer attributed to the finished gesture.
    scrollTo(600);
    await receive(['c']);
    expect(shown()).toEqual(['c', 'b', 'a']);
    expect(mocks.scrollTo).toHaveBeenCalledWith(0);
    expect(pending()).toBeNull();
});

it('does not stop following for an upward wheel or an upward touch drag', async () => {
    await render();
    await receive(['a']);
    act(() => {
        viewport().dispatchEvent(new WheelEvent('wheel', { bubbles: true, deltaY: -100 }));
        touch('touchstart', 200);
        touch('touchmove', 300);
    });
    scrollTo(600);
    await receive(['b']);
    expect(shown()).toEqual(['b', 'a']);
});

it('counts only lines matching the search term', async () => {
    await render();
    await receive(['seed dns']);
    await search('DNS');
    userScrollDown();
    await receive(['dns one', 'tcp', 'udp', 'DNS two', 'tcp', 'tcp', 'dns three', 'udp', 'udp', 'tcp']);
    expect(pending()).toBe('newLogCount:3');
    await receive(['tcp', 'udp']);
    expect(pending()).toBe('newLogCount:3');

    act(() => newLogsButton()!.click());
    await advance(1);
    expect(shown()).toEqual(['dns three', 'DNS two', 'dns one', 'seed dns']);
    expect(pending()).toBeNull();
});

it('shows no button when nothing held back matches the filter', async () => {
    await render();
    await receive(['seed dns']);
    await search('dns');
    userScrollDown();
    await receive(Array.from({ length: 3928 }, () => 'tcp'));
    expect(pending()).toBeNull();
    await receive(['dns']);
    expect(pending()).toBe('newLogCount:1');
});

it('counts only lines at or above the minimum level', async () => {
    await render();
    await receive(['level=ERROR msg=seed']);
    selectLevel('WARN');
    userScrollDown();
    await receive(['level=DEBUG msg=a', 'level=WARN msg=b', 'level=INFO msg=c', 'level=ERROR msg=d', 'plain line']);
    expect(pending()).toBe('newLogCount:3');
});

it('restarts from the newest line when the filter changes while lines are held back', async () => {
    await render();
    await receive(['level=ERROR msg=seed']);
    userScrollDown();
    await receive(['level=DEBUG msg=a', 'level=WARN msg=b']);
    expect(pending()).toBe('newLogCount:2');
    selectLevel('WARN');
    await advance(1);
    expect(shown()).toEqual(['level=WARN msg=b', 'level=ERROR msg=seed']);
    expect(pending()).toBeNull();
    await receive(['level=DEBUG msg=c', 'level=ERROR msg=d']);
    expect(shown()).toEqual(['level=ERROR msg=d', 'level=WARN msg=b', 'level=ERROR msg=seed']);
});

it('never counts lines the ring buffer has already dropped', async () => {
    await render();
    await receive(['seed']);
    userScrollDown();
    for (let batch = 0; batch < 4; batch++) await receive(Array.from({ length: 1500 }, (_, index) => `line ${batch}-${index}`));
    expect(pending()).toBe('newLogCount:2000');
    // The frozen view still shows what the user was reading.
    expect(shown()).toEqual(['seed']);

    act(() => newLogsButton()!.click());
    await advance(1);
    expect(shown()).toHaveLength(2000);
    expect(shown()[0]).toBe('line 3-1499');
    expect(mocks.scrollTo).toHaveBeenLastCalledWith(0);
    expect(pending()).toBeNull();
});

it('resumes following without a button once the user scrolls back to the newest line', async () => {
    await render();
    await receive(['a']);
    userScrollDown();
    await receive(['b']);
    expect(pending()).toBe('newLogCount:1');
    scrollTo(10);
    await advance(1);
    expect(shown()).toEqual(['b', 'a']);
    expect(pending()).toBeNull();
    await receive(['c']);
    expect(shown()).toEqual(['c', 'b', 'a']);
    expect(pending()).toBeNull();
});

it('resets the count and follows again after clearing or changing retention', async () => {
    await render();
    await receive(['a']);
    userScrollDown();
    await receive(['b', 'c']);
    expect(pending()).toBe('newLogCount:2');
    clickButton('clearLogs');
    expect(pending()).toBeNull();
    expect(host.querySelector('[data-testid="virtual-log"]')).toBeNull();
    await receive(['d']);
    expect(shown()).toEqual(['d']);
    expect(pending()).toBeNull();

    userScrollDown();
    await receive(['e']);
    expect(pending()).toBe('newLogCount:1');
    act(() => [...host.querySelectorAll('button')].find(node => node.textContent === '500')!.click());
    await advance(1);
    expect(shown()).toEqual(['e', 'd']);
    expect(pending()).toBeNull();
});

it('keeps the count when collection pauses mid-batch', async () => {
    await render();
    await receive(['a']);
    userScrollDown();
    act(() => sources[0].emit(['b', 'c']));
    clickButton('pauseCollection');
    expect(pending()).toBe('newLogCount:2');
    expect(shown()).toEqual(['a']);
});

it('counts and resets per source when switching between core and Android logs', async () => {
    mocks.platform = { session: true };
    let logcat = ['11-09 17:56:33.850 1 2 I Tag: one'];
    mocks.androidLogs.mockImplementation(async () => logcat.join('\n'));
    await render();
    await receive(['core a']);
    userScrollDown();
    await receive(['core b']);
    expect(pending()).toBe('newLogCount:1');

    const sourceButton = (name: string) => [...host.querySelectorAll('button')].find(node => node.textContent === name)!;
    act(() => sourceButton('logs.sourceAndroid').click());
    await advance(1);
    expect(pending()).toBeNull();
    expect(shown()).toEqual(logcat);

    userScrollDown();
    logcat = [...logcat, '11-09 17:56:34.000 1 2 D Tag: two', '11-09 17:56:35.000 1 2 E Tag: three'];
    await advance(3000);
    expect(pending()).toBe('newLogCount:2');
    expect(shown()).toHaveLength(1);

    act(() => sourceButton('logs.sourceCore').click());
    await advance(1);
    expect(pending()).toBeNull();
    await receive(['core c']);
    expect(shown()).toEqual(['core c']);
});
