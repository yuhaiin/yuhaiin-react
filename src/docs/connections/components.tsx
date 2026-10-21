import flowStyles from './flow-summary.module.css';
import { MatchTraceTree } from "./match-trace-view";
import { ConnectionActions } from './connection-actions';
import { resourceLink } from './actions';

import { getConnectionMatchTrace, getTotalFlow } from "@/api/connections";
import { DataList, DataListCustomItem, DataListItem } from "@/component/v2/datalist";
import type { Connection, Counter, MatchHistoryEntry, TotalFlow } from "@/contract/connection";
import { clsx } from "clsx";
import { ArrowDown, ArrowUp, Check, ChevronDown, ChevronRight, X } from "lucide-react";
import React, { FC, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

type MetricProps = {
    label: string;
    value: React.ReactNode;
    error?: string;
};

export {formatBytes} from "@/common/format";
import {formatBytes} from "@/common/format";

export function numberValue(value?: string | number): number {
    if (value === undefined || value === null) return 0;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

export const ConnectionBadge: FC<{
    icon: React.ElementType;
    text: React.ReactNode;
    tone?: "info" | "success" | "warning" | "neutral";
}> = ({ icon: Icon, text, tone = "info" }) => (
    <span className={clsx(
        "inline-flex shrink-0 items-center gap-1 rounded-ui-xs border px-2 py-1 text-[11px] font-medium leading-none whitespace-nowrap",
        tone === "info" && "border-ui-info/20 bg-ui-info-soft text-ui-info",
        tone === "success" && "border-ui-success/20 bg-ui-success-soft text-ui-success",
        tone === "warning" && "border-ui-warning/20 bg-ui-warning-soft text-ui-warning",
        tone === "neutral" && "border-ui-border bg-ui-surface-muted text-ui-muted",
    )}>
        <Icon size={12} aria-hidden="true" />
        <span>{text}</span>
    </span>
);

function errorText(error: unknown): string | undefined {
    if (!error) return undefined;
    if (typeof error === "object" && "msg" in error && typeof (error as { msg?: unknown }).msg === "string") {
        return (error as { msg: string }).msg;
    }
    if (error instanceof Error) return error.message;
    return String(error);
}

export class Flow {
    download: number;
    downloadRate: number;
    upload: number;
    uploadRate: number;
    counters: Record<string, Counter>;
    time: Date;

    constructor(download = 0, downloadRate = 0, upload = 0, uploadRate = 0, counters: Record<string, Counter> = {}) {
        this.download = download;
        this.downloadRate = downloadRate;
        this.upload = upload;
        this.uploadRate = uploadRate;
        this.counters = counters;
        this.time = new Date();
    }

    DownloadString() {
        return `${formatBytes(this.downloadRate, 2, " ")}/s`;
    }

    UploadString() {
        return `${formatBytes(this.uploadRate, 2, " ")}/s`;
    }

    DownloadTotalString() {
        return formatBytes(this.download);
    }

    UploadTotalString() {
        return formatBytes(this.upload);
    }
}

type UseFlowOptions = {
    enabled?: boolean;
    refreshInterval?: number;
};

type FlowPollingState = {
    data?: Flow;
    error?: string;
    isLoading: boolean;
    isValidating: boolean;
};

function createFlow(raw: TotalFlow, prev?: Flow) {
    const download = numberValue(raw.download);
    const upload = numberValue(raw.upload);
    const incoming = raw.counters ?? {};
    const counters = Object.fromEntries(Object.entries(incoming).map(([key, counter]) => {
        const previous = prev?.counters[key];
        return [key, previous && numberValue(previous.download) === numberValue(counter.download)
            && numberValue(previous.upload) === numberValue(counter.upload) ? previous : counter];
    }));
    if (!prev) return new Flow(download, 0, upload, 0, counters);

    const duration = Math.max((Date.now() - prev.time.getTime()) / 1000, 1);
    const downloadRate = Math.max(0, (download - prev.download) / duration);
    const uploadRate = Math.max(0, (upload - prev.upload) / duration);
    return new Flow(download, downloadRate, upload, uploadRate, counters);
}

function countersUnchanged(a?: Record<string, Counter>, b?: Record<string, Counter>) {
    if (a === b) return true;
    if (!a || !b) return false;
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    for (const key of aKeys) {
        const prev = a[key];
        const next = b[key];
        if (!next) return false;
        if (numberValue(prev?.download) !== numberValue(next.download)) return false;
        if (numberValue(prev?.upload) !== numberValue(next.upload)) return false;
    }
    return true;
}

function flowUnchanged(prev: Flow | undefined, next: Flow) {
    if (!prev) return false;
    if (prev.download !== next.download || prev.upload !== next.upload) return false;
    if (Math.abs(prev.downloadRate - next.downloadRate) > 0.5) return false;
    if (Math.abs(prev.uploadRate - next.uploadRate) > 0.5) return false;
    return countersUnchanged(prev.counters, next.counters);
}

export function useFlow(options?: UseFlowOptions) {
    const enabled = options?.enabled ?? true;
    const refreshInterval = options?.refreshInterval ?? 2000;
    const lastFlowRef = useRef<Flow | undefined>(undefined);
    const [state, setState] = useState<FlowPollingState>({
        isLoading: enabled,
        isValidating: false,
    });

    useEffect(() => {
        if (!enabled) return;

        let stopped = false;
        let inFlight: AbortController | undefined;
        let timer: ReturnType<typeof window.setTimeout> | undefined;
        let visible = typeof document === "undefined" || document.visibilityState !== "hidden";

        const clearTimer = () => {
            if (timer !== undefined) {
                window.clearTimeout(timer);
                timer = undefined;
            }
        };

        const schedule = () => {
            clearTimer();
            if (stopped || !visible) return;
            timer = window.setTimeout(() => {
                void poll();
            }, refreshInterval);
        };

        const poll = async () => {
            if (stopped || !visible || inFlight) return;
            const controller = new AbortController();
            inFlight = controller;
            const firstLoad = !lastFlowRef.current;
            if (firstLoad) {
                setState(prev => ({ ...prev, isLoading: true, isValidating: true }));
            }
            try {
                const raw = await getTotalFlow(controller.signal);
                if (stopped || !visible || controller.signal.aborted) return;
                const flow = createFlow(raw, lastFlowRef.current);
                if (flowUnchanged(lastFlowRef.current, flow)) {
                    lastFlowRef.current = flow;
                    setState(prev => prev.error || prev.isLoading || prev.isValidating
                        ? { ...prev, error: undefined, isLoading: false, isValidating: false }
                        : prev);
                } else {
                    lastFlowRef.current = flow;
                    setState({ data: flow, isLoading: false, isValidating: false, error: undefined });
                }
            } catch (error) {
                if (stopped || !visible || controller.signal.aborted) return;
                setState(prev => ({
                    ...prev,
                    error: errorText(error) ?? "failed to fetch flow",
                    isLoading: false,
                    isValidating: false,
                }));
            } finally {
                if (inFlight === controller) inFlight = undefined;
                schedule();
            }
        };

        const onVisibility = () => {
            visible = document.visibilityState !== "hidden";
            if (visible) {
                void poll();
                return;
            }
            clearTimer();
            inFlight?.abort();
            inFlight = undefined;
            setState(prev => ({ ...prev, isValidating: false }));
        };

        document.addEventListener("visibilitychange", onVisibility);
        void poll();

        return () => {
            stopped = true;
            inFlight?.abort();
            clearTimer();
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, [enabled, refreshInterval]);

    return {
        ...state,
        isLoading: enabled && state.isLoading,
        isValidating: enabled && state.isValidating,
    };
}

const MetricCard: FC<MetricProps & { accent?: "download" | "upload" | "neutral"; summary?: boolean; emphasized?: boolean; compact?: boolean }> = ({ label, value, error, accent = "neutral", summary = false, emphasized = false, compact = false }) => {
    const display = error || value;
    const prevRef = useRef(display);
    const [pulse, setPulse] = useState(false);

    useEffect(() => {
        if (summary) return;
        if (prevRef.current === display) return;
        prevRef.current = display;
        setPulse(true);
        const timer = window.setTimeout(() => setPulse(false), 280);
        return () => window.clearTimeout(timer);
    }, [display, summary]);

    return (
        <div
            className={clsx(
                "relative flex min-h-[76px] flex-col justify-center overflow-hidden transition-colors",
                compact && flowStyles.metric,
                summary
                    ? "border-ui-border/80 bg-transparent px-4 py-3 first:border-l-0 sm:border-l sm:first:border-l-0"
                    : "rounded-ui-xl border bg-[var(--metric-bg)] p-4 shadow-ui-card border-[var(--metric-border)] hover:border-ui-primary/25",
            )}
        >
            <div className={clsx(
                "mb-1.5 flex items-center gap-1.5 text-xs font-normal leading-normal text-[var(--metric-label)]",
                !summary && "tracking-normal",
                compact && flowStyles.label,
            )}>
                {summary && (
                    <span className={clsx(
                        "inline-flex items-center justify-center",
                        accent === "upload" ? "text-ui-success" : "text-ui-info",
                    )}>
                        {accent === "upload" ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                    </span>
                )}
                <span>{label}</span>
            </div>
            <div className={clsx(
                "truncate font-mono font-medium leading-tight tabular-nums text-[var(--metric-value)]",
                summary && emphasized ? "text-2xl" : "text-xl",
                compact && flowStyles.value,
                pulse && "animate-dataUpdate",
                error && "text-ui-danger"
            )}>
                {display}
            </div>
        </div>
    );
};

export const FlowCard: FC<{
    lastFlow?: Flow;
    flow_error?: string;
    extra_fields?: MetricProps[];
    variant?: "default" | "summary";
    compact?: boolean;
}> = ({ lastFlow, flow_error, extra_fields, variant = "default", compact = false }) => {
    const { t } = useTranslation(["connections", "common"]);
    const loading = t("common:state.loading");
    const hasExtra = Boolean(extra_fields?.length);
    const summary = variant === "summary";

    return (
        <div
            className={clsx(
                "mb-3 w-full",
                summary && compact && flowStyles.compact,
                summary && "grid overflow-hidden rounded-ui-lg border border-ui-border bg-ui-surface shadow-ui-card",
                summary
                    ? hasExtra ? "grid-cols-2 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-2 sm:grid-cols-2 xl:grid-cols-4"
                    : clsx("grid gap-3", hasExtra ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"),
            )}
        >
            <MetricCard compact={summary && compact} summary={summary} emphasized accent="download" label={t("downloadRate")} value={lastFlow ? lastFlow.DownloadString() : loading} error={flow_error} />
            <MetricCard compact={summary && compact} summary={summary} emphasized accent="upload" label={t("uploadRate")} value={lastFlow ? lastFlow.UploadString() : loading} error={flow_error} />
            <MetricCard compact={summary && compact} summary={summary} accent="download" label={t("totalDownload")} value={lastFlow ? lastFlow.DownloadTotalString() : loading} error={flow_error} />
            <MetricCard compact={summary && compact} summary={summary} accent="upload" label={t("totalUpload")} value={lastFlow ? lastFlow.UploadTotalString() : loading} error={flow_error} />
            {extra_fields?.map((field, index) => (
                <MetricCard key={`extra-field-${index}`} compact={summary && compact} summary={summary} label={field.label} value={field.value || loading} error={field.error} />
            ))}
        </div>
    );
};

export const FlowContainer: FC<{
    onUpdate?: (counters: Record<string, Counter>) => void;
    onFlow?: (flow: Flow) => void;
    extra_fields?: MetricProps[];
    enabled?: boolean;
    refreshInterval?: number;
    variant?: "default" | "summary";
    compact?: boolean;
}> = React.memo(({ onUpdate, onFlow, extra_fields, enabled, refreshInterval, variant, compact }) => {
    const { data: lastFlow, error: flow_error } = useFlow({ enabled, refreshInterval });

    useEffect(() => {
        if (onUpdate && lastFlow) onUpdate(lastFlow.counters);
        if (onFlow && lastFlow) onFlow(lastFlow);
    }, [onUpdate, onFlow, lastFlow]);

    return <FlowCard lastFlow={lastFlow} flow_error={lastFlow ? undefined : flow_error} extra_fields={extra_fields} variant={variant} compact={compact} />;
});

export const ConnectionInfo: FC<{
    value: Connection;
    startContent?: React.ReactNode;
    endContent?: React.ReactNode;
    showNodeModal?: (id: string) => void;
}> = ({ value, startContent, endContent, showNodeModal }) => {
    const { t } = useTranslation(["connections", "common"]);
    const pointLabel = value.nodeName || value.nodeId || value.outbound;
    const pointId = value.nodeId;
    const linked = (path: string, key: string, id: string, text: string) => id ? <a className="text-ui-primary underline underline-offset-2" href={resourceLink(path, key, id)}>{text || id}</a> : text;
    const display = (value?: string) => value ? value.split("_").join(" ").toUpperCase() : "";
    const label = (key: string) => t(`detail.${key}`, { defaultValue: key });
    const hasValue = (next: React.ReactNode) => next !== undefined && next !== null && next !== "";
    const renderRows = (rows: { label: string; value?: React.ReactNode | null }[]) => rows
        .filter(row => hasValue(row.value))
        .map(row => <DataListItem key={row.label} label={label(row.label)} value={row.value} />);

    const basicRows = renderRows([
        { label: "Id", value: value.id },
        { label: "Addr", value: value.addr },
        { label: "Geo", value: value.geo },
        { label: "Mode", value: display(value.mode) },
        { label: "Type", value: display(value.network?.connType) },
        { label: "UnderlyingType", value: display(value.network?.underlyingType) },
        { label: "Protocol", value: value.protocol },
        { label: "Component", value: value.component },
    ]);
    const pathRows = renderRows([
        { label: "Inbound", value: linked("/docs/inbound", "inbound", value.inboundId, value.inboundName || value.inbound) },
        { label: "InboundAddr", value: value.inbound },
        { label: "Source", value: value.source },
        { label: "Interface", value: value.interface },
        { label: "LocalAddr", value: value.localAddr },
        { label: "RemoteAddr", value: value.outbound },
        { label: "RemoteGeo", value: value.outboundGeo },
        { label: "Destination", value: value.destination },
        {
            label: "Point",
            value: showNodeModal && pointId
                ? <a href="#" onClick={(event) => { event.preventDefault(); showNodeModal(pointId); }}>{pointLabel}</a>
                : linked("/docs/group", "node", pointId, pointLabel),
        },
    ]);
    const routeRows = renderRows([
        { label: "FakeIP", value: value.fakeIp },
        { label: "Hosts", value: value.hosts },
        { label: "Domain", value: value.domain },
        { label: "IP", value: value.ip },
        { label: "Selector", value: linked("/docs/group/selectors", "selector", value.selectorId, value.selectorName) },
        { label: "Rule", value: linked("/docs/bypass", "rule", value.ruleId, value.ruleName) },
        { label: "Lists", value: value.lists?.map(id => value.listNames?.[id] || id).join(", ") },
        { label: "Resolver", value: value.resolver },
    ]);
    const processRows = renderRows([
        { label: "Process", value: value.process },
        { label: "Pid", value: value.pid },
        { label: "Uid", value: value.uid },
        { label: "UdpMigrateId", value: value.udpMigrateId },
    ]);
    const tlsRows = renderRows([
        { label: "TlsServerName", value: value.tlsServerName },
        { label: "HttpHost", value: value.httpHost },
    ]);

    return (
        <div className="space-y-4">
            <ConnectionActions connection={value} />
            <ConnectionSection title={label("Basic")}>
                {startContent}
                {basicRows}
                {endContent}
            </ConnectionSection>
            {pathRows.length > 0 && <ConnectionSection title={label("Path")}>{pathRows}</ConnectionSection>}
            {(routeRows.length > 0 || (value.matchHistory?.length ?? 0) > 0) && (
                <ConnectionSection title={label("Route")}>
                    {routeRows}
                    <MatchHistoryItem key={value.id} connectionId={value.id} matchedRuleId={value.ruleId} value={value.matchHistory ?? []} />
                </ConnectionSection>
            )}
            {processRows.length > 0 && <ConnectionSection title={label("Process")}>{processRows}</ConnectionSection>}
            {tlsRows.length > 0 && (
                <ConnectionSection title={label("TlsHttp")}>{tlsRows}</ConnectionSection>
            )}
        </div>
    );
};

const ConnectionSection: FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section className="rounded-ui-lg border border-sidebar-border bg-sidebar-bg/60">
        <div className="border-b border-sidebar-border px-4 py-2 text-xs font-bold uppercase tracking-wider text-sidebar-header">
            {title}
        </div>
        <DataList className="px-4">{children}</DataList>
    </section>
);

const MatchHistoryItem: FC<{ value: MatchHistoryEntry[]; connectionId: string; matchedRuleId?: string }> = ({ value, connectionId, matchedRuleId }) => {
    const { t } = useTranslation(["connections", "common"]);
    const winningIndex = matchedRuleId
        ? value.map(entry => entry.ruleId).lastIndexOf(matchedRuleId)
        : -1;
    const [opened, setOpened] = useState<Set<number>>(() => new Set(winningIndex >= 0 ? [winningIndex] : []));
    const [loaded, setLoaded] = useState<Record<number, MatchHistoryEntry>>({});
    const [loading, setLoading] = useState<Set<number>>(() => new Set(winningIndex >= 0 ? [winningIndex] : []));
    const attempted = useRef<Set<number>>(new Set());
    const requestVersion = useRef<Map<number, number>>(new Map());
    const controllers = useRef<Map<number, AbortController>>(new Map());
    // Auto-load only the winning rule on the first detail view. All other
    // rules are fetched on click; no synchronous state updates in this effect.
    useEffect(() => {
        if (winningIndex < 0 || !connectionId) return;
        const controller = new AbortController();
        const version = (requestVersion.current.get(winningIndex) ?? 0) + 1;
        requestVersion.current.set(winningIndex, version);
        attempted.current.add(winningIndex);
        controllers.current.set(winningIndex, controller);
        void getConnectionMatchTrace(connectionId, winningIndex, controller.signal)
            .then(response => {
                if (requestVersion.current.get(winningIndex) === version)
                    setLoaded(current => ({ ...current, [winningIndex]: response.entry }));
            })
            .catch(() => {
                // Older backend or connection closed. Fall back to flat history.
            })
            .finally(() => {
                if (requestVersion.current.get(winningIndex) !== version) return;
                controllers.current.delete(winningIndex);
                setLoading(current => {
                    const next = new Set(current);
                    next.delete(winningIndex);
                    return next;
                });
            });
        return () => {
            controller.abort();
            if (controllers.current.get(winningIndex) === controller)
                controllers.current.delete(winningIndex);
            if (requestVersion.current.get(winningIndex) === version)
                requestVersion.current.set(winningIndex, version + 1);
            attempted.current.delete(winningIndex);
        };
    }, [connectionId, winningIndex]);

    useEffect(() => () => {
        for (const controller of controllers.current.values()) controller.abort();
        controllers.current.clear();
    }, []);
    const invalidate = (index: number) => {
        controllers.current.get(index)?.abort();
        controllers.current.delete(index);
        requestVersion.current.set(index, (requestVersion.current.get(index) ?? 0) + 1);
        attempted.current.delete(index);
    };
    const fetchWhenNeeded = (index: number) => {
        if (attempted.current.has(index) || !connectionId) return;
        attempted.current.add(index);
        const version = (requestVersion.current.get(index) ?? 0) + 1;
        requestVersion.current.set(index, version);
        setLoading(current => new Set(current).add(index));
        const controller = new AbortController();
        controllers.current.set(index, controller);
        void getConnectionMatchTrace(connectionId, index, controller.signal)
            .then(response => {
                if (requestVersion.current.get(index) !== version) return;
                setLoaded(current => ({ ...current, [index]: response.entry }));
            })
            .catch(() => {
                // The live trace is optional. Old/closed connections retain flat history.
            })
            .finally(() => {
                if (controllers.current.get(index) === controller) controllers.current.delete(index);
                if (requestVersion.current.get(index) !== version) return;
                setLoading(current => {
                    const next = new Set(current);
                    next.delete(index);
                    return next;
                });
            });
    };
    const release = (index: number) => {
        invalidate(index);
        setLoaded(current => {
            if (!(index in current)) return current;
            const next = { ...current };
            delete next[index];
            return next;
        });
        setLoading(current => {
            const next = new Set(current);
            next.delete(index);
            return next;
        });
    };
    const collapseAll = () => {
        for (const index of attempted.current) invalidate(index);
        setLoaded({});
        setLoading(new Set());
        setOpened(new Set());
    };
    const label = (key: string) => t(`detail.${key}`, { defaultValue: key });
    const toggle = (index: number) => {
        if (opened.has(index)) release(index);
        else fetchWhenNeeded(index);
        setOpened(current => {
            const next = new Set(current);
            if (next.has(index)) next.delete(index);
            else next.add(index);
            return next;
        });
    };
    const stateLabel = (state: string) => {
        if (state === "hit") return t("detail.Hit");
        if (state === "miss") return t("detail.Miss");
        if (state === "skipped") return t("circuit.skipped", { defaultValue: "Not evaluated" });
        return t("circuit.unknown", { defaultValue: "Unknown" });
    };

    if (!value || value.length === 0) return null;

    return (
        <DataListCustomItem>
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start">
                <div className="notranslate shrink-0 text-sm font-semibold capitalize text-sidebar-header sm:min-w-[120px]">
                    {label("MatchHistory")}
                </div>
                <div className="min-w-0 w-full grow overflow-hidden rounded-ui-lg border border-sidebar-border">
                    <div className="flex items-center justify-between gap-2 border-b border-sidebar-border bg-ui-surface-muted/50 px-3 py-2 text-[11px] text-ui-muted">
                        <span>{value.length} {t("circuit.rules", { defaultValue: "rules checked" })}</span>
                        <div className="flex gap-2">
                            <button type="button" className="hover:text-ui-heading" onClick={collapseAll}>
                                {t("circuit.collapseAll", { defaultValue: "Collapse all" })}
                            </button>
                        </div>
                    </div>
                    {value.map((entry, index) => {
                        const expanded = opened.has(index);
                        const trace = loaded[index]?.trace ?? entry.trace;
                        // The connection already records the winning rule ID.
                        // No detailed trace request is needed for this summary.
                        const state = trace?.state ?? (matchedRuleId && entry.ruleId
                            ? index === winningIndex ? "hit" : "miss"
                            : undefined);
                        const positive = state === "hit";
                        return (
                            <div key={`${entry.ruleId || entry.ruleName}-${index}`} className="min-w-0 border-b border-sidebar-border/60 last:border-0">
                                <div className={clsx(
                                    "flex min-w-0 items-center gap-2 px-2 py-1.5",
                                    expanded && "bg-ui-surface-muted/50",
                                )}>
                                    {/* This row is the rule's single visible root node.
                                        AND/OR/NOT descendants start directly below it. */}
                                    <button type="button"
                                        className="flex min-w-0 flex-1 items-center gap-2 rounded-ui-sm px-1 py-1.5 text-left hover:bg-ui-surface-muted"
                                        onClick={() => toggle(index)}
                                        aria-expanded={expanded}
                                        aria-label={entry.ruleName || label("Rule")}>
                                        {expanded ? <ChevronDown size={15} className="shrink-0 text-ui-muted"/> : <ChevronRight size={15} className="shrink-0 text-ui-muted"/>}
                                        <span className="notranslate min-w-0 break-words text-xs font-semibold text-sidebar-header [overflow-wrap:anywhere]">{entry.ruleName || label("Rule")}</span>
                                        {trace && <span className="shrink-0 rounded-ui-xs border border-ui-border bg-ui-surface px-1.5 py-0.5 text-[10px] font-semibold text-ui-muted">{trace.type.toUpperCase()}</span>}
                                    </button>
                                    <span className={clsx("shrink-0 text-[11px] font-medium", positive ? "text-ui-success" : "text-ui-muted")}>
                                        {state ? stateLabel(state) : `${entry.history?.length ?? 0} ${t("circuit.checks", { defaultValue: "checks" })}`}
                                    </span>
                                    {entry.ruleId && <a href={resourceLink("/docs/bypass", "rule", entry.ruleId)}
                                        className="shrink-0 text-[11px] text-ui-primary underline underline-offset-2">{label("Rule")}</a>}
                                </div>
                                {expanded && (trace
                                    ? <MatchTraceTree key={`${entry.ruleId || index}-tree`} trace={trace}/>
                                    : <div className="min-w-0 border-t border-sidebar-border/50 bg-ui-surface px-2 py-2">
                                        {loading.has(index) ? <p className="text-xs text-ui-muted">{t("common:state.loading")}</p> :
                                            <div className="space-y-1" aria-label={t("circuit.legacy", { defaultValue: "Flat history (no logical structure available)" })}>
                                                <p className="pb-1 text-[11px] text-ui-muted">
                                                    {t("circuit.legacy", { defaultValue: "Flat history (no logical structure available)" })}
                                                </p>
                                                {(entry.history ?? []).map((item, itemIndex) => (
                                                    <div key={`${item.id || item.listName}-${itemIndex}`} className="flex min-w-0 items-center justify-between gap-3 rounded-ui-sm px-2 py-1">
                                                        <span className="notranslate min-w-0 break-words text-xs text-sidebar-color [overflow-wrap:anywhere]">{item.listName || "-"}</span>
                                                        <span className={clsx("inline-flex shrink-0 items-center gap-1.5 text-[11px]", item.matched ? "text-ui-success" : "text-ui-muted")}>
                                                            {item.matched ? <Check size={13}/> : <X size={13}/>}
                                                            {item.matched ? label("Hit") : label("Miss")}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>}
                                    </div>)}
                            </div>
                        );
                    })}
                </div>
            </div>
        </DataListCustomItem>
    );
};
