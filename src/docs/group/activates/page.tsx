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
import { Activity, ArrowUpRight, Info, Power, Search } from 'lucide-react';
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
        <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 xl:grid-cols-3">
            {items.map(node => <li key={node.id} className="group min-w-0 rounded-ui-lg border border-ui-border bg-ui-surface p-4 transition-colors hover:border-ui-primary/30">
                <button type="button" className="flex w-full min-w-0 items-start justify-between gap-3 rounded-ui-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-focus" aria-label={t('activeNodeDetails', { name: node.name })} onClick={() => setDetails(node)}>
                    <span className="min-w-0"><span className="block truncate text-sm font-semibold text-ui-heading" title={node.name}>{node.name}</span><span className="mt-1.5 block truncate text-xs text-ui-muted">{node.group || 'manual'}</span></span>
                    <ArrowUpRight size={16} className="shrink-0 text-ui-muted transition-colors group-hover:text-ui-primary" />
                </button>
                <div className="mt-4 flex flex-wrap gap-1.5">{node.chain.map((protocol, index) => <span key={index} className="rounded bg-ui-surface-muted px-2 py-1 text-[0.6875rem] text-ui-muted">{protocol.type}</span>)}</div>
                <div className="mt-4 flex min-w-0 items-center justify-between gap-3 border-t border-ui-border/60 pt-3">
                    <span className="min-w-0 truncate font-mono text-[0.6875rem] text-ui-muted" title={node.id}>#{node.id.slice(0, 8)}</span>
                    <Button variant="outline-secondary" size="sm" className="shrink-0 gap-1.5 !text-ui-danger" disabled={pending} aria-label={`${uiT('terminateLabel')} ${node.name}`} onClick={() => setConfirm(node)}><Power size={14} />{uiT('terminateLabel')}</Button>
                </div>
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
