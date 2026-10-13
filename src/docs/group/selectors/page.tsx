import { clearHashSearch, useHashSearch } from '@/hooks/useHashLocation';
import { collectPages } from '@/api/paging';
import { listNodes } from '@/api/nodes';
import { listSelectors } from '@/api/selectors';
import { SelectorEditor } from '@/component/selector-editor';
import { Button } from '@/component/v2/button';
import { MainContainer } from '@/component/v2/card';
import Loading from '@/component/v2/loading';
import type { Selector } from '@/contract/node';
import { ArrowLeftRight, ArrowRight, ChevronRight, Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

export default function SelectorsPage() {
    const { t } = useTranslation('routing');
    const { data, error, isLoading, mutate } = useSWR('/api/v2/outbound/selectors', listSelectors);
    const [localEditing, setEditing] = useState<Selector | null>();
    const search = useHashSearch();
    const linkedId = new URLSearchParams(search).get('selector');
    const linkedItem = data?.items.find(item => item.id === linkedId);
    const editing = linkedId ? linkedItem : localEditing;
    const closeEditor = () => { setEditing(undefined); if (linkedId) clearHashSearch(); };
    if (error) return <Loading onRetry={() => void mutate()}>{t('loadFailed')}</Loading>;
    if (isLoading || !data) return <Loading />;
    return <MainContainer className="max-w-4xl">
        {linkedId && !linkedItem && <p role="alert" className="text-sm text-ui-danger">{t("resourceUnavailable")} <button type="button" className="underline" onClick={closeEditor}>{t("close")}</button></p>}
        <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <div><h1 className="text-3xl font-semibold tracking-tight text-ui-heading">{t('selectorsTitle')}</h1><p className="mt-2 text-sm text-ui-muted">{t('selectorsHelp')}</p></div>
            <Button variant="primary" onClick={() => setEditing(null)}><Plus size={16} className="mr-1.5" />{t('add')}</Button>
        </header>
        {data.items.length === 0 ? <p className="py-8 text-sm text-ui-muted">{t('noSelectors')}</p> : <ul className="m-0 list-none border-t border-ui-border/60 p-0">
            {data.items.map(item => <li key={item.id} className="border-b border-ui-border/45 last:border-b-0">
                <button type="button" className="flex w-full items-center gap-3 rounded-ui-lg px-3 py-4 text-left transition-colors hover:bg-ui-surface-muted/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ui-focus sm:gap-4" onClick={() => setEditing(item)}>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-ui-md bg-ui-surface-muted text-ui-muted"><ArrowLeftRight size={17} aria-hidden="true" /></span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-initial sm:flex-row sm:items-center sm:gap-4"><span className="max-w-full truncate text-[15px] font-medium text-ui-heading sm:max-w-[18rem]">{item.name}</span><span className="flex min-w-0 items-center gap-2"><ArrowRight size={14} className="shrink-0 text-ui-muted/60" aria-hidden="true" /><SelectedNodeName id={item.nodeId} /></span></span>
                    <ChevronRight size={16} className="shrink-0 text-ui-muted/60" aria-hidden="true" />
                </button>
            </li>)}
        </ul>}
        <SelectorEditor item={editing} onClose={closeEditor} onSaved={() => { closeEditor(); void mutate(); }} />
    </MainContainer>;
}

function SelectedNodeName({ id }: { id: string }) {
    const { t } = useTranslation('routing');
    const { data } = useSWR('/api/v2/nodes/all', () => collectPages(listNodes));
    return <span className="min-w-0 truncate text-sm text-ui-fg">{data?.items.find(node => node.id === id)?.name ?? t('unknownNode')}</span>;
}
