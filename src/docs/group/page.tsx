import { clearHashSearch, useHashSearch } from '@/hooks/useHashLocation';
import { collectPages } from "@/api/paging";
import { useTranslation } from 'react-i18next';
import NodeImportModal from "./NodeImportModal";

import { APIError } from "@/api/client";
import { deleteNode, latencyNode, listNodes, selectedNodes, useNode as selectNode, type NodeLatencyType } from "@/api/nodes";
import {
    LatencyDNSUrlDefault,
    LatencyDNSUrlKey,
    LatencyHTTPUrlDefault,
    LatencyHTTPUrlKey,
    LatencyIPUrlDefault,
    LatencyIPUrlKey,
    LatencyIPv6Default,
    LatencyIPv6Key,
    LatencyStunTCPUrlDefault,
    LatencyStunTCPUrlKey,
    LatencyStunUrlDefault,
    LatencyStunUrlKey,
    normalizeLatencyDNSUrl,
} from "@/common/apiurl";
import { allowNavigation } from "@/hooks/navigation-guard";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useAsyncAction } from "@/hooks/use-editor-draft";
import { Badge } from "@/component/v2/badge";
import { Button } from "@/component/v2/button";
import { MainContainer } from "@/component/v2/card";
import { WorkspaceDetail, WorkspaceDirectory, WorkspaceLayout } from "@/component/workspace-layout";
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "@/component/v2/dropdown";
import { Input } from "@/component/v2/input";
import { Spinner } from "@/component/v2/spinner";
import { GlobalToastContext } from "@/component/v2/toast";
import type { Node, NodeLatencyResponse } from "@/contract/node";
import clsx from "clsx";
import { ArrowLeft, Check, ChevronDown, Gauge, Layers, Network, Plus, Power, Search, Upload } from "lucide-react";
import { FC, memo, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import useSWR from "swr";
import { useLocalStorage } from "usehooks-ts";
import { VList } from "virtua";
import Loading, { Error as ErrorDisplay } from "../../component/v2/loading";
import { NodeModal } from "../node/modal";

const LATENCY_STORAGE_LIMIT = 500;
const GROUP_VIRTUALIZE_THRESHOLD = 60;

function errorOf(error: unknown): APIError | undefined {
    if (!error) return undefined;
    if (typeof error === "object" && "code" in error && "msg" in error) return error as APIError;
    return { code: 500, msg: error instanceof Error ? error.message : String(error) };
}

function errorRaw(raw: unknown): string | undefined {
    if (raw === undefined || raw === null) return undefined;
    if (typeof raw === "string") return raw;
    try {
        return JSON.stringify(raw);
    } catch {
        return String(raw);
    }
}

function chainLabel(node: Node): string {
    return node.chain.map((item) => item.type).join(" -> ");
}

type NodeIPLatency = NonNullable<NodeLatencyResponse["ip"]>;
type NodeSTUNLatency = NonNullable<NodeLatencyResponse["stun"]>;
type NodeLatencyValue = string | NodeIPLatency | NodeSTUNLatency;
type NodeLatencyState = Partial<Record<NodeLatencyType, NodeLatencyValue>>;

const latencyActions: Array<{ type: NodeLatencyType; label: string }> = [
    { type: "tcp", label: "TCP Ping" },
    { type: "udp", label: "UDP Ping" },
    { type: "stun", label: "STUN Test" },
    { type: "stun_tcp", label: "STUN TCP Test" },
    { type: "ip", label: "IP Check" },
];

function latencyText(value: NodeLatencyValue | undefined): string {
    if (!value) return "N/A";
    if (typeof value === "string") return value;
    if (isIPLatency(value)) {
        return [value.ipv4, value.ipv6].filter(Boolean).join(" / ") || "N/A";
    }
    return value.mapping || value.mappedAddress || value.xorMappedAddress || value.filtering || "N/A";
}

type LatencyDetailKey = "ipv4" | "ipv6" | "mapping" | "filtering" | "mappedAddress" | "xorMappedAddress";

function latencyDetail(value: NodeLatencyValue | undefined, key: LatencyDetailKey): string {
    if (!value || typeof value === "string") return "N/A";
    if (isIPLatency(value)) {
        switch (key) {
            case "ipv4":
                return value.ipv4 || "N/A";
            case "ipv6":
                return value.ipv6 || "N/A";
            default:
                return "N/A";
        }
    }
    switch (key) {
        case "mapping":
            return value.mapping || "N/A";
        case "filtering":
            return value.filtering || "N/A";
        case "mappedAddress":
            return value.mappedAddress || "N/A";
        case "xorMappedAddress":
            return value.xorMappedAddress || "N/A";
        default:
            return "N/A";
    }
}

function isIPLatency(value: NodeIPLatency | NodeSTUNLatency): value is NodeIPLatency {
    return "ipv4" in value || "ipv6" in value;
}

function latencyMilliseconds(value: NodeLatencyValue | undefined): number | undefined {
    if (typeof value !== "string") return undefined;
    const match = /^\s*(\d+(?:\.\d+)?)\s*ms\s*$/i.exec(value);
    return match ? Number(match[1]) : undefined;
}

function latencyVariant(value: NodeLatencyValue | undefined): "secondary" | "success" | "warning" | "danger" {
    if (!value) return "secondary";
    if (typeof value === "string") {
        if (value.trim().toLowerCase() === "n/a") return "secondary";
        if (value.toLowerCase().includes("error")) return "danger";
    }
    const milliseconds = latencyMilliseconds(value);
    if (milliseconds === undefined) return "success";
    if (milliseconds < 200) return "success";
    if (milliseconds <= 1000) return "warning";
    return "danger";
}

function latencyTextClass(value: NodeLatencyValue | undefined): string {
    if (!value || typeof value !== "string" || value.trim().toLowerCase() === "n/a") return "text-ui-muted";
    if (value.toLowerCase().includes("error")) return "text-ui-danger";
    if (latencyMilliseconds(value) === undefined) return "text-ui-fg";
    return {
        success: "text-ui-success",
        warning: "text-ui-warning",
        danger: "text-ui-danger",
        secondary: "text-ui-muted",
    }[latencyVariant(value)];
}

function latencyResultValue(result: NodeLatencyResponse): NodeLatencyValue {
    if (!result.ok) return result.error || "error";
    if (result.latencyMs !== undefined) return `${result.latencyMs}ms`;
    if (result.ip) return result.ip;
    if (result.stun) return result.stun;
    return "ok";
}


function isEmptyLatency(value: NodeLatencyValue | undefined): boolean {
    if (value === undefined || value === null) return true;
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        return !normalized || normalized === "n/a" || normalized === "該当なし";
    }
    return false;
}

