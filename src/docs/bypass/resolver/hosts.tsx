import { confirmAction } from '@/component/v2/confirmation';
import { deleteHostEntry, listHostEntries, saveHostEntry, type HostEntry } from '@/api/resolvers';
import { ResourceEditorFrame } from '@/component/resource-workspace';
import { Button } from '@/component/v2/button';
import { SettingInputVertical } from '@/component/v2/forms';
import { Input } from '@/component/v2/input';
import Loading from '@/component/v2/loading';
import { Pagination } from '@/component/v2/pagination';
import { Spinner } from '@/component/v2/spinner';
import { GlobalToastContext } from '@/component/v2/toast';
import { useAsyncAction, useCloseGuard, useEditorDraft } from '@/hooks/use-editor-draft';
import { useServerPageClamp } from '@/hooks/use-pagination';
import { ArrowRight, Check, Pencil, Plus, RotateCw, Search, Trash } from 'lucide-react';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR, { useSWRConfig } from 'swr';

const PAGE_SIZE = 20;
function HostEditor({ item, creating, onClose, onSaved }: { item?: HostEntry; creating: boolean; onClose: () => void; onSaved: () => void }) {
    const { t } = useTranslation('routing');
    const { t: uiT } = useTranslation('ui');
    const { value, setValue, dirty, commit } = useEditorDraft(creating ? 'new-host' : item?.host ?? '', item, () => ({ host: '', target: '' }));
    const [error, setError] = useState('');
    const { pending, run } = useAsyncAction(error => setError(String((error as { msg?: string })?.msg ?? error)));
    const close = useCloseGuard(dirty, pending, onClose);
    const save = () => {
        if (pending || !value.host.trim() || !value.target.trim()) return;
        setError('');
        void run(async () => {
            const saved = await saveHostEntry({ host: value.host.trim(), target: value.target.trim() }, creating);
            commit(saved); onSaved();
        });
    };
    return <ResourceEditorFrame title={creating ? t('addHostMapping') : item?.host} label={t('hostMapping')} open onClose={close}
        footer={<><Button disabled={pending} onClick={close}>{uiT('cancel')}</Button><Button permission="resolver:write" variant="primary" className="gap-2" disabled={pending || !value.host.trim() || !value.target.trim()} onClick={save}>{pending ? <Spinner size="sm" /> : <Check size={16} />}{uiT('save')}</Button></>}>
        <fieldset disabled={pending} className="min-w-0 space-y-4">
            <SettingInputVertical label={t('hostAddress')} value={value.host} disabled={!creating} placeholder="local.example" onChange={host => setValue(previous => ({ ...previous, host }))} />
            <SettingInputVertical label={uiT('target')} value={value.target} placeholder="192.0.2.1" onChange={target => setValue(previous => ({ ...previous, target }))} />
            <p className="text-sm text-ui-muted">{t('hostTargetHelp')}</p>
        </fieldset>
        {error && <p role="alert" className="mt-4 break-words text-sm text-ui-danger">{error}</p>}
    </ResourceEditorFrame>;
}

