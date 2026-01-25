"use client"

import { useDelay } from "@/common/hooks"
import { Card, CardBody, CardHeader, FilterSearch, IconBox, MainContainer } from '@/component/v2/card'
import { create } from "@bufbuild/protobuf"
import { EmptySchema } from "@bufbuild/protobuf/wkt"
import { FC, useMemo, useState } from "react"
import { Broadcast, Terminal } from 'react-bootstrap-icons'
import { List, type RowComponentProps } from 'react-window'
import useSWRSubscription from "swr/subscription"
import { ProtoPath, WebsocketProtoServerStream } from "../../../common/proto"
import { Error } from "../../../component/v2/loading"
import { tools } from "../../pbes/api/tools_pb"
import { Logv2 } from "../../pbes/tools/tools_pb"

const HighlightLogLine: FC<{ line: string }> = ({ line }) => {
    if (line.includes('ERROR')) return <span style={{ color: '#ff4d4f' }}>{line}</span>; // Red
    if (line.includes('WARN')) return <span style={{ color: '#faad14' }}>{line}</span>;  // Orange/Yellow
    if (line.includes('INFO')) return <span style={{ color: '#1890ff' }}>{line}</span>;  // Blue
    if (line.includes("DEBUG")) return <span style={{ color: '#52c41a' }}>{line}</span>; // Green
    return <span className="font-monospace">{line}</span>;
}

const Row = ({ index, style, data }: RowComponentProps<{ data: string[] }>) => {
    const { width, ...restStyle } = style;
    return (
        <div style={{
            ...restStyle,
            width: 'max-content',
            fontSize: '13px',
            lineHeight: '20px',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: '1rem'
        }} className="font-monospace">
            {data[index] && <HighlightLogLine line={data[index]} />}
        </div>
    );
};

export default function LogComponent() {
    const [searchTerm, setSearchTerm] = useState('');
    const shouldFetch = useDelay(1000);

    const processStream = (r: Logv2, prev?: string[]): string[] => {
        if (prev === undefined) prev = []
        const combined = [...r.log.reverse(), ...prev];
        if (combined.length > 10000) {
            return combined.slice(0, 10000);
        }
        return combined;
    }

    const { data: log, error: log_error } =
        useSWRSubscription(
            shouldFetch ? ProtoPath(tools.method.log) : null,
            WebsocketProtoServerStream(tools.method.logv2, create(EmptySchema, {}), processStream),
            {}
        )

    const filteredLog = useMemo(() => {
        if (!log) return [];
        if (!searchTerm) return log;
        return log.filter(line => line.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [log, searchTerm]);

    if (log_error) { return <Error statusCode={log_error.code} title={log_error.msg} /> }

    return (
        <MainContainer style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Card style={{ flex: 1, marginBottom: '0px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <CardHeader className="py-3">
                    <div className="d-flex justify-content-between align-items-center w-100 gap-3">
                        <IconBox icon={Terminal} color="#f59e0b" title="Live Logcat" description="Real-time system events" />
                        <div className="d-flex align-items-center gap-2 flex-grow-1">
                            <FilterSearch onEnter={setSearchTerm} className='flex-grow-1' />
                            <span className="badge bg-warning bg-opacity-10 text-warning px-2 py-1 rounded-pill" style={{ fontSize: '0.7rem' }}>
                                <Broadcast className="me-1" />LIVE
                            </span>
                        </div>
                    </div>
                </CardHeader>
                <CardBody className="p-0 bg-body-tertiary" style={{ flex: 1, overflow: 'hidden', borderBottomLeftRadius: 'inherit', borderBottomRightRadius: 'inherit' }}>
                    <div style={{ height: '100%', width: '100%', borderRadius: 'inherit' }} className="font-monospace">
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