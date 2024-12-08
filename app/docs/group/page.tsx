"use client"

import React, { useContext, useState } from "react";
import { Row, Col, ButtonGroup, Button, Dropdown, Card, ListGroup, Spinner, DropdownButton } from "react-bootstrap";
import Loading from "../common/loading";
import { GlobalToastContext } from "../common/toast";
import useSWR from 'swr'
import { FetchProtobuf, ProtoESFetcher } from '../common/proto';
import Error from 'next/error';
import { LatencyDNSUrl, LatencyHTTPUrl, LatencyIPUrl, LatencyIPv6, LatencyStunTCPUrl, LatencyStunUrl } from "../apiurl";
import { dns_over_quicSchema, httpSchema, ipSchema, nat_type, protocol, protocolSchema, requestsSchema, responseSchema, stunSchema } from "../pbes/node/latency/latency_pb";
import { node, use_reqSchema } from "../pbes/node/grpc/node_pb";
import { origin, point, pointSchema } from "../pbes/node/point/point_pb";
import { fromBinary, create, toBinary } from "@bufbuild/protobuf";
import { Duration, StringValueSchema } from "@bufbuild/protobuf/wkt";
import { NodeJsonModal, NodeModal } from "../modal/node";

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

class LatencyClass {
    tcp: {
        loading: boolean,
        value?: string
    } = { loading: false, }
    udp: {
        loading: boolean,
        value?: string
    } = { loading: false, }
    ip: {
        loading: boolean,
        ipv4?: string,
        ipv6?: string
    } = { loading: false, }
    stun: {
        loading: boolean,
        mapping?: string,
        filtering?: string,
        mappedAddress?: string
    } = { loading: false, }
    stun_tcp: {
        loading: boolean,
        ip?: string
    } = { loading: false, }

    constructor(data?: Partial<LatencyClass>) {
        Object.assign(this, data)
    }

    haveLoading(): boolean {
        return this.tcp.loading || this.udp.loading || this.ip.loading || this.stun.loading || this.stun_tcp.loading
    }

