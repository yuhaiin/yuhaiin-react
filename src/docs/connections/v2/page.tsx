"use client"

import { useDelay } from "@/common/hooks"
import { ProtoPath, WebsocketProtoServerStream } from "@/common/proto"
import { IconBadge } from "@/component/v2/card"
import Loading from "@/component/v2/loading"
import { ToggleGroup, ToggleItem } from "@/component/v2/togglegroup"
import { FlowCard, useFlow } from "@/docs/connections/components"
import { connections, counter, notify_data } from "@/docs/pbes/api/statistic_pb"
import { mode } from "@/docs/pbes/config/bypass_pb"
import { connection, connectionSchema, type } from "@/docs/pbes/statistic/config_pb"
import { create } from "@bufbuild/protobuf"
import { EmptySchema } from "@bufbuild/protobuf/wkt"
import { clsx } from "clsx"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowDown, ArrowUp, Network, ShieldCheck, Tag } from 'lucide-react'
import React, { FC, useCallback, useEffect, useMemo, useReducer, useState } from "react"
import useSWRSubscription from 'swr/subscription'
import { NodeModal } from "../../node/modal"
import { InfoModal } from "./info"

type ConnItem = {
    conn: connection
    download: string
    upload: string
    rawDownload: bigint
    rawUpload: bigint
}

type ConnMap = {
    [id: string]: ConnItem
}

type ConnAction =
    | { type: 'WS_BATCH', batch: notify_data[] }
    | { type: 'UPDATE_TRAFFIC', counters: { [key: string]: counter } }

const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const connReducer = (state: ConnMap, action: ConnAction): ConnMap => {
    switch (action.type) {
        case 'WS_BATCH': {
            const next = { ...state }
            let hasChange = false
            for (const r of action.batch) {
                switch (r.data.case) {
                    case "notifyNewConnections":
                        r.data.value.connections.
                            sort((a, b) => a.id > b.id ? 1 : -1).
                            forEach((e: connection) => {
                                const key = e.id.toString()
                                const existing = next[key]
                                next[key] = {
                                    conn: e,
                                    download: existing?.download ?? "0B",
                                    upload: existing?.upload ?? "0B",
                                    rawDownload: existing?.rawDownload ?? BigInt(0),
                                    rawUpload: existing?.rawUpload ?? BigInt(0),
                                }
                                hasChange = true
                            })
                        break
                    case "notifyRemoveConnections":
                        r.data.value.ids.forEach((e: bigint) => {
                            delete next[e.toString()]
                            hasChange = true
                        })
                        break
                }
            }
            return hasChange ? next : state
        }
        case 'UPDATE_TRAFFIC': {
            let hasChange = false
            const next = { ...state }

            for (const key in action.counters) {
                const c = action.counters[key]
                const item = next[key]
                if (!item) continue

                const download = formatBytes(Number(c.download))
                const upload = formatBytes(Number(c.upload))

                if (item.download !== download || item.upload !== upload) {
                    next[key] = {
                        ...item,
                        download,
                        upload,
                        rawDownload: c.download,
                        rawUpload: c.upload
                    }
                    hasChange = true
                }
            }
            return hasChange ? next : state
        }
    }
}

