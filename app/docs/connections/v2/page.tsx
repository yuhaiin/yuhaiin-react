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
import { Badge, Button, Card, ListGroup, Modal, Spinner } from "react-bootstrap";
import useSWRSubscription from 'swr/subscription';
import { mode } from "../../pbes/config/bypass_pb";

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
    const changeSoryBy = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortBy(e.target.value)
    }, [setSortBy])


    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc"); // 'asc' | 'desc'
    const changeSortOrder = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortOrder(e.target.value as "asc" | "desc")
    }, [setSortOrder])

    return (
        <>
            <FlowContainer onUpdate={updateCounters} />

            <InfoOffcanvas
                data={info.info}
                show={info.show}
                onClose={hideInfo}
            />



            <div className="d-flex">
                <div className="d-flex align-items-center gap-2 mb-3 ms-auto flex-wrap">
                    <span className="d-flex align-items-center gap-2">
                        Sort Order
                        <select
                            className="form-select"
                            value={sortOrder}
                            onChange={changeSortOrder}
                            style={{ width: 150 }}
                        >
                            <option value="asc">Asc</option>
                            <option value="desc">Desc</option>
                        </select>
                    </span>
                    <span className="d-flex align-items-center gap-2">
                        Sort By
                        <select
                            className="form-select"
                            value={sortBy}
                            onChange={changeSoryBy}
                            style={{ width: 150 }}
                        >
                            <option value="">Id</option>
                            <option value="name">Name</option>
                            <option value="download">Download</option>
                            <option value="upload">Upload</option>
                        </select>
                    </span>
                </div>
            </div>

            <ConnectionList conns={conns} counters={counters} setInfo={setInfo} conn_error={conn_error} sortFields={sortBy} sortOrder={sortOrder} />
        </>
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

    return <>
        <Card>
            <ListGroup variant="flush" style={{ borderBottom: "none" }}>
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
            </ListGroup>
        </Card>
    </>
}

const ConnectionList = React.memo(ConnectionListComponent)

const ListItemComponent: FC<{ data: connection, download: number, upload: number, onClick?: () => void }> =
    ({ data, download, upload, onClick }) => {
        const Tag = () => {
            if (data.tag) {
                return <Badge bg="primary" pill className="ms-1 text-uppercase">{data.tag}</Badge>
            }
            return <></>
        }

        const Mode = () => {
            return <Badge bg="primary" pill className="ms-1 text-uppercase">{mode[data.mode]}</Badge>
        }

        const ConnType = () => {
            return <Badge bg="primary" pill className="ms-1 text-uppercase">{type[data.type?.connType ?? 0]}</Badge>
        }


        return (
            <
                ListGroup.Item
                className="d-flex justify-content-between align-items-start py-3 flex-wrap"
                style={{ border: "0ch", borderBottom: "1px solid #dee2e6" }}
                action
                onClick={onClick}
            >
                <div className="text-break">
                    <code>{data.id.toString()}</code>
                    <span className="ms-2">{data.addr}</span>
                </div>

                <div className="fs-9">
                    <FlowBadge download={download} upload={upload} />
                    <Mode />
                    <ConnType />
                    <Tag />
                </div>
            </ListGroup.Item>
        );
    }

const ListItem = React.memo(ListItemComponent)

const FlowBadgeComponent: FC<{ download: number, upload: number }> = ({ download, upload }) => {
    return <Badge bg="primary" pill>
        {formatBytes(download)} / {formatBytes(upload)}
    </Badge>
}

const FlowBadge = React.memo(FlowBadgeComponent)

const InfoOffcanvasComponent: FC<{
    data: connection,
    show: boolean,
    onClose: () => void,
}> =
    ({ data, show, onClose: handleClose }) => {
        const ctx = useContext(GlobalToastContext);

        const [closing, setClosing] = useState(false);

        const closeConnection = useCallback(() => {
            setClosing(true)
            FetchProtobuf(
                connections.method.close_conn,
                create(notify_remove_connectionsSchema, { ids: [data.id] }),
            )
                .then(async ({ error }) => {
                    if (error) {
                        ctx.Error(`code ${data.id} failed, ${error.code}| ${error.msg}`)
                        setClosing(false)
                    } else {
                        setTimeout(() => { setClosing(false) }, 5000)
                    }
                })
        }, [setClosing, data.id, ctx])

        return <Modal
            show={show}
            onHide={handleClose}
        >
            <Modal.Body>
                <ConnectionInfo
                    value={data}
                    endContent={
                        <ListGroup.Item>
                            <div className="d-flex">
                                <Button
                                    variant="outline-success"
                                    onClick={handleClose}
                                    className="flex-grow-1 notranslate"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="outline-danger"
                                    className="ms-2 flex-grow-1 notranslate"
                                    disabled={closing}
                                    onClick={closeConnection}
                                >
                                    Close
                                    {closing && <>&nbsp;<Spinner size="sm" animation="border" variant='danger' /></>}
                                </Button>
                            </div>
                        </ListGroup.Item>
                    }
                />
            </Modal.Body>
        </Modal>
    }

const InfoOffcanvas = React.memo(InfoOffcanvasComponent)

export default Connections;