"use client"

import { create } from "@bufbuild/protobuf";
import { Duration, StringValueSchema } from "@bufbuild/protobuf/wkt";
import Error from 'next/error';
import { FC, useContext, useState } from "react";
import { Accordion, Button, ButtonGroup, Col, Dropdown, DropdownButton, ListGroup, Row, Spinner } from "react-bootstrap";
import { LatencyDNSUrl, LatencyHTTPUrl, LatencyIPUrl, LatencyIPv6, LatencyStunTCPUrl, LatencyStunUrl } from "../common/apiurl";
import Loading from "../common/loading";
import { FetchProtobuf, useProtoSWR } from '../common/proto';
import { GlobalToastContext } from "../common/toast";
import { NodeJsonModal, NodeModal } from "../node/modal";
import { node, use_reqSchema } from "../pbes/node/grpc/node_pb";
import { dns_over_quicSchema, httpSchema, ipSchema, nat_type, protocol, protocolSchema, reply, requestsSchema, stunSchema } from "../pbes/node/latency/latency_pb";
import { origin, point, pointSchema } from "../pbes/node/point/point_pb";

const Nanosecond = 1
const Microsecond = 1000 * Nanosecond
const Millisecond = 1000 * Microsecond
const Second = 1000 * Millisecond
const Minute = 60 * Second
const Hour = 60 * Minute

function durationToStroing(x: Duration): string {
    if (x.nanos === 0 && Number(x.seconds) === 0) return "timeout"
    const total = Number(x.seconds) * Second + x.nanos * Nanosecond;
    if (total >= Hour) return `${total / Hour} h`
    if (total >= Minute) return `${total / Minute} m`
    if (total >= Second) return `${total / Second} s`
    if (total >= Millisecond) return `${total / Millisecond} ms`
    if (total >= Microsecond) return `${total / Microsecond} us`
    return `${total / Nanosecond} ns`
}

enum LatencyType {
    TCP = "tcp",
    UDP = "udp",
    IP = "ip",
    STUN = "stun",
    STUNTCP = "stun-tcp",
}

type latencyStatus = {
    tcp: {
        loading: boolean,
        value: string
    }
    udp: {
        loading: boolean,
        value: string
    }
    ip?: {
        loading: boolean,
        ipv4: string,
        ipv6: string
    }
    stun?: {
        loading: boolean,
        mapping: string,
        filtering: string,
        mappedAddress: string
    }
    stun_tcp?: {
        loading: boolean,
        ip: string
    }
}

function isLoading(x: latencyStatus): boolean {
    return x.tcp.loading || x.udp.loading || x.ip?.loading || x.stun?.loading || x.stun_tcp?.loading || false
}

// function isAllLoading(x: latencyStatus): boolean {
//     return x.tcp.loading && x.udp.loading && (x.ip ? x.ip?.loading : false) && (x.stun ? x.stun.loading : false) && (x.stun_tcp ? x.stun_tcp.loading : false)
// }

const getNatTypeString = (x: nat_type): string => {
    switch (x) {
        case nat_type.NAT_UNKNOWN: return "unknown"
        case nat_type.NAT_NO_RESULT: return "noresult"
        case nat_type.NAT_AddressAndPortDependent: return "address-and-port-dependent"
        case nat_type.NAT_AddressDependent: return "address-dependent"
        case nat_type.NAT_EndpointIndependent: return "endpoint-independent"
        case nat_type.NAT_EndpointIndependentNoNAT: return "endpoint-independent-no-nat"
        case nat_type.NAT_ServerNotSupportChangePort: return "server-not-support"
        default: return "unknown"
    }
}

class ModalData {
    point?: point
    hash: string
    show: boolean
    onDelete?: () => void
    isNew?: boolean

    constructor(data?: Partial<ModalData>) {
        this.point = data?.point
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
    const [latency, setLatency] = useState<{ [key: string]: latencyStatus }>({})

    const { data, error, isLoading, mutate } = useProtoSWR(node.method.list)

    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || data === undefined) return <Loading />


    const openModal = (hash: string) => {
        setModalData({
            hash: hash,
            show: true,
            onDelete: () => {
                FetchProtobuf(node.method.remove, create(StringValueSchema, { value: hash }))
                    .then(async ({ error }) => {
                        if (error !== undefined) {
                            ctx.Error(`Delete Node ${hash} Failed ${error.code}| ${error.msg}`)
                        } else {
                            ctx.Info(`Delete Node ${hash} Successful.`)
                            mutate()
                        }
                    })
            }
        })
    }

