"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/component/v2/accordion";
import { Button } from "@/component/v2/button";
import { Card, CardBody, CardHeader, SettingLabel } from "@/component/v2/card";
import { Select } from "@/component/v2/forms";
import { SwitchCard } from "@/component/v2/switch";
import { create } from "@bufbuild/protobuf";
import { FC, useState } from "react";
import { ArrowDown, ArrowUp, PlusLg, Trash } from "react-bootstrap-icons";
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

    const moveTransport = (index: number, direction: 'up' | 'down') => {
        const newTransports = [...inbound.transport];
        if (direction === 'up') {
            if (index === 0) return;
            [newTransports[index - 1], newTransports[index]] = [newTransports[index], newTransports[index - 1]];
        } else {
            if (index === newTransports.length - 1) return;
            [newTransports[index], newTransports[index + 1]] = [newTransports[index + 1], newTransports[index]];
        }
        onChange({ ...inbound, transport: newTransports });
    };

    const deleteTransport = (index: number) => {
        const newTransports = [...inbound.transport];
        newTransports.splice(index, 1);
        onChange({ ...inbound, transport: newTransports });
    };

    const addTransport = () => {
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
                break
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
    };

    return <>
        <div className="mb-3">
            <SwitchCard
                label="Enabled"
                checked={inbound.enabled}
                onCheckedChange={(c) => { onChange({ ...inbound, enabled: c }) }}
                className="p-3 rounded-3 bg-body-tertiary"
            />
        </div>

        {/* Network Section */}
        <Card className="mb-3">
            <CardHeader><span className="fw-bold">Network</span></CardHeader>
            <CardBody>
                <Network inbound={inbound} onChange={(x) => { onChange({ ...x }) }} />
            </CardBody>
        </Card>

        {/* Transport Section */}
        <Card className="mb-3">
            <CardHeader><span className="fw-bold">Transport</span></CardHeader>
            <CardBody>
                <Accordion type="multiple" className="mb-3">
                    {inbound.transport.map((x, i) => (
                        <AccordionItem value={`item-${i}`} key={i}>
                            <AccordionTrigger className="fw-bold">
                                {x.transport.case?.toString() ?? "Unknown"}
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="p-1">
                                    <Transport transport={x} onChange={(newTransport) => {
                                        const newTransports = [...inbound.transport];
                                        newTransports[i] = newTransport;
                                        onChange({ ...inbound, transport: newTransports });
                                    }} />

                                    <div className="d-flex justify-content-end gap-2 mt-3 pt-3 border-top">
                                        <Button variant="outline-primary" size="sm" onClick={() => moveTransport(i, 'up')} disabled={i === 0}>
                                            <ArrowUp />
                                        </Button>
                                        <Button variant="outline-primary" size="sm" onClick={() => moveTransport(i, 'down')} disabled={i === inbound.transport.length - 1}>
                                            <ArrowDown />
                                        </Button>
                                        <Button variant="outline-danger" size="sm" onClick={() => deleteTransport(i)}>
                                            <Trash className="me-1" /> Delete
                                        </Button>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>

                <div className="d-flex align-items-center mb-0">
                    <SettingLabel className="mb-0 text-nowrap me-3" style={{ minWidth: "auto" }}>Type</SettingLabel>
                    <div className="flex-grow-1 me-2">
                        <Select
                            value={newProtocol.value}
                            onValueChange={(e) => setNewProtocol({ value: e })}
                            items={[
                                "normal", "tls", "mux",
                                "http2", "websocket", "grpc",
                                "reality", "tlsAuto", "httpMock",
                                "aead", "proxy"
                            ].map(v => ({ value: v, label: v }))}
                        />
                    </div>
                    <Button variant="outline-primary" onClick={addTransport}>
                        <PlusLg className="me-1" /> Add
                    </Button>
                </div>
            </CardBody>
        </Card>

        {/* Protocol Section */}
        <Card>
            <CardHeader><span className="fw-bold">Protocol</span></CardHeader>
            <CardBody>
                <Protocol inbound={inbound} onChange={(x) => { onChange({ ...x }) }} />
            </CardBody>
        </Card>
    </>
}
