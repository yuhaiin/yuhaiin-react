import { getTCPStackDiagnostics } from '@/api/tools';
import { getTotalFlow, getConnections } from '@/api/connections';
import { listInboundStatuses, type InboundRuntimeStatus } from '@/api/inbounds';
import { activeNodes, selectedNodes } from '@/api/nodes';
import { getNodeStatuses, type OutboundRuntimeStatus } from '@/api/node-observability';
import { Badge } from '@/component/v2/badge';
import { Button } from '@/component/v2/button';
import { Card, CardBody } from '@/component/v2/card';
import type { TotalFlow } from '@/contract/connection';
import type { Node } from '@/contract/node';
import type { TCPFlowDiagnostic, TCPStackDiagnostic } from '@/contract/tools';
import { RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBytes, formatCounter, stackScopeSummary } from './network-overview';

type OutboundEntry = { id: string; name: string; chain: string; status?: OutboundRuntimeStatus };
type Snapshot = {
    at: string;
    stacks?: TCPStackDiagnostic[];
    totals?: TotalFlow;
    activeConnections?: number;
    inbounds?: InboundRuntimeStatus[];
    outbounds?: OutboundEntry[];
    truncatedNodes: boolean;
    missing: string[];
};

const number = (value: number) => value.toLocaleString();
const ms = (value: number) => value <= 0 ? '—' : value >= 1000 ? `${(value / 1000).toFixed(value % 1000 ? 2 : 0)} s` : `${value.toFixed(1)} ms`;
const bytes = (value: number) => {
    if (value <= 0) return '0 B';
    const units = ['B', 'KiB', 'MiB', 'GiB'];
    let unit = 0;
    while (unit + 1 < units.length && value >= 1024) { value /= 1024; unit++; }
    return unit === 0 ? `${value} B` : `${value.toFixed(1)} ${units[unit]}`;
};

function Metric({ label, value, exact }: { label: string; value: string; exact?: string }) {
    return <div className="min-w-0 rounded-ui-md border border-ui-border/60 bg-ui-surface-muted px-3 py-2">
        <div className="text-xs text-ui-muted">{label}</div>
        <div className="mt-1 break-all font-mono text-sm font-semibold tabular-nums text-ui-heading" title={exact}>{value}</div>
    </div>;
}

// Counters where any non-zero value deserves attention are tinted; zeros are
// dimmed so the few interesting numbers stand out in a mostly idle stack.
type Stat = { label: string; value: number; alert?: boolean };

function StatGroup({ title, stats }: { title: string; stats: Stat[] }) {
    return <div className="min-w-0 rounded-ui-md border border-ui-border/60 bg-ui-surface-muted px-3 py-2">
        <h4 className="mb-1 text-xs font-medium text-ui-heading">{title}</h4>
        <dl className="space-y-0.5 text-xs">
            {stats.map(stat => <div key={stat.label} className="flex items-baseline justify-between gap-3">
                <dt className="min-w-0 truncate text-ui-muted" title={stat.label}>{stat.label}</dt>
                <dd className={`font-mono tabular-nums ${stat.value === 0 ? 'text-ui-muted' : stat.alert ? 'font-semibold text-ui-warning' : 'font-semibold text-ui-heading'}`}>{number(stat.value)}</dd>
            </div>)}
        </dl>
    </div>;
}

