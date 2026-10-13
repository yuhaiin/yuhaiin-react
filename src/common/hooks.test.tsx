import { act, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { useElementSize } from './hooks';

it('reacts to element resizing even if the window never resizes', () => {
    const observers: Array<{ notify: () => void; disconnected: () => boolean }> = [];
    class FakeResizeObserver {
        private disconnected = false;
        constructor(private callback: ResizeObserverCallback) {
            observers.push({ notify: () => this.callback([], this as unknown as ResizeObserver), disconnected: () => this.disconnected });
        }
        observe() {}
        disconnect() { this.disconnected = true; }
    }
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    let width = 100, height = 50;
    function Probe() {
        const [ref, size] = useElementSize<HTMLDivElement>();
        const attach = useCallback((node: HTMLDivElement | null) => {
            if (node) {
                Object.defineProperty(node, 'offsetWidth', { configurable: true, get: () => width });
                Object.defineProperty(node, 'offsetHeight', { configurable: true, get: () => height });
            }
            ref(node);
        }, [ref]);
        return <div ref={attach}>{size.width}x{size.height}</div>;
    }
    try {
        act(() => root.render(<Probe />));
        expect(observers.length).toBe(1);
        act(() => observers[0].notify());
        expect(host.textContent).toBe('100x50');
        width = 180; height = 90;
        act(() => observers[0].notify());
        expect(host.textContent).toBe('180x90');
    } finally {
        act(() => root.unmount());
        expect(observers[0].disconnected()).toBe(true);
        host.remove();
        vi.unstubAllGlobals();
    }
});
