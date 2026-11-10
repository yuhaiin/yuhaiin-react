import { getTCPStackDiagnostics } from '@/api/tools';
import { DetailBack } from '@/component/v2/detail-back';
import { getTotalFlow, getConnections } from '@/api/connections';
import { listInboundStatuses, type InboundRuntimeStatus } from '@/api/inbounds';
import { activeNodes, selectedNodes } from '@/api/nodes';
import { getNodeStatuses, type OutboundRuntimeStatus } from '@/api/node-observability';
import { Badge } from '@/component/v2/badge';
import { NodeRuntimeError } from '@/component/node-runtime-error';
import { Button } from '@/component/v2/button';
import { Card, CardBody } from '@/component/v2/card';
import { Select } from '@/component/v2/select';
import { ToggleGroup, ToggleItem } from '@/component/v2/togglegroup';
import { Tooltip } from '@/component/v2/tooltip';
import { WorkspaceDetail, WorkspaceDirectory, WorkspaceLayout, WorkspaceSelectionMarker } from '@/component/workspace-layout';
import type { Connection, TotalFlow } from '@/contract/connection';
import type { Node } from '@/contract/node';
import type { TCPFlowDiagnostic, TCPStackDiagnostic } from '@/contract/tools';
import clsx from 'clsx';
import { Info, RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBytes, formatCounter, stackScopeSummary } from './network-overview';
import { DetailSection } from './detail-section';
import { UDPSessions } from './udp-sessions';

type View = 'inbound' | 'outbound';
const AUTO_REFRESH_KEY = 'diagnostics.tcp.autoRefresh';
const AUTO_REFRESH_SECONDS = [0, 5, 10, 30, 60];
const readAutoRefresh = () => {
    try {
        const value = Number(localStorage.getItem(AUTO_REFRESH_KEY));
        return AUTO_REFRESH_SECONDS.includes(value) ? value : 0;
    } catch { return 0; }
};
type OutboundEntry = { id: string; name: string; chain: string; status?: OutboundRuntimeStatus };
type Snapshot = {
    at: string;
    stacks?: TCPStackDiagnostic[];
    totals?: TotalFlow;
    activeConnections?: number;
    connections?: Connection[];
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

function Metric({ label, value, exact, sub, subAlert }: { label: string; value: string; exact?: string; sub?: string; subAlert?: boolean }) {
    return <div className="min-w-0 rounded-ui-md border border-ui-border/60 bg-ui-surface-muted px-3 py-2">
        <div className="truncate text-xs text-ui-muted" title={label}>{label}</div>
        <div className="mt-1 break-all font-mono text-sm font-semibold tabular-nums text-ui-heading" title={exact}>{value}</div>
        {sub && <div className={`mt-0.5 font-mono text-xs tabular-nums ${subAlert ? 'font-medium text-ui-warning' : 'text-ui-muted'}`}>{sub}</div>}
    </div>;
}

// Counters only ever grow; a reset (restart) yields no delta instead of a negative one.
function counterDelta(now?: string | number, before?: string | number): bigint {
    if (now === undefined || before === undefined) return 0n;
    try {
        const delta = BigInt(now) - BigInt(before);
        return delta > 0n ? delta : 0n;
    } catch { return 0n; }
}
const plus = (delta: bigint) => `+${delta.toLocaleString()}`;
const rate = (bytesPerSecond?: string) => bytesPerSecond === undefined ? '—' : `${formatBytes(bytesPerSecond)}/s`;
// Prefer the backend's averaged window over the instantaneous counter.
const nodeRate = (status: OutboundRuntimeStatus, direction: 'upload' | 'download') =>
    rate(direction === 'upload' ? status.trafficWindow?.uploadBps ?? status.uploadBps : status.trafficWindow?.downloadBps ?? status.downloadBps);

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
    const sub = 'text-xs text-ui-muted';
    return <tr className="border-t border-ui-border/50 text-xs hover:bg-ui-surface-muted/60">
        <td className={cell}>
            <div className="break-all font-mono text-ui-heading">{flow.remote}</div>
            <div className="break-all font-mono text-ui-muted">→ {flow.local}</div>
        </td>
        <td className={`${cell} whitespace-nowrap`}>
            <Badge variant={flow.state === 'ESTABLISHED' ? 'success' : 'muted'}>{flow.state}</Badge>
            {flow.lossRecovery && <div className={`mt-0.5 ${sub}`}>
                {flow.congestionControl?.toUpperCase()} / {flow.lossRecovery}
                {flow.configuredLossRecovery !== flow.lossRecovery && <span> ({t('tcp.recoveryFallback')})</span>}
            </div>}
            {(flow.tailLossProbes > 0 || flow.dsackSent > 0 || flow.dsackReceived > 0 || flow.spuriousRecoveries > 0) &&
                <div className={sub}>TLP {number(flow.tailLossProbes)} · DSACK ↑{number(flow.dsackSent)} ↓{number(flow.dsackReceived)} · {t('tcp.undo')} {number(flow.spuriousRecoveries)}</div>}
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
    // An idle stack is mostly zeros; only counters that moved are listed.
    const groups = [
        { title: t('tcp.groupTraffic'), stats: [{ label: t('tcp.packetsIn'), value: s.packetsIn }, { label: t('tcp.packetsOut'), value: s.packetsOut }] },
        { title: t('tcp.groupErrors'), stats: errors },
        { title: t('tcp.groupDrops'), stats: drops },
    ].map(group => ({ ...group, stats: group.stats.filter(stat => stat.value !== 0) })).filter(group => group.stats.length > 0);
    const alerts = [...errors, ...drops].filter(stat => stat.alert && stat.value > 0);
    const th = 'px-3 py-2 font-medium';
    return <DetailSection title="TCP Stack" meta={`MTU ${stack.mtu} · ${t('tcp.activeFlows', { count: s.connections })}`} alert={alerts.length > 0}
        status={alerts.length ? alerts.map(stat => `${stat.label} ${number(stat.value)}`).join(' · ') : t('tcp.stackHealthy')}>
        {groups.length > 0 && <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {groups.map(group => <StatGroup key={group.title} title={group.title} stats={group.stats} />)}
        </div>}
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
    </DetailSection>;
}