function FlowRow({ flow }: { flow: TCPFlowDiagnostic }) {
    const { t } = useTranslation('diagnostics');
    const cell = 'px-3 py-1.5 align-top';
    const num = `${cell} text-right font-mono tabular-nums`;
    const sub = 'text-[11px] text-ui-muted';
    return <tr className="border-t border-ui-border/50 text-xs hover:bg-ui-surface-muted/60">
        <td className={cell}>
            <div className="break-all font-mono text-ui-heading">{flow.remote}</div>
            <div className="break-all font-mono text-ui-muted">→ {flow.local}</div>
        </td>
        <td className={`${cell} whitespace-nowrap`}>
            <Badge variant={flow.state === 'ESTABLISHED' ? 'success' : 'muted'}>{flow.state}</Badge>
            {flow.bbrMode && <div className={`mt-0.5 ${sub}`}>{flow.bbrMode}{flow.bbrPhase ? ` / ${flow.bbrPhase}` : ''}</div>}
        </td>
        <td className={num}>{ms(flow.srttMs)}<div className={sub}>RTO {ms(flow.rtoMs)}</div></td>
        <td className={num}>{bytes(flow.cwndBytes)}<div className={sub}>{t('tcp.inFlight')} {bytes(flow.bytesInFlight)}</div></td>
        <td className={num}>{bytes(flow.pacingBytesPerSecond)}/s</td>
        <td className={num}>
            <span className={flow.retransmissions > 0 ? 'font-semibold text-ui-warning' : 'text-ui-muted'}>{number(flow.retransmissions)}</span>
            {flow.lostBytes > 0 && <div className={sub}>{t('tcp.lost')} {bytes(flow.lostBytes)}</div>}
        </td>
        <td className={num}>{flow.pathMss}</td>
    </tr>;
}

function StackDetails({ stack }: { stack: TCPStackDiagnostic }) {
    const { t } = useTranslation('diagnostics');
    const s = stack.statistics;
    const errors: Stat[] = [
        { label: t('tcp.retransmissions'), value: s.retransmissions, alert: true },
        { label: t('tcp.rstSent'), value: s.rstSent },
        { label: t('tcp.rstReceived'), value: s.rstReceived },
    ];
    const drops: Stat[] = [
        { label: t('tcp.drops'), value: s.drops, alert: true },
        { label: t('tcp.invalidInput'), value: s.invalidInputDrops, alert: true },
        { label: t('tcp.rateLimited'), value: s.rateLimitedDrops, alert: true },
        { label: t('tcp.aqmDrops'), value: s.outputAqmDrops, alert: true },
        { label: t('tcp.overloadDrops'), value: s.outputOverloadDrops, alert: true },
        { label: t('tcp.queueRejected'), value: s.outputRejected, alert: true },
        { label: t('tcp.queueDepth'), value: s.outputQueuedPackets },
    ];
    const th = 'px-3 py-2 font-medium';
    return <div className="mt-3 min-w-0 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
            <Badge variant="muted">Lightweight TCP/IP</Badge>
            <Badge variant="muted">MTU {stack.mtu}</Badge>
            <span className="text-xs text-ui-muted">{t('tcp.activeFlows', { count: s.connections })}</span>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <StatGroup title={t('tcp.groupTraffic')} stats={[
                { label: t('tcp.packetsIn'), value: s.packetsIn },
                { label: t('tcp.packetsOut'), value: s.packetsOut },
            ]} />
            <StatGroup title={t('tcp.groupErrors')} stats={errors} />
            <StatGroup title={t('tcp.groupDrops')} stats={drops} />
        </div>
        {stack.flows.length > 0 && <div>
            <div className="mb-2 text-xs font-medium text-ui-heading">{t('tcp.flowSamples', { shown: stack.flows.length, total: s.connections })}</div>
            <div className="max-h-[28rem] min-w-0 max-w-full overflow-auto rounded-ui-md border border-ui-border">
                <table className="w-full min-w-[760px] text-left">
                    <thead className="sticky top-0 z-10 bg-ui-surface text-xs text-ui-muted"><tr>
                        <th className={th}>{t('tcp.endpoints')}</th>
                        <th className={th}>{t('tcp.state')}</th>
                        <th className={`${th} text-right`}>{t('tcp.rtt')}</th>
                        <th className={`${th} text-right`}>{t('tcp.cwnd')}</th>
                        <th className={`${th} text-right`}>{t('tcp.pacing')}</th>
                        <th className={`${th} text-right`}>{t('tcp.retransmissions')}</th>
                        <th className={`${th} text-right`}>{t('tcp.mss')}</th>
                    </tr></thead>
                    <tbody>{stack.flows.map((flow, i) => <FlowRow key={`${flow.local}:${flow.remote}:${i}`} flow={flow} />)}</tbody>
                </table>
            </div>
        </div>}
    </div>;
}

