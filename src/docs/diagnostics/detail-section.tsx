import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

/** Collapsed-by-default block in the detail panel; the summary line carries the verdict. */
export function DetailSection({ title, meta, status, alert, children, testId }: {
    title: ReactNode; meta?: ReactNode; status?: ReactNode; alert?: boolean; children: ReactNode; testId?: string;
}) {
    return <details className="group min-w-0 rounded-ui-md border border-ui-border/70" data-testid={testId}>
        <summary className="flex cursor-pointer list-none flex-wrap items-center gap-2 px-3 py-2 text-xs [&::-webkit-details-marker]:hidden">
            <ChevronRight size={14} aria-hidden="true" className="shrink-0 text-ui-muted transition-transform group-open:rotate-90" />
            <span className="font-medium text-ui-heading">{title}</span>
            {meta && <span className="text-ui-muted">{meta}</span>}
            {status && <span className={`ml-auto tabular-nums ${alert ? 'font-medium text-ui-warning' : 'text-ui-muted'}`}>{status}</span>}
        </summary>
        <div className="min-w-0 space-y-3 border-t border-ui-border/60 p-3">{children}</div>
    </details>;
}
