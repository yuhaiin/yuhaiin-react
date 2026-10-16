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
        { data, children, onScroll }: {
            data: LogEntry[];
            children: (entry: LogEntry) => ReactNode;
            onScroll: (offset: number) => void;
        },
        ref,
    ) {
        useImperativeHandle(ref, () => ({ scrollTo: list.scrollTo }));
        list.snapshots(data.map(entry => entry.line));
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
    vi.stubGlobal('EventSource', FakeSource);
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
    expect(list.snapshots).toHaveBeenCalledTimes(1);
    expect(list.snapshots.mock.lastCall?.[0]).toEqual(['third', 'second', 'first']);

    await advance(500);
    expect(list.snapshots).toHaveBeenCalledTimes(1);
});

it('does not force-scroll after a user moves away and resumes following at the top', async () => {
    emit(['first']);
    await advance(300);
    expect(list.scrollTo).toHaveBeenCalledWith(0);
    list.scrollTo.mockClear();

    const viewport = host.querySelector<HTMLElement>('[data-testid="virtual-log"]')!;
    act(() => {
        viewport.dispatchEvent(new WheelEvent('wheel', { bubbles: true, deltaY: 100 }));
        viewport.scrollTop = 120;
        viewport.dispatchEvent(new Event('scroll', { bubbles: true }));
    });

    emit(['second']);
    await advance(300);
    expect(list.scrollTo).not.toHaveBeenCalled();

    act(() => {
        viewport.scrollTop = 0;
        viewport.dispatchEvent(new Event('scroll', { bubbles: true }));
    });
    emit(['third']);
    await advance(300);
    expect(list.scrollTo).toHaveBeenCalledTimes(1);
    expect(list.scrollTo).toHaveBeenCalledWith(0);
});
