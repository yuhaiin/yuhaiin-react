"use client"

import React, { useContext, useState } from "react";
import { Row, Col, ButtonGroup, Button, Dropdown, Card, ListGroup, Badge, Spinner, DropdownButton } from "react-bootstrap";
import NodeModal, { NodeJsonModal } from "../modal/node";
import Loading from "../common/loading";
import { GlobalToastContext } from "../common/toast";
import useSWR from 'swr'
import { Fetch, ProtoESFetcher } from '../common/proto';
import Error from 'next/error';
import { LatencyDNSUrl, LatencyHTTPUrl, LatencyIPv6 } from "../apiurl";
import { manager } from "../pbes/node/node_pb";
import { dns_over_quic, http, protocol, requests, response } from "../pbes/node/latency/latency_pb";
import { use_req } from "../pbes/node/grpc/node_pb";
import { StringValue } from "@bufbuild/protobuf";
import { origin, point } from "../pbes/node/point/point_pb";

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

const NodeItem = React.memo((props: {
    title: string,
    hash: string,
    latency: Latency,
    onChangeLatency: (x: Latency) => void
    onClickEdit: () => void
}) => {
    const ctx = useContext(GlobalToastContext);
    const updateTestingStatus = (modify: (x: Latency) => void) => {
        modify(props.latency)
        props.onChangeLatency(props.latency)
    }

    const latencyButtonVar = (latency: Latency) => {
        if (!latency.tcp && !latency.udp)
            return "secondary"
        if (latency.tcp === "timeout" && latency.udp === "timeout")
            return "danger"
        return "success"
    }

    const latency = (protocol: protocol, onFinish: (r: string) => void) => {
        Fetch<string>("/latency", {
            body: new requests({
                requests: [{
                    hash: props.hash,
                    id: "latency",
                    ipv6: LatencyIPv6,
                    protocol: protocol
                }]
            }).toBinary(),
            process: async (r) => {
                let resp = new response().fromBinary(new Uint8Array(await r.arrayBuffer()));
                const t = resp.idLatencyMap["latency"]
                if (t && (t.nanos !== 0 || t.seconds !== BigInt(0))) return durationToStroing(Number(t.seconds), t.nanos)
                return "timeout"
            }
        }).then(async ({ data, error }) => {
            let duration = "timeout";
            if (!error && data) duration = await data;
            onFinish(duration)
        })
    }


    return <Col className="mb-3">
        <Card className="h-100 shadow-sm">
            <Card.Header>
                {props.title}
            </Card.Header>
            <Card.Body>
                <ListGroup variant="flush">

                    <ListGroup.Item>

                        <div className="d-sm-flex">
                            <div className="endpoint-name flex-grow-1 notranslate">TCP</div>
                            <div className="notranslate" style={{ opacity: 0.6 }} id="statistic-download">{props.latency.tcp ?? "N/A"}</div>
                        </div>
                    </ListGroup.Item>


                    <ListGroup.Item>
                        <div className="d-sm-flex">
                            <div className="endpoint-name flex-grow-1 notranslate">UDP</div>
                            <div className="notranslate" style={{ opacity: 0.6 }} id="statistic-upload">{props.latency.udp ?? "N/A"}</div>
                        </div>
                    </ListGroup.Item>

                    <ListGroup.Item>
                        <ButtonGroup className="d-sm-flex">
                            <DropdownButton
                                onSelect={
                                    async (key) => {
                                        Fetch(
                                            `/node`,
                                            {
                                                method: "PUT",
                                                body: new use_req({
                                                    tcp: key === "tcp" || key === "tcpudp",
                                                    udp: key === "udp" || key === "tcpudp",
                                                    hash: props.hash,
                                                }).toBinary()
                                            }
                                        ).then(async ({ error }) => {
                                            if (error !== undefined) ctx.Error(`change node failed, ${error.code}| ${await error.msg}`)
                                            else ctx.Info(`Change ${key} Node To ${props.hash} Successful`)
                                        })
                                    }
                                }
                                as={ButtonGroup}
                                variant="outline-primary"
                                title="USE"
                                className="w-100"
                            >
                                <Dropdown.Item eventKey={"tcpudp"}>TCP&UDP</Dropdown.Item>
                                <Dropdown.Item eventKey={"tcp"}>TCP</Dropdown.Item>
                                <Dropdown.Item eventKey={"udp"}>UDP</Dropdown.Item>
                            </DropdownButton>
                            <Button variant="outline-primary" className="w-100" onClick={props.onClickEdit}>Edit</Button>

                            <Button
                                variant={"outline-" + latencyButtonVar(props.latency)}
                                className="w-100"
                                disabled={props.latency.tcpOnLoading || props.latency.udpOnLoading}
                                onClick={async () => {
                                    updateTestingStatus((v) => { v.tcpOnLoading = true; v.udpOnLoading = true })
                                    latency(
                                        new protocol({ protocol: { case: "http", value: new http({ url: LatencyHTTPUrl }) } }),
                                        (r) => { updateTestingStatus(async (v) => { v.tcpOnLoading = false; v.tcp = r }) })
                                    latency(
                                        new protocol({ protocol: { case: "dnsOverQuic", value: new dns_over_quic({ host: LatencyDNSUrl, targetDomain: "www.google.com" }) } }),
                                        (r) => { updateTestingStatus(async (v) => { v.udpOnLoading = false; v.udp = r }) })
                                }
                                }
                            >

                                {(props.latency.tcpOnLoading || props.latency.udpOnLoading) &&
                                    <Spinner size="sm" animation="border" variant={latencyButtonVar(props.latency)} />}
                                Test
                            </Button>
                        </ButtonGroup>
                    </ListGroup.Item>
                </ListGroup>
            </Card.Body>
        </Card>
    </Col>
})