function Connections() {
    const [info, setInfo] = useState<{ info: connection, show: boolean }>({
        info: create(connectionSchema, {}), show: false
    });

    const hideInfo = useCallback(() => {
        setInfo(prev => { return { ...prev, show: false } })
    }, [])

    const shouldFetch = useDelay(400)
    const [connMap, dispatch] = useReducer(connReducer, {})

    // Note: WebsocketProtoServerStream in Main expects a stream function that returns the accumulated state.
    // But here we use reducer. We can pass a dummy accumulator or modify WebsocketProtoServerStream usage.
    // Ideally we just want the stream to fire events.
    // Main's WebsocketProtoServerStream: (..., stream: (r: O[], prev: R) => R, ...)
    // It calls next(null, prev => stream(batch, prev)).
    // So we can return undefined.

    const { error: conn_error } = useSWRSubscription(
        shouldFetch ? ProtoPath(connections.method.notify) : null,
        (key, options) => {
             // We use a custom adapter here or just use the existing one but ignore return
             return WebsocketProtoServerStream(connections.method.notify, create(EmptySchema, {}),
                (batch) => {
                    dispatch({ type: 'WS_BATCH', batch })
                    return []
                }
             )(key, options)
        },
        {}
    )

    const { data: flow, error: flow_error } = useFlow()

    useEffect(() => {
        if (flow) {
            dispatch({ type: 'UPDATE_TRAFFIC', counters: flow.counters })
        }
    }, [flow])

    const [sortBy, setSortBy] = useState("id")
    const changeSortBy = useCallback((value: string) => {
        setSortBy(value)
    }, [setSortBy])


    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const changeSortOrder = useCallback((value: "asc" | "desc") => {
        setSortOrder(value)
    }, [setSortOrder])


    const [nodeModal, setNodeModal] = useState<{ show: boolean, hash: string }>({ show: false, hash: "" });
    const showNodeModal = useCallback((hash: string) => {
        setNodeModal({ show: true, hash: hash });
    }, []);

    const handleSelect = useCallback((conn: connection) => {
         setInfo({ info: conn, show: true })
    }, [])

    return (
        <div>
            <NodeModal
                editable={false}
                show={nodeModal.show}
                hash={nodeModal.hash}
                onHide={() => setNodeModal(prev => { return { ...prev, show: false } })}
            />

            <FlowCard
                download={flow?.DownloadTotalString()}
                upload={flow?.UploadTotalString()}
                download_rate={flow?.DownloadString()}
                upload_rate={flow?.UploadString()}
                flow_error={flow_error}
            />

            <InfoModal
                data={info.info}
                show={!nodeModal.show && info.show}
                onClose={hideInfo}
                showNodeModal={showNodeModal}
            />


            <div className="flex justify-end mb-3">
                <div className="flex items-center gap-3 flex-wrap">
                    <ToggleGroup className="flex-nowrap" type="single" value={sortOrder} onValueChange={(v) => v && changeSortOrder(v as "asc" | "desc")}>
                        <ToggleItem value="asc">
                            <div className="flex items-center gap-1 whitespace-nowrap"><ArrowUp size={16} /> Asc</div>
                        </ToggleItem>
                        <ToggleItem value="desc">
                            <div className="flex items-center gap-1 whitespace-nowrap"><ArrowDown size={16} /> Desc</div>
                        </ToggleItem>
                    </ToggleGroup>

                    <ToggleGroup className="flex-nowrap" type="single" value={sortBy} onValueChange={(v) => v && changeSortBy(v)}>
                        <ToggleItem value="id">Id</ToggleItem>
                        <ToggleItem value="name">Name</ToggleItem>
                        <ToggleItem value="download">Download</ToggleItem>
                        <ToggleItem value="upload">Upload</ToggleItem>
                    </ToggleGroup>
                </div>
            </div>

            <ConnectionList
                connMap={connMap}
                conn_error={conn_error}
                sortFields={sortBy || "id"}
                sortOrder={sortOrder}
                onSelect={handleSelect}
            />
        </div>
    );
}

