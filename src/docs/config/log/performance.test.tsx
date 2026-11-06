const streamMock = vi.hoisted(() => ({ source: null as null | (new (path: string) => object) }));
vi.mock('@/auth/event-stream', () => ({ AuthenticatedEventSource: function (path: string) { return new streamMock.source!(path); } }));
import { act, type ReactNode, type UIEvent as ReactUIEvent } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { LogEntry } from './log-buffer';
import LogComponent from './page';

const list = vi.hoisted(() => ({ snapshots: vi.fn(), scrollTo: vi.fn() }));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('virtua', async () => {
    const { createElement, forwardRef, useImperativeHandle } = await import('react');
    const VList = forwardRef(function FakeVList(
        { data, children, onScroll, shift }: {
            data: LogEntry[];
            shift?: boolean;
            children: (entry: LogEntry) => ReactNode;
            onScroll: (offset: number) => void;
        },
        ref,
    ) {
        useImperativeHandle(ref, () => ({ scrollTo: list.scrollTo }));
        list.snapshots(data.map(entry => entry.line), Boolean(shift));
        return createElement('div', {
            'data-testid': 'virtual-log',
            onScroll: (event: ReactUIEvent<HTMLDivElement>) => onScroll(event.currentTarget.scrollTop),
        }, data.slice(0, 2).map(children));
    });
    return { VList };
});

const sources: FakeSource[] = [];
class FakeSource {
    private onLog?: (event: MessageEvent<string>) => void;
    onerror?: () => void;
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
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    streamMock.source = FakeSource;
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
        setTimeout(() => callback(0), 0));
    vi.stubGlobal('cancelAnimationFrame', (handle: number) => clearTimeout(handle));
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
    await act(async () => root.render(<LogComponent />));
});

afterEach(async () => {
    await act(async () => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
    vi.useRealTimers();
});

function emit(lines: string[]) {
    act(() => sources[sources.length - 1].emit(lines));
}

async function advance(ms: number) {
    await act(async () => { await vi.advanceTimersByTimeAsync(ms); });
}

it('batches frequent SSE events without dropping newer logs or rendering each event', async () => {
    expect(sources).toHaveLength(1);
    emit(['first']);
    await advance(125);
    emit(['second', 'third']);
    expect(list.snapshots).not.toHaveBeenCalled();

    await advance(125);
    expect(list.snapshots).toHaveBeenCalled();
    expect(list.snapshots.mock.lastCall?.[0]).toEqual(['third', 'second', 'first']);
    const published = list.snapshots.mock.calls.length;

    await advance(500);
    expect(list.snapshots).toHaveBeenCalledTimes(published);
});

it('does not force-scroll after a user moves away and resumes following at the top', async () => {
    emit(['first']);
    await advance(300);
    // React commits the list after the timer; the scheduled follow frame runs next.
    await advance(1);
    expect(list.scrollTo).toHaveBeenCalledWith(0);
    list.scrollTo.mockClear();

    const viewport = host.querySelector<HTMLElement>('[data-testid="virtual-log"]')!;
    act(() => {
        viewport.dispatchEvent(new WheelEvent('wheel', { bubbles: true, deltaY: 100 }));
        viewport.scrollTop = 120;
        viewport.dispatchEvent(new Event('scroll', { bubbles: true }));
    });

    list.snapshots.mockClear();
    emit(['second']);
    await advance(300);
    // React commits the list after the timer; the scheduled follow frame runs next.
    await advance(1);
    expect(list.scrollTo).not.toHaveBeenCalled();
    // The view stays frozen while reading older lines; new lines are announced instead of inserted.
    expect(list.snapshots.mock.lastCall?.[0] ?? ['first']).toEqual(['first']);
    expect(host.textContent).toContain('newLogCount');

    act(() => {
        viewport.scrollTop = 0;
        viewport.dispatchEvent(new Event('scroll', { bubbles: true }));
    });
    await advance(1);
    expect(list.snapshots.mock.lastCall?.[0]).toEqual(['second', 'first']);
    expect(host.textContent).not.toContain('newLogCount');
    list.scrollTo.mockClear();

    emit(['third']);
    await advance(300);
    // React commits the list after the timer; the scheduled follow frame runs next.
    await advance(1);
    expect(list.scrollTo).toHaveBeenCalledTimes(1);
    expect(list.scrollTo).toHaveBeenCalledWith(0);
});

it('publishes held-back lines and scrolls to the top when the new-logs button is clicked', async () => {
    emit(['first']);
    await advance(301);
    const viewport = host.querySelector<HTMLElement>('[data-testid="virtual-log"]')!;
    act(() => { viewport.dispatchEvent(new WheelEvent('wheel', { bubbles: true, deltaY: 100 })); });

    emit(['second', 'third']);
    await advance(301);
    const button = [...host.querySelectorAll('button')].find(node => node.textContent?.includes('newLogCount'));
    expect(button).toBeDefined();
    list.scrollTo.mockClear();

    act(() => button!.click());
    await advance(1);
    expect(list.snapshots.mock.lastCall?.[0]).toEqual(['third', 'second', 'first']);
    expect(list.scrollTo).toHaveBeenCalledWith(0);
});

it('feeds a full buffer to the list as a shifted prepend followed by an unshifted trim', async () => {
    const initial = Array.from({ length: 2000 }, (_, index) => `line ${index}`);
    emit(initial);
    await advance(301);
    list.snapshots.mockClear();

    emit(['newest']);
    await advance(301);
    const calls = list.snapshots.mock.calls as [string[], boolean][];
    const prepend = calls.find(([, shift]) => shift);
    expect(prepend?.[0]).toHaveLength(2001);
    expect(prepend?.[0][0]).toBe('newest');
    expect(prepend?.[0][1]).toBe('line 1999');
    const [last, lastShift] = calls[calls.length - 1];
    expect(lastShift).toBe(false);
    expect(last).toHaveLength(2000);
    expect(last[0]).toBe('newest');
    expect(last[last.length - 1]).toBe('line 1');
});
