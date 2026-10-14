import { useId, type ReactNode } from 'react';
import { cn, ui } from './styles';

/** Ordinary fields use headings and dividers; only status/diagnostics need panels. */
export function FormSection({ title, description, actions, children, className }: {
    title: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
    children: ReactNode;
    className?: string;
}) {
    const id = useId();
    return <section aria-labelledby={id} className={cn('[--field-margin:0px] grid min-w-0 grid-cols-1 content-start gap-3 border-t border-ui-border pt-5 first:border-t-0 first:pt-0', className)}>
        <header className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0"><h3 id={id} className={ui.sectionTitle}>{title}</h3>
                {description && <p className="mt-1 text-xs leading-relaxed text-ui-muted">{description}</p>}</div>
            {actions}
        </header>
        {children}
    </section>;
}
