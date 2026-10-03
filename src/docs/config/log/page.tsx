import { usePageVisible } from "@/common/hooks";
import { LogRingBuffer, levelStyles, type LogEntry } from "./log-buffer";

import { AuthTokenKey, getApiUrl } from "@/common/apiurl"
import { Badge } from "@/component/v2/badge"
import { Button } from "@/component/v2/button"
import { Card, CardBody, CardHeader, FilterSearch, IconBox, MainContainer } from '@/component/v2/card'
import { ToggleGroup, ToggleItem } from "@/component/v2/togglegroup"
import type { LogBatch } from "@/contract/tools"
import { clsx } from "clsx"
import { Pause, Play, Radio, Terminal, Trash2 } from 'lucide-react'
import { FC, memo, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { VList, type VListHandle } from "virtua"

const LOG_RETENTION_OPTIONS = [500, 2000, 10000] as const
type LogRetention = typeof LOG_RETENTION_OPTIONS[number]
function logsURL() {
    const apiUrl = getApiUrl();
    const base = apiUrl !== "" ? apiUrl : window.location.toString();
    const url = new URL(base);
    url.hash = "";
    url.pathname = "/api/v2/tools/logs/v2";
    const token = localStorage.getItem(AuthTokenKey);
    if (token) url.searchParams.set("token", token);
    return url.toString();
}


const LogLine: FC<{ entry: LogEntry }> = memo(({ entry }) => {
    const { parsed } = entry;
    const style = levelStyles[parsed.level];

    return (
        <div
            className="group grid grid-cols-[3px_minmax(0,1fr)] border-b border-ui-border/70 bg-ui-surface/80 hover:bg-ui-surface-muted/70"
            style={{ contain: "layout paint style" }}
        >
            <div className={clsx("opacity-75 transition-opacity group-hover:opacity-100", style.bar)} />
            <div className="min-w-0 px-3 py-2 font-mono text-[12.5px] leading-5 selection:bg-amber-300/30">
                <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className={clsx("inline-flex h-5 min-w-[52px] items-center justify-center rounded px-1.5 text-[10px] font-semibold leading-none tracking-normal ring-1", style.badge)}>
                        {parsed.level}
                    </span>
                    {parsed.displayTime && (
                        <span className="shrink-0 text-[11px] text-slate-500 dark:text-slate-400">
                            {parsed.displayTime}
                        </span>
                    )}
                    {parsed.source && (
                        <span className="min-w-0 truncate text-[11px] text-slate-400 dark:text-slate-500">
                            {parsed.source}
                        </span>
                    )}
                    <span className={clsx("min-w-0 basis-full whitespace-pre-wrap break-words sm:basis-auto sm:flex-1", style.text)}>
                        {parsed.message}
                    </span>
                </div>
                {parsed.details && (
                    <div className="mt-1 whitespace-pre-wrap break-words pl-0 text-[11.5px] leading-5 text-slate-500 dark:text-slate-400 sm:pl-[60px]">
                        {parsed.details}
                    </div>
                )}
            </div>
        </div>
    );
});

export default function LogComponent() {
    const { t: uiT } = useTranslation('ui');

    const { t } = useTranslation("config");
    const [searchTerm, setSearchTerm] = useState('');
    const deferredSearchTerm = useDeferredValue(searchTerm)
    const [retention, setRetention] = useState<LogRetention>(2000)
    const [localVersion, setLocalVersion] = useState(0)
    const [logBuffer] = useState(() => new LogRingBuffer(retention))
    const [logError, setLogError] = useState<{ code: number, msg: string } | undefined>()
    const visible = usePageVisible();
    const [paused, setPaused] = useState(false);
    const [collectionGap, setCollectionGap] = useState(false);
    const [streamNonce, setStreamNonce] = useState(0)
    const logListRef = useRef<VListHandle>(null);
    const followLatestRef = useRef(true);

    useEffect(() => {
        if (paused || !visible) { setCollectionGap(true); return; }
        let reconnectTimer: number | undefined;
        let flushTimer: number | undefined;
        let stopped = false;
        const source = new EventSource(logsURL());
        const onLog = (event: MessageEvent<string>) => {
            if (stopped) return;
            try {
                if (event.data.length > 2 * 1024 * 1024) throw new Error("Log batch exceeds 2 MB limit");
                const batch = JSON.parse(event.data) as LogBatch;
                if (!Array.isArray(batch.log) || batch.log.some(line => typeof line !== 'string')) throw new Error("Invalid log batch");
                logBuffer.append(batch.log.slice(-retention).reverse());
                if (flushTimer === undefined) flushTimer = window.setTimeout(() => {
                    flushTimer = undefined;
                    if (!stopped) setLocalVersion(logBuffer.currentVersion);
                }, 100);
                setLogError(undefined);
            } catch (error) {
                setLogError({ code: 500, msg: error instanceof globalThis.Error ? error.message : "decode log failed" });
            }
        };
        source.addEventListener("log", onLog);
        source.onerror = () => {
            if (stopped) return;
            setLogError({ code: 500, msg: "log stream disconnected" });
            source.close();
            reconnectTimer = window.setTimeout(() => setStreamNonce((value) => value + 1), 2000);
        };
        return () => {
            stopped = true;
            source.close();
            if (flushTimer !== undefined) window.clearTimeout(flushTimer);
            setLocalVersion(logBuffer.currentVersion);
            if (reconnectTimer !== undefined) window.clearTimeout(reconnectTimer);
        };
    }, [logBuffer, streamNonce, paused, visible, retention])

    const version = Math.max(localVersion, logBuffer.currentVersion)

    const visibleLog = useMemo(() => {
        void version;
        const search = deferredSearchTerm.trim().toLowerCase()
        const entries: LogEntry[] = []

        for (let i = 0; i < logBuffer.size; i++) {
            const entry = logBuffer.get(i)
            if (!entry) continue
            if (!search || entry.line.toLowerCase().includes(search)) {
                entries.push(entry)
            }
        }

        return entries
    }, [logBuffer, version, deferredSearchTerm])
    const latestLogId = visibleLog[0]?.id;

    useEffect(() => {
        if (!followLatestRef.current) return;

        const frame = requestAnimationFrame(() => {
            logListRef.current?.scrollTo(0);
        });

        return () => cancelAnimationFrame(frame);
    }, [visibleLog.length, latestLogId]);

    const changeRetention = useCallback((value: string) => {
        const next = Number(value) as LogRetention
        if (!LOG_RETENTION_OPTIONS.includes(next)) return
        setRetention(next)
        setLocalVersion(logBuffer.setCapacity(next))
    }, [logBuffer])

    const clearLogs = useCallback(() => {
        setLocalVersion(logBuffer.clear())
    }, [logBuffer])

    return (
        <MainContainer className="h-full min-h-0 flex flex-col">
            <Card noMargin className="flex-1 min-h-0 flex flex-col overflow-hidden">
                <CardHeader className="shrink-0 !px-3 py-3 sm:!px-4">
                    <div className="flex w-full min-w-0 items-center justify-between gap-3">
                        <IconBox
                            icon={Terminal}
                            tone="warning"
                            title={uiT("liveLogcat")}
                            description={uiT("realTimeSystemEvents")}
                            className="!mr-3 !h-10 !w-10 !rounded-[10px]"
                        />
                        <Badge variant={logError ? "danger" : "warning"} pill className="shrink-0 text-[0.7rem] px-2 py-1">
                            <Radio className="mr-1" size={12} />{uiT(paused || !visible ? "paused" : logError ? "reconnecting" : "live")}
                        </Badge>
                    </div>
                    <div className="grid w-full min-w-0 grid-cols-1 items-center gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-3">
                        <FilterSearch onEnter={setSearchTerm} className="w-full min-w-0" />
                        <div className="flex min-w-0 items-center justify-between gap-2 sm:justify-end">
                            <ToggleGroup className="shrink-0 flex-nowrap" type="single" value={String(retention)} onValueChange={(v) => v && changeRetention(v)}>
                                {LOG_RETENTION_OPTIONS.map(value => (
                                    <ToggleItem className="h-11 min-w-11 !px-1.5 sm:!px-2.5" key={value} value={String(value)}>{value}</ToggleItem>
                                ))}
                            </ToggleGroup>
                            <div className="flex shrink-0 items-center gap-2">
                                <Button className="!h-11 !w-11" size="icon" variant="outline-secondary" aria-label={uiT("clearLogs")} title={uiT("clearLogs")} onClick={clearLogs}>
                                    <Trash2 size={16} />
                                </Button>
                                <Button className="!h-11 !w-11" size="icon" variant="outline-secondary" aria-label={uiT(paused ? "resumeCollection" : "pauseCollection")} title={uiT(paused ? "resumeCollection" : "pauseCollection")} aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? <Play size={16} /> : <Pause size={16} />}</Button>
                            </div>
                        </div>
                    </div>
                    {collectionGap && <p role="status" className="mt-2 text-xs text-ui-muted">{uiT("collectionPausesInTheBackgroundOrWhenPausedEventsDuringThatTimeAreNotCollectedRetainedLogsStayAvailable")}</p>}
                    {logError && (
                        <div className="mt-2 rounded-ui-lg border border-ui-danger/30 bg-ui-danger/10 px-3 py-2 text-xs text-ui-danger">
                            {logError.msg}{uiT("retrying")}</div>
                    )}
                </CardHeader>
                <CardBody className="!p-0 bg-ui-surface-muted flex-1 min-h-0 overflow-hidden rounded-b-[inherit]">
                    {visibleLog.length === 0 ? (
                        <div className="flex h-full min-h-40 items-center justify-center px-6 text-center text-sm text-ui-muted">
                            {searchTerm ? t("log.noSearchResults") : t("log.empty")}
                        </div>
                    ) : (
                        <div className="h-full min-h-0 w-full rounded-[inherit] font-mono">
                            <VList
                                ref={logListRef}
                                data={visibleLog}
                                bufferSize={360}
                                shift
                                onScroll={(offset) => {
                                    followLatestRef.current = offset < 40;
                                }}
                                style={{ height: '100%', width: '100%', overflowAnchor: 'none' }}
                            >
                                {(entry) => <LogLine key={entry.id} entry={entry} />}
                            </VList>
                        </div>
                    )}
                </CardBody>
            </Card>
        </MainContainer>
    );
}
