import { clearHashSearch, useHashSearch } from '@/hooks/useHashLocation';
import { collectPages } from '@/api/paging';
import { listNodes } from '@/api/nodes';
import { listSelectors } from '@/api/selectors';
import { SelectorEditor } from '@/component/selector-editor';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader, IconBox, MainContainer } from '@/component/v2/card';
import Loading from '@/component/v2/loading';
import type { Selector } from '@/contract/node';
import { ArrowLeftRight, Plus } from 'lucide-react';
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
    return <MainContainer>
        {linkedId && !linkedItem && <p role="alert" className="text-sm text-ui-danger">{t("resourceUnavailable")} <button type="button" className="underline" onClick={closeEditor}>{t("close")}</button></p>}
        <Card><CardHeader>
            <IconBox icon={ArrowLeftRight} tone="primary" title={t('selectorsTitle')} description={t('selectorsHelp')} />
            <Button size="sm" onClick={() => setEditing(null)}><Plus size={16} />{t('add')}</Button>
        </CardHeader><CardBody>
            {data.items.length === 0 ? <p className="text-sm text-ui-muted">{t('noSelectors')}</p> : <div className="space-y-2">
                {data.items.map(item => <button key={item.id} type="button" className="flex w-full items-center justify-between gap-3 rounded-ui-lg border border-ui-border p-4 text-left hover:bg-ui-hover focus-visible:outline-2 focus-visible:outline-ui-focus" onClick={() => setEditing(item)}>
                    <span className="font-semibold">{item.name}</span><SelectedNodeName id={item.nodeId} />
                </button>)}
            </div>}
        </CardBody></Card>
        <SelectorEditor item={editing} onClose={closeEditor} onSaved={() => { closeEditor(); void mutate(); }} />
    </MainContainer>;
}

function SelectedNodeName({ id }: { id: string }) {
    const { data } = useSWR('/api/v2/nodes/all', () => collectPages(listNodes));
    return <span className="min-w-0 truncate text-sm text-ui-muted">{data?.items.find(node => node.id === id)?.name ?? id}</span>;
}
