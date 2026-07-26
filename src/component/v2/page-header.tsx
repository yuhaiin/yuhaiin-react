import type { ElementType, ReactNode } from "react";
import clsx from "clsx";

export function PageHeader({
    eyebrow,
    title,
    description,
    icon: Icon,
    actions,
    className,
}: {
    eyebrow?: string;
    title: string;
    description?: string;
    icon?: ElementType;
    actions?: ReactNode;
    className?: string;
}) {
    return (
        <header className={clsx("ui-page-toolbar ui-page-header", className)}>
            <div className="ui-page-header-copy flex min-w-0 items-start gap-3">
                {Icon && (
                    <div className="ui-page-header-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-ui-lg border border-ui-primary/15 bg-ui-primary-soft text-ui-primary">
                        <Icon size={21} strokeWidth={1.9} />
                    </div>
                )}
                <div className="ui-page-header-content min-w-0">
                    {eyebrow && <div className="ui-section-label mb-1">{eyebrow}</div>}
                    <h1 className="ui-page-heading mb-1 truncate">{title}</h1>
                    {description && <p className="ui-page-description mb-0 max-w-2xl">{description}</p>}
                </div>
            </div>
            {actions && <div className="ui-page-header-actions flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
    );
}
