import clsx from 'clsx';
import { createContext, useContext, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigationSnapshot } from '@/hooks/navigation';
import { animate, LayoutGroup, motion } from 'motion/react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { expectScrollRestore } from '@/hooks/use-scroll-collapse';
import { motionEase, motionTiming } from './v2/styles';

/**
 * Shared shell for list/detail configuration pages. Keeps both workspaces aligned.
 *
 * From md the directory and the detail sit side by side. Below md they are one
 * screen at a time, full-bleed like a native list: opening a record shows the
 * detail from the top, and closing it returns to the list where it was left.
 */
export function WorkspaceLayout({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={clsx('grid min-w-0 items-start md:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]', className)}>
        {children}
    </div>;
}

const PHONE = '(max-width: 767px)';
/** Full-bleed on phones: the page gutter is cancelled so rows and editors use the whole width. */
const phoneBleed = 'max-md:-mx-[var(--page-gutter)] max-md:rounded-none max-md:border-x-0';

const pageScroller = (element: HTMLElement | null) => element?.closest<HTMLElement>('[data-ui-transition="page"]') ?? null;

/**
 * Below md the directory and detail share the page scroller. Leaving the list
 * stores its scroll offset (per history entry) and starts the detail at the
 * top; Back restores the offset, so long lists do not jump to their start.
 *
 * The offset is tracked while the list scrolls. It cannot be read when the list
 * hides: by then the page is only as tall as the detail (a spinner on first
 * open), and the browser has already clamped the scroller to that height.
 */
function usePhoneListScroll(hidden: boolean, element: HTMLElement | null) {
    const phone = useMediaQuery(PHONE);
    const { index } = useNavigationSnapshot();
    const saved = useRef(new Map<number, number>());
    const previous = useRef(hidden);
    const listIndex = useRef(index);
    const listTop = useRef(0);
    useEffect(() => {
        const scroller = phone ? pageScroller(element) : null;
        if (!scroller) return;
        const track = () => { if (!previous.current) listTop.current = scroller.scrollTop; };
        track();
        scroller.addEventListener('scroll', track, { passive: true });
        return () => scroller.removeEventListener('scroll', track);
    }, [phone, element]);
    useLayoutEffect(() => {
        const scroller = phone ? pageScroller(element) : null;
        const was = previous.current;
        previous.current = hidden;
        if (!scroller || was === hidden) {
            if (hidden) return;
            // A record that is still loading keeps the list on screen under its new entry.
            if (scroller && listIndex.current !== index) saved.current.set(listIndex.current, listTop.current);
            listIndex.current = index;
            return;
        }
        if (hidden) {
            saved.current.set(listIndex.current, listTop.current);
            scroller.scrollTop = 0;
        } else {
            listIndex.current = index;
            const top = saved.current.get(index);
            if (top === undefined) { listTop.current = scroller.scrollTop; return; }
            // Returning to the list is not the user scrolling down; the bars stay as they are.
            expectScrollRestore(scroller);
            scroller.scrollTop = top;
            listTop.current = top;
            if (scroller.scrollTop >= top) return;
            // Near its end the list needs the padding of the bars that return with it (tab bar, section tabs).
            const frame = requestAnimationFrame(() => { if (!previous.current && listIndex.current === index) { expectScrollRestore(scroller); scroller.scrollTop = top; } });
            return () => cancelAnimationFrame(frame);
        }
    }, [hidden, phone, element, index]);
}

export function WorkspaceDirectory({ children, label, hiddenOnMobile = false }: {
    children: ReactNode;
    label: string;
    hiddenOnMobile?: boolean;
}) {
    const scope = useId();
    const [element, setElement] = useState<HTMLElement | null>(null);
    usePhoneListScroll(hiddenOnMobile, element);
    // The isolated stacking context lets the sliding selection pass underneath every row's text.
    return <LayoutGroup id={scope}><aside ref={setElement} aria-label={label} className={clsx(
        'workspace-directory isolate min-w-0 rounded-ui-lg border border-ui-border bg-ui-surface-muted/50 p-2 md:mr-4',
        'max-md:bg-ui-surface max-md:px-1 max-md:py-1', phoneBleed,
        hiddenOnMobile && 'hidden md:block',
    )}>{children}</aside></LayoutGroup>;
}

const DETAIL_MIN_HEIGHT = 320;
const SPINNER_DELAY_MS = 200;
const HEIGHT_HOLD_MS = 3000;
const DETAIL_ENTER_OFFSET = 12;

/**
 * Swaps editors as one step: the outgoing height stays reserved and the next editor
 * stays hidden until it has loaded, so fast requests never flash a spinner.
 */
function useDetailSwap(key: string, order: number, reducedMotion: boolean, phone: boolean) {
    const [content, setContent] = useState<HTMLElement | null>(null);
    const [held, setHeld] = useState<{ key: string; minHeight?: number; hidden?: boolean }>({ key });
    const shownKey = useRef(key);
    const shownOrder = useRef(order);
    if (held.key !== key) {
        // Updating during render reads the outgoing editor before React replaces it.
        const height = content?.getBoundingClientRect().height ?? 0;
        setHeld({ key, minHeight: height > DETAIL_MIN_HEIGHT ? height : undefined, hidden: true });
    }
    useLayoutEffect(() => {
        if (!content || shownKey.current === key) return;
        shownKey.current = key;
        // The editor enters from the side of the list it was picked from.
        const direction = order >= 0 && shownOrder.current >= 0 && order < shownOrder.current ? -1 : 1;
        shownOrder.current = order;
        const spinner = setTimeout(() => setHeld(current => ({ ...current, hidden: false })), SPINNER_DELAY_MS);
        const hold = setTimeout(() => setHeld(current => ({ ...current, minHeight: undefined })), HEIGHT_HOLD_MS);
        const observer = new MutationObserver(() => settle());
        const stop = () => { clearTimeout(spinner); clearTimeout(hold); observer.disconnect(); };
        const settle = () => {
            if (content.querySelector('[data-loading]')) return;
            stop();
            setHeld(current => ({ key: current.key }));
            // Only the keyed editor moves, so its styles leave with it on the next swap.
            const editor = content.firstElementChild;
            // A phone opens the detail as the next screen, so it slides in from the right.
            if (!reducedMotion && editor) void animate(editor, phone
                ? { opacity: [0, 1], x: [DETAIL_ENTER_OFFSET * 1.5, 0] }
                : { opacity: [0, 1], y: [direction * DETAIL_ENTER_OFFSET, 0] }, { duration: motionTiming.slow, ease: motionEase.standard });
        };
        observer.observe(content, { childList: true, subtree: true });
        settle();
        return stop;
    }, [key, order, content, reducedMotion, phone]);
    return { setContent, minHeight: held.minHeight, hidden: held.hidden };
}

const DetailHidden = createContext(false);
/** True inside a detail pane that a phone is not showing (the list is on screen instead). */
export const useDetailHiddenOnPhone = () => useContext(DetailHidden);

export function WorkspaceDetail({ children, hiddenOnMobile = false, transitionKey = 'workspace', order = -1 }: { children: ReactNode; hiddenOnMobile?: boolean; transitionKey?: string; /** Position of the selected row; -1 when it has none. */ order?: number }) {
    const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
    const phone = useMediaQuery(PHONE);
    const { setContent, minHeight, hidden } = useDetailSwap(transitionKey, order, reducedMotion, phone);
    // @container lets editors adapt to the pane's width, which differs from the viewport's beside a directory.
    return <div className={clsx('@container min-w-0 rounded-ui-lg border border-ui-border bg-ui-surface p-4 xl:p-5', 'max-md:px-[var(--page-gutter)] max-md:pt-3', phoneBleed, hiddenOnMobile && 'hidden md:block')}>
        <div className="min-w-0" style={{ minHeight }}><div ref={setContent} className="min-w-0" style={{ opacity: hidden ? 0 : undefined }}>
            {/* Very wide panes cap the editor's line length instead of stretching every field. */}
            <div data-ui-transition="detail" key={transitionKey} className="min-w-0 min-h-80 max-w-[1120px]"><DetailHidden.Provider value={hiddenOnMobile}>{children}</DetailHidden.Provider></div>
        </div></div>
    </div>;
}

/** One highlight that slides between rows. WorkspaceDirectory provides its stacking context. */
export function WorkspaceSelectionMarker() {
    const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
    return <motion.span aria-hidden="true" layoutId="workspace-selection" className="absolute inset-0 -z-10 rounded-[inherit] bg-ui-selected" transition={reducedMotion ? { duration: 0 } : { duration: motionTiming.normal, ease: 'easeOut' }}>
        <span className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-ui-primary" />
    </motion.span>;
}
