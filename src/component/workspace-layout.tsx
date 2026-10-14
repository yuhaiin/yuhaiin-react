import clsx from 'clsx';
import { useId, type ReactNode } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { useMediaQuery } from '@/hooks/use-media-query';

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
    return <LayoutGroup id={scope}><aside aria-label={label} className={clsx(
        'min-w-0 rounded-ui-lg border border-ui-border bg-ui-surface-muted/50 p-2 md:mr-4',
        hiddenOnMobile && 'hidden md:block',
    )}>{children}</aside></LayoutGroup>;
}

export function WorkspaceDetail({ children, hiddenOnMobile = false, transitionKey = 'workspace' }: { children: ReactNode; hiddenOnMobile?: boolean; transitionKey?: string }) {
    const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
    return <div className={clsx('min-w-0 rounded-ui-lg border border-ui-border bg-ui-surface p-4 xl:p-5', hiddenOnMobile && 'hidden md:block')}>
        <AnimatePresence initial={false}>
        <motion.div data-ui-transition="detail" key={transitionKey} initial={reducedMotion ? false : { opacity: 0.65, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.18, ease: 'easeOut' }} className="min-w-0 min-h-80">{children}</motion.div>
        </AnimatePresence>
    </div>;
}

export function WorkspaceSelectionMarker() {
    const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
    return <motion.span aria-hidden="true" layoutId="workspace-selection" className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-ui-primary" transition={reducedMotion ? { duration: 0 } : { duration: 0.18, ease: 'easeOut' }} />;
}
