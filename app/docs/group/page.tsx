"use client"

import React, { useContext, useState } from "react";
import { Row, Col, ButtonGroup, Button, Dropdown, Card, ListGroup, Badge, Spinner } from "react-bootstrap";
import NodeModal from "../modal/node";
import Loading from "../common/loading";
import { GlobalToastContext } from "../common/toast";
import useSWR from 'swr'
import { ProtoTSFetcher, Fetch, ToObjectOption } from '../common/proto';
import Error from 'next/error';
import { yuhaiin, google } from "../pbts/proto";


const Point = yuhaiin.point.point;
const UseRequest = yuhaiin.protos.node.service.use_req;
const StringValue = google.protobuf.StringValue;
const LatencyRequest = yuhaiin.latency.requests;
const LatencyResponse = yuhaiin.latency.response;

const Nanosecond = 1
const Microsecond = 1000 * Nanosecond
const Millisecond = 1000 * Microsecond
const Second = 1000 * Millisecond
const Minute = 60 * Second
const Hour = 60 * Minute

function durationToStroing(seconds: number, nonoseconds: number): string {
    const total = seconds * Second + nonoseconds * Nanosecond;
    if (total >= Hour) return `${total / Hour} h`
    if (total >= Minute) return `${total / Minute} m`
    if (total >= Second) return `${total / Second} s`
    if (total >= Millisecond) return `${total / Millisecond} ms`
    if (total >= Microsecond) return `${total / Microsecond} us`
    return `${total / Nanosecond} ns`
}

type Latency = {
    tcp?: string,
    udp?: string,
    tcpOnLoading?: boolean
    udpOnLoading?: boolean
}