const ResultChip: FC<{ label: string; value: NodeLatencyValue | undefined; loading?: boolean }> = ({ label, value, loading }) => {
    if (!loading && isEmptyLatency(value)) return null;
    return (
        <div className="inline-flex min-w-0 max-w-full items-center gap-2 rounded-full border border-ui-border/80 bg-ui-bg px-3 py-1.5">
            <span className="shrink-0 text-[11px] font-medium uppercase tracking-wide text-ui-muted">{label}</span>
            {loading
                ? <Spinner size="sm" />
                : <span className={clsx("truncate text-sm font-semibold font-mono", latencyTextClass(value))}>{latencyText(value)}</span>}
        </div>
    );
};

const ResultRow: FC<{ label: string; value: NodeLatencyValue | undefined; loading?: boolean }> = ({ label, value, loading }) => {
    if (!loading && isEmptyLatency(value)) return null;
    return (
        <div className="flex min-w-0 items-start gap-3 rounded-ui-md border border-ui-border/70 bg-ui-bg/80 px-3 py-2">
            <span className="mt-0.5 w-16 shrink-0 text-[11px] font-medium uppercase tracking-wide text-ui-muted">{label}</span>
            {loading
                ? <Spinner size="sm" className="mt-0.5" />
                : (
                    <span className={clsx("min-w-0 break-all text-sm font-medium font-mono leading-snug", latencyTextClass(value))}>
                        {latencyText(value)}
                    </span>
                )}
        </div>
    );
};

const ResultGroup: FC<{ title: string; children: ReactNode }> = ({ title, children }) => (
    <div className="min-w-0 space-y-2">
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ui-muted">{title}</div>
        <div className="space-y-2">{children}</div>
    </div>
);

