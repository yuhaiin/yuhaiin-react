"use client"

import { useDelay } from "@/common/hooks"
import { Badge } from "@/component/v2/badge"
import { Button } from "@/component/v2/button"
import { Card, CardBody, CardHeader, FilterSearch, IconBox, MainContainer } from '@/component/v2/card'
import { ToggleGroup, ToggleItem } from "@/component/v2/togglegroup"
import { create } from "@bufbuild/protobuf"
import { EmptySchema } from "@bufbuild/protobuf/wkt"
import { Radio, Terminal, Trash2 } from 'lucide-react'
import { FC, useCallback, useDeferredValue, useMemo, useState } from "react"
import { List, type RowComponentProps } from 'react-window'
import useSWRSubscription from "swr/subscription"
import { ProtoPath, WebsocketProtoServerStream } from "../../../common/proto"
import { Error } from "../../../component/v2/loading"
import { tools } from "../../pbes/api/tools_pb"
import { Logv2 } from "../../pbes/tools/tools_pb"

const LOG_RETENTION_OPTIONS = [500, 2000, 10000] as const
type LogRetention = typeof LOG_RETENTION_OPTIONS[number]

class LogRingBuffer {
    private lines: string[]
    private head = 0
    private count = 0
    private version = 0

    constructor(private capacity: number) {
        this.lines = new Array(capacity)
    }

    get size() {
        return this.count
    }

    get currentVersion() {
        return this.version
    }

    get(index: number) {
        if (index < 0 || index >= this.count) return ""
        return this.lines[(this.head + index) % this.capacity] ?? ""
    }

    append(values: string[]) {
        if (values.length === 0 || this.capacity <= 0) return this.version

        for (let i = values.length - 1; i >= 0; i--) {
            const line = values[i]
            this.head = (this.head - 1 + this.capacity) % this.capacity
            this.lines[this.head] = line
            if (this.count < this.capacity) this.count++
        }

        this.version++
        return this.version
    }

    setCapacity(capacity: number) {
        if (this.capacity === capacity) return this.version

        const keep = Math.min(this.count, capacity)
        const next = new Array<string>(capacity)
        for (let i = 0; i < keep; i++) {
            next[i] = this.get(i)
        }

        this.capacity = capacity
        this.lines = next
        this.head = 0
        this.count = keep
        this.version++
        return this.version
    }

    clear() {
        if (this.count === 0) return this.version
        this.lines = new Array(this.capacity)
        this.head = 0
        this.count = 0
        this.version++
        return this.version
    }
}

const HighlightLogLine: FC<{ line: string }> = ({ line }) => {
    if (line.includes('ERROR')) return <span className="text-red-500">{line}</span>;
    if (line.includes('WARN')) return <span className="text-amber-500">{line}</span>;
    if (line.includes('INFO')) return <span className="text-blue-500">{line}</span>;
    if (line.includes("DEBUG")) return <span className="text-green-500">{line}</span>;
    return <span className="font-mono">{line}</span>;
}

type LogRowProps = {
    buffer: LogRingBuffer,
    indexes?: number[],
    version: number,
}

const Row = ({ index, style, buffer, indexes, ariaAttributes }: RowComponentProps<LogRowProps>) => {
    const line = buffer.get(indexes ? indexes[index] : index)

    return (
        <div
            {...ariaAttributes}
            style={{
                ...style,
                width: 'max-content'
            }}
            className="text-[13px] leading-5 flex items-center pl-4 font-mono"
        >
            {line && <HighlightLogLine line={line} />}
        </div>
    );
};

export default function LogComponent() {
    const [searchTerm, setSearchTerm] = useState('');
    const deferredSearchTerm = useDeferredValue(searchTerm)
    const [retention, setRetention] = useState<LogRetention>(2000)
    const [localVersion, setLocalVersion] = useState(0)
    const shouldFetch = useDelay(1000);
    const [logBuffer] = useState(() => new LogRingBuffer(retention))

    const processStream = useCallback((rs: Logv2[]): number => {
        const newLogs = rs.flatMap(r => r.log).reverse();
        return logBuffer.append(newLogs)
    }, [logBuffer])

    const subscription = useMemo(() =>
        WebsocketProtoServerStream(tools.method.logv2, create(EmptySchema, {}), processStream, { throttle: 200 }),
        [processStream]
    );

    const { data: streamVersion, error: log_error } =
        useSWRSubscription(
            shouldFetch ? ProtoPath(tools.method.log) : null,
            subscription,
            {}
        )

    const version = Math.max(streamVersion ?? 0, localVersion, logBuffer.currentVersion)

    const rowIndexes = useMemo(() => {
        void version;
        const search = deferredSearchTerm.trim().toLowerCase()
        if (!search) return undefined

        const indexes: number[] = []

        for (let i = 0; i < logBuffer.size; i++) {
            if (logBuffer.get(i).toLowerCase().includes(search)) {
                indexes.push(i)
            }
        }

        return indexes
    }, [logBuffer, version, deferredSearchTerm])

    const changeRetention = useCallback((value: string) => {
        const next = Number(value) as LogRetention
        if (!LOG_RETENTION_OPTIONS.includes(next)) return
        setRetention(next)
        setLocalVersion(logBuffer.setCapacity(next))
    }, [logBuffer])

    const clearLogs = useCallback(() => {
        setLocalVersion(logBuffer.clear())
    }, [logBuffer])

    if (log_error) { return <Error statusCode={log_error.code} title={log_error.msg} /> }

    return (
        <MainContainer className="h-full flex flex-col">
            <Card className="flex-1 mb-0 flex flex-col overflow-hidden">
                <CardHeader className="py-3">
                    <div className="flex justify-between items-center w-full gap-3">
                        <IconBox icon={Terminal} color="#f59e0b" title="Live Logcat" description="Real-time system events" />
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
                            <Badge variant="warning" pill className="text-[0.7rem] px-2 py-1">
                                <Radio className="mr-1" size={12} />LIVE
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardBody className="p-0 bg-gray-100 dark:bg-[#18181b] flex-1 overflow-hidden rounded-b-[inherit]">
                    <div className="h-full w-full rounded-[inherit] font-mono">
                        <List
                            rowCount={rowIndexes?.length ?? logBuffer.size}
                            rowHeight={20}
                            rowComponent={Row}
                            rowProps={{ buffer: logBuffer, indexes: rowIndexes, version }}
                            overscanCount={12}
                        />
                    </div>
                </CardBody>
            </Card>
        </MainContainer>
    );
}
