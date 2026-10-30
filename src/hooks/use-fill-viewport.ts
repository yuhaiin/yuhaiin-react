import { useLayoutEffect, useState } from 'react';

const PAGE_BOTTOM_PADDING = 20;
const MIN_HEIGHT = 320;

/** Ends a panel at the bottom of the page so its inner list uses the whole viewport. */
export function useFillViewport() {
    const [element, setElement] = useState<HTMLElement | null>(null);
    const [top, setTop] = useState<number>();
    useLayoutEffect(() => {
        if (!element) return;
        const measure = () => {
            let next = element.getBoundingClientRect().top;
            for (let parent = element.parentElement; parent; parent = parent.parentElement) next += parent.scrollTop;
            setTop(next);
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, [element]);
    const maxHeight = top === undefined ? undefined : `max(${MIN_HEIGHT}px, calc(100dvh - ${top + PAGE_BOTTOM_PADDING}px - env(safe-area-inset-bottom)))`;
    return [setElement, maxHeight] as const;
}
