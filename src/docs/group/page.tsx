"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/component/v2/accordion";
import { Badge } from "@/component/v2/badge";
import { Button } from "@/component/v2/button";
import { Card, CardBody } from "@/component/v2/card";
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "@/component/v2/dropdown";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal";
import { Spinner } from "@/component/v2/spinner";
import { create, fromJsonString } from "@bufbuild/protobuf";
import { Duration, StringValueSchema } from "@bufbuild/protobuf/wkt";
import { AnimatePresence, motion } from "framer-motion";
import { Archive, CheckCircle2, ChevronDown, Gauge, Network, Pencil, Plus } from "lucide-react";
import { FC, useContext, useState, useMemo } from "react";
import { useLocalStorage } from "usehooks-ts";
import { LatencyDNSUrlDefault, LatencyDNSUrlKey, LatencyHTTPUrlDefault, LatencyHTTPUrlKey, LatencyIPUrlDefault, LatencyIPUrlKey, LatencyIPv6Default, LatencyIPv6Key, LatencyStunTCPUrlDefault, LatencyStunTCPUrlKey, LatencyStunUrlDefault, LatencyStunUrlKey } from "../../common/apiurl";
import { Nodes, NodesContext } from "../../common/nodes";
import { FetchProtobuf, useProtoSWR } from '../../common/proto';
import Error from '../../component/Error';
import Loading from "../../component/v2/loading";
import { GlobalToastContext } from "../../component/v2/toast";
import { NodeModal } from "../node/modal";
import { node, use_reqSchema } from "../pbes/api/node_pb";
import { dns_over_quicSchema, http_testSchema, ipSchema, nat_type, reply, request_protocol, request_protocolSchema, requestsSchema, stunSchema } from "../pbes/node/latency_pb";
import { origin, point, pointSchema } from "../pbes/node/point_pb";

const MotionAccordionItem = motion(AccordionItem);

const Nanosecond = 1
const Microsecond = 1000 * Nanosecond
const Millisecond = 1000 * Microsecond
const Second = 1000 * Millisecond
const Minute = 60 * Second
const Hour = 60 * Minute

