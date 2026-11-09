import { useEffect, useRef, useState } from 'react';

/** Scroll distance in one direction before the bars move, so small jitters do not toggle them. */
const THRESHOLD = 24;

/**
 * Phone App Bar and tab bar collapse while the page scrolls down and return on
 * any scroll up, near the top, or on a page change (like native app bars).
 *
 * Any large vertical scroller inside `main` counts: the page scroller and the
 * virtual lists that scroll on their own (connections, logs, nodes). Only
 * transforms change; page padding stays, so nothing reflows while scrolling.
 */
/**
 * `resetKey` must change on every navigation, including a return to an earlier
 * page (pass the navigation snapshot, which is a new object per entry change).
 */
export function useScrollCollapse(resetKey: unknown, enabled: boolean) {
    // The state remembers which page collapsed it; another page reads as shown,
    // so a page change restores the bars without a render-phase reset.
    const [state, setState] = useState({ key: resetKey, collapsed: false });
    const key = useRef(resetKey);
    useEffect(() => { key.current = resetKey; }, [resetKey]);

    useEffect(() => {
        if (!enabled) return;
        const last = new WeakMap<Element, number>();
        let travel = 0;
        const set = (collapsed: boolean) => setState(current =>
            current.key === key.current && current.collapsed === collapsed ? current : { key: key.current, collapsed });
        const appBar = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--mobile-app-bar-height')) || 56;
        const onScroll = (event: Event) => {
            const target = event.target;
            if (!(target instanceof HTMLElement) || !target.closest('main')) return;
            // Small boxes (code blocks, dropdown lists) scroll without moving the chrome.
            if (target.clientHeight < window.innerHeight * 0.4) return;
            const top = target.scrollTop;
            const previous = last.get(target) ?? top;
            last.set(target, top);
            const delta = top - previous;
            if (!delta) return;
            // Near the top, both bars are always shown.
            if (top <= appBar()) { travel = 0; set(false); return; }
            // Restart the count whenever the direction flips.
            travel = Math.sign(delta) === Math.sign(travel) ? travel + delta : delta;
            if (travel > THRESHOLD) set(true);
            else if (travel < -THRESHOLD) set(false);
        };
        document.addEventListener('scroll', onScroll, { capture: true, passive: true });
        return () => document.removeEventListener('scroll', onScroll, { capture: true });
    }, [enabled]);

    return enabled && state.key === resetKey && state.collapsed;
}
