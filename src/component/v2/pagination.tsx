'use client';

import { clsx } from "clsx";
import { ChevronLeft, ChevronRight, ThreeDots } from "react-bootstrap-icons";
import styles from "./button.module.css";

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

    if (totalPages <= 1) return null;

    return (
        <div className={clsx("d-flex align-items-center gap-2", className)}>
            <button
                className={clsx(styles['custom-btn'], styles.sm, styles['custom-btn-outline-secondary'])}
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
                style={{ height: '32px', minWidth: '32px' }}
            >
                <ChevronLeft size={16} />
            </button>

            <div className="d-flex align-items-center gap-1">
                {pages.map((item, idx) =>
                    item === 'ellipsis' ? (
                        <div key={'e' + idx} className="d-flex align-items-end justify-content-center text-muted" style={{ width: '32px', height: '32px', paddingBottom: '4px' }}>
                            <ThreeDots />
                        </div>
                    ) : (
                        <button
                            key={item}
                            onClick={() => onPageChange(item)}
                            className={clsx(
                                styles['custom-btn'],
                                styles.sm,
                                item === currentPage ? styles['custom-btn-primary'] : styles['custom-btn-outline-secondary']
                            )}
                            style={{ minWidth: '32px', height: '32px', padding: '0' }}
                        >
                            {item}
                        </button>
                    )
                )}
            </div>

            <button
                className={clsx(styles['custom-btn'], styles.sm, styles['custom-btn-outline-secondary'])}
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
                style={{ height: '32px', minWidth: '32px' }}
            >
                <ChevronRight size={16} />
            </button>
        </div>
    );
}
