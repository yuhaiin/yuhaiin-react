"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/app/component/v2/accordion";
import { Badge } from "@/app/component/v2/badge";
import { Button } from "@/app/component/v2/button";
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "@/app/component/v2/dropdown";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/app/component/v2/modal";
import { Spinner } from "@/app/component/v2/spinner";
import { create, fromJsonString } from "@bufbuild/protobuf";
import { Duration, StringValueSchema } from "@bufbuild/protobuf/wkt";
import Error from 'next/error';
import { FC, useContext, useState } from "react";
import { BoxArrowInDown, Check2Circle, ChevronDown, HddNetwork, Pencil, PlusLg, Speedometer2 } from 'react-bootstrap-icons';
import { useLocalStorage } from "usehooks-ts";
import Loading from "../../component/loading";
import { GlobalToastContext } from "../../component/v2/toast";
import { LatencyDNSUrlDefault, LatencyDNSUrlKey, LatencyHTTPUrlDefault, LatencyHTTPUrlKey, LatencyIPUrlDefault, LatencyIPUrlKey, LatencyIPv6Default, LatencyIPv6Key, LatencyStunTCPUrlDefault, LatencyStunTCPUrlKey, LatencyStunUrlDefault, LatencyStunUrlKey } from "../common/apiurl";
import { Nodes, NodesContext } from "../common/nodes";
import { FetchProtobuf, useProtoSWR } from '../common/proto';
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
                    <Dropdown>
                        <DropdownTrigger asChild>
                            <Button variant="outline-secondary" className="d-flex align-items-center justify-content-between" style={{ minWidth: '150px' }}>
                                {groupIndex >= 0 && data.groups.length > groupIndex ? data.groups[groupIndex].name : "GROUP"}
                                <ChevronDown className="ms-2" />
                            </Button>
                        </DropdownTrigger>
                        <DropdownContent className={styles.dropdownMenu}>
                            <DropdownItem
                                className={styles.dropdownItem}
                                onSelect={() => setGroupIndex(-1)}
                            >
                                Select...
                            </DropdownItem>
                            {data.groups?.map((k, i) => (
                                <DropdownItem
                                    className={styles.dropdownItem}
                                    key={i}
                                    onSelect={() => setGroupIndex(i)}
                                >
                                    {k.name}
                                </DropdownItem>
                            ))}
                        </DropdownContent>
                    </Dropdown>

                    <Button
                        variant="outline-secondary"
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
                        <PlusLg />&nbsp;New
                    </Button>

                    <Button
                        variant="outline-secondary"
                        onClick={() => setImportJson({ data: true })}
                    >
                        <BoxArrowInDown />&nbsp;Import
                    </Button>
                </div>
            </div>

            <Accordion type="multiple" className={styles.accordion}>
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

// Helper: Parse Go duration string (e.g., "1.2s", "500ms") to milliseconds (number)
const parseGoDurationToMs = (val: string): number => {
    if (!val || val === "N/A" || val.includes("error") || val.includes("timeout")) return -1;

    const cleanVal = val.trim();
    const num = parseFloat(cleanVal);

    if (isNaN(num)) return -1;

    // Convert based on suffix
    if (cleanVal.endsWith("ns")) return num / 1000000;
    if (cleanVal.endsWith("µs") || cleanVal.endsWith("us")) return num / 1000;
    if (cleanVal.endsWith("ms")) return num;
    if (cleanVal.endsWith("s") && !cleanVal.endsWith("ms")) return num * 1000; // Check "ms" before "s"
    if (cleanVal.endsWith("m")) return num * 60 * 1000;

    return num;
};

// Helper: Get CSS class based on latency value (ms)
const getLatencyColor = (val: string) => {
    const ms = parseGoDurationToMs(val);

    if (ms < 0) return styles['latency-invalid']; // No color for invalid/loading states

    if (ms < 200) return styles['latency-good']; // < 200ms: Green
    if (ms < 999) return styles['latency-avg'];  // 200ms - 999ms: Yellow
    return styles['latency-bad'];                // > 999ms: Red
};

