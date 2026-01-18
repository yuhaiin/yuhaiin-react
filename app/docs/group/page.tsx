"use client"

import { create } from "@bufbuild/protobuf";
import { Duration, StringValueSchema } from "@bufbuild/protobuf/wkt";
import Error from 'next/error';
import { FC, useContext, useState } from "react";
import { Accordion, Button, ButtonGroup, Col, Dropdown, DropdownButton, ListGroup, Row, Spinner } from "react-bootstrap";
import { useLocalStorage } from "usehooks-ts";
import { LatencyDNSUrlDefault, LatencyDNSUrlKey, LatencyHTTPUrlDefault, LatencyHTTPUrlKey, LatencyIPUrlDefault, LatencyIPUrlKey, LatencyIPv6Default, LatencyIPv6Key, LatencyStunTCPUrlDefault, LatencyStunTCPUrlKey, LatencyStunUrlDefault, LatencyStunUrlKey } from "../common/apiurl";
import Loading from "../common/loading";
import { Nodes, NodesContext } from "../common/nodes";
import { FetchProtobuf, useProtoSWR } from '../common/proto';
import { GlobalToastContext } from "../common/toast";
import { NodeJsonModal, NodeModal } from "../node/modal";
import { node, use_reqSchema } from "../pbes/api/node_pb";
import { dns_over_quicSchema, http_testSchema, ipSchema, nat_type, reply, request_protocol, request_protocolSchema, requestsSchema, stunSchema } from "../pbes/node/latency_pb";
import { origin, point, pointSchema } from "../pbes/node/point_pb";

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
    const [groupIndex, setGroupIndex] = useState(-1);
    const [modalData, setModalData] = useState(new ModalData());
    const [importJson, setImportJson] = useState({ data: false });
    const [latency, setLatency] = useState<{ [key: string]: latencyStatus }>({})

    const [latencyHTTP] = useLocalStorage(LatencyHTTPUrlKey, LatencyHTTPUrlDefault);
    const [latencyDNS] = useLocalStorage(LatencyDNSUrlKey, LatencyDNSUrlDefault);
    const [latencyIPv6] = useLocalStorage(LatencyIPv6Key, LatencyIPv6Default);
    const [latencyIPUrl] = useLocalStorage(LatencyIPUrlKey, LatencyIPUrlDefault);
    const [latencyStunUrl] = useLocalStorage(LatencyStunUrlKey, LatencyStunUrlDefault);
    const [latencyStunTCPUrl] = useLocalStorage(LatencyStunTCPUrlKey, LatencyStunTCPUrlDefault);

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
            <NodesContext value={new Nodes(data)}>
                <NodeModal
                    show={modalData.show}
                    hash={modalData.hash}
                    point={modalData.point}
                    isNew={modalData.isNew}
                    onDelete={modalData.onDelete}
                    editable
                    onHide={() => setModalData({ ...modalData, show: false })}
                    onSave={() => mutate()}
                    groups={data.groups.map((v) => { return v.name })}
                />

                <NodeJsonModal
                    show={importJson.data}
                    onSave={() => mutate()}
                    onHide={() => setImportJson({ data: false })}
                    isNew
                />

            </NodesContext>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <Dropdown
                    onSelect={(e) => { const i = Number(e); if (!isNaN(i)) setGroupIndex(i) }}
                >
                    <Dropdown.Toggle variant="outline-primary">{groupIndex >= 0 && data.groups.length > groupIndex ? data.groups[groupIndex].name : "GROUP"}</Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item eventKey={-1}>Select...</Dropdown.Item>

                        {
                            data.groups?.map((k, i) => {
                                return <Dropdown.Item eventKey={i} key={i}>{k.name}</Dropdown.Item>
                            })
                        }
                    </Dropdown.Menu>
                </Dropdown>

                <ButtonGroup>
                    <Button
                        variant="outline-primary"
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
                        <i className="bi bi-plus-lg" />&nbsp;New
                    </Button>

                    <Button
                        variant="outline-primary"
                        onClick={() => { setImportJson({ data: true }) }}
                    >
                        <i className="bi bi-box-arrow-in-down" />&nbsp;Import
                    </Button>
                </ButtonGroup>
            </div>

            <Accordion className="mb-3" alwaysOpen id="connections">
                {
                    groupIndex >= 0
                    && data.groups.length > groupIndex
                    && data.groups[groupIndex].nodes
                        .map((v) => {
                            return <NodeItemv2
                                key={v.hash}
                                hash={v.hash}
                                name={v.name}
                                latency={latency[v.hash] ?? { tcp: { loading: false, value: "N/A" }, udp: { loading: false, value: "N/A" }, }}
                                onChangeLatency={(e) => { setLatency(prev => { return { ...prev, [v.hash]: e(prev[v.hash] ?? { tcp: { loading: false, value: "N/A" }, udp: { loading: false, value: "N/A" }, }) } }) }}
                                onClickEdit={() => { openModal(v.hash) }}
                                ipv6={latencyIPv6}
                                urls={{
                                    ip: latencyIPUrl,
                                    tcp: latencyHTTP,
                                    udp: latencyDNS,
                                    stun: latencyStunUrl,
                                    stunTCP: latencyStunTCPUrl,
                                }}
                            />
                        })
                }
            </Accordion>
        </>
    );
}

