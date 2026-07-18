"use client";

import { getTotalFlow } from "@/api/connections";
import { DataList, DataListCustomItem, DataListItem } from "@/component/v2/datalist";
import type { Connection, Counter, MatchHistoryEntry, TotalFlow } from "@/contract/connection";
import { clsx } from "clsx";
import { Check, X } from "lucide-react";
import React, { FC, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

type MetricProps = {
    label: string;
    value: React.ReactNode;
    error?: string;
};

const units = ["B", "KB", "MB", "GB", "TB", "PB"];

export function formatBytes(value = 0, digits = 2, space = "") {
    let unit = 0;
    while (value >= 1024 && unit < units.length - 1) {
        value /= 1024;
        unit++;
    }
    return `${value.toFixed(digits)}${space}${units[unit]}`;
}

export function numberValue(value?: string | number): number {
    if (value === undefined || value === null) return 0;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

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
        return `${formatBytes(this.downloadRate, 2, " ")}/S`;
    }

    UploadString() {
        return `${formatBytes(this.uploadRate, 2, " ")}/S`;
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
    if (!prev) return new Flow(download, 0, upload, 0, raw.counters ?? {});

    const duration = Math.max((Date.now() - prev.time.getTime()) / 1000, 1);
    const downloadRate = Math.max(0, (download - prev.download) / duration);
    const uploadRate = Math.max(0, (upload - prev.upload) / duration);
    return new Flow(download, downloadRate, upload, uploadRate, raw.counters ?? {});
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
        if (!enabled) {
            setState(prev => ({ ...prev, isLoading: false, isValidating: false }));
            return;
        }

        let stopped = false;
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
            if (stopped || !visible) return;
            const firstLoad = !lastFlowRef.current;
            if (firstLoad) {
                setState(prev => ({ ...prev, isLoading: true, isValidating: true }));
            }
            try {
                const raw = await getTotalFlow();
                if (stopped || !visible) return;
                const flow = createFlow(raw, lastFlowRef.current);
                if (flowUnchanged(lastFlowRef.current, flow)) {
                    lastFlowRef.current = flow;
                } else {
                    lastFlowRef.current = flow;
                    setState({ data: flow, isLoading: false, isValidating: false, error: undefined });
                }
            } catch (error) {
                if (stopped || !visible) return;
                setState(prev => ({
                    ...prev,
                    error: errorText(error) ?? "failed to fetch flow",
                    isLoading: false,
                    isValidating: false,
                }));
            }
            schedule();
        };

        const onVisibility = () => {
            visible = document.visibilityState !== "hidden";
            if (visible) {
                void poll();
                return;
            }
            clearTimer();
            setState(prev => ({ ...prev, isValidating: false }));
        };

        document.addEventListener("visibilitychange", onVisibility);
        void poll();

        return () => {
            stopped = true;
            clearTimer();
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, [enabled, refreshInterval]);

    return {
        ...state,
        data: state.data ?? lastFlowRef.current,
    };
}

