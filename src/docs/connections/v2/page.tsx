"use client"

import { useDelay } from "@/common/hooks"
import { ProtoPath, WebsocketProtoServerStream } from "@/common/proto"
import { IconBadge } from "@/component/v2/card"
import Loading from "@/component/v2/loading"
import { ToggleGroup, ToggleItem } from "@/component/v2/togglegroup"
import { FlowContainer, formatBytes } from "@/docs/connections/components"
import { connections, counter, notify_data } from "@/docs/pbes/api/statistic_pb"
import { mode } from "@/docs/pbes/config/bypass_pb"
import { connection, connectionSchema, type } from "@/docs/pbes/statistic/config_pb"
import { create } from "@bufbuild/protobuf"
import { EmptySchema } from "@bufbuild/protobuf/wkt"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowDown, ArrowUp, Network, ShieldCheck, Tag } from 'lucide-react'
import React, { FC, useCallback, useMemo, useState } from "react"
import useSWRSubscription from 'swr/subscription'
import { NodeModal } from "../../node/modal"
import styles from './connections.module.css'
import { InfoModal } from "./info"


const processStream = (rs: notify_data[], prev?: { [key: string]: connection }): { [key: string]: connection } => {
    let data: { [key: string]: connection };
    if (prev === undefined) data = {}
    else data = { ...prev }

    for (const r of rs) {
        switch (r.data.case) {
            case "notifyNewConnections":
                r.data.value.
                    connections.
                    sort((a, b) => a.id > b.id ? 1 : -1).
                    forEach((e: connection) => { data[e.id.toString()] = e })
                break
            case "notifyRemoveConnections":
                r.data.value.ids.forEach((e: bigint) => { delete data[e.toString()] })
                break
        }
    }

    return data
}

const ConnectionMonitor: FC<{
    setInfo: (info: { info: connection, show: boolean }) => void,
    sortBy: string,
    sortOrder: "asc" | "desc",
    children?: React.ReactNode
}> = ({ setInfo, children }) => {
    const [counters, setCounters] = useState<{
        [key: string]: {
            download: string,
            upload: string,
            rawDownload: bigint,
            rawUpload: bigint
        }
    }>({});

    const updateCounters = useCallback((cc: { [key: string]: counter }) => {
        setCounters(prev => {
            let hasChange = false
            const next = { ...prev }

            for (const key in cc) {
                const c = cc[key]
                const p = prev[key]
                const download = formatBytes(Number(c.download))
                const upload = formatBytes(Number(c.upload))

                if (!p || p.upload !== upload || p.download !== download) {
                    next[key] = {
                        download,
                        upload,
                        rawDownload: c.download,
                        rawUpload: c.upload,
                    }
                    hasChange = true
                }
            }

            for (const key in prev) {
                if (!Object.prototype.hasOwnProperty.call(cc, key)) {
                    delete next[key]
                    hasChange = true
                }
            }

            return hasChange ? next : prev
        })
    }, [])

    const notifyRequest = useMemo(() => create(EmptySchema, {}), [])
    const subscribe = useMemo(() => WebsocketProtoServerStream(connections.method.notify, notifyRequest, processStream), [notifyRequest])


    const shouldFetch = useDelay(400)
    const { data: conns, error: conn_error } =
        useSWRSubscription(
            shouldFetch ? ProtoPath(connections.method.notify) : null,
            subscribe,
            {}
        )

    return (
        <>
            <FlowContainer onUpdate={updateCounters} />
            {children}
            <ConnectionList
                conns={conns ?? {}}
                setInfo={setInfo}
                conn_error={conn_error}
                isLoading={conns === undefined}
                counters={counters}
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

            <ConnectionMonitor
                setInfo={setInfo}
                sortBy={sortBy}
                sortOrder={sortOrder}
            >
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
            </ConnectionMonitor>
        </div>
    );
}

const ConnectionListComponent: FC<{
    conns: { [key: string]: connection },
    setInfo: (info: { info: connection, show: boolean }) => void
    conn_error?: { code: number, msg: string },
    isLoading?: boolean,
    counters: {
        [key: string]: {
            download: string,
            upload: string,
            rawDownload: bigint,
            rawUpload: bigint
        }
    }
    sortFields?: string,
    sortOrder?: "asc" | "desc"
}> = ({ conns, conn_error, setInfo, isLoading, counters, sortFields, sortOrder }) => {
    const connValues = useMemo(() => Object.values(conns ?? {}), [conns])

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
                    const ad = counters[a.id.toString()]?.download ?? 0
                    const bd = counters[b.id.toString()]?.download ?? 0
                    return ad < bd ? first : second
                case "upload":
                    const au = counters[a.id.toString()]?.upload ?? 0
                    const bu = counters[b.id.toString()]?.upload ?? 0
                    return au < bu ? first : second
            }
        })
    }, [connValues, counters, sortFields, sortOrder])

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
                return a.addr < b.addr ? first : second
            }

            return a.id < b.id ? first : second
        })
    }, [connValues, sortFields, sortOrder])

    const values = (sortFields === "download" || sortFields === "upload") ? trafficSorted : staticSorted

    const handleSelect = useCallback((conn: bigint) => {
        setInfo({ info: values.find(v => v.id === conn) ?? ({} as connection), show: true })
    }, [setInfo])

    if (conn_error !== undefined) return <Loading code={conn_error.code}>{conn_error.msg}</Loading>
    if (isLoading) return <Loading />

    return <ul className={styles['connections-list']}>
        <AnimatePresence initial={false} mode="popLayout">
            {
                values.map((e) => {
                    const c = counters[e.id.toString()]
                    return <ListItem
                        key={e.id}
                        id={e.id}
                        download={c?.download ?? "0B"}
                        upload={c?.upload ?? "0B"}
                        onSelect={handleSelect}
                        addr={e.addr.toString()}
                        network={type[e.type?.connType ?? 0]}
                        tag={e.tag}
                        bMode={mode[e.mode]}
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
    onSelect?: (c: bigint) => void,
    download: string,
    upload: string
}> =
    ({ onSelect, download, upload, addr, network, tag, bMode, id }) => {
        return (
            <motion.li
                className={styles['list-item']}
                onClick={() => onSelect?.(id)}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
                <div className={styles['item-main']}>
                    <code className={styles['item-id']}>{id.toString()}</code>
                    <span className={styles['item-addr']}>{addr}</span>
                </div>

                <div className={styles['item-details-right']}>
                    <ConnectedFlowBadge download={download} upload={upload} />
                    <StaticBadges bMode={bMode} network={network} tag={tag} />
                </div>
            </motion.li>
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