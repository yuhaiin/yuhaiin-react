"use client"

import React, { useEffect, useState } from "react";
import { Button, Card, ListGroup, Accordion, Badge } from "react-bootstrap";
import { APIUrl } from "../apiurl";
import NodeModal from "../modal/node";
import { connection, type as netType } from "../protos/statistic/config";
import { notify_remove_connections, notify_new_connections, total_flow, notify_data } from "../protos/statistic/grpc/config";

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
    const [flow, setFlow] = useState({ download: 0, upload: 0, dstr: "Loading...", ustr: "Loading...", });
    const [conns, setConns] = useState<{ [key: number]: connection }>({});


    let download = 0;
    let upload = 0;

    const updateFlow = (data: total_flow) => {
        let drate = 0;
        let urate = 0;
        if (download !== 0 || upload !== 0) {
            drate = (data.download - download) / 2
            urate = (data.upload - upload) / 2
        }
        download = data.download
        upload = data.upload

        const sd = formatBytes(download)
        const su = formatBytes(upload)
        const sdr = formatBytes(drate)
        const sur = formatBytes(urate)

        if (sd === "" || su === "" || sdr === "" || sur === "") return

        let dstr = `(${sd}): ${sdr}/S`
        let ustr = `(${su}): ${sur}/S`

        setFlow({ download: download, upload: upload, dstr: dstr, ustr: ustr })
    }

    const updateConns = (data: notify_new_connections) => {
        let cs = conns;
        data.connections.forEach((e: connection) => { cs[e.id] = e });
        setConns({ ...cs });
    }

    const removeConns = (data: notify_remove_connections) => {
        let cs = conns;
        data.ids.forEach((e: number) => { delete cs[e] })
        setConns({ ...cs });
    }

    const connectWS = () => {
        let scheme = window.location.protocol === "https:" ? "wss://" : "ws://";
        let url = APIUrl !== "" ? APIUrl.replace("http://", "").replace("https://", "") : window.location.host
        console.log("websocket url: ", url);
        const ws = new WebSocket(scheme + url + "/conn");
        ws.binaryType = "arraybuffer";
        let closed = false;

        let close = () => {
            console.log("close websocket")
            closed = true;
            ws.close();
        }

        ws.onopen = () => {
            console.log("websocket connect")
            ws.send('2000')
        }

        ws.onmessage = function (ev) {
            const data = notify_data.decode(new Uint8Array(ev.data));

            switch (data.data?.$case) {
                case "total_flow":
                    updateFlow(data.data.total_flow)
                    return
                case "notify_new_connections":
                    updateConns(data.data.notify_new_connections)
                    return
                case "notify_remove_connections":
                    removeConns(data.data.notify_remove_connections)
            }
        }


        window.onbeforeunload = function () { ws.close(); }

        ws.onclose = function () {
            if (closed) {
                console.log("websocket closed")
                return
            }

            console.log('close websocket, reconnect will in 1 second')
            setConns({})
            setFlow({ download: 0, upload: 0, dstr: "Loading...", ustr: "Loading...", })
            close = connectWS()
        }

        return close
    }

    // eslint-disable-next-line
    useEffect(connectWS, [])


    return (
        <>

            <Card className="mb-3">
                <ListGroup variant="flush">

                    <ListGroup.Item>

                        <div className="d-sm-flex">
                            <div className="endpoint-name flex-grow-1 notranslate">Download</div>
                            <div className="notranslate" style={{ opacity: 0.6 }} id="statistic-download">{flow.dstr}</div>
                        </div>
                    </ListGroup.Item>


                    <ListGroup.Item>
                        <div className="d-sm-flex">
                            <div className="endpoint-name flex-grow-1 notranslate">Upload</div>
                            <div className="notranslate" style={{ opacity: 0.6 }} id="statistic-upload">{flow.ustr}</div>
                        </div>
                    </ListGroup.Item>
                </ListGroup>
            </Card>

            <Accordion className="mb-3" alwaysOpen id="connections">
                {
                    Object.entries(conns).map(([k, e]) => {
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
            {modalHash.hash !== "" && <NodeModal hash={modalHash.hash} editable={false} onHide={() => setModalHash({ hash: "" })} />}
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
                        props.data.extra.Tag != null &&
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