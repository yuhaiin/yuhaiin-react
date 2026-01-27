"use client"

import { useDelay } from "@/common/hooks"
import { WebsocketProtoServerStream } from "@/common/proto"
import { IconBadge } from "@/component/v2/card"
import Loading from "@/component/v2/loading"
import { ToggleGroup, ToggleItem } from "@/component/v2/togglegroup"
import { FlowCard, formatBytes, useFlow } from "@/docs/connections/components"
import { connections, counter, notify_data } from "@/docs/pbes/api/statistic_pb"
import { mode } from "@/docs/pbes/config/bypass_pb"
import { connection, connectionSchema, type } from "@/docs/pbes/statistic/config_pb"
import { create } from "@bufbuild/protobuf"
import { EmptySchema } from "@bufbuild/protobuf/wkt"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowDown, ArrowUp, Network, ShieldCheck, Tag } from 'lucide-react'
import React, { FC, memo, useCallback, useEffect, useMemo, useReducer, useState } from "react"
import { NodeModal } from "../../node/modal"
import styles from './connections.module.css'
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

const ConnectionMonitor: FC<{
    setInfo: (info: { info: connection, show: boolean }) => void,
    sortBy: string,
    sortOrder: "asc" | "desc",
}> = ({ setInfo, sortBy, sortOrder }) => {
    const [connMap, dispatch] = useReducer(connReducer, {})
    const [connError, setConnError] = useState<{ msg: string, code: number } | undefined>()

    const { data: flow, error: flow_error } = useFlow()

    useEffect(() => {
        if (flow) {
            dispatch({ type: 'UPDATE_TRAFFIC', counters: flow.counters })
        }
    }, [flow])

    const notifyRequest = useMemo(() => create(EmptySchema, {}), [])
    const shouldFetch = useDelay(400)

    useEffect(() => {
        if (!shouldFetch) return

        const stream = (batch: notify_data[], _prev?: any) => batch

        const subscribe = WebsocketProtoServerStream(connections.method.notify, notifyRequest, stream)

        const unsubscribe = subscribe("connections", {
            next: (err, updater) => {
                if (err) {
                    setConnError(err)
                } else if (updater) {
                    const batch = typeof updater === 'function' ? updater(undefined) : updater
                    if (batch && Array.isArray(batch)) {
                        dispatch({ type: 'WS_BATCH', batch: batch as notify_data[] })
                        setConnError(undefined)
                    }
                }
            }
        })
        return unsubscribe
    }, [shouldFetch, notifyRequest])

    return (
        <>
            <FlowCard
                download={flow?.DownloadTotalString()}
                upload={flow?.UploadTotalString()}
                download_rate={flow?.DownloadString()}
                upload_rate={flow?.UploadString()}
                flow_error={flow_error}
            />

            <ConnectionList
                connMap={connMap}
                setInfo={setInfo}
                conn_error={connError}
                sortFields={sortBy}
                sortOrder={sortOrder}
            />
        </>
    )
}

function Connections() {
    const [info, setInfo] = useState<{ info: connection, show: boolean }>({
        info: create(connectionSchema, {}), show: false
    });

    const hideInfo = useCallback(() => {
        setInfo(prev => { return { ...prev, show: false } })
    }, [])

    const [sortBy, setSortBy] = useState("id")
    const changeSortBy = useCallback((value: string) => {
        setSortBy(value)
    }, [setSortBy])


    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc"); // 'asc' | 'desc'
    const changeSortOrder = useCallback((value: "asc" | "desc") => {
        setSortOrder(value)
    }, [setSortOrder])


    const [nodeModal, setNodeModal] = useState<{ show: boolean, hash: string }>({ show: false, hash: "" });
    const showNodeModal = useCallback((hash: string) => {
        setNodeModal({ show: true, hash: hash });
    }, []);

    const hideNodeModal = useCallback(() => {
        setNodeModal(prev => { return { ...prev, show: false } })
    }, [])

    return (
        <div>
            <NodeModal
                editable={false}
                show={nodeModal.show}
                hash={nodeModal.hash}
                onHide={hideNodeModal}
            />

            <InfoModal
                data={info.info}
                show={!nodeModal.show && info.show}
                onClose={hideInfo}
                showNodeModal={showNodeModal}
            />


            <div className="d-flex justify-content-end mb-3">
                <div className="d-flex align-items-center gap-3 flex-wrap">
                    <ToggleGroup type="single" value={sortOrder} onValueChange={(v) => v && changeSortOrder(v as "asc" | "desc")}>
                        <ToggleItem value="asc">
                            <ArrowUp size={16} /> Asc
                        </ToggleItem>
                        <ToggleItem value="desc">
                            <ArrowDown size={16} /> Desc
                        </ToggleItem>
                    </ToggleGroup>

                    <ToggleGroup type="single" value={sortBy} onValueChange={(v) => v && changeSortBy(v)}>
                        <ToggleItem value="id">Id</ToggleItem>
                        <ToggleItem value="name">Name</ToggleItem>
                        <ToggleItem value="download">Download</ToggleItem>
                        <ToggleItem value="upload">Upload</ToggleItem>
                    </ToggleGroup>
                </div>
            </div>

            <ConnectionMonitor
                setInfo={setInfo}
                sortBy={sortBy}
                sortOrder={sortOrder}
            />
        </div>
    );
}