class ModalData {
    point: point
    hash: string
    show: boolean
    onDelete?: () => void
    isNew?: boolean

    constructor(data?: Partial<ModalData>) {
        this.point = data?.point ?? new point({})
        this.hash = data?.hash ?? ""
        this.show = data?.show ?? false
        this.onDelete = data?.onDelete
    }
}
function Group() {
    const ctx = useContext(GlobalToastContext);
    const [currentGroup, setCurrentGroup] = useState("Select...");
    const [modalData, setModalData] = useState(new ModalData());
    const [importJson, setImportJson] = useState({ data: false });
    const [latency, setLatency] = useState<{ [key: string]: Latency }>({})

    const { data, error, isLoading, mutate } = useSWR("/nodes", ProtoESFetcher(new manager()))

    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || data === undefined) return <Loading />


    return (
        <>
            <NodeModal
                show={modalData.show}
                hash={modalData.hash}
                point={modalData.point}
                isNew={modalData.isNew}
                onDelete={modalData.onDelete}
                onChangePoint={(v) => { setModalData(prev => { return { ...prev, point: v } }) }}
                editable
                onHide={() => setModalData({ ...modalData, show: false })}
                onSave={() => mutate()}
                groups={Object.keys(data.groupsV2).sort((a, b) => { return a <= b ? -1 : 1 })}
            />

            <NodeJsonModal
                show={importJson.data}
                onSave={() => mutate()}
                onHide={() => setImportJson({ data: false })}
                isNew
            />



            <div>
                <Row>
                    <Col className="mb-4 d-flex">
                        <Dropdown onSelect={(e) => { setCurrentGroup(e != null ? e : "Select...") }}>
                            <Dropdown.Toggle variant="light">{currentGroup ?? "GROUP"}</Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item eventKey={"Select..."}>Select...</Dropdown.Item>

                                {
                                    data.groupsV2 && Object
                                        .keys(data.groupsV2)
                                        .sort((a, b) => { return a <= b ? -1 : 1 })
                                        .map((k) => {
                                            return <Dropdown.Item eventKey={k} key={k}>{k}</Dropdown.Item>
                                        })
                                }
                            </Dropdown.Menu>
                        </Dropdown>


                        <ButtonGroup className="ms-2 d-flex">
                            <Button
                                variant="outline-success"
                                className="w-100"
                                onClick={() => {
                                    setModalData({
                                        point: new point({
                                            group: "template_group",
                                            name: "template_name",
                                            origin: origin.manual,
                                        }),
                                        hash: "new node",
                                        show: true,
                                        onDelete: undefined,
                                        isNew: true
                                    })
                                }}
                            >
                                New
                            </Button>

                            <Button
                                variant="outline-success"
                                className="w-100"
                                onClick={() => { setImportJson({ data: true }) }}
                            >Import</Button>

                        </ButtonGroup>
                    </Col>
                </Row>

                {
                    (currentGroup && data.groupsV2 && data.groupsV2[currentGroup]) ?
                        <>
                            <Row className="row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4">
                                {
                                    Object.entries(data.groupsV2[currentGroup].nodesV2).
                                        sort((a, b) => { return a <= b ? -1 : 1 }).
                                        map(([k, v]) => {
                                            return <NodeItem
                                                hash={v}
                                                title={k}
                                                key={k}
                                                latency={latency[v] ?? {}}
                                                onChangeLatency={(e) => { setLatency(prev => { return { ...prev, [v]: e } }) }}
                                                onClickEdit={() => {
                                                    if (!data.nodes) return
                                                    setModalData({
                                                        point: data.nodes[v],
                                                        hash: v,
                                                        show: true,
                                                        onDelete: () => {
                                                            Fetch(
                                                                `/node`,
                                                                {
                                                                    method: "DELETE",
                                                                    body: new StringValue({ value: v }).toBinary()
                                                                }
                                                            ).then(async ({ error }) => {
                                                                if (error !== undefined) {
                                                                    ctx.Error(`Delete Node ${v} Failed ${error.code}| ${await error.msg}`)
                                                                } else {
                                                                    ctx.Info(`Delete Node ${v} Successful.`)
                                                                    mutate()
                                                                }
                                                            })
                                                        }
                                                    })
                                                }}
                                            />
                                        })
                                }
                            </Row>
                        </>
                        : <></>
                }

            </div >
        </>
    );
}

export default Group;