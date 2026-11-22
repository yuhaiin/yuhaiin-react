import type { DNSHistoryRecord } from "@/api/dns-history";
import type { Connection } from "@/contract/connection";
import { Badge } from "@/component/v2/badge";
import { cn } from "@/component/v2/styles";
import { ArrowDown, ArrowRight, ArrowUp, ExternalLink, X } from "lucide-react";
import { createElement, useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { connectionHost } from "../actions";
import type { DnsTopology } from "./dns";
import { destinationHost, networkOf, type TopologyEdge, type TopologyModel, type TopologyNode } from "./model";
import { configLink, formatRate, nodeIcon, nodeName, nodeType, selectorLink, statusTone } from "./presentation";
import type { Rate } from "./rates";
import type { Selection } from "./stage";
import styles from "./topology.module.css";

interface DetailsProps {
    selection: Selection;
    model: TopologyModel;
    dns?: DnsTopology;
    dnsRecords: DNSHistoryRecord[];
    /** Recently closed nodes still shown as ghosts. */
    ghost?: TopologyNode;
    connections: Record<string, Connection>;
    rates: Map<string, Rate>;
    onSelect: (selection: Selection) => void;
    onOpenConnection: (connection: Connection) => void;
    onClose?: () => void;
    /** Rendered inside a bottom sheet that has its own title and close button. */
    sheet?: boolean;
}

const LIST_LIMIT = 50;

export function TopologyDetails(props: DetailsProps) {
    const { selection, model, dns } = props;
    if (!selection) return null;
    if (selection.type === "edge") {
        const edge = model.edges.find(item => item.id === selection.id) ?? dns?.edges.find(item => item.id === selection.id);
        if (!edge) return <Gone onClose={props.onClose} sheet={props.sheet} />;
        return <EdgeDetails edge={edge} {...props} />;
    }
    const node = model.nodes.find(item => item.id === selection.id) ?? dns?.nodes.find(item => item.id === selection.id) ?? (props.ghost?.id === selection.id ? props.ghost : undefined);
    if (!node) return <Gone onClose={props.onClose} sheet={props.sheet} />;
    return <NodeDetails node={node} {...props} />;
}

function Gone({ onClose, sheet }: { onClose?: () => void; sheet?: boolean }) {
    const { t } = useTranslation("topology");
    return (
        <Panel title={t("details.gone")} onClose={onClose} sheet={sheet}>
            <p className="text-sm text-ui-muted">{t("details.goneHint")}</p>
        </Panel>
    );
}

function Panel({ title, icon, badges, onClose, children, sheet }: { title: ReactNode; icon?: ReactNode; badges?: ReactNode; onClose?: () => void; children: ReactNode; sheet?: boolean }) {
    const { t } = useTranslation("topology");
    return (
        <div className="flex min-h-0 flex-col gap-4">
            {!sheet && (
                <div className="flex items-start gap-3">
                    {icon}
                    <div className="min-w-0 flex-1">
                        <h2 className="notranslate break-words text-base font-semibold leading-snug text-ui-heading [overflow-wrap:anywhere]">{title}</h2>
                        {badges && <div className="mt-1.5 flex flex-wrap gap-1.5">{badges}</div>}
                    </div>
                    {onClose && (
                        <button type="button" onClick={onClose} aria-label={t("details.close")} className="-m-1 inline-flex size-8 shrink-0 items-center justify-center rounded-ui-sm text-ui-muted hover:bg-ui-hover hover:text-ui-heading">
                            <X size={16} />
                        </button>
                    )}
                </div>
            )}
            {sheet && (
                <div className="flex items-start gap-3">
                    {icon}
                    <div className="min-w-0 flex-1">
                        <p className="notranslate break-words text-sm font-semibold text-ui-heading [overflow-wrap:anywhere]">{title}</p>
                        {badges && <div className="mt-1.5 flex flex-wrap gap-1.5">{badges}</div>}
                    </div>
                </div>
            )}
            {children}
        </div>
    );
}

function Metric({ label, value, tone }: { label: string; value: ReactNode; tone?: "up" | "down" }) {
    return (
        <div className="min-w-0 rounded-ui-md border border-ui-border bg-ui-surface px-3 py-2">
            <div className="text-xs text-ui-muted">{label}</div>
            <div className={cn("truncate font-mono text-sm font-medium tabular-nums text-ui-heading", tone === "up" && styles.up, tone === "down" && styles.down)}>{value}</div>
        </div>
    );
}

function Section({ title, children, count }: { title: string; children: ReactNode; count?: number }) {
    return (
        <section className="min-w-0">
            <h3 className="mb-1.5 flex items-baseline justify-between text-xs font-semibold uppercase tracking-wider text-ui-muted">
                <span>{title}</span>{count !== undefined && <span className="font-mono tabular-nums">{count}</span>}
            </h3>
            {children}
        </section>
    );
}

function NodeDetails({ node, model, dns, dnsRecords, connections, rates, onSelect, onOpenConnection, onClose, sheet }: DetailsProps & { node: TopologyNode }) {
    const { t } = useTranslation("topology");
    const icon = createElement(nodeIcon(node), { size: 16, strokeWidth: 1.75 });
    const tone = statusTone(node.status);
    const link = configLink(node);
    const selector = selectorLink(node);
    const graph = node.dns ? dns : model;
    const incoming = useMemo(() => graph?.edges.filter(edge => edge.to === node.id) ?? [], [graph, node.id]);
    const outgoing = useMemo(() => graph?.edges.filter(edge => edge.from === node.id) ?? [], [graph, node.id]);
    const destinations = useMemo(() => {
        if (node.dns || node.column === "destination") return [];
        const hosts = new Map<string, { count: number; rate: number }>();
        for (const id of node.connectionIds) {
            const connection = connections[id];
            if (!connection) continue;
            const host = destinationHost(connection) || "-";
            const rate = rates.get(id);
            const entry = hosts.get(host) ?? { count: 0, rate: 0 };
            entry.count++;
            entry.rate += (rate?.up ?? 0) + (rate?.down ?? 0);
            hosts.set(host, entry);
        }
        return [...hosts].sort((a, b) => b[1].rate - a[1].rate || b[1].count - a[1].count).slice(0, 8);
    }, [node, connections, rates]);
    const fakeIpMappings = useMemo(() => {
        if (!node.fakeIp) return [];
        const seen = new Map<string, string>();
        for (const id of node.connectionIds) {
            const connection = connections[id];
            if (connection?.fakeIp) seen.set(connection.fakeIp, connection.domain || dns?.fakeIps.get(connection.fakeIp.split(":")[0])?.domain || "");
        }
        return [...seen].slice(0, 8);
    }, [node, connections, dns]);
    const nameOf = (id: string) => {
        const other = graph?.nodes.find(item => item.id === id);
        return other ? nodeName(other, t) : id;
    };

    return (
        <Panel
            title={nodeName(node, t)}
            sheet={sheet}
            onClose={onClose}
            icon={<span className={cn(styles.icon, styles[`tone-${tone}`])} aria-hidden="true">{icon}</span>}
            badges={<>
                <Badge>{nodeType(node, t)}</Badge>
                <Badge variant={tone === "muted" ? "secondary" : tone} dot>{t(`status.${node.status}`)}</Badge>
                {node.fakeIp && <Badge variant="info">FakeIP</Badge>}
            </>}
        >
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                <dt className="text-ui-muted">{t("details.nodeId")}</dt>
                <dd className="notranslate min-w-0 break-all font-mono text-xs leading-5 text-ui-fg">{node.refId || node.id}</dd>
                <dt className="text-ui-muted">{t("details.type")}</dt>
                <dd className="min-w-0 text-ui-fg">{t(`kind.${node.kind}`)}{node.type && node.type !== node.kind ? ` (${node.type})` : ""}</dd>
                {node.selectorName && <>
                    <dt className="text-ui-muted">{t("details.selector")}</dt>
                    <dd className="min-w-0 text-ui-fg">{selector ? <a className="text-ui-primary underline underline-offset-2" href={selector}>{node.selectorName}</a> : node.selectorName}</dd>
                </>}
                {node.mode && node.column === "policy" && <>
                    <dt className="text-ui-muted">{t("details.mode")}</dt>
                    <dd className="min-w-0 text-ui-fg">{t(`mode.${node.mode}`, { defaultValue: node.mode })}</dd>
                </>}
            </dl>

            {node.dns ? (
                <div className="grid grid-cols-2 gap-2">
                    <Metric label={t("details.queries")} value={node.dns.queries} />
                    <Metric label={t("details.failures")} value={node.dns.failures} />
                    <Metric label={t("details.fakeIpAnswers")} value={node.dns.fakeip} />
                    <Metric label={t("details.averageDuration")} value={`${node.dns.averageMs.toFixed(1)} ms`} />
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-2">
                    <Metric label={t("details.activeConnections")} value={node.connections} />
                    <Metric label={t("details.tcpUdp")} value={`${node.tcp} / ${node.udp}`} />
                    <Metric label={t("details.uploadRate")} value={formatRate(node.up)} tone="up" />
                    <Metric label={t("details.downloadRate")} value={formatRate(node.down)} tone="down" />
                </div>
            )}

            {link && (
                <a href={link} className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-ui-primary underline-offset-2 hover:underline">
                    <ExternalLink size={14} />{t("details.openConfig")}
                </a>
            )}

            {(incoming.length > 0 || outgoing.length > 0) && (
                <Section title={t("details.related")}>
                    <ul className="divide-y divide-ui-border overflow-hidden rounded-ui-md border border-ui-border">
                        {[...incoming.map(edge => ({ edge, other: edge.from, inbound: true })), ...outgoing.map(edge => ({ edge, other: edge.to, inbound: false }))].map(({ edge, other, inbound }) => (
                            <li key={edge.id}>
                                <button type="button" className="flex w-full min-w-0 items-center gap-2 px-3 py-2 text-left text-sm hover:bg-ui-hover" onClick={() => onSelect({ type: "edge", id: edge.id })}>
                                    <span className="w-9 shrink-0 text-xs text-ui-tertiary">{inbound ? t("details.from") : t("details.to")}</span>
                                    <span className="notranslate min-w-0 flex-1 truncate text-ui-fg">{nameOf(other)}</span>
                                    <EdgeRates edge={edge} auxiliary={Boolean(node.dns)} />
                                </button>
                            </li>
                        ))}
                    </ul>
                </Section>
            )}

            {fakeIpMappings.length > 0 && (
                <Section title={t("details.fakeIpMapping")}>
                    <ul className="space-y-1 text-xs">
                        {fakeIpMappings.map(([address, domain]) => (
                            <li key={address} className="flex min-w-0 items-center gap-2 font-mono">
                                <span className="truncate text-ui-fg">{address}</span><ArrowRight size={12} className="shrink-0 text-ui-tertiary" /><span className="truncate text-ui-heading">{domain || t("node.unknown")}</span>
                            </li>
                        ))}
                    </ul>
                </Section>
            )}

            {destinations.length > 0 && (
                <Section title={t("details.destinations")} count={destinations.length}>
                    <ul className="space-y-1 text-sm">
                        {destinations.map(([host, value]) => (
                            <li key={host} className="flex min-w-0 items-center justify-between gap-3">
                                <span className="notranslate min-w-0 truncate text-ui-fg">{host}</span>
                                <span className="shrink-0 font-mono text-xs tabular-nums text-ui-muted">{value.count} · {formatRate(value.rate)}</span>
                            </li>
                        ))}
                    </ul>
                </Section>
            )}

            {node.dns
                ? <DnsRecordList ids={node.dns.recordIds} records={dnsRecords} />
                : <ConnectionList ids={node.connectionIds} connections={connections} rates={rates} onOpen={onOpenConnection} />}
        </Panel>
    );
}

function EdgeRates({ edge, auxiliary }: { edge: TopologyEdge; auxiliary?: boolean }) {
    const { t } = useTranslation("topology");
    if (auxiliary) return <span className="shrink-0 font-mono text-xs tabular-nums text-ui-muted">{t("card.queries", { count: edge.connections })}</span>;
    return (
        <span className="flex shrink-0 items-center gap-2 font-mono text-xs tabular-nums">
            <span className="text-ui-muted">{edge.connections}</span>
            <span className={cn("inline-flex items-center", edge.up > 0 ? styles.up : "text-ui-tertiary")}><ArrowUp size={11} />{formatRate(edge.up)}</span>
            <span className={cn("inline-flex items-center", edge.down > 0 ? styles.down : "text-ui-tertiary")}><ArrowDown size={11} />{formatRate(edge.down)}</span>
        </span>
    );
}

function EdgeDetails({ edge, model, dns, dnsRecords, connections, rates, onSelect, onOpenConnection, onClose, sheet }: DetailsProps & { edge: TopologyEdge }) {
    const { t } = useTranslation("topology");
    const auxiliary = edge.id.endsWith("#dns");
    const graph = auxiliary ? dns : model;
    const from = graph?.nodes.find(node => node.id === edge.from);
    const to = graph?.nodes.find(node => node.id === edge.to);
    const recordIds = useMemo(() => {
        if (!auxiliary || !from?.dns || !to?.dns) return [];
        const target = new Set(to.dns.recordIds);
        return from.dns.recordIds.filter(id => target.has(id));
    }, [auxiliary, from, to]);
    return (
        <Panel
            title={<span className="inline-flex flex-wrap items-center gap-1.5">{from ? nodeName(from, t) : edge.from}<ArrowRight size={14} className="text-ui-tertiary" />{to ? nodeName(to, t) : edge.to}</span>}
            sheet={sheet}
            onClose={onClose}
            badges={<>
                <Badge>{auxiliary ? "DNS" : edge.network.toUpperCase()}</Badge>
                {!auxiliary && <Badge variant={edge.up + edge.down > 0 ? "success" : "secondary"} dot>{edge.up + edge.down > 0 ? t("status.active") : t("status.open")}</Badge>}
            </>}
        >
            {auxiliary ? (
                <div className="grid grid-cols-2 gap-2"><Metric label={t("details.queries")} value={edge.connections} /></div>
            ) : (
                <div className="grid grid-cols-3 gap-2">
                    <Metric label={t("details.connectionsShort")} value={edge.connections} />
                    <Metric label={t("details.uploadRate")} value={formatRate(edge.up)} tone="up" />
                    <Metric label={t("details.downloadRate")} value={formatRate(edge.down)} tone="down" />
                </div>
            )}
            <div className="flex flex-wrap gap-2 text-sm">
                {from && <button type="button" className="text-ui-primary underline-offset-2 hover:underline" onClick={() => onSelect({ type: "node", id: from.id })}>{t("details.showNode", { name: nodeName(from, t) })}</button>}
                {to && <button type="button" className="text-ui-primary underline-offset-2 hover:underline" onClick={() => onSelect({ type: "node", id: to.id })}>{t("details.showNode", { name: nodeName(to, t) })}</button>}
            </div>
            {auxiliary
                ? <DnsRecordList ids={recordIds} records={dnsRecords} />
                : <ConnectionList ids={edge.connectionIds} connections={connections} rates={rates} onOpen={onOpenConnection} />}
        </Panel>
    );
}

function ConnectionList({ ids, connections, rates, onOpen }: { ids: string[]; connections: Record<string, Connection>; rates: Map<string, Rate>; onOpen: (connection: Connection) => void }) {
    const { t } = useTranslation("topology");
    const items = useMemo(() => ids
        .map(id => connections[id])
        .filter((connection): connection is Connection => Boolean(connection))
        .sort((a, b) => {
            const ra = rates.get(a.id), rb = rates.get(b.id);
            return ((rb?.up ?? 0) + (rb?.down ?? 0)) - ((ra?.up ?? 0) + (ra?.down ?? 0)) || Number(b.id) - Number(a.id);
        }), [ids, connections, rates]);
    if (!items.length) return null;
    return (
        <Section title={t("details.connections")} count={items.length}>
            <ul className="divide-y divide-ui-border overflow-hidden rounded-ui-md border border-ui-border">
                {items.slice(0, LIST_LIMIT).map(connection => {
                    const rate = rates.get(connection.id);
                    return (
                        <li key={connection.id}>
                            <button type="button" className="flex w-full min-w-0 flex-col gap-0.5 px-3 py-2 text-left hover:bg-ui-hover" onClick={() => onOpen(connection)}>
                                <span className="flex min-w-0 items-center gap-2">
                                    <Badge className="shrink-0">{networkOf(connection).toUpperCase()}</Badge>
                                    <span className="notranslate min-w-0 flex-1 truncate text-sm text-ui-heading">{connectionHost(connection) || connection.addr}</span>
                                </span>
                                <span className="flex min-w-0 items-center gap-2 font-mono text-xs tabular-nums text-ui-muted">
                                    <span className="min-w-0 flex-1 truncate">{connection.process || connection.source}</span>
                                    <span className={cn("inline-flex items-center", rate?.up ? styles.up : "")}><ArrowUp size={11} />{formatRate(rate?.up ?? 0)}</span>
                                    <span className={cn("inline-flex items-center", rate?.down ? styles.down : "")}><ArrowDown size={11} />{formatRate(rate?.down ?? 0)}</span>
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>
            {items.length > LIST_LIMIT && <p className="mt-1.5 text-xs text-ui-muted">{t("details.more", { count: items.length - LIST_LIMIT })}</p>}
        </Section>
    );
}

function DnsRecordList({ ids, records }: { ids: number[]; records: DNSHistoryRecord[] }) {
    const { t, i18n } = useTranslation("topology");
    const byId = useMemo(() => new Map(records.map(record => [record.id, record])), [records]);
    const items = ids.map(id => byId.get(id)).filter((record): record is DNSHistoryRecord => Boolean(record)).slice(0, 25);
    const time = new Intl.DateTimeFormat(i18n.language, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    if (!items.length) return null;
    return (
        <Section title={t("details.recentQueries")} count={items.length}>
            <ul className="divide-y divide-ui-border overflow-hidden rounded-ui-md border border-ui-border">
                {items.map(record => (
                    <li key={record.id} className="flex min-w-0 flex-col gap-0.5 px-3 py-2">
                        <span className="flex min-w-0 items-center gap-2">
                            <Badge className="shrink-0">{record.queryType}</Badge>
                            <span className="notranslate min-w-0 flex-1 truncate text-sm text-ui-heading">{record.domain.replace(/\.$/, "")}</span>
                            <Badge variant={["success", "nxdomain", "nodata"].includes(record.outcome) ? "secondary" : "danger"} className="shrink-0">{record.outcome}</Badge>
                        </span>
                        <span className="flex min-w-0 items-center gap-2 font-mono text-xs tabular-nums text-ui-muted">
                            <span>{time.format(new Date(record.createdAt))}</span>
                            <span>{(record.durationNs / 1e6).toFixed(1)} ms</span>
                            <span className="min-w-0 flex-1 truncate">{record.fakeip?.returned ? `FakeIP ${record.fakeip.ipv4 || record.fakeip.ipv6}` : record.answerSummary || record.resolverLabel || record.resolver}</span>
                        </span>
                    </li>
                ))}
            </ul>
        </Section>
    );
}
