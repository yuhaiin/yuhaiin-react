import { clearHashSearch, useHashSearch } from '@/hooks/useHashLocation';
import { getNode } from '@/api/nodes';
import { listSelectors } from '@/api/selectors';
import { SelectorEditor } from '@/component/selector-editor';
import { Button } from '@/component/v2/button';
import { MainContainer } from '@/component/v2/card';
import { Input } from '@/component/v2/input';
import { WorkspaceDetail, WorkspaceDirectory, WorkspaceLayout } from '@/component/workspace-layout';
import Loading from '@/component/v2/loading';
import { allowNavigation } from '@/hooks/navigation-guard';
import { useMediaQuery } from '@/hooks/use-media-query';
import type { Selector } from '@/contract/node';
import { ArrowLeftRight, Network, Plus, Search } from 'lucide-react';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

export default function SelectorsPage() {
    const { t } = useTranslation('routing');
    const { data, error, isLoading, mutate } = useSWR('/api/v2/outbound/selectors', listSelectors);
    const [selectedId, setSelectedId] = useState('');
    const [creating, setCreating] = useState(false);
    const [query, setQuery] = useState('');
    const [editorState, setEditorState] = useState({ dirty: false, pending: false });
    const desktop = useMediaQuery('(min-width: 768px)');
    const initialized = useRef(false);
    const search = useHashSearch();
    const linkedId = new URLSearchParams(search).get('selector');
    const editing = creating ? null : data?.items.find(item => item.id === (linkedId || selectedId));
    const showEditor = creating || Boolean(editing);
    const closeLink = () => { if (linkedId) clearHashSearch(); };
    useEffect(() => {
        if (!initialized.current && desktop && data?.items.length && !linkedId && !creating) {
            initialized.current = true; setSelectedId(data.items[0].id);
        }
    }, [desktop, data, linkedId, creating]);
    const closeEditor = () => { initialized.current = true; setSelectedId(''); setCreating(false); closeLink(); setEditorState({ dirty: false, pending: false }); };
    const select = (item: Selector) => {
        if (editorState.pending || !allowNavigation()) return;
        initialized.current = true; closeLink(); setCreating(false); setSelectedId(item.id);
    };
    const create = () => {
        if (editorState.pending || !allowNavigation()) return;
        initialized.current = true; closeLink(); setSelectedId(''); setCreating(true);
    };
    const saved = (item: Selector) => {
        void mutate(previous => ({ items: [...(previous?.items ?? []).filter(value => value.id !== item.id), item] }), { revalidate: true });
        initialized.current = true; closeLink(); setCreating(false); setSelectedId(item.id);
        setEditorState({ dirty: false, pending: false });
    };
    const deleted = (item: Selector) => {
        void mutate(previous => ({ items: (previous?.items ?? []).filter(value => value.id !== item.id) }), { revalidate: true }); closeEditor();
    };
    if (error && !data) return <Loading onRetry={() => void mutate()}>{t('loadFailed')}</Loading>;
    if (isLoading || !data) return <Loading />;
    const items = data.items.filter(item => item.name.toLowerCase().includes(query.trim().toLowerCase()));
    return <MainContainer className="max-w-[1440px]">
        {linkedId && !editing && <p role="alert" className="mb-4 text-sm text-ui-danger">{t('resourceUnavailable')} <button type="button" className="underline" onClick={closeEditor}>{t('close')}</button></p>}
        <header className={clsx('mb-6 flex-wrap items-center justify-between gap-4', showEditor ? 'hidden md:flex' : 'flex')}>
            <div><h1 className="text-3xl font-semibold tracking-tight text-ui-heading">{t('selectorsTitle')}</h1><p className="mt-2 text-sm text-ui-muted">{t('selectorsHelp')}</p></div>
            <Button variant="primary" disabled={editorState.pending || creating} onClick={create}><Plus size={16} className="mr-1.5" aria-hidden="true" />{t('add')}</Button>
        </header>
        <WorkspaceLayout>
            <WorkspaceDirectory label={t('selectorsTitle')} hiddenOnMobile={showEditor}>
                <div className="mb-2 space-y-3 border-b border-ui-border/50 px-1 pb-3">
                    <div className="flex items-center justify-between"><h2 className="text-sm font-semibold text-ui-heading">{t('selectorsTitle')}</h2><span className="text-xs tabular-nums text-ui-muted">{data.items.length}</span></div>
                    <div className="relative"><Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ui-muted" aria-hidden="true" />
                        <Input aria-label={t('searchDestinations')} placeholder={t('searchDestinations')} value={query} onChange={event => setQuery(event.target.value)} className="h-8 bg-ui-surface-muted/70 pl-9 text-xs" /></div>
                </div>
                <ul className="m-0 max-h-[min(72vh,900px)] list-none space-y-1 overflow-y-auto overscroll-contain p-0">
                    {items.map(item => <li key={item.id}>
                        <button type="button" aria-label={item.name} aria-current={!creating && editing?.id === item.id ? 'true' : undefined}
                            className={clsx('relative flex min-h-16 w-full min-w-0 items-center gap-3 rounded-ui-md px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ui-focus',
                                !creating && editing?.id === item.id ? 'bg-ui-primary-soft/70' : 'hover:bg-ui-surface-muted/75')} onClick={() => select(item)}>
                            {!creating && editing?.id === item.id && <span aria-hidden="true" className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-ui-primary" />}
                            <ArrowLeftRight size={16} aria-hidden="true" className="shrink-0 text-ui-muted" />
                            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-ui-heading">{item.name}</span>
                                <span className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-ui-muted"><Network size={12} className="shrink-0" aria-hidden="true" /><SelectedNodeName id={item.nodeId} /></span></span>
                        </button>
                    </li>)}
                    {!items.length && <li className="py-8 text-center text-sm text-ui-muted">{t('noSelectors')}</li>}
                </ul>
            </WorkspaceDirectory>
            <WorkspaceDetail hiddenOnMobile={!showEditor}>
                {showEditor ? <SelectorEditor item={editing} presentation="inline" onClose={closeEditor} onSaved={saved} onDeleted={deleted} onStateChange={setEditorState} />
                    : <div className="flex min-h-80 flex-col items-center justify-center gap-3 p-6 text-center text-ui-muted"><ArrowLeftRight size={28} aria-hidden="true" /><h2 className="text-lg font-medium text-ui-heading">{t('selectSelector')}</h2><p className="max-w-sm text-sm">{t('selectSelectorHelp')}</p><Button variant="outline-primary" className="gap-2" onClick={create}><Plus size={16} aria-hidden="true" />{t('newSelector')}</Button></div>}
            </WorkspaceDetail>
        </WorkspaceLayout>
    </MainContainer>;
}

function SelectedNodeName({ id }: { id: string }) {
    const { t } = useTranslation('routing');
    const { data } = useSWR(id ? ['/api/v2/nodes/detail', id] : null, () => getNode(id), { revalidateOnFocus: false });
    return <span className="min-w-0 truncate" title={data?.name ?? id}>{data?.name ?? t('unknownNode')}</span>;
}
