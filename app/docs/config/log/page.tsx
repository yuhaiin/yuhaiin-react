"use client"

import { create } from "@bufbuild/protobuf"
import { EmptySchema } from "@bufbuild/protobuf/wkt"
import { FC, useMemo, useState } from "react"
import { List, type RowComponentProps } from 'react-window'
import useSWRSubscription from "swr/subscription"
import { Error } from "../../common/loading"
import { ProtoPath, WebsocketProtoServerStream } from "../../common/proto"
import { tools } from "../../pbes/api/tools_pb"
import { Logv2 } from "../../pbes/tools/tools_pb"
import styles from './log.module.css'

const HighlightLogLine: FC<{ line: string }> = ({ line }) => {
    if (line.includes('ERROR')) return <span style={{ color: 'red' }}>{line}</span>;
    if (line.includes('WARN')) return <span style={{ color: 'orange' }}>{line}</span>;
    if (line.includes('INFO')) return <span style={{ color: 'green' }}>{line}</span>;
    if (line.includes("DEBUG")) return <span style={{ color: 'gray' }}>{line}</span>;
    return <span>{line}</span>;
}

const Row = ({ index, style, data }: RowComponentProps<{ data: string[] }>) => {
    const { width, ...restStyle } = style;
    return (
        <div style={restStyle} className={styles.logEntry}>
            {data[index] && <HighlightLogLine line={data[index]} />}
        </div>
    );
};

export default function LogComponent() {
    const [searchTerm, setSearchTerm] = useState('');

    const processStream = (r: Logv2, prev?: string[]): string[] => {
        if (prev === undefined) prev = []
        const combined = [...r.log.reverse(), ...prev];
        if (combined.length > 5000) {
            return combined.slice(0, 5000);
        }
        return combined;
    }

    const { data: log, error: log_error } =
        useSWRSubscription(
            ProtoPath(tools.method.log),
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
        <main className={styles.main}>
            <div className={styles.searchContainer}>
                <div className={styles.searchWrapper}>
                    <input
                        type="text"
                        placeholder="Search logs..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.logContainer}>
                <List
                    className={styles.list}
                    rowCount={filteredLog.length}
                    rowHeight={25}
                    rowComponent={Row}
                    rowProps={{ data: filteredLog }}
                    style={{ ...styles }}
                />
            </div>
        </main>
    );
}