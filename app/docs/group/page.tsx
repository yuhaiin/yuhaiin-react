"use client"

import { create } from "@bufbuild/protobuf";
import { Duration, StringValueSchema } from "@bufbuild/protobuf/wkt";
import Error from 'next/error';
import { FC, useContext, useState } from "react";
import { Accordion, Button, ButtonGroup, Col, Dropdown, DropdownButton, ListGroup, Row, Spinner } from "react-bootstrap";
import useSWR from 'swr';
import { LatencyDNSUrl, LatencyHTTPUrl, LatencyIPUrl, LatencyIPv6, LatencyStunTCPUrl, LatencyStunUrl } from "../apiurl";
import Loading from "../common/loading";
import { FetchProtobuf, ProtoESFetcher } from '../common/proto';
import { GlobalToastContext } from "../common/toast";
import { NodeJsonModal, NodeModal } from "../modal/node";
import { node, use_reqSchema } from "../pbes/node/grpc/node_pb";
import { dns_over_quicSchema, httpSchema, ipSchema, nat_type, protocol, protocolSchema, requestsSchema, stunSchema } from "../pbes/node/latency/latency_pb";
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
        value?: string
    }
    udp: {
        loading: boolean,
        value?: string
    }
    ip: {
        loading: boolean,
        ipv4?: string,
        ipv6?: string
    }
    stun: {
        loading: boolean,
        mapping?: string,
        filtering?: string,
        mappedAddress?: string
    }
    stun_tcp: {
        loading: boolean,
        ip?: string
    }
}

const createLatencyStatus = (): latencyStatus => {
    return {
        tcp: { loading: false },
        udp: { loading: false },
        ip: { loading: false },
        stun: { loading: false },
        stun_tcp: { loading: false },
    }
}

function isLoading(x: latencyStatus): boolean {
    return x.tcp.loading || x.udp.loading || x.ip.loading || x.stun.loading || x.stun_tcp.loading
}

function isAllLoading(x: latencyStatus): boolean {
    return x.tcp.loading && x.udp.loading && x.ip.loading && x.stun.loading && x.stun_tcp.loading
}