const GroupPicker: FC<{
    groups: string[];
    counts: Map<string, number>;
    value: string;
    onChange: (group: string) => void;
}> = ({ groups, counts, value, onChange }) => {
    const { t: uiT } = useTranslation('ui');

    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState("");

    const changeOpen = (next: boolean) => {
        setOpen(next);
        if (!next) setFilter("");
    };

    const filtered = filter.trim()
        ? groups.filter((group) => group.toLowerCase().includes(filter.trim().toLowerCase()))
        : groups;
    const selectedCount = counts.get(value) ?? 0;

    return (
        <Dropdown open={open} onOpenChange={changeOpen}>
            <DropdownTrigger asChild>
                <Button
                    type="button"
                    variant="outline-secondary"
                    className="h-8 w-full min-w-0 justify-between gap-2 rounded-ui-md border-transparent bg-transparent px-1 text-sm font-medium"
                >
                    <span className="flex min-w-0 items-center gap-2">
                        <Layers size={15} className="shrink-0 opacity-70" />
                        <span className="truncate">{value || "Select group"}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5">
                        {value && (
                            <span className="rounded-ui-sm bg-ui-surface-muted px-1.5 py-0.5 text-[11px] tabular-nums text-ui-muted">
                                {selectedCount}
                            </span>
                        )}
                        <ChevronDown size={14} className="opacity-60" />
                    </span>
                </Button>
            </DropdownTrigger>
            <DropdownContent
                align="start"
                className="min-w-[min(320px,calc(100vw-2rem))] w-[var(--radix-dropdown-menu-trigger-width)] max-w-[min(420px,calc(100vw-2rem))]"
            >
                <div
                    className="sticky top-0 z-10 border-b border-ui-border bg-ui-surface px-2 pb-2 pt-1"
                    onKeyDown={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <div className="relative">
                        <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ui-muted" />
                        <Input
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            placeholder={uiT("filterGroups")}
                            onKeyDown={event => {
                                if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                                    event.preventDefault();
                                    const choices = event.currentTarget.closest('[role="menu"]')?.querySelectorAll<HTMLElement>('[role="menuitem"]');
                                    const choice = event.key === 'ArrowDown' ? choices?.[0] : choices?.[choices.length - 1];
                                    choice?.focus();
                                } else if (event.key === 'Escape') {
                                    event.preventDefault(); changeOpen(false);
                                }
                            }}
                            className="h-8 pl-8 text-sm"
                        />
                    </div>
                </div>
                {filtered.length === 0 ? (
                    <div className="px-3 py-4 text-center text-xs text-ui-muted">{uiT("noMatchingGroups")}</div>
                ) : (
                    filtered.map((group) => {
                        const active = group === value;
                        const count = counts.get(group) ?? 0;
                        return (
                            <DropdownItem
                                key={group}
                                className={clsx("gap-2", active && "bg-ui-primary-soft text-ui-primary")}
                                onSelect={() => onChange(group)}
                            >
                                <span className="min-w-0 flex-1 truncate font-medium">{group}</span>
                                <span className={clsx(
                                    "rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                                    active ? "bg-ui-primary/15 text-ui-primary" : "bg-ui-chip text-ui-chip-fg"
                                )}>
                                    {count}
                                </span>
                                {active && <Check size={14} className="shrink-0 text-ui-primary" />}
                            </DropdownItem>
                        );
                    })
                )}
            </DropdownContent>
        </Dropdown>
    );
};

export function pruneLatencyMap(
    current: Record<string, NodeLatencyState>,
    keepIds: Iterable<string>,
    limit = LATENCY_STORAGE_LIMIT,
): Record<string, NodeLatencyState> {
    const keep = new Set(keepIds);
    const next: Record<string, NodeLatencyState> = {};
    for (const id of keep) {
        if (current[id]) next[id] = current[id];
    }
    if (Object.keys(next).length <= limit) {
        const currentIds = Object.keys(current);
        if (currentIds.length === Object.keys(next).length && currentIds.every((id) => next[id] === current[id])) {
            return current;
        }
        return next;
    }

    const entries = Object.entries(next);
    entries.sort(([a], [b]) => a.localeCompare(b));
    return Object.fromEntries(entries.slice(-limit));
}

