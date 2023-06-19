import React, { useEffect, useState } from "react";
import { Row, Col, ButtonGroup, Button, Dropdown, Card, ListGroup, Accordion, Badge } from "react-bootstrap";
import { APIUrl } from "./apiurl";
import NodeModal from "./node";

const formatBytes =
    (a = 0, b = 2) => {
        if (!+a) return "0B";
        const c = 0 > b ? 0 : b, d = Math.floor(Math.log(a) / Math.log(1024));
        const Num = parseFloat((a / Math.pow(1024, d)).toFixed(c))
        const Unit = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d]
        if (isNaN(Num) || Unit == undefined) return ""
        return `${Num}${Unit}`
    }


const net_map = {
    0: "unknown",
    1: "tcp",
    2: "tcp4",
    3: "tcp6",
    4: "udp",
    5: "udp4",
    6: "udp6",
    7: "ip",
    8: "ip4",
    9: "ip6",
    10: "unix",
    11: "unixgram",
    12: "unixpacket",
}


function Connections() {
    const [flow, setFlow] = useState({ download: 0, upload: 0, dstr: "Loading...", ustr: "Loading...", });
    const [conns, setConns] = useState({ cs: new Map() });


    let download = 0;
    let upload = 0;

    const updateFlow = (data: any) => {
        let drate = 0;
        let urate = 0;
        if (download != 0 || upload != 0) {
            drate = (data.download - download) / 2
            urate = (data.upload - upload) / 2
        }
        download = data.download
        upload = data.upload

        const sd = formatBytes(download)
        const su = formatBytes(upload)
        const sdr = formatBytes(drate)
        const sur = formatBytes(urate)

        if (sd == "" || su == "" || sdr == "" || sur == "") return

        let dstr = `(${sd}): ${sdr}/S`
        let ustr = `(${su}): ${sur}/S`

        setFlow({ download: download, upload: upload, dstr: dstr, ustr: ustr })

        // console.log(dstr, ustr)
    }

    const updateConns = (data: any) => {
        let cs = conns.cs;
        data.forEach((e: any) => {
            cs.set(e.id, e);
        });
        setConns({ cs: cs });
        // console.log(conns.cs.size);
    }

    const removeConns = (data: any) => {
        let cs = conns.cs;
        data.forEach((e: any) => {
            cs.delete(e);
        })
        setConns({ cs: cs });
    }

    const connectWS = () => {
        let url = (APIUrl != "" ? APIUrl : window.location.host).replace("http://", "").replace("https://", "");

        const ws = new WebSocket("ws://" + url + "/conn");
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
            const data = JSON.parse(ev.data);
            // console.log(data)

            switch (data.type) {
                case 0:
                    updateFlow(data.flow);
                    return
                case 1:
                    // console.log("start")
                    updateConns(data.data);
                    // console.log("end")
                    return;
                case 2:
                    removeConns(data.data);
            }
        }


        window.onbeforeunload = function () {
            ws.close();
        }

        ws.onclose = function (event) {
            if (closed) {
                console.log("websocket closed")
                return
            }

            console.log('close websocket, reconnect will in 1 second')
            let cs = conns.cs;
            cs.clear()
            setConns({ cs: cs })
            setFlow({ download: 0, upload: 0, dstr: "Loading...", ustr: "Loading...", })
            close = connectWS()
        }

        return close
    }

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
                    Array.from(conns.cs.values()).map((e: any) => {
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
            {modalHash.hash != "" && <NodeModal hash={modalHash.hash} editable={false} onHide={() => setModalHash({ hash: "" })} />}
            <ListGroup.Item>
                <div className="d-sm-flex">
                    <div className="endpoint-name flex-grow-1 notranslate">{props.itemKey}</div>

                    <div className="notranslate" style={{ opacity: 0.6 }}>
                        {
                            props.itemKey != "Hash"
                                ?
                                props.itemValue
                                :
                                <a href="#" onClick={(e) => { e.preventDefault(); setModalHash({ hash: props.itemValue }) }}>{props.itemValue}</a>}
                    </div>
                </div>
            </ListGroup.Item>
        </>
    )
})

const AccordionItem = React.memo((props: { data: any }) => {
    return (
        <Accordion.Item eventKey={props.data.id} key={props.data.id}>

            <Accordion.Header>
                <div className="d-line">
                    <code className="ms-2">{props.data.id}</code>
                    <span className="ms-2">{props.data.addr}</span>
                    <Badge className="bg-light rounded-pill text-dark ms-1 text-uppercase">{props.data.extra.MODE}</Badge>
                    <Badge className="bg-light rounded-pill text-dark ms-1 text-uppercase">{net_map[props.data.type.conn_type as keyof typeof net_map]}</Badge>
                </div>
            </Accordion.Header>

            <Accordion.Body>
                <ListGroup variant="flush">
                    <ListGroupItem itemKey="Type" itemValue={net_map[props.data.type.conn_type as keyof typeof net_map]} />
                    <ListGroupItem itemKey="Underlying" itemValue={net_map[props.data.type.underlying_type as keyof typeof net_map]} />

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
                                        APIUrl + "/conn?id=" + props.data.id,
                                        {
                                            method: "DELETE",
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