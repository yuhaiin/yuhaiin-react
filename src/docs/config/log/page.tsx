"use client"

import { AuthTokenKey, getApiUrl } from "@/common/apiurl"
import { Badge } from "@/component/v2/badge"
import { Button } from "@/component/v2/button"
import { Card, CardBody, CardHeader, FilterSearch, IconBox, MainContainer } from '@/component/v2/card'
import { ToggleGroup, ToggleItem } from "@/component/v2/togglegroup"
import type { LogBatch } from "@/contract/tools"
import { clsx } from "clsx"
import { Radio, Terminal, Trash2 } from 'lucide-react'
import { FC, memo, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react"
import { VList, type VListHandle } from "virtua"

const LOG_RETENTION_OPTIONS = [500, 2000, 10000] as const
type LogRetention = typeof LOG_RETENTION_OPTIONS[number]
type LogLevel = "ERROR" | "WARN" | "INFO" | "DEBUG" | "FATAL" | "TRACE" | "LOG";

type ParsedLogLine = {
    time?: string;
    displayTime?: string;
    level: LogLevel;
    message: string;
    source?: string;
    details?: string;
}

type LogEntry = {
    id: number;
    line: string;
    parsed: ParsedLogLine;
}

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

const levelStyles: Record<LogLevel, { bar: string; badge: string; text: string }> = {
    ERROR: {
        bar: "bg-red-500",
        badge: "bg-red-500/10 text-red-700 ring-red-500/20 dark:text-red-300",
        text: "text-red-700 dark:text-red-200",
    },
    FATAL: {
        bar: "bg-rose-600",
        badge: "bg-rose-500/10 text-rose-700 ring-rose-500/25 dark:text-rose-300",
        text: "text-rose-700 dark:text-rose-200",
    },
    WARN: {
        bar: "bg-amber-500",
        badge: "bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-300",
        text: "text-amber-700 dark:text-amber-200",
    },
    INFO: {
        bar: "bg-sky-500",
        badge: "bg-sky-500/10 text-sky-700 ring-sky-500/20 dark:text-sky-300",
        text: "text-slate-800 dark:text-slate-100",
    },
    DEBUG: {
        bar: "bg-emerald-500",
        badge: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300",
        text: "text-emerald-700 dark:text-emerald-200",
    },
    TRACE: {
        bar: "bg-violet-500",
        badge: "bg-violet-500/10 text-violet-700 ring-violet-500/20 dark:text-violet-300",
        text: "text-violet-700 dark:text-violet-200",
    },
    LOG: {
        bar: "bg-slate-300 dark:bg-slate-600",
        badge: "bg-slate-500/10 text-slate-600 ring-slate-500/15 dark:text-slate-300",
        text: "text-slate-800 dark:text-slate-100",
    },
};

const readSlogValue = (line: string, key: string): string | undefined => {
    const start = line.indexOf(`${key}=`);
    if (start < 0) return undefined;

    let i = start + key.length + 1;
    if (line[i] !== '"') {
        const end = line.indexOf(" ", i);
        return line.slice(i, end < 0 ? undefined : end);
    }

    i += 1;
    let value = "";
    for (; i < line.length; i++) {
        const char = line[i];
        if (char === "\\" && i + 1 < line.length) {
            value += line[i + 1];
            i += 1;
            continue;
        }
        if (char === '"') break;
        value += char;
    }
    return value;
}

const trimSlogFields = (line: string) => {
    return line
        .replace(/\btime=(?:"(?:\\.|[^"])*"|\S+)\s*/g, "")
        .replace(/\blevel=(?:"(?:\\.|[^"])*"|\S+)\s*/g, "")
        .replace(/\bsource=(?:"(?:\\.|[^"])*"|\S+)\s*/g, "")
        .replace(/\bmsg=(?:"(?:\\.|[^"])*"|\S+)\s*/g, "")
        .trim();
}

const formatLogTime = (value?: string) => {
    if (!value) return undefined;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    const time = date.toLocaleTimeString(undefined, {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
    return `${time}.${String(date.getMilliseconds()).padStart(3, "0")}`;
}

const parseLogLine = (line: string): ParsedLogLine => {
    const rawLevel = readSlogValue(line, "level")?.toUpperCase();
    const level = rawLevel && rawLevel in levelStyles ? rawLevel as LogLevel : "LOG";
    const message = readSlogValue(line, "msg") ?? line;
    const source = readSlogValue(line, "source");
    const time = readSlogValue(line, "time");
    const details = message === line ? undefined : trimSlogFields(line);

    return { time, displayTime: formatLogTime(time), level, message, source, details };
}

class LogRingBuffer {
    private entries: LogEntry[]
    private head = 0
    private count = 0
    private version = 0
    private nextId = 0

    constructor(private capacity: number) {
        this.entries = new Array(capacity)
    }

    get size() {
        return this.count
    }

    get currentVersion() {
        return this.version
    }

    get(index: number) {
        if (index < 0 || index >= this.count) return undefined
        return this.entries[(this.head + index) % this.capacity]
    }

    append(values: string[]) {
        if (values.length === 0 || this.capacity <= 0) return this.version

        for (let i = values.length - 1; i >= 0; i--) {
            const line = values[i]
            this.head = (this.head - 1 + this.capacity) % this.capacity
            this.entries[this.head] = {
                id: ++this.nextId,
                line,
                parsed: parseLogLine(line),
            }
            if (this.count < this.capacity) this.count++
        }

        this.version++
        return this.version
    }

    setCapacity(capacity: number) {
        if (this.capacity === capacity) return this.version

        const keep = Math.min(this.count, capacity)
        const next = new Array<LogEntry>(capacity)
        for (let i = 0; i < keep; i++) {
            const entry = this.get(i)
            if (entry) next[i] = entry
        }

        this.capacity = capacity
        this.entries = next
        this.head = 0
        this.count = keep
        this.version++
        return this.version
    }

    clear() {
        if (this.count === 0) return this.version
        this.entries = new Array(this.capacity)
        this.head = 0
        this.count = 0
        this.version++
        return this.version
    }
}

const LogLine: FC<{ entry: LogEntry }> = memo(({ entry }) => {
    const { parsed } = entry;
    const style = levelStyles[parsed.level];

    return (
        <div
            className="group grid grid-cols-[3px_minmax(0,1fr)] border-b border-black/5 bg-white/55 hover:bg-white dark:border-white/5 dark:bg-white/[0.025] dark:hover:bg-white/[0.055]"
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
                    <span className={clsx("min-w-0 flex-1 whitespace-pre-wrap break-words", style.text)}>
                        {parsed.message}
                    </span>
                </div>
                {parsed.details && (
                    <div className="mt-1 whitespace-pre-wrap break-words pl-[60px] text-[11.5px] leading-5 text-slate-500 dark:text-slate-400">
                        {parsed.details}
                    </div>
                )}
            </div>
        </div>
    );
});

export default function LogComponent() {
    const [searchTerm, setSearchTerm] = useState('');
    const deferredSearchTerm = useDeferredValue(searchTerm)
    const [retention, setRetention] = useState<LogRetention>(2000)
    const [localVersion, setLocalVersion] = useState(0)
    const [logBuffer] = useState(() => new LogRingBuffer(retention))
    const [logError, setLogError] = useState<{ code: number, msg: string } | undefined>()
    const [streamNonce, setStreamNonce] = useState(0)
    const logListRef = useRef<VListHandle>(null);
    const followLatestRef = useRef(true);

    useEffect(() => {
        let reconnectTimer: number | undefined;
        const source = new EventSource(logsURL());
        const onLog = (event: MessageEvent<string>) => {
            try {
                const batch = JSON.parse(event.data) as LogBatch;
                setLocalVersion(logBuffer.append([...(batch.log ?? [])].reverse()));
                setLogError(undefined);
            } catch (error) {
                setLogError({ code: 500, msg: error instanceof globalThis.Error ? error.message : "decode log failed" });
            }
        };
        source.addEventListener("log", onLog);
        source.onerror = () => {
            setLogError({ code: 500, msg: "log stream disconnected" });
            source.close();
            reconnectTimer = window.setTimeout(() => setStreamNonce((value) => value + 1), 2000);
        };
        return () => {
            source.close();
            if (reconnectTimer !== undefined) window.clearTimeout(reconnectTimer);
        };
    }, [logBuffer, streamNonce])

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
            <Card className="flex-1 min-h-0 !mb-0 flex flex-col overflow-hidden">
                <CardHeader className="px-2.5 py-2">
                    <div className="flex justify-between items-center w-full gap-3">
                        <IconBox
                            icon={Terminal}
                            tone="warning"
                            title="Live Logcat"
                            description="Real-time system events"
                            className="!mr-3 !h-10 !w-10 !rounded-[10px]"
                        />
                        <div className="flex items-center gap-2 flex-grow justify-end">
                            <FilterSearch onEnter={setSearchTerm} className='flex-grow' />
                            <ToggleGroup className="flex-nowrap" type="single" value={String(retention)} onValueChange={(v) => v && changeRetention(v)}>
                                {LOG_RETENTION_OPTIONS.map(value => (
                                    <ToggleItem key={value} value={String(value)}>{value}</ToggleItem>
                                ))}
                            </ToggleGroup>
                            <Button size="sm" variant="outline-secondary" onClick={clearLogs}>
                                <Trash2 size={14} />
                            </Button>
                            <Badge variant={logError ? "danger" : "warning"} pill className="text-[0.7rem] px-2 py-1">
                                <Radio className="mr-1" size={12} />{logError ? "RECONNECTING" : "LIVE"}
                            </Badge>
                        </div>
                    </div>
                    {logError && (
                        <div className="mt-2 rounded-ui-lg border border-ui-danger/30 bg-ui-danger/10 px-3 py-2 text-xs text-ui-danger">
                            {logError.msg}. Retrying...
                        </div>
                    )}
                </CardHeader>
                <CardBody className="!p-0 bg-ui-surface-muted flex-1 min-h-0 overflow-hidden rounded-b-[inherit]">
                    <div className="h-full min-h-0 w-full rounded-[inherit] font-mono">
                        <VList
                            ref={logListRef}
                            data={visibleLog}
                            itemSize={72}
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
                </CardBody>
            </Card>
        </MainContainer>
    );
}
