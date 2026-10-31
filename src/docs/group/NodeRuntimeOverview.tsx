import { useTranslation } from "react-i18next";
import { Badge } from "@/component/v2/badge";
import type { OutboundRuntimeStatus, OutboundState } from "@/api/node-observability";

export function outboundStateVariant(state: OutboundState): "success" | "danger" | "secondary" | "warning" {
    switch (state) {
        case "healthy": return "success";
        case "degraded": return "warning";
        case "disabled": return "secondary";
        default: return "secondary";
    }
}

const nativeStates = ['unknown', 'idle', 'connecting', 'configured', 'connected', 'reconnecting', 'closed', 'disconnected', 'failed', 'authentication_failed', 'control_unavailable'] as const;

function nativeStateKey(state: string): string {
    return (nativeStates as readonly string[]).includes(state) ? state : 'unknown';
}

export function formatNodeBytes(raw: string): string {
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) return raw;
    if (value < 1024) return `${Math.round(value)} B`;
    const units = ["KiB", "MiB", "GiB", "TiB", "PiB"];
    const size = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length);
    return `${(value / 1024 ** size).toFixed(1)} ${units[size - 1]}`;
}

function dateTime(epoch?: number): string {
    return epoch ? new Date(epoch * 1000).toLocaleString() : "—";
}

export function NodeRuntimeOverview({ status, error }: { status?: OutboundRuntimeStatus; error?: string }) {
    const { t } = useTranslation("routing");
    if (!status) {
        return <section className="mb-6 border-b border-ui-border/60 pb-6" aria-label={t("outboundRuntime")}>
            <h3 className="mb-2 text-base font-medium text-ui-heading">{t("outboundRuntime")}</h3>
            <p className="text-xs text-ui-muted">{error ?? t("outboundNoObservations")}</p>
        </section>;
    }

    const numeric = [
        [t("outboundUpload"), formatNodeBytes(status.uploadBytes), status.uploadBytes],
        [t("outboundDownload"), formatNodeBytes(status.downloadBytes), status.downloadBytes],
        [t("outboundUploadSpeed"), `${formatNodeBytes(status.uploadBps)}/s`, status.uploadBps],
        [t("outboundDownloadSpeed"), `${formatNodeBytes(status.downloadBps)}/s`, status.downloadBps],
        [t("outboundActiveTCP"), String(status.activeTCP), String(status.activeTCP)],
        [t("outboundActiveUDP"), String(status.activeUDP), String(status.activeUDP)],
        [t("outboundTCPSuccess"), `${status.tcpConnections} / ${status.tcpAttempts}`, status.tcpConnections],
        [t("outboundUDPSuccess"), `${status.udpSessions} / ${status.udpAttempts}`, status.udpSessions],
        [t("outboundUDPPackets"), `${status.udpSentPackets} ↑ / ${status.udpRecvPackets} ↓`, status.udpSentPackets],
        [t("outboundFailures"), status.failures, status.failures],
    ];

    return <section className="mb-6 space-y-4 border-b border-ui-border/60 pb-6" aria-label={t("outboundRuntime")}>
        <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-medium text-ui-heading">{t("outboundRuntime")}</h3>
            <Badge pill variant={outboundStateVariant(status.state)}>{t(`outboundState_${status.state}`)}</Badge>
        </div>
        <p className="text-xs text-ui-muted">{t("outboundStateHelp")}</p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {numeric.map(([label, value, exact]) =>
                <div key={label} className="rounded-ui-md border border-ui-border/70 bg-ui-surface-muted p-3">
                    <div className="mb-1 text-xs text-ui-muted">{label}</div>
                    <div className="min-w-0 break-all font-mono text-sm tabular-nums" title={exact}>{value}</div>
                </div>,
            )}
        </div>
        <details className="space-y-3 rounded-ui-md border border-ui-border/70 p-3 text-sm" data-testid="node-measurement-summary">
            <summary className="cursor-pointer font-medium">{t('outboundMeasurementDetails')}</summary>
            <p className="text-xs text-ui-muted">{t('outboundMeasurementSeparation')}</p>
            {status.trafficWindow ? <div className="space-y-1">
                <p>{t('outboundTrafficWindow', { seconds: (status.trafficWindow.windowMs / 1000).toFixed(1) })}</p>
                <p className="break-words font-mono tabular-nums">↑ {formatNodeBytes(status.trafficWindow.uploadBps)}/s · ↓ {formatNodeBytes(status.trafficWindow.downloadBps)}/s</p>
                <p className="text-xs text-ui-muted">{new Date(status.trafficWindow.at).toLocaleString()}</p>
            </div> : <p className="text-xs text-ui-muted">{t('outboundNoTrafficWindow')}</p>}
            {status.recentTcpDials && <div className="space-y-1">
                <p>{t('outboundRecentDialFailures')}: {(status.recentTcpDials.failureRate * 100).toFixed(1)}% ({status.recentTcpDials.failures} / {status.recentTcpDials.samples})</p>
                <p className="text-xs text-ui-muted">{t('outboundDialWindowHint', { seconds: status.recentTcpDials.windowMs / 1000, limit: status.recentTcpDials.sampleLimit })}</p>
            </div>}
            <div className="grid min-w-0 gap-3 sm:grid-cols-2">{([['download', status.throughput], ['upload', status.uploadThroughput]] as const).map(([direction, measurement]) => <div key={direction} className="min-w-0 space-y-1">
                <p className="text-xs text-ui-muted">{t(direction === 'upload' ? 'auto.measuredUpload' : 'auto.measuredDownload')}</p>
                {measurement?.at ? <>
                    <p>{measurement.ok ? `${(direction === 'upload' ? measurement.uploadMbps ?? 0 : measurement.downloadMbps).toFixed(2)} Mbps (${measurement.samples})` : t('loadFailed')}</p>
                    <p className="text-xs text-ui-muted">{new Date(measurement.at).toLocaleString()}</p>
                    <p className="break-words text-xs text-ui-muted">{measurement.target}</p>
                </> : <p className="text-xs text-ui-muted">{t('auto.unmeasured')}</p>}
            </div>)}</div>
        </details>
        <div className="grid gap-2 text-xs text-ui-muted sm:grid-cols-2">
            <div>{t("outboundLastSuccess")}: {dateTime(status.lastSuccessAt)}</div>
            <div>{t("outboundLastFailure")}: {dateTime(status.lastFailureAt)}</div>
            <div>{t("outboundLastUsed")}: {dateTime(status.lastUsedAt)}</div>
            {status.protocol && <>
                <div>{t("outboundProtocolState")}: {t(`outboundNativeStates.${nativeStateKey(status.protocol.state)}`)}</div>
                <div>{t("outboundProtocolObservedAt")}: {dateTime(status.protocol.updatedAt)}</div>
            </>}
        </div>
        {status.protocol && <p className="text-xs text-ui-muted" data-testid="native-status-help">{t('outboundNativeHelp')}</p>}
        {(status.lastError || status.protocol?.lastError) &&
            <div className="rounded-ui-md border border-ui-danger/30 bg-ui-danger-soft p-3 text-sm text-ui-danger" role="alert">
                <div className="text-xs font-medium">{t("outboundLastError")}</div>
                <div className="mt-1 break-all">{status.protocol?.lastError || status.lastError}</div>
            </div>}
    </section>;
}
