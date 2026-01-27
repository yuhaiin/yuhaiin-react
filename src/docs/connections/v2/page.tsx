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
import { AnimatePresence, motion } from "framer-motion"
import { ArrowDown, ArrowUp, Network, Power, ShieldCheck, Tag } from 'lucide-react'
import React, { FC, useCallback, useContext, useMemo, useState } from "react"
import useSWRSubscription from 'swr/subscription'
import { NodeModal } from "../../node/modal"
import { mode } from "../../pbes/config/bypass_pb"
import styles from './connections.module.css'


const processStream = (r: notify_data, prev?: { [key: string]: connection }): { [key: string]: connection } => {
    let data: { [key: string]: connection };
    if (prev === undefined) data = {}
    else data = { ...prev }

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

    return <ul className={styles['connections-list']}>
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
                className={styles['list-item']}
                onClick={() => onSelect?.(data)}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
                <div className={styles['item-main']}>
                    <code className={styles['item-id']}>{data.id.toString()}</code>
                    <span className={styles['item-addr']}>{data.addr}</span>
                </div>

                <div className={styles['item-details-right']}>
                    <FlowBadge download={download} upload={upload} />
                    <div className={styles['item-details']}>
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
    // Replaced React-Bootstrap Badge with HTML span and bootstrap classes
    return <div className="d-flex gap-2">
        <span className="badge rounded-pill text-bg-secondary d-flex align-items-center gap-1">
            <span className={`${styles['badge-icon']}`}><ArrowDown size={12} /></span>
            {formatBytes(download)}
        </span>
        <span className="badge rounded-pill text-bg-primary d-flex align-items-center gap-1">
            <span className={`${styles['badge-icon']}`}><ArrowUp size={12} /></span>
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
                    <ModalTitle className="h5 fw-bold">
                        Connection Details
                    </ModalTitle>
                </ModalHeader>

                <ModalBody className="pt-2">
                    <ConnectionInfo value={data} showNodeModal={showNodeModal} />
                </ModalBody>

                <ModalFooter className="border-top-0 pt-0 pb-3 px-3">
                    <Button
                        variant="danger"
                        className="w-100 py-2 d-flex align-items-center justify-content-center notranslate"
                        disabled={closing}
                        onClick={closeConnection}
                    >
                        {closing ? (
                            <>
                                <Spinner
                                    size="sm"
                                    className="me-2"
                                />
                                Disconnecting...
                            </>
                        ) : (
                            <>
                                <Power className="fs-5 me-2" />
                                <span className="fw-bold">Disconnect</span>
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