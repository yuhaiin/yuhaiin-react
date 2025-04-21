"use client"

import { create } from "@bufbuild/protobuf";
import { EmptySchema } from "@bufbuild/protobuf/wkt";
import { FC, useContext, useState } from "react";
import { Accordion, Badge, Button, Card, ListGroup, Spinner } from "react-bootstrap";
import useSWR from 'swr';
import useSWRSubscription from 'swr/subscription';
import Loading from "../common/loading";
import { FetchProtobuf, ProtoPath, WebsocketProtoServerStream } from "../common/proto";
import { GlobalToastContext } from "../common/toast";
import { NodeModal } from "../node/modal";
import { mode } from "../pbes/config/bypass/bypass_pb";
import { connection, type } from "../pbes/statistic/config_pb";
import { connections, counter, notify_data, notify_remove_connectionsSchema, total_flow } from "../pbes/statistic/grpc/config_pb";
import { ConnectionInfo } from "./components";

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

const formatBytes = (a = 0, b = 2) => {
    const { bytes, unit } = reducedUnit(a);
    return `${bytes.toFixed(b)}${unit}`;
}

type last_flow = {
    download: number,
    download_rate: string,
    upload: number,
    upload_rate: string,
    counters: { [key: string]: counter },
    time: Date
}

const generateFlow = (flow: total_flow, prev: last_flow): { upload_rate: string, download_rate: string } => {
    const duration = (new Date().getTime() - prev.time.getTime()) / 1000
    if ((prev.download === 0 && prev.upload === 0) || duration === 0) return { download_rate: "Loading...", upload_rate: "Loading..." }
    const download = Number(flow.download)
    const upload = Number(flow.upload)
    return {
        download_rate: `(${formatBytes(download)}): ${formatBytes((download - prev.download) / duration)}/S`,
        upload_rate: `(${formatBytes(upload)}): ${formatBytes((upload - prev.upload) / duration)}/S`
    }
}

function Connections() {
    const [modalHash, setModalHash] = useState({ show: false, hash: "" });
    const [lastFlow, setLastFlow] = useState<last_flow>({
        download: 0, upload: 0, counters: {}, time: new Date(),
        download_rate: "Loading...", upload_rate: "Loading..."
    });

    const processStream = (r: notify_data, prev?: Map<bigint, connection>): Map<bigint, connection> => {
        if (prev === undefined) prev = new Map()
        switch (r.data.case) {
            case "notifyNewConnections":
                r.data.value.
                    connections.
                    sort((a, b) => a.id > b.id ? 1 : -1).
                    forEach((e: connection) => { prev.set(e.id, e) })
                break
            case "notifyRemoveConnections":
                r.data.value.ids.forEach((e: bigint) => { prev.delete(e) })
                break
        }
        return prev
    }

    const { error: flow_error } = useSWR("/flow/total", async () => {
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
                    return resp
                } catch (e) {
                    throw { msg: e.toString(), code: 500 }
                }
            }
        })
    },
        { refreshInterval: 2000 })

    const { data: conns, error: conn_error } =
        useSWRSubscription(
            ProtoPath(connections.method.notify),
            WebsocketProtoServerStream(connections.method.notify, create(EmptySchema, {}), processStream),
            {}
        )

    return (
        <>
            <NodeModal
                show={modalHash.show}
                hash={modalHash.hash}
                editable={false}
                onHide={() => setModalHash({ ...modalHash, show: false })}
            />

            <Card className="mb-3">
                <ListGroup variant="flush">

                    <ListGroup.Item>

                        <div className="d-sm-flex">
                            <div className="endpoint-name flex-grow-1 notranslate">Download</div>
                            <div className="notranslate" style={{ opacity: 0.6 }} id="statistic-download">{flow_error ? flow_error.msg : lastFlow.download_rate}</div>
                        </div>
                    </ListGroup.Item>


                    <ListGroup.Item>
                        <div className="d-sm-flex">
                            <div className="endpoint-name flex-grow-1 notranslate">Upload</div>
                            <div className="notranslate" style={{ opacity: 0.6 }} id="statistic-upload">{flow_error ? flow_error.msg : lastFlow.upload_rate}</div>
                        </div>
                    </ListGroup.Item>
                </ListGroup>
            </Card>

            {
                conn_error !== undefined ? <Loading code={conn_error.code}>{conn_error.msg}</Loading> :
                    conns === undefined ? <Loading /> :
                        <Accordion className="mb-3" alwaysOpen id="connections">
                            {
                                [...conns.values()].reverse().map((e) => {
                                    return <AccordionItem data={e} counter={lastFlow.counters[e.id.toString()]} key={e.id} showModal={(hash) => setModalHash({ show: true, hash: hash })} />
                                })
                            }
                        </Accordion>
            }
        </>
    );
}

const AccordionItem: FC<{ data: connection, counter: counter, showModal: (hash: string) => void }> =
    ({ data, counter, showModal }) => {
        const ctx = useContext(GlobalToastContext);

        const [closing, setClosing] = useState(false);

        return (
            <Accordion.Item eventKey={data.id.toString()} key={data.id}>

                <Accordion.Header>
                    <div className="d-line text-break">
                        <code className="ms-2">{data.id.toString()}</code>
                        <span className="ms-2">{data.addr}</span>
                        <Badge className="bg-light rounded-pill text-dark ms-1">{formatBytes(Number(counter && counter.download ? counter.download : 0))} / {formatBytes(Number(counter && counter.upload ? counter.upload : 0))}</Badge>
                        <Badge className="bg-light rounded-pill text-dark ms-1 text-uppercase">{mode[data.mode]}</Badge>
                        <Badge className="bg-light rounded-pill text-dark ms-1 text-uppercase">{type[data.type?.connType ?? 0]}</Badge>
                        {
                            data.tag &&
                            <Badge className="bg-light rounded-pill text-dark ms-1 text-uppercase">{data.tag}</Badge>
                        }
                    </div>
                </Accordion.Header>

                <Accordion.Body>
                    <ConnectionInfo value={data} showModal={showModal}
                        endContent={<ListGroup.Item>
                            <div className="d-sm-flex">
                                <Button
                                    variant="outline-danger"
                                    className="flex-grow-1 notranslate"
                                    disabled={closing}
                                    onClick={() => {
                                        setClosing(true)
                                        FetchProtobuf(
                                            connections.method.close_conn,
                                            create(notify_remove_connectionsSchema, { ids: [data.id] }),
                                        )
                                            .then(async ({ error }) => {
                                                if (error) {
                                                    ctx.Error(`code ${data.id} failed, ${error.code}| ${error.msg}`)
                                                    setClosing(false)
                                                } else {
                                                    setTimeout(() => { setClosing(false) }, 5000)
                                                }
                                            })
                                    }}
                                >
                                    Close
                                    {closing && <>&nbsp;<Spinner size="sm" animation="border" variant='danger' /></>}
                                </Button>
                            </div>
                        </ListGroup.Item>}
                    />
                </Accordion.Body>

            </Accordion.Item >
        )
    }

export default Connections;