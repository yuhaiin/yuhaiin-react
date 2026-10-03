import { useEffect, useState } from 'react';

export function clampPage(page: number, totalItems: number, pageSize: number): number {
    const totalPages = Math.max(1, Math.ceil(totalItems / Math.max(1, pageSize)));
    return Math.max(1, Math.min(totalPages, Math.trunc(page) || 1));
}

/** Reset on filters/sorting; derive a valid page before slicing during refresh. */
export function usePagination(totalItems: number, pageSize: number, resetKey = '') {
    const [selection, setSelection] = useState({ key: resetKey, page: 1 });
    const requestedPage = selection.key === resetKey ? selection.page : 1;
    const page = clampPage(requestedPage, totalItems, pageSize);
    useEffect(() => {
        if (selection.key !== resetKey || selection.page !== page) {
            setSelection({ key: resetKey, page });
        }
    }, [selection, resetKey, page]);
    return { page, setPage: (next: number) => setSelection({ key: resetKey, page: clampPage(next, totalItems, pageSize) }) };
}

/** After deletion, refetch the last valid page using the returned server total. */
export function useServerPageClamp(meta: { page: number; pageSize: number; total: number } | undefined, page: number, setPage: (page: number) => void) {
    useEffect(() => {
        if (!meta || meta.page !== page || !meta.pageSize) return;
        const next = clampPage(page, meta.total, meta.pageSize);
        if (next !== page) setPage(next);
    }, [meta, page, setPage]);
}
