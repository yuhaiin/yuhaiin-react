"use client"

import { useDelay } from "@/common/hooks"
import { Badge } from "@/component/v2/badge"
import { Card, CardBody, CardHeader, FilterSearch, IconBox, MainContainer } from '@/component/v2/card'
import { create } from "@bufbuild/protobuf"
import { EmptySchema } from "@bufbuild/protobuf/wkt"
import { clsx } from "clsx"
import { Radio, Terminal } from 'lucide-react'
import { FC, memo, useEffect, useMemo, useRef, useState } from "react"
import useSWRSubscription from "swr/subscription"
import { VList, type VListHandle } from "virtua"
import { ProtoPath, WebsocketProtoServerStream } from "../../../common/proto"
import { Error } from "../../../component/v2/loading"
import { tools } from "../../pbes/api/tools_pb"
import { Logv2 } from "../../pbes/tools/tools_pb"

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
    return date.toLocaleTimeString(undefined, {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        fractionalSecondDigits: 3,
    });
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

const processStream = (rs: Logv2[], prev?: LogEntry[]): LogEntry[] => {
    const newLines = rs.flatMap(r => r.log).reverse();
    const startId = prev?.[0]?.id ?? 0;
    const newLogs = newLines.map((line, index) => ({
        id: startId + newLines.length - index,
        line,
        parsed: parseLogLine(line),
    }));
    const combined = [...newLogs, ...(prev ?? [])];

    if (combined.length > 10000) {
        return combined.slice(0, 10000);
    }
    return combined;
}

export default function LogComponent() {
    const [searchTerm, setSearchTerm] = useState('');
    const logListRef = useRef<VListHandle>(null);
    const followLatestRef = useRef(true);
    const shouldFetch = useDelay(1000);

    const subscription = useMemo(() =>
        WebsocketProtoServerStream(tools.method.logv2, create(EmptySchema, {}), processStream, { throttle: 200 }),
        []
    );

    const { data: log, error: log_error } =
        useSWRSubscription(
            shouldFetch ? ProtoPath(tools.method.log) : null,
            subscription,
            {}
        )

    const filteredLog = useMemo(() => {
        if (!log) return [];
        if (!searchTerm) return log;
        return log.filter(entry => entry.line.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [log, searchTerm]);
    const latestLogId = filteredLog[0]?.id;

    useEffect(() => {
        if (!followLatestRef.current) return;

        const frame = requestAnimationFrame(() => {
            logListRef.current?.scrollTo(0);
        });

        return () => cancelAnimationFrame(frame);
    }, [filteredLog.length, latestLogId]);

    if (log_error) { return <Error statusCode={log_error.code} title={log_error.msg} /> }

    return (
        <MainContainer className="h-full min-h-0 flex flex-col">
            <Card className="flex-1 min-h-0 mb-0 flex flex-col overflow-hidden">
                <CardHeader className="px-2.5 py-2">
                    <div className="flex justify-between items-center w-full gap-3">
                        <IconBox
                            icon={Terminal}
                            color="#f59e0b"
                            title="Live Logcat"
                            description="Real-time system events"
                            className="!mr-3 !h-10 !w-10 !rounded-[10px]"
                        />
                        <div className="flex items-center gap-2 flex-grow">
                            <FilterSearch onEnter={setSearchTerm} className='flex-grow' />
                            <Badge variant="warning" pill className="text-[0.7rem] px-2 py-1">
                                <Radio className="mr-1" size={12} />LIVE
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardBody className="!p-0 bg-gray-100 dark:bg-[#18181b] flex-1 min-h-0 overflow-hidden rounded-b-[inherit]">
                    <div className="h-full min-h-0 w-full rounded-[inherit] font-mono">
                        <VList
                            ref={logListRef}
                            data={filteredLog}
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