type Tone = 'success' | 'warning' | 'danger' | 'muted';
const dotClass: Record<Tone, string> = { success: 'bg-ui-success', warning: 'bg-ui-warning', danger: 'bg-ui-danger', muted: 'bg-ui-disabled-fg' };

function inboundTone(inbound?: InboundRuntimeStatus): Tone {
    if (!inbound) return 'muted';
    if (inbound.status === 'failed' || inbound.lastError) return 'danger';
    if (inbound.status === 'running') return 'success';
    return inbound.status === 'disabled' ? 'muted' : 'warning';
}

// Mirrors NodeRuntimeError: only degraded health or a native failure is a current error.
function outboundTone(status?: OutboundRuntimeStatus): Tone {
    if (!status) return 'muted';
    if (status.protocol?.lastError || status.protocol?.state.includes('fail') || status.state === 'degraded') return 'danger';
    if (status.state === 'healthy' || status.protocol?.state === 'connected') return 'success';
    return 'muted';
}

// A failing native session outranks passive health, so the label names what made it red.
const outboundState = (status?: OutboundRuntimeStatus) => status?.protocol && outboundTone(status) === 'danger' && status.state !== 'degraded' ? status.protocol.state : status?.state;

type Row = { id: string; name: string; tone: Tone; state?: string; summary: string; alert?: string };

function DirectoryRow({ row, selected, onSelect }: { row: Row; selected: boolean; onSelect: () => void }) {
    return <li><button type="button" aria-current={selected ? 'true' : undefined} onClick={onSelect}
        className={clsx('relative flex min-h-[52px] w-full min-w-0 items-center gap-2.5 rounded-ui-md px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ui-focus', !selected && 'hover:bg-ui-surface-muted/75', row.tone === 'muted' && !selected && 'opacity-70')}>
        {selected && <WorkspaceSelectionMarker />}
        <span aria-hidden="true" title={row.state} className={`size-2 shrink-0 rounded-full ${dotClass[row.tone]}`} />
        <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-ui-heading" title={row.name}>{row.name}</span>
            <span className="mt-0.5 block truncate font-mono text-xs tabular-nums text-ui-muted">
                {row.summary}{row.alert && <span className="text-ui-warning"> · {row.alert}</span>}
            </span>
        </span>
        <span className="sr-only">{row.state}</span>
    </button></li>;
}

