"use client"

import { createInbound, deleteInbound, getInbound, getInboundConfig, listInbounds, saveInbound, saveInboundConfig } from "@/api/inbounds";
import { APIError } from "@/api/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/component/v2/accordion";
import { Badge } from "@/component/v2/badge";
import { Button } from "@/component/v2/button";
import { Card, CardBody, CardHeader, CardRowList, ErrorMsg, IconBox, MainContainer, SettingLabel, SettingsBox } from "@/component/v2/card";
import { Select, SettingInputVertical, SettingSelectVertical, SwitchCard } from "@/component/v2/forms";
import { Textarea } from "@/component/v2/input";
import { InputBytesList, InputList } from "@/component/v2/listeditor";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal";
import { Spinner } from "@/component/v2/spinner";
import {
    createDefaultInbound,
    createDefaultNetwork,
    createDefaultProtocol,
    createDefaultTransport,
    Certificate,
    ClientTLSConfig,
    InboundConfig,
    inboundListen,
    Inbound,
    InboundNetwork,
    InboundProtocol,
    InboundTransport,
    normalizeInbound,
    normalizeInboundConfig,
    ServerTLSConfig,
    TLSAutoTransport,
} from "@/contract/inbound";
import { ArrowDown, ArrowUp, Check, ChevronRight, DoorOpen, LogIn, Plus, Save, Settings, Trash } from "lucide-react";
import { FC, useContext, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import Loading, { Error as ErrorDisplay } from "../../component/v2/loading";
import { GlobalToastContext } from "../../component/v2/toast";

const PAGE_SIZE = 8;

function errorOf(error: unknown): APIError | undefined {
    if (!error) return undefined;
    if (typeof error === "object" && "code" in error && "msg" in error) return error as APIError;
    return { code: 500, msg: error instanceof Error ? error.message : String(error) };
}

function errorRaw(raw: unknown): string | undefined {
    if (raw === undefined || raw === null) return undefined;
    if (typeof raw === "string") return raw;
    try {
        return JSON.stringify(raw);
    } catch {
        return String(raw);
    }
}

const networkTypes: InboundNetwork["type"][] = ["empty", "tcp_udp", "quic"];
const protocolTypes: InboundProtocol["type"][] = ["http", "socks5", "yuubinsya", "mixed", "socks4a", "tproxy", "redir", "tun", "reverse_http", "reverse_tcp", "none"];
const transportTypes: InboundTransport["type"][] = ["normal", "tls", "mux", "http2", "websocket", "reality", "tls_auto", "http_mock", "aead", "proxy"];

function numberValue(value: string): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function base64ToBytes(value: string | undefined): Uint8Array {
    if (!value) return new Uint8Array(0);
    try {
        return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
    } catch {
        return new TextEncoder().encode(value);
    }
}

function bytesToBase64(value: Uint8Array): string {
    let binary = "";
    value.forEach((byte) => { binary += String.fromCharCode(byte); });
    return btoa(binary);
}

function transportLabel(value: Inbound): string {
    return value.transports.map((transport) => transport.type).join(" / ");
}

function newInboundID(): string {
    return globalThis.crypto?.randomUUID?.() ?? `inbound-${Date.now()}`;
}

const InboundEditor: FC<{
    inbound: Inbound;
    onChange: (value: Inbound) => void;
}> = ({ inbound, onChange }) => {
    return (
        <div className="space-y-4">
            <SwitchCard
                label="Enabled"
                checked={inbound.enabled}
                onCheckedChange={(enabled) => onChange(normalizeInbound({ ...inbound, enabled }))}
                className="p-4 rounded-lg bg-ui-surface-muted"
            />
            <SettingInputVertical
                label="Name"
                value={inbound.name}
                onChange={(name) => onChange(normalizeInbound({ ...inbound, name }))}
            />

            <Card density="compact">
                <CardHeader><span className="font-bold">Network</span></CardHeader>
                <CardBody density="compact">
                    <NetworkSection inbound={inbound} onChange={onChange} />
                </CardBody>
            </Card>

            <Card density="compact">
                <CardHeader><span className="font-bold">Transport</span></CardHeader>
                <CardBody density="compact">
                    <TransportSection inbound={inbound} onChange={onChange} />
                </CardBody>
            </Card>

            <Card density="compact">
                <CardHeader><span className="font-bold">Protocol</span></CardHeader>
                <CardBody density="compact">
                    <ProtocolSection inbound={inbound} onChange={onChange} />
                </CardBody>
            </Card>
        </div>
    );
};

const TypeUseRow: FC<{
    label: string;
    value: string;
    values: string[];
    onValueChange: (value: string) => void;
    onUse: () => void;
    useLabel?: string;
}> = ({ label, value, values, onValueChange, onUse, useLabel = "Use" }) => (
    <div className="mb-4 flex items-center">
        <SettingLabel className="mb-0 mr-4 whitespace-nowrap" style={{ minWidth: "auto" }}>{label}</SettingLabel>
        <div className="mr-2 grow">
            <Select value={value} onValueChange={onValueChange} items={values.map((item) => ({ value: item, label: item }))} />
        </div>
        <Button onClick={onUse}>{useLabel}</Button>
    </div>
);

const NetworkSection: FC<{
    inbound: Inbound;
    onChange: (value: Inbound) => void;
}> = ({ inbound, onChange }) => {
    const [choice, setChoice] = useState<InboundNetwork["type"] | undefined>();
    const selected = choice ?? inbound.network.type;

    return (
        <>
            <TypeUseRow
                label="Network Type"
                value={selected}
                values={networkTypes}
                onValueChange={(value) => setChoice(value as InboundNetwork["type"])}
                onUse={() => {
                    onChange(normalizeInbound({ ...inbound, network: createDefaultNetwork(selected) }));
                    setChoice(undefined);
                }}
            />
            <NetworkEditor
                value={inbound.network}
                onChange={(network) => onChange(normalizeInbound({ ...inbound, network }))}
            />
        </>
    );
};

const ProtocolSection: FC<{
    inbound: Inbound;
    onChange: (value: Inbound) => void;
}> = ({ inbound, onChange }) => {
    const [choice, setChoice] = useState<InboundProtocol["type"] | undefined>();
    const selected = choice ?? inbound.protocol.type;

    return (
        <>
            <TypeUseRow
                label="Protocol"
                value={selected}
                values={protocolTypes}
                onValueChange={(value) => setChoice(value as InboundProtocol["type"])}
                onUse={() => {
                    onChange(normalizeInbound({ ...inbound, protocol: createDefaultProtocol(selected) }));
                    setChoice(undefined);
                }}
            />
            <ProtocolConfigEditor
                value={inbound.protocol}
                onChange={(protocol) => onChange(normalizeInbound({ ...inbound, protocol }))}
            />
        </>
    );
};

const NetworkEditor: FC<{
    value: InboundNetwork;
    onChange: (value: InboundNetwork) => void;
}> = ({ value, onChange }) => {
    switch (value.type) {
        case "empty":
            return <div className="rounded-ui-lg border border-dashed border-ui-border p-4 text-sm text-ui-muted">This inbound does not bind a network listener.</div>;
        case "tcp_udp":
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SettingInputVertical
                        label="Listen Host"
                        value={value.tcp_udp.host}
                        onChange={(host) => onChange({ ...value, tcp_udp: { ...value.tcp_udp, host } })}
                        placeholder=":9002"
                    />
                    <SettingSelectVertical
                        label="UDP"
                        value={value.tcp_udp.udp}
                        values={["enabled", "disabled", "tcp_only", "udp_only"]}
                        onChange={(udp) => onChange({ ...value, tcp_udp: { ...value.tcp_udp, udp: udp as typeof value.tcp_udp.udp } })}
                    />
                </div>
            );
        case "quic":
            return (
                <div className="grid gap-4">
                    <SettingInputVertical
                        label="Listen Host"
                        value={value.quic.host}
                        onChange={(host) => onChange({ ...value, quic: { ...value.quic, host } })}
                        placeholder=":9002"
                    />
                    <ServerTLSConfigEditor value={value.quic.tls} onChange={(tls) => onChange({ ...value, quic: { ...value.quic, tls } })} />
                </div>
            );
    }
};

