import type { ReactNode } from 'react';
import { cn } from './styles';

/**
 * Title row shared by top-level pages. Below lg the App Bar already names the
 * page, so the h1 stays available to assistive technology only.
 */
export function PageHeader({ title, description, actions, className, embedded = false }: {
    title: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
    className?: string;
    /** Renders a visible h2 for a page section reused inside another page. */
    embedded?: boolean;
}) {
    const Heading = embedded ? 'h2' : 'h1';
    const collapsesOnMobile = !embedded && !description && !actions;
    return <header className={cn('flex flex-wrap items-center justify-between gap-4', collapsesOnMobile ? 'lg:mb-6' : 'mb-6', className)}>
        <div className="min-w-0">
            <Heading className={cn('tracking-tight text-ui-heading', embedded ? 'm-0 text-base font-medium' : 'sr-only text-2xl font-semibold lg:not-sr-only')}>{title}</Heading>
            {description && <p className="mt-1 text-sm text-ui-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>;
}
