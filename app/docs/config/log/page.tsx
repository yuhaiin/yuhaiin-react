"use client"

import { create } from "@bufbuild/protobuf"
import { EmptySchema } from "@bufbuild/protobuf/wkt"
import { CSSProperties, FC } from "react"
import { List, type RowComponentProps } from 'react-window'
import useSWRSubscription from "swr/subscription"
import { Error } from "../../common/loading"
import { ProtoPath, WebsocketProtoServerStream } from "../../common/proto"
import { Logv2, tools } from "../../pbes/tools/tools_pb"

const HighlightLogLine: FC<{ line: string, style: CSSProperties }> = ({ line, style }) => {
    if (line.includes('ERROR')) {
        return <span style={{ ...style, color: 'red' }}>{line}</span>;
    }
    if (line.includes('WARN')) {
        return <span style={{ ...style, color: 'orange' }}>{line}</span>;
    }
    if (line.includes('INFO')) {
        return <span style={{ ...style, color: 'green' }}>{line}</span>;
    }
    if (line.includes("DEBUG")) {
        return <span style={{ ...style, color: 'gray' }}>{line}</span>;
    }
    return <span style={style}>{line}</span>;
}

export default function LogComponent() {
    const processStream = (r: Logv2, prev?: string[]): string[] => {
        if (prev === undefined) prev = []
        return [...r.log.reverse(), ...prev]
    }

    const { data: log, error: log_error } =
        useSWRSubscription(
            ProtoPath(tools.method.log),
            WebsocketProtoServerStream(tools.method.logv2, create(EmptySchema, {}), processStream),
            {}
        )

    if (log_error) {
        return <Error statusCode={log_error.code} title={log_error.msg} />
    }

    const Row = ({ index, style, data }: RowComponentProps<{ data: string[] }>) => (
        <HighlightLogLine style={{ ...style, fontFamily: 'monospace', whiteSpace: 'nowrap' }} line={data[index]} />
    );

    return (
        <List
            rowCount={log?.length || 0}
            rowComponent={Row}
            rowHeight={25}
            style={{ height: window.innerHeight - 90, width: "100%" }}
            rowProps={{ data: log }}
        />
    );
}