const ProtocolConfigEditor: FC<{
    value: InboundProtocol;
    onChange: (value: InboundProtocol) => void;
}> = ({ value, onChange }) => {
    switch (value.type) {
        case "http":
            return (
                <AuthFields
                    username={value.http.username}
                    password={value.http.password}
                    onChange={(patch) => onChange({ ...value, http: { ...value.http, ...patch } })}
                />
            );
        case "mixed":
            return (
                <AuthFields
                    username={value.mixed.username}
                    password={value.mixed.password}
                    onChange={(patch) => onChange({ ...value, mixed: { ...value.mixed, ...patch } })}
                />
            );
        case "socks5":
            return (
                <div className="grid gap-4">
                    <AuthFields
                        username={value.socks5.username}
                        password={value.socks5.password}
                        onChange={(patch) => onChange({ ...value, socks5: { ...value.socks5, ...patch } })}
                    />
                    <SwitchCard label="UDP" checked={value.socks5.udp} onCheckedChange={(udp) => onChange({ ...value, socks5: { ...value.socks5, udp } })} />
                </div>
            );
        case "yuubinsya":
            return (
                <div className="grid gap-4">
                    <SettingInputVertical label="Password" value={value.yuubinsya.password} onChange={(password) => onChange({ ...value, yuubinsya: { ...value.yuubinsya, password } })} />
                    <SwitchCard label="UDP Coalesce" checked={value.yuubinsya.udpCoalesce} onCheckedChange={(udpCoalesce) => onChange({ ...value, yuubinsya: { ...value.yuubinsya, udpCoalesce } })} />
                </div>
            );
        case "socks4a":
            return <SettingInputVertical label="Username" value={value.socks4a.username} onChange={(username) => onChange({ ...value, socks4a: { ...value.socks4a, username } })} />;
        case "tproxy":
            return (
                <div className="grid gap-4">
                    <SettingInputVertical label="Host" value={value.tproxy.host} onChange={(host) => onChange({ ...value, tproxy: { ...value.tproxy, host } })} placeholder=":12345" />
                    <SwitchCard label="DNS Hijacking" checked={value.tproxy.dnsHijacking} onCheckedChange={(dnsHijacking) => onChange({ ...value, tproxy: { ...value.tproxy, dnsHijacking } })} />
                    <SwitchCard label="Force FakeIP" checked={value.tproxy.forceFakeIp} onCheckedChange={(forceFakeIp) => onChange({ ...value, tproxy: { ...value.tproxy, forceFakeIp } })} />
                </div>
            );
        case "redir":
            return <SettingInputVertical label="Host" value={value.redir.host} onChange={(host) => onChange({ ...value, redir: { ...value.redir, host } })} placeholder=":12345" />;
        case "tun":
            return <TunEditor value={value.tun} onChange={(tun) => onChange({ ...value, tun })} />;
        case "reverse_http":
            return (
                <div className="grid gap-4">
                    <SettingInputVertical label="URL" value={value.reverse_http.url} onChange={(url) => onChange({ ...value, reverse_http: { ...value.reverse_http, url } })} placeholder="http://127.0.0.1:3000" />
                    <ClientTLSConfigEditor value={value.reverse_http.tls} onChange={(tls) => onChange({ ...value, reverse_http: { ...value.reverse_http, tls } })} />
                </div>
            );
        case "reverse_tcp":
            return <SettingInputVertical label="Target" value={value.reverse_tcp.target} onChange={(target) => onChange({ ...value, reverse_tcp: { ...value.reverse_tcp, target } })} placeholder="127.0.0.1:9000" />;
        case "none":
            return <div className="rounded-ui-lg border border-dashed border-ui-border p-4 text-sm text-ui-muted">No protocol configuration.</div>;
    }
};

