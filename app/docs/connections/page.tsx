"use client"

import { create } from "@bufbuild/protobuf";
import { EmptySchema } from "@bufbuild/protobuf/wkt";
import React, { useContext, useState } from "react";
import { Accordion, Badge, Button, Card, ListGroup, Spinner } from "react-bootstrap";
import useSWR from 'swr';
import useSWRSubscription from 'swr/subscription';
import Loading from "../common/loading";
import { FetchProtobuf, WebsocketProtoServerStream } from "../common/proto";
import { GlobalToastContext } from "../common/toast";
import { NodeModal } from "../modal/node";
import { connection, type } from "../pbes/statistic/config_pb";
import { connections, notify_data, notify_remove_connectionsSchema, total_flow } from "../pbes/statistic/grpc/config_pb";

const formatBytes =
    (a = 0, b = 2) => {
        if (!+a) return "0B";
        const c = 0 > b ? 0 : b, d = Math.floor(Math.log(a) / Math.log(1024));
        const Num = parseFloat((a / Math.pow(1024, d)).toFixed(c))
        const Unit = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d]
        if (isNaN(Num) || Unit === undefined) return ""
        return `${Num}${Unit}`
    }


const generateFlow = (flow: total_flow, prev: { upload: bigint, download: bigint }): { upload: string, download: string } => {
    let drate = (flow.download - (prev.download !== BigInt(0) ? prev.download : flow.download)) / BigInt(2)
    let urate = (flow.upload - (prev.upload !== BigInt(0) ? prev.upload : flow.upload)) / BigInt(2)
    let dstr = `(${formatBytes(Number(flow.download))}): ${formatBytes(Number(drate))}/S`
    let ustr = `(${formatBytes(Number(flow.upload))}): ${formatBytes(Number(urate))}/S`
    return { download: dstr, upload: ustr }
}

function Connections() {
    const [modalHash, setModalHash] = useState({ show: false, hash: "" });
    const [lastFlow, setLastFlow] = useState({ download: BigInt(0), upload: BigInt(0) })

    const processStream = (r: notify_data, prev?: Map<bigint, connection>): Map<bigint, connection> => {
        if (prev === undefined) prev = new Map()
        switch (r.data.case) {
            case "notifyNewConnections":
                r.data.value.
                    connections.
                    sort((a, b) => a.id > b.id ? 1 : -1).
                    forEach((e: connection) => { prev.set(e.id, e) })
                break
            case "notifyRemoveConnections":
                r.data.value.ids.forEach((e: bigint) => { prev.delete(e) })
                break
        }
        return prev
    }

    const { data: flow, error: flow_error } = useSWR("/flow/total", async (url: string) => {
        return FetchProtobuf(connections.method.total, url).then(async ({ data: r, error }) => {
            if (error) throw error
            if (r) {
                let resp = generateFlow(r, { download: lastFlow.download, upload: lastFlow.upload })
                setLastFlow({ download: r.download, upload: r.upload })
                return resp
            }
        })
    },
        { refreshInterval: 2000 })

    const { data: conns, error: conn_error } = useSWRSubscription("/conn", WebsocketProtoServerStream(connections.method.notify, create(EmptySchema, {}), processStream))

    return (
        <>
            <NodeModal
                show={modalHash.show}
                hash={modalHash.hash}
                editable={false}
                onHide={() => setModalHash({ ...modalHash, show: false })}
            />

            <Card className="mb-3">
                <ListGroup variant="flush">

                    <ListGroup.Item>

                        <div className="d-sm-flex">
                            <div className="endpoint-name flex-grow-1 notranslate">Download</div>
                            <div className="notranslate" style={{ opacity: 0.6 }} id="statistic-download">{flow ? flow.download : flow_error !== undefined ? flow_error.msg : "Loading..."}</div>
                        </div>
                    </ListGroup.Item>


                    <ListGroup.Item>
                        <div className="d-sm-flex">
                            <div className="endpoint-name flex-grow-1 notranslate">Upload</div>
                            <div className="notranslate" style={{ opacity: 0.6 }} id="statistic-upload">{flow ? flow.upload : flow_error !== undefined ? flow_error.msg : "Loading..."}</div>
                        </div>
                    </ListGroup.Item>
                </ListGroup>
            </Card>

            {
                conn_error !== undefined ? <Loading code={conn_error.code}>{conn_error.msg}</Loading> :
                    conns === undefined ? <Loading /> :
                        <Accordion className="mb-3" alwaysOpen id="connections">
                            {
                                [...conns.values()].reverse().map((e) => {
                                    return <AccordionItem data={e} key={e.id} showModal={(hash) => setModalHash({ show: true, hash: hash })} />
                                })
                            }
                        </Accordion>
            }
        </>
    );
}

const ListGroupItem = React.memo((props: { itemKey: string, itemValue: string, showModal: (hash: string) => void }) => {
    return (
        <>
            <ListGroup.Item>
                <div className="d-sm-flex">
                    <div className="endpoint-name flex-grow-1 notranslate">{props.itemKey}</div>

                    <div className="notranslate text-break" style={{ opacity: 0.6 }}>
                        {
                            props.itemKey !== "Hash" ? props.itemValue :
                                <a
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); props.showModal(props.itemValue) }}
                                >
                                    {props.itemValue}
                                </a>
                        }
                    </div>
                </div>
            </ListGroup.Item>
        </>
    )
})

const AccordionItem = React.memo((props: { data: connection, showModal: (hash: string) => void }) => {
    const ctx = useContext(GlobalToastContext);

    const [closing, setClosing] = useState(false);

    return (
        <Accordion.Item eventKey={props.data.id.toString()} key={props.data.id}>

            <Accordion.Header>
                <div className="d-line text-break">
                    <code className="ms-2">{props.data.id.toString()}</code>
                    <span className="ms-2">{props.data.addr}</span>
                    <Badge className="bg-light rounded-pill text-dark ms-1 text-uppercase">{props.data.extra.MODE}</Badge>
                    <Badge className="bg-light rounded-pill text-dark ms-1 text-uppercase">{type[props.data.type?.connType ?? 0]}</Badge>
                    {
                        props.data.extra.Tag !== undefined &&
                        <Badge className="bg-light rounded-pill text-dark ms-1 text-uppercase">{props.data.extra.Tag}</Badge>
                    }
                </div>
            </Accordion.Header>

            <Accordion.Body>
                <ListGroup variant="flush">
                    <ListGroupItem itemKey="Type" itemValue={type[props.data.type?.connType ?? 0]} showModal={props.showModal} />
                    <ListGroupItem itemKey="Underlying" itemValue={type[props.data.type?.underlyingType ?? 0]} showModal={props.showModal} />

                    {
                        Object.entries(props.data.extra)
                            .sort((a, b) => { return a <= b ? -1 : 1 })
                            .map(([k, v]) => {
                                return <ListGroupItem itemKey={k} itemValue={v} key={k} showModal={props.showModal} />
                            })
                    }
                    <ListGroup.Item>
                        <div className="d-sm-flex">
                            <Button
                                variant="outline-danger"
                                className="flex-grow-1 notranslate"
                                disabled={closing}
                                onClick={() => {
                                    setClosing(true)
                                    FetchProtobuf(
                                        connections.method.close_conn,
                                        "/conn",
                                        "DELETE",
                                        create(notify_remove_connectionsSchema, { ids: [props.data.id] }),
                                    )
                                        .then(async ({ error }) => {
                                            if (error) {
                                                ctx.Error(`code ${props.data.id} failed, ${error.code}| ${error.msg}`)
                                                setClosing(false)
                                            } else {
                                                setTimeout(() => { setClosing(false) }, 5000)
                                            }
                                        })
                                }}
                            >
                                Close
                                {closing && <>&nbsp;<Spinner size="sm" animation="border" variant='danger' /></>}
                            </Button>
                        </div>
                    </ListGroup.Item>
                </ListGroup>
            </Accordion.Body>

        </Accordion.Item >
    )
})
export default Connections;