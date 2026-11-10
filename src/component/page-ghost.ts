import { navigation } from '@/hooks/navigation';

const pathOf = (location: string) => location.split('?')[0];
/** Pages larger than this leave at once; copying them would cost more than the fade gives. */
const MAX_ELEMENTS = 2500;
const EXIT_MS = 120;

/**
 * Lets a page fade out while the next one enters.
 *
 * The next page mounts at once and the old one unmounts at once: its requests,
 * streams and URL-driven effects stop with the navigation. What stays for the
 * length of the fade is an inert copy of its DOM, so nothing in it can react
 * to the new location (which a still-mounted old page would).
 *
 * Returns a ref callback for the page scroller; React runs its cleanup while
 * the node is still in the document.
 */
export function pageExitGhost(location: string) {
    return (page: HTMLElement | null) => {
        if (!page) return;
        return () => leave(page, location);
    };
}

function leave(page: HTMLElement, location: string) {
    const parent = page.parentElement;
    // Strict Mode re-attaches refs and the session shell remounts the page: no page was left.
    if (!parent || pathOf(navigation.current.location) === pathOf(location)) return;
    if (typeof page.animate !== 'function' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const elements = page.getElementsByTagName('*');
    if (elements.length > MAX_ELEMENTS) return;

    const ghost = page.cloneNode(true) as HTMLElement;
    // The page padding follows the bars; freeze it so the copy does not move when they change.
    const style = getComputedStyle(page);
    ghost.style.paddingTop = style.paddingTop;
    ghost.style.paddingBottom = style.paddingBottom;
    ghost.style.transform = 'none';
    ghost.style.opacity = style.opacity;
    ghost.style.pointerEvents = 'none';
    ghost.removeAttribute('data-ui-transition');
    ghost.setAttribute('aria-hidden', 'true');
    ghost.inert = true;
    ghost.querySelectorAll('iframe, video, audio').forEach(node => node.remove());

    // A clone has neither scroll positions nor canvas pixels.
    const copies = ghost.getElementsByTagName('*');
    const scrolled: [Element, number, number][] = [];
    if (copies.length === elements.length) {
        for (let index = 0; index < elements.length; index++) {
            const source = elements[index];
            if (source.scrollTop || source.scrollLeft) scrolled.push([copies[index], source.scrollTop, source.scrollLeft]);
            if (source instanceof HTMLCanvasElement && source.width && source.height) {
                try { (copies[index] as HTMLCanvasElement).getContext('2d')?.drawImage(source, 0, 0); } catch { /* a blank chart for 120ms */ }
            }
        }
    }
    const top = page.scrollTop;
    parent.insertBefore(ghost, page);
    ghost.scrollTop = top;
    scrolled.forEach(([node, y, x]) => { node.scrollTop = y; node.scrollLeft = x; });

    const remove = () => ghost.remove();
    const animation = ghost.animate([{ opacity: Number(style.opacity) || 1 }, { opacity: 0 }], { duration: EXIT_MS, easing: 'ease-out', fill: 'forwards' });
    animation.onfinish = remove;
    animation.oncancel = remove;
    // A hidden tab pauses animations; never leave a copy behind.
    window.setTimeout(remove, EXIT_MS * 4);
}