export function Hosts() {
    const { t } = useTranslation('routing');
    const { t: uiT } = useTranslation('ui');
    const { t: commonT } = useTranslation('common');
    const ctx = useContext(GlobalToastContext);
    const { mutate: mutatePages } = useSWRConfig();
    const refreshPages = () => mutatePages(key => Array.isArray(key) && key[0] === '/api/v2/resolver/hosts/entries', undefined, { revalidate: true });
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState('');
    const [editor, setEditor] = useState<{ item?: HostEntry; creating: boolean }>();
    const { data, error, isLoading, isValidating, mutate } = useSWR(['/api/v2/resolver/hosts/entries', page, query], () => listHostEntries(page, PAGE_SIZE, query), { keepPreviousData: true, revalidateOnFocus: false });
    useServerPageClamp(data?.page, page, setPage);
    const { pending, run } = useAsyncAction(error => ctx.Error(String((error as { msg?: string })?.msg ?? error)));
    useCloseGuard(false, pending, () => undefined);
    const remove = async (item: HostEntry) => {
        if (pending || !await confirmAction(t('deleteHostMapping', { host: item.host }))) return;
        void run(async () => { await deleteHostEntry(item.host); await refreshPages(); });
    };
    if (error && !data) return <Loading code={error.code} onRetry={() => void mutate()}>{error.msg}</Loading>;
    if (isLoading && !data) return <Loading />;
    return <section aria-label={uiT('staticHosts')} className="min-w-0">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-xl font-semibold text-ui-heading">{uiT('staticHosts')}</h2><p className="mt-2 text-sm text-ui-muted">{uiT('localDomainMappings')}</p></div><Button variant="primary" className="gap-2" disabled={pending} onClick={() => setEditor({ creating: true })}><Plus size={16} />{uiT('add')}</Button></header>
        <div className="mb-4 flex items-center gap-3"><div className="relative min-w-0 flex-1 sm:max-w-sm"><Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ui-muted" /><Input type="search" value={query} aria-label={commonT('state.search')} placeholder={commonT('state.search')} className="pl-9" onChange={event => { setQuery(event.target.value); setPage(1); }} /></div>
            <Button variant="outline-secondary" size="icon" aria-label={uiT('refresh')} disabled={isValidating || pending} onClick={() => void mutate()}>{isValidating ? <Spinner size="sm" /> : <RotateCw size={16} />}</Button><span className="ml-auto shrink-0 text-xs tabular-nums text-ui-muted">{data?.page.total ?? 0}</span></div>
        {error && <p role="alert" className="mb-3 text-sm text-ui-danger">{error.msg}</p>}
        <div className="overflow-hidden rounded-ui-lg border border-ui-border bg-ui-surface" aria-busy={isValidating || pending}>
            <div className="hidden grid-cols-[minmax(0,1fr)_24px_minmax(0,1fr)_96px] gap-3 border-b border-ui-border bg-ui-surface-muted/50 px-4 py-3 text-xs font-medium text-ui-muted sm:grid"><span>{t('hostAddress')}</span><span /><span>{uiT('target')}</span><span /></div>
            <ul className="m-0 list-none divide-y divide-ui-border p-0">
                {(data?.items ?? []).map(item => <li key={item.host} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-ui-surface-muted/40 sm:grid-cols-[minmax(0,1fr)_24px_minmax(0,1fr)_96px]">
                    <button type="button" onClick={() => setEditor({ item, creating: false })} disabled={pending} className="min-w-0 rounded-ui-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-focus"><span className="block truncate font-mono text-sm font-medium text-ui-heading" title={item.host}>{item.host}</span><span className="mt-1 block truncate font-mono text-xs text-ui-muted sm:hidden" title={item.target}>{item.target}</span></button>
                    <ArrowRight size={14} className="hidden text-ui-muted sm:block" aria-hidden="true" /><span className="hidden truncate font-mono text-sm text-ui-muted sm:block" title={item.target}>{item.target}</span>
                    <div className="flex justify-end gap-1"><Button variant="outline-secondary" size="icon" aria-label={t('editHostMapping', { host: item.host })} disabled={pending} onClick={() => setEditor({ item, creating: false })}><Pencil size={15} /></Button><Button variant="outline-secondary" size="icon" className="!text-ui-danger" aria-label={t('deleteHostMapping', { host: item.host })} disabled={pending} onClick={() => remove(item)}><Trash size={15} /></Button></div>
                </li>)}
                {!data?.items.length && <li className="px-4 py-12 text-center text-sm text-ui-muted">{uiT('noRecordsFound')}</li>}
            </ul>
        </div>
        <div className="mt-4 flex justify-end"><Pagination currentPage={page} pageSize={PAGE_SIZE} totalItems={data?.page.total ?? 0} onPageChange={setPage} /></div>
        {editor && <HostEditor item={editor.item} creating={editor.creating} onClose={() => setEditor(undefined)} onSaved={() => { setEditor(undefined); void refreshPages(); ctx.Info(uiT('save')); }} />}
    </section>;
}
