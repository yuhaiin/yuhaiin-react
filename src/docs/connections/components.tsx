"use client"

import { DataList, DataListCustomItem, DataListItem } from "@/component/v2/datalist";
import React, { FC, JSX, useEffect, useState } from "react";
import { Check } from "react-bootstrap-icons";
import useSWR from "swr";
import { FetchProtobuf, ProtoPath } from "../../common/proto";
import { connections, counter, total_flow } from "../pbes/api/statistic_pb";
import { mode } from "../pbes/config/bypass_pb";
import { connection, type as connType, match_history_entry } from "../pbes/statistic/config_pb";
import styles from './flowcard.module.css';

interface MetricProps {
    label: string;
    value: React.ReactNode;
    error?: string;
    color?: string;
}

const MetricCard: FC<MetricProps> = ({ label, value, error, color = '#3b82f6' }) => {
    return (
        <div
            className={styles.metricCard}
        // Show a blue light line on the left edge of the card
        // style={{ '--accent-color': color } as React.CSSProperties}
        >
            <div className={styles.metricCardLabel}>{label}</div>
            <div className={`${styles.metricCardValue} ${error ? styles.error : ''}`}>
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
                    try {
                        const resp = generateFlow(r, lastFlow)
                        const flow = new Flow(Number(r.download), resp.download_rate, Number(r.upload), resp.upload_rate, r.counters)
                        setLastFlow(flow)
                        return flow
                    } catch (e) {
                        throw { msg: e.toString(), code: 500 }
                    }
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
        <div className={`${styles.flowCardGrid} mb-3`}
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

export const ListGroupItemString: FC<{ itemKey: string, itemValue: string }> =
    ({ itemKey, itemValue }) => {
        return <DataListItem label={itemKey} value={itemValue} />;
    }

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
            <ListGroupItemString itemKey="Geo" itemValue={value.geo} />
            <ListGroupItemString itemKey="Type" itemValue={connType[value.type?.connType]} />
            <ListGroupItemString itemKey="UnderlyingType" itemValue={connType[value.type?.underlyingType]} />
            <ListGroupItemString itemKey="Inbound" itemValue={value.inboundName} />
            <ListGroupItemString itemKey="InboundAddr" itemValue={value.inbound} />
            <ListGroupItemString itemKey="Source" itemValue={value.source} />
            <ListGroupItemString itemKey="RemoteAddr" itemValue={value.outbound} />
            <ListGroupItemString itemKey="Remote Geo" itemValue={value.outboundGeo} />
            <ListGroupItemString itemKey="Interface" itemValue={value.interface} />
            <ListGroupItemString itemKey="LocalAddr" itemValue={value.localAddr} />
            <ListGroupItemString itemKey="Destination" itemValue={value.destionation} />
            <ListGroupItemString itemKey="FakeIP" itemValue={value.fakeIp} />
            <ListGroupItemString itemKey="Hosts" itemValue={value.hosts} />
            <ListGroupItemString itemKey="Domain" itemValue={value.domain} />
            <ListGroupItemString itemKey="IP" itemValue={value.ip} />
            <ListGroupItemString itemKey="Tag" itemValue={value.tag} />
            <ListGroupItemString itemKey="Lists" itemValue={value.lists?.join(", ")} />
            <ListGroupItemString itemKey="Resolver" itemValue={value.resolver} />

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

            <ListGroupItemString itemKey="Protocol" itemValue={value.protocol} />
            <ListGroupItemString itemKey="Process" itemValue={value.process} />
            <ListGroupItemString itemKey="TlsServerName" itemValue={value.tlsServerName} />
            <ListGroupItemString itemKey="HttpHost" itemValue={value.httpHost} />
            <ListGroupItemString itemKey="Component" itemValue={value.component} />
            <ListGroupItemString itemKey="Mode" itemValue={mode[value.mode]} />
            <ListGroupItemString itemKey="UdpMigrateId" itemValue={value.udpMigrateId ? value.udpMigrateId.toString() : ""} />
            <ListGroupItemString itemKey="Pid" itemValue={value.pid ? value.pid.toString() : ""} />
            <ListGroupItemString itemKey="Uid" itemValue={value.uid ? value.uid.toString() : ""} />
            <MatchHistoryItem value={value.matchHistory || []} />

            {endContent}
        </DataList>
    </>
}

const IconCross = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-danger" style={{ opacity: 0.8 }}>
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

export const MatchHistoryItem = ({ value }: { value: match_history_entry[] }) => {

    if (!value || value.length === 0) return null;

    return (
        <DataListCustomItem>
            <div className="d-sm-flex justify-content-between align-items-start gap-3 w-100">

                {/* Left Side: Main Title */}
                <div
                    className="endpoint-name notranslate text-capitalize flex-shrink-0 mb-3 mb-sm-0"
                    style={{
                        color: 'var(--sidebar-header-color)',
                        fontWeight: '600',
                        minWidth: '110px',
                        fontSize: '0.875rem' // Match DataList key font size
                    }}
                >
                    MatchHistory
                </div>

                {/* Right Side: Container for Rule Groups */}
                <div className="flex-grow-1 w-100 d-flex flex-column gap-3">
                    {
                        value.map((e: any, i: number) => {
                            return (
                                /* GROUP CONTAINER: Wraps each Rule in a distinct "Box" */
                                <div
                                    key={"rule-" + e.ruleName + i}
                                    className="rounded-3 p-3"
                                    style={{
                                        border: '1px solid var(--sidebar-border-color)',
                                        // Use a subtle background (like hover-bg) to separate it from the main background
                                        backgroundColor: 'var(--sidebar-hover-bg)',
                                    }}
                                >
                                    {/* Rule Group Header */}
                                    <div
                                        className="mb-2 pb-2 border-bottom d-flex justify-content-between align-items-center"
                                        style={{ borderColor: 'var(--sidebar-border-color)' }}
                                    >
                                        <span style={{
                                            fontSize: '0.85rem',
                                            color: 'var(--sidebar-header-color)', // Brighter color
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            {e.ruleName}
                                        </span>
                                        {/* Optional: Count badge or similar could go here */}
                                    </div>

                                    {/* Items List inside the Group */}
                                    <div className="d-flex flex-column gap-2">
                                        {e.history && e.history.map((h: any, j: number) => {
                                            return (
                                                <div
                                                    key={"list-" + h.listName + j}
                                                    className="d-flex align-items-center justify-content-between"
                                                >
                                                    {/* List Name */}
                                                    <span
                                                        className="notranslate text-break"
                                                        style={{
                                                            fontSize: '0.95rem',
                                                            color: 'var(--sidebar-color)'
                                                        }}
                                                    >
                                                        {h.listName}
                                                    </span>

                                                    {/* Status Icon & Label */}
                                                    <div className="d-flex align-items-center gap-2 ps-3 flex-shrink-0">
                                                        <span style={{
                                                            fontSize: '0.8rem',
                                                            fontWeight: '500',
                                                            color: h.matched ? 'var(--bs-success)' : 'var(--sidebar-color)',
                                                            opacity: h.matched ? 1 : 0.7
                                                        }}>
                                                            {h.matched ? 'Hit' : 'Miss'}
                                                        </span>
                                                        <div
                                                            className="d-flex align-items-center justify-content-center rounded-circle"
                                                            style={{
                                                                width: '24px',
                                                                height: '24px',
                                                                backgroundColor: h.matched ? 'rgba(25, 135, 84, 0.1)' : 'rgba(255, 255, 255, 0.05)'
                                                            }}
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