"use client"

import { useDelay } from "@/common/hooks"
import { FetchProtobuf, ProtoPath, WebsocketProtoServerStream } from "@/common/proto"
import { Button } from "@/component/v2/button"
import { IconBadge } from "@/component/v2/card"
import Loading from "@/component/v2/loading"
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal"
import { Spinner } from "@/component/v2/spinner"
import { GlobalToastContext } from "@/component/v2/toast"
import { ToggleGroup, ToggleItem } from "@/component/v2/togglegroup"
import { ConnectionInfo, FlowContainer, formatBytes } from "@/docs/connections/components"
import { connections, notify_data, notify_remove_connectionsSchema } from "@/docs/pbes/api/statistic_pb"
import { connection, connectionSchema, type } from "@/docs/pbes/statistic/config_pb"
import { create } from "@bufbuild/protobuf"
import { EmptySchema } from "@bufbuild/protobuf/wkt"
import { clsx } from "clsx"
import { AnimatePresence, motion } from 'motion/react'
import { ArrowDown, ArrowUp, Network, Power, ShieldCheck, Tag } from 'lucide-react'
import React, { FC, useCallback, useContext, useMemo, useState } from "react"
import useSWRSubscription from 'swr/subscription'
import { NodeModal } from "../../node/modal"
import { mode } from "../../pbes/config/bypass_pb"


// Merged connection type that combines connection data with counter data
interface MergedConnection {
    conn: connection
    download: string
    upload: string
    rawDownload: bigint
    rawUpload: bigint
}

// State stored as a Map for O(1) lookups
type ConnectionsState = { [key: string]: MergedConnection }

// Action types for the reducer
type ConnectionAction =
    | { type: 'NOTIFY'; data: notify_data[] }
    | { type: 'UPDATE_COUNTERS'; counters: { [key: string]: { download: bigint; upload: bigint } } }
    | { type: 'RESET' }