const MetricCard: FC<MetricProps & { accent?: "download" | "upload" | "neutral" }> = ({ label, value, error, accent = "neutral" }) => {
    const display = error || value;
    const prevRef = useRef(display);
    const [pulse, setPulse] = useState(false);

    useEffect(() => {
        if (prevRef.current === display) return;
        prevRef.current = display;
        setPulse(true);
        const timer = window.setTimeout(() => setPulse(false), 280);
        return () => window.clearTimeout(timer);
    }, [display]);

    return (
        <div
            className={clsx(
                "relative flex min-h-[92px] flex-col justify-center overflow-hidden rounded-ui-xl border bg-[var(--metric-bg)] p-4 shadow-ui-card transition-colors",
                "border-[var(--metric-border)] hover:border-ui-primary/25",
                accent === "download" && "before:absolute before:inset-y-3 before:left-0 before:w-0.5 before:rounded-full before:bg-ui-info",
                accent === "upload" && "before:absolute before:inset-y-3 before:left-0 before:w-0.5 before:rounded-full before:bg-ui-success",
            )}
        >
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--metric-label,#64748b)]">
                {label}
            </div>
            <div className={clsx(
                "truncate font-mono text-[1.35rem] font-bold leading-tight text-[var(--metric-value,#0f172a)]",
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
}> = ({ lastFlow, flow_error, extra_fields }) => {
    const { t } = useTranslation(["connections", "common"]);
    const loading = t("common:state.loading");
    const hasExtra = Boolean(extra_fields?.length);

    return (
        <div
            className={clsx(
                "mb-3 grid w-full gap-3",
                hasExtra
                    ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
            )}
        >
            <MetricCard accent="download" label={t("totalDownload")} value={lastFlow ? lastFlow.DownloadTotalString() : loading} error={flow_error} />
            <MetricCard accent="download" label={t("downloadRate")} value={lastFlow ? lastFlow.DownloadString() : loading} error={flow_error} />
            <MetricCard accent="upload" label={t("totalUpload")} value={lastFlow ? lastFlow.UploadTotalString() : loading} error={flow_error} />
            <MetricCard accent="upload" label={t("uploadRate")} value={lastFlow ? lastFlow.UploadString() : loading} error={flow_error} />
            {extra_fields?.map((field, index) => (
                <MetricCard key={`extra-field-${index}`} label={field.label} value={field.value || loading} error={field.error} />
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
}> = React.memo(({ onUpdate, onFlow, extra_fields, enabled, refreshInterval }) => {
    const { data: lastFlow, error: flow_error } = useFlow({ enabled, refreshInterval });

    useEffect(() => {
        if (onUpdate && lastFlow) onUpdate(lastFlow.counters);
        if (onFlow && lastFlow) onFlow(lastFlow);
    }, [onUpdate, onFlow, lastFlow]);

    return <FlowCard lastFlow={lastFlow} flow_error={lastFlow ? undefined : flow_error} extra_fields={extra_fields} />;
});

export const ConnectionInfo: FC<{
    value: Connection;
    startContent?: React.ReactNode;
    endContent?: React.ReactNode;
    showNodeModal?: (id: string) => void;
}> = ({ value, startContent, endContent, showNodeModal }) => {
    const { t } = useTranslation(["connections", "common"]);
    const pointLabel = value.nodeName || value.nodeId || value.outbound;
    const pointId = value.nodeId || value.outbound;
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
        { label: "Inbound", value: value.inboundName || value.inbound },
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
                : pointLabel,
        },
    ]);
    const routeRows = renderRows([
        { label: "FakeIP", value: value.fakeIp },
        { label: "Hosts", value: value.hosts },
        { label: "Domain", value: value.domain },
        { label: "IP", value: value.ip },
        { label: "Tag", value: value.tag },
        { label: "Lists", value: value.lists?.join(", ") },
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
            <ConnectionSection title={label("Basic")}>
                {startContent}
                {basicRows}
                {endContent}
            </ConnectionSection>
            {pathRows.length > 0 && <ConnectionSection title={label("Path")}>{pathRows}</ConnectionSection>}
            {(routeRows.length > 0 || (value.matchHistory?.length ?? 0) > 0) && (
                <ConnectionSection title={label("Route")}>
                    {routeRows}
                    <MatchHistoryItem value={value.matchHistory ?? []} />
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

const MatchHistoryItem: FC<{ value: MatchHistoryEntry[] }> = ({ value }) => {
    const { t } = useTranslation(["connections", "common"]);
    if (!value || value.length === 0) return null;
    const label = (key: string) => t(`detail.${key}`, { defaultValue: key });

    return (
        <DataListCustomItem>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="notranslate shrink-0 text-sm font-semibold capitalize text-sidebar-header sm:min-w-[120px]">
                    {label("MatchHistory")}
                </div>
                <div className="flex w-full grow flex-col gap-3">
                    {value.map((entry, index) => (
                        <div key={`${entry.ruleName}-${index}`} className="rounded-xl border border-sidebar-border bg-sidebar-hover p-3">
                            <div className="mb-2 border-b border-sidebar-border pb-2 text-xs font-bold uppercase tracking-wider text-sidebar-header">
                                {entry.ruleName || label("Rule")}
                            </div>
                            <div className="flex flex-col gap-2">
                                {(entry.history ?? []).map((item, itemIndex) => (
                                    <div key={`${item.listName}-${itemIndex}`} className="flex items-center justify-between gap-3">
                                        <span className="notranslate break-all text-sm text-sidebar-color">{item.listName || "-"}</span>
                                        <div className="flex shrink-0 items-center gap-2">
                                            <span className={clsx("text-xs font-medium", item.matched ? "text-ui-success" : "text-sidebar-color opacity-70")}>
                                                {item.matched ? label("Hit") : label("Miss")}
                                            </span>
                                            <div className={clsx("flex h-6 w-6 items-center justify-center rounded-full", item.matched ? "bg-ui-success-soft text-ui-success" : "bg-ui-surface-muted text-ui-danger")}>
                                                {item.matched ? <Check size={14} /> : <X size={14} />}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DataListCustomItem>
    );
};
