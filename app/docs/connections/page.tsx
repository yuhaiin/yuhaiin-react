"use client"

import { create } from "@bufbuild/protobuf";
import { EmptySchema } from "@bufbuild/protobuf/wkt";
import { FC, useContext, useState } from "react";
import { Accordion, Badge, Button, Card, ListGroup, Spinner } from "react-bootstrap";
import useSWRSubscription from 'swr/subscription';
import Loading from "../common/loading";
import { FetchProtobuf, ProtoPath, WebsocketProtoServerStream } from "../common/proto";
import { GlobalToastContext } from "../common/toast";
import { NodeModal } from "../node/modal";
import { mode } from "../pbes/config/bypass/bypass_pb";
import { connection, type } from "../pbes/statistic/config_pb";
import { connections, counter, notify_data, notify_remove_connectionsSchema } from "../pbes/statistic/grpc/config_pb";
import { ConnectionInfo, formatBytes, useFlow } from "./components";

function Connections() {
    const [modalHash, setModalHash] = useState({ show: false, hash: "" });

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

    const { data: lastFlow, error: flow_error } = useFlow()

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
                        <Badge className="bg-light rounded-pill text-dark ms-1">
                            {formatBytes(Number(counter && counter.download ? counter.download : 0))} / {formatBytes(Number(counter && counter.upload ? counter.upload : 0))}
                        </Badge>
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