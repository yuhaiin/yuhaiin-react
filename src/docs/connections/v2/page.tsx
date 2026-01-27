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
import { connections, counter, notify_data, notify_remove_connectionsSchema } from "@/docs/pbes/api/statistic_pb"
import { connection, connectionSchema, type } from "@/docs/pbes/statistic/config_pb"
import { create } from "@bufbuild/protobuf"
import { EmptySchema } from "@bufbuild/protobuf/wkt"
import { clsx } from "clsx"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowDown, ArrowUp, Network, Power, ShieldCheck, Tag } from 'lucide-react'
import React, { FC, useCallback, useContext, useMemo, useState } from "react"
import useSWRSubscription from 'swr/subscription'
import { NodeModal } from "../../node/modal"
import { mode } from "../../pbes/config/bypass_pb"


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

function Connections() {
    const [counters, setCounters] = useState<{ [key: string]: counter }>({});
    const [info, setInfo] = useState<{ info: connection, show: boolean }>({
        info: create(connectionSchema, {}), show: false
    });

    const hideInfo = useCallback(() => {
        setInfo(prev => { return { ...prev, show: false } })
    }, [])

    const shouldFetch = useDelay(400)


    const { data: conns, error: conn_error } =
        useSWRSubscription(
            shouldFetch ? ProtoPath(connections.method.notify) : null,
            WebsocketProtoServerStream(connections.method.notify, create(EmptySchema, {}), processStream),
            {}
        )


    const updateCounters = useCallback((cc: { [key: string]: counter }) => {
        setCounters(cc)
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
                            <ArrowUp size={16} /> Asc
                        </ToggleItem>
                        <ToggleItem value="desc">
                            <ArrowDown size={16} /> Desc
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

            <ConnectionList conns={conns ?? {}} counters={counters} setInfo={setInfo} conn_error={conn_error} sortFields={sortBy || "id"} sortOrder={sortOrder} />
        </div>
    );
}

const ConnectionListComponent: FC<{
    conns: { [key: string]: connection },
    counters: { [key: string]: counter },
    setInfo: (info: { info: connection, show: boolean }) => void
    conn_error?: { code: number, msg: string },
    sortFields?: string,
    sortOrder?: "asc" | "desc"
}> = ({ conns, counters, conn_error, setInfo, sortFields, sortOrder }) => {


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
            return 0
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

    const handleSelect = useCallback((conn: connection) => {
        setInfo({ info: conn, show: true })
    }, [setInfo])

    if (conn_error !== undefined) return <Loading code={conn_error.code}>{conn_error.msg}</Loading>
    if (conns === undefined) return <Loading />

    return <ul className="flex flex-col p-0 m-0 mb-8 overflow-hidden rounded-sidebar-radius border border-sidebar-border bg-sidebar-bg shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)]">
        <AnimatePresence initial={false} mode="popLayout">
            {
                values.map((e) => {
                    return <ListItem
                        data={e}
                        download={Number(counters[e.id.toString()]?.download ?? 0)}
                        upload={Number(counters[e.id.toString()]?.upload ?? 0)}
                        key={e.id}
                        onSelect={handleSelect}
                    />
                })
            }
        </AnimatePresence>
    </ul>
}

const ConnectionList = React.memo(ConnectionListComponent)


const ListItemComponent: FC<{ data: connection, download: number, upload: number, onSelect?: (conn: connection) => void }> =
    ({ data, download, upload, onSelect }) => {
        return (
            <motion.li
                className="flex flex-col items-start md:flex-row md:justify-between px-6 py-4 border-b border-sidebar-border transition-colors duration-200 cursor-pointer hover:bg-sidebar-hover last:border-b-0"
                onClick={() => onSelect?.(data)}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
                <div className="flex flex-col">
                    <code className="font-mono text-sm text-sidebar-color">{data.id.toString()}</code>
                    <span className="font-medium">{data.addr}</span>
                </div>

                <div className="flex flex-col items-start gap-2 mt-2 md:items-end md:mt-0">
                    <FlowBadge download={download} upload={upload} />
                    <div className="flex gap-2 items-center flex-wrap text-sm mt-1 md:mt-0">
                        <IconBadge icon={ShieldCheck} text={mode[data.mode]} />
                        <IconBadge icon={Network} text={type[data.type?.connType ?? 0]} />
                        {data.tag && <IconBadge icon={Tag} text={data.tag} />}
                    </div>
                </div>
            </motion.li>
        );
    }

const ListItem = React.memo(ListItemComponent)

const FlowBadgeComponent: FC<{ download: number, upload: number }> = ({ download, upload }) => {
    return <div className="flex gap-2">
        <span className={clsx(
            "rounded-full flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium",
            "bg-slate-100 text-slate-500 dark:bg-[#2b2b40] dark:text-[#a6a6c0]"
        )}>
            <ArrowDown size={12} className="mr-1" />
            {formatBytes(download)}
        </span>
        <span className={clsx(
            "rounded-full flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium",
            "bg-slate-100 text-slate-500 dark:bg-[#2b2b40] dark:text-[#a6a6c0]"
        )}>
            <ArrowUp size={12} className="mr-1" />
            {formatBytes(upload)}
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