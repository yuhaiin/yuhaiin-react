import { create } from "@bufbuild/protobuf";
import { FC, useState } from "react";
import { Button, InputGroup, ListGroup } from "react-bootstrap";
import { FormSelect, SettingCheck } from "../common/switch";
import { Container, MoveUpDown } from "../config/components";
import {
    aeadSchema,
    grpcSchema,
    http2Schema,
    http_mockSchema,
    inbound,
    muxSchema,
    normalSchema,
    proxySchema,
    realitySchema,
    tls_autoSchema,
    tlsSchema,
    transportSchema,
    websocketSchema
} from "../pbes/config/inbound_pb";
import { tls_server_configSchema } from "../pbes/node/protocol_pb";
import { Network } from "./network";
import { Protocol } from "./protocol";
import { Transport } from "./transport";

export const Inbound: FC<{ inbound: inbound, onChange: (x: inbound) => void }> = ({ inbound, onChange }) => {
    const [newProtocol, setNewProtocol] = useState({ value: "normal" });

    return <>
        <SettingCheck
            label="Enabled"
            checked={inbound.enabled}
            onChange={() => { onChange({ ...inbound, enabled: !inbound.enabled }) }}
        />

        {/* <SettingInputText
            label="Name"
            value={inbound.name}
            onChange={(e) => { onChange({ ...inbound, name: e }) }}
        /> */}

        <Container title="Network" className="mb-2" hideClose>
            <Network inbound={inbound} onChange={(x) => { onChange({ ...x }) }} />
        </Container>

        <Container title="Transport" className="mb-2" hideClose>
            <>
                {
                    inbound.transport.map((x, i) => {
                        return <Container
                            key={i}
                            className={i !== 0 ? "mt-2" : ""}
                            title={x.transport.case?.toString() ?? ""}
                            onClose={() => { onChange({ ...inbound, transport: [...inbound.transport.slice(0, i), ...inbound.transport.slice(i + 1)] }) }}
                            moveUpDown={new MoveUpDown(inbound.transport, i, (x) => onChange({ ...inbound, transport: x }))}
                        >
                            <Transport key={i} transport={x} onChange={(x) => {
                                onChange({ ...inbound, transport: [...inbound.transport.slice(0, i), x, ...inbound.transport.slice(i + 1)] })
                            }} />
                        </Container>
                    })
                }

                <ListGroup variant="flush">
                    <ListGroup.Item>
                        <InputGroup>
                            <FormSelect
                                value={newProtocol.value}
                                values={[
                                    "normal", "tls", "mux",
                                    "http2", "websocket", "grpc",
                                    "reality", "tlsAuto", "httpMock",
                                    "aead", "proxy"
                                ]}
                                onChange={(e) => setNewProtocol({ value: e })}
                            />
                            <Button
                                variant="outline-success"
                                onClick={() => {
                                    const x = { ...inbound, transport: [...inbound.transport] }
                                    switch (newProtocol.value) {
                                        case "normal":
                                            x.transport.push(create(transportSchema, {
                                                transport: { case: "normal", value: create(normalSchema, {}) }
                                            }))
                                            break
                                        case "tlsAuto":
                                            x.transport.push(create(transportSchema, {
                                                transport: { case: "tlsAuto", value: create(tls_autoSchema, {}) }
                                            }))
                                            break
                                        case "tls":
                                            x.transport.push(create(transportSchema, {
                                                transport: {
                                                    case: "tls", value: create(tlsSchema, { tls: create(tls_server_configSchema, {}) })
                                                }
                                            }))
                                            break
                                        case "mux":
                                            x.transport.push(create(transportSchema, {
                                                transport: { case: "mux", value: create(muxSchema, {}) }
                                            }))
                                            break
                                        case "http2":
                                            x.transport.push(create(transportSchema, {
                                                transport: { case: "http2", value: create(http2Schema, {}) }
                                            }))
                                            break
                                        case "websocket":
                                            x.transport.push(create(transportSchema, {
                                                transport: { case: "websocket", value: create(websocketSchema, {}) }
                                            }))
                                            break
                                        case "grpc":
                                            x.transport.push(create(transportSchema, {
                                                transport: { case: "grpc", value: create(grpcSchema, {}) }
                                            }))
                                            break
                                        case "reality":
                                            x.transport.push(create(transportSchema, {
                                                transport: { case: "reality", value: create(realitySchema, {}) }
                                            }))
                                            break
                                        case "httpMock":
                                            x.transport.push(create(transportSchema, {
                                                transport: { case: "httpMock", value: create(http_mockSchema, {}) }
                                            }))
                                        case "aead":
                                            x.transport.push(create(transportSchema, {
                                                transport: { case: "aead", value: create(aeadSchema, {}) }
                                            }))
                                            break
                                        case "proxy":
                                            x.transport.push(create(transportSchema, {
                                                transport: { case: "proxy", value: create(proxySchema, {}) }
                                            }))
                                            break
                                    }
                                    onChange(x)
                                }}
                            >
                                <i className="bi bi-plus-lg" />Add
                            </Button>
                        </InputGroup>
                    </ListGroup.Item>
                </ListGroup>
            </>

        </Container>

        <Container title="Protocol" hideClose>
            <Protocol inbound={inbound} onChange={(x) => { onChange({ ...x }) }} />
        </Container>
    </>
}
