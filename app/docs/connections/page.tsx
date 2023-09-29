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
import { yuhaiin } from "../pbts/proto";

const netType = yuhaiin.statistic.type;
const notify_remove_connections = yuhaiin.protos.statistic.service.notify_remove_connections;
const notify_data = yuhaiin.protos.statistic.service.notify_data;

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
        download: number,
        upload: number,
        dstr: string,
        ustr: string
    }

    type Statistic = {
        flow: Flow,
        conns: { [key: number]: yuhaiin.statistic.connection }
    }

    const generateFlow = (flow: yuhaiin.protos.statistic.service.total_flow, prev: Flow): Flow => {
        let drate = (flow.download - (prev.download !== 0 ? prev.download : flow.download)) / 2
        let urate = (flow.upload - (prev.upload !== 0 ? prev.upload : flow.upload)) / 2
        let dstr = `(${formatBytes(flow.download)}): ${formatBytes(drate)}/S`
        let ustr = `(${formatBytes(flow.upload)}): ${formatBytes(urate)}/S`
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
                    const raw = notify_data.decode(new Uint8Array(event.data));
                    next(null, pre => {
                        let prev: Statistic = pre ?
                            {
                                flow: pre.flow,
                                conns: { ...pre.conns }
                            }
                            :
                            {
                                flow: { download: 0, upload: 0, dstr: "Loading...", ustr: "Loading..." },
                                conns: {}
                            };
                        switch (raw.data) {
                            case "total_flow":
                                let xfw = new yuhaiin.protos.statistic.service.total_flow(raw.total_flow ?? undefined);
                                prev.flow = generateFlow(xfw, prev.flow)
                                return prev
                            case "notify_new_connections":
                                let conns = new yuhaiin
                                    .protos
                                    .statistic
                                    .service
                                    .notify_new_connections(raw.notify_new_connections ?? undefined)
                                    .connections;

                                conns.forEach((e: yuhaiin.statistic.connection) => { prev.conns[e.id] = e })
                                return prev;
                            case "notify_remove_connections":
                                let ids = new yuhaiin
                                    .protos
                                    .statistic
                                    .service
                                    .notify_remove_connections(raw.notify_remove_connections ?? undefined)
                                    .ids;
                                ids.forEach((e: number) => { delete prev.conns[e] })
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

    if (error !== undefined) return <Loading code={error.code}>{error.msg}</Loading>
    if (data === undefined) return <Loading />

    return (
        <>
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
                    Object.entries(data.conns).map(([k, e]) => {
                        return <AccordionItem data={e} key={e.id} />
                    })
                }
            </Accordion>

        </>
    );
}

const ListGroupItem = React.memo((props: { itemKey: string, itemValue: string, }) => {
    const [modalHash, setModalHash] = useState({ hash: "" });

    return (
        <>
            <NodeModal
                show={modalHash.hash !== ""}
                hash={modalHash.hash}
                editable={false}
                onHide={() => setModalHash({ hash: "" })}
            />

            <ListGroup.Item>
                <div className="d-sm-flex">
                    <div className="endpoint-name flex-grow-1 notranslate">{props.itemKey}</div>

                    <div className="notranslate" style={{ opacity: 0.6 }}>
                        {
                            props.itemKey !== "Hash" ? props.itemValue :
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        setModalHash({ hash: props.itemValue })
                                    }}>
                                    {props.itemValue}
                                </a>}
                    </div>
                </div>
            </ListGroup.Item>
        </>
    )
})

const AccordionItem = React.memo((props: { data: yuhaiin.statistic.connection }) => {
    const ctx = useContext(GlobalToastContext);

    return (
        <Accordion.Item eventKey={props.data.id.toString()} key={props.data.id}>

            <Accordion.Header>
                <div className="d-line">
                    <code className="ms-2">{props.data.id}</code>
                    <span className="ms-2">{props.data.addr}</span>
                    <Badge className="bg-light rounded-pill text-dark ms-1 text-uppercase">{props.data.extra.MODE}</Badge>
                    <Badge className="bg-light rounded-pill text-dark ms-1 text-uppercase">{netType[new yuhaiin.statistic.net_type(props.data.type!!).conn_type]}</Badge>
                    {
                        props.data.extra.Tag !== undefined &&
                        <Badge className="bg-light rounded-pill text-dark ms-1 text-uppercase">{props.data.extra.Tag}</Badge>
                    }
                </div>
            </Accordion.Header>

            <Accordion.Body>
                <ListGroup variant="flush">
                    <ListGroupItem itemKey="Type" itemValue={netType[new yuhaiin.statistic.net_type(props.data.type!!).conn_type]} />
                    <ListGroupItem itemKey="Underlying" itemValue={netType[new yuhaiin.statistic.net_type(props.data.type!!).underlying_type]} />

                    {
                        Object.entries(props.data.extra)
                            .sort((a, b) => { return a <= b ? -1 : 1 })
                            .map(([k, v]) => {
                                return <ListGroupItem itemKey={k} itemValue={v} key={k} />
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
                                            body: notify_remove_connections.encode({ ids: [props.data.id] }).finish()
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