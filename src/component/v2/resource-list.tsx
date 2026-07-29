import clsx from "clsx";
import { ChevronRight } from "lucide-react";
import type { ElementType, KeyboardEvent, ReactNode } from "react";
import { Card, CardBody, CardFooter, CardHeader } from "./card";
import { Pagination } from "./pagination";

type ResourceListPagination = {
    currentPage: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
};

export type ResourceFact = {
    label: string;
    value: ReactNode;
    mono?: boolean;
    className?: string;
};

export function ResourceList<T>({
    items,
    renderItem,
    getKey,
    header,
    empty = "No records yet.",
    pagination,
    footer,
    className,
}: {
    items: T[];
    renderItem: (item: T, index: number) => ReactNode;
    getKey?: (item: T, index: number) => string | number;
    header: ReactNode;
    empty?: ReactNode;
    pagination?: ResourceListPagination;
    footer?: ReactNode;
    className?: string;
}) {
    const totalPages = pagination
        ? Math.max(1, Math.ceil(pagination.totalItems / pagination.pageSize))
        : 1;
    const currentPage = pagination
        ? Math.min(Math.max(pagination.currentPage, 1), totalPages)
        : 1;

    return (
        <Card density="compact" className={clsx("overflow-hidden", className)}>
            <CardHeader>{header}</CardHeader>
            <CardBody density="compact" className="!p-0">
                {items.length > 0 ? (
                    <div className="flex flex-col divide-y divide-ui-border/70">
                        {items.map((item, index) => (
                            <div key={getKey?.(item, index) ?? index} className="min-w-0 px-4 py-1">
                                {renderItem(item, index)}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="px-4 py-10 text-center text-sm text-ui-muted">{empty}</div>
                )}
            </CardBody>
            {(pagination || footer) && (
                <CardFooter compact className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs font-medium text-ui-muted">
                        {pagination && `${pagination.totalItems} items${totalPages > 1 ? ` · page ${currentPage}/${totalPages}` : ""}`}
                    </div>
                    <div className="flex items-center gap-3">
                        {footer}
                        {pagination && totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalItems={pagination.totalItems}
                                pageSize={pagination.pageSize}
                                onPageChange={pagination.onPageChange}
                            />
                        )}
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}

export function ResourceRow({
    icon: Icon,
    title,
    subtitle,
    badges,
    facts,
    actions,
    onClick,
    disabled = false,
    iconClassName,
    className,
}: {
    icon: ElementType;
    title: ReactNode;
    subtitle?: ReactNode;
    badges?: ReactNode;
    facts?: ResourceFact[];
    actions?: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    iconClassName?: string;
    className?: string;
}) {
    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.target !== event.currentTarget || !onClick || (event.key !== "Enter" && event.key !== " ")) return;
        event.preventDefault();
        onClick();
    };

    return (
        <div
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            onClick={onClick}
            onKeyDown={handleKeyDown}
            className={clsx(
                "group flex min-h-[84px] min-w-0 items-center gap-3 rounded-ui-lg px-3 py-3",
                "transition-[background-color,border-color,box-shadow] duration-150",
                onClick && "cursor-pointer hover:bg-ui-surface-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-primary/30",
                disabled && "opacity-60",
                className,
            )}
            aria-disabled={disabled || undefined}
        >
            <div className={clsx("flex h-10 w-10 shrink-0 items-center justify-center rounded-ui-lg border border-ui-primary/15 bg-ui-primary-soft text-ui-primary", iconClassName)}>
                <Icon size={18} strokeWidth={1.9} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
                <div className="min-w-0 sm:w-[min(30%,260px)] sm:shrink-0">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <div className="min-w-0 truncate text-[0.95rem] font-semibold text-ui-heading" title={typeof title === "string" ? title : undefined}>
                            {title}
                        </div>
                        {badges}
                    </div>
                    {subtitle && <div className="mt-1 truncate text-xs text-ui-muted">{subtitle}</div>}
                </div>
                {facts && facts.length > 0 && (
                    <div className="grid min-w-0 flex-1 grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
                        {facts.map((fact) => (
                            <div key={fact.label} className={clsx("min-w-0", fact.className)}>
                                <div className="truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-ui-muted/75">{fact.label}</div>
                                <div className={clsx("mt-1 truncate text-xs font-medium text-ui-fg", fact.mono && "font-mono")} title={typeof fact.value === "string" ? fact.value : undefined}>
                                    {fact.value}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex shrink-0 items-center gap-1.5" onClick={(event) => event.stopPropagation()}>
                {actions}
                {onClick && <ChevronRight aria-hidden="true" className="ml-1 text-ui-muted opacity-60" size={18} />}
            </div>
        </div>
    );
}
