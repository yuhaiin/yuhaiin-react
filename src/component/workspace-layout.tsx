import clsx from 'clsx';
import type { ReactNode } from 'react';

/** Shared shell for list/detail configuration pages. Keeps both workspaces aligned. */
export function WorkspaceLayout({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={clsx('grid min-w-0 items-start md:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]', className)}>
        {children}
    </div>;
}

export function WorkspaceDirectory({ children, label, hiddenOnMobile = false }: {
    children: ReactNode;
    label: string;
    hiddenOnMobile?: boolean;
}) {
    return <aside aria-label={label} className={clsx(
        'min-w-0 rounded-ui-xl border border-ui-border/60 bg-ui-surface-muted/30 p-2.5 md:mr-5',
        hiddenOnMobile && 'hidden md:block',
    )}>{children}</aside>;
}

export function WorkspaceDetail({ children, hiddenOnMobile = false }: { children: ReactNode; hiddenOnMobile?: boolean }) {
    return <div className={clsx('min-w-0 md:pl-3 xl:pl-5', hiddenOnMobile && 'hidden md:block')}>{children}</div>;
}