const ConnectionListComponent: FC<{
    connMap: ConnMap,
    setInfo: (info: { info: connection, show: boolean }) => void
    conn_error?: { code: number, msg: string },
    sortFields?: string,
    sortOrder?: "asc" | "desc"
}> = ({ connMap, conn_error, setInfo, sortFields, sortOrder }) => {
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

    const connMapRef = React.useRef(connMap)
    connMapRef.current = connMap

    const handleSelect = useCallback((conn: bigint) => {
        const item = connMapRef.current[conn.toString()]
        if (item) {
            setInfo({ info: item.conn, show: true })
        }
    }, [setInfo])

    if (conn_error !== undefined) return <Loading code={conn_error.code}>{conn_error.msg}</Loading>

    return <ul className={styles['connections-list']}>
        <AnimatePresence initial={false} mode="popLayout">
            {
                values.map((e) => {
                    return <motion.li
                        key={e.conn.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                        <ListItem
                            id={e.conn.id}
                            download={e.download}
                            upload={e.upload}
                            onSelect={handleSelect}
                            addr={e.conn.addr}
                            network={type[e.conn.type?.connType ?? 0]}
                            tag={e.conn.tag}
                            bMode={mode[e.conn.mode]}
                        />
                    </motion.li>
                })
            }
        </AnimatePresence>
    </ul>
}

const ConnectionList = memo(ConnectionListComponent)


const ListItemComponent: FC<{
    id: bigint,
    addr: string,
    network: string,
    tag: string,
    bMode: string,
    onSelect?: (c: bigint) => void,
    download: string,
    upload: string
}> =
    ({ onSelect, download, upload, addr, network, tag, bMode, id }) => {
        return (
            <li
                className={styles['list-item']}
                onClick={() => onSelect?.(id)}
            >
                <div className={styles['item-main']}>
                    <code className={styles['item-id']}>{id.toString()}</code>
                    <span className={styles['item-addr']}>{addr}</span>
                </div>

                <div className={styles['item-details-right']}>
                    <ConnectedFlowBadge download={download} upload={upload} />
                    <StaticBadges bMode={bMode} network={network} tag={tag} />
                </div>
            </li>
        );
    }

const StaticBadges: FC<{ bMode: string, network: string, tag?: string }> = React.memo(
    ({ bMode, network, tag }) => (
        <div className={styles['item-details']}>
            <IconBadge icon={ShieldCheck} text={bMode} />
            <IconBadge icon={Network} text={network} />
            {tag && <IconBadge icon={Tag} text={tag} />}
        </div>
    )
)

const ListItem = React.memo(ListItemComponent)

const ConnectedFlowBadge: FC<{ download: string, upload: string }> = React.memo(({ download, upload }) => {
    return <div className="d-flex gap-2">
        <span className="badge rounded-pill text-bg-secondary d-flex align-items-center gap-1">
            <span className={`${styles['badge-icon']}`}><ArrowDown size={12} /></span>
            {download}
        </span>
        <span className="badge rounded-pill text-bg-primary d-flex align-items-center gap-1">
            <span className={`${styles['badge-icon']}`}><ArrowUp size={12} /></span>
            {upload}
        </span>
    </div>
})

export default Connections;