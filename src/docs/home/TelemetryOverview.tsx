import { createContext, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Check, Copy } from "lucide-react";
import type { TelemetryGroup, TelemetrySummary } from "@/contract/connection";
import { useClipboard } from "@/component/v2/clipboard";
import { formatBytes } from "./format";

type TelemetryItem = TelemetryGroup["items"][number];

const titleKeys: Record<TelemetryGroup["dimension"], string> = {
    protocol: "telemetryProtocol",
    inbound: "telemetryInbound",
    source: "telemetrySource",
    addr: "telemetryAddress",
    outbound: "telemetryOutbound",
    process: "telemetryProcess",
    rule: "telemetryRule",
    selector: "telemetrySelector",
    destination: "telemetryDestination",
};

const addressDimensions = new Set<TelemetryGroup["dimension"]>(["source", "addr", "destination"]);

const COLLAPSED_ROWS = 5;

const CopyContext = createContext<{ copy: (key: string, value: string) => void; copiedKey?: string }>({ copy: () => undefined });

function numberValue(value: string): number {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

function total(item: TelemetryItem): number {
    return numberValue(item.download) + numberValue(item.upload);
}

const bytes = (value: number) => formatBytes(value, 1, " ");

/** Split "host:port" or "[v6]:port"; a bare IPv6 address is left whole. */
function splitPort(value: string): [string, string | undefined] {
    const match = /^(\[[^\]]+\]|[^:]+):(\d+)$/.exec(value);
    return match ? [match[1], match[2]] : [value, undefined];
}

const ItemLabel = ({ value, mono }: { value: string; mono: boolean }) => {
    const [host, port] = splitPort(value);
    return (
        <div className={`flex min-w-0 items-baseline text-sm text-ui-heading ${mono || port ? "font-mono text-[13px]" : ""}`} title={value}>
            <span className="min-w-0 truncate">{host}</span>
            {port && <span className="shrink-0 text-ui-muted">:{port}</span>}
        </div>
    );
};

const TrafficStats = ({ item }: { item: TelemetryItem }) => {
    const { t: uiT } = useTranslation('ui');
    const failures = numberValue(item.failures);

    return (
        <div className="flex shrink-0 items-center gap-3 text-xs tabular-nums text-ui-muted">
            <span className="w-[4.75rem] text-right">↓ {bytes(numberValue(item.download))}</span>
            <span className="w-[4.75rem] text-right">↑ {bytes(numberValue(item.upload))}</span>
            <span className="flex w-12 items-center justify-end gap-1 font-medium text-ui-danger" title={failures > 0 ? `${failures} ${uiT("failedLabel")}` : undefined}>
                {failures > 0 && <><AlertTriangle size={12} aria-hidden />{failures}</>}
            </span>
        </div>
    );
};

const PanelHeader = ({ title, items }: { title: string; items: TelemetryItem[] }) => (
    <div className="flex items-baseline justify-between gap-3 px-3.5 pb-1.5 pt-3">
        <h3 className="text-[13px] font-medium text-ui-muted">{title}</h3>
        {items.length > 0 && <span className="text-xs tabular-nums text-ui-muted">{bytes(items.reduce((sum, item) => sum + total(item), 0))}</span>}
    </div>
);

const DimensionPanel = ({ group }: { group: TelemetryGroup }) => {
    const { t: uiT } = useTranslation('ui');
    const { copy, copiedKey } = useContext(CopyContext);
    const [expanded, setExpanded] = useState(false);
    const max = Math.max(1, ...group.items.map(total));
    const items = expanded ? group.items : group.items.slice(0, COLLAPSED_ROWS);
    const hidden = group.items.length - COLLAPSED_ROWS;

    return (
        <section className="mb-3 break-inside-avoid rounded-ui-lg bg-ui-surface-muted/60 pb-1.5">
            <PanelHeader title={uiT(titleKeys[group.dimension])} items={group.items} />
            {group.items.length === 0 ? (
                <div className="px-3.5 py-3 text-sm text-ui-muted">{uiT("noRecordsInThisRange")}</div>
            ) : (
                <div className="space-y-px px-1.5">
                    {items.map(item => {
                        const key = `${group.dimension}\u0000${item.value}`;
                        const copied = copiedKey === key;
                        return (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() => copy(key, item.value)}
                                title={copied ? uiT("telemetryCopied") : uiT("telemetryCopy")}
                                className="group relative flex w-full min-w-0 flex-wrap items-center gap-x-3 gap-y-1 overflow-hidden rounded-ui-sm px-2 py-2 text-left hover:bg-ui-hover focus-visible:outline-2 focus-visible:outline-ui-focus"
                            >
                                <div className="absolute inset-y-0 left-0 rounded-ui-sm bg-ui-primary-soft" style={{ width: `${total(item) / max * 100}%` }} aria-hidden />
                                <div className="relative flex min-w-32 flex-1 items-center gap-1.5">
                                    <div className="min-w-0"><ItemLabel value={item.value} mono={addressDimensions.has(group.dimension)} /></div>
                                    {copied
                                        ? <Check size={13} className="shrink-0 text-ui-success" aria-label={uiT("telemetryCopied")} />
                                        : <Copy size={13} className="shrink-0 text-ui-muted opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden />}
                                </div>
                                <div className="relative ml-auto"><TrafficStats item={item} /></div>
                            </button>
                        );
                    })}
                    {hidden > 0 && (
                        <button type="button" onClick={() => setExpanded(value => !value)} className="w-full rounded-ui-sm px-2 py-1.5 text-left text-xs text-ui-muted hover:bg-ui-hover hover:text-ui-heading">
                            {expanded ? uiT("showLess") : uiT("showMoreCount", { count: hidden })}
                        </button>
                    )}
                </div>
            )}
        </section>
    );
};

