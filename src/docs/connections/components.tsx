"use client"

import { DataList, DataListCustomItem, DataListItem } from "@/component/v2/datalist";
import { Check } from "lucide-react";
import React, { FC, JSX, useEffect, useState } from "react";
import useSWR from "swr";
import { FetchProtobuf, ProtoPath } from "../../common/proto";
import { connections, counter, total_flow } from "../pbes/api/statistic_pb";
import { mode } from "../pbes/config/bypass_pb";
import { connection, type as connType, match_history_entry } from "../pbes/statistic/config_pb";

interface MetricProps {
    label: string;
    value: React.ReactNode;
    error?: string;
    color?: string;
}

const MetricCard: FC<MetricProps> = ({ label, value, error, color = '#3b82f6' }) => {
    return (
        <div
            className="flex-1 min-w-[200px] relative p-4 bg-card border rounded-2xl flex flex-col justify-center transition-all duration-300 ease-out shadow-sm hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-lg"
        >
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">{label}</div>
            <div className={`text-xl font-bold font-mono text-card-foreground animate-in fade-in zoom-in-95 duration-200 ${error ? 'text-red-500' : ''}`}>
                {error || value}
            </div>
        </div>
    );
};


const Unit = {
    B: 'B',
    KB: 'KB',
    MB: 'MB',
    GB: 'GB',
    TB: 'TB',
    PB: 'PB'
};

export function reducedUnit(bytes: number) {
    if (bytes >= 1125899906842624) {
        return { bytes: bytes / 1125899906842624, unit: Unit.PB };
    }
    if (bytes >= 1099511627776) {
        return { bytes: bytes / 1099511627776, unit: Unit.TB };
    }
    if (bytes >= 1073741824) {
        return { bytes: bytes / 1073741824, unit: Unit.GB };
    }
    if (bytes >= 1048576) {
        return { bytes: bytes / 1048576, unit: Unit.MB };
    }
    if (bytes >= 1024) {
        return { bytes: bytes / 1024, unit: Unit.KB };
    }
    return { bytes, unit: Unit.B };
}

export const formatBytes = (a = 0, b = 2, space = "") => {
    const { bytes, unit } = reducedUnit(a);
    return `${bytes.toFixed(b)}${space}${unit}`;
}

export class Flow {
    download: number
    download_rate: number
    upload: number
    upload_rate: number
    counters: { [key: string]: counter }
    time: Date

    constructor(download = 0, download_rate = 0, upload = 0, upload_rate = 0, counters = {}) {
        this.download = download
        this.download_rate = download_rate
        this.upload = upload
        this.upload_rate = upload_rate
        this.counters = counters
        this.time = new Date()
    }

    DownloadString() {
        return `${formatBytes(this.download_rate, 2, " ") + "/S"}`
    }

    UploadString() {
        return `${formatBytes(this.upload_rate, 2, " ") + "/S"}`
    }

    DownloadTotalString() {
        return formatBytes(this.download)
    }

    UploadTotalString() {
        return formatBytes(this.upload)
    }
}

const generateFlow = (flow: total_flow, prev: Flow): { upload_rate: number, download_rate: number } => {
    const duration = (new Date().getTime() - prev.time.getTime()) / 1000

    if ((prev.download !== 0 || prev.upload !== 0) && duration !== 0) {
        const download = Number(flow.download)
        const upload = Number(flow.upload)

        return {
            download_rate: download > prev.download ? (download - prev.download) / duration : 0,
            upload_rate: upload > prev.upload ? (upload - prev.upload) / duration : 0
        }
    }

    return { download_rate: 0, upload_rate: 0 }
}


