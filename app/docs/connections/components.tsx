import { DescField } from "@bufbuild/protobuf";
import { reflect, ReflectMessage } from "@bufbuild/protobuf/reflect";
import React, { FC, JSX, useEffect, useState } from "react";
import { Badge, Card, ListGroup } from "react-bootstrap";
import useSWR from "swr";
import { FetchProtobuf, ProtoPath } from "../common/proto";
import { connection, connectionSchema } from "../pbes/statistic/config_pb";
import { connections, counter, total_flow } from "../pbes/statistic/grpc/config_pb";

export const ListGroupItem: FC<{ itemKey: string, itemValue: string, showModal?: (hash: string) => void }> =
    ({ itemKey, itemValue, showModal }) => {
        return (
            <>
                <ListGroup.Item>
                    <div className="d-sm-flex">
                        <div className="endpoint-name flex-grow-1 notranslate text-capitalize">{itemKey}</div>

                        <div className="notranslate text-break" style={{ opacity: 0.6 }}>
                            <ItemInfo itemKey={itemKey} itemValue={itemValue} showModal={showModal} />
                        </div>
                    </div>
                </ListGroup.Item>
            </>
        )
    }

type MatchHistory = {
    rule_name: string,
    history: { list_name: string, matched: boolean }[]
}
const ItemInfo: FC<{ itemKey: string, itemValue: string, showModal?: (hash: string) => void }> =
    ({ itemKey, itemValue, showModal }) => {
        if (itemKey === "mode reason") {
            const history = JSON.parse(itemValue) as MatchHistory[]
            return <>
                <div>

                    <div className="d-flex align-items-center gap-2">
                        <div style={{ flex: 1, height: "1px", background: "black" }}></div>
                        <span><b>Rule Name</b></span>
                        <div style={{ flex: 1, height: "1px", background: "black" }}></div>
                    </div>

                    <div className="mt-2 mb-2">
                        <div >
                            <div><Badge bg="success">Hit</Badge> List Name</div>
                            <div><Badge bg="danger">Miss</Badge> List Name</div>
                        </div>
                    </div>
                </div>

                <hr />

                {history.map((e, i) => {
                    return <div key={"rule-" + e.rule_name + i}>

                        <div className="d-flex align-items-center gap-2">
                            <div style={{ flex: 1, height: "1px", background: "black" }}></div>
                            <span><b>{e.rule_name}</b></span>
                            <div style={{ flex: 1, height: "1px", background: "black" }}></div>
                        </div>

                        <div className="mt-2 mb-2">
                            {e.history.map((h, j) => {
                                return <div key={"list-" + h.list_name + j}>
                                    <div>{h.matched ? <Badge bg="success">Hit</Badge> : <Badge bg="danger">Miss</Badge>} {h.list_name}</div>
                                </div>
                            })}
                        </div>

                    </div>
                })}
            </>
        }

        if (itemKey == "hash" && showModal) {
            return <a href="#" onClick={(e) => { e.preventDefault(); showModal(itemValue) }}>
                {itemValue}
            </a>
        }

        return <>{itemValue}</>
    }

export const ConnectionInfo: FC<{
    value: connection,
    startContent?: JSX.Element,
    endContent?: JSX.Element,
    showModal?: (hash: string) => void
}> = ({ value, startContent, endContent, showModal }) => {

    function rangeInfo(d: connection) {
        const ref = reflect(connectionSchema, d)


        const getValueString = (f: DescField, ref: ReflectMessage) => {
            if (f.fieldKind === "enum") {
                const value: number = ref.get(f)
                return f.enum.value[value].name
            } else {
                const value = ref.get(f)
                if (!value) return undefined
                return value.toString()
            }
        }

        const Item: FC<{ f: DescField, ref: ReflectMessage }> = ({ f, ref }) => {
            const valueStr = getValueString(f, ref)
            if (!valueStr) return
            return <ListGroupItem itemKey={f.name.replaceAll("_", " ")} itemValue={valueStr} showModal={showModal} />
        }

        return <>
            {
                ref.fields.map((f) => {
                    if (f.fieldKind === "message") {
                        const value: ReflectMessage = ref.get(f)
                        return value.fields.map((f) => {
                            return <Item f={f} ref={value} key={f.name} />
                        })
                    }

                    return <Item f={f} ref={ref} key={f.name} />
                })
            }
        </>
    }

    return <>
        <ListGroup variant="flush" className="w-100 p-2">
            {startContent}
            {rangeInfo(value)}
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
    let drate = 0
    let urate = 0

    if ((prev.download !== 0 || prev.upload !== 0) && duration !== 0) {
        const download = Number(flow.download)
        const upload = Number(flow.upload)
        drate = (download - prev.download) / duration
        urate = (upload - prev.upload) / duration
    }

    return {
        download_rate: drate,
        upload_rate: urate
    }
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