function durationToString(x: Duration): string {
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

type LatencyValues = {
    tcp: string
    udp: string
    ip?: {
        ipv4: string,
        ipv6: string
    }
    stun?: {
        mapping: string,
        filtering: string,
        mappedAddress: string
    }
    stun_tcp?: {
        ip: string
    }
}

type LatencyLoading = {
    tcp: boolean
    udp: boolean
    ip: boolean
    stun: boolean
    stun_tcp: boolean
}

function isAnyLoading(x: LatencyLoading): boolean {
    return x.tcp || x.udp || x.ip || x.stun || x.stun_tcp
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

    const [emptyNodes] = useState(() => new Nodes());
    const nodes = useMemo(() => (data ? new Nodes(data) : emptyNodes), [data, emptyNodes]);

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
            <NodesContext.Provider value={nodes}>
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
            </NodesContext.Provider>

            <div className="flex justify-end items-center mb-4 flex-wrap gap-4">
                <div className="flex gap-3">
                    <Dropdown>
                        <DropdownTrigger asChild>
                            <Button className="flex items-center justify-between min-w-[150px]">
                                <span className="flex-1 text-left truncate">
                                    {groupIndex >= 0 && data.groups.length > groupIndex ? data.groups[groupIndex].name : "GROUP"}
                                </span>
                                <ChevronDown className="ml-2 shrink-0" />
                            </Button>
                        </DropdownTrigger>
                        <DropdownContent>
                            <DropdownItem
                                onSelect={() => setGroupIndex(-1)}
                            >
                                Select...
                            </DropdownItem>
                            {data.groups?.map((k, i) => (
                                <DropdownItem
                                    key={i}
                                    onSelect={() => setGroupIndex(i)}
                                >
                                    {k.name}
                                </DropdownItem>
                            ))}
                        </DropdownContent>
                    </Dropdown>

                    <Button
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
                        <Plus size={16} />&nbsp;New
                    </Button>

                    <Button
                        onClick={() => setImportJson({ data: true })}
                    >
                        <Archive size={16} />&nbsp;Import
                    </Button>
                </div>
            </div>

            {
                groupIndex >= 0
                    && data.groups.length > groupIndex
                    && data.groups[groupIndex].nodes.length > 0
                    ?
                    < Accordion type="multiple">
                        <AnimatePresence initial={false} mode="popLayout">
                            {data.groups[groupIndex].nodes
                                .map((v) => {
                                    return <NodeItemv2
                                        key={v.hash}
                                        hash={v.hash}
                                        name={v.name}
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
                        </AnimatePresence>
                    </Accordion >
                    :
                    <Card>
                        <CardBody>
                            <div className="text-center text-gray-500 py-3">
                                {groupIndex === -1 ? "Please select a group to display nodes" : "Current group has no nodes"}
                            </div>
                        </CardBody>
                    </Card>
            }
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
    setLoading: (x: (x: LatencyLoading) => LatencyLoading) => void,
    setValues: (x: (x: LatencyValues) => LatencyValues) => void,
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
                    setLoading((prev) => ({ ...prev, tcp: loading }))
                    if (error) {
                        setValues((prev) => ({ ...prev, tcp: error }))
                    }
                },
                setResult: (r: reply) => {
                    if (r.reply.case === "latency") {
                        const value = durationToString(r.reply.value)
                        setValues((prev) => ({ ...prev, tcp: value }))
                        setLoading((prev) => ({ ...prev, tcp: false }))
                    }
                }
            }
        case LatencyType.UDP:
            return {
                request: createLatencyRequest({ case: "dnsOverQuic", host: urls.udp, targetDomain: "www.google.com" }),
                setLoading: (loading: boolean, error?: string) => {
                    setLoading((prev) => ({ ...prev, udp: loading }))
                    if (error) {
                        setValues((prev) => ({ ...prev, udp: error }))
                    }
                },
                setResult: (r: reply) => {
                    if (r.reply.case === "latency") {
                        const value = durationToString(r.reply.value)
                        setValues((prev) => ({ ...prev, udp: value }))
                        setLoading((prev) => ({ ...prev, udp: false }))
                    }
                }
            }
        case LatencyType.IP:
            return {
                request: createLatencyRequest({ case: "ip", url: urls.ip }),
                setLoading: (loading: boolean, error?: string) => {
                    setLoading((prev) => ({ ...prev, ip: loading }))
                    if (error) {
                        setValues((prev) => ({ ...prev, ip: { ipv4: error, ipv6: error } }))
                    }
                },
                setResult: (r: reply) => {
                    if (r.reply.case === "ip") {
                        const ipv4 = r.reply.value.ipv4
                        const ipv6 = r.reply.value.ipv6
                        setValues((prev) => ({ ...prev, ip: { ipv4, ipv6 } }))
                        setLoading((prev) => ({ ...prev, ip: false }))
                    }
                }
            }
        case LatencyType.STUNTCP:
            return {
                request: createLatencyRequest({ case: "stun", host: urls.stunTCP, tcp: true }),
                setLoading: (loading: boolean, error?: string) => {
                    setLoading((prev) => ({ ...prev, stun_tcp: loading }))
                    if (error) {
                        setValues((prev) => ({ ...prev, stun_tcp: { ip: error } }))
                    }
                },
                setResult: (r: reply) => {
                    if (r.reply.case === "stun") {
                        const ip = r.reply.value.mappedAddress
                        setValues((prev) => ({ ...prev, stun_tcp: { ip } }))
                        setLoading((prev) => ({ ...prev, stun_tcp: false }))
                    }
                }
            }
        case LatencyType.STUN:
            return {
                request: createLatencyRequest({ case: "stun", host: urls.stun, tcp: false }),
                setLoading: (loading: boolean, error?: string) => {
                    setLoading((prev) => ({ ...prev, stun: loading }))
                    if (error) {
                        setValues((prev) => ({ ...prev, stun: { mapping: error, filtering: error, mappedAddress: error } }))
                    }
                },
                setResult: (r: reply) => {
                    if (r.reply.case === "stun") {
                        const mapping = getNatTypeString(r.reply.value.Mapping)
                        const filtering = getNatTypeString(r.reply.value.Filtering)
                        const mappedAddress = r.reply.value.mappedAddress
                        setValues((prev) => ({ ...prev, stun: { mapping, filtering, mappedAddress } }))
                        setLoading((prev) => ({ ...prev, stun: false }))
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

    if (ms < 0) return 'text-[#9ca3af]'; // invalid: #9ca3af

    if (ms < 200) return 'text-[#10b981]'; // < 200ms: Green (#10b981)
    if (ms < 999) return 'text-[#f59e0b]';  // 200ms - 999ms: Yellow (#f59e0b)
    return 'text-[#ef4444]';                // > 999ms: Red (#ef4444)
};

// Helper Component: Display a single block of information
const InfoBlock: FC<{ label: string, value: React.ReactNode, loading?: boolean, colorClass?: string }> = ({ label, value, loading, colorClass }) => (
    <div className="bg-[var(--card-footer-bg)] border-[0.5px] border-[var(--card-inner-border)] rounded-[20px] p-4 flex flex-col transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:bg-[var(--card-inner-border)]">
        <span className="text-xs uppercase mb-1 font-bold">{label}</span>
        <div className={`${colorClass || ''} text-[0.9rem] break-all`}>
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

    // Persistent state: Latency Values only
    const [latencyValues, setLatencyValues] = useLocalStorage<LatencyValues>(`latency-v2-${hash}`, {
        tcp: "N/A",
        udp: "N/A"
    });

    // Transient state: Loading indicators
    const [latencyLoading, setLatencyLoading] = useState<LatencyLoading>({
        tcp: false,
        udp: false,
        ip: false,
        stun: false,
        stun_tcp: false
    });

    const test = (type: LatencyType) => {
        const { request, setLoading, setResult } = createLatencyReqByType(type, setLatencyLoading, setLatencyValues, urls)

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

    const isTesting = isAnyLoading(latencyLoading);

    return (
        <MotionAccordionItem
            value={hash}
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -10, transition: { duration: 0.2 } }}
            transition={{ duration: 0.2 }}
        >
            <AccordionTrigger>
                <div className="flex w-full flex-col sm:flex-row items-start sm:items-center pr-2">

                    {/* 
                        Left Side: Icon + Name 
                        - mb-2: Adds bottom margin on mobile to separate from stats row
                        - mb-sm-0: Removes margin on desktop
                    */}
                    <div className="flex items-center gap-3 w-full mb-2 sm:mb-0">
                        {/* Status Icon */}
                        <Network className={`text-xl flex-shrink-0 ${(() => {
                            const ms = parseGoDurationToMs(latencyValues.tcp);
                            if (ms < 0) return "text-gray-500";
                            if (ms < 200) return "text-green-500";
                            return "text-blue-500";
                        })()}`} />

                        <div className="flex flex-col gap-2 truncate">
                            <span className="truncate">{name}</span>
                            <div className="flex gap-2 items-center text-xs">
                                <span className="text-gray-500 opacity-75">{hash.substring(0, 8)}</span>
                                {ipv6 && <Badge variant="info" className="text-gray-900 py-0 px-1 text-[0.65rem]">IPv6</Badge>}
                            </div>
                        </div>
                    </div>

                    {/* 
                        Right Side: Latency Data + Arrow
                        - Mobile: Full width (w-100), Spread apart (justify-content-between)
                        - Desktop: Auto width, Right aligned (justify-content-sm-end)
                    */}
                    <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end pl-0 sm:pl-2">

                        {/* Stats Block */}
                        <div className="flex gap-4 text-gray-500 text-sm items-center">
                            <div className="flex gap-2 items-center">
                                <span className="uppercase text-gray-500 text-[0.65rem] font-bold">TCP</span>
                                <span className={getLatencyColor(latencyValues.tcp)}>
                                    {latencyValues.tcp}
                                </span>
                            </div>
                            <div className="flex gap-2 items-center">
                                <span className="uppercase text-gray-500 text-[0.65rem] font-bold">UDP</span>
                                <span className={getLatencyColor(latencyValues.udp)}>
                                    {latencyValues.udp}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </AccordionTrigger>

            <AccordionContent>
                {/* 1. Main Info Grid (Latency & IP) */}
                <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4 mb-4">
                    <InfoBlock
                        label="TCP Latency"
                        value={latencyValues.tcp}
                        loading={latencyLoading.tcp}
                        colorClass={getLatencyColor(latencyValues.tcp)}
                    />
                    <InfoBlock
                        label="UDP Latency"
                        value={latencyValues.udp}
                        loading={latencyLoading.udp}
                        colorClass={getLatencyColor(latencyValues.udp)}
                    />
                    {(latencyValues.ip || latencyLoading.ip) && (
                        <>
                            <InfoBlock label="IPv4" value={latencyValues.ip?.ipv4} loading={latencyLoading.ip} />
                            <InfoBlock label="IPv6" value={latencyValues.ip?.ipv6} loading={latencyLoading.ip} />
                        </>
                    )}
                </div>

                {/* 2. Advanced Info (STUN) */}
                {(latencyValues.stun || latencyLoading.stun || latencyValues.stun_tcp || latencyLoading.stun_tcp) && (
                    <div className="mb-4">
                        <h6 className="text-gray-500 text-sm font-bold mb-2 pl-1">NAT & STUN Details</h6>
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4 mb-4">
                            {(latencyValues.stun || latencyLoading.stun) && (
                                <>
                                    <InfoBlock label="NAT Type" value={latencyValues.stun?.mapping} loading={latencyLoading.stun} />
                                    <InfoBlock label="Filtering" value={latencyValues.stun?.filtering} loading={latencyLoading.stun} />
                                    <InfoBlock label="Mapped Address" value={latencyValues.stun?.mappedAddress} loading={latencyLoading.stun} />
                                </>
                            )}
                            {(latencyValues.stun_tcp || latencyLoading.stun_tcp) && (
                                <InfoBlock label="STUN TCP IP" value={latencyValues.stun_tcp?.ip} loading={latencyLoading.stun_tcp} />
                            )}
                        </div>
                    </div>
                )}

                {/* 3. Action Footer */}
                <div className="flex gap-2 pt-4 border-t border-[var(--card-inner-border)] justify-end">
                    <div className="inline-flex">
                        <Dropdown>
                            <DropdownTrigger asChild>
                                <Button
                                    size="sm"
                                    disabled={isTesting}
                                    className="flex items-center gap-2"
                                    whileTap={{ scale: 1 }}
                                    whileHover={{ scale: 1 }}
                                >
                                    {isTesting
                                        ? <Spinner size="sm" />
                                        : <>
                                            <Gauge size={16} />
                                            <span className="hidden sm:inline ml-1">Test</span>
                                        </>
                                    }
                                    <ChevronDown className="ml-1" size={12} />
                                </Button>
                            </DropdownTrigger>
                            <DropdownContent>
                                <DropdownItem onSelect={() => test(LatencyType.TCP)}>TCP Ping</DropdownItem>
                                <DropdownItem onSelect={() => test(LatencyType.UDP)}>UDP Ping</DropdownItem>
                                <div className="h-px bg-[var(--divider-color)] my-1"></div>
                                <DropdownItem onSelect={() => test(LatencyType.STUN)}>STUN Test</DropdownItem>
                                <DropdownItem onSelect={() => test(LatencyType.STUNTCP)}>STUN TCP Test</DropdownItem>
                                <DropdownItem onSelect={() => test(LatencyType.IP)}>IP Check</DropdownItem>
                            </DropdownContent>
                        </Dropdown>
                    </div>

                    <Button size="sm" onClick={onClickEdit} title="Edit Configuration">
                        <Pencil size={16} />
                        {/* d-none d-sm-inline: Hide text on mobile */}
                        <span className="hidden sm:inline ml-2">Edit</span>
                    </Button>

                    <Button size="sm" onClick={() => setNode(ctx, hash)} title="Use Node">
                        <CheckCircle2 size={16} />
                        {/* d-none d-sm-inline: Hide text on mobile */}
                        <span className="hidden sm:inline ml-2">Use</span>
                    </Button>
                </div>
            </AccordionContent>
        </MotionAccordionItem>
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
        return <Button
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
            <ModalContent className="max-w-[800px]">
                {!props.plaintext &&
                    <ModalHeader closeButton>
                        <ModalTitle>
                            Import JSON
                        </ModalTitle>
                    </ModalHeader>
                }

                <ModalBody>
                    <textarea
                        className="w-full bg-transparent border border-[var(--sidebar-border-color)] rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none text-[var(--sidebar-color)] h-[65vh] font-mono"
                        readOnly={props.plaintext}
                        value={props.data ? props.data : nodeJson.data}
                        onChange={(e) => { setNodeJson({ data: e.target.value }); }}
                    />
                </ModalBody>


                <ModalFooter>
                    <Button onClick={() => { props.onHide() }}>Close</Button>
                    <Footer />
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