export const useFlow = () => {
    const [lastFlow, setLastFlow] = useState<Flow>(new Flow(0, 0, 0, 0, {}));

    return useSWR(
        ProtoPath(connections.method.total),
        async () => {
            return FetchProtobuf(connections.method.total).then(async ({ data: r, error }) => {
                if (error) throw error
                if (r) {
                    const resp = generateFlow(r, lastFlow)
                    const flow = new Flow(Number(r.download), resp.download_rate, Number(r.upload), resp.upload_rate, r.counters)
                    setLastFlow(flow)
                    return flow
                }
            })
        },
        {
            refreshInterval: 2000,
        })
}

export const FlowCard: FC<{
    lastFlow?: Flow,
    flow_error?: { msg: string, code: number },
    extra_fields?: MetricProps[],
}> = ({ lastFlow, flow_error, extra_fields }) => {
    return (
        <div className="flex flex-wrap w-full gap-5 mb-3"
            style={{ viewTransitionName: "flow-card-root !important" }}>
            <MetricCard
                label="Total Download"
                value={lastFlow ? lastFlow.DownloadTotalString() : "Loading..."}
                error={flow_error?.msg}
            />
            <MetricCard
                label="Download Rate"
                value={lastFlow ? lastFlow.DownloadString() : "Loading..."}
                error={flow_error?.msg}
            />
            <MetricCard
                label="Total Upload"
                value={lastFlow ? lastFlow.UploadTotalString() : "Loading..."}
                error={flow_error?.msg}
            />
            <MetricCard
                label="Upload Rate"
                value={lastFlow ? lastFlow.UploadString() : "Loading..."}
                error={flow_error?.msg}
            />
            {
                extra_fields && extra_fields.map((field, index) => (
                    <MetricCard
                        key={`extra-field-${index}`}
                        label={field.label}
                        value={field.value || "Loading..."}
                        error={field.error}
                    />
                ))
            }
        </div>
    );
}

export const FlowContainer: FC<{
    onUpdate?: (counters: { [key: string]: counter }) => void
    onFlow?: (flow: Flow) => void
    extra_fields?: MetricProps[],
}> = React.memo((
    { onUpdate, onFlow, extra_fields }
) => {
    const { data: lastFlow, error: flow_error } = useFlow()

    useEffect(() => {
        if (onUpdate && lastFlow) { onUpdate(lastFlow.counters) }
        if (onFlow && lastFlow) { onFlow(lastFlow) }
    }, [onUpdate, onFlow, lastFlow])

    return <FlowCard lastFlow={lastFlow} flow_error={flow_error} extra_fields={extra_fields} />
})

export const ConnectionInfo: FC<{
    value: connection,
    startContent?: JSX.Element,
    endContent?: JSX.Element,
    showNodeModal?: (hash: string) => void,
}> = ({ value, startContent, endContent, showNodeModal }) => {

    return <>
        <DataList>
            {startContent}
            <DataListItem label="Id" value={value.id.toString()} />
            <DataListItem label="Addr" value={value.addr} />
            <DataListItem label="Geo" value={value.geo} />
            <DataListItem label="Type" value={value.type?.connType ? connType[value.type?.connType] : undefined} />
            <DataListItem label="UnderlyingType" value={value.type?.underlyingType ? connType[value.type?.underlyingType] : undefined} />
            <DataListItem label="Inbound" value={value.inboundName} />
            <DataListItem label="InboundAddr" value={value.inbound} />
            <DataListItem label="Source" value={value.source} />
            <DataListItem label="RemoteAddr" value={value.outbound} />
            <DataListItem label="Remote Geo" value={value.outboundGeo} />
            <DataListItem label="Interface" value={value.interface} />
            <DataListItem label="LocalAddr" value={value.localAddr} />
            <DataListItem label="Destination" value={value.destionation} />
            <DataListItem label="FakeIP" value={value.fakeIp} />
            <DataListItem label="Hosts" value={value.hosts} />
            <DataListItem label="Domain" value={value.domain} />
            <DataListItem label="IP" value={value.ip} />
            <DataListItem label="Tag" value={value.tag} />
            <DataListItem label="Lists" value={value.lists?.join(", ")} />
            <DataListItem label="Resolver" value={value.resolver} />

            {(value.nodeName || value.hash) &&
                <DataListItem
                    label="Point"
                    value={
                        !showNodeModal
                            ?
                            <>{value.nodeName ? value.nodeName : value.hash}</>
                            :
                            <a href="#" onClick={(e) => { e.preventDefault(); showNodeModal(value.hash) }}>
                                {value.nodeName ? value.nodeName : value.hash}
                            </a>
                    }
                />
            }

            <DataListItem label="Protocol" value={value.protocol} />
            <DataListItem label="Process" value={value.process} />
            <DataListItem label="TlsServerName" value={value.tlsServerName} />
            <DataListItem label="HttpHost" value={value.httpHost} />
            <DataListItem label="Component" value={value.component} />
            <DataListItem label="Mode" value={mode[value.mode]} />
            <DataListItem label="UdpMigrateId" value={value.udpMigrateId ? value.udpMigrateId.toString() : ""} />
            <DataListItem label="Pid" value={value.pid ? value.pid.toString() : ""} />
            <DataListItem label="Uid" value={value.uid ? value.uid.toString() : ""} />
            <MatchHistoryItem value={value.matchHistory || []} />

            {endContent}
        </DataList>
    </>
}

