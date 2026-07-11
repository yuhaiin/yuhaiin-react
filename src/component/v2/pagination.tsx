'use client';

import { clsx } from "clsx";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "./button";
import { Select } from "./select";

export interface PaginationProps {
    currentPage: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export function Pagination({
    currentPage,
    totalItems,
    pageSize,
    onPageChange,
    className
}: PaginationProps) {
    const { t } = useTranslation('common');
    const totalPages = Math.ceil(totalItems / pageSize);
    const pages: (number | 'ellipsis')[] = [];

    const maxVisible = 5;
    const side = 2;

    if (totalPages <= maxVisible + 2) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        if (currentPage <= side + 2) {
            for (let i = 1; i <= maxVisible; i++) pages.push(i);
            pages.push('ellipsis');
            pages.push(totalPages);
        } else if (currentPage >= totalPages - side - 1) {
            pages.push(1);
            pages.push('ellipsis');
            for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            pages.push('ellipsis');
            for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
            pages.push('ellipsis');
            pages.push(totalPages);
        }
    }

    const controlClass = "h-8 min-w-8 rounded-ui-md border-ui-border bg-transparent text-ui-muted hover:bg-ui-surface-muted hover:text-ui-fg";
    const pageClass = "h-8 min-w-8 rounded-ui-md border-transparent bg-transparent text-ui-muted hover:border-ui-border hover:bg-ui-surface-muted hover:text-ui-fg";
    const activePageClass = "!border-ui-primary/50 !bg-ui-primary-soft !text-ui-primary font-semibold shadow-none";

    if (totalPages <= 1) return <Button variant="outline-secondary" size="icon" className={`${pageClass} ${activePageClass}`}>1</Button>;

    return (
        <div className={clsx("min-w-0 max-w-full", className)}>
            <div className="flex items-center gap-2 sm:hidden">
                <Button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label={t('pagination.previous')}
                    size="icon"
                    variant="outline-secondary"
                    className={controlClass}
                >
                    <ChevronLeft size={16} />
                </Button>
                <div className="flex h-8 min-w-[112px] items-center rounded-ui-md border border-ui-primary/30 bg-ui-primary-soft pr-3 text-sm font-semibold tabular-nums text-ui-primary">
                    <div className="min-w-0 flex-1">
                        <Select
                            value={String(currentPage)}
                            onValueChange={(value) => onPageChange(Number(value))}
                            items={Array.from({ length: totalPages }, (_, index) => {
                                const page = index + 1;
                                return { value: String(page), label: String(page) };
                            })}
                            size="sm"
                            triggerClassName="!border-0 !bg-transparent !font-semibold !tabular-nums !text-ui-primary !shadow-none"
                            contentClassName="min-w-[72px]"
                            viewportClassName="max-h-[min(50vh,320px)]"
                        />
                    </div>
                    <span className="shrink-0 whitespace-nowrap text-ui-muted">/ {totalPages}</span>
                </div>
                <Button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label={t('pagination.next')}
                    size="icon"
                    variant="outline-secondary"
                    className={controlClass}
                >
                    <ChevronRight size={16} />
                </Button>
            </div>

            <div className="hidden items-center gap-0.5 sm:flex">
                <Button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label={t('pagination.previous')}
                    size="icon"
                    variant="outline-secondary"
                    className={controlClass}
                >
                    <ChevronLeft size={16} />
                </Button>

                <div className="flex items-center gap-0.5">
                    {pages.map((item, idx) =>
                        item === 'ellipsis' ? (
                            <div key={'e' + idx} className="flex h-8 w-6 items-center justify-center text-ui-muted">
                                <MoreHorizontal size={15} />
                            </div>
                        ) : (
                            <Button
                                key={item}
                                onClick={() => onPageChange(item)}
                                size="icon"
                                variant="outline-secondary"
                                className={`${pageClass} ${item === currentPage ? activePageClass : ""}`}
                                aria-current={item === currentPage ? "page" : undefined}
                            >
                                {item}
                            </Button>
                        )
                    )}
                </div>

                <Button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label={t('pagination.next')}
                    size="icon"
                    variant="outline-secondary"
                    className={controlClass}
                >
                    <ChevronRight size={16} />
                </Button>
            </div>
        </div>
    );
}
