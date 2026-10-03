

import { useTranslation } from 'react-i18next';
import { InboundRuntimeEvent, InboundRuntimeState, InboundRuntimeStatus } from "@/api/inbounds";

import { Badge } from "@/component/v2/badge";
import { Button } from "@/component/v2/button";

import { Spinner } from "@/component/v2/spinner";

import { Activity, ArrowDown, ArrowUp, CircleAlert, CircleCheck, RefreshCw } from "lucide-react";
import { FC } from "react";

function runtimeLabel(state: InboundRuntimeState): string {
    switch (state) {
        case "disabled": return "Disabled";
        case "starting": return "Starting";
        case "running": return "Running";
        case "degraded": return "Degraded";
        case "failed": return "Failed";
        case "stopping": return "Stopping";
    }
}

function runtimeVariant(state: InboundRuntimeState): "success" | "danger" | "warning" | "info" | "muted" | "secondary" {
    switch (state) {
        case "running": return "success";
        case "failed": return "danger";
        case "degraded": return "warning";
        case "starting": return "info";
        case "stopping": return "secondary";
        case "disabled": return "muted";
    }
}

function formatBytes(value: string): string {
    const bytes = Number(value);
    if (!Number.isFinite(bytes) || bytes < 0) return "0 B";
    if (bytes < 1024) return `${Math.round(bytes)} B`;
    const units = ["KiB", "MiB", "GiB", "TiB"];
    let amount = bytes;
    let unit = "B";
    for (const nextUnit of units) {
        amount /= 1024;
        unit = nextUnit;
        if (amount < 1024 || nextUnit === units[units.length - 1]) break;
    }
    return `${amount.toFixed(amount >= 10 ? 0 : 1)} ${unit}`;
}

function eventLabel(event: InboundRuntimeEvent): string {
    switch (event.type) {
        case "ready": return "Listener ready";
        case "fail": return "Listener failed";
        case "retry": return "Manual retry";
        case "start": return "Start requested";
        case "stop": return "Stop requested";
        case "reload": return "Configuration reloaded";
        default: return event.type;
    }
}

const InboundRuntimePanel: FC<{
    status?: InboundRuntimeStatus;
    events: InboundRuntimeEvent[];
    eventsLoading: boolean;
    onRetry?: () => void;
    retrying?: boolean;
}> = ({ status, events, eventsLoading, onRetry, retrying }) => {
    const { t: uiT } = useTranslation('ui');

    if (!status) {
        return (
            <div className="rounded-ui-lg border border-ui-border bg-ui-surface-muted p-4 text-sm text-ui-muted">
                {uiT("runtimeStatusIsNotAvailableYet")}</div>
        );
    }

    const statistics = status.statistics;
    const canRetry = status.status === "failed" || status.status === "degraded";

    return (
        <div className="mb-4 space-y-4 rounded-ui-lg border border-ui-border bg-ui-surface-muted p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Activity size={17} className="text-ui-primary" />
                    <span className="font-semibold">{uiT("runtimeStatus")}</span>
                    <Badge variant={runtimeVariant(status.status)}>{runtimeLabel(status.status)}</Badge>
                </div>
                {canRetry && onRetry && (
                    <Button size="sm" variant="outline-primary" disabled={retrying} onClick={onRetry}>
                        {retrying ? <Spinner size="sm" /> : <RefreshCw className="mr-1" size={15} />}
                        {uiT("retry")}</Button>
                )}
            </div>

            {status.lastError && (
                <div className="flex items-start gap-2 rounded-ui-md border border-ui-danger/30 bg-ui-danger-soft p-3 text-sm text-ui-danger">
                    <CircleAlert className="mt-0.5 shrink-0" size={16} />
                    <span className="break-words">{status.lastError}</span>
                </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div><div className="text-xs text-ui-muted">{uiT("activeTcp")}</div><div className="font-semibold">{statistics.activeTcp}</div></div>
                <div><div className="text-xs text-ui-muted">{uiT("activeUdp")}</div><div className="font-semibold">{statistics.activeUdp}</div></div>
                <div><div className="text-xs text-ui-muted">{uiT("tcpFlows")}</div><div className="font-semibold">{statistics.totalTcpFlows}</div></div>
                <div><div className="text-xs text-ui-muted">{uiT("udpFlows")}</div><div className="font-semibold">{statistics.totalUdpFlows}</div></div>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-ui-muted">
                <span><ArrowUp className="mr-1 inline text-ui-primary" size={14} />{formatBytes(statistics.uploadBytes)} {uiT("uploaded")}</span>
                <span><ArrowDown className="mr-1 inline text-ui-primary" size={14} />{formatBytes(statistics.downloadBytes)} {uiT("downloaded")}</span>
            </div>

            {status.listeners.length > 0 && (
                <div>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ui-muted">{uiT("listeners")}</div>
                    <div className="space-y-1 text-sm">
                        {status.listeners.map((listener) => (
                            <div className="flex flex-wrap items-center justify-between gap-2" key={`${listener.kind}-${listener.listen ?? ""}`}>
                                <span className="font-medium">{listener.kind}{listener.listen ? ` · ${listener.listen}` : ""}</span>
                                <Badge variant={runtimeVariant(listener.state)}>{runtimeLabel(listener.state)}</Badge>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ui-muted">
                    <CircleCheck size={14} /> {uiT("recentEvents")}</div>
                {eventsLoading ? <div className="text-sm text-ui-muted">{uiT("loadingEvents")}</div> : events.length === 0 ? (
                    <div className="text-sm text-ui-muted">{uiT("noLifecycleEventsRecorded")}</div>
                ) : (
                    <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                        {events.map((event) => (
                            <div className="rounded-ui-md border border-ui-border bg-ui-surface px-3 py-2 text-sm" key={event.id}>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="font-medium">{eventLabel(event)}</span>
                                    <span className="text-xs text-ui-muted">{new Date(event.createdAt * 1000).toLocaleString()}</span>
                                </div>
                                <div className="mt-1 flex flex-wrap gap-2 text-xs text-ui-muted">
                                    <Badge variant={runtimeVariant(event.state)}>{runtimeLabel(event.state)}</Badge>
                                    {event.error && <span className="break-words text-ui-danger">{event.error}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export { InboundRuntimePanel };

export { runtimeVariant, runtimeLabel, formatBytes };
