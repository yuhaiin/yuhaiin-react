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
    vi.stubGlobal('EventSource', Source);
    const host = document.createElement('div');
    const root = createRoot(host);
    await act(async () => root.render(<LogComponent />));
    expect(streams).toHaveLength(1);
    act(() => {
        Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
        document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(streams[0].close).toHaveBeenCalled();
    act(() => {
        Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
        document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(streams).toHaveLength(2);
    act(() => host.querySelector<HTMLButtonElement>('[aria-label="pauseCollection"]')!.click());
    expect(streams[1].close).toHaveBeenCalled();
    expect(host.textContent).toContain('collectionPausesInTheBackground');
    act(() => host.querySelector<HTMLButtonElement>('[aria-label="resumeCollection"]')!.click());
    expect(streams).toHaveLength(3);
    act(() => streams[2].onerror?.());
    act(() => root.unmount());
    await act(async () => vi.advanceTimersByTimeAsync(5000));
    expect(streams).toHaveLength(3);
});