const protocolTones = ["bg-ui-primary", "bg-ui-info", "bg-ui-warning", "bg-ui-success"];

const ProtocolSummary = ({ group }: { group: TelemetryGroup }) => {
    const { t: uiT } = useTranslation('ui');
    const sum = group.items.reduce((value, item) => value + total(item), 0);

    return (
        <section className="rounded-ui-lg bg-ui-surface-muted/60 pb-3">
            <PanelHeader title={uiT(titleKeys.protocol)} items={group.items} />
            {group.items.length === 0 ? (
                <div className="px-3.5 py-1 text-sm text-ui-muted">{uiT("noRecordsInThisRange")}</div>
            ) : (
                <div className="space-y-3 px-3.5 pt-1.5">
                    <div className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-ui-border/60">
                        {group.items.map((item, index) => (
                            <div key={item.value} className={protocolTones[index % protocolTones.length]} style={{ width: `${sum > 0 ? total(item) / sum * 100 : 0}%` }} />
                        ))}
                    </div>
                    <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                        {group.items.map((item, index) => (
                            <div key={item.value} className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                                <span className={`size-2 shrink-0 rounded-full ${protocolTones[index % protocolTones.length]}`} aria-hidden />
                                <span className="text-sm font-medium text-ui-heading">{item.value.toUpperCase()}</span>
                                <span className="text-xs tabular-nums text-ui-muted">{sum > 0 ? Math.round(total(item) / sum * 100) : 0}%</span>
                                <div className="ml-auto"><TrafficStats item={item} /></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
};

const TelemetryOverview = ({ data, error }: { data?: TelemetrySummary; error?: string }) => {
    const { t: uiT } = useTranslation('ui');
    const { copy, copied, manualCopyModal } = useClipboard({ usePromptAsFallback: true, timeout: 1500 });
    const [lastCopied, setLastCopied] = useState<string>();

    if (error) return <div className="flex min-h-32 items-center justify-center px-4 py-6 text-center text-sm text-ui-danger">{error}</div>;
    if (!data) return <div className="flex min-h-32 items-center justify-center px-4 py-6 text-center text-sm text-ui-muted">{uiT("loadingTrafficBreakdown")}</div>;

    if (data.groups.length === 0) return <div className="flex min-h-32 items-center justify-center px-4 py-6 text-center text-sm text-ui-muted">{uiT("noTrafficRecordedInThisRange")}</div>;

    const protocol = data.groups.find(group => group.dimension === "protocol");
    const dimensions = data.groups.filter(group => group.dimension !== "protocol");

    const copyValue = (key: string, value: string) => {
        setLastCopied(key);
        void copy(value);
    };

    return (
        <CopyContext.Provider value={{ copy: copyValue, copiedKey: copied ? lastCopied : undefined }}>
            <div className="space-y-3">
                {protocol && <ProtocolSummary group={protocol} />}
                {/* Columns follow the card's width, not the viewport, so labels keep room beside the fixed-width stats. */}
                <div className="@container">
                    <div className="gap-3 @3xl:columns-2 @7xl:columns-3">
                        {dimensions.map(group => <DimensionPanel key={group.dimension} group={group} />)}
                    </div>
                </div>
            </div>
            {manualCopyModal}
        </CopyContext.Provider>
    );
};

export default TelemetryOverview;