const ConnectionListComponent: FC<{
    connMap: ConnMap,
    setInfo?: (info: { info: connection, show: boolean }) => void // Optional? No, used for select
    onSelect: (conn: connection) => void
    conn_error?: { code: number, msg: string },
    sortFields?: string,
    sortOrder?: "asc" | "desc"
}> = ({ connMap, conn_error, onSelect, sortFields, sortOrder }) => {


    const connValues = useMemo(() => Object.values(connMap), [connMap])

    const trafficSorted = useMemo(() => {
        if (sortFields !== "download" && sortFields !== "upload") return []

        return [...connValues].sort((a, b) => {
            let first = 1;
            let second = -1;

            if (sortOrder === "asc") {
                first = -1;
                second = 1;
            }

            switch (sortFields) {
                case "download":
                    return a.rawDownload < b.rawDownload ? first : second
                case "upload":
                    return a.rawUpload < b.rawUpload ? first : second
            }
            return 0
        })
    }, [connValues, sortFields, sortOrder])

    const staticSorted = useMemo(() => {
        if (sortFields === "download" || sortFields === "upload") return []

        return [...connValues].sort((a, b) => {
            let first = 1;
            let second = -1;

            if (sortOrder === "asc") {
                first = -1;
                second = 1;
            }

            if (sortFields === "name") {
                return a.conn.addr < b.conn.addr ? first : second
            }

            return a.conn.id < b.conn.id ? first : second
        })
    }, [connValues, sortFields, sortOrder])

    const values = (sortFields === "download" || sortFields === "upload") ? trafficSorted : staticSorted

    if (conn_error !== undefined) return <Loading code={conn_error.code}>{conn_error.msg}</Loading>

    return <ul className="flex flex-col p-0 m-0 mb-8 overflow-hidden rounded-sidebar-radius border border-sidebar-border bg-sidebar-bg shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)]">
        <AnimatePresence initial={false} mode="popLayout">
            {
                values.map((e) => {
                    return <ListItem
                        key={e.conn.id}
                        id={e.conn.id}
                        addr={e.conn.addr}
                        network={type[e.conn.type?.connType ?? 0]}
                        tag={e.conn.tag}
                        bMode={mode[e.conn.mode]}
                        download={e.download}
                        upload={e.upload}
                        onSelect={() => onSelect(e.conn)}
                    />
                })
            }
        </AnimatePresence>
    </ul>
}

const ConnectionList = React.memo(ConnectionListComponent)


const ListItemComponent: FC<{
    id: bigint,
    addr: string,
    network: string,
    tag: string,
    bMode: string,
    download: string,
    upload: string,
    onSelect: () => void
}> =
    ({ id, addr, network, tag, bMode, download, upload, onSelect }) => {
        return (
            <motion.li
                className="flex flex-col items-start md:flex-row md:justify-between px-4 py-3 border-b border-sidebar-border transition-colors duration-200 cursor-pointer hover:bg-sidebar-hover last:border-b-0"
                onClick={onSelect}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
                <div className="flex flex-col">
                    <code className="font-mono text-xs text-sidebar-color">{id.toString()}</code>
                    <span className="font-medium text-md">{addr}</span>
                </div>

                <div className="flex flex-col items-start gap-2 md:items-end md:mt-0">
                    <FlowBadge download={download} upload={upload} />
                    <div className="flex gap-2 items-center flex-wrap text-xs md:mt-0">
                        <IconBadge icon={ShieldCheck} text={bMode} />
                        <IconBadge icon={Network} text={network} />
                        {tag && <IconBadge icon={Tag} text={tag} />}
                    </div>
                </div>
            </motion.li>
        );
    }

const ListItem = React.memo(ListItemComponent)

const FlowBadgeComponent: FC<{ download: string, upload: string }> = ({ download, upload }) => {
    return <div className="flex gap-2">
        <span className={clsx(
            "rounded-full flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium",
            "bg-slate-100 text-slate-500 dark:bg-[#2b2b40] dark:text-[#a6a6c0]"
        )}>
            <ArrowDown size={12} className="mr-1" />
            {download}
        </span>
        <span className={clsx(
            "rounded-full flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium",
            "bg-slate-100 text-slate-500 dark:bg-[#2b2b40] dark:text-[#a6a6c0]"
        )}>
            <ArrowUp size={12} className="mr-1" />
            {upload}
        </span>
    </div>
}

const FlowBadge = React.memo(FlowBadgeComponent)

export default Connections;