export function clearBusyLatency(
    current: Record<string, Partial<Record<NodeLatencyType, boolean>>>,
    id: string,
    type: NodeLatencyType,
): Record<string, Partial<Record<NodeLatencyType, boolean>>> {
    const node = current[id];
    if (!node || !(type in node)) return current;

    const nextNode = { ...node };
    delete nextNode[type];
    const next = { ...current };
    if (Object.keys(nextNode).length === 0) delete next[id];
    else next[id] = nextNode;
    return next;
}

export function pruneBusyLatency(
    current: Record<string, Partial<Record<NodeLatencyType, boolean>>>,
    keepIds: Iterable<string>,
): Record<string, Partial<Record<NodeLatencyType, boolean>>> {
    const keep = new Set(keepIds);
    const entries = Object.entries(current).filter(([id]) => keep.has(id));
    if (entries.length === Object.keys(current).length) {
        return current;
    }
    return Object.fromEntries(entries);
}

const NodeDirectoryItem = memo(function NodeDirectoryItem({ item, selected, onOpen, latency, busy, defaults }: {
    item: Node; selected: boolean; onOpen: () => void; latency?: NodeLatencyState;
    busy?: Partial<Record<NodeLatencyType, boolean>>; defaults: { tcp?: Node; udp?: Node } | undefined;
}) {
    const { t: uiT } = useTranslation('ui');
    const { t } = useTranslation('routing');
    return <button type="button" aria-label={item.name || item.id} aria-current={selected ? 'true' : undefined} title={item.name || item.id} onClick={onOpen}
        className={clsx('relative flex w-full min-w-0 items-center gap-2.5 rounded-ui-md px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ui-focus', selected ? 'bg-ui-primary-soft/55' : 'hover:bg-ui-surface-muted/75')}>
        {selected && <span aria-hidden="true" className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-ui-primary" />}
        <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2"><span className="min-w-0 flex-1 truncate text-sm font-medium leading-5 text-ui-heading">{item.name || item.id}</span>
                <span className={clsx('h-1.5 w-1.5 shrink-0 rounded-full', item.enabled ? 'bg-ui-success' : 'bg-ui-muted/50')} role="img" aria-label={item.enabled ? uiT('enabled') : uiT('off')} />
                {(defaults?.tcp?.id === item.id || defaults?.udp?.id === item.id) && <Check size={13} aria-label={t('defaultNode')} className="shrink-0 text-ui-primary" />}
            </div>
            <div className="mt-0.5 flex min-w-0 items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-[11px] leading-4 text-ui-muted">{chainLabel(item) || t('noProtocol')}{!item.enabled && ` · ${uiT('off')}`}</span>
                {busy?.tcp ? <Spinner size="sm" /> : latency?.tcp && <span className={clsx('shrink-0 font-mono text-[11px] tabular-nums', latencyTextClass(latency.tcp))}>{latencyText(latency.tcp)}</span>}
            </div>
        </div>
    </button>;
});

function NodeOverview({ item, latency, busy, defaults, onLatency, onUse, onBack, using, locked }: {
    item: Node; latency?: NodeLatencyState; busy?: Partial<Record<NodeLatencyType, boolean>>;
    defaults?: { tcp?: Node; udp?: Node }; onLatency: (type: NodeLatencyType) => void;
    onUse: () => void; onBack: () => void; using: boolean; locked: boolean;
}) {
    const { t: uiT } = useTranslation('ui');
    const { t } = useTranslation('routing');
    const hasLatency = Boolean(busy?.tcp || busy?.udp || !isEmptyLatency(latency?.tcp) || !isEmptyLatency(latency?.udp));
    const hasIp = Boolean(busy?.ip || latency?.ip);
    const hasStun = Boolean(busy?.stun || busy?.stun_tcp || latency?.stun || latency?.stun_tcp);
    return <>
        <header className="mb-5 border-b border-ui-border/60 pb-5">
            <Button size="sm" variant="outline-secondary" className="mb-3 gap-2 border-transparent bg-transparent md:hidden" onClick={onBack}><ArrowLeft size={16} />{t('backToNodes')}</Button>
            <p className="mb-1 text-xs text-ui-muted">{t('nodeDetails')}</p>
            <h2 className="break-words text-xl font-semibold tracking-tight text-ui-heading">{item.name || item.id}</h2>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <Badge pill variant={item.enabled ? 'success' : 'secondary'}>{item.enabled ? uiT('enabled') : uiT('off')}</Badge>
                <span className="text-ui-muted">{item.group || 'manual'}</span>
                {defaults?.tcp?.id === item.id && <Badge pill variant="primary">{t('defaultForTCP')}</Badge>}
                {defaults?.udp?.id === item.id && <Badge pill variant="primary">{t('defaultForUDP')}</Badge>}
            </div>
        </header>
        <section className="mb-6 border-b border-ui-border/60 pb-6" aria-label={t('connectivityChecks')}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-ui-heading">{t('connectivityChecks')}</h3>
                <div className="flex flex-wrap gap-2">
                    <Dropdown><DropdownTrigger asChild><Button size="sm" variant="outline-secondary" className="gap-2" disabled={locked}><Gauge size={15} />{uiT('test')}<ChevronDown size={14} /></Button></DropdownTrigger>
                        <DropdownContent align="end">{latencyActions.map(action => <DropdownItem key={action.type} disabled={locked || busy?.[action.type]} onSelect={() => onLatency(action.type)}>{busy?.[action.type] ? <Spinner size="sm" className="mr-2" /> : <Gauge size={15} className="mr-2" />}{action.label}</DropdownItem>)}</DropdownContent>
                    </Dropdown>
                    <Button size="sm" variant="outline-primary" className="gap-2" disabled={locked || using || !item.enabled} onClick={onUse}>{using ? <Spinner size="sm" /> : <Power size={15} />}{t('setDefaultNode')}</Button>
                </div>
            </div>
            {hasLatency || hasIp || hasStun ? <div className="grid gap-4 sm:grid-cols-2">
                {hasLatency && <ResultGroup title={t('lastLatencyResults')}><div className="flex flex-wrap gap-2"><ResultChip label="TCP" value={latency?.tcp} loading={busy?.tcp} /><ResultChip label="UDP" value={latency?.udp} loading={busy?.udp} /></div></ResultGroup>}
                {hasIp && <ResultGroup title={uiT('ip')}><ResultRow label="IPv4" value={latencyDetail(latency?.ip, 'ipv4')} loading={busy?.ip} /><ResultRow label="IPv6" value={latencyDetail(latency?.ip, 'ipv6')} loading={busy?.ip} /></ResultGroup>}
                {hasStun && <ResultGroup title="STUN"><div className="flex flex-wrap gap-2"><ResultChip label="NAT" value={latencyDetail(latency?.stun, 'mapping')} loading={busy?.stun} /><ResultChip label="Filter" value={latencyDetail(latency?.stun, 'filtering')} loading={busy?.stun} /></div><ResultRow label="Mapped" value={latencyDetail(latency?.stun, 'mappedAddress')} loading={busy?.stun} /><ResultRow label="TCP" value={latencyDetail(latency?.stun_tcp, 'mappedAddress')} loading={busy?.stun_tcp} /></ResultGroup>}
            </div> : <p className="text-sm text-ui-muted">{uiT('noTestResultsYet')}</p>}
        </section>
    </>;
}

export default function Group() {
    const { t: uiT } = useTranslation('ui');
    const { t } = useTranslation('routing');

    const ctx = useContext(GlobalToastContext);
    const desktop = useMediaQuery('(min-width: 768px)');
    const initialized = useRef(false);
    const [editorState, setEditorState] = useState({ dirty: false, pending: false });
    const [localShowdata, setShowdata] = useState({ show: false, id: "", new: false });
    const search = useHashSearch();
    const linkedId = new URLSearchParams(search).get('node');
    const showdata = linkedId ? { show: true, id: linkedId, new: false } : localShowdata;
    const closeLink = () => { if (linkedId) clearHashSearch(); };
    const [importOpen, setImportOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState("");
    const [query, setQuery] = useState("");
    const [latency, setLatency] = useLocalStorage<Record<string, NodeLatencyState>>("latency-v2-contract", {});
    const [busyLatency, setBusyLatency] = useState<Record<string, Partial<Record<NodeLatencyType, boolean>>>>({});
    const [latencyHTTP] = useLocalStorage(LatencyHTTPUrlKey, LatencyHTTPUrlDefault);
    const [latencyDNS] = useLocalStorage(LatencyDNSUrlKey, LatencyDNSUrlDefault);
    const [latencyIPv6] = useLocalStorage(LatencyIPv6Key, LatencyIPv6Default);
    const [latencyIPUrl] = useLocalStorage(LatencyIPUrlKey, LatencyIPUrlDefault);
    const [latencyStunUrl] = useLocalStorage(LatencyStunUrlKey, LatencyStunUrlDefault);
    const [latencyStunTCPUrl] = useLocalStorage(LatencyStunTCPUrlKey, LatencyStunTCPUrlDefault);
    const { data: defaults, error: defaultsError, mutate: mutateDefaults } = useSWR("/api/v2/nodes/selected", selectedNodes, { revalidateOnFocus: false });
    const { pending: using, run: runUse } = useAsyncAction(error => ctx.Error(errorOf(error)?.msg ?? t("defaultNodeFailed")));
    const { data, error, mutate } = useSWR("/api/v2/nodes/all", () => collectPages(listNodes), { revalidateOnFocus: false });

    const apiError = errorOf(error);
    const items = useMemo(() => data?.items ?? [], [data?.items]);
    const nodeIds = useMemo(() => items.map((item) => item.id), [items]);
    const nodeIdsRef = useRef<string[]>([]);
    const groups = useMemo(() => {
        const values = new Set(items.map(item => item.group || "manual"));
        return Array.from(values).sort((a, b) => a.localeCompare(b));
    }, [items]);
    const groupCounts = useMemo(() => {
        const counts = new Map<string, number>();
        for (const item of items) {
            const group = item.group || "manual";
            counts.set(group, (counts.get(group) ?? 0) + 1);
        }
        return counts;
    }, [items]);
    const groupItems = useMemo(() => {
        if (!selectedGroup) return [];
        const inGroup = items.filter(item => (item.group || "manual") === selectedGroup);
        const q = query.trim().toLowerCase();
        if (!q) return inGroup;
        return inGroup.filter((item) => {
            const haystack = [
                item.name,
                item.id,
                item.origin,
                chainLabel(item),
                ...item.chain.map((step) => step.type),
            ].join(" ").toLowerCase();
            return haystack.includes(q);
        });
    }, [items, query, selectedGroup]);
    const modalGroups = useMemo(
        () => selectedGroup
            ? [selectedGroup, ...groups.filter(group => group !== selectedGroup)]
            : ["manual", ...groups.filter(group => group !== "manual")],
        [groups, selectedGroup],
    );

    useEffect(() => {
        if (selectedGroup && !groups.includes(selectedGroup)) setSelectedGroup("");
    }, [groups, selectedGroup]);

    useEffect(() => {
        if (!selectedGroup && groups.length > 0) setSelectedGroup(groups[0]);
    }, [groups, selectedGroup]);

    useEffect(() => {
        nodeIdsRef.current = data === undefined ? [] : nodeIds;
        if (data === undefined) return;
        setLatency((prev) => pruneLatencyMap(prev, nodeIds));
        setBusyLatency((prev) => pruneBusyLatency(prev, nodeIds));
    }, [data, nodeIds, setLatency]);

    const selectedItem = items.find(item => item.id === showdata.id);
    useEffect(() => {
        if (!initialized.current && desktop && groupItems.length && !showdata.show) {
            initialized.current = true;
            setShowdata({ show: true, id: groupItems[0].id, new: false });
        }
    }, [desktop, groupItems, showdata.show]);

    if (apiError && data === undefined) return <ErrorDisplay statusCode={apiError.code} title={apiError.msg} raw={errorRaw(apiError.raw)} />;
    if (data === undefined) return <Loading />;

    const closeDetails = () => {
        initialized.current = true;
        setShowdata({ show: false, id: '', new: false });
        setEditorState({ dirty: false, pending: false });
        closeLink();
    };
    const openNode = (id: string) => {
        if (showdata.show && !showdata.new && showdata.id === id) return;
        if (!allowNavigation()) return;
        initialized.current = true;
        closeLink();
        setShowdata({ show: true, id, new: false });
    };
    const deleteCurrentNode = async () => {
        await deleteNode(showdata.id);
        ctx.Info(t('nodeRemoved'));
        closeDetails();
        await mutate();
    };
    const handleCreate = () => {
        if (!allowNavigation()) return;
        initialized.current = true;
        closeLink();
        setShowdata({ show: true, id: '', new: true });
    };
    const changeGroup = (group: string) => {
        if (group === selectedGroup || !allowNavigation()) return;
        initialized.current = true;
        closeLink();
        setSelectedGroup(group);
        const first = items.find(item => (item.group || 'manual') === group);
        setShowdata(desktop && first ? { show: true, id: first.id, new: false } : { show: false, id: '', new: false });
        setEditorState({ dirty: false, pending: false });
    };
    const handleUse = (id: string) => {
        void runUse(async () => {
            await selectNode(id);
            void mutateDefaults();
            ctx.Info(t('defaultNodeUpdated'));
        });
    };
    const backToNodes = () => { if (allowNavigation()) closeDetails(); };

    const handleLatency = (id: string, type: NodeLatencyType) => {
        setBusyLatency((prev) => ({ ...prev, [id]: { ...prev[id], [type]: true } }));
        latencyNode(id, type, {
            tcpURL: latencyHTTP,
            udpHost: normalizeLatencyDNSUrl(latencyDNS),
            ipURL: latencyIPUrl,
            stunHost: latencyStunUrl,
            stunTCPHost: latencyStunTCPUrl,
            ipv6: latencyIPv6,
        })
            .then((result) => {
                setLatency((prev) => pruneLatencyMap(
                    { ...prev, [id]: { ...prev[id], [type]: latencyResultValue(result) } },
                    nodeIdsRef.current,
                ));
                if (!result.ok) ctx.Error(result.error ?? "Latency failed");
            })
            .catch((err: unknown) => {
                const apiErr = errorOf(err);
                setLatency((prev) => pruneLatencyMap(
                    { ...prev, [id]: { ...prev[id], [type]: "error" } },
                    nodeIdsRef.current,
                ));
                ctx.Error(apiErr?.msg ?? "Latency failed");
            })
            .finally(() => setBusyLatency((prev) => clearBusyLatency(prev, id, type)));
    };

    return <MainContainer className="max-w-[1440px]">
        <NodeImportModal show={importOpen} group={selectedGroup || 'manual'} onHide={() => setImportOpen(false)} onChanged={() => { void mutate(); }} onSaved={() => setImportOpen(false)} />
        <header className={clsx('mb-6 flex-wrap items-center justify-between gap-4', showdata.show ? 'hidden md:flex' : 'flex')}>
            <div><h1 className="text-3xl font-semibold tracking-tight text-ui-heading">{t('nodesTask')}</h1><p className="mt-2 text-sm text-ui-muted">{t('nodeDirectoryCount', { count: groups.length, nodes: items.length, groups: groups.length })}</p></div>
            <div className="flex items-center gap-2"><Button variant="outline-secondary" disabled={editorState.pending} onClick={() => setImportOpen(true)}><Upload className="mr-1.5" size={16} />{uiT('import')}</Button><Button variant="primary" onClick={handleCreate} disabled={editorState.pending || showdata.new}><Plus className="mr-1.5" size={16} />{uiT('new')}</Button></div>
        </header>
        {groups.length === 0 && !showdata.show ? <div className="rounded-ui-lg border border-dashed border-ui-border px-4 py-10 text-center">
            <Network className="mx-auto mb-3 text-ui-primary" size={28} aria-hidden="true" /><h2 className="text-sm font-semibold text-ui-heading">{uiT('noOutboundGroupsYet')}</h2>
            <p className="mt-1 text-xs text-ui-muted">{uiT('createANodeOrImportJsonToGetStarted')}</p><Button className="mt-4 gap-2" variant="primary" onClick={handleCreate}><Plus size={16} />{uiT('newNode')}</Button>
        </div> : <WorkspaceLayout>
            <WorkspaceDirectory label={t('nodeDirectory')} hiddenOnMobile={showdata.show}>
                <div className="mb-2 space-y-2 border-b border-ui-border/50 px-1 pb-3">
                    <GroupPicker groups={groups} counts={groupCounts} value={selectedGroup} onChange={changeGroup} />
                    <div className="relative"><Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ui-muted" /><Input aria-label={uiT('searchNodes')} value={query} onChange={e => setQuery(e.target.value)} placeholder={uiT('searchNodes')} className="h-8 border-transparent bg-ui-surface-muted/70 pl-9 text-xs shadow-none focus:border-ui-primary/40 focus:bg-ui-surface" /></div>
                </div>
                {apiError ? <ErrorDisplay statusCode={apiError.code} title={apiError.msg} raw={errorRaw(apiError.raw)} /> : groupItems.length === 0 ? <p className="px-3 py-8 text-center text-sm text-ui-muted">{t(query.trim() ? 'noMatchingNodes' : 'noGroupNodes')}</p> :
                    groupItems.length > GROUP_VIRTUALIZE_THRESHOLD ? <VList data={groupItems} itemSize={57} bufferSize={456} style={{ height: 'min(72vh, 900px)', width: '100%' }}>
                        {item => <NodeDirectoryItem key={item.id} item={item} selected={!showdata.new && showdata.id === item.id} onOpen={() => openNode(item.id)} latency={latency[item.id]} busy={busyLatency[item.id]} defaults={defaults} />}
                    </VList> : <div>{groupItems.map(item => <NodeDirectoryItem key={item.id} item={item} selected={!showdata.new && showdata.id === item.id} onOpen={() => openNode(item.id)} latency={latency[item.id]} busy={busyLatency[item.id]} defaults={defaults} />)}</div>}
            </WorkspaceDirectory>
            <WorkspaceDetail hiddenOnMobile={!showdata.show}>
                {showdata.show ? <>
                    {selectedItem && !showdata.new ? <NodeOverview item={selectedItem} latency={latency[selectedItem.id]} busy={busyLatency[selectedItem.id]} defaults={defaults} using={using} locked={editorState.dirty || editorState.pending}
                        onLatency={type => handleLatency(selectedItem.id, type)} onUse={() => handleUse(selectedItem.id)} onBack={backToNodes} /> : <header className="mb-5 border-b border-ui-border/60 pb-5"><Button size="sm" variant="outline-secondary" className="mb-3 gap-2 border-transparent md:hidden" onClick={backToNodes}><ArrowLeft size={16} />{t('backToNodes')}</Button><h2 className="break-words text-xl font-semibold text-ui-heading">{showdata.new ? uiT('newNode') : t('nodeDetails')}</h2></header>}
                    {defaultsError && <div role="alert" className="mb-4 text-sm text-ui-danger">{t('defaultNodeStateFailed')} <Button size="sm" onClick={() => void mutateDefaults()}>{t('retry')}</Button></div>}
                    <NodeModal key={showdata.new ? 'new-node' : showdata.id} show id={showdata.id} isNew={showdata.new} editable presentation="inline" groups={modalGroups} onStateChange={setEditorState}
                        onChanged={() => { void mutate(); }}
                        onSave={node => { initialized.current = true; closeLink(); setShowdata({ show: true, id: node.id, new: false }); void mutateDefaults(); }}
                        onHide={saved => { if (!saved) closeDetails(); }} onDelete={showdata.new ? undefined : deleteCurrentNode} />
                </> : <div className="flex min-h-80 flex-col items-center justify-center gap-3 p-6 text-center text-ui-muted"><Network size={28} aria-hidden="true" /><h2 className="text-lg font-medium text-ui-heading">{t('selectNode')}</h2><p className="max-w-sm text-sm">{t('selectNodeHelp')}</p><Button variant="outline-primary" className="gap-2" onClick={handleCreate}><Plus size={16} />{uiT('newNode')}</Button></div>}
            </WorkspaceDetail>
        </WorkspaceLayout>}
    </MainContainer>;
}