function InboundDetail({ inbound, stack }: { inbound?: InboundRuntimeStatus; stack?: TCPStackDiagnostic }) {
    const { t } = useTranslation('diagnostics');
    const id = inbound?.id || stack?.inboundId || '';
    return <details className="min-w-0 rounded-ui-lg border border-ui-border bg-ui-surface p-3">
        <summary className="flex cursor-pointer flex-wrap items-center gap-2 text-sm">
            <span className="min-w-0 flex-1 break-all font-semibold text-ui-heading">{inbound?.name || id}</span>
            {inbound && <Badge variant={inbound.status === 'running' ? 'success' : inbound.status === 'failed' ? 'danger' : 'muted'}>{inbound.status}</Badge>}
            {stack && <Badge variant="muted">TCP Stack</Badge>}
        </summary>
        <div className="mt-2 space-y-2">
            {inbound?.name && inbound.name !== id && <p className="break-all text-xs text-ui-muted">ID: {id}</p>}
            {inbound && <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <Metric label={t('tcp.acceptedStreams')} value={formatCounter(inbound.statistics?.acceptedStreams)} />
                <Metric label={t('tcp.ingressPackets')} value={formatCounter(inbound.statistics?.receivedPackets)} />
                <Metric label={t('tcp.ingressPings')} value={formatCounter(inbound.statistics?.receivedPings)} />
            </div>}
            {inbound?.lastError && <p role="alert" className="break-words text-xs text-ui-danger">{inbound.lastError}</p>}
            {stack ? <StackDetails stack={stack} /> : <p className="text-xs text-ui-muted">{t('tcp.unsupportedStack')}</p>}
        </div>
    </details>;
}

function OutboundDetail({ outbound, stack }: { outbound?: OutboundEntry; stack?: TCPStackDiagnostic }) {
    const { t } = useTranslation('diagnostics');
    const id = outbound?.id || stack?.nodeId || '';
    const state = outbound?.status;
    return <details className="min-w-0 rounded-ui-lg border border-ui-border bg-ui-surface p-3">
        <summary className="flex cursor-pointer flex-wrap items-center gap-2 text-sm">
            <span className="min-w-0 flex-1 break-all font-semibold text-ui-heading">{outbound?.name || id}</span>
            {state && <Badge variant={state.state === 'healthy' ? 'success' : state.state === 'degraded' ? 'warning' : 'muted'}>{state.state}</Badge>}
            {state?.protocol && <Badge variant="muted">{state.protocol.state}</Badge>}
            {stack && <Badge variant="muted">TCP Stack</Badge>}
        </summary>
        <div className="mt-2 space-y-2">
            <p className="break-all text-xs text-ui-muted">ID: {id}{outbound?.chain ? ` · ${outbound.chain}` : ''}</p>
            {state && <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <Metric label={t('tcp.upload')} value={formatBytes(state.uploadBytes)} exact={state.uploadBytes} />
                <Metric label={t('tcp.download')} value={formatBytes(state.downloadBytes)} exact={state.downloadBytes} />
                <Metric label={t('tcp.failures')} value={formatCounter(state.failures)} />
                <Metric label={t('tcp.activeTcp')} value={number(state.activeTCP)} />
                <Metric label={t('tcp.activeUdp')} value={number(state.activeUDP)} />
                <Metric label={t('tcp.tcpSuccess')} value={`${formatCounter(state.tcpConnections)} / ${formatCounter(state.tcpAttempts)}`} />
            </div>}
            {state?.protocol && <p className="text-xs text-ui-muted">{t('tcp.nativeState')}: {state.protocol.state} · {state.protocol.updatedAt ? new Date(state.protocol.updatedAt * 1000).toLocaleString() : '—'}</p>}
            {state?.lastError && <p role="alert" className="break-words text-xs text-ui-danger">{state.lastError}</p>}
            {stack ? <StackDetails stack={stack} /> : <p className="text-xs text-ui-muted">{t('tcp.unsupportedStack')}</p>}
        </div>
    </details>;
}

