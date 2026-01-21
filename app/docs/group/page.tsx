"use client"

import { create, fromJsonString } from "@bufbuild/protobuf";
import { Duration, StringValueSchema } from "@bufbuild/protobuf/wkt";
import Error from 'next/error';
import { FC, useContext, useState } from "react";
import { Accordion, Badge, Button, ButtonGroup, Dropdown, DropdownButton, Form, Modal, Spinner } from "react-bootstrap";
import { useLocalStorage } from "usehooks-ts";
import { LatencyDNSUrlDefault, LatencyDNSUrlKey, LatencyHTTPUrlDefault, LatencyHTTPUrlKey, LatencyIPUrlDefault, LatencyIPUrlKey, LatencyIPv6Default, LatencyIPv6Key, LatencyStunTCPUrlDefault, LatencyStunTCPUrlKey, LatencyStunUrlDefault, LatencyStunUrlKey } from "../common/apiurl";
import Loading from "../common/loading";
import { Nodes, NodesContext } from "../common/nodes";
import { FetchProtobuf, useProtoSWR } from '../common/proto';
import { GlobalToastContext } from "../common/toast";
import { NodeModal } from "../node/modal";
import { node, use_reqSchema } from "../pbes/api/node_pb";
import { dns_over_quicSchema, http_testSchema, ipSchema, nat_type, reply, request_protocol, request_protocolSchema, requestsSchema, stunSchema } from "../pbes/node/latency_pb";
import { origin, point, pointSchema } from "../pbes/node/point_pb";
import styles from './group.module.css';

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

            <div className={styles.pageHeader}>
                <div className={styles.headerActions}>
                    <Dropdown
                        onSelect={(e) => { const i = Number(e); if (!isNaN(i)) setGroupIndex(i) }}
                    >
                        <Dropdown.Toggle variant="outline-primary">{groupIndex >= 0 && data.groups.length > groupIndex ? data.groups[groupIndex].name : "GROUP"}</Dropdown.Toggle>
                        <Dropdown.Menu className={styles.dropdownMenu}>
                            <Dropdown.Item className={styles.dropdownItem} eventKey={-1}>Select...</Dropdown.Item>

                            {
                                data.groups?.map((k, i) => {
                                    return <Dropdown.Item className={styles.dropdownItem} eventKey={i} key={i}>{k.name}</Dropdown.Item>
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
                            onClick={() => setImportJson({ data: true })}
                        >
                            <i className="bi bi-box-arrow-in-down" />&nbsp;Import
                        </Button>
                    </ButtonGroup>
                </div>
            </div>

            <Accordion className={styles.accordion} alwaysOpen id="connections">
                {
                    groupIndex >= 0
                        && data.groups.length > groupIndex
                        && data.groups[groupIndex].nodes.length > 0 ? (
                        data.groups[groupIndex].nodes
                            .map((v) => {
                                return <NodeItemv2
                                    key={v.hash}
                                    hash={v.hash}
                                    name={v.name}
                                    onClickEdit={() => { openModal(v.hash) }}
                                    urls={{
                                        ip: latencyIPUrl,
                                        tcp: latencyHTTP,
                                        udp: latencyDNS,
                                        stun: latencyStunUrl,
                                        stunTCP: latencyStunTCPUrl,
                                    }}
                                />
                            })
                    ) : (
                        <div className="text-center text-secondary py-3">
                            {groupIndex === -1 ? "Please select a group to display nodes" : "Current group has no nodes"}
                        </div>
                    )
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

const InfoBlock: FC<{ label: string, value: React.ReactNode, loading?: boolean, colorClass?: string }> = ({ label, value, loading, colorClass }) => (
    <div className={styles.infoCard}>
        <span className={styles.infoLabel}>{label}</span>
        <div className={`${styles.infoValue} ${colorClass || ''} text-break`}>
            {loading ? <Spinner animation="border" size="sm" variant="secondary" /> : value || "N/A"}
        </div>
    </div>
);

// Helper function: parse a Go duration string into milliseconds
const parseGoDurationToMs = (val: string): number => {
    if (!val || val === "N/A" || val.includes("error") || val.includes("timeout")) return -1;

    // Remove possible surrounding whitespace
    const cleanVal = val.trim();
    const num = parseFloat(cleanVal);

    if (isNaN(num)) return -1;

    // Convert based on unit suffix
    if (cleanVal.endsWith("ns")) return num / 1_000_000;
    if (cleanVal.endsWith("µs") || cleanVal.endsWith("us")) return num / 1_000;
    if (cleanVal.endsWith("ms")) return num;
    if (cleanVal.endsWith("s") && !cleanVal.endsWith("ms")) return num * 1_000; // must check ms first
    if (cleanVal.endsWith("m")) return num * 60 * 1_000; // very rare case

    // If no unit is provided, treat it as milliseconds (or consider it abnormal)
    return num;
};

// Helper function: return a color class based on latency in milliseconds
const getLatencyColor = (val: string) => {
    const ms = parseGoDurationToMs(val);

    // -1 indicates invalid or error value, no color applied
    if (ms < 0) return "";

    // Latency thresholds
    if (ms < 100) return styles['latency-good']; // < 100ms: green
    if (ms < 400) return styles['latency-avg'];  // 100ms–400ms: yellow
    return styles['latency-bad'];                // > 400ms: red
};

const NodeItemv2: FC<{
    hash: string,
    name: string,
    onClickEdit: () => void,
    urls: {
        tcp: string,
        udp: string,
        ip: string,
        stun: string,
        stunTCP: string,
    },
    ipv6?: boolean,
}> = ({ hash, name, onClickEdit, ipv6, urls }) => {
    const ctx = useContext(GlobalToastContext);
    const [latency, setLatency] = useLocalStorage<latencyStatus>(`latency-${hash}`, { tcp: { loading: false, value: "N/A" }, udp: { loading: false, value: "N/A" } })

    const test = (type: LatencyType) => {
        const { request, setLoading, setResult } = createLatencyReqByType(type, latency, setLatency, urls)

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

    const isTesting = isLoading(latency);

    return (
        <Accordion.Item eventKey={hash} className={styles.accordionItem}>
            {/* 1. Header: Clean and Info-rich */}
            <Accordion.Header className={styles.nodeHeader}>
                <div className="d-flex w-100 align-items-center justify-content-between pe-3">
                    <div className="d-flex align-items-center gap-3">
                        {/* Status Dot (Optional: Could be based on last connectivity check) */}
                        <i className={`bi bi-hdd-network fs-5 ${latency.tcp.value !== "N/A" && !latency.tcp.value.includes("timeout") ? "text-primary" : "text-muted"}`}></i>

                        <div className="d-flex flex-column">
                            <span className="fw-bold">{name}</span>
                            <div className="d-flex gap-2 align-items-center" style={{ fontSize: '0.75rem' }}>
                                <span className="text-muted font-monospace">{hash.substring(0, 8)}</span>
                                {ipv6 && <Badge bg="info" className="text-dark py-0 px-1">IPv6</Badge>}
                            </div>
                        </div>
                    </div>

                    {/* Collapsed State Summary (Visible only if header supports custom content, 
                        Bootstrap Accordion Header might need custom toggle handling for complex layouts inside button.
                        Assuming standard usage, this part renders inside the button) */}
                    <div className="d-flex gap-3 text-muted small">
                        <div className="d-flex align-items-center gap-1">
                            <span className="text-uppercase" style={{ fontSize: '0.7rem', fontWeight: 700 }}>TCP</span>
                            <span className={`font-monospace ${getLatencyColor(latency.tcp.value)}`}>
                                {latency.tcp.value}
                            </span>
                        </div>
                        <div className="d-flex align-items-center gap-1">
                            <span className="text-uppercase" style={{ fontSize: '0.7rem', fontWeight: 700 }}>UDP</span>
                            <span className={`font-monospace ${getLatencyColor(latency.udp.value)}`}>
                                {latency.udp.value}
                            </span>
                        </div>
                    </div>
                </div>
            </Accordion.Header>

            <Accordion.Body className="p-4 pt-0">
                <hr className="my-3 opacity-10" />

                {/* 2. Latency & IP Grid */}
                <div className={styles.infoGrid}>
                    <InfoBlock
                        label="TCP Latency"
                        value={latency.tcp.value}
                        loading={latency.tcp.loading}
                        colorClass={getLatencyColor(latency.tcp.value)}
                    />
                    <InfoBlock
                        label="UDP Latency"
                        value={latency.udp.value}
                        loading={latency.udp.loading}
                        colorClass={getLatencyColor(latency.udp.value)}
                    />

                    {latency.ip && (
                        <>
                            <InfoBlock label="IPv4 Address" value={latency.ip.ipv4} loading={latency.ip.loading} />
                            <InfoBlock label="IPv6 Address" value={latency.ip.ipv6} loading={latency.ip.loading} />
                        </>
                    )}
                </div>

                {/* 3. Advanced Info (STUN) - Conditional Rendering */}
                {(latency.stun || latency.stun_tcp) && (
                    <div className="mb-4">
                        <h6 className="text-muted small fw-bold mb-2">NAT & STUN Details</h6>
                        <div className={styles.infoGrid}>
                            {latency.stun && (
                                <>
                                    <InfoBlock label="NAT Type" value={latency.stun.mapping} loading={latency.stun.loading} />
                                    <InfoBlock label="Filtering" value={latency.stun.filtering} loading={latency.stun.loading} />
                                    <InfoBlock label="Mapped Address" value={latency.stun.mappedAddress} loading={latency.stun.loading} />
                                </>
                            )}
                            {latency.stun_tcp && (
                                <InfoBlock label="STUN TCP IP" value={latency.stun_tcp.ip} loading={latency.stun_tcp.loading} />
                            )}
                        </div>
                    </div>
                )}

                {/* 4. Action Footer */}
                <div className={styles.actionFooter}>
                    <DropdownButton
                        as={ButtonGroup}
                        variant="outline-secondary"
                        size="sm"
                        title={
                            <>
                                {isTesting ? <Spinner as="span" animation="border" size="sm" className="me-2" /> : <i className="bi bi-speedometer2 me-2" />}
                                Test Latency
                            </>
                        }
                        disabled={isTesting}
                        onSelect={(key) => test(key as LatencyType)}
                    >
                        <Dropdown.Item eventKey={LatencyType.TCP}>TCP Ping</Dropdown.Item>
                        <Dropdown.Item eventKey={LatencyType.UDP}>UDP Ping</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item eventKey={LatencyType.STUN}>STUN Test</Dropdown.Item>
                        <Dropdown.Item eventKey={LatencyType.STUNTCP}>STUN TCP Test</Dropdown.Item>
                        <Dropdown.Item eventKey={LatencyType.IP}>IP Check</Dropdown.Item>
                    </DropdownButton>

                    <Button variant="outline-secondary" size="sm" onClick={onClickEdit}>
                        <i className="bi bi-pencil me-2" /> Edit Config
                    </Button>

                    <Button variant="primary" size="sm" onClick={() => setNode(ctx, hash)}>
                        <i className="bi bi-check2-circle me-2" /> Use Node
                    </Button>
                </div>
            </Accordion.Body>
        </Accordion.Item>
    )
}

function setNode(ctx: { Info: (msg: string) => void, Error: (msg: string) => void }, hash: string) {
    FetchProtobuf(node.method.use, create(use_reqSchema, { hash: hash, }))
        .then(async ({ error }) => {
            if (error !== undefined) ctx.Error(`change node failed, ${error.code}| ${error.msg}`)
            else ctx.Info(`Change Node To ${hash} Successful`)
        })
}


export const NodeJsonModal = (
    props: {
        show: boolean,
        plaintext?: boolean,
        data?: string,
        onSave?: () => void
        onHide: () => void,
        isNew?: boolean
    },
) => {
    const ctx = useContext(GlobalToastContext);
    const [nodeJson, setNodeJson] = useState({ data: "" });
    const Footer = () => {
        if (!props.onSave) return <></>
        return <Button variant="outline-primary"
            onClick={() => {
                const p = fromJsonString(pointSchema, nodeJson.data);
                if (props.isNew) p.hash = ""
                FetchProtobuf(node.method.save, p)
                    .then(async ({ error }) => {
                        if (error === undefined) {
                            ctx.Info("save successful")
                            if (props.onSave !== undefined) props.onSave();
                        } else ctx.Error(error.msg)
                    })
            }}
        >
            Save
        </Button>
    }
    return (
        <>
            <Modal
                show={props.show}
                aria-labelledby="contained-modal-title-vcenter"
                size='xl'
                onHide={() => { props.onHide() }}
                centered
            >
                {!props.plaintext &&
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            Import JSON
                        </Modal.Title>
                    </Modal.Header>
                }

                <Modal.Body>
                    <Form.Control
                        as="textarea"
                        readOnly={props.plaintext}
                        value={props.data ? props.data : nodeJson.data}
                        style={{ height: "65vh", fontFamily: "monospace" }}
                        onChange={(e) => { setNodeJson({ data: e.target.value }); }}
                    />
                </Modal.Body>


                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={() => { props.onHide() }}>Close</Button>
                    <Footer />
                </Modal.Footer>
            </Modal>
        </>
    );
}
