const streamMock = vi.hoisted(() => ({ source: null as null | (new (path: string) => object) }));
vi.mock('@/auth/event-stream', () => ({ AuthenticatedEventSource: function (path: string) { return new streamMock.source!(path); } }));
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import LogComponent from './page';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('virtua', () => ({ VList: () => null }));
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

it('closes the log stream when hidden or paused and cancels delayed reconnects on unmount', async () => {
    vi.useFakeTimers();
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    const streams: Array<{ close: ReturnType<typeof vi.fn>; onerror?: () => void }> = [];
    class Source {
        close = vi.fn();
        addEventListener = vi.fn();
        onerror?: () => void;
        constructor() { streams.push(this); }
    }
    streamMock.source = Source;
    const host = document.createElement('div');
    const root = createRoot(host);
    await act(async () => root.render(<LogComponent />));
    expect(streams).toHaveLength(1);
    expect(host.textContent).not.toContain('collectionPausesInTheBackground');
    act(() => {
        Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
        document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(streams[0].close).toHaveBeenCalled();
    expect(host.textContent).toContain('collectionPausesInTheBackground');
    act(() => {
        Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
        document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(streams).toHaveLength(2);
    expect(host.textContent).not.toContain('collectionPausesInTheBackground');
    act(() => host.querySelector<HTMLButtonElement>('[aria-label="pauseCollection"]')!.click());
    expect(streams[1].close).toHaveBeenCalled();
    expect(host.textContent).toContain('collectionPausesInTheBackground');
    act(() => host.querySelector<HTMLButtonElement>('[aria-label="resumeCollection"]')!.click());
    expect(streams).toHaveLength(3);
    expect(host.textContent).not.toContain('collectionPausesInTheBackground');
    act(() => streams[2].onerror?.());
    act(() => root.unmount());
    await act(async () => vi.advanceTimersByTimeAsync(5000));
    expect(streams).toHaveLength(3);
});

it('keeps the notice in sync when manual pause and page visibility overlap', async () => {
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    const streams: Array<{ close: ReturnType<typeof vi.fn> }> = [];
    class Source {
        close = vi.fn();
        addEventListener = vi.fn();
        constructor() { streams.push(this); }
    }
    streamMock.source = Source;
    const host = document.createElement('div');
    const root = createRoot(host);
    const hasNotice = () => host.textContent?.includes('collectionPausesInTheBackground') ?? false;
    const changeVisibility = (visibilityState: 'hidden' | 'visible') => {
        act(() => {
            Object.defineProperty(document, 'visibilityState', { value: visibilityState, configurable: true });
            document.dispatchEvent(new Event('visibilitychange'));
        });
    };

    await act(async () => root.render(<LogComponent />));
    expect(streams).toHaveLength(1);
    expect(hasNotice()).toBe(false);

    changeVisibility('hidden');
    expect(streams[0].close).toHaveBeenCalled();
    expect(hasNotice()).toBe(true);

    // A manual pause persists after the page becomes visible again.
    act(() => host.querySelector<HTMLButtonElement>('[aria-label="pauseCollection"]')!.click());
    changeVisibility('visible');
    expect(streams).toHaveLength(1);
    expect(hasNotice()).toBe(true);

    act(() => host.querySelector<HTMLButtonElement>('[aria-label="resumeCollection"]')!.click());
    expect(streams).toHaveLength(2);
    expect(hasNotice()).toBe(false);

    // Repeated hide/show cycles must not leave a stale notice behind.
    changeVisibility('hidden');
    expect(streams[1].close).toHaveBeenCalled();
    expect(hasNotice()).toBe(true);
    changeVisibility('visible');
    expect(streams).toHaveLength(3);
    expect(hasNotice()).toBe(false);

    act(() => root.unmount());
});