const IconCross = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-red-500/80">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

export const MatchHistoryItem = ({ value }: { value: match_history_entry[] }) => {

    if (!value || value.length === 0) return null;

    return (
        <DataListCustomItem>
            <div className="sm:flex justify-between items-start gap-3 w-full">

                {/* Left Side: Main Title */}
                <div
                    className="endpoint-name notranslate capitalize shrink-0 mb-3 sm:mb-0 font-semibold min-w-[110px] text-sm text-[var(--sidebar-header-color)]"
                >
                    MatchHistory
                </div>

                {/* Right Side: Container for Rule Groups */}
                <div className="flex-grow w-full flex flex-col gap-3">
                    {
                        value.map((e: any, i: number) => {
                            return (
                                /* GROUP CONTAINER: Wraps each Rule in a distinct "Box" */
                                <div
                                    key={"rule-" + e.ruleName + i}
                                    className="rounded-lg p-3 border border-[var(--sidebar-border-color)] bg-[var(--sidebar-hover-bg)]"
                                >
                                    {/* Rule Group Header */}
                                    <div
                                        className="mb-2 pb-2 border-b flex justify-between items-center border-[var(--sidebar-border-color)]"
                                    >
                                        <span className="text-[0.85rem] font-bold uppercase tracking-[0.5px] text-[var(--sidebar-header-color)]">
                                            {e.ruleName}
                                        </span>
                                        {/* Optional: Count badge or similar could go here */}
                                    </div>

                                    {/* Items List inside the Group */}
                                    <div className="flex flex-col gap-2">
                                        {e.history && e.history.map((h: any, j: number) => {
                                            return (
                                                <div
                                                    key={"list-" + h.listName + j}
                                                    className="flex items-center justify-between"
                                                >
                                                    {/* List Name */}
                                                    <span
                                                        className="notranslate break-all text-[0.95rem] text-[var(--sidebar-color)]"
                                                    >
                                                        {h.listName}
                                                    </span>

                                                    {/* Status Icon & Label */}
                                                    <div className="flex items-center gap-2 pl-3 shrink-0">
                                                        <span className={`text-xs font-medium ${h.matched ? 'text-green-500 opacity-100' : 'text-[var(--sidebar-color)] opacity-70'}`}>
                                                            {h.matched ? 'Hit' : 'Miss'}
                                                        </span>
                                                        <div
                                                            className={`flex items-center justify-center rounded-full w-6 h-6 ${h.matched ? 'bg-green-500/10' : 'bg-white/5'}`}
                                                        >
                                                            {h.matched ? <Check /> : <IconCross />}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </DataListCustomItem>
    );
}
