"use client"

import Loading from "@/app/docs/common/loading";
import { FetchProtobuf, ProtoPath, WebsocketProtoServerStream } from "@/app/docs/common/proto";
import { GlobalToastContext } from "@/app/docs/common/toast";
import { ConnectionInfo, FlowContainer, formatBytes } from "@/app/docs/connections/components";
import { connections, counter, notify_data, notify_remove_connectionsSchema } from "@/app/docs/pbes/api/statistic_pb";
import { connection, connectionSchema, type } from "@/app/docs/pbes/statistic/config_pb";
import { create } from "@bufbuild/protobuf";
import { EmptySchema } from "@bufbuild/protobuf/wkt";
import React, { FC, useCallback, useContext, useMemo, useState } from "react";
import { Badge, Button, Modal, Spinner, ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import useSWRSubscription from 'swr/subscription';
import { NodeModal } from "../../node/modal";
import { mode } from "../../pbes/config/bypass_pb";
import styles from './connections.module.css';

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


    const { data: conns, error: conn_error } =
        useSWRSubscription(
            ProtoPath(connections.method.notify),
            WebsocketProtoServerStream(connections.method.notify, create(EmptySchema, {}), processStream),
            {}
        )


    const updateCounters = useCallback((cc: { [key: string]: counter }) => {
        setCounters(cc)
    }, [])

    const [sortBy, setSortBy] = useState("")
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
                onHide={() => setNodeModal({ show: false, hash: "" })}
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
                    <ToggleButtonGroup type="radio" name="sortOrder" value={sortOrder} onChange={changeSortOrder}>
                        <ToggleButton id="sort-asc" value="asc" variant="outline-secondary">
                            <i className="bi bi-sort-up"></i> Asc
                        </ToggleButton>
                        <ToggleButton id="sort-desc" value="desc" variant="outline-secondary">
                            <i className="bi bi-sort-down"></i> Desc
                        </ToggleButton>
                    </ToggleButtonGroup>

                    <ToggleButtonGroup type="radio" name="sortBy" value={sortBy} onChange={changeSortBy}>
                        <ToggleButton id="sort-id" value="" variant="outline-secondary">
                            Id
                        </ToggleButton>
                        <ToggleButton id="sort-name" value="name" variant="outline-secondary">
                            Name
                        </ToggleButton>
                        <ToggleButton id="sort-download" value="download" variant="outline-secondary">
                            Download
                        </ToggleButton>
                        <ToggleButton id="sort-upload" value="upload" variant="outline-secondary">
                            Upload
                        </ToggleButton>
                    </ToggleButtonGroup>
                </div>
            </div>

            <ConnectionList conns={conns} counters={counters} setInfo={setInfo} conn_error={conn_error} sortFields={sortBy} sortOrder={sortOrder} />
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


    const values = useMemo(() => Object.values(conns ?? {}).sort((a, b) => {
        let first = 1;
        let second = -1;

        if (sortOrder === "asc") {
            first = -1;
            second = 1;
        }

        if (sortFields) {
            switch (sortFields) {
                case "download":
                    const ad = counters[a.id.toString()]?.download ?? 0
                    const bd = counters[b.id.toString()]?.download ?? 0
                    return ad < bd ? first : second
                case "upload":
                    const au = counters[a.id.toString()]?.upload ?? 0
                    const bu = counters[b.id.toString()]?.upload ?? 0
                    return au < bu ? first : second
                case "name":
                    return a.addr < b.addr ? first : second
            }
        }

        return a.id < b.id ? first : second
    }), [conns, sortFields, counters, sortOrder])

    if (conn_error !== undefined) return <Loading code={conn_error.code}>{conn_error.msg}</Loading>
    if (conns === undefined) return <Loading />

    return <ul className={styles['connections-list']}>
        {
            values.map((e) => {
                return <ListItem
                    data={e}
                    download={Number(counters[e.id.toString()]?.download ?? 0)}
                    upload={Number(counters[e.id.toString()]?.upload ?? 0)}
                    key={e.id}
                    onClick={() => setInfo({ info: e, show: true })}
                />
            })
        }
    </ul>
}

const ConnectionList = React.memo(ConnectionListComponent)

const IconBadge: FC<{ icon: string, text: string }> = ({ icon, text }) => {
    return <Badge pill>
        <i className={`bi ${icon} ${styles['badge-icon']}`}></i>
        {text}
    </Badge>
}

const ListItemComponent: FC<{ data: connection, download: number, upload: number, onClick?: () => void }> =
    ({ data, download, upload, onClick }) => {
        return (
            <li
                className={styles['list-item']}
                onClick={onClick}
            >
                <div className={styles['item-main']}>
                    <code className={styles['item-id']}>{data.id.toString()}</code>
                    <span className={styles['item-addr']}>{data.addr}</span>
                </div>

                <div className={styles['item-details-right']}>
                    <FlowBadge download={download} upload={upload} />
                    <div className={styles['item-details']}>
                        <IconBadge icon="bi-shield-check" text={mode[data.mode]} />
                        <IconBadge icon="bi-hdd-network" text={type[data.type?.connType ?? 0]} />
                        {data.tag && <IconBadge icon="bi-tag" text={data.tag} />}
                    </div>
                </div>
            </li>
        );
    }

const ListItem = React.memo(ListItemComponent)

const FlowBadgeComponent: FC<{ download: number, upload: number }> = ({ download, upload }) => {
    return <div className="d-flex gap-2">
        <Badge pill>
            <i className={`bi bi-arrow-down ${styles['badge-icon']}`}></i>
            {formatBytes(download)}
        </Badge>
        <Badge pill>
            <i className={`bi bi-arrow-up ${styles['badge-icon']}`}></i>
            {formatBytes(upload)}
        </Badge>
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
        <Modal
            show={show}
            onHide={handleClose}
            scrollable
            centered
            contentClassName="border-0 shadow-lg"
        >
            <Modal.Header closeButton className="border-bottom-0 pb-0">
                <Modal.Title className="h5 fw-bold">
                    Connection Details
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="pt-2">
                <ConnectionInfo value={data} showNodeModal={showNodeModal} />
            </Modal.Body>

            <Modal.Footer className="border-top-0 pt-0 pb-3 px-3">
                <Button
                    variant="danger"
                    className="w-100 py-2 d-flex align-items-center justify-content-center notranslate"
                    disabled={closing}
                    onClick={closeConnection}
                >
                    {closing ? (
                        <>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-2"
                            />
                            Disconnecting...
                        </>
                    ) : (
                        <>
                            <i className="bi bi-power fs-5 me-2"></i>
                            <span className="fw-bold">Disconnect</span>
                        </>
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

const InfoOffcanvas = React.memo(InfoOffcanvasComponent)

export default Connections;