type LatencyProps = {
    Latency?: string,
    IPv4?: string,
    IPv6?: string,
    Stun?: {
        mapping: string
        filter: string
        mappedAddress: string
    }
}

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

    const { data, error, isLoading, mutate } = useSWR("/nodes", ProtoESFetcher(node.method.list))

    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || data === undefined) return <Loading />


    const openModal = (hash: string) => {
        setModalData({
            hash: hash,
            show: true,
            onDelete: () => {
                FetchProtobuf(node.method.remove, `/node`, "DELETE",
                    create(StringValueSchema, { value: hash }),
                ).then(async ({ error }) => {
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
                                    latency={latency[v] ?? createLatencyStatus()}
                                    onChangeLatency={(e) => { setLatency(prev => { return { ...prev, [v]: e } }) }}
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


const NodeItemv2: FC<{
    hash: string, name: string,
    latency: latencyStatus,
    onChangeLatency: (x: latencyStatus) => void
    onClickEdit: () => void
}> = ({ hash, name, onClickEdit, onChangeLatency, latency }) => {
    const ctx = useContext(GlobalToastContext);

    const test = (type: LatencyType) => {
        switch (type) {
            case LatencyType.TCP:
                onChangeLatency({ ...latency, tcp: { ...latency.tcp, loading: true } })
                test_latency(
                    hash,
                    create(protocolSchema, {
                        protocol: {
                            case: "http",
                            value: create(httpSchema, { url: LatencyHTTPUrl })
                        }
                    }),
                    (r) => { onChangeLatency({ ...latency, tcp: { loading: false, value: r.Latency } }) })
                break

            case LatencyType.UDP:
                onChangeLatency({ ...latency, udp: { ...latency.udp, loading: true } })
                test_latency(
                    hash,
                    create(protocolSchema, {
                        protocol: {
                            case: "dnsOverQuic",
                            value: create(dns_over_quicSchema, {
                                host: LatencyDNSUrl,
                                targetDomain: "www.google.com"
                            })
                        }
                    }),
                    (r) => { onChangeLatency({ ...latency, udp: { loading: false, value: r.Latency } }) })
                break

            case LatencyType.IP:
                onChangeLatency({ ...latency, ip: { ...latency.ip, loading: true } })
                test_latency(
                    hash,
                    create(protocolSchema, {
                        protocol: {
                            case: "ip",
                            value: create(ipSchema, { url: LatencyIPUrl })
                        }
                    }),
                    (r) => { onChangeLatency({ ...latency, ip: { loading: false, ipv4: r.IPv4, ipv6: r.IPv6 } }) })
                break

            case LatencyType.STUNTCP:
                onChangeLatency({ ...latency, stun_tcp: { ...latency.stun_tcp, loading: true } })
                test_latency(
                    hash,
                    create(protocolSchema, {
                        protocol: {
                            case: "stun",
                            value: create(stunSchema, {
                                host: LatencyStunTCPUrl,
                                tcp: true
                            })
                        }
                    }),
                    (r) => { onChangeLatency({ ...latency, stun_tcp: { loading: false, ip: r.Stun?.mappedAddress } }) })
                break

            case LatencyType.STUN:
                onChangeLatency({ ...latency, stun: { ...latency.stun, loading: true } })
                test_latency(
                    hash,
                    create(protocolSchema, {
                        protocol: {
                            case: "stun",
                            value: create(stunSchema, {
                                host: LatencyStunUrl,
                            })
                        }
                    }),
                    (r) => {
                        onChangeLatency({ ...latency, stun: { loading: false, mapping: r.Stun?.mapping, filtering: r.Stun?.filter, mappedAddress: r.Stun?.mappedAddress } })
                    })
                break
        }
    }

    return <Accordion.Item eventKey={hash}>
        <Accordion.Header>{name}</Accordion.Header>
        <Accordion.Body>
            <ListGroup variant="flush">

                <ListGroup.Item>
                    <div className="d-xl-flex">
                        <div className="endpoint-name flex-grow-1 notranslate">TCP</div>
                        <div className="notranslate text-break" style={{ opacity: 0.6 }} id="statistic-download">{latency.tcp.value ?? "N/A"}</div>
                    </div>
                </ListGroup.Item>


                <ListGroup.Item>
                    <div className="d-xl-flex">
                        <div className="endpoint-name flex-grow-1 notranslate">UDP</div>
                        <div className="notranslate text-break" style={{ opacity: 0.6 }} id="statistic-upload">{latency.udp.value ?? "N/A"}</div>
                    </div>
                </ListGroup.Item>

                {
                    latency.ip.ipv4 &&
                    <ListGroup.Item>
                        <div className="d-xl-flex">
                            <div className="endpoint-name flex-grow-1 notranslate">IPv4</div>
                            <div className="notranslate text-break" style={{ opacity: 0.6 }} id="statistic-upload">{latency.ip.ipv4}</div>
                        </div>
                    </ListGroup.Item>
                }

                {
                    latency.ip.ipv6 &&
                    <ListGroup.Item>
                        <div className="d-xl-flex">
                            <div className="endpoint-name flex-grow-1 notranslate">IPv6</div>
                            <div className="notranslate text-break" style={{ opacity: 0.6 }} id="statistic-upload">{latency.ip.ipv6}</div>
                        </div>
                    </ListGroup.Item>
                }

                {
                    latency.stun.mapping &&
                    <ListGroup.Item>
                        <div className="d-xl-flex text-truncate">
                            <div className="endpoint-name flex-grow-1 notranslate text-truncate">Mapping</div>
                            <div className="notranslate text-break" style={{ opacity: 0.6 }} id="statistic-upload">{latency.stun.mapping}</div>
                        </div>
                    </ListGroup.Item>
                }

                {
                    latency.stun.filtering &&
                    <ListGroup.Item>
                        <div className="d-xl-flex text-truncate">
                            <div className="endpoint-name flex-grow-1 notranslate text-truncate">Filtering</div>
                            <div className="notranslate text-break" style={{ opacity: 0.6 }} id="statistic-upload">{latency.stun.filtering}</div>
                        </div>
                    </ListGroup.Item>
                }

                {
                    latency.stun.mappedAddress &&
                    <ListGroup.Item>
                        <div className="d-xl-flex text-truncate">
                            <div className="endpoint-name flex-grow-1 notranslate text-truncate">MappedAddress</div>
                            <div className="notranslate text-break" style={{ opacity: 0.6 }} id="statistic-upload">{latency.stun.mappedAddress}</div>
                        </div>
                    </ListGroup.Item>
                }

                {
                    latency.stun_tcp.ip &&
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
                            onSelect={async (key) => { useNode(ctx, hash, key as LatencyType); }}
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
                            <Dropdown.Item disabled={latency.stun.loading} eventKey={LatencyType.STUN}>STUN&nbsp;{latency.stun.loading && <Spinner size="sm" animation="border" />}</Dropdown.Item>
                            <Dropdown.Item disabled={latency.stun_tcp.loading} eventKey={LatencyType.STUNTCP}>STUN TCP&nbsp;{latency.stun_tcp.loading && <Spinner size="sm" animation="border" />}</Dropdown.Item>
                            <Dropdown.Item disabled={latency.ip.loading} eventKey={LatencyType.IP}>IP&nbsp;{latency.ip.loading && <Spinner size="sm" animation="border" />}</Dropdown.Item>
                        </DropdownButton>
                    </ButtonGroup>
                </ListGroup.Item>
            </ListGroup>
        </Accordion.Body>
    </Accordion.Item>
}

const useNode = (ctx, hash: string, key: string) => {
    FetchProtobuf(node.method.use, `/node`, "PUT", create(use_reqSchema, {
        tcp: key === "tcp" || key === "tcpudp",
        udp: key === "udp" || key === "tcpudp",
        hash: hash,
    }),).then(async ({ error }) => {
        if (error !== undefined) ctx.Error(`change node failed, ${error.code}| ${error.msg}`)
        else ctx.Info(`Change ${key} Node To ${hash} Successful`)
    })
}

const test_latency = (hash: string, protocol: protocol, onFinish: (r: LatencyProps) => void) => {
    FetchProtobuf(node.method.latency, "/latency", "POST", create(requestsSchema, {
        requests: [{
            hash: hash,
            id: "latency",
            ipv6: LatencyIPv6,
            protocol: protocol
        }]
    }))
        .then(async ({ data: resp, error }) => {
            if (error) {
                console.log(`test failed ${error.code}| ${error.msg}`)
            }

            let latency: LatencyProps = { Latency: "timeout" };

            if (resp && resp.idLatencyMap["latency"]) {
                const rr = resp.idLatencyMap["latency"].reply
                switch (rr.case) {
                    case "latency": latency = { Latency: durationToStroing(rr.value) }; break
                    case "ip": latency = { IPv4: rr.value.ipv4, IPv6: rr.value.ipv6 }; break
                    case "stun": latency = {
                        Stun: {
                            mapping: getNatTypeString(rr.value.Mapping),
                            filter: getNatTypeString(rr.value.Filtering),
                            mappedAddress: rr.value.mappedAddress
                        }
                    }; break
                }
            }

            onFinish(latency)
        })
}
