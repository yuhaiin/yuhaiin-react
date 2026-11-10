import { haptic } from '@/common/haptics';
import clsx from 'clsx';
import { RotateCw } from 'lucide-react';
import { useEffect, useRef } from 'react';

/** Finger travel is halved, as in native lists; the indicator arms after this much of its own travel. */
const THRESHOLD = 60;
const MAX = 96;
const SLOP = 10;
/** A press held this long before moving is a long press (rule drag, text selection), not a pull. */
const HOLD_MS = 350;

const blocksPull = (element: Element) => {
    if (element.closest('[data-no-pull-refresh], input, textarea, select, [contenteditable="true"], [draggable="true"]')) return true;
    return false;
};

/** Every scroller between the touch and the page must rest at its top. */
function scrollersAtTop(target: Element, root: Element): HTMLElement[] | null {
    const found: HTMLElement[] = [];
    for (let node: Element | null = target; node && node !== root.parentElement; node = node.parentElement) {
        if (!(node instanceof HTMLElement)) continue;
        const style = getComputedStyle(node);
        if (style.touchAction === 'none' || style.touchAction === 'pan-x') return null;
        if (!/(auto|scroll)/.test(style.overflowY) || node.scrollHeight <= node.clientHeight + 1) continue;
        if (node.scrollTop > 0) return null;
        found.push(node);
    }
    return found;
}

/**
 * Pull down at the top of a phone page to refresh its data. The page scroller
 * is not the document, so the browser's own gesture never fires (and the
 * Android WebView has none). Listeners are passive: scrolling is never blocked,
 * the pull only draws an indicator below the App Bar.
 */
export function PullToRefresh({ enabled, refreshing, onRefresh }: { enabled: boolean; refreshing: boolean; onRefresh: () => void }) {
    const indicator = useRef<HTMLDivElement>(null);
    const refresh = useRef(onRefresh);
    useEffect(() => { refresh.current = onRefresh; }, [onRefresh]);
    const busy = useRef(refreshing);

    const place = (distance: number, animate: boolean) => {
        const element = indicator.current;
        if (!element) return;
        element.style.transition = animate ? 'transform var(--motion-slow) var(--ease-standard), opacity var(--motion-slow) var(--ease-standard)' : 'none';
        element.style.transform = `translate(-50%, ${distance}px)`;
        element.style.opacity = String(Math.min(1, distance / (THRESHOLD * 0.6)));
        const icon = element.firstElementChild as HTMLElement | null;
        if (icon) icon.style.transform = `rotate(${Math.round(distance * 3.2)}deg)`;
        element.dataset.armed = String(distance >= THRESHOLD);
    };

    // The refresh holds the indicator open, then lets it go.
    useEffect(() => {
        busy.current = refreshing;
        if (!indicator.current) return;
        indicator.current.dataset.busy = String(refreshing);
        place(refreshing ? THRESHOLD : 0, true);
    }, [refreshing]);

    useEffect(() => {
        if (!enabled) return;
        document.documentElement.dataset.pullRefresh = '';
        let start: { x: number; y: number; time: number; id: number; held: HTMLElement[] } | null = null;
        let pulling = false;
        let distance = 0;
        const release = () => {
            start?.held.forEach(node => { node.style.overscrollBehaviorY = ''; });
            start = null; pulling = false; distance = 0;
        };
        const onStart = (event: TouchEvent) => {
            release();
            if (busy.current || event.touches.length !== 1) return;
            const target = event.target;
            const main = document.querySelector('main');
            if (!(target instanceof Element) || !main?.contains(target) || blocksPull(target)) return;
            const held = scrollersAtTop(target, main);
            if (!held) return;
            // Inner lists would otherwise stretch (Android overscroll) under the indicator.
            held.forEach(node => { node.style.overscrollBehaviorY = 'none'; });
            const touch = event.touches[0];
            start = { x: touch.clientX, y: touch.clientY, time: event.timeStamp, id: touch.identifier, held };
        };
        const onMove = (event: TouchEvent) => {
            if (!start) return;
            const touch = [...event.touches].find(item => item.identifier === start!.id);
            if (!touch || event.touches.length !== 1) { place(0, true); release(); return; }
            const dx = touch.clientX - start.x, dy = touch.clientY - start.y;
            if (!pulling) {
                if (Math.abs(dx) < SLOP && Math.abs(dy) < SLOP) return;
                const downward = dy > 0 && Math.abs(dy) > Math.abs(dx) * 1.5;
                if (!downward || event.timeStamp - start.time > HOLD_MS || start.held.some(node => node.scrollTop > 0)) { release(); return; }
                pulling = true;
            }
            const next = Math.max(0, Math.min(MAX, (dy - SLOP) / 2));
            if (next >= THRESHOLD && distance < THRESHOLD) haptic();
            distance = next;
            place(distance, false);
        };
        const onEnd = () => {
            if (!start) return;
            const armed = pulling && distance >= THRESHOLD;
            release();
            if (armed) { place(THRESHOLD, true); refresh.current(); }
            else place(0, true);
        };
        const options = { passive: true, capture: true } as const;
        document.addEventListener('touchstart', onStart, options);
        document.addEventListener('touchmove', onMove, options);
        document.addEventListener('touchend', onEnd, options);
        document.addEventListener('touchcancel', onEnd, options);
        return () => {
            release();
            delete document.documentElement.dataset.pullRefresh;
            document.removeEventListener('touchstart', onStart, options);
            document.removeEventListener('touchmove', onMove, options);
            document.removeEventListener('touchend', onEnd, options);
            document.removeEventListener('touchcancel', onEnd, options);
        };
    }, [enabled]);

    if (!enabled) return null;
    // Starts hidden behind the App Bar and travels down from its lower edge.
    return <div ref={indicator} aria-hidden="true" data-pull-refresh-indicator
        className={clsx(
            'pointer-events-none fixed left-1/2 top-[calc(var(--mobile-app-bar-height)+env(safe-area-inset-top)-44px)] z-[1029] flex h-10 w-10 items-center justify-center rounded-full',
            'border border-ui-border bg-ui-surface-raised text-ui-muted shadow-ui-elevated data-[armed=true]:text-ui-primary data-[busy=true]:text-ui-primary lg:hidden',
        )}
        style={{ transform: 'translate(-50%, 0px)', opacity: 0 }}>
        <RotateCw size={20} className={clsx(refreshing && 'motion-safe:animate-spin')} />
    </div>;
}
