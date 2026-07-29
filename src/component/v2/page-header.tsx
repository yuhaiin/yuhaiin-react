import type { ElementType, ReactNode } from "react";
import clsx from "clsx";

type PageHeaderProps = {
    eyebrow?: string;
    title: string;
    description?: string;
    icon?: ElementType;
    actions?: ReactNode;
    className?: string;
};

export function PageHeader({
    actions,
    className,
}: PageHeaderProps) {
    if (!actions) return null;

    return <div className={clsx("ui-page-header-actions mb-4 flex flex-wrap items-center justify-end gap-2", className)}>{actions}</div>;
}