// Helper Component: Display a single block of information
const InfoBlock: FC<{ label: string, value: React.ReactNode, loading?: boolean, colorClass?: string }> = ({ label, value, loading, colorClass }) => (
    <div className={styles.infoCard}>
        <span className={styles.infoLabel}>{label}</span>
        {/* Use text-break to prevent layout overflow on small screens */}
        <div className={`${styles.infoValue} ${colorClass || ''} text-break`}>
            {loading ? <Spinner size="sm" /> : value || "N/A"}
        </div>
    </div>
);

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
        <AccordionItem value={hash} className={styles.accordionItem}>
            <AccordionTrigger className={styles.nodeHeader}>
                {/* 
                    Main Container Layout:
                    - Mobile (xs): flex-column (Two rows)
                    - Desktop (sm+): flex-sm-row (Single row)
                    - Alignment: Top-aligned on mobile, Centered on desktop
                */}
                <div className="d-flex w-100 flex-column flex-sm-row align-items-start align-items-sm-center pe-2">

                    {/* 
                        Left Side: Icon + Name 
                        - mb-2: Adds bottom margin on mobile to separate from stats row
                        - mb-sm-0: Removes margin on desktop
                    */}
                    <div className="d-flex align-items-center gap-3 w-100 mb-2 mb-sm-0">
                        {/* Status Icon */}
                        <HddNetwork className={`fs-5 flex-shrink-0 ${getLatencyColor(latency.tcp.value) === styles['latency-good']
                            ? "text-success"
                            : latency.tcp.value !== "N/A" && !latency.tcp.value.includes("timeout")
                                ? "text-primary"
                                : "text-muted"
                            }`} />

                        <div className="d-flex flex-column text-truncate">
                            <span className="fw-bold text-truncate">{name}</span>
                            <div className="d-flex gap-2 align-items-center" style={{ fontSize: '0.75rem' }}>
                                <span className="text-muted font-monospace opacity-75">{hash.substring(0, 8)}</span>
                                {ipv6 && <Badge variant="info" className="text-dark py-0 px-1" style={{ fontSize: '0.65rem' }}>IPv6</Badge>}
                            </div>
                        </div>
                    </div>

                    {/* 
                        Right Side: Latency Data + Arrow
                        - Mobile: Full width (w-100), Spread apart (justify-content-between)
                        - Desktop: Auto width, Right aligned (justify-content-sm-end)
                    */}
                    <div className="d-flex w-100 w-sm-auto align-items-center justify-content-between justify-content-sm-end ps-0 ps-sm-2">

                        {/* Stats Block */}
                        <div className="d-flex gap-4 text-muted small align-items-center">
                            <div className="d-flex gap-2 align-items-center">
                                <span className="text-uppercase text-muted" style={{ fontSize: '0.65rem', fontWeight: 700 }}>TCP</span>
                                <span className={`font-monospace fw-bold ${getLatencyColor(latency.tcp.value)}`}>
                                    {latency.tcp.value}
                                </span>
                            </div>
                            <div className="d-flex gap-2 align-items-center">
                                <span className="text-uppercase text-muted" style={{ fontSize: '0.65rem', fontWeight: 700 }}>UDP</span>
                                <span className={`font-monospace fw-bold ${getLatencyColor(latency.udp.value)}`}>
                                    {latency.udp.value}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </AccordionTrigger>

            <AccordionContent className={styles.accordionBody}>
                {/* 1. Main Info Grid (Latency & IP) */}
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
                            <InfoBlock label="IPv4" value={latency.ip.ipv4} loading={latency.ip.loading} />
                            <InfoBlock label="IPv6" value={latency.ip.ipv6} loading={latency.ip.loading} />
                        </>
                    )}
                </div>

                {/* 2. Advanced Info (STUN) */}
                {(latency.stun || latency.stun_tcp) && (
                    <div className="mb-4">
                        <h6 className="text-muted small fw-bold mb-2 ps-1">NAT & STUN Details</h6>
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

                {/* 3. Action Footer */}
                <div className={styles.actionFooter}>
                    <div className="btn-group">
                        <Dropdown>
                            <DropdownTrigger asChild>
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    disabled={isTesting}
                                    className="d-flex align-items-center gap-2"
                                >
                                    {isTesting
                                        ? <Spinner size="sm" />
                                        : <>
                                            <Speedometer2 />
                                            <span className="d-none d-sm-inline ms-1">Test</span>
                                        </>
                                    }
                                    <ChevronDown className="ms-1" style={{ fontSize: '0.7em' }} />
                                </Button>
                            </DropdownTrigger>
                            <DropdownContent>
                                <DropdownItem onSelect={() => test(LatencyType.TCP)}>TCP Ping</DropdownItem>
                                <DropdownItem onSelect={() => test(LatencyType.UDP)}>UDP Ping</DropdownItem>
                                <div className="dropdown-divider"></div>
                                <DropdownItem onSelect={() => test(LatencyType.STUN)}>STUN Test</DropdownItem>
                                <DropdownItem onSelect={() => test(LatencyType.STUNTCP)}>STUN TCP Test</DropdownItem>
                                <DropdownItem onSelect={() => test(LatencyType.IP)}>IP Check</DropdownItem>
                            </DropdownContent>
                        </Dropdown>
                    </div>

                    <Button variant="outline-secondary" size="sm" onClick={onClickEdit} title="Edit Configuration">
                        <Pencil />
                        {/* d-none d-sm-inline: Hide text on mobile */}
                        <span className="d-none d-sm-inline ms-2">Edit</span>
                    </Button>

                    <Button variant="primary" size="sm" onClick={() => setNode(ctx, hash)} title="Use Node">
                        <Check2Circle />
                        {/* d-none d-sm-inline: Hide text on mobile */}
                        <span className="d-none d-sm-inline ms-2">Use</span>
                    </Button>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}

function setNode(ctx: { Info: (msg: string) => void, Error: (msg: string) => void }, hash: string) {
    FetchProtobuf(node.method.use, create(use_reqSchema, { hash: hash, }))
        .then(async ({ error }) => {
            if (error !== undefined) ctx.Error(`change node failed, ${error.code}| ${error.msg}`)
            else ctx.Info(`Change Node To ${hash} Successful`)
        })
}

const NodeJsonModal = (
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
        <Modal
            open={props.show}
            onOpenChange={(open) => !open && props.onHide()}
        >
            <ModalContent style={{ maxWidth: '800px' }}>
                {!props.plaintext &&
                    <ModalHeader closeButton>
                        <ModalTitle>
                            Import JSON
                        </ModalTitle>
                    </ModalHeader>
                }

                <ModalBody>
                    <textarea
                        className="form-control"
                        readOnly={props.plaintext}
                        value={props.data ? props.data : nodeJson.data}
                        style={{ height: "65vh", fontFamily: "monospace" }}
                        onChange={(e) => { setNodeJson({ data: e.target.value }); }}
                    />
                </ModalBody>


                <ModalFooter>
                    <Button variant="outline-secondary" onClick={() => { props.onHide() }}>Close</Button>
                    <Footer />
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
