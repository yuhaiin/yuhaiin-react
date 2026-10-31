import type { ReactNode } from 'react';
import { cn } from './styles';

/**
 * Title row shared by top-level pages. Below lg the App Bar already names the
 * page, so the h1 stays available to assistive technology only.
 */
export function PageHeader({ title, description, actions, className, embedded = false, stickyActions = false }: {
    title: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
    className?: string;
    /** Renders a visible h2 for a page section reused inside another page. */
    embedded?: boolean;
    /**
     * Below lg, keeps the actions under the App Bar. `contents` lets them stick
     * within the whole page instead of the header. The page scroller's top
     * padding already clears the App Bar, so -top-3 only removes its 12px gap.
     */
    stickyActions?: boolean;
}) {
    const Heading = embedded ? 'h2' : 'h1';
    const collapsesOnMobile = !embedded && !description && !actions;
    return <header className={cn('flex flex-wrap items-center justify-between gap-4', collapsesOnMobile ? 'lg:mb-6' : 'mb-6', className, stickyActions && 'max-lg:contents')}>
        <div className="min-w-0">
            <Heading className={cn('tracking-tight text-ui-heading', embedded ? 'm-0 text-base font-medium' : 'sr-only text-2xl font-semibold lg:not-sr-only')}>{title}</Heading>
            {description && <p className="mt-1 text-sm text-ui-muted">{description}</p>}
        </div>
        {actions && <div className={cn('flex flex-wrap items-center gap-2', stickyActions && 'max-lg:sticky max-lg:-top-3 max-lg:z-10 max-lg:-mx-3 max-lg:mb-2 max-lg:bg-ui-bg max-lg:px-3 max-lg:py-2 sm:max-lg:-mx-5 sm:max-lg:px-5')}>{actions}</div>}
    </header>;
}
