"use client"

import { useDelay } from "@/common/hooks"
import { ProtoPath, WebsocketProtoServerStream } from "@/common/proto"
import { IconBadge } from "@/component/v2/card"
import Loading from "@/component/v2/loading"
import { ToggleGroup, ToggleItem } from "@/component/v2/togglegroup"
import { ConnectionInfo, FlowCard, formatBytes, useFlow, FlowContainer } from "@/docs/connections/components"
import { connections, counter, notify_data, notify_remove_connectionsSchema } from "@/docs/pbes/api/statistic_pb"
import { mode } from "@/docs/pbes/config/bypass_pb"
import { connection, connectionSchema, type } from "@/docs/pbes/statistic/config_pb"
import { create } from "@bufbuild/protobuf"
import { EmptySchema, StringValueSchema } from "@bufbuild/protobuf/wkt"
import { clsx } from "clsx"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowDown, ArrowUp, Network, Power, ShieldCheck, Tag } from 'lucide-react'
import React, { FC, useCallback, useEffect, useMemo, useReducer, useState, useContext } from "react"
import useSWRSubscription from 'swr/subscription'
import { NodeModal } from "../../node/modal"
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal"
import { Button } from "@/component/v2/button"
import { Spinner } from "@/component/v2/spinner"
import { GlobalToastContext } from "@/component/v2/toast"
import { FetchProtobuf } from "@/common/proto"

type ConnItem = {
    conn: connection,
    download: string,
    upload: string,
    rawDownload: bigint,
    rawUpload: bigint
}

type ConnMap = {
    [id: string]: ConnItem
}

type Action =
    | { type: 'WS_BATCH', batch: notify_data[] }
    | { type: 'UPDATE_TRAFFIC', counters: { [key: string]: counter } }

const connReducer = (state: ConnMap, action: Action): ConnMap => {
    switch (action.type) {
        case 'WS_BATCH': {
            const next = { ...state }
            for (const r of action.batch) {
                switch (r.data.case) {
                    case "notifyNewConnections":
                        r.data.value.connections.forEach((e) => {
                             next[e.id.toString()] = {
                                 conn: e,
                                 download: "0B", upload: "0B",
                                 rawDownload: BigInt(0), rawUpload: BigInt(0)
                             }
                        })
                        break
                    case "notifyRemoveConnections":
                        r.data.value.ids.forEach((e) => { delete next[e.toString()] })
                        break
                }
            }
            return next
        }
        case 'UPDATE_TRAFFIC': {
            const next = { ...state }
            let hasChange = false
            for (const key in action.counters) {
                if (next[key]) {
                    const c = action.counters[key]
                    const download = formatBytes(Number(c.download))
                    const upload = formatBytes(Number(c.upload))
                    if (next[key].download !== download || next[key].upload !== upload) {
                        next[key] = {
                            ...next[key],
                            download,
                            upload,
                            rawDownload: c.download,
                            rawUpload: c.upload
                        }
                        hasChange = true
                    }
                }
            }
            return hasChange ? next : state
        }
    }
    return state
}

const ConnectionMonitor: FC<{
    setInfo: (info: { info: connection, show: boolean }) => void,
    sortBy: string,
    sortOrder: "asc" | "desc",
    children?: React.ReactNode
}> = ({ setInfo, sortBy, sortOrder, children }) => {
    const shouldFetch = useDelay(400)
    const [connMap, dispatch] = useReducer(connReducer, {})

    const { error: conn_error } = useSWRSubscription(
        shouldFetch ? ProtoPath(connections.method.notify) : null,
        (key, options) => {
             return WebsocketProtoServerStream(connections.method.notify, create(EmptySchema, {}),
                (batch) => {
                    dispatch({ type: 'WS_BATCH', batch })
                    return []
                }
             )(key, options)
        },
        {}
    )

    const updateCounters = useCallback((counters: { [key: string]: counter }) => {
        dispatch({ type: 'UPDATE_TRAFFIC', counters })
    }, [])

    return (
        <>
            <FlowContainer onUpdate={updateCounters} />
            {children}
            <ConnectionList
                connMap={connMap}
                setInfo={setInfo}
                conn_error={conn_error}
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

    return (
        <div>
            <NodeModal
                editable={false}
                show={nodeModal.show}
                hash={nodeModal.hash}
                onHide={() => setNodeModal(prev => { return { ...prev, show: false } })}
            />

            <InfoOffcanvas
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
            </ConnectionMonitor>
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

    const connValues = useMemo(() => Object.values(connMap ?? {}), [connMap])

    const sortedValues = useMemo(() => {
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
                case "name":
                    return a.conn.addr < b.conn.addr ? first : second
                default: // id
                    return a.conn.id < b.conn.id ? first : second
            }
        })
    }, [connValues, sortFields, sortOrder])

    const handleSelect = useCallback((conn: connection) => {
        setInfo({ info: conn, show: true })
    }, [setInfo])

    if (conn_error !== undefined) return <Loading code={conn_error.code}>{conn_error.msg}</Loading>
<<<<<<< HEAD

=======

>>>>>>> origin/jules-553909422092277362-c663bd9f
    return <ul className="flex flex-col p-0 m-0 mb-8 overflow-hidden rounded-sidebar-radius border border-sidebar-border bg-sidebar-bg shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)]">
        <AnimatePresence initial={false} mode="popLayout">
            {
                sortedValues.map((e) => {
                    return <ListItem
                        key={e.conn.id.toString()}
                        data={e.conn}
                        download={e.download}
                        upload={e.upload}
                        onSelect={handleSelect}
                    />
                })
            }
        </AnimatePresence>
    </ul>
}

const ConnectionList = React.memo(ConnectionListComponent)


const ListItemComponent: FC<{ data: connection, download: string, upload: string, onSelect?: (conn: connection) => void }> =
    ({ data, download, upload, onSelect }) => {
        return (
            <motion.li
                className="flex flex-col items-start md:flex-row md:justify-between px-4 py-3 border-b border-sidebar-border transition-colors duration-200 cursor-pointer hover:bg-sidebar-hover last:border-b-0"
                onClick={() => onSelect?.(data)}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
                <div className="flex flex-col">
                    <code className="font-mono text-xs text-sidebar-color">{data.id.toString()}</code>
                    <span className="font-medium text-md">{data.addr}</span>
                </div>

                <div className="flex flex-col items-start gap-2 md:items-end md:mt-0">
                    <FlowBadge download={download} upload={upload} />
                    <div className="flex gap-2 items-center flex-wrap text-xs md:mt-0">
                        <IconBadge icon={ShieldCheck} text={mode[data.mode]} />
                        <IconBadge icon={Network} text={type[data.type?.connType ?? 0]} />
                        {data.tag && <IconBadge icon={Tag} text={data.tag} />}
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
