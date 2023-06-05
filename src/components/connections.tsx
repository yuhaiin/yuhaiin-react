import React, { useEffect, useState } from "react";
import { Row, Col, ButtonGroup, Button, Dropdown, Card, ListGroup, Accordion, Badge } from "react-bootstrap";
import { APIUrl } from "./apiurl";

const formatBytes =
    (a = 0, b = 2) => { if (!+a) return "0B"; const c = 0 > b ? 0 : b, d = Math.floor(Math.log(a) / Math.log(1024)); return `${parseFloat((a / Math.pow(1024, d)).toFixed(c))}${["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d]}` }


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


        let dstr = `(${formatBytes(download)}): ${formatBytes(drate)}/S`
        let ustr = `(${formatBytes(upload)}): ${formatBytes(urate)}/S`

        setFlow({ download: download, upload: upload, dstr: dstr, ustr: ustr })

        console.log(dstr, ustr)
    }

    const updateConns = (data: any) => {
        let cs = conns.cs;
        data.forEach((e: any) => {
            cs.set(e.id, e);
        });
        setConns({ cs: cs });
        console.log(conns.cs.size);
    }

    const removeConns = (data: any) => {
        let cs = conns.cs;
        data.forEach((e: any) => {
            cs.delete(e);
        })
        setConns({ cs: cs });
    }

    useEffect(() => {
        const ws = new WebSocket("ws://" + APIUrl.replace("http://", "").replace("https://", "") + "/conn");

        ws.onopen = () => { ws.send('2000') }

        ws.onmessage = function (ev) {
            const data = JSON.parse(ev.data);
            console.log(data)

            switch (data.type) {
                case 0:
                    updateFlow(data.flow);
                    return
                case 1:
                    console.log("start")
                    updateConns(data.data);
                    console.log("end")
                    return;
                case 2:
                    removeConns(data.data);
            }
        }


        window.onbeforeunload = function () { ws.close(); }

        ws.onclose = function (event) { console.log('close websocket, reconnect will in 1 second') }
        return () => { ws.close(); }
    }, [])


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
                        return AccordionItem(e)
                    })
                }
            </Accordion>

        </>
    );
}

function ListGroupItem({ itemKey = "", itemValue = "", }) {
    return (
        <ListGroup.Item>
            <div className="d-sm-flex">
                <div className="endpoint-name flex-grow-1 notranslate">{itemKey}</div>
                <div className="notranslate" style={{ opacity: 0.6 }}>{itemValue}</div>
            </div>
        </ListGroup.Item>
    )
}

function AccordionItem(data: any) {
    return (
        <Accordion.Item eventKey={data.id} key={data.id}>

            <Accordion.Header>
                <div className="d-line">
                    <code className="ms-2">{data.id}</code>
                    <span className="ms-2">{data.addr}</span>
                    <Badge className="bg-light rounded-pill text-dark ms-1 text-uppercase">{data.extra.MODE}</Badge>
                    <Badge className="bg-light rounded-pill text-dark ms-1 text-uppercase">{net_map[data.type.conn_type as keyof typeof net_map]}</Badge>
                </div>
            </Accordion.Header>

            <Accordion.Body>
                <ListGroup variant="flush">
                    <ListGroupItem itemKey="Type" itemValue={net_map[data.type.conn_type as keyof typeof net_map]} />
                    <ListGroupItem itemKey="Underlying" itemValue={net_map[data.type.underlying_type as keyof typeof net_map]} />

                    {
                        Object.keys(data.extra).map((k) => {
                            return <ListGroupItem itemKey={k} itemValue={data.extra[k]} key={k} />
                        })
                    }
                    <ListGroup.Item>
                        <div className="d-sm-flex">
                            <Button variant="outline-danger" className="flex-grow-1 notranslate" >Close</Button>
                        </div>
                    </ListGroup.Item>
                </ListGroup>
            </Accordion.Body>

        </Accordion.Item >
    )
}
export default Connections;