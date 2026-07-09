"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/component/v2/accordion";
import { Button } from "@/component/v2/button";
import { Card, CardBody, CardHeader, SettingLabel } from "@/component/v2/card";
import { Select } from "@/component/v2/forms";
import { SwitchCard } from "@/component/v2/switch";
import { create } from "@/common/plain";
import { ArrowDown, ArrowUp, Plus, Trash } from "lucide-react";
import { FC, useState } from "react";
import {
    aeadSchema,
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
} from "../schema/config/inbound";
import { tls_server_configSchema } from "../schema/node/protocol";
import { Network } from "./network";
import { Protocol } from "./protocol";
import { Transport } from "./transport";
import { toPlainTun } from "./tun";

const oneofCases = <T extends Record<string, any>>(value: T, cases: string[], fallback: string) => {
    if (value?.case && value.value !== undefined) return value;
    for (const key of cases) {
        if (value?.[key] !== undefined && value[key] !== null) {
            return { case: key, value: value[key] };
        }
    }
    return { case: fallback, value: {} };
};

const transportCases = ["normal", "tls", "mux", "http2", "websocket", "reality", "tlsAuto", "httpMock", "aead", "proxy"];
const networkCases = ["empty", "tcpudp", "quic"];
const protocolCases = ["http", "reverseHttp", "reverseTcp", "socks5", "socks4a", "mix", "redir", "tun", "yuubinsya", "tproxy", "none"];

const normalizeTransport = (value: transport): transport => ({
    ...value,
    transport: oneofCases(value?.transport ?? value, transportCases, "normal"),
});

export const normalizeInbound = (value: inbound): inbound => ({
    ...value,
    network: oneofCases(value?.network ?? value, networkCases, "tcpudp"),
    protocol: oneofCases(value?.protocol ?? value, protocolCases, "yuubinsya"),
    transport: Array.isArray(value?.transport) ? value.transport.map(normalizeTransport) : [],
});

const plainOneof = <T extends Record<string, any>>(value: T, oneofKey: string, cases: string[]) => {
    const { [oneofKey]: oneof, ...rest } = value;
    for (const key of cases) delete rest[key];
    if (oneof?.case) rest[oneof.case] = oneof.value ?? {};
    return rest;
};

const toPlainTransport = (value: transport): transport => plainOneof(normalizeTransport(value), "transport", transportCases);

export const toPlainInbound = (value: inbound): inbound => {
    const normalized = normalizeInbound(value);
    const protocol = normalized.protocol?.case === "tun"
        ? { ...normalized.protocol, value: toPlainTun(normalized.protocol.value ?? {}) }
        : normalized.protocol;
    const withPlainProtocolValue = { ...normalized, protocol };
    const withoutNetwork = plainOneof(withPlainProtocolValue, "network", networkCases);
    const withoutProtocol = plainOneof(withoutNetwork, "protocol", protocolCases);
    return {
        ...withoutProtocol,
        transport: normalized.transport.map(toPlainTransport),
    };
};

export const Inbound: FC<{ inbound: inbound, onChange: (x: inbound) => void }> = ({ inbound, onChange }) => {
    const current = normalizeInbound(inbound);
    const [newProtocol, setNewProtocol] = useState({ value: "normal" });

    const moveTransport = (index: number, direction: 'up' | 'down') => {
        const newTransports = [...current.transport];
        if (direction === 'up') {
            if (index === 0) return;
            [newTransports[index - 1], newTransports[index]] = [newTransports[index], newTransports[index - 1]];
        } else {
            if (index === newTransports.length - 1) return;
            [newTransports[index], newTransports[index + 1]] = [newTransports[index + 1], newTransports[index]];
        }
        onChange({ ...current, transport: newTransports });
    };

    const deleteTransport = (index: number) => {
        const newTransports = [...current.transport];
        newTransports.splice(index, 1);
        onChange({ ...current, transport: newTransports });
    };

    const addTransport = () => {
        const x = { ...current, transport: [...current.transport] }
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
        <div className="mb-4">
            <SwitchCard
                label="Enabled"
                checked={current.enabled}
                onCheckedChange={(c) => { onChange({ ...current, enabled: c }) }}
                className="p-4 rounded-lg bg-gray-100 dark:bg-[#2b2b40]"
            />
        </div>

        {/* Network Section */}
        <Card className="mb-4">
            <CardHeader><span className="font-bold">Network</span></CardHeader>
            <CardBody>
                <Network inbound={current} onChange={(x) => { onChange(normalizeInbound(x)) }} />
            </CardBody>
        </Card>

        {/* Transport Section */}
        <Card className="mb-4">
            <CardHeader><span className="font-bold">Transport</span></CardHeader>
            <CardBody>
                <Accordion type="multiple" className="mb-4">
                    {current.transport.map((x, i) => (
                        <AccordionItem value={`item-${i}`} key={i}>
                            <AccordionTrigger>
                                {x.transport?.case?.toString() ?? "Unknown"}
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="p-1">
                                    <Transport transport={x} onChange={(newTransport) => {
                                        const newTransports = [...current.transport];
                                        newTransports[i] = newTransport;
                                        onChange({ ...current, transport: newTransports });
                                    }} />

                                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                                        <Button size="sm" onClick={() => moveTransport(i, 'up')} disabled={i === 0}>
                                            <ArrowUp size={16} />
                                        </Button>
                                        <Button size="sm" onClick={() => moveTransport(i, 'down')} disabled={i === current.transport.length - 1}>
                                            <ArrowDown size={16} />
                                        </Button>
                                        <Button variant="outline-danger" size="sm" onClick={() => deleteTransport(i)}>
                                            <Trash className="mr-1" size={16} /> Delete
                                        </Button>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>

                <div className="flex items-center mb-0">
                    <SettingLabel className="mb-0 whitespace-nowrap mr-4" style={{ minWidth: "auto" }}>Type</SettingLabel>
                    <div className="grow mr-2">
                        <Select
                            value={newProtocol.value}
                            onValueChange={(e) => setNewProtocol({ value: e })}
                            items={[
                                "normal", "tls", "mux",
                                "http2", "websocket",
                                "reality", "tlsAuto", "httpMock",
                                "aead", "proxy"
                            ].map(v => ({ value: v, label: v }))}
                        />
                    </div>
                    <Button onClick={addTransport}>
                        <Plus className="mr-1" size={16} /> Add
                    </Button>
                </div>
            </CardBody>
        </Card>

        {/* Protocol Section */}
        <Card>
            <CardHeader><span className="font-bold">Protocol</span></CardHeader>
            <CardBody>
                <Protocol inbound={current} onChange={(x) => { onChange(normalizeInbound(x)) }} />
            </CardBody>
        </Card>
    </>
}
