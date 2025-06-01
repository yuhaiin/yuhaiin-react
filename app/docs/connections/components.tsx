import { DescField } from "@bufbuild/protobuf";
import { reflect, ReflectMessage } from "@bufbuild/protobuf/reflect";
import { FC, JSX, useState } from "react";
import { ListGroup } from "react-bootstrap";
import useSWR from "swr";
import { FetchProtobuf, ProtoPath } from "../common/proto";
import { connection, connectionSchema } from "../pbes/statistic/config_pb";
import { connections, counter, total_flow } from "../pbes/statistic/grpc/config_pb";

export const ListGroupItem = (props: { itemKey: string, itemValue: string, showModal?: (hash: string) => void }) => {
    return (
        <>
            <ListGroup.Item>
                <div className="d-sm-flex">
                    <div className="endpoint-name flex-grow-1 notranslate text-capitalize">{props.itemKey}</div>

                    <div className="notranslate text-break" style={{ opacity: 0.6 }}>
                        {
                            (props.itemKey !== "hash" || !props.showModal) ? props.itemValue :
                                <a
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); if (props.showModal) props.showModal(props.itemValue) }}
                                >
                                    {props.itemValue}
                                </a>
                        }
                    </div>
                </div>
            </ListGroup.Item>
        </>
    )
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
        <ListGroup variant="flush">
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

export type last_flow = {
    download: number,
    download_rate: string,
    upload: number,
    upload_rate: string,
    counters: { [key: string]: counter },
    time: Date
}

const generateFlow = (flow: total_flow, prev: last_flow): { upload_rate: string, download_rate: string } => {
    const download = Number(flow.download)
    const upload = Number(flow.upload)
    const duration = (new Date().getTime() - prev.time.getTime()) / 1000

    const dstr = formatBytes(download)
    const ustr = formatBytes(upload)
    let dratestr = "Loading..."
    let uratestr = "Loading..."

    if ((prev.download !== 0 || prev.upload !== 0) && duration !== 0) {
        dratestr = formatBytes((download - prev.download) / duration) + "/S"
        uratestr = formatBytes((upload - prev.upload) / duration) + "/S"
    }

    return {
        download_rate: `(${dstr}): ${dratestr}`,
        upload_rate: `(${ustr}): ${uratestr}`
    }
}


export const useFlow = () => {
    const [lastFlow, setLastFlow] = useState<last_flow>({
        download: 0, upload: 0, counters: {}, time: new Date(),
        download_rate: "Loading...", upload_rate: "Loading..."
    });

    return useSWR(
        ProtoPath(connections.method.total),
        async () => {
            return FetchProtobuf(connections.method.total).then(async ({ data: r, error }) => {
                if (error) throw error
                if (r) {
                    try {
                        const resp = generateFlow(r, lastFlow)
                        setLastFlow(prev => {
                            return {
                                ...prev,
                                download: Number(r.download),
                                upload: Number(r.upload),
                                counters: r.counters,
                                time: new Date(),
                                download_rate: resp.download_rate,
                                upload_rate: resp.upload_rate
                            }
                        })
                        return { ...lastFlow }
                    } catch (e) {
                        throw { msg: e.toString(), code: 500 }
                    }
                }
            })
        },
        {
            refreshInterval: 2000
        })
}
