'use client';

import { clsx } from "clsx";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "./button";

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
        <div className={clsx("flex items-center gap-0.5", className)}>
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
    );
}
