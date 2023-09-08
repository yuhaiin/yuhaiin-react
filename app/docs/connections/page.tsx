"use client"

import React, { useState } from "react";
import { Button, Card, ListGroup, Accordion, Badge } from "react-bootstrap";
import { APIUrl } from "../apiurl";
import NodeModal from "../modal/node";
import { connection, type as netType } from "../protos/statistic/config";
import { notify_remove_connections, total_flow, notify_data } from "../protos/statistic/grpc/config";
import useSWRSubscription from 'swr/subscription'
import type { SWRSubscriptionOptions } from 'swr/subscription'
import { produce } from "immer";
import Loading from "../common/loading";

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
        conns: { [key: number]: connection }
    }

    const generateFlow = (flow: total_flow, prev: Flow): Flow => {
        let drate = (flow.download - (prev.download !== 0 ? prev.download : flow.download)) / 2
        let urate = (flow.upload - (prev.upload !== 0 ? prev.upload : flow.upload)) / 2
        let dstr = `(${formatBytes(flow.download)}): ${formatBytes(drate)}/S`
        let ustr = `(${formatBytes(flow.upload)}): ${formatBytes(urate)}/S`
        return { download: flow.download, upload: flow.upload, dstr: dstr, ustr: ustr }
    }

    const { data, error } = useSWRSubscription("/conn",
        (key, { next }: SWRSubscriptionOptions<Statistic, { msg: string, code: number }>) => {
            let scheme = window.location.protocol === "https:" ? "wss://" : "ws://";
            let url = APIUrl !== "" ? APIUrl.replace("http://", "").replace("https://", "") : window.location.host


            const socket = new WebSocket(`${scheme}${url}${key}`)
            socket.binaryType = "arraybuffer";

            socket.addEventListener('open', (e) => {
                console.log(`connect to: ${scheme}${url}${key}, event type: ${e.type}`)
                socket.send('2000')
            })

            socket.addEventListener('message', (event) => {
                const raw = notify_data.decode(new Uint8Array(event.data));
                next(null, pre => {
                    let prev = pre;
                    if (prev === undefined) prev = { flow: { download: 0, upload: 0, dstr: "Loading...", ustr: "Loading..." }, conns: {} }
                    switch (raw.data?.$case) {
                        case "total_flow":
                            let xfw = raw.data.total_flow;
                            return produce(prev, (v) => { v.flow = generateFlow(xfw, v.flow) })
                        case "notify_new_connections":
                            let conns = raw.data.notify_new_connections.connections;
                            return produce(prev, (v) => { conns.forEach((e: connection) => { v.conns[e.id] = e }) })
                        case "notify_remove_connections":
                            let ids = raw.data.notify_remove_connections.ids;
                            return produce(prev, (v) => { ids.forEach((e: number) => { delete v.conns[e] }) })
                    }
                })
            })

            socket.addEventListener('error', (e) => {
                let msg = "websocket have some error"
                next({ msg: msg, code: 500 })
                console.log(msg)
            })

            socket.addEventListener('close', (e) => {
                let msg = "websocket closed, code: " + e.code
                next({ msg: 'websocket closed', code: e.code })
                console.log(msg)
            })

            return () => socket.close()
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
                            props.itemKey !== "Hash"
                                ?
                                props.itemValue
                                :
                                <a href="#empty" onClick={(e) => { e.preventDefault(); setModalHash({ hash: props.itemValue }) }}>{props.itemValue}</a>}
                    </div>
                </div>
            </ListGroup.Item>
        </>
    )
})

const AccordionItem = React.memo((props: { data: connection }) => {
    return (
        <Accordion.Item eventKey={props.data.id.toString()} key={props.data.id}>

            <Accordion.Header>
                <div className="d-line">
                    <code className="ms-2">{props.data.id}</code>
                    <span className="ms-2">{props.data.addr}</span>
                    <Badge className="bg-light rounded-pill text-dark ms-1 text-uppercase">{props.data.extra.MODE}</Badge>
                    <Badge className="bg-light rounded-pill text-dark ms-1 text-uppercase">{netType[props.data.type!!.conn_type]}</Badge>
                    {
                        props.data.extra.Tag !== undefined &&
                        <Badge className="bg-light rounded-pill text-dark ms-1 text-uppercase">{props.data.extra.Tag}</Badge>
                    }
                </div>
            </Accordion.Header>

            <Accordion.Body>
                <ListGroup variant="flush">
                    <ListGroupItem itemKey="Type" itemValue={netType[props.data.type!!.conn_type]} />
                    <ListGroupItem itemKey="Underlying" itemValue={netType[props.data.type!!.underlying_type]} />

                    {
                        Object.keys(props.data.extra).map((k) => {
                            return <ListGroupItem itemKey={k} itemValue={props.data.extra[k]} key={k} />
                        })
                    }
                    <ListGroup.Item>
                        <div className="d-sm-flex">
                            <Button
                                variant="outline-danger"
                                className="flex-grow-1 notranslate"
                                onClick={async () => {
                                    const resp = await fetch(
                                        APIUrl + "/conn",
                                        {
                                            method: "DELETE",
                                            body: notify_remove_connections.encode({ ids: [props.data.id] }).finish()
                                        }
                                    )
                                    if (!resp.ok) console.log(await resp.text())
                                    else console.log(`close ${props.data.id} successful`);
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