    allLoading(): boolean {
        return this.tcp.loading && this.udp.loading && this.ip.loading && this.stun.loading && this.stun_tcp.loading
    }
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

const NodeItem = React.memo((props: {
    title: string,
    hash: string,
    latency: LatencyClass,
    onChangeLatency: (x: LatencyClass) => void
    onClickEdit: () => void
}) => {
    const ctx = useContext(GlobalToastContext);
    const updateTestingStatus = (modify: (x: LatencyClass) => void) => {
        modify(props.latency)
        props.onChangeLatency(props.latency)
    }

    const test = (type: LatencyType) => {
        switch (type) {
            case LatencyType.TCP:
                updateTestingStatus((v) => { v.tcp.loading = true })
                latency(
                    create(protocolSchema, {
                        protocol: {
                            case: "http",
                            value: create(httpSchema, { url: LatencyHTTPUrl })
                        }
                    }),
                    (r) => {
                        updateTestingStatus(async (v) => { v.tcp = { loading: false, value: r.Latency } })
                    })

                break

            case LatencyType.UDP:
                updateTestingStatus((v) => { v.udp.loading = true })
                latency(
                    create(protocolSchema, {
                        protocol: {
                            case: "dnsOverQuic",
                            value: create(dns_over_quicSchema, {
                                host: LatencyDNSUrl,
                                targetDomain: "www.google.com"
                            })
                        }
                    }),
                    (r) => {
                        updateTestingStatus(async (v) => { v.udp = { loading: false, value: r.Latency } })
                    })
                break

            case LatencyType.IP:
                updateTestingStatus((v) => { v.ip.loading = true })
                latency(
                    create(protocolSchema, {
                        protocol: {
                            case: "ip",
                            value: create(ipSchema, { url: LatencyIPUrl })
                        }
                    }),
                    (r) => {
                        updateTestingStatus(async (v) => {
                            v.ip.loading = false
                            v.ip.ipv4 = r.IPv4
                            v.ip.ipv6 = r.IPv6
                        })
                    })

                break

            case LatencyType.STUNTCP:
                updateTestingStatus((v) => { v.stun_tcp.loading = true })
                latency(
                    create(protocolSchema, {
                        protocol: {
                            case: "stun",
                            value: create(stunSchema, {
                                host: LatencyStunTCPUrl,
                                tcp: true
                            })
                        }
                    }),
                    (r) => {
                        updateTestingStatus(async (v) => {
                            v.stun_tcp = {
                                loading: false,
                                ip: r.Stun?.mappedAddress
                            }
                        })
                    })

                break

            case LatencyType.STUN:
                updateTestingStatus((v) => { v.stun.loading = true })
                latency(
                    create(protocolSchema, {
                        protocol: {
                            case: "stun",
                            value: create(stunSchema, {
                                host: LatencyStunUrl,
                            })
                        }
                    }),
                    (r) => {
                        updateTestingStatus(async (v) => {
                            v.stun = {
                                loading: false,
                                mapping: r.Stun?.mapping,
                                filtering: r.Stun?.filter,
                                mappedAddress: r.Stun?.mappedAddress
                            }
                        })
                    })
                break
        }
    }

    const latency = (protocol: protocol, onFinish: (r: LatencyProps) => void) => {
        FetchProtobuf(node.method.latency, "/latency", "POST", create(requestsSchema, {
            requests: [{
                hash: props.hash,
                id: "latency",
                ipv6: LatencyIPv6,
                protocol: protocol
            }]
        }))
            .then(async ({ data: resp, error }) => {
                if (error) {
                    ctx.Error(`test failed ${error.code}| ${error.msg}`)

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


    return <Col className="mb-3">
        <Card className="h-100 shadow-sm">
            <Card.Header>
                {props.title}
            </Card.Header>
            <Card.Body>
                <ListGroup variant="flush">

                    <ListGroup.Item>

                        <div className="d-xl-flex">
                            <div className="endpoint-name flex-grow-1 notranslate">TCP</div>
                            <div className="notranslate text-break" style={{ opacity: 0.6 }} id="statistic-download">{props.latency.tcp.value ?? "N/A"}</div>
                        </div>
                    </ListGroup.Item>


                    <ListGroup.Item>
                        <div className="d-xl-flex">
                            <div className="endpoint-name flex-grow-1 notranslate">UDP</div>
                            <div className="notranslate text-break" style={{ opacity: 0.6 }} id="statistic-upload">{props.latency.udp.value ?? "N/A"}</div>
                        </div>
                    </ListGroup.Item>

                    {
                        props.latency.ip.ipv4 &&
                        <ListGroup.Item>
                            <div className="d-xl-flex">
                                <div className="endpoint-name flex-grow-1 notranslate">IPv4</div>
                                <div className="notranslate text-break" style={{ opacity: 0.6 }} id="statistic-upload">{props.latency.ip.ipv4}</div>
                            </div>
                        </ListGroup.Item>
                    }

                    {
                        props.latency.ip.ipv6 &&
                        <ListGroup.Item>
                            <div className="d-xl-flex">
                                <div className="endpoint-name flex-grow-1 notranslate">IPv6</div>
                                <div className="notranslate text-break" style={{ opacity: 0.6 }} id="statistic-upload">{props.latency.ip.ipv6}</div>
                            </div>
                        </ListGroup.Item>
                    }

                    {
                        props.latency.stun.mapping &&
                        <ListGroup.Item>
                            <div className="d-xl-flex text-truncate">
                                <div className="endpoint-name flex-grow-1 notranslate text-truncate">Mapping</div>
                                <div className="notranslate text-break" style={{ opacity: 0.6 }} id="statistic-upload">{props.latency.stun.mapping}</div>
                            </div>
                        </ListGroup.Item>
                    }

                    {
                        props.latency.stun.filtering &&
                        <ListGroup.Item>
                            <div className="d-xl-flex text-truncate">
                                <div className="endpoint-name flex-grow-1 notranslate text-truncate">Filtering</div>
                                <div className="notranslate text-break" style={{ opacity: 0.6 }} id="statistic-upload">{props.latency.stun.filtering}</div>
                            </div>
                        </ListGroup.Item>
                    }

                    {
                        props.latency.stun.mappedAddress &&
                        <ListGroup.Item>
                            <div className="d-xl-flex text-truncate">
                                <div className="endpoint-name flex-grow-1 notranslate text-truncate">MappedAddress</div>
                                <div className="notranslate text-break" style={{ opacity: 0.6 }} id="statistic-upload">{props.latency.stun.mappedAddress}</div>
                            </div>
                        </ListGroup.Item>
                    }

                    {
                        props.latency.stun_tcp.ip &&
                        <ListGroup.Item>
                            <div className="d-xl-flex text-truncate">
                                <div className="endpoint-name flex-grow-1 notranslate text-truncate">STUN IP</div>
                                <div className="notranslate text-break" style={{ opacity: 0.6 }} id="statistic-upload">{props.latency.stun_tcp.ip}</div>
                            </div>
                        </ListGroup.Item>
                    }

                    <ListGroup.Item className="text-center text-break">
                        <ButtonGroup className="d-xl-flex">
                            <DropdownButton
                                onSelect={
                                    async (key) => {
                                        FetchProtobuf(node.method.use, `/node`, "PUT", create(use_reqSchema, {
                                            tcp: key === "tcp" || key === "tcpudp",
                                            udp: key === "udp" || key === "tcpudp",
                                            hash: props.hash,
                                        }),).then(async ({ error }) => {
                                            if (error !== undefined) ctx.Error(`change node failed, ${error.code}| ${error.msg}`)
                                            else ctx.Info(`Change ${key} Node To ${props.hash} Successful`)
                                        })
                                    }
                                }
                                as={ButtonGroup}
                                variant="outline-primary"
                                title="USE"
                            >
                                <Dropdown.Item eventKey={"tcpudp"}>TCP and UDP</Dropdown.Item>
                                <Dropdown.Item eventKey={"tcp"}>TCP</Dropdown.Item>
                                <Dropdown.Item eventKey={"udp"}>UDP</Dropdown.Item>
                            </DropdownButton>
                            <Button variant="outline-primary" className="w-100" onClick={props.onClickEdit}>Edit</Button>


                            <DropdownButton
                                onSelect={async (key) => { test(key as LatencyType) }}
                                as={ButtonGroup}
                                variant="outline-primary"
                                title={<>Test{props.latency.haveLoading() && <>&nbsp;<Spinner size="sm" animation="border" /></>}</>}
                            >
                                <Dropdown.Item disabled={props.latency.tcp.loading} eventKey={LatencyType.TCP}>TCP&nbsp;{props.latency.tcp.loading && <Spinner size="sm" animation="border" />}</Dropdown.Item>
                                <Dropdown.Item disabled={props.latency.udp.loading} eventKey={LatencyType.UDP}>UDP&nbsp;{props.latency.udp.loading && <Spinner size="sm" animation="border" />} </Dropdown.Item>
                                <Dropdown.Item disabled={props.latency.stun.loading} eventKey={LatencyType.STUN}>STUN&nbsp;{props.latency.stun.loading && <Spinner size="sm" animation="border" />}</Dropdown.Item>
                                <Dropdown.Item disabled={props.latency.stun_tcp.loading} eventKey={LatencyType.STUNTCP}>STUN TCP&nbsp;{props.latency.stun_tcp.loading && <Spinner size="sm" animation="border" />}</Dropdown.Item>
                                <Dropdown.Item disabled={props.latency.ip.loading} eventKey={LatencyType.IP}>IP&nbsp;{props.latency.ip.loading && <Spinner size="sm" animation="border" />}</Dropdown.Item>
                            </DropdownButton>
                        </ButtonGroup>
                    </ListGroup.Item>
                </ListGroup>
            </Card.Body>
        </Card>
    </Col >
})

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
    const [latency, setLatency] = useState<{ [key: string]: LatencyClass }>({})

    const { data, error, isLoading, mutate } = useSWR("/nodes", ProtoESFetcher(node.method.list))

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
                // onChangePoint={(v) => { setModalData(prev => { return { ...prev, point: v } }) }}
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

                {
                    (currentGroup && data.groups && data.groups[currentGroup]) ?
                        <>
                            <Row className="row-cols-sm-1 row-cols-md-2 row-cols-xl-3 justify-content-md-center">
                                {
                                    Object.entries(data.groups[currentGroup].nodesV2).
                                        sort((a, b) => { return a <= b ? -1 : 1 }).
                                        map(([k, v]) => {
                                            return <NodeItem
                                                hash={v}
                                                title={k}
                                                key={k}
                                                latency={latency[v] ?? new LatencyClass({})}
                                                onChangeLatency={(e) => { setLatency(prev => { return { ...prev, [v]: e } }) }}
                                                onClickEdit={() => {
                                                    setModalData({
                                                        hash: v,
                                                        show: true,
                                                        onDelete: () => {
                                                            FetchProtobuf(node.method.remove, `/node`, "DELETE",
                                                                create(StringValueSchema, { value: v }),
                                                            ).then(async ({ error }) => {
                                                                if (error !== undefined) {
                                                                    ctx.Error(`Delete Node ${v} Failed ${error.code}| ${error.msg}`)
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