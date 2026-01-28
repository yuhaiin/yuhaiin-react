"use client"

import { useDelay } from "@/common/hooks"
import { Badge } from "@/component/v2/badge"
import { Card, CardBody, CardHeader, FilterSearch, IconBox, MainContainer } from '@/component/v2/card'
import { create } from "@bufbuild/protobuf"
import { EmptySchema } from "@bufbuild/protobuf/wkt"
import { Radio, Terminal } from 'lucide-react'
import { FC, useMemo, useState } from "react"
import { List, type RowComponentProps } from 'react-window'
import useSWRSubscription from "swr/subscription"
import { ProtoPath, WebsocketProtoServerStream } from "../../../common/proto"
import { Error } from "../../../component/v2/loading"
import { tools } from "../../pbes/api/tools_pb"
import { Logv2 } from "../../pbes/tools/tools_pb"

const HighlightLogLine: FC<{ line: string }> = ({ line }) => {
    if (line.includes('ERROR')) return <span className="text-red-500">{line}</span>; // Red
    if (line.includes('WARN')) return <span className="text-amber-500">{line}</span>;  // Orange/Yellow
    if (line.includes('INFO')) return <span className="text-blue-500">{line}</span>;  // Blue
    if (line.includes("DEBUG")) return <span className="text-green-500">{line}</span>; // Green
    return <span className="font-mono">{line}</span>;
}

const Row = ({ index, style, data }: RowComponentProps<{ data: string[] }>) => {
    const { width, ...restStyle } = style;
    return (
        <div style={{
            ...restStyle,
            width: 'max-content'
        }} className="text-[13px] leading-5 flex items-center pl-4 font-mono">
            {data[index] && <HighlightLogLine line={data[index]} />}
        </div>
    );
};

const processStream = (rs: Logv2[], prev?: string[]): string[] => {
    const newLogs = rs.flatMap(r => r.log).reverse();
    const combined = [...newLogs, ...(prev ?? [])];

    if (combined.length > 10000) {
        return combined.slice(0, 10000);
    }
    return combined;
}

export default function LogComponent() {
    const [searchTerm, setSearchTerm] = useState('');
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
        return log.filter(line => line.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [log, searchTerm]);

    if (log_error) { return <Error statusCode={log_error.code} title={log_error.msg} /> }

    return (
        <MainContainer className="h-full flex flex-col">
            <Card className="flex-1 mb-0 flex flex-col overflow-hidden">
                <CardHeader className="py-3">
                    <div className="flex justify-between items-center w-full gap-3">
                        <IconBox icon={Terminal} color="#f59e0b" title="Live Logcat" description="Real-time system events" />
                        <div className="flex items-center gap-2 flex-grow">
                            <FilterSearch onEnter={setSearchTerm} className='flex-grow' />
                            <Badge variant="warning" pill className="text-[0.7rem] px-2 py-1">
                                <Radio className="mr-1" size={12} />LIVE
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardBody className="p-0 bg-gray-100 dark:bg-[#18181b] flex-1 overflow-hidden rounded-b-[inherit]">
                    <div className="h-full w-full rounded-[inherit] font-mono">
                        <List
                            rowCount={filteredLog.length}
                            rowHeight={20}
                            rowComponent={Row}
                            rowProps={{ data: filteredLog }}
                        />
                    </div>
                </CardBody>
            </Card>
        </MainContainer>
    );
}