const AuthFields: FC<{
    username: string;
    password: string;
    onChange: (patch: { username?: string; password?: string }) => void;
}> = ({ username, password, onChange }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingInputVertical label="Username" value={username} onChange={(next) => onChange({ username: next })} />
        <SettingInputVertical label="Password" value={password} onChange={(next) => onChange({ password: next })} />
    </div>
);

const TunEditor: FC<{
    value: Extract<InboundProtocol, { type: "tun" }>["tun"];
    onChange: (value: Extract<InboundProtocol, { type: "tun" }>["tun"]) => void;
}> = ({ value, onChange }) => {
    const patch = (patchValue: Partial<typeof value>) => onChange({ ...value, ...patchValue });
    return (
        <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingInputVertical label="Name" value={value.name} onChange={(name) => patch({ name })} />
                <SettingInputVertical label="MTU" type="number" value={String(value.mtu)} onChange={(mtu) => patch({ mtu: numberValue(mtu) })} />
                <SettingInputVertical label="Driver" value={value.driver} onChange={(driver) => patch({ driver })} />
                <SettingInputVertical label="Portal IPv4" value={value.portal} onChange={(portal) => patch({ portal })} />
                <SettingInputVertical label="Portal IPv6" value={value.portalV6} onChange={(portalV6) => patch({ portalV6 })} />
            </div>
            <SwitchCard label="Force FakeIP" checked={value.forceFakeIp} onCheckedChange={(forceFakeIp) => patch({ forceFakeIp })} />
            <SwitchCard label="Skip Multicast" checked={value.skipMulticast} onCheckedChange={(skipMulticast) => patch({ skipMulticast })} />
            <InputList title="Routes" data={value.routes} onChange={(routes) => patch({ routes })} textarea />
            <InputList title="Excludes" data={value.excludes} onChange={(excludes) => patch({ excludes })} textarea />
            <InputList title="Post Up" data={value.postUp} onChange={(postUp) => patch({ postUp })} textarea />
            <InputList title="Post Down" data={value.postDown} onChange={(postDown) => patch({ postDown })} textarea />
        </div>
    );
};

function defaultCertificate(): Certificate {
    return { certBase64: "", keyBase64: "", certFile: "", keyFile: "" };
}

function defaultClientTLS(): ClientTLSConfig {
    return {
        enabled: false,
        serverNames: [],
        caCertsBase64: [],
        insecureSkipVerify: false,
        nextProtos: [],
        echConfigBase64: "",
    };
}

function defaultServerTLS(): ServerTLSConfig {
    return { certificates: [], nextProtos: [], serverNameCertificate: {} };
}

const CertificateEditor: FC<{
    title: string;
    value: Certificate;
    onChange: (value: Certificate) => void;
    onRemove?: () => void;
}> = ({ title, value, onChange, onRemove }) => {
    const patch = (patchValue: Partial<Certificate>) => onChange({ ...value, ...patchValue });
    return (
        <div className="rounded-ui-lg border border-ui-border bg-ui-surface-muted p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div className="font-semibold">{title}</div>
                {onRemove && <Button size="icon" variant="outline-danger" onClick={onRemove} aria-label="Remove certificate"><Trash size={16} /></Button>}
            </div>
            <div className="grid gap-4">
                <BytesTextarea
                    label="Certificate (PEM)"
                    valueBase64={value.certBase64}
                    onChangeBase64={(certBase64) => patch({ certBase64 })}
                />
                <BytesTextarea
                    label="Private Key (PEM)"
                    valueBase64={value.keyBase64}
                    onChangeBase64={(keyBase64) => patch({ keyBase64 })}
                />
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingInputVertical label="Cert File" value={value.certFile} onChange={(certFile) => patch({ certFile })} />
                <SettingInputVertical label="Key File" value={value.keyFile} onChange={(keyFile) => patch({ keyFile })} />
            </div>
        </div>
    );
};

const BytesTextarea: FC<{
    label: string;
    valueBase64: string | undefined;
    onChangeBase64: (value: string) => void;
    rows?: number;
    readOnly?: boolean;
}> = ({ label, valueBase64, onChangeBase64, rows = 4, readOnly }) => {
    const text = new TextDecoder().decode(base64ToBytes(valueBase64));
    return (
        <div>
            <SettingLabel className="mb-2 block">{label}</SettingLabel>
            <Textarea
                value={text}
                readOnly={readOnly}
                onChange={(event) => onChangeBase64(bytesToBase64(new TextEncoder().encode(event.target.value)))}
                rows={rows}
                className="font-mono text-sm"
            />
        </div>
    );
};

const CertificateListEditor: FC<{
    value: Certificate[];
    onChange: (value: Certificate[]) => void;
}> = ({ value, onChange }) => {
    const items = Array.isArray(value) ? value : [];
    return (
        <div className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
                <SettingLabel className="mb-0">Certificates</SettingLabel>
                <Button size="sm" onClick={() => onChange([...items, defaultCertificate()])}><Plus size={16} className="mr-1" />Add</Button>
            </div>
            {items.length === 0 ? (
                <div className="rounded-ui-lg border border-dashed border-ui-border p-4 text-sm text-ui-muted">No certificate entries.</div>
            ) : items.map((item, index) => (
                <CertificateEditor
                    key={index}
                    title={`Certificate #${index + 1}`}
                    value={item}
                    onChange={(next) => onChange(items.map((current, currentIndex) => currentIndex === index ? next : current))}
                    onRemove={() => onChange(items.filter((_, currentIndex) => currentIndex !== index))}
                />
            ))}
        </div>
    );
};

const NamedCertificateEditor: FC<{
    value?: Record<string, Certificate>;
    onChange: (value?: Record<string, Certificate>) => void;
}> = ({ value, onChange }) => {
    const entries = Object.entries(value ?? {});
    const update = (index: number, name: string, cert: Certificate) => {
        const nextEntries = [...entries];
        nextEntries[index] = [name, cert];
        const next = Object.fromEntries(nextEntries.filter(([key]) => key.trim() !== ""));
        onChange(Object.keys(next).length === 0 ? undefined : next);
    };
    return (
        <div className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
                <SettingLabel className="mb-0">Server Name Certificates</SettingLabel>
                <Button size="sm" onClick={() => onChange({ ...(value ?? {}), "": defaultCertificate() })}><Plus size={16} className="mr-1" />Add</Button>
            </div>
            {entries.length === 0 ? (
                <div className="rounded-ui-lg border border-dashed border-ui-border p-4 text-sm text-ui-muted">No server-name specific certificates.</div>
            ) : entries.map(([name, cert], index) => (
                <div key={`${name}-${index}`} className="rounded-ui-lg border border-ui-border bg-ui-surface-muted p-3">
                    <div className="mb-3 flex items-end gap-3">
                        <div className="grow">
                            <SettingInputVertical label="Server Name" value={name} onChange={(nextName) => update(index, nextName, cert)} className="!mb-0" />
                        </div>
                        <Button size="icon" variant="outline-danger" onClick={() => {
                            const next = Object.fromEntries(entries.filter((_, currentIndex) => currentIndex !== index));
                            onChange(Object.keys(next).length === 0 ? undefined : next);
                        }} aria-label="Remove named certificate"><Trash size={16} /></Button>
                    </div>
                    <CertificateEditor title="Certificate" value={cert} onChange={(nextCert) => update(index, name, nextCert)} />
                </div>
            ))}
        </div>
    );
};

const ServerTLSConfigEditor: FC<{
    value?: ServerTLSConfig;
    onChange: (value: ServerTLSConfig) => void;
}> = ({ value, onChange }) => {
    const current = value ?? defaultServerTLS();
    const patch = (patchValue: Partial<ServerTLSConfig>) => onChange({ ...current, ...patchValue });
    return (
        <div className="grid gap-4">
            <InputList title="Next Protos" data={current.nextProtos ?? []} onChange={(nextProtos) => patch({ nextProtos })} />
            <CertificateListEditor value={current.certificates ?? []} onChange={(certificates) => patch({ certificates })} />
            <NamedCertificateEditor value={current.serverNameCertificate} onChange={(serverNameCertificate) => patch({ serverNameCertificate })} />
        </div>
    );
};

const ClientTLSConfigEditor: FC<{
    value?: ClientTLSConfig;
    onChange: (value: ClientTLSConfig) => void;
}> = ({ value, onChange }) => {
    const current = value ?? defaultClientTLS();
    const patch = (patchValue: Partial<ClientTLSConfig>) => onChange({ ...current, ...patchValue });
    return (
        <div className="grid gap-4">
            <SwitchCard label="TLS Enabled" checked={current.enabled} onCheckedChange={(enabled) => patch({ enabled })} />
            <SwitchCard label="Skip Certificate Verify" checked={current.insecureSkipVerify} onCheckedChange={(insecureSkipVerify) => patch({ insecureSkipVerify })} />
            <InputList title="Server Names" data={current.serverNames ?? []} onChange={(serverNames) => patch({ serverNames })} />
            <InputList title="Next Protos" data={current.nextProtos ?? []} onChange={(nextProtos) => patch({ nextProtos })} />
            <InputBytesList
                title="CA Certificate"
                data={(current.caCertsBase64 ?? []).map(base64ToBytes)}
                onChange={(caCerts) => patch({ caCertsBase64: caCerts.map(bytesToBase64) })}
            />
            <BytesTextarea
                label="ECH Config List"
                valueBase64={current.echConfigBase64 ?? ""}
                onChangeBase64={(echConfigBase64) => patch({ echConfigBase64 })}
            />
        </div>
    );
};

const ECHConfigEditor: FC<{
    value?: TLSAutoTransport["ech"];
    onChange: (value?: TLSAutoTransport["ech"]) => void;
}> = ({ value, onChange }) => {
    const current = value ?? { enabled: false, configBase64: "", privateKeyBase64: "", outerSni: "" };
    const patch = (patchValue: Partial<NonNullable<TLSAutoTransport["ech"]>>) => onChange({ ...current, ...patchValue });
    return (
        <div className="grid gap-4">
            <SwitchCard label="ECH Enabled" checked={current.enabled} onCheckedChange={(enabled) => patch({ enabled })} />
            {current.enabled && (
                <SettingInputVertical label="ECH Outer SNI" value={current.outerSni} onChange={(outerSni) => patch({ outerSni })} />
            )}
            <SettingInputVertical label="ECH Config" value={current.configBase64} readOnly onChange={() => { }} />
            <SettingInputVertical label="ECH Key" value={current.privateKeyBase64} readOnly onChange={() => { }} />
        </div>
    );
};

const TransportEditor: FC<{
    value: InboundTransport;
    onChange: (value: InboundTransport) => void;
}> = ({ value, onChange }) => (
    <div className="p-1">
        <TransportConfigEditor value={value} onChange={onChange} />
    </div>
);

