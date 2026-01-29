'use client';

import { clsx } from "clsx";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
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

    if (totalPages <= 1) return <Button variant="primary" size="icon"
        style={{
            minWidth: '32px',
            height: '32px',
            padding: '0',
            fontSize: '12px',
            fontWeight: 'inherit'
        }}>1</Button>;

    return (
        <div className={clsx("flex items-center gap-2", className)}>
            <Button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
                size="icon"
            >
                <ChevronLeft size={16} />
            </Button>

            <div className="flex items-center gap-1">
                {pages.map((item, idx) =>
                    item === 'ellipsis' ? (
                        <div key={'e' + idx} className="flex items-end justify-center pb-1 text-[var(--bs-secondary-color)] w-[32px] h-[32px]">
                            <MoreHorizontal size={16} />
                        </div>
                    ) : (
                        <Button
                            key={item}
                            onClick={() => onPageChange(item)}
                            size="icon"
                            variant={item === currentPage ? "primary" : "outline-secondary"}
                            style={{
                                minWidth: '32px',
                                height: '32px',
                                padding: '0',
                                fontSize: '12px',
                                fontWeight: 'inherit'
                            }}
                        >
                            {item}
                        </Button>
                    )
                )}
            </div>

            <Button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
                size="icon"
            >
                <ChevronRight size={16} />
            </Button>
        </div>
    );
}
