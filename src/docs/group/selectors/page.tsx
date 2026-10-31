import { useHashSearch } from '@/hooks/useHashLocation';
import { getNode } from '@/api/nodes';
import { listSelectors } from '@/api/selectors';
import { MonitoringSettings } from '@/component/selector-monitoring';
import { SelectorEditor } from '@/component/selector-editor';
import { MainContainer } from '@/component/v2/card';
import { ResourceWorkspace, useResourceSelection } from '@/component/resource-workspace';
import Loading from '@/component/v2/loading';
import type { Selector } from '@/contract/node';
import { ArrowLeftRight } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

export default function SelectorsPage() {
    const { t } = useTranslation('routing');
    const { data, error, isLoading, mutate } = useSWR('/api/v2/outbound/selectors', listSelectors);
    const [query, setQuery] = useState('');
    const [editorState, setEditorState] = useState({ dirty: false, pending: false });
    const search = useHashSearch();
    const items = data?.items ?? [];
    const selection = useResourceSelection(items.map(item => item.id), new URLSearchParams(search).get('selector'));
    const editing = selection.creating ? undefined : items.find(item => item.id === selection.id);
    const saved = (item: Selector) => {
        void mutate(previous => ({ items: [...(previous?.items ?? []).filter(value => value.id !== item.id), item] }), { revalidate: true });
        selection.saved(item.id);
        setEditorState({ dirty: false, pending: false });
    };
    const deleted = (item: Selector) => {
        void mutate(previous => ({ items: (previous?.items ?? []).filter(value => value.id !== item.id) }), { revalidate: true });
        selection.close();
    };
    if (error && !data) return <Loading onRetry={() => void mutate()}>{t('loadFailed')}</Loading>;
    if (isLoading || !data) return <Loading />;
    return <MainContainer className="max-w-[1440px]">
        {selection.id && !editing && <p role="alert" className="mb-4 text-sm text-ui-danger">{t('resourceUnavailable')} <button type="button" className="underline" onClick={selection.close}>{t('close')}</button></p>}
        <div className="mb-4 flex justify-end"><MonitoringSettings /></div>
        <ResourceWorkspace title={t('selectorsTitle')} description={t('selectorsHelp')} selectedId={selection.id} editing={selection.creating || Boolean(editing)}
            createDisabled={selection.creating || editorState.pending} onCreate={() => selection.create()} onSelect={selection.select} search={{ value: query, onChange: setQuery }}
            items={items.filter(item => item.name.toLowerCase().includes(query.trim().toLowerCase())).map(item => ({ id: item.id, name: item.name, icon: <ArrowLeftRight />, description: <SelectedNodeName id={item.nodeId} /> }))}>
            <SelectorEditor item={editing} presentation="inline" onClose={selection.close} onSaved={saved} onDeleted={deleted} onStateChange={setEditorState} />
        </ResourceWorkspace>
    </MainContainer>;
}

function SelectedNodeName({ id }: { id: string }) {
    const { t } = useTranslation('routing');
    const { data } = useSWR(id ? ['/api/v2/nodes/detail', id] : null, () => getNode(id), { revalidateOnFocus: false });
    return <span className="min-w-0 truncate" title={data?.name ?? id}>{data?.name ?? t('unknownNode')}</span>;
}
