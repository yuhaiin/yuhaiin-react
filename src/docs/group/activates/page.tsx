import { activeNodes, closeNode } from '@/api/nodes';
import { Button } from '@/component/v2/button';
import { MainContainer } from '@/component/v2/card';
import { ConfirmModal } from '@/component/v2/confirm';
import Loading from '@/component/v2/loading';
import { Spinner } from '@/component/v2/spinner';
import { GlobalToastContext } from '@/component/v2/toast';
import { Input } from '@/component/v2/input';
import type { Node } from '@/contract/node';
import { useAsyncAction, useCloseGuard } from '@/hooks/use-editor-draft';
import { Activity, ArrowUpRight, Info, Network, Power, Search } from 'lucide-react';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { NodeModal } from '../../node/modal';

export default function Activates({ showFooter = true }: { showFooter?: boolean }) {
    const { t: uiT } = useTranslation('ui');
    const { t } = useTranslation('routing');
    const { t: commonT } = useTranslation('common');
    const ctx = useContext(GlobalToastContext);
    const { data, error, isLoading, mutate } = useSWR('/api/v2/nodes/active', activeNodes, { revalidateOnFocus: false, refreshInterval: showFooter ? 0 : 15000 });
    const [confirm, setConfirm] = useState<Node>();
    const [details, setDetails] = useState<Node>();
    const [query, setQuery] = useState('');
    const { pending, run } = useAsyncAction(error => ctx.Error(String((error as { msg?: string })?.msg ?? error)));
    useCloseGuard(false, pending, () => undefined);
    const all = [...(data?.items ?? [])].sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
    const items = all.filter(node => `${node.name} ${node.group} ${node.id}`.toLowerCase().includes(query.toLowerCase()));
    if (error && !data) return <Loading code={error.code} onRetry={() => void mutate()}>{error.msg}</Loading>;
    if (isLoading && !data) return <Loading />;
    const terminate = () => {
        if (!confirm || pending) return;
        const node = confirm;
        void run(async () => { await closeNode(node.id); setConfirm(undefined); await mutate(); ctx.Info(t('activeNodeClosed', { name: node.name })); });
    };
    const Heading = showFooter ? 'h1' : 'h2';
    return <MainContainer><section aria-label={uiT('activeNodes')} className="min-w-0">
        <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div><Heading className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-ui-heading"><Activity size={22} className="text-ui-success" />{uiT('activeNodes')}</Heading><p className="mt-2 text-sm text-ui-muted">{uiT('liveOutboundConnectionInstances')}</p></div>
            <div className="flex items-center gap-2 rounded-full bg-ui-success-soft px-3 py-1.5 text-xs font-medium text-ui-success"><span className="size-1.5 rounded-full bg-ui-success" aria-hidden="true" />{all.length} {uiT('running')}</div>
        </header>
        {showFooter && <div className="relative mb-5 max-w-sm"><Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ui-muted" /><Input type="search" className="pl-9" value={query} aria-label={commonT('state.search')} placeholder={commonT('state.search')} onChange={event => setQuery(event.target.value)} /></div>}
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-3 p-0">
            {items.map(node => <li key={node.id} className="group flex min-w-0 items-center gap-2 rounded-ui-lg border border-ui-border bg-ui-surface p-3 transition-colors hover:border-ui-primary/30 hover:bg-ui-surface-muted/30">
                <button type="button" className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-ui-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-focus" aria-label={t('activeNodeDetails', { name: node.name })} title={`${node.name} · #${node.id}`} onClick={() => setDetails(node)}>
                    <span aria-hidden="true" className="relative flex size-9 shrink-0 items-center justify-center rounded-ui-md bg-ui-primary-soft text-ui-primary"><Network size={17} /><span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-ui-surface bg-ui-success" /></span>
                    <span className="min-w-0 flex-1">
                        <span className="flex min-w-0 items-center gap-1.5"><span className="truncate text-sm font-semibold text-ui-heading">{node.name}</span><ArrowUpRight size={13} aria-hidden="true" className="shrink-0 text-ui-muted/60 transition-colors group-hover:text-ui-primary" /></span>
                        <span className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-ui-muted" title={`${node.group || 'manual'} · ${node.chain.map(protocol => protocol.type).join(' → ')}`}><span className="max-w-[45%] truncate">{node.group || 'manual'}</span><span aria-hidden="true" className="text-ui-border">·</span><span className="min-w-0 truncate">{node.chain.map(protocol => protocol.type).join(' → ')}</span></span>
                    </span>
                </button>
                <Button variant="outline-secondary" size="icon" className="h-11 w-11 min-h-11 min-w-11 shrink-0 !border-transparent !bg-transparent !text-ui-muted hover:!bg-ui-danger-soft hover:!text-ui-danger" disabled={pending} aria-label={`${uiT('terminateLabel')} ${node.name}`} title={`${uiT('terminateLabel')} ${node.name}`} onClick={() => setConfirm(node)}><Power size={17} /></Button>
            </li>)}
            {!items.length && <li className="col-span-full rounded-ui-lg border border-dashed border-ui-border px-4 py-10 text-center text-sm text-ui-muted">{uiT('noRecordsFound')}</li>}
        </ul>
        {showFooter && <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-ui-muted"><Info size={15} className="shrink-0" />{uiT('closingANodeHereWillForceAReconnectionIfTheRuleStillRequiresIt')}</p>}
        <NodeModal show={Boolean(details)} node={details} readOnly onHide={() => setDetails(undefined)} />
        <ConfirmModal show={Boolean(confirm)} disabled={pending} title={uiT('terminateLabel')} content={<p className="break-words">{uiT('thisActiveNodeConnection')}: {confirm?.name}</p>}
            onHide={() => { if (!pending) setConfirm(undefined); }} onOk={terminate} />
        {pending && <div role="status" className="mt-3 flex items-center gap-2 text-sm text-ui-muted"><Spinner size="sm" />{uiT('terminateLabel')}</div>}
    </section></MainContainer>;
}
