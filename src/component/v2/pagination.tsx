
import { clampPage } from "@/hooks/use-pagination";
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
    currentPage: requestedPage,
    totalItems,
    pageSize,
    onPageChange,
    className
}: PaginationProps) {
    const { t } = useTranslation('common');
    const totalPages = Math.max(1, Math.ceil(totalItems / Math.max(1, pageSize)));
    const currentPage = clampPage(requestedPage, totalItems, pageSize);
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

    const controlClass = "h-11 min-w-11 sm:h-8 sm:min-w-8 rounded-ui-md border-ui-border bg-transparent text-ui-muted hover:bg-ui-surface-muted hover:text-ui-fg";
    const mobileControlClass = "h-11 min-w-11 rounded-ui-md border-transparent bg-transparent text-ui-fg hover:bg-ui-surface-muted disabled:!border-transparent disabled:!bg-transparent disabled:text-ui-muted/40";
    const pageClass = "h-11 min-w-11 sm:h-8 sm:min-w-8 rounded-ui-md border-transparent bg-transparent text-ui-muted hover:border-ui-border hover:bg-ui-surface-muted hover:text-ui-fg";
    const activePageClass = "!border-ui-border-strong !bg-ui-selected !text-ui-heading font-medium tabular-nums shadow-none";

    if (totalPages <= 1) return <Button variant="outline-secondary" size="icon" className={`${pageClass} ${activePageClass}`} aria-current="page" disabled>1</Button>;

    return (
        <div className={clsx("w-full min-w-0 max-w-full sm:w-auto", className)}>
            <div className="flex w-full items-center justify-between sm:hidden">
                <Button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label={t('pagination.previous')}
                    size="icon"
                    variant="outline-secondary"
                    className={mobileControlClass}
                >
                    <ChevronLeft size={18} />
                </Button>
                <div className="flex items-center text-sm tabular-nums">
                    <Select
                        value={String(currentPage)}
                        onValueChange={(value) => onPageChange(Number(value))}
                        items={Array.from({ length: totalPages }, (_, index) => ({ value: String(index + 1), label: String(index + 1) }))}
                        ariaLabel={t('pagination.page')}
                        size="sm"
                        triggerClassName="h-11 w-auto min-w-0 gap-0 border-0 bg-transparent px-1.5 font-medium tabular-nums text-ui-heading shadow-none [&_svg]:hidden"
                        contentClassName="min-w-[72px]"
                        viewportClassName="max-h-[min(50vh,320px)]"
                    />
                    <span className="whitespace-nowrap text-ui-muted">/ {totalPages}</span>
                </div>
                <Button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label={t('pagination.next')}
                    size="icon"
                    variant="outline-secondary"
                    className={mobileControlClass}
                >
                    <ChevronRight size={18} />
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