function DetailHeader({ name, tone, state, meta, onBack }: { name: string; tone: Tone; state?: string; meta?: string; onBack: () => void }) {
    const { t } = useTranslation('diagnostics');
    return <div className="mb-3 space-y-1">
        <DetailBack label={t('tcp.backToList')} onBack={onBack} />
        <div className="flex min-w-0 items-center gap-2">
            <h3 className="min-w-0 flex-1 truncate text-base font-semibold text-ui-heading" title={name}>{name}</h3>
            {state && <Badge variant={tone === 'muted' ? 'muted' : tone}>{state}</Badge>}
        </div>
        {meta && <p className="break-all text-xs text-ui-muted">{meta}</p>}
    </div>;
}

function InboundDetail({ id, inbound, stack, onBack }: { id: string; inbound?: InboundRuntimeStatus; stack?: TCPStackDiagnostic; onBack: () => void }) {
    const { t } = useTranslation('diagnostics');
    return <div className="min-w-0 space-y-3">
        <DetailHeader name={inbound?.name || id} tone={inboundTone(inbound)} state={inbound?.status} meta={inbound?.name && inbound.name !== id ? `ID: ${id}` : undefined} onBack={onBack} />
        {inbound?.lastError && <p role="alert" className="break-words rounded-ui-md border border-ui-danger/30 bg-ui-danger-soft p-3 text-sm text-ui-danger">{inbound.lastError}</p>}
        {inbound && <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Metric label={t('tcp.acceptedStreams')} value={formatCounter(inbound.statistics?.acceptedStreams)} />
            <Metric label={t('tcp.ingressPackets')} value={formatCounter(inbound.statistics?.receivedPackets)} />
            <Metric label={t('tcp.ingressPings')} value={formatCounter(inbound.statistics?.receivedPings)} />
        </div>}
        {stack ? <StackDetails stack={stack} /> : <p className="text-xs text-ui-muted">{t('tcp.unsupportedStack')}</p>}
    </div>;
}

function OutboundDetail({ id, outbound, previous, stack, udpSessions, counters, onBack }: { id: string; outbound?: OutboundEntry; previous?: OutboundRuntimeStatus; stack?: TCPStackDiagnostic; udpSessions?: Connection[]; counters?: TotalFlow['counters']; onBack: () => void }) {
    const { t } = useTranslation('diagnostics');
    const state = outbound?.status;
    const meta = [id, outbound?.chain,
        state?.protocol && `VPN ${state.protocol.state}${state.protocol.updatedAt ? ` (${new Date(state.protocol.updatedAt * 1000).toLocaleString()})` : ''}`,
    ].filter(Boolean).join(' · ');
    return <div className="min-w-0 space-y-3">
        <DetailHeader name={outbound?.name || id} tone={outboundTone(state)} state={outboundState(state)} meta={meta} onBack={onBack} />
        <NodeRuntimeError status={state} />
        {state && <>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Metric label={t('tcp.upload')} value={nodeRate(state, 'upload')} sub={formatBytes(state.uploadBytes)} exact={state.uploadBytes} />
                <Metric label={t('tcp.download')} value={nodeRate(state, 'download')} sub={formatBytes(state.downloadBytes)} exact={state.downloadBytes} />
                <Metric label={t('tcp.tcpSuccess')} value={`${formatCounter(state.tcpConnections)} / ${formatCounter(state.tcpAttempts)}`} />
                <Metric label={t('tcp.failures')} value={formatCounter(state.failures)} {...failureDelta(state, previous)} />
            </div>
            <p className="text-xs text-ui-muted">{t('tcp.activeTcp')} {number(state.activeTCP)} · {t('tcp.activeUdp')} {number(state.activeUDP)}</p>
        </>}
        {stack ? <StackDetails stack={stack} /> : <p className="text-xs text-ui-muted">{t('tcp.unsupportedStack')}</p>}
        <UDPSessions sessions={udpSessions} counters={counters} />
    </div>;
}

function failureDelta(state: OutboundRuntimeStatus, previous?: OutboundRuntimeStatus) {
    const delta = counterDelta(state.failures, previous?.failures);
    return delta > 0n ? { sub: plus(delta), subAlert: true } : {};
}

