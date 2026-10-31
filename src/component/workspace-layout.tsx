import clsx from 'clsx';
import { useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { animate, LayoutGroup, motion } from 'motion/react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { motionTiming } from './v2/styles';

/** Shared shell for list/detail configuration pages. Keeps both workspaces aligned. */
export function WorkspaceLayout({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={clsx('grid min-w-0 items-start md:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]', className)}>
        {children}
    </div>;
}

export function WorkspaceDirectory({ children, label, hiddenOnMobile = false }: {
    children: ReactNode;
    label: string;
    hiddenOnMobile?: boolean;
}) {
    const scope = useId();
    // The isolated stacking context lets the sliding selection pass underneath every row's text.
    return <LayoutGroup id={scope}><aside aria-label={label} className={clsx(
        'isolate min-w-0 rounded-ui-lg border border-ui-border bg-ui-surface-muted/50 p-2 md:mr-4',
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
function useDetailSwap(key: string, order: number, reducedMotion: boolean) {
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
            if (!reducedMotion && editor) void animate(editor, { opacity: [0, 1], y: [direction * DETAIL_ENTER_OFFSET, 0] }, { duration: motionTiming.slow, ease: 'easeOut' });
        };
        observer.observe(content, { childList: true, subtree: true });
        settle();
        return stop;
    }, [key, order, content, reducedMotion]);
    return { setContent, minHeight: held.minHeight, hidden: held.hidden };
}

export function WorkspaceDetail({ children, hiddenOnMobile = false, transitionKey = 'workspace', order = -1 }: { children: ReactNode; hiddenOnMobile?: boolean; transitionKey?: string; /** Position of the selected row; -1 when it has none. */ order?: number }) {
    const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
    const { setContent, minHeight, hidden } = useDetailSwap(transitionKey, order, reducedMotion);
    return <div className={clsx('min-w-0 rounded-ui-lg border border-ui-border bg-ui-surface p-4 xl:p-5', hiddenOnMobile && 'hidden md:block')}>
        <div className="min-w-0" style={{ minHeight }}><div ref={setContent} className="min-w-0" style={{ opacity: hidden ? 0 : undefined }}>
            <div data-ui-transition="detail" key={transitionKey} className="min-w-0 min-h-80">{children}</div>
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
