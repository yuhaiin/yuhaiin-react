import { deleteFakeIPEntry, listFakeIPEntries } from '@/api/resolvers';
import { Button } from '@/component/v2/button';
import { confirmAction } from '@/component/v2/confirmation';
import { Input } from '@/component/v2/input';
import Loading from '@/component/v2/loading';
import { Pagination } from '@/component/v2/pagination';
import { Spinner } from '@/component/v2/spinner';
import { GlobalToastContext } from '@/component/v2/toast';
import type { FakeIPEntry } from '@/contract/resolver';
import { useAsyncAction, useCloseGuard } from '@/hooks/use-editor-draft';
import { useServerPageClamp } from '@/hooks/use-pagination';
import { RotateCw, Search, Trash } from 'lucide-react';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR, { useSWRConfig } from 'swr';
import { useDebounceValue } from 'usehooks-ts';

const PAGE_SIZE = 25;
const KEY = '/api/v2/resolver/fakeip/entries';

export function FakeIPList() {
    const { t } = useTranslation('routing');
    const { t: uiT } = useTranslation('ui');
    const ctx = useContext(GlobalToastContext);
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState('');
    const [debouncedQuery] = useDebounceValue(query.trim(), 250);
    const settled = debouncedQuery === query.trim();
    const { mutate: mutatePages } = useSWRConfig();
    const { data, error, isLoading, isValidating, mutate } = useSWR(
        settled ? [KEY, page, debouncedQuery] : null,
        () => listFakeIPEntries(page, PAGE_SIZE, debouncedQuery),
        { revalidateOnFocus: false, shouldRetryOnError: false },
    );
    useServerPageClamp(data?.page, page, setPage);
    const { pending, run } = useAsyncAction(error => ctx.Error(String((error as { msg?: string })?.msg ?? error)));
    useCloseGuard(false, pending, () => undefined);
    const remove = async (item: FakeIPEntry) => {
        if (pending || !await confirmAction(t('deleteFakeIPMapping', { domain: item.domain, ip: item.ip }))) return;
        void run(async () => {
            const result = await deleteFakeIPEntry(item);
            ctx.Info(t(result.removed ? 'fakeIPDeleted' : 'fakeIPAlreadyRemoved'));
            await mutatePages(key => Array.isArray(key) && key[0] === KEY, undefined, { revalidate: true });
        });
    };
    return <section aria-label={t('fakeIPTab')} className="min-w-0">
        <header className="mb-5"><h2 className="text-xl font-semibold text-ui-heading">{t('fakeIPTab')}</h2><p className="mt-2 text-sm text-ui-muted">{t('fakeIPListHelp')}</p></header>
        <div className="mb-4 flex items-center gap-3">
            <div className="relative min-w-0 flex-1 sm:max-w-sm"><Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ui-muted" aria-hidden="true" /><Input type="search" value={query} aria-label={t('searchFakeIP')} placeholder={t('searchFakeIP')} className="pl-9" onChange={event => { setQuery(event.target.value); setPage(1); }} /></div>
            <Button variant="outline-secondary" size="icon" aria-label={uiT('refresh')} disabled={!settled || isValidating || pending} onClick={() => void mutate()}>{isValidating ? <Spinner size="sm" /> : <RotateCw size={16} />}</Button>
            <span className="ml-auto shrink-0 text-xs tabular-nums text-ui-muted" role="status">{data?.page.total ?? 0}</span>
        </div>
        {error ? <Loading code={error.code} onRetry={() => void mutate()}>{error.msg ?? String(error)}</Loading> : !settled || isLoading || !data ? <Loading /> : <>
            <div className="max-h-[60dvh] overflow-y-auto overscroll-contain rounded-ui-lg border border-ui-border bg-ui-surface" aria-busy={isValidating || pending}>
                <div className="sticky top-0 hidden grid-cols-[minmax(0,1fr)_minmax(0,1fr)_44px] gap-3 border-b border-ui-border bg-ui-surface-muted px-4 py-3 text-xs font-medium text-ui-muted sm:grid"><span>{t('hostAddress')}</span><span>FakeIP</span><span /></div>
                <ul className="m-0 list-none divide-y divide-ui-border p-0">
                    {data.items.map(item => <li key={`${item.domain}\0${item.ip}`} className="grid min-w-0 grid-cols-[minmax(0,1fr)_44px] items-center gap-3 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_44px]">
                        <span className="min-w-0"><span className="block break-all font-mono text-sm font-medium text-ui-heading">{item.domain}</span><span className="mt-1 block break-all font-mono text-xs text-ui-muted sm:hidden">{item.ip}</span></span>
                        <span className="hidden break-all font-mono text-sm text-ui-muted sm:block">{item.ip}</span>
                        <Button variant="outline-danger" size="icon" aria-label={t('deleteFakeIPMapping', { domain: item.domain, ip: item.ip })} disabled={pending || isValidating} onClick={() => void remove(item)}><Trash size={15} /></Button>
                    </li>)}
                    {!data.items.length && <li className="px-4 py-12 text-center text-sm text-ui-muted">{uiT('noRecordsFound')}</li>}
                </ul>
            </div>
            <div className="mt-4 flex justify-end"><Pagination currentPage={page} pageSize={PAGE_SIZE} totalItems={data.page.total} onPageChange={setPage} /></div>
        </>}
    </section>;
}