const TransportSection: FC<{
    inbound: Inbound;
    onChange: (value: Inbound) => void;
}> = ({ inbound, onChange }) => {
    const [newTransport, setNewTransport] = useState<InboundTransport["type"]>("normal");
    const transports = Array.isArray(inbound.transports) ? inbound.transports : [];

    const changeTransport = (index: number, value: InboundTransport) => {
        const next = [...transports];
        next[index] = value;
        onChange(normalizeInbound({ ...inbound, transports: next }));
    };

    const moveTransport = (index: number, direction: -1 | 1) => {
        const nextIndex = index + direction;
        if (nextIndex < 0 || nextIndex >= transports.length) return;
        const next = [...transports];
        [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
        onChange(normalizeInbound({ ...inbound, transports: next }));
    };

    const removeTransport = (index: number) => {
        onChange(normalizeInbound({ ...inbound, transports: transports.filter((_, current) => current !== index) }));
    };

    return (
        <>
            {transports.length === 0 ? (
                <div className="mb-4 rounded-ui-lg border border-dashed border-ui-border p-4 text-center text-sm text-ui-muted">No transports.</div>
            ) : (
                <Accordion type="multiple" defaultValue={["transport-0"]} className="mb-4">
                    {transports.map((transport, index) => (
                        <AccordionItem value={`transport-${index}`} key={`${index}-${transport.type}`}>
                            <AccordionTrigger>
                                <span className="flex min-w-0 items-center gap-3">
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ui-primary-soft text-sm font-bold text-ui-primary">
                                        {index + 1}
                                    </span>
                                    <span className="truncate font-bold">{transport.type}</span>
                                </span>
                            </AccordionTrigger>
                            <AccordionContent>
                                <TransportEditor
                                    value={transport}
                                    onChange={(value) => changeTransport(index, value)}
                                />
                                <div className="mt-4 flex justify-end gap-2 border-t border-ui-border pt-4">
                                    <Button size="sm" onClick={() => moveTransport(index, -1)} disabled={index === 0}>
                                        <ArrowUp size={16} />
                                    </Button>
                                    <Button size="sm" onClick={() => moveTransport(index, 1)} disabled={index === transports.length - 1}>
                                        <ArrowDown size={16} />
                                    </Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => removeTransport(index)}>
                                        <Trash className="mr-1" size={16} /> Delete
                                    </Button>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}

            <TypeUseRow
                label="Type"
                value={newTransport}
                values={transportTypes}
                onValueChange={(value) => setNewTransport(value as InboundTransport["type"])}
                onUse={() => onChange(normalizeInbound({ ...inbound, transports: [...transports, createDefaultTransport(newTransport)] }))}
                useLabel="Add"
            />
        </>
    );
};

const TransportConfigEditor: FC<{
    value: InboundTransport;
    onChange: (value: InboundTransport) => void;
}> = ({ value, onChange }) => {
    switch (value.type) {
        case "normal":
        case "mux":
        case "http2":
        case "websocket":
        case "proxy":
            return <div className="rounded-ui-lg border border-dashed border-ui-border p-4 text-sm text-ui-muted">No extra transport configuration.</div>;
        case "tls":
            return (
                <ServerTLSConfigEditor value={value.tls.tls} onChange={(tls) => onChange({ ...value, tls: { tls } })} />
            );
        case "reality":
            return (
                <div className="grid gap-4">
                    <InputList title="Short IDs" data={value.reality.shortIds} onChange={(shortIds) => onChange({ ...value, reality: { ...value.reality, shortIds } })} />
                    <InputList title="Server Names" data={value.reality.serverNames} onChange={(serverNames) => onChange({ ...value, reality: { ...value.reality, serverNames } })} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SettingInputVertical label="Destination" value={value.reality.dest} onChange={(dest) => onChange({ ...value, reality: { ...value.reality, dest } })} />
                        <SettingInputVertical label="Private Key" value={value.reality.privateKey} onChange={(privateKey) => onChange({ ...value, reality: { ...value.reality, privateKey } })} />
                        <SettingInputVertical label="Public Key" value={value.reality.publicKey} onChange={(publicKey) => onChange({ ...value, reality: { ...value.reality, publicKey } })} />
                        <SettingInputVertical label="MLDSA65 Seed" value={value.reality.mldsa65Seed} onChange={(mldsa65Seed) => onChange({ ...value, reality: { ...value.reality, mldsa65Seed } })} />
                    </div>
                    <SwitchCard label="Debug" checked={value.reality.debug} onCheckedChange={(debug) => onChange({ ...value, reality: { ...value.reality, debug } })} />
                </div>
            );
        case "tls_auto":
            return (
                <div className="grid gap-4">
                    <InputList title="Next Protos" data={value.tls_auto.nextProtos} onChange={(nextProtos) => onChange({ ...value, tls_auto: { ...value.tls_auto, nextProtos } })} />
                    <InputList title="Server Names" data={value.tls_auto.serverNames} onChange={(serverNames) => onChange({ ...value, tls_auto: { ...value.tls_auto, serverNames } })} />
                    <ECHConfigEditor value={value.tls_auto.ech} onChange={(ech) => onChange({ ...value, tls_auto: { ...value.tls_auto, ech } })} />
                    <BytesTextarea
                        label="CA Cert"
                        valueBase64={value.tls_auto.caCertBase64}
                        onChangeBase64={(caCertBase64) => onChange({ ...value, tls_auto: { ...value.tls_auto, caCertBase64 } })}
                        readOnly
                    />
                    <BytesTextarea
                        label="CA Key"
                        valueBase64={value.tls_auto.caKeyBase64}
                        onChangeBase64={(caKeyBase64) => onChange({ ...value, tls_auto: { ...value.tls_auto, caKeyBase64 } })}
                        readOnly
                    />
                </div>
            );
        case "http_mock":
            return <Textarea className="min-h-[120px] font-mono text-sm" value={value.http_mock.dataBase64} onChange={(event) => onChange({ ...value, http_mock: { dataBase64: event.target.value } })} placeholder="Base64 mock response data" />;
        case "aead":
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SettingInputVertical label="Password" value={value.aead.password} onChange={(password) => onChange({ ...value, aead: { ...value.aead, password } })} />
                    <SettingInputVertical label="Crypto Method" value={value.aead.cryptoMethod} onChange={(cryptoMethod) => onChange({ ...value, aead: { ...value.aead, cryptoMethod } })} />
                </div>
            );
    }
};

const InboundModal: FC<{
    show: boolean;
    id: string;
    onHide: (save?: boolean) => void;
    onDelete: () => void;
    isNew?: boolean;
}> = ({ show, id, onHide, onDelete, isNew }) => {
    const ctx = useContext(GlobalToastContext);
    const [saving, setSaving] = useState(false);
    const [draft, setDraft] = useState<Inbound>(() => createDefaultInbound(id));
    const shouldFetch = show && id !== "" && !isNew;

    const { data, error, isLoading, mutate } = useSWR(
        shouldFetch ? `/api/v2/inbounds/${id}` : null,
        () => getInbound(id),
        { shouldRetryOnError: false, keepPreviousData: false, revalidateOnFocus: false },
    );

    useEffect(() => {
        if (!show) return;
        setDraft(createDefaultInbound(id));
    }, [show, id, isNew]);

    useEffect(() => {
        if (data) setDraft(normalizeInbound(data));
    }, [data]);

    const apiError = errorOf(error);
    const inbound = isNew ? draft : data ? draft : undefined;
    const title = isNew ? "New Inbound" : inbound?.name || id || "Inbound";

    const handleSave = () => {
        if (!inbound) return;
        setSaving(true);
        const next = normalizeInbound({ ...inbound, id, name: inbound.name || id });
        const request = isNew ? createInbound(next) : saveInbound(next);
        request
            .then((saved) => {
                ctx.Info("Save successful");
                void mutate(saved, false);
                onHide(true);
            })
            .catch((err: unknown) => {
                const apiErr = errorOf(err);
                ctx.Error(apiErr?.msg ?? "Save failed");
            })
            .finally(() => setSaving(false));
    };

    return (
        <Modal open={show} onOpenChange={(open) => !open && onHide()}>
            <ModalContent className="max-w-[900px]">
                <ModalHeader closeButton className="border-b-0 pb-0">
                    <ModalTitle className="flex min-w-0 items-center gap-3 font-bold">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600/10 text-ui-primary">
                            <DoorOpen size={18} />
                        </span>
                        <span className="min-w-0 truncate">{title}</span>
                        {id && <Badge variant="secondary" className="shrink-0 font-mono">{id}</Badge>}
                        {inbound && (
                            <Badge variant={inbound.enabled ? "success" : "muted"} className="shrink-0">
                                {inbound.enabled ? "Enabled" : "Disabled"}
                            </Badge>
                        )}
                    </ModalTitle>
                </ModalHeader>
                <ModalBody className="pt-2">
                    {apiError ? <ErrorMsg msg={apiError.msg} code={String(apiError.code)} raw={errorRaw(apiError.raw)} /> : isLoading || !inbound ? (
                        <Loading />
                    ) : (
                        <SettingsBox>
                            <InboundEditor inbound={inbound} onChange={(next) => {
                                setDraft(next);
                                if (!isNew) void mutate(next, false);
                            }} />
                        </SettingsBox>
                    )}
                </ModalBody>
                <ModalFooter className="flex justify-between">
                    <div>
                        {!isNew && (
                            <Button variant="outline-danger" onClick={onDelete}>
                                <Trash className="mr-2" size={16} />Delete
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => onHide()}>Cancel</Button>
                        <Button disabled={saving || !inbound} onClick={handleSave}>
                            {saving ? <Spinner size="sm" /> : <><Check className="mr-1" size={16} /> Save</>}
                        </Button>
                    </div>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

const InboundItem: FC<{ item: Inbound }> = ({ item }) => {
    return (
        <>
            <div className="grid min-w-0 flex-1 gap-3 md:grid-cols-[minmax(180px,0.38fr)_minmax(0,1fr)] md:items-center">
                <div className="flex min-w-0 items-center">
                    <div className="mr-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600/10 text-ui-primary">
                        <LogIn size={20} />
                    </div>
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="truncate font-medium">{item.name || item.id}</span>
                        <Badge variant={item.enabled ? "success" : "muted"} className="shrink-0">
                            {item.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                    </div>
                </div>
                <div className="grid min-w-0 gap-2 text-xs text-ui-muted sm:grid-cols-2 lg:grid-cols-4">
                    <div className="min-w-0">
                        <span className="mr-1 text-ui-muted/70">Protocol</span>
                        <span className="font-medium text-ui-fg">{item.protocol.type}</span>
                    </div>
                    <div className="min-w-0">
                        <span className="mr-1 text-ui-muted/70">Network</span>
                        <span className="font-medium text-ui-fg">{item.network.type}</span>
                    </div>
                    <div className="min-w-0">
                        <span className="mr-1 text-ui-muted/70">Listen</span>
                        <span className="truncate font-mono font-medium text-ui-fg">{inboundListen(item) || "-"}</span>
                    </div>
                    <div className="min-w-0">
                        <span className="mr-1 text-ui-muted/70">Transport</span>
                        <span className="truncate font-mono font-medium text-ui-fg">{transportLabel(item) || "-"}</span>
                    </div>
                </div>
            </div>
            <ChevronRight className="text-ui-muted opacity-25" size={16} />
        </>
    );
};

const InboundConfigCard: FC = () => {
    const ctx = useContext(GlobalToastContext);
    const [saving, setSaving] = useState(false);
    const [draft, setDraft] = useState<InboundConfig>(() => normalizeInboundConfig());
    const { data, error, isLoading, mutate } = useSWR(
        "/api/v2/inbounds/config",
        getInboundConfig,
        { revalidateOnFocus: false },
    );
    const apiError = errorOf(error);

    useEffect(() => {
        if (data) setDraft(normalizeInboundConfig(data));
    }, [data]);

    const patch = (value: Partial<InboundConfig>) => {
        setDraft((prev) => normalizeInboundConfig({ ...prev, ...value }));
    };

    const handleSave = () => {
        setSaving(true);
        saveInboundConfig(draft)
            .then((saved) => {
                ctx.Info("Apply successful");
                setDraft(saved);
                void mutate(saved, false);
            })
            .catch((err: unknown) => {
                const apiErr = errorOf(err);
                ctx.Error(apiErr?.msg ?? "Apply failed");
            })
            .finally(() => setSaving(false));
    };

    return (
        <Card className="mb-4">
            <CardHeader>
                <IconBox icon={Settings} tone="primary" title="Inbound Configuration" description="DNS interception and traffic inspection" />
                <Button disabled={saving || isLoading || Boolean(apiError)} onClick={handleSave}>
                    {saving ? <Spinner size="sm" /> : <><Save className="mr-1" size={16} /> Apply Settings</>}
                </Button>
            </CardHeader>
            <CardBody>
                {apiError ? (
                    <ErrorMsg msg={apiError.msg} code={String(apiError.code)} raw={errorRaw(apiError.raw)} />
                ) : (
                    <div className="grid gap-3 md:grid-cols-3">
                        <SwitchCard
                            label="DNS Hijack"
                            description="Intercept DNS requests from inbound traffic."
                            checked={draft.hijackDns}
                            onCheckedChange={(hijackDns) => patch({ hijackDns })}
                            disabled={isLoading}
                        />
                        <SwitchCard
                            label="FakeDNS"
                            description="Use FakeIP responses for hijacked DNS requests."
                            checked={draft.hijackDnsFakeIp}
                            onCheckedChange={(hijackDnsFakeIp) => patch({ hijackDnsFakeIp })}
                            disabled={isLoading}
                        />
                        <SwitchCard
                            label="Traffic Sniffing"
                            description="Infer destination metadata from accepted connections."
                            checked={draft.sniff}
                            onCheckedChange={(sniff) => patch({ sniff })}
                            disabled={isLoading}
                        />
                    </div>
                )}
            </CardBody>
        </Card>
    );
};

export default function InboudComponent() {
    const ctx = useContext(GlobalToastContext);
    const [page, setPage] = useState(1);
    const [showdata, setShowdata] = useState({ show: false, id: "", new: false });
    const { data, error, isLoading, mutate } = useSWR(
        `/api/v2/inbounds?page=${page}&pageSize=${PAGE_SIZE}`,
        () => listInbounds({ page, pageSize: PAGE_SIZE }),
        { keepPreviousData: true },
    );

    const apiError = errorOf(error);
    const items = useMemo(() => data?.items ?? [], [data?.items]);

    if (apiError) return <ErrorDisplay statusCode={apiError.code} title={apiError.msg} />;
    if (isLoading || data === undefined) return <Loading />;

    const deleteCurrentInbound = () => {
        const id = showdata.id;
        deleteInbound(id)
            .then(() => {
                ctx.Info("Removed successful");
                setShowdata((prev) => ({ ...prev, show: false }));
                void mutate();
            })
            .catch((err: unknown) => {
                const apiErr = errorOf(err);
                ctx.Error(apiErr?.msg ?? "Remove failed");
            });
    };

    const handleCreate = (id: string) => {
        if (items.some((item) => item.id === id)) {
            ctx.Error(`Inbound ${id} already exists`);
            return;
        }
        setShowdata({ show: true, id, new: true });
    };

    return (
        <MainContainer>
            <InboundModal
                show={showdata.show}
                id={showdata.id}
                isNew={showdata.new}
                onHide={(save) => {
                    if (save) void mutate();
                    setShowdata((prev) => ({ ...prev, show: false }));
                }}
                onDelete={deleteCurrentInbound}
            />

            <InboundConfigCard />

            <CardRowList
                layout="list"
                paginated
                pageSize={PAGE_SIZE}
                currentPage={data.page.page || page}
                totalItems={data.page.total}
                onPageChange={setPage}
                items={items}
                getKey={(item) => item.id}
                renderListItem={(item) => <InboundItem item={item} />}
                onClickItem={(item) => setShowdata({ show: true, id: item.id, new: false })}
                header={
                    <div className="flex w-full items-center justify-between gap-3">
                        <IconBox icon={DoorOpen} tone="primary" title="Entry Points" description={`${data.page.total} inbounds`} />
                        <Button size="sm" onClick={() => handleCreate(newInboundID())}>
                            <Plus className="mr-1" size={16} /> Add
                        </Button>
                    </div>
                }
            />
        </MainContainer>
    );
}