export function TCPStackPanel() {
    const { t } = useTranslation('diagnostics');
    const [snapshot, setSnapshot] = useState<Snapshot>();
    const [busy, setBusy] = useState(false);
    const pending = useRef<AbortController | null>(null);
    useEffect(() => () => { pending.current?.abort(); }, []);

    const refresh = async () => {
        if (pending.current) return;
        const controller = new AbortController();
        pending.current = controller;
        setBusy(true);
        try {
            // A single explicit request gathers existing observations only;
            // none of these APIs connects to peers or runs probes.
            const [stacks, totals, connections, inbounds, active, selected] = await Promise.allSettled([
                getTCPStackDiagnostics(controller.signal), getTotalFlow(controller.signal),
                getConnections(), listInboundStatuses(), activeNodes(), selectedNodes(),
            ]);
            if (controller.signal.aborted) return;
            const missing: string[] = [];
            if (stacks.status === 'rejected') missing.push(t('tcp.unavailableStack'));
            if (totals.status === 'rejected') missing.push(t('tcp.unavailableTraffic'));
            if (connections.status === 'rejected') missing.push(t('tcp.unavailableConnections'));
            if (inbounds.status === 'rejected') missing.push(t('tcp.unavailableInbounds'));
            if (active.status === 'rejected' && selected.status === 'rejected') missing.push(t('tcp.unavailableOutbounds'));
            const nodes = new Map<string, Node>();
            if (active.status === 'fulfilled') for (const n of active.value.items) nodes.set(n.id, n);
            if (selected.status === 'fulfilled') {
                if (selected.value.tcp) nodes.set(selected.value.tcp.id, selected.value.tcp);
                if (selected.value.udp) nodes.set(selected.value.udp.id, selected.value.udp);
            }
            const chosen = [...nodes.values()].slice(0, 100);
            let statusMap: Record<string, OutboundRuntimeStatus> = {};
            if (chosen.length) {
                try {
                    statusMap = await getNodeStatuses(chosen.map(n => n.id));
                } catch {
                    if (!controller.signal.aborted) missing.push(t('tcp.unavailableNodeStatus'));
                }
            }
            if (controller.signal.aborted) return;
            const outbounds: OutboundEntry[] = chosen.map(node => ({
                id: node.id, name: node.name, chain: node.chain.map(p => p.type).join(' → '),
                status: statusMap[node.id],
            }));
            const current: Snapshot = {
                at: stacks.status === 'fulfilled' ? stacks.value.startedAt : new Date().toISOString(),
                stacks: stacks.status === 'fulfilled' ? stacks.value.tcpStacks : undefined,
                totals: totals.status === 'fulfilled' ? totals.value : undefined,
                activeConnections: connections.status === 'fulfilled' ? connections.value.connections.length : undefined,
                inbounds: inbounds.status === 'fulfilled' ? inbounds.value : undefined,
                outbounds: active.status === 'fulfilled' || selected.status === 'fulfilled' ? outbounds : undefined,
                truncatedNodes: nodes.size > chosen.length,
                missing,
            };
            if (stacks.status === 'fulfilled' && stacks.value.tcpStacks === undefined) current.missing.push(t('tcp.unavailableStack'));
            setSnapshot(current);
        } finally {
            if (pending.current === controller) {
                pending.current = null;
                setBusy(false);
            }
        }
    };

    const stacks = snapshot?.stacks ?? [];
    const inboundStacks = stacks.filter(s => !s.scope || s.scope === 'inbound');
    const outboundStacks = stacks.filter(s => s.scope === 'outbound');
    const inboundCovered = stackScopeSummary(stacks, 'inbound');
    const outboundCovered = stackScopeSummary(stacks, 'outbound');
    const inboundIDs = new Set([...(snapshot?.inbounds ?? []).map(i => i.id), ...inboundStacks.map(s => s.inboundId).filter((v): v is string => !!v)]);
    const outboundIDs = new Set([...(snapshot?.outbounds ?? []).map(n => n.id), ...outboundStacks.map(s => s.nodeId).filter((v): v is string => !!v)]);
    const inboundsByID = new Map((snapshot?.inbounds ?? []).map(i => [i.id, i]));
    const outboundsByID = new Map((snapshot?.outbounds ?? []).map(n => [n.id, n]));

    return <section className="min-w-0 space-y-4">
        <Card noMargin><CardBody>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-base font-semibold text-ui-heading">{t('tcp.globalTitle')}</h2>
                    <p className="mt-1 text-xs text-ui-muted">{t('tcp.globalDescription')}</p>
                </div>
                <Button type="button" variant="outline-secondary" disabled={busy} permission="diagnostics:run" onClick={() => void refresh()}>
                    <RefreshCw size={15} className={busy ? 'animate-spin' : ''} />
                    {busy ? t('running') : t('tcp.snapshot')}
                </Button>
            </div>
            {!snapshot && <p className="mt-3 text-sm text-ui-muted">{t('tcp.snapshotHint')}</p>}
            {snapshot && <>
                <p className="mt-2 text-xs text-ui-muted">{t('tcp.takenAt', { date: new Date(snapshot.at).toLocaleString() })}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    <Metric label={t('tcp.globalUpload')} value={formatBytes(snapshot.totals?.upload)} exact={snapshot.totals?.upload} />
                    <Metric label={t('tcp.globalDownload')} value={formatBytes(snapshot.totals?.download)} exact={snapshot.totals?.download} />
                    <Metric label={t('tcp.globalActive')} value={snapshot.activeConnections === undefined ? '—' : number(snapshot.activeConnections)} />
                </div>
                <p className="mt-2 text-xs text-ui-muted">{t('tcp.globalTrafficScope')}</p>
                {snapshot.stacks && <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-ui-md border border-ui-border/70 p-3">
                        <h3 className="text-sm font-medium text-ui-heading">{t('tcp.inboundStackTotals')}</h3>
                        <p className="mt-1 text-xs text-ui-muted">{t('tcp.stackCoverage', { count: inboundCovered.covered })}</p>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs tabular-nums">
                            <span>{t('tcp.retransmissions')}: {number(inboundCovered.retransmissions)}</span>
                            <span>{t('tcp.drops')}: {number(inboundCovered.drops)}</span>
                        </div>
                    </div>
                    <div className="rounded-ui-md border border-ui-border/70 p-3">
                        <h3 className="text-sm font-medium text-ui-heading">{t('tcp.outboundStackTotals')}</h3>
                        <p className="mt-1 text-xs text-ui-muted">{t('tcp.stackCoverage', { count: outboundCovered.covered })}</p>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs tabular-nums">
                            <span>{t('tcp.retransmissions')}: {number(outboundCovered.retransmissions)}</span>
                            <span>{t('tcp.drops')}: {number(outboundCovered.drops)}</span>
                        </div>
                    </div>
                </div>}
                <p className="mt-2 text-xs text-ui-muted">{t('tcp.noDoubleCount')}</p>
                {snapshot.missing.length > 0 && <ul role="status" className="mt-3 space-y-1 text-xs text-ui-warning">{snapshot.missing.map((msg, i) => <li key={i}>{msg}</li>)}</ul>}
            </>}
        </CardBody></Card>
        {snapshot && <div className="grid min-w-0 grid-cols-1 items-start gap-4 2xl:grid-cols-2">
            <div className="min-w-0 space-y-2">
                <h3 className="text-sm font-semibold text-ui-heading">{t('tcp.inboundsTitle')} ({inboundIDs.size})</h3>
                <p className="text-xs text-ui-muted">{t('tcp.inboundsHint')}</p>
                {[...inboundIDs].sort().map(id => <InboundDetail key={id} inbound={inboundsByID.get(id)} stack={inboundStacks.find(s => s.inboundId === id)} />)}
                {inboundIDs.size === 0 && <p className="text-xs text-ui-muted">{t('tcp.noInbounds')}</p>}
            </div>
            <div className="min-w-0 space-y-2">
                <h3 className="text-sm font-semibold text-ui-heading">{t('tcp.outboundsTitle')} ({outboundIDs.size})</h3>
                <p className="text-xs text-ui-muted">{t('tcp.outboundsHint')}</p>
                {[...outboundIDs].sort().map(id => <OutboundDetail key={id} outbound={outboundsByID.get(id)} stack={outboundStacks.find(s => s.nodeId === id)} />)}
                {outboundIDs.size === 0 && <p className="text-xs text-ui-muted">{t('tcp.noOutbounds')}</p>}
                {snapshot.truncatedNodes && <p className="text-xs text-ui-warning">{t('tcp.truncatedNodes')}</p>}
            </div>
            <p className="text-xs text-ui-muted 2xl:col-span-2">{t('tcp.privacy')}</p>
        </div>}
    </section>;
}