    return (
        <>
            <NodeModal
                show={modalData.show}
                hash={modalData.hash}
                point={modalData.point}
                isNew={modalData.isNew}
                onDelete={modalData.onDelete}
                editable
                onHide={() => setModalData({ ...modalData, show: false })}
                onSave={() => mutate()}
                groups={Object.keys(data.groups).sort((a, b) => { return a <= b ? -1 : 1 })}
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
                                    data.groups && Object
                                        .keys(data.groups)
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
                                        point: create(pointSchema, {
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

                <Accordion className="mb-3" alwaysOpen id="connections">
                    {
                        data.groups[currentGroup] && Object.entries(data.groups[currentGroup].nodesV2)
                            .sort((a, b) => { return a <= b ? -1 : 1 })
                            .map(([k, v]) => {
                                return <NodeItemv2
                                    key={v}
                                    hash={v}
                                    name={k}
                                    latency={latency[v] ?? { tcp: { loading: false, value: "N/A" }, udp: { loading: false, value: "N/A" }, }}
                                    onChangeLatency={(e) => { setLatency(prev => { return { ...prev, [v]: e(prev[v] ?? { tcp: { loading: false, value: "N/A" }, udp: { loading: false, value: "N/A" }, }) } }) }}
                                    onClickEdit={() => { openModal(v) }}
                                />
                            })
                    }
                </Accordion>
            </div >
        </>
    );
}

export default Group;

const createLatencyRequest = (r:
    { url: string; case: "http"; } |
    { host: string; targetDomain: string; case: "dnsOverQuic"; } |
    { url: string; userAgent?: string; case: "ip"; } |
    { host: string; tcp: boolean; case: "stun"; },
): protocol => {
    switch (r.case) {
        case "http":
            return create(protocolSchema, { protocol: { case: "http", value: create(httpSchema, { url: r.url }) } })
        case "dnsOverQuic":
            return create(protocolSchema, {
                protocol: {
                    case: "dnsOverQuic",
                    value: create(dns_over_quicSchema, { host: r.host, targetDomain: r.targetDomain })
                }
            })
        case "ip":
            return create(protocolSchema, {
                protocol: {
                    case: "ip",
                    value: create(ipSchema, { url: r.url, userAgent: r.userAgent })
                }
            })
        case "stun":
            return create(protocolSchema, {
                protocol: {
                    case: "stun",
                    value: create(stunSchema, { host: r.host, tcp: r.tcp })
                }
            })
    }
}

type Request = {
    request: protocol,
    setLoading: (loading: boolean, error?: string) => void,
    setResult: (result: reply) => void
}

const createLatencyReqByType = (type: LatencyType, latency: latencyStatus, setState: (x: (x: latencyStatus) => latencyStatus) => void): Request => {
    switch (type) {
        case LatencyType.TCP:
            return {
                request: createLatencyRequest({ case: "http", url: LatencyHTTPUrl }),
                setLoading: (loading: boolean, error?: string) => {
                    setState((prev) => { return { ...prev, tcp: { ...prev.tcp, loading: loading } } })
                    if (error) setState((prev) => { return { ...prev, tcp: { loading: false, value: error } } })
                },
                setResult: (r: reply) => {
                    if (r.reply.case === "latency") {
                        const value = durationToStroing(r.reply.value)
                        setState((prev) => { return { ...prev, tcp: { value: value, loading: false } } })
                    }
                }
            }
        case LatencyType.UDP:
            return {
                request: createLatencyRequest({ case: "dnsOverQuic", host: LatencyDNSUrl, targetDomain: "www.google.com" }),
                setLoading: (loading: boolean, error?: string) => {
                    setState((prev) => { return { ...prev, udp: { ...prev.udp, loading: loading } } })
                    if (error) setState((prev) => { return { ...prev, udp: { loading: false, value: error } } })
                },
                setResult: (r: reply) => {
                    if (r.reply.case === "latency") {
                        const value = durationToStroing(r.reply.value)
                        setState((prev) => { return { ...prev, udp: { value: value, loading: false } } })
                    }
                }
            }
        case LatencyType.IP:
            return {
                request: createLatencyRequest({ case: "ip", url: LatencyIPUrl }),
                setLoading: (loading: boolean, error?: string) => {
                    setState((prev) => { return { ...prev, ip: { loading: loading, ipv4: latency.ip ? latency.ip.ipv4 : "N/A", ipv6: latency.ip ? latency.ip.ipv6 : "N/A" } } })
                    if (error) setState((prev) => { return { ...prev, ip: { loading: false, ipv4: error, ipv6: error } } })
                },
                setResult: (r: reply) => {
                    if (r.reply.case === "ip") {
                        const ipv4 = r.reply.value.ipv4
                        const ipv6 = r.reply.value.ipv6
                        setState((prev) => { return { ...prev, ip: { ipv4: ipv4, ipv6: ipv6, loading: false } } })
                    }
                }
            }
        case LatencyType.STUNTCP:
            return {
                request: createLatencyRequest({ case: "stun", host: LatencyStunTCPUrl, tcp: true }),
                setLoading: (loading: boolean, error?: string) => {
                    setState((prev) => { return { ...prev, stun_tcp: { loading: loading, ip: latency.stun_tcp ? latency.stun_tcp.ip : "N/A" } } })
                    if (error) setState((prev) => { return { ...prev, stun_tcp: { loading: false, ip: error } } })
                },
                setResult: (r: reply) => {
                    if (r.reply.case === "stun") {
                        const ip = r.reply.value.mappedAddress
                        setState((prev) => { return { ...prev, stun_tcp: { ip: ip, loading: false } } })
                    }
                }
            }
        case LatencyType.STUN:
            return {
                request: createLatencyRequest({ case: "stun", host: LatencyStunUrl, tcp: false }),
                setLoading: (loading: boolean, error?: string) => {
                    setState((prev) => { return { ...prev, stun: { loading: loading, mappedAddress: latency.stun ? latency.stun.mappedAddress : "N/A", mapping: latency.stun ? latency.stun.mapping : "N/A", filtering: latency.stun ? latency.stun.filtering : "N/A" } } })
                    if (error) setState((prev) => { return { ...prev, stun: { loading: false, mappedAddress: error, mapping: error, filtering: error } } })
                },
                setResult: (r: reply) => {
                    if (r.reply.case === "stun") {
                        const mapping = getNatTypeString(r.reply.value.Mapping)
                        const filtering = getNatTypeString(r.reply.value.Filtering)
                        const mappedAddress = r.reply.value.mappedAddress
                        setState((prev) => {
                            return {
                                ...prev, stun: {
                                    loading: false,
                                    mapping: mapping,
                                    filtering: filtering,
                                    mappedAddress: mappedAddress
                                }
                            }
                        })
                    }
                }
            }
    }
}

const NodeItemv2: FC<{
    hash: string, name: string,
    latency: latencyStatus,
    onChangeLatency: (x: (s: latencyStatus) => latencyStatus) => void
    onClickEdit: () => void
}> = ({ hash, name, onClickEdit, onChangeLatency, latency }) => {
    const ctx = useContext(GlobalToastContext);

    const test = (type: LatencyType) => {
        const { request, setLoading, setResult } = createLatencyReqByType(type, latency, onChangeLatency)

        setLoading(true)

        FetchProtobuf(node.method.latency, create(requestsSchema, { requests: [{ hash: hash, id: "latency", ipv6: LatencyIPv6, protocol: request }] }))
            .then(async ({ data: resp, error }) => {
                if (error) {
                    console.log(`test failed ${error.code}| ${error.msg}`)
                    setLoading(false, `${error.code}| ${error.msg}`)
                    return
                }

                if (resp && resp.idLatencyMap["latency"]) {
                    const rr = resp.idLatencyMap["latency"]
                    if (rr.reply.case === "error") {
                        console.log(`test failed ${rr.reply.value.msg}`)
                        setLoading(false, rr.reply.value.msg);
                        return
                    }

                    setLoading(false);
                    setResult(rr)
                } else {
                    setLoading(false, "timeout")
                }
            })
    }

    return <Accordion.Item eventKey={hash}>
        <Accordion.Header>{name}</Accordion.Header>
        <Accordion.Body>
            <ListGroup variant="flush">

                <ListGroup.Item>
                    <div className="d-xl-flex">
                        <div className="endpoint-name flex-grow-1 notranslate">TCP</div>
                        <div className="notranslate text-break" style={{ opacity: 0.6 }} id="statistic-download">{latency.tcp.value}</div>
                    </div>
                </ListGroup.Item>


                <ListGroup.Item>
                    <div className="d-xl-flex">
                        <div className="endpoint-name flex-grow-1 notranslate">UDP</div>
                        <div className="notranslate text-break" style={{ opacity: 0.6 }} id="statistic-upload">{latency.udp.value}</div>
                    </div>
                </ListGroup.Item>

                {
                    latency.ip &&
                    <>
                        <ListGroup.Item>
                            <div className="d-xl-flex">
                                <div className="endpoint-name flex-grow-1 notranslate">IPv4</div>
                                <div className="notranslate text-break" style={{ opacity: 0.6 }} id="statistic-upload">{latency.ip.ipv4}</div>
                            </div>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <div className="d-xl-flex">
                                <div className="endpoint-name flex-grow-1 notranslate">IPv6</div>
                                <div className="notranslate text-break" style={{ opacity: 0.6 }} id="statistic-upload">{latency.ip.ipv6}</div>
                            </div>
                        </ListGroup.Item>
                    </>
                }

                {
                    latency.stun &&
                    <>
                        <ListGroup.Item>
                            <div className="d-xl-flex text-truncate">
                                <div className="endpoint-name flex-grow-1 notranslate text-truncate">Mapping</div>
                                <div className="notranslate text-break" style={{ opacity: 0.6 }} id="statistic-upload">{latency.stun.mapping}</div>
                            </div>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <div className="d-xl-flex text-truncate">
                                <div className="endpoint-name flex-grow-1 notranslate text-truncate">Filtering</div>
                                <div className="notranslate text-break" style={{ opacity: 0.6 }} id="statistic-upload">{latency.stun.filtering}</div>
                            </div>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <div className="d-xl-flex text-truncate">
                                <div className="endpoint-name flex-grow-1 notranslate text-truncate">MappedAddress</div>
                                <div className="notranslate text-break" style={{ opacity: 0.6 }} id="statistic-upload">{latency.stun.mappedAddress}</div>
                            </div>
                        </ListGroup.Item>
                    </>
                }

                {
                    latency.stun_tcp &&
                    <ListGroup.Item>
                        <div className="d-xl-flex text-truncate">
                            <div className="endpoint-name flex-grow-1 notranslate text-truncate">STUN IP</div>
                            <div className="notranslate text-break" style={{ opacity: 0.6 }} id="statistic-upload">{latency.stun_tcp.ip}</div>
                        </div>
                    </ListGroup.Item>
                }

                <ListGroup.Item className="d-flex justify-content-center">
                    <ButtonGroup>
                        <DropdownButton
                            onSelect={async (key) => { setNode(ctx, hash, key as LatencyType); }}
                            as={ButtonGroup}
                            variant="outline-primary"
                            title="USE"
                        >
                            <Dropdown.Item eventKey={"tcpudp"}>TCP and UDP</Dropdown.Item>
                            <Dropdown.Item eventKey={"tcp"}>TCP</Dropdown.Item>
                            <Dropdown.Item eventKey={"udp"}>UDP</Dropdown.Item>
                        </DropdownButton>
                        <Button variant="outline-primary" onClick={onClickEdit}>Edit</Button>

                        <DropdownButton
                            onSelect={async (key) => { test(key as LatencyType) }}
                            as={ButtonGroup}
                            variant="outline-primary"
                            title={<>Test{isLoading(latency) && <>&nbsp;<Spinner size="sm" animation="border" /></>}</>}
                        >
                            <Dropdown.Item disabled={latency.tcp.loading} eventKey={LatencyType.TCP}>TCP&nbsp;{latency.tcp.loading && <Spinner size="sm" animation="border" />}</Dropdown.Item>
                            <Dropdown.Item disabled={latency.udp.loading} eventKey={LatencyType.UDP}>UDP&nbsp;{latency.udp.loading && <Spinner size="sm" animation="border" />} </Dropdown.Item>
                            <Dropdown.Item disabled={latency.stun?.loading} eventKey={LatencyType.STUN}>STUN&nbsp;{latency.stun?.loading && <Spinner size="sm" animation="border" />}</Dropdown.Item>
                            <Dropdown.Item disabled={latency.stun_tcp?.loading} eventKey={LatencyType.STUNTCP}>STUN TCP&nbsp;{latency.stun_tcp?.loading && <Spinner size="sm" animation="border" />}</Dropdown.Item>
                            <Dropdown.Item disabled={latency.ip?.loading} eventKey={LatencyType.IP}>IP&nbsp;{latency.ip?.loading && <Spinner size="sm" animation="border" />}</Dropdown.Item>
                        </DropdownButton>
                    </ButtonGroup>
                </ListGroup.Item>
            </ListGroup>
        </Accordion.Body>
    </Accordion.Item>
}

function setNode(ctx: { Info: (msg: string) => void, Error: (msg: string) => void }, hash: string, key: string) {
    FetchProtobuf(node.method.use, create(use_reqSchema, {
        tcp: key === "tcp" || key === "tcpudp",
        udp: key === "udp" || key === "tcpudp",
        hash: hash,
    }))
        .then(async ({ error }) => {
            if (error !== undefined) ctx.Error(`change node failed, ${error.code}| ${error.msg}`)
            else ctx.Info(`Change ${key} Node To ${hash} Successful`)
        })
}