export default Group;

const createLatencyRequest = (r:
    { url: string; case: "http"; } |
    { host: string; targetDomain: string; case: "dnsOverQuic"; } |
    { url: string; userAgent?: string; case: "ip"; } |
    { host: string; tcp: boolean; case: "stun"; },
): request_protocol => {
    switch (r.case) {
        case "http":
            return create(request_protocolSchema, { protocol: { case: "http", value: create(http_testSchema, { url: r.url }) } })
        case "dnsOverQuic":
            return create(request_protocolSchema, {
                protocol: {
                    case: "dnsOverQuic",
                    value: create(dns_over_quicSchema, { host: r.host, targetDomain: r.targetDomain })
                }
            })
        case "ip":
            return create(request_protocolSchema, {
                protocol: {
                    case: "ip",
                    value: create(ipSchema, { url: r.url, userAgent: r.userAgent })
                }
            })
        case "stun":
            return create(request_protocolSchema, {
                protocol: {
                    case: "stun",
                    value: create(stunSchema, { host: r.host, tcp: r.tcp })
                }
            })
    }
}

type Request = {
    request: request_protocol,
    setLoading: (loading: boolean, error?: string) => void,
    setResult: (result: reply) => void,
}

const createLatencyReqByType = (
    type: LatencyType,
    latency: latencyStatus,
    setState: (x: (x: latencyStatus) => latencyStatus) => void,
    urls: {
        tcp: string,
        udp: string,
        ip: string,
        stun: string,
        stunTCP: string
    }
): Request => {
    switch (type) {
        case LatencyType.TCP:
            return {
                request: createLatencyRequest({ case: "http", url: urls.tcp }),
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
                request: createLatencyRequest({ case: "dnsOverQuic", host: urls.udp, targetDomain: "www.google.com" }),
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
                request: createLatencyRequest({ case: "ip", url: urls.ip }),
                setLoading: (loading: boolean, error?: string) => {
                    setState((prev) => {
                        return {
                            ...prev, ip: {
                                loading: loading,
                                ipv4: latency.ip ? latency.ip.ipv4 : "N/A",
                                ipv6: latency.ip ? latency.ip.ipv6 : "N/A"
                            }
                        }
                    })
                    if (error) setState((prev) => {
                        return {
                            ...prev, ip: {
                                loading: false,
                                ipv4: error,
                                ipv6: error
                            }
                        }
                    })
                },
                setResult: (r: reply) => {
                    if (r.reply.case === "ip") {
                        const ipv4 = r.reply.value.ipv4
                        const ipv6 = r.reply.value.ipv6
                        setState((prev) => {
                            return {
                                ...prev, ip: {
                                    ipv4: ipv4,
                                    ipv6: ipv6,
                                    loading: false
                                }
                            }
                        })
                    }
                }
            }
        case LatencyType.STUNTCP:
            return {
                request: createLatencyRequest({ case: "stun", host: urls.stunTCP, tcp: true }),
                setLoading: (loading: boolean, error?: string) => {
                    setState((prev) => {
                        return {
                            ...prev, stun_tcp: {
                                loading: loading,
                                ip: latency.stun_tcp ? latency.stun_tcp.ip : "N/A"
                            }
                        }
                    })
                    if (error) setState((prev) => {
                        return {
                            ...prev, stun_tcp: {
                                loading: false,
                                ip: error
                            }
                        }
                    })
                },
                setResult: (r: reply) => {
                    if (r.reply.case === "stun") {
                        const ip = r.reply.value.mappedAddress
                        setState((prev) => {
                            return {
                                ...prev, stun_tcp: {
                                    ip: ip,
                                    loading: false
                                }
                            }
                        })
                    }
                }
            }
        case LatencyType.STUN:
            return {
                request: createLatencyRequest({ case: "stun", host: urls.stun, tcp: false }),
                setLoading: (loading: boolean, error?: string) => {
                    setState((prev) => {
                        return {
                            ...prev, stun: {
                                loading: loading,
                                mappedAddress: latency.stun ? latency.stun.mappedAddress : "N/A",
                                mapping: latency.stun ? latency.stun.mapping : "N/A",
                                filtering: latency.stun ? latency.stun.filtering : "N/A"
                            }
                        }
                    })
                    if (error) setState((prev) => {
                        return {
                            ...prev, stun: {
                                loading: false,
                                mappedAddress: error,
                                mapping: error,
                                filtering: error
                            }
                        }
                    })
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
    onClickEdit: () => void,
    urls: {
        tcp: string,
        udp: string,
        ip: string,
        stun: string,
        stunTCP: string,
    },
    ipv6?: boolean,
}> = ({ hash, name, onClickEdit, onChangeLatency, latency, ipv6, urls }) => {
    const ctx = useContext(GlobalToastContext);

    const test = (type: LatencyType) => {
        const { request, setLoading, setResult } = createLatencyReqByType(type, latency, onChangeLatency, urls)

        setLoading(true)

        FetchProtobuf(node.method.latency, create(requestsSchema, {
            requests: [{
                hash: hash,
                id: "latency",
                ipv6: ipv6,
                method: request
            }]
        }))
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
                    <Row>
                        <Col md={6}>
                            <div className="d-flex justify-content-between">
                                <div className="fw-bold">TCP</div>
                                <div className="text-break">{latency.tcp.value}</div>
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="d-flex justify-content-between">
                                <div className="fw-bold">UDP</div>
                                <div className="text-break">{latency.udp.value}</div>
                            </div>
                        </Col>
                    </Row>
                </ListGroup.Item>
                {latency.ip && <>
                    <ListGroup.Item>
                        <Row>
                            <Col md={6}>
                                <div className="d-flex justify-content-between">
                                    <div className="fw-bold">IPv4</div>
                                    <div className="text-break">{latency.ip.ipv4}</div>
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className="d-flex justify-content-between">
                                    <div className="fw-bold">IPv6</div>
                                    <div className="text-break">{latency.ip.ipv6}</div>
                                </div>
                            </Col>
                        </Row>
                    </ListGroup.Item>
                </>}
                {latency.stun && <>
                    <ListGroup.Item>
                        <div className="d-flex justify-content-between">
                            <div className="fw-bold text-truncate">Mapping</div>
                            <div className="text-break">{latency.stun.mapping}</div>
                        </div>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <div className="d-flex justify-content-between">
                            <div className="fw-bold text-truncate">Filtering</div>
                            <div className="text-break">{latency.stun.filtering}</div>
                        </div>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <div className="d-flex justify-content-between">
                            <div className="fw-bold text-truncate">MappedAddress</div>
                            <div className="text-break">{latency.stun.mappedAddress}</div>
                        </div>
                    </ListGroup.Item>
                </>}
                {latency.stun_tcp &&
                    <ListGroup.Item>
                        <div className="d-flex justify-content-between">
                            <div className="fw-bold text-truncate">STUN IP</div>
                            <div className="text-break">{latency.stun_tcp.ip}</div>
                        </div>
                    </ListGroup.Item>
                }
                <ListGroup.Item>
                    <div className="d-flex justify-content-center">
                        <ButtonGroup>
                            <Button variant="outline-primary" onClick={() => setNode(ctx, hash)}><i className="bi bi-check2-circle" />&nbsp;Use</Button>
                            <Button variant="outline-primary" onClick={onClickEdit}><i className="bi bi-pencil" />&nbsp;Edit</Button>
                            <DropdownButton
                                onSelect={async (key) => { test(key as LatencyType) }}
                                as={ButtonGroup}
                                variant="outline-primary"
                                title={<><i className="bi bi-speedometer2" />&nbsp;Test{isLoading(latency) && <>&nbsp;<Spinner size="sm" animation="border" /></>}</>}
                            >
                                <Dropdown.Item disabled={latency.tcp.loading} eventKey={LatencyType.TCP}>TCP&nbsp;{latency.tcp.loading && <Spinner size="sm" animation="border" />}</Dropdown.Item>
                                <Dropdown.Item disabled={latency.udp.loading} eventKey={LatencyType.UDP}>UDP&nbsp;{latency.udp.loading && <Spinner size="sm" animation="border" />} </Dropdown.Item>
                                <Dropdown.Item disabled={latency.stun?.loading} eventKey={LatencyType.STUN}>STUN&nbsp;{latency.stun?.loading && <Spinner size="sm" animation="border" />}</Dropdown.Item>
                                <Dropdown.Item disabled={latency.stun_tcp?.loading} eventKey={LatencyType.STUNTCP}>STUN TCP&nbsp;{latency.stun_tcp?.loading && <Spinner size="sm" animation="border" />}</Dropdown.Item>
                                <Dropdown.Item disabled={latency.ip?.loading} eventKey={LatencyType.IP}>IP&nbsp;{latency.ip?.loading && <Spinner size="sm" animation="border" />}</Dropdown.Item>
                            </DropdownButton>
                        </ButtonGroup>
                    </div>
                </ListGroup.Item>
            </ListGroup>
        </Accordion.Body>
    </Accordion.Item>
}

function setNode(ctx: { Info: (msg: string) => void, Error: (msg: string) => void }, hash: string) {
    FetchProtobuf(node.method.use, create(use_reqSchema, { hash: hash, }))
        .then(async ({ error }) => {
            if (error !== undefined) ctx.Error(`change node failed, ${error.code}| ${error.msg}`)
            else ctx.Info(`Change Node To ${hash} Successful`)
        })
}