export function TCPStackPanel() {
    const { t } = useTranslation('diagnostics');
    // The previous snapshot turns cumulative counters into "what changed since last time".
    const [{ current: snapshot, previous }, setSnapshots] = useState<{ current?: Snapshot; previous?: Snapshot }>({});
    const [busy, setBusy] = useState(false);
    const [view, setView] = useState<View>('outbound');
    const [selection, setSelection] = useState<Partial<Record<View, string>>>({});
    const [mobileOpen, setMobileOpen] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(readAutoRefresh);
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
                connections: connections.status === 'fulfilled' ? connections.value.connections : undefined,
                inbounds: inbounds.status === 'fulfilled' ? inbounds.value : undefined,
                outbounds: active.status === 'fulfilled' || selected.status === 'fulfilled' ? outbounds : undefined,
                truncatedNodes: nodes.size > chosen.length,
                missing,
            };
            if (stacks.status === 'fulfilled' && stacks.value.tcpStacks === undefined) current.missing.push(t('tcp.unavailableStack'));
            setSnapshots(old => ({ previous: old.current, current }));
        } finally {
            if (pending.current === controller) {
                pending.current = null;
                setBusy(false);
            }
        }
    };

    const latestRefresh = useRef(refresh);
    useEffect(() => { latestRefresh.current = refresh; });
    useEffect(() => {
        if (!autoRefresh) return;
        // Each poll waits for the previous one and skips while the tab is hidden.
        let timer: ReturnType<typeof setTimeout>;
        let stopped = false;
        const tick = async () => {
            if (!document.hidden) await latestRefresh.current();
            if (!stopped) timer = setTimeout(() => void tick(), autoRefresh * 1000);
        };
        void tick();
        return () => { stopped = true; clearTimeout(timer); };
    }, [autoRefresh]);
    const changeAutoRefresh = (value: string) => {
        const seconds = Number(value);
        setAutoRefresh(seconds);
        try { localStorage.setItem(AUTO_REFRESH_KEY, String(seconds)); } catch { /* per-viewer preference only */ }
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
    const udpByNode = new Map<string, Connection[]>();
    for (const connection of snapshot?.connections ?? []) {
        if (connection.network.connType !== 'udp') continue;
        const sessions = udpByNode.get(connection.nodeId);
        if (sessions) sessions.push(connection);
        else udpByNode.set(connection.nodeId, [connection]);
    }

    // Problems first, disabled last, so the list reads as a triage queue.
    const rank: Record<Tone, number> = { danger: 0, warning: 1, success: 2, muted: 3 };
    const byRank = (a: Row, b: Row) => rank[a.tone] - rank[b.tone] || a.name.localeCompare(b.name);
    const previousStacks = previous?.stacks ?? [];
    const previousInbounds = new Map((previous?.inbounds ?? []).map(i => [i.id, i]));
    const previousOutbounds = new Map((previous?.outbounds ?? []).map(n => [n.id, n.status]));
    // Rows only flag counters that grew since the previous snapshot; totals stay in the detail.
    const stackGrowth = (stack?: TCPStackDiagnostic, before?: TCPStackDiagnostic) => stack && before ? [
        [t('tcp.retransmissions'), counterDelta(stack.statistics.retransmissions, before.statistics.retransmissions)],
        [t('tcp.drops'), counterDelta(stack.statistics.drops, before.statistics.drops)],
    ] as const : [];
    const growth = (items: readonly (readonly [string, bigint])[]) => items.filter(([, delta]) => delta > 0n).map(([label, delta]) => `${label} ${plus(delta)}`).join(' · ') || undefined;
    const warnIfGrowing = (tone: Tone, alert?: string): Tone => alert && (tone === 'success' || tone === 'muted') ? 'warning' : tone;
    const inboundRows: Row[] = [...inboundIDs].map(id => {
        const inbound = inboundsByID.get(id), stack = inboundStacks.find(s => s.inboundId === id);
        const alert = growth(stackGrowth(stack, previousStacks.find(s => (!s.scope || s.scope === 'inbound') && s.inboundId === id)));
        const streams = counterDelta(inbound?.statistics?.acceptedStreams, previousInbounds.get(id)?.statistics?.acceptedStreams);
        return {
            id, name: inbound?.name || id, tone: warnIfGrowing(inboundTone(inbound), alert), state: inbound?.status,
            summary: !inbound ? 'TCP Stack' : inbound.status === 'disabled' ? inbound.status
                : `${t('tcp.acceptedStreams')} ${formatCounter(inbound.statistics?.acceptedStreams)}${streams > 0n ? ` (${plus(streams)})` : ''}`,
            alert,
        };
    }).sort(byRank);
    const outboundRows: Row[] = [...outboundIDs].map(id => {
        const outbound = outboundsByID.get(id), status = outbound?.status, stack = outboundStacks.find(s => s.nodeId === id);
        const alert = growth([
            [t('tcp.failures'), counterDelta(status?.failures, previousOutbounds.get(id)?.failures)],
            ...stackGrowth(stack, previousStacks.find(s => s.scope === 'outbound' && s.nodeId === id)),
        ]);
        return {
            id, name: outbound?.name || id, tone: warnIfGrowing(outboundTone(status), alert), state: outboundState(status),
            summary: status ? `↑${nodeRate(status, 'upload')} ↓${nodeRate(status, 'download')}` : '—',
            alert,
        };
    }).sort(byRank);
    const rows = view === 'inbound' ? inboundRows : outboundRows;
    const selected = rows.some(row => row.id === selection[view]) ? selection[view] : rows[0]?.id;

    const elapsed = snapshot && previous ? (Date.parse(snapshot.at) - Date.parse(previous.at)) / 1000 : 0;
    const totalRate = (direction: 'upload' | 'download') => {
        if (elapsed <= 0) return undefined;
        const delta = counterDelta(snapshot?.totals?.[direction], previous?.totals?.[direction]);
        return rate(String(delta * 1000n / BigInt(Math.round(elapsed * 1000))));
    };
    const stackTotalDelta = (key: 'retransmissions' | 'drops') => {
        if (!previous?.stacks) return {};
        const before = previous.stacks;
        const delta = (scope: 'inbound' | 'outbound') => counterDelta(stackScopeSummary(stacks, scope)[key], stackScopeSummary(before, scope)[key]);
        const inbound = delta('inbound'), outbound = delta('outbound');
        return inbound || outbound ? { sub: `${plus(inbound)} / ${plus(outbound)}`, subAlert: true } : {};
    };

    return <section className="min-w-0 space-y-4">
        <Card noMargin><CardBody>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-base font-semibold text-ui-heading">{t('tcp.globalTitle')}</h2>
                    <p className="mt-1 text-xs text-ui-muted">{t('tcp.globalDescription')}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Select ariaLabel={t('tcp.autoRefresh')} value={String(autoRefresh)} onValueChange={changeAutoRefresh} triggerClassName="w-auto min-w-28"
                        items={AUTO_REFRESH_SECONDS.map(seconds => ({ value: String(seconds), label: seconds ? t('tcp.refreshEvery', { count: seconds }) : t('tcp.refreshOff') }))} />
                    <Button type="button" variant="outline-secondary" disabled={busy && !autoRefresh} permission="diagnostics:run" onClick={() => void refresh()}>
                        <RefreshCw size={15} className={busy ? 'animate-spin' : ''} />
                        {/* A steady label keeps polling from flickering the header. */}
                        {busy && !autoRefresh ? t('running') : t('tcp.snapshot')}
                    </Button>
                </div>
            </div>
            {!snapshot && <p className="mt-3 text-sm text-ui-muted">{t('tcp.snapshotHint')}</p>}
            {snapshot && <>
                <div className="mt-2 flex items-center gap-1 text-xs text-ui-muted">
                    <span>{t('tcp.takenAt', { date: new Date(snapshot.at).toLocaleString() })}</span>
                    <Tooltip openOnClick content={<div className="space-y-2">
                        <p>{t('tcp.globalTrafficScope')}</p><p>{t('tcp.noDoubleCount')}</p>
                        {snapshot.stacks && <p>{t('tcp.inboundStackTotals')}: {t('tcp.stackCoverage', { count: inboundCovered.covered })} · {t('tcp.outboundStackTotals')}: {t('tcp.stackCoverage', { count: outboundCovered.covered })}</p>}
                        <p>{t('tcp.deltaHint')}</p>
                    </div>}>
                        <button type="button" aria-label={t('tcp.listHelp')} className="inline-flex size-6 items-center justify-center rounded-ui-md hover:text-ui-heading"><Info size={13} /></button>
                    </Tooltip>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                    <Metric label={t('tcp.globalUpload')} value={formatBytes(snapshot.totals?.upload)} exact={snapshot.totals?.upload} sub={totalRate('upload')} />
                    <Metric label={t('tcp.globalDownload')} value={formatBytes(snapshot.totals?.download)} exact={snapshot.totals?.download} sub={totalRate('download')} />
                    <Metric label={t('tcp.globalActive')} value={snapshot.activeConnections === undefined ? '—' : number(snapshot.activeConnections)} />
                    {snapshot.stacks && <>
                        <Metric label={`${t('tcp.retransmissions')} (In / Out)`} value={`${number(inboundCovered.retransmissions)} / ${number(outboundCovered.retransmissions)}`}
                            {...stackTotalDelta('retransmissions')} />
                        <Metric label={`${t('tcp.drops')} (In / Out)`} value={`${number(inboundCovered.drops)} / ${number(outboundCovered.drops)}`}
                            {...stackTotalDelta('drops')} />
                    </>}
                </div>
                {snapshot.missing.length > 0 && <ul role="status" className="mt-3 space-y-1 text-xs text-ui-warning">{snapshot.missing.map((msg, i) => <li key={i}>{msg}</li>)}</ul>}
            </>}
        </CardBody></Card>
        {snapshot && <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <ToggleGroup type="single" value={view} onValueChange={next => { if (next) { setView(next as View); setMobileOpen(false); } }} aria-label={t('tcp.globalTitle')}>
                    <ToggleItem value="outbound">{t('tcp.outboundsTitle')} <span className="tabular-nums text-ui-muted">{outboundRows.length}</span></ToggleItem>
                    <ToggleItem value="inbound">{t('tcp.inboundsTitle')} <span className="tabular-nums text-ui-muted">{inboundRows.length}</span></ToggleItem>
                </ToggleGroup>
                <Tooltip openOnClick content={t(view === 'inbound' ? 'tcp.inboundsHint' : 'tcp.outboundsHint')}>
                    <button type="button" aria-label={t('tcp.listHelp')} className="inline-flex size-8 items-center justify-center rounded-ui-md text-ui-muted hover:text-ui-heading"><Info size={15} /></button>
                </Tooltip>
                {view === 'outbound' && snapshot.truncatedNodes && <p className="text-xs text-ui-warning">{t('tcp.truncatedNodes')}</p>}
            </div>
            <WorkspaceLayout>
                <WorkspaceDirectory label={t(view === 'inbound' ? 'tcp.inboundsTitle' : 'tcp.outboundsTitle')} hiddenOnMobile={mobileOpen}>
                    <ul className="m-0 list-none divide-y divide-ui-border/40 p-0 md:max-h-[min(72vh,900px)] md:overflow-y-auto md:overscroll-contain">
                        {rows.map(row => <DirectoryRow key={row.id} row={row} selected={row.id === selected} onSelect={() => { setSelection(current => ({ ...current, [view]: row.id })); setMobileOpen(true); }} />)}
                        {!rows.length && <li className="px-3 py-8 text-center text-xs text-ui-muted">{t(view === 'inbound' ? 'tcp.noInbounds' : 'tcp.noOutbounds')}</li>}
                    </ul>
                </WorkspaceDirectory>
                <WorkspaceDetail hiddenOnMobile={!mobileOpen} transitionKey={`${view}:${selected ?? 'empty'}`} order={rows.findIndex(row => row.id === selected)}>
                    {!selected ? <p className="flex min-h-80 items-center justify-center text-sm text-ui-muted">{t('tcp.selectItem')}</p>
                        : view === 'inbound'
                            ? <InboundDetail id={selected} inbound={inboundsByID.get(selected)} stack={inboundStacks.find(s => s.inboundId === selected)} onBack={() => setMobileOpen(false)} />
                            : <OutboundDetail id={selected} outbound={outboundsByID.get(selected)} previous={previousOutbounds.get(selected)} stack={outboundStacks.find(s => s.nodeId === selected)} udpSessions={snapshot.connections ? udpByNode.get(selected) ?? [] : undefined} counters={snapshot.totals?.counters} onBack={() => setMobileOpen(false)} />}
                </WorkspaceDetail>
            </WorkspaceLayout>
            <p className="text-xs text-ui-muted">{t('tcp.privacy')}</p>
        </div>}
    </section>;
}