const connectionsReducer = (state: ConnectionsState, action: ConnectionAction): ConnectionsState => {
    switch (action.type) {
        case 'NOTIFY': {
            const next = { ...state }
            for (const r of action.data) {
                switch (r.data.case) {
                    case "notifyNewConnections": {
                        r.data.value.connections.forEach((conn: connection) => {
                            const key = conn.id.toString()
                            const existing = state[key]
                            next[key] = {
                                conn,
                                download: existing?.download ?? "0B",
                                upload: existing?.upload ?? "0B",
                                rawDownload: existing?.rawDownload ?? BigInt(0),
                                rawUpload: existing?.rawUpload ?? BigInt(0),
                            }
                        })
                        break
                    }
                    case "notifyRemoveConnections": {
                        r.data.value.ids.forEach((id: bigint) => {
                            delete next[id.toString()]
                        })
                        break
                    }
                }
            }
            return next
        }
        case 'UPDATE_COUNTERS': {
            const { counters } = action
            let hasChange = false
            const next = { ...state }

            for (const key in counters) {
                const existing = state[key]
                if (!existing) continue

                const c = counters[key]
                const download = formatBytes(Number(c.download))
                const upload = formatBytes(Number(c.upload))

                if (existing.download !== download || existing.upload !== upload) {
                    next[key] = {
                        ...existing,
                        download,
                        upload,
                        rawDownload: c.download,
                        rawUpload: c.upload,
                    }
                    hasChange = true
                }
            }

            return hasChange ? next : state
        }
        case 'RESET': {
            return {}
        }
        default:
            return state
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
    const [connsMap, dispatch] = React.useReducer(connectionsReducer, {})
    const subscriptionId = React.useId()

    // Process WebSocket stream - dispatches actions
    const processStream = useCallback((rs: notify_data[], _prev?: boolean): boolean => {
        dispatch({ type: 'NOTIFY', data: rs })
        return true
    }, [])

    // Handle disconnect - reset state
    const onDisconnect = useCallback(() => {
        dispatch({ type: 'RESET' })
    }, [])

    // Callback for FlowContainer - only updates changed counter fields
    const updateCounters = useCallback((cc: { [key: string]: { download: bigint; upload: bigint } }) => {
        dispatch({ type: 'UPDATE_COUNTERS', counters: cc })
    }, [])

    const subscribe = useMemo(() =>
        WebsocketProtoServerStream(connections.method.notify, create(EmptySchema, {}), processStream, { onDisconnect }),
        [processStream, onDisconnect]
    )

    const { data: isConnected, error: conn_error } =
        useSWRSubscription(
            shouldFetch ? `${ProtoPath(connections.method.notify)}#${subscriptionId}` : null,
            subscribe,
            {}
        )

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

    return (
        <div>
            <NodeModal
                editable={false}
                show={nodeModal.show}
                hash={nodeModal.hash}
                onHide={() => setNodeModal(prev => { return { ...prev, show: false } })}
            />

            <FlowContainer onUpdate={updateCounters} />

            <InfoOffcanvas
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
                conns={connsMap}
                setInfo={setInfo}
                conn_error={conn_error}
                sortFields={sortBy || "id"}
                sortOrder={sortOrder}
                isLoading={isConnected === undefined && !conn_error}
            />
        </div>
    );
}

const ConnectionListComponent: FC<{
    conns: { [key: string]: MergedConnection },
    setInfo: (info: { info: connection, show: boolean }) => void
    conn_error?: { code: number, msg: string },
    sortFields?: string,
    sortOrder?: "asc" | "desc",
    isLoading?: boolean,
}> = ({ conns, conn_error, setInfo, sortFields, sortOrder, isLoading }) => {

    const connValues = useMemo(() => Object.values(conns ?? {}), [conns])

    // Sort by traffic (uses rawDownload/rawUpload from merged state)
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

    // Sort by static fields (id, name)
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

    const handleSelect = useCallback((conn: connection) => {
        setInfo({ info: conn, show: true })
    }, [setInfo])

    if (conn_error !== undefined) return <Loading code={conn_error.code}>{conn_error.msg}</Loading>
    if (isLoading) return <Loading />

    return <ul className="flex flex-col p-0 m-0 mb-8 overflow-hidden rounded-sidebar-radius border border-sidebar-border bg-sidebar-bg shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)]">
        <AnimatePresence initial={false} mode="popLayout">
            {
                values.map((e) => (
                    <motion.li
                        key={e.conn.id}
                        className="flex flex-col items-start md:flex-row md:justify-between px-4 py-3 border-b border-sidebar-border transition-colors duration-200 cursor-pointer hover:bg-sidebar-hover last:border-b-0"
                        onClick={() => handleSelect(e.conn)}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                        <ListItemContent data={e} />
                    </motion.li>
                ))
            }
        </AnimatePresence>
    </ul>
}

const ConnectionList = React.memo(ConnectionListComponent)


// Static inner content - memoized separately to avoid re-renders
const ListItemContent: FC<{ data: MergedConnection }> = React.memo(({ data }) => {
    const { conn, download, upload } = data
    return (
        <>
            <div className="flex flex-col">
                <code className="font-mono text-xs text-sidebar-color">{conn.id.toString()}</code>
                <span className="font-medium text-md">{conn.addr}</span>
            </div>

            <div className="flex flex-col items-start gap-2 md:items-end md:mt-0">
                <FlowBadge download={download} upload={upload} />
                <div className="flex gap-2 items-center flex-wrap text-xs md:mt-0">
                    <IconBadge icon={ShieldCheck} text={mode[conn.mode]} />
                    <IconBadge icon={Network} text={type[conn.type?.connType ?? 0]} />
                    {conn.tag && <IconBadge icon={Tag} text={conn.tag} />}
                </div>
            </div>
        </>
    )
})

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

const InfoOffcanvasComponent: FC<{
    data: connection,
    show: boolean,
    onClose: () => void,
    showNodeModal?: (hash: string) => void
}> = ({ data, show, onClose: handleClose, showNodeModal }) => {
    const ctx = useContext(GlobalToastContext);
    const [closing, setClosing] = useState(false);

    const closeConnection = useCallback(() => {
        setClosing(true)
        FetchProtobuf(
            connections.method.close_conn,
            create(notify_remove_connectionsSchema, { ids: [data.id] }),
        ).then(({ error }) => {
            if (error) ctx.Error(`code ${data.id} failed, ${error.code}| ${error.msg}`)
            else handleClose()
        }).finally(() => { setClosing(false) })
    }, [setClosing, data.id, ctx])

    return (
        <Modal open={show} onOpenChange={(open) => !open && handleClose()}>
            <ModalContent>
                <ModalHeader closeButton>
                    <ModalTitle className="text-lg font-bold">
                        Connection Details
                    </ModalTitle>
                </ModalHeader>

                <ModalBody className="pt-2">
                    <ConnectionInfo value={data} showNodeModal={showNodeModal} />
                </ModalBody>

                <ModalFooter className="border-t-0 pt-0 pb-3 px-3">
                    <Button
                        variant="danger"
                        className="w-full py-2 flex items-center justify-center notranslate"
                        disabled={closing}
                        onClick={closeConnection}
                    >
                        {closing ? (
                            <>
                                <Spinner
                                    size="sm"
                                    className="mr-2"
                                />
                                Disconnecting...
                            </>
                        ) : (
                            <>
                                <Power className="text-xl mr-2" />
                                <span className="font-bold">Disconnect</span>
                            </>
                        )}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

const InfoOffcanvas = React.memo(InfoOffcanvasComponent)

export default Connections;