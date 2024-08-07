"use client"

import React, { useState, useContext } from "react";
import { Button, Card, ListGroup, Accordion, Badge } from "react-bootstrap";
import { APIUrl } from "../apiurl";
import NodeModal from "../modal/node";
import useSWRSubscription from 'swr/subscription'
import type { SWRSubscriptionOptions } from 'swr/subscription'
import Loading from "../common/loading";
import { Fetch } from "../common/proto";
import { GlobalToastContext } from "../common/toast";
import { connection, type } from "../pbes/statistic/config_pb";
import { notify_data, notify_dataSchema, notify_remove_connections, notify_remove_connectionsSchema, total_flow, total_flowSchema } from "../pbes/statistic/grpc/config_pb";
import { toBinary, create, fromBinary } from "@bufbuild/protobuf";


const formatBytes =
    (a = 0, b = 2) => {
        if (!+a) return "0B";
        const c = 0 > b ? 0 : b, d = Math.floor(Math.log(a) / Math.log(1024));
        const Num = parseFloat((a / Math.pow(1024, d)).toFixed(c))
        const Unit = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d]
        if (isNaN(Num) || Unit === undefined) return ""
        return `${Num}${Unit}`
    }


function Connections() {
    type Flow = {
        download: bigint,
        upload: bigint,
        dstr: string,
        ustr: string
    }

    type Statistic = {
        flow: Flow,
        conns: { [key: number]: connection }
    }

    const generateFlow = (flow: total_flow, prev: Flow): Flow => {
        let drate = (flow.download - (prev.download !== BigInt(0) ? prev.download : flow.download)) / BigInt(2)
        let urate = (flow.upload - (prev.upload !== BigInt(0) ? prev.upload : flow.upload)) / BigInt(2)
        let dstr = `(${formatBytes(Number(flow.download))}): ${formatBytes(Number(drate))}/S`
        let ustr = `(${formatBytes(Number(flow.upload))}): ${formatBytes(Number(urate))}/S`
        return { download: flow.download, upload: flow.upload, dstr: dstr, ustr: ustr }
    }


    const { data, error } = useSWRSubscription("/conn",
        (key, { next }: SWRSubscriptionOptions<Statistic, { msg: string, code: number }>) => {

            const connect = () => {
                let url = new URL(APIUrl !== "" ? APIUrl : window.location.toString());
                let scheme = url.protocol === "https:" ? "wss://" : "ws://";
                let closed = false;

                const socket = new WebSocket(`${scheme}${url.host}${key}`)
                socket.binaryType = "arraybuffer";


                let close = () => {
                    closed = true;
                    socket.close()
                }

                socket.addEventListener('open', (e) => {
                    console.log(`connect to: ${scheme}${url.host}${key}, event type: ${e.type}`)
                    socket.send('2000')
                })

                socket.addEventListener('message', (event) => {
                    const raw = fromBinary(notify_dataSchema, new Uint8Array(event.data));
                    next(null, pre => {
                        let prev: Statistic = pre ?
                            {
                                flow: pre.flow,
                                conns: { ...pre.conns }
                            }
                            :
                            {
                                flow: { download: BigInt(0), upload: BigInt(0), dstr: "Loading...", ustr: "Loading..." },
                                conns: {}
                            };
                        switch (raw.data.case) {
                            case "totalFlow":
                                prev.flow = generateFlow(create(total_flowSchema, raw.data.value), prev.flow)
                                return prev
                            case "notifyNewConnections":
                                raw.data.value.connections.forEach((e: connection) => { prev.conns[Number(e.id)] = e })
                                return prev;
                            case "notifyRemoveConnections":
                                raw.data.value.ids.forEach((e: bigint) => { delete prev.conns[Number(e)] })
                                return prev
                        }
                    })
                })

                socket.addEventListener('error', (e) => {
                    let msg = "websocket have some error"
                    next({ msg: msg, code: 500 })
                    console.log(msg)
                })

                socket.addEventListener('close', (e) => {
                    console.log("websocket closed, code: " + e.code)
                    next(null, undefined)

                    if (closed) return

                    else {
                        console.log("reconnect after 1 seconds")
                        setTimeout(() => { close = connect() }, 1000)
                    }
                })

                return () => { close() }
            }

            return connect()
        })

    const [modalHash, setModalHash] = useState({ show: false, hash: "" });

    if (error !== undefined) return <Loading code={error.code}>{error.msg}</Loading>
    if (data === undefined) return <Loading />

    return (
        <>
            <NodeModal
                show={modalHash.show}
                hash={modalHash.hash}
                editable={false}
                onHide={() => setModalHash({ hash: "", show: false })}
            />

            <Card className="mb-3">
                <ListGroup variant="flush">

                    <ListGroup.Item>

                        <div className="d-sm-flex">
                            <div className="endpoint-name flex-grow-1 notranslate">Download</div>
                            <div className="notranslate" style={{ opacity: 0.6 }} id="statistic-download">{data?.flow.dstr}</div>
                        </div>
                    </ListGroup.Item>


                    <ListGroup.Item>
                        <div className="d-sm-flex">
                            <div className="endpoint-name flex-grow-1 notranslate">Upload</div>
                            <div className="notranslate" style={{ opacity: 0.6 }} id="statistic-upload">{data?.flow.ustr}</div>
                        </div>
                    </ListGroup.Item>
                </ListGroup>
            </Card>

            <Accordion className="mb-3" alwaysOpen id="connections">
                {
                    Object.entries(data.conns)
                        .sort(([, a], [, b]) => { return a.id > b.id ? -1 : 1 })
                        .map(([, e]) => {
                            return <AccordionItem data={e} key={e.id} showModal={(hash) => setModalHash({ show: true, hash: hash })} />
                        })
                }
            </Accordion>

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

    return (
        <Accordion.Item eventKey={props.data.id.toString()} key={props.data.id}>

            <Accordion.Header>
                <div className="d-line">
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
                                onClick={() => {
                                    Fetch("/conn",
                                        {
                                            method: "DELETE",
                                            body: toBinary(notify_remove_connectionsSchema, create(notify_remove_connectionsSchema, { ids: [props.data.id] }))
                                        })
                                        .then(async ({ error }) => {
                                            if (error !== undefined)
                                                ctx.Error(`code ${props.data.id} failed, ${error.code}| ${await error.msg}`)
                                        })
                                }}
                            >
                                Close
                            </Button>
                        </div>
                    </ListGroup.Item>
                </ListGroup>
            </Accordion.Body>

        </Accordion.Item >
    )
})
export default Connections;