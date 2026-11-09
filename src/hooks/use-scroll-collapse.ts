import { useEffect, useRef, useState } from 'react';

/** Scroll distance in one direction before the bars move, so small jitters do not toggle them. */
const THRESHOLD = 24;

/**
 * Phone App Bar and tab bar collapse while the page scrolls down and return on
 * any scroll up, near the top, or on a page change (like native app bars).
 *
 * Any large vertical scroller inside `main` counts: the page scroller and the
 * virtual lists that scroll on their own (connections, logs, nodes).
 *
 * `reclaim` is set when an inner scroller collapsed the bars. Such pages fill
 * the viewport and do not scroll themselves, so the padding the bars occupied
 * would stay empty; the page gives it to the list instead (see global.css). A
 * scrolling page keeps its padding, so its content never jumps.
 */
/**
 * `resetKey` must change on every navigation, including a return to an earlier
 * page (pass the navigation snapshot, which is a new object per entry change).
 */
export function useScrollCollapse(resetKey: unknown, enabled: boolean) {
    // The state remembers which page collapsed it; another page reads as shown,
    // so a page change restores the bars without a render-phase reset.
    const [state, setState] = useState({ key: resetKey, collapsed: false, reclaim: false });
    const key = useRef(resetKey);
    useEffect(() => { key.current = resetKey; }, [resetKey]);

    useEffect(() => {
        if (!enabled) return;
        const last = new WeakMap<Element, number>();
        let travel = 0;
        const set = (collapsed: boolean, reclaim: boolean) => setState(current =>
            current.key === key.current && current.collapsed === collapsed && current.reclaim === reclaim ? current : { key: key.current, collapsed, reclaim });
        const appBar = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--mobile-app-bar-height')) || 56;
        const onScroll = (event: Event) => {
            const target = event.target;
            if (!(target instanceof HTMLElement) || !target.closest('main')) return;
            // Small boxes (code blocks, dropdown lists) scroll without moving the chrome.
            if (target.clientHeight < window.innerHeight * 0.4) return;
            const top = target.scrollTop;
            // Reclaim only for a full-height page: when the page itself scrolls too
            // (Nodes: page plus a virtual list), shrinking its padding would move it.
            const page = target.closest('main')?.querySelector<HTMLElement>('[data-ui-transition="page"]');
            const inner = !target.matches('[data-ui-transition="page"]') && Boolean(page) && page!.scrollHeight - page!.clientHeight <= 1;
            const previous = last.get(target) ?? top;
            last.set(target, top);
            const delta = top - previous;
            if (!delta) return;
            // Near the top, both bars are always shown.
            if (top <= appBar()) { travel = 0; set(false, false); return; }
            // Restart the count whenever the direction flips.
            travel = Math.sign(delta) === Math.sign(travel) ? travel + delta : delta;
            if (travel > THRESHOLD) set(true, inner);
            else if (travel < -THRESHOLD) set(false, false);
        };
        document.addEventListener('scroll', onScroll, { capture: true, passive: true });
        return () => document.removeEventListener('scroll', onScroll, { capture: true });
    }, [enabled]);

    const collapsed = enabled && state.key === resetKey && state.collapsed;
    return { collapsed, reclaim: collapsed && state.reclaim };
}
