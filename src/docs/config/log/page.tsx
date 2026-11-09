import { PageHeader } from '@/component/v2/page-header';
import { usePageVisible } from "@/common/hooks";
import { LogRingBuffer, levelStyles, parseLogLine, passesMinLevel, type LogEntry, type LogLevel } from "./log-buffer";
import { exportAndroidLogs, getAndroidLogs, startDownload } from '@/api/android';
import { useAndroidPlatform } from '@/hooks/use-android-platform';

import { AuthenticatedEventSource } from "@/auth/event-stream";
import { Badge } from "@/component/v2/badge"
import { Button } from "@/component/v2/button"
import { Card, CardBody, CardHeader, FilterSearch, MainContainer } from '@/component/v2/card'
import { Select } from '@/component/v2/select';
import { ToggleGroup, ToggleItem } from "@/component/v2/togglegroup"
import type { LogBatch } from "@/contract/tools"
import { clsx } from "clsx"
import { ArrowUp, Download, Pause, Play, Radio, Trash2 } from 'lucide-react'
import { FC, memo, useCallback, useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { VList, type VListHandle } from "virtua"

// Keep collecting every event; publishing the snapshot less often avoids rebuilding a virtual list at SSE frequency.
const LOG_RENDER_INTERVAL_MS = 250;
const LOG_RETENTION_OPTIONS = [500, 2000, 10000] as const
type LogRetention = typeof LOG_RETENTION_OPTIONS[number]
type LogSource = 'core' | 'android'
// Android logs are polled; after the first full read only the tail is needed to find new lines.
const ANDROID_POLL_MS = 3000;
const ANDROID_POLL_LINES = 1000;
const MIN_LEVELS: readonly LogLevel[] = ["TRACE", "DEBUG", "INFO", "WARN", "ERROR"];
const LEVEL_LABEL_KEY: Partial<Record<LogLevel, string>> = { TRACE: 'V', DEBUG: 'D', INFO: 'I', WARN: 'W', ERROR: 'E' };
const errorText = (e: unknown) => e instanceof Error ? e.message : String(e);



const LogLine: FC<{ entry: LogEntry }> = memo(({ entry }) => {
    // Most streamed lines are never mounted by the virtualizer. Parse only visible rows.
    const parsed = useMemo(() => parseLogLine(entry.line), [entry.line]);
    const style = levelStyles[parsed.level];

    return (
        <div
            data-log-id={entry.id}
            className="grid grid-cols-[3px_minmax(0,1fr)] border-b border-ui-border bg-ui-surface hover:bg-ui-surface-muted [[data-scrolling]_&]:pointer-events-none"
            style={{ contain: "layout paint style" }}
        >
            <div className={style.bar} />
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

const renderLogLine = (entry: LogEntry) => <LogLine key={entry.id} entry={entry} />;

export default function LogComponent() {
    const { t: uiT } = useTranslation('ui');

    const { t } = useTranslation("config");
    const { t: androidT } = useTranslation("android");
    const platform = useAndroidPlatform();
    const [source, setSource] = useState<LogSource>('core');
    // The Android source only exists inside the app's WebView.
    const activeSource: LogSource = platform ? source : 'core';
    const [minLevel, setMinLevel] = useState<LogLevel>('TRACE');
    const [exporting, setExporting] = useState(false);
    const [actionError, setActionError] = useState<string>();
    // Newest logcat line already in the buffer; later polls append only what follows it.
    const lastAndroidLineRef = useRef<string | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState('');
    const deferredSearchTerm = useDeferredValue(searchTerm)
    const [retention, setRetention] = useState<LogRetention>(2000)
    const [localVersion, setLocalVersion] = useState(0)
    const [logBuffer] = useState(() => new LogRingBuffer(retention))
    const [logError, setLogError] = useState<{ code: number, msg: string } | undefined>()
    const visible = usePageVisible();
    const [paused, setPaused] = useState(false);
    const [streamNonce, setStreamNonce] = useState(0)
    const logListRef = useRef<VListHandle>(null);
    const listWrapperRef = useRef<HTMLDivElement>(null);
    const followLatestRef = useRef(true);
    // Newest log id included in the published snapshot; used to count lines held back while the view is frozen.
    const shownLatestIdRef = useRef(0);
    const [pendingCount, setPendingCount] = useState(0);

    // Publishing a snapshot is the only thing that changes the virtual list's data. While the user is
    // reading older lines (not following), snapshots are held back so rows never move under them.
    const publish = useCallback(() => {
        shownLatestIdRef.current = logBuffer.latestId;
        setPendingCount(0);
        setLocalVersion(logBuffer.currentVersion);
    }, [logBuffer]);

    const resumeFollowing = useCallback(() => {
        if (followLatestRef.current) return;
        followLatestRef.current = true;
        publish();
    }, [publish]);

    useEffect(() => {
        if (activeSource !== 'core' || paused || !visible) return;
        let reconnectTimer: number | undefined;
        let flushTimer: number | undefined;
        let stopped = false;
        const source = new AuthenticatedEventSource("/api/v2/tools/logs/v2");
        const onLog = (event: MessageEvent<string>) => {
            if (stopped) return;
            try {
                if (event.data.length > 2 * 1024 * 1024) throw new Error("Log batch exceeds 2 MB limit");
                const batch = JSON.parse(event.data) as LogBatch;
                if (!Array.isArray(batch.log) || batch.log.some(line => typeof line !== 'string')) throw new Error("Invalid log batch");
                if (batch.log.length > 0) {
                    logBuffer.append(batch.log.slice(-retention).reverse());
                    if (flushTimer === undefined) flushTimer = window.setTimeout(() => {
                        flushTimer = undefined;
                        if (stopped) return;
                        if (followLatestRef.current) publish();
                        else setPendingCount(logBuffer.latestId - shownLatestIdRef.current);
                    }, LOG_RENDER_INTERVAL_MS);
                }
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
            if (followLatestRef.current) publish();
            if (reconnectTimer !== undefined) window.clearTimeout(reconnectTimer);
        };
    }, [logBuffer, publish, streamNonce, paused, visible, retention, activeSource])

    useEffect(() => {
        if (activeSource !== 'android' || paused || !visible) return;
        let stopped = false;
        let timer: number | undefined;
        const controller = new AbortController();
        const poll = async () => {
            try {
                const first = lastAndroidLineRef.current === undefined;
                const text = await getAndroidLogs(first ? retention : ANDROID_POLL_LINES, controller.signal);
                if (stopped) return;
                const lines = text.split('\n').filter(Boolean);
                const last = lastAndroidLineRef.current;
                const at = last === undefined ? -1 : lines.lastIndexOf(last);
                const fresh = at >= 0 ? lines.slice(at + 1) : lines;
                if (fresh.length > 0) {
                    lastAndroidLineRef.current = fresh[fresh.length - 1];
                    logBuffer.append(fresh.slice(-retention).reverse());
                    if (followLatestRef.current) publish();
                    else setPendingCount(logBuffer.latestId - shownLatestIdRef.current);
                }
                setLogError(undefined);
            } catch (error) {
                if (stopped) return;
                setLogError({ code: 500, msg: errorText(error) });
            }
            if (!stopped) timer = window.setTimeout(poll, ANDROID_POLL_MS);
        };
        void poll();
        return () => {
            stopped = true;
            controller.abort();
            if (timer !== undefined) window.clearTimeout(timer);
        };
    }, [activeSource, logBuffer, publish, paused, visible, retention])

    // Snapshot publication, not mutable buffer writes, controls virtual-list reconciliation.
    const version = localVersion

    const visibleLog = useMemo(() => {
        void version;
        const search = deferredSearchTerm.trim().toLowerCase()
        const entries: LogEntry[] = []

        for (let i = 0; i < logBuffer.size; i++) {
            const entry = logBuffer.get(i)
            if (!entry || !passesMinLevel(entry, minLevel)) continue
            if (!search || (entry.lowerLine ??= entry.line.toLowerCase()).includes(search)) {
                entries.push(entry)
            }
        }

        return entries
    }, [logBuffer, version, deferredSearchTerm, minLevel])

    // Any change of what is shown remounts the list so stale row sizes never survive.
    const filterKey = `${deferredSearchTerm}\n${minLevel}`;

    // virtua caches item sizes by index and only reconciles the cache by the change in length: at the
    // start when `shift` is set, otherwise at the end. A flush both prepends new rows and trims old rows
    // from the end, so it is fed to the list in two commits (prepend with shift, then trim without) to
    // keep every measured size attached to its own row. Both commits happen before paint.
    const [display, setDisplay] = useState<{ items: LogEntry[]; shift: boolean; epoch: number; search: string }>(
        () => ({ items: visibleLog, shift: false, epoch: 0, search: filterKey }));
    useLayoutEffect(() => {
        // The second render is the point: virtua's cache only reconciles on a committed data change, so the
        // shifted prepend must commit before the unshifted trim. Deriving during render would merge them.
        // oxlint-disable-next-line react/set-state-in-effect
        setDisplay(prev => {
            if (prev.search !== filterKey) return { items: visibleLog, shift: false, epoch: prev.epoch + 1, search: filterKey };
            if (prev.items === visibleLog) return prev.shift ? { ...prev, shift: false } : prev;
            const head = prev.items[0];
            const prepended = head ? visibleLog.findIndex(entry => entry.id === head.id) : -1;
            if (prepended > 0 && !prev.shift) return { ...prev, items: visibleLog.slice(0, prepended).concat(prev.items), shift: true };
            // Nothing in common (cleared, or every shown row trimmed): remount so no stale sizes survive.
            if (prepended < 0 && head && visibleLog.length > 0) return { ...prev, items: visibleLog, shift: false, epoch: prev.epoch + 1 };
            return { ...prev, items: visibleLog, shift: false };
        });
    }, [visibleLog, display, filterKey]);
    const latestLogId = display.items[0]?.id;

    useEffect(() => {
        if (!followLatestRef.current) return;

        const frame = requestAnimationFrame(() => {
            if (followLatestRef.current) logListRef.current?.scrollTo(0);
        });

        return () => cancelAnimationFrame(frame);
    }, [display.items.length, latestLogId]);

    const changeRetention = useCallback((value: string) => {
        const next = Number(value) as LogRetention
        if (!LOG_RETENTION_OPTIONS.includes(next)) return
        setRetention(next)
        logBuffer.setCapacity(next)
        // A larger window must be read again from logcat, which has no cursor to resume from.
        if (activeSource === 'android') { logBuffer.clear(); lastAndroidLineRef.current = undefined }
        publish()
    }, [logBuffer, publish, activeSource])

    const changeSource = useCallback((value: string) => {
        if ((value !== 'core' && value !== 'android') || value === activeSource) return
        setSource(value)
        setPaused(false)
        setLogError(undefined)
        setActionError(undefined)
        logBuffer.clear()
        lastAndroidLineRef.current = undefined
        followLatestRef.current = true
        publish()
    }, [logBuffer, publish, activeSource])

    const downloadAndroidLogs = useCallback(async () => {
        // Logs can contain destinations, addresses and credentials.
        if (!window.confirm(androidT('logs.exportWarning'))) return
        setExporting(true)
        setActionError(undefined)
        try { startDownload(await exportAndroidLogs()) }
        catch (error) { setActionError(errorText(error)) }
        finally { setExporting(false) }
    }, [androidT])

    const clearLogs = useCallback(() => {
        logBuffer.clear()
        lastAndroidLineRef.current = undefined
        followLatestRef.current = true
        publish()
    }, [logBuffer, publish])

    return (
        <MainContainer className="h-full min-h-0 flex flex-col">
            <PageHeader
                title={uiT("log")}
                description={uiT("realTimeSystemEvents")}
                className="mb-3 shrink-0"
                actions={<Badge variant={logError ? "danger" : "warning"} pill className="shrink-0 text-[0.7rem] px-2 py-1">
                    <Radio className="mr-1" size={12} />{uiT(paused || !visible ? "paused" : logError ? "reconnecting" : "live")}
                </Badge>}
            />
            <Card noMargin className="flex-1 min-h-0 flex flex-col overflow-hidden">
                <CardHeader className="shrink-0 !px-3 py-3 sm:!px-4">
                    <div className="grid w-full min-w-0 grid-cols-1 items-center gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-3">
                        <FilterSearch size="sm" onSearch={(term) => { followLatestRef.current = true; publish(); setSearchTerm(term); }} className="w-full min-w-0" inputClassName="max-sm:min-h-11 max-sm:text-base" />
                        <div className="flex min-w-0 items-center justify-between gap-2 sm:justify-end">
                            <ToggleGroup className="shrink-0 flex-nowrap max-sm:p-0" type="single" value={String(retention)} onValueChange={(v) => v && changeRetention(v)}>
                                {LOG_RETENTION_OPTIONS.map(value => (
                                    <ToggleItem className="h-6 min-h-6 min-w-11 py-0 !px-1.5 sm:!px-2.5" key={value} value={String(value)}>{value}</ToggleItem>
                                ))}
                            </ToggleGroup>
                            <div className="flex shrink-0 items-center gap-2">
                                <Button className="max-sm:!h-11 max-sm:!w-11" size="icon" variant="outline-secondary" aria-label={uiT("clearLogs")} title={uiT("clearLogs")} onClick={clearLogs}>
                                    <Trash2 size={16} />
                                </Button>
                                <Button className="max-sm:!h-11 max-sm:!w-11" size="icon" variant="outline-secondary" aria-label={uiT(paused ? "resumeCollection" : "pauseCollection")} title={uiT(paused ? "resumeCollection" : "pauseCollection")} aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? <Play size={16} /> : <Pause size={16} />}</Button>
                            </div>
                        </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                            {platform && (
                                <ToggleGroup className="shrink-0 flex-nowrap max-sm:p-0" type="single" value={activeSource} onValueChange={(v) => v && changeSource(v)}>
                                    <ToggleItem className="h-6 min-h-6 min-w-11 py-0 !px-2.5" value="core">{androidT("logs.sourceCore")}</ToggleItem>
                                    <ToggleItem className="h-6 min-h-6 min-w-11 py-0 !px-2.5" value="android">{androidT("logs.sourceAndroid")}</ToggleItem>
                                </ToggleGroup>
                            )}
                            <Select size="sm" triggerClassName="!w-auto min-w-24" ariaLabel={androidT("logs.level")} value={minLevel} onValueChange={(v) => { followLatestRef.current = true; publish(); setMinLevel(v as LogLevel); }}
                                items={MIN_LEVELS.map(value => ({ value, label: androidT(`logs.levels.${LEVEL_LABEL_KEY[value]}`) }))} />
                        </div>
                        {activeSource === 'android' && (
                            <Button className="max-sm:!h-11 max-sm:!w-11" size="icon" variant="outline-secondary" loading={exporting} aria-label={androidT("logs.export")} title={androidT("logs.export")} onClick={downloadAndroidLogs}>
                                <Download size={16} aria-hidden="true" />
                            </Button>
                        )}
                    </div>
                    {actionError && <p role="alert" className="mt-2 text-xs text-ui-danger">{actionError}</p>}
                    {(paused || !visible) && <p role="status" className="mt-2 text-xs text-ui-muted">{uiT("collectionPausesInTheBackgroundOrWhenPausedEventsDuringThatTimeAreNotCollectedRetainedLogsStayAvailable")}</p>}
                    {logError && (
                        <div className="mt-2 rounded-ui-lg border border-ui-danger/30 bg-ui-danger/10 px-3 py-2 text-xs text-ui-danger">
                            {logError.msg}{uiT("retrying")}</div>
                    )}
                </CardHeader>
                {/* No rounded clip here: a bottom-only radius on the scroller's ancestor forces a mask render pass on
                    every scrolled frame. The Card's uniform rounded clip uses the compositor's fast path. */}
                <CardBody className="relative !p-0 bg-ui-surface-muted flex-1 min-h-0 overflow-hidden">
                    {display.items.length === 0 ? (
                        <div className="flex h-full min-h-40 items-center justify-center px-6 text-center text-sm text-ui-muted">
                            {searchTerm ? t("log.noSearchResults") : t("log.empty")}
                        </div>
                    ) : (
                        <div
                            ref={listWrapperRef}
                            className="h-full min-h-0 w-full font-mono"
                            onWheelCapture={(event) => { if (event.deltaY > 0) followLatestRef.current = false; }}
                            onTouchMoveCapture={() => { followLatestRef.current = false; }}
                            onPointerDownCapture={() => { followLatestRef.current = false; }}
                            onKeyDownCapture={(event) => {
                                if (["ArrowDown", "PageDown", "End", " "].includes(event.key)) followLatestRef.current = false;
                            }}
                        >
                            <VList
                                key={display.epoch}
                                ref={logListRef}
                                data={display.items}
                                shift={display.shift}
                                onScroll={(offset) => {
                                    // Only user gestures disable following; returning to the top re-enables it.
                                    if (offset < 40) resumeFollowing();
                                    // Rows under a still cursor would otherwise toggle :hover (and repaint) on every frame.
                                    listWrapperRef.current?.setAttribute("data-scrolling", "");
                                }}
                                onScrollEnd={() => listWrapperRef.current?.removeAttribute("data-scrolling")}
                                style={{ height: '100%', width: '100%', overflowAnchor: 'none' }}
                            >
                                {renderLogLine}
                            </VList>
                        </div>
                    )}
                    {pendingCount > 0 && (
                        <Button
                            size="sm"
                            variant="primary"
                            className="absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full shadow-md"
                            onClick={() => { resumeFollowing(); logListRef.current?.scrollTo(0); }}
                        >
                            <ArrowUp size={14} aria-hidden="true" />{uiT("newLogCount", { count: pendingCount })}
                        </Button>
                    )}
                </CardBody>
            </Card>
        </MainContainer>
    );
}