function Group() {
    const ctx = useContext(GlobalToastContext);
    const [selectNode, setSelectNode] = useState("");
    const [currentGroup, setCurrentGroup] = useState("");
    const [modalData, setModalData] = useState({ point: "", hash: "" });
    const [latency, setLatency] = useState<{ [key: string]: Latency }>({})

    const { data, error, isLoading, mutate } = useSWR("/nodes", ProtoTSFetcher(yuhaiin.node.manager))

    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || data === undefined) return <Loading />

    const NodeItem = React.memo((props: { hash: string, latency: Latency | undefined }) => {
        const getStr = (s: string | undefined) => s === undefined ? "N/A" : s

        const updateTestingStatus = (modify: (x: Latency) => void) => {
            setLatency((latency) => {
                let data = latency[props.hash]
                if (data === undefined || data === null) data = { tcp: "N/A", udp: "N/A", }
                modify(data)
                latency[props.hash] = data
                return { ...latency }
            })
        }

        const latency = (protocol: yuhaiin.latency.Iprotocol, onFinish: (r: string) => void) => {
            Fetch<string>("/latency", {
                body: LatencyRequest.encode({
                    requests: [{
                        hash: props.hash,
                        id: "latency",
                        protocol: protocol
                    }]
                }).finish(),
                process: async (r) => {
                    let resp = LatencyResponse.decode(new Uint8Array(await r.arrayBuffer()));
                    const t = new google.protobuf.Duration(resp.id_latency_map["latency"])
                    if (t !== undefined && (t.nanos !== 0 || t.seconds !== 0)) return durationToStroing(t.seconds, t.nanos)
                    return "timeout"
                }
            }).then(async ({ data, error }) => {
                let duration = "timeout";
                if (error === undefined && data !== undefined) duration = await data;
                onFinish(duration)
            })
        }

        const TestButton = () => {
            if (props.latency?.tcpOnLoading || props.latency?.udpOnLoading)
                return <Spinner animation="border" size="sm" />
            return <a href="#empty"
                onClick={async () => {
                    updateTestingStatus((v) => { v.tcpOnLoading = true; v.udpOnLoading = true })
                    latency(
                        {
                            http: {
                                url: "https://clients3.google.com/generate_204"
                            }
                        },
                        (r) => { updateTestingStatus(async (v) => { v.tcpOnLoading = false; v.tcp = r }) })
                    latency(
                        {
                            dns_over_quic: {
                                host: "dns.nextdns.io:853",
                                target_domain: "www.google.com"
                            }
                        },
                        (r) => { updateTestingStatus(async (v) => { v.udpOnLoading = false; v.udp = r }) })
                }}>
                Test
            </a>
        }

        return <>
            <Badge className="rounded-pill bg-light text-dark ms-1 text-uppercase">
                tcp: {getStr(props.latency?.tcp)}
            </Badge>
            <Badge className="rounded-pill bg-light text-dark ms-1 me-1 text-uppercase">
                udp:{getStr(props.latency?.udp)}
            </Badge>
            <TestButton />
        </>
    })

    const Nodes = React.memo((props: { nodes?: { [key: string]: string } | null }) => {
        let entries = Object.entries((props.nodes !== undefined && props.nodes !== null) ? props.nodes : {});

        if (entries.length === 0)
            return <Card.Body>
                <div className="text-center my-2" style={{ opacity: '0.4' }}>グールプはまだ指定されていません。</div>
            </Card.Body>

        return <ListGroup variant="flush">
            {
                entries
                    .sort((a, b) => { return a <= b ? -1 : 1 })
                    .map(([k, v]) => {
                        return <ListGroup.Item
                            key={v}
                            as={"label"}
                            style={{ border: "0ch", borderBottom: "1px solid #dee2e6" }}
                        >
                            <input
                                className="form-check-input me-1"
                                type="radio"
                                name="select_node"
                                value={v}
                                onChange={(e) => { setSelectNode(e.target.value) }}
                                checked={selectNode === v}
                            />
                            <a href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (data.nodes === null || data.nodes === undefined) return
                                    let node = data.nodes[v];

                                    let point =
                                        node !== undefined ?
                                            JSON.stringify(Point.toObject(Point.create(node), ToObjectOption), null, "  ")
                                            :
                                            ""
                                    setModalData({ point: point, hash: v })
                                }}
                            >
                                {k}
                            </a>
                            <NodeItem hash={v} latency={latency[v]} />
                        </ListGroup.Item>
                    })
            }
        </ListGroup>
    })


    return (
        <>
            <NodeModal
                show={modalData.point !== "" && modalData.hash !== ""}
                hash={modalData.hash}
                point={modalData.point}
                onChangePoint={(v) => { setModalData(prev => { return { ...prev, point: v } }) }}
                editable
                onHide={() => setModalData({ point: "", hash: "" })}
                onSave={() => mutate()}
            />

            <div>
                <Row>
                    <Col className="mb-4 d-flex">
                        <Dropdown onSelect={(e) => { setCurrentGroup(e != null ? e : "") }}>
                            <Dropdown.Toggle variant="light">{currentGroup !== "" ? currentGroup : "GROUP"}</Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item eventKey={""}>Select...</Dropdown.Item>

                                {
                                    data.groupsV2 !== null
                                    && data.groupsV2 !== undefined
                                    && Object
                                        .keys(data.groupsV2)
                                        .sort((a, b) => { return a <= b ? -1 : 1 })
                                        .map((k) => {
                                            return <Dropdown.Item eventKey={k} key={k}>{k}</Dropdown.Item>
                                        })
                                }
                            </Dropdown.Menu>
                        </Dropdown>
                    </Col>
                </Row>

                <Card className="mb-3">
                    <Nodes nodes={
                        currentGroup !== ""
                            && data.groupsV2 !== null
                            && data.groupsV2 !== undefined
                            ? data.groupsV2[currentGroup]?.nodesV2 : undefined
                    }
                    />

                    <Card.Header>
                        <Dropdown
                            onSelect={
                                async (key) => {
                                    Fetch(
                                        `/node`,
                                        {
                                            method: "PUT",
                                            body: UseRequest.encode({
                                                tcp: key === "tcp" || key === "tcpudp",
                                                udp: key === "udp" || key === "tcpudp",
                                                hash: selectNode,
                                            }).finish()
                                        }
                                    ).then(async ({ error }) => {
                                        if (error !== undefined) ctx.Error(`change node failed, ${error.code}| ${await error.msg}`)
                                        else ctx.Info(`Change${key} Node To ${selectNode} Successful`)
                                    })
                                }
                            }
                        >
                            <ButtonGroup>
                                <ButtonGroup>
                                    <Dropdown.Toggle variant="outline-primary">USE</Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item eventKey={"tcpudp"}>TCP&UDP</Dropdown.Item>
                                        <Dropdown.Item eventKey={"tcp"}>TCP</Dropdown.Item>
                                        <Dropdown.Item eventKey={"udp"}>UDP</Dropdown.Item>
                                    </Dropdown.Menu>
                                </ButtonGroup>
                                <Button
                                    variant="outline-danger"
                                    onClick={() => {
                                        Fetch(
                                            `/node`,
                                            {
                                                method: "DELETE",
                                                body: StringValue.encode({ value: selectNode }).finish()
                                            }
                                        ).then(async ({ error }) => {
                                            if (error !== undefined) {
                                                ctx.Error(`Delete Node ${selectNode} Failed ${error.code}| ${await error.msg}`)
                                            } else {
                                                ctx.Info(`Delete Node ${selectNode} Successful.`)
                                                mutate()
                                            }
                                        })
                                    }}
                                >
                                    DELETE
                                </Button>
                                {/* <Button variant="outline-primary" onClick={() => console.log("add new node")}>Add New Node</Button> */}
                            </ButtonGroup>
                        </Dropdown>
                    </Card.Header>
                </Card>
            </div >
        </>
    );
}

export default Group;