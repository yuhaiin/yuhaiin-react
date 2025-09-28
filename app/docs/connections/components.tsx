import React, { FC, JSX, useCallback, useEffect, useState } from "react";
import { Badge, Card, ListGroup } from "react-bootstrap";
import useSWR from "swr";
import { FetchProtobuf, ProtoPath } from "../common/proto";
import { NodeModal } from "../node/modal";
import { mode } from "../pbes/config/bypass/bypass_pb";
import { connection, type as connType } from "../pbes/statistic/config_pb";
import { connections, counter, total_flow } from "../pbes/statistic/grpc/config_pb";

export const ListGroupItemString: FC<{ itemKey: string, itemValue: string }> =
    ({ itemKey, itemValue }) => {
        if (itemValue == "") return <></>

        return <>
            <ListGroup.Item>
                <div className="d-sm-flex">
                    <div className="endpoint-name flex-grow-1 notranslate text-capitalize">{itemKey}</div>

                    <div className="notranslate text-break" style={{ opacity: 0.6 }}>
                        {itemValue}
                    </div>
                </div>
            </ListGroup.Item>
        </>
    }

export const ConnectionInfo: FC<{
    value: connection,
    startContent?: JSX.Element,
    endContent?: JSX.Element,
}> = ({ value, startContent, endContent }) => {
    const [modalHash, setModalHash] = useState({ show: false, hash: "" });

    const showModal = useCallback((hash: string) => {
        setModalHash({ show: true, hash: hash })
    }, [setModalHash])

    const hideModal = useCallback(() => {
        setModalHash(prev => { return { ...prev, show: false } })
    }, [setModalHash])

    return <>
        <NodeModal
            show={modalHash.show}
            hash={modalHash.hash}
            editable={false}
            onHide={hideModal}
        />

        <ListGroup variant="flush" className="w-100 p-2">
            {startContent}
            <ListGroupItemString itemKey="Id" itemValue={value.id.toString()} />
            <ListGroupItemString itemKey="Addr" itemValue={value.addr} />
            <ListGroupItemString itemKey="Type" itemValue={connType[value.type?.connType]} />
            <ListGroupItemString itemKey="UnderlyingType" itemValue={connType[value.type?.underlyingType]} />
            <ListGroupItemString itemKey="Inbound" itemValue={value.inboundName} />
            <ListGroupItemString itemKey="InboundAddr" itemValue={value.inbound} />
            <ListGroupItemString itemKey="Source" itemValue={value.source} />
            <ListGroupItemString itemKey="Outbound" itemValue={value.outbound} />
            <ListGroupItemString itemKey="Interface" itemValue={value.interface} />
            <ListGroupItemString itemKey="LocalAddr" itemValue={value.localAddr} />
            <ListGroupItemString itemKey="Destination" itemValue={value.destionation} />
            <ListGroupItemString itemKey="FakeIP" itemValue={value.fakeIp} />
            <ListGroupItemString itemKey="Hosts" itemValue={value.hosts} />
            <ListGroupItemString itemKey="Domain" itemValue={value.domain} />
            <ListGroupItemString itemKey="IP" itemValue={value.ip} />
            <ListGroupItemString itemKey="Tag" itemValue={value.tag} />
            <ListGroupItemString itemKey="Resolver" itemValue={value.resolver} />

            {(value.nodeName || value.hash) &&
                <ListGroup.Item>
                    <div className="d-sm-flex">
                        <div className="endpoint-name flex-grow-1 notranslate text-capitalize">Point</div>
                        <div className="notranslate text-break" style={{ opacity: 0.6 }}>
                            <a href="#" onClick={(e) => { e.preventDefault(); showModal(value.hash) }}>
                                {value.nodeName ? value.nodeName : value.hash}
                            </a>
                        </div>
                    </div>
                </ListGroup.Item>
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

            {value.matchHistory && value.matchHistory.length > 0 &&
                <ListGroup.Item>
                    <div className="d-sm-flex">
                        <div className="endpoint-name flex-grow-1 notranslate text-capitalize">MatchHistory</div>

                        <div className="notranslate text-break" style={{ opacity: 0.6 }}>
                            {
                                value.matchHistory.map((e, i) => {
                                    return <div key={"rule-" + e.ruleName + i}>

                                        <div className="d-flex align-items-center gap-2">
                                            <div style={{ flex: 1, height: "1px", background: "black" }}></div>
                                            <span><b>{e.ruleName}</b></span>
                                            <div style={{ flex: 1, height: "1px", background: "black" }}></div>
                                        </div>

                                        <div className="mt-2 mb-2">
                                            {e.history && e.history.map((h, j) => {
                                                return <div key={"list-" + h.listName + j}>
                                                    <div>{h.matched ? <Badge bg="success">Hit</Badge> : <Badge bg="danger">Miss</Badge>} {h.listName}</div>
                                                </div>
                                            })}
                                        </div>

                                    </div>
                                })
                            }
                        </div>
                    </div>
                </ListGroup.Item>
            }
            {endContent}
        </ListGroup>
    </>
}


const Unit = {
    B: 'B',
    KB: 'KB',
    MB: 'MB',
    GB: 'GB',
    TB: 'TB',
    PB: 'PB'
};

function reducedUnit(bytes: number) {
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

export const formatBytes = (a = 0, b = 2) => {
    const { bytes, unit } = reducedUnit(a);
    return `${bytes.toFixed(b)}${unit}`;
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
        const dstr = formatBytes(this.download)
        const dratestr = formatBytes(this.download_rate) + "/S"

        return `(${dstr}): ${dratestr}`
    }

    UploadString() {
        const ustr = formatBytes(this.upload)
        const uratestr = formatBytes(this.upload_rate) + "/S"

        return `(${ustr}): ${uratestr}`
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
    end_content?: React.ReactNode
}> = ({ lastFlow, flow_error, end_content }) => {
    return <Card className="mb-3">
        <ListGroup variant="flush">

            <ListGroup.Item>
                <div className="d-sm-flex">
                    <div className="endpoint-name flex-grow-1 notranslate">Download</div>
                    <div className="notranslate" style={{ opacity: 0.6 }} id="statistic-download">
                        {flow_error ? flow_error.msg : lastFlow ? lastFlow.DownloadString() : "Loading..."}
                    </div>
                </div>
            </ListGroup.Item>


            <ListGroup.Item>
                <div className="d-sm-flex">
                    <div className="endpoint-name flex-grow-1 notranslate">Upload</div>
                    <div className="notranslate" style={{ opacity: 0.6 }} id="statistic-upload">
                        {flow_error ? flow_error.msg : lastFlow ? lastFlow.UploadString() : "Loading..."}
                    </div>
                </div>
            </ListGroup.Item>

            {end_content}
        </ListGroup>
    </Card>
}

export const FlowContainer: FC<{
    onUpdate?: (counters: { [key: string]: counter }) => void
    end_content?: React.ReactNode,
}> = React.memo((
    { onUpdate, end_content }
) => {
    const { data: lastFlow, error: flow_error } = useFlow()

    useEffect(() => {
        if (onUpdate && lastFlow) { onUpdate(lastFlow.counters) }
    }, [onUpdate, lastFlow])

    return <FlowCard lastFlow={lastFlow} flow_error={flow_error} end_content={end_content} />
})
