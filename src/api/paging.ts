type Page = { page: number; pageSize: number; total: number };
type PageResult<T> = { items: T[]; page: Page };

/** The server caps pages at 100; a large page_size never means "all". */
export async function collectPages<T>(fetchPage: (options: { page: number; pageSize: number }) => Promise<PageResult<T>>): Promise<PageResult<T>> {
    const items: T[] = [];
    for (let page = 1; ; page++) {
        const result = await fetchPage({ page, pageSize: 100 });
        if (result.page.page && result.page.page !== page) throw new Error('The server returned an unexpected page; refresh to retry');
        items.push(...result.items);
        if (items.length >= result.page.total) return { items, page: { page: 1, pageSize: items.length, total: items.length } };
        if (!result.items.length) throw new Error('The server returned an empty page before the end of the list');
    }
}
