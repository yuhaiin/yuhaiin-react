import { useState } from 'react';

const normalize = (path: string) => path.replace(/\/+$/, '') || '/';

/** `child` sits below `parent` in the page hierarchy (e.g. `/docs/group/selectors` under `/docs/group`). */
const isDescendant = (child: string, parent: string) => parent !== child && (parent === '/' ? child !== '/' : child.startsWith(`${parent}/`));

/**
 * Direction of a page change: 1 moves forward/deeper, -1 back/up.
 *
 * 1. A history traversal wins: Back (a lower entry index) always reads as -1,
 *    so the Android Back gesture and the browser agree with the animation.
 * 2. Moving into a sub-page reads as 1, returning to its parent as -1.
 * 3. With `sectionOf` (phones), a move between two tab-bar sections is 0: the
 *    pages cross-fade in place, as tab switches do in native apps.
 * 4. Otherwise the visible navigation order decides.
 */
export function transitionDirection(from: string, to: string, routeOrder: readonly string[], fromIndex?: number, toIndex?: number, sectionOf?: (path: string) => string | undefined) {
    if (fromIndex !== undefined && toIndex !== undefined && toIndex < fromIndex) return -1;
    if (sectionOf && sectionOf(from) !== sectionOf(to)) return 0;
    if (isDescendant(to, from)) return 1;
    if (isDescendant(from, to)) return -1;
    const previous = routeOrder.findIndex(route => normalize(route) === from);
    const next = routeOrder.findIndex(route => normalize(route) === to);
    return next >= previous ? 1 : -1;
}

// Keep the direction for the entire transition, including unrelated rerenders.
// Updating during render avoids a previous-route effect resetting it mid-animation.
export function useSmartAnimation(location: string, routeOrder: readonly string[], historyIndex?: number, sectionOf?: (path: string) => string | undefined) {
    const path = normalize(location);
    const [transition, setTransition] = useState({ path, direction: 0, index: historyIndex });
    if (path === transition.path) {
        if (historyIndex !== transition.index) setTransition({ ...transition, index: historyIndex });
        return transition.direction;
    }
    const direction = transitionDirection(transition.path, path, routeOrder, transition.index, historyIndex, sectionOf);
    setTransition({ path, direction, index: historyIndex });
    return direction;
}
