import { base64ToBytes, bytesToBase64 } from "@/common/base64";

import { useTranslation } from 'react-i18next';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/component/v2/accordion";

import { Button } from "@/component/v2/button";
import { Card, CardBody, CardHeader, SettingLabel } from "@/component/v2/card";
import { Select, SettingInputVertical, SettingSelectVertical, SwitchCard } from "@/component/v2/forms";
import { Textarea } from "@/component/v2/input";
import { InputBytesList, InputList } from "@/component/v2/listeditor";

import { createDefaultNetwork, createDefaultProtocol, createDefaultTransport, Certificate, ClientTLSConfig, Inbound, InboundNetwork, InboundProtocol, InboundTransport, normalizeInbound, ServerTLSConfig, TLSAutoTransport } from "@/contract/inbound";
import { ArrowDown, ArrowUp, Plus, Trash } from "lucide-react";
import { FC, useState } from "react";

const networkTypes: InboundNetwork["type"][] = ["empty", "tcp_udp", "quic"];

const protocolTypes: InboundProtocol["type"][] = ["http", "socks5", "yuubinsya", "mixed", "socks4a", "tproxy", "redir", "tun", "reverse_http", "reverse_tcp", "none"];

const transportTypes: InboundTransport["type"][] = ["normal", "tls", "mux", "http2", "websocket", "reality", "tls_auto", "http_mock", "aead", "proxy"];

function numberValue(value: string): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}


const InboundEditor: FC<{
    inbound: Inbound;
    onChange: (value: Inbound) => void;
}> = ({ inbound, onChange }) => {
    const { t: uiT } = useTranslation('ui');

    return (
        <div className="space-y-4">
            <SwitchCard
                label={uiT("enabled")}
                checked={inbound.enabled}
                onCheckedChange={(enabled) => onChange(normalizeInbound({ ...inbound, enabled }))}
                className="p-4 rounded-lg bg-ui-surface-muted"
            />
            <SettingInputVertical
                label={uiT("name")}
                value={inbound.name}
                onChange={(name) => onChange(normalizeInbound({ ...inbound, name }))}
            />

            <Card density="compact">
                <CardHeader><span className="font-bold">{uiT("network")}</span></CardHeader>
                <CardBody density="compact">
                    <NetworkSection inbound={inbound} onChange={onChange} />
                </CardBody>
            </Card>

            <Card density="compact">
                <CardHeader><span className="font-bold">{uiT("transport")}</span></CardHeader>
                <CardBody density="compact">
                    <TransportSection inbound={inbound} onChange={onChange} />
                </CardBody>
            </Card>

            <Card density="compact">
                <CardHeader><span className="font-bold">{uiT("protocol")}</span></CardHeader>
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
    const { t: uiT } = useTranslation('ui');

    const [choice, setChoice] = useState<InboundNetwork["type"] | undefined>();
    const selected = choice ?? inbound.network.type;

    return (
        <>
            <TypeUseRow
                label={uiT("networkType")}
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
    const { t: uiT } = useTranslation('ui');

    const [choice, setChoice] = useState<InboundProtocol["type"] | undefined>();
    const selected = choice ?? inbound.protocol.type;

    return (
        <>
            <TypeUseRow
                label={uiT("protocol")}
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
    const { t: uiT } = useTranslation('ui');

    switch (value.type) {
        case "empty":
            return <div className="rounded-ui-lg border border-dashed border-ui-border p-4 text-sm text-ui-muted">{uiT("thisInboundDoesNotBindANetworkListener")}</div>;
        case "tcp_udp":
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SettingInputVertical
                        label={uiT("listenHost")}
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
                        label={uiT("listenHost")}
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
    const { t: uiT } = useTranslation('ui');

    switch (value.type) {
        case "http":
            return <AuthFields username={value.http.username} password={value.http.password} onChange={(patch) => onChange({ ...value, http: { ...value.http, ...patch } })} />;
        case "mixed":
            return <AuthFields username={value.mixed.username} password={value.mixed.password} onChange={(patch) => onChange({ ...value, mixed: { ...value.mixed, ...patch } })} />;
        case "socks5":
            return (
                <div className="grid gap-4">
                    <AuthFields username={value.socks5.username} password={value.socks5.password} onChange={(patch) => onChange({ ...value, socks5: { ...value.socks5, ...patch } })} />
                    <SwitchCard label="UDP" checked={value.socks5.udp} onCheckedChange={(udp) => onChange({ ...value, socks5: { ...value.socks5, udp } })} />
                </div>
            );
        case "yuubinsya":
            return (
                <div className="grid gap-4">
                    <SettingInputVertical label={uiT("password")} value={value.yuubinsya.password} onChange={(password) => onChange({ ...value, yuubinsya: { ...value.yuubinsya, password } })} />
                    <SwitchCard label={uiT("udpCoalesce")} checked={value.yuubinsya.udpCoalesce} onCheckedChange={(udpCoalesce) => onChange({ ...value, yuubinsya: { ...value.yuubinsya, udpCoalesce } })} />
                </div>
            );
        case "socks4a":
            return <SettingInputVertical label={uiT("username")} value={value.socks4a.username} onChange={(username) => onChange({ ...value, socks4a: { ...value.socks4a, username } })} />;
        case "tproxy":
            return (
                <div className="grid gap-4">
                    <SettingInputVertical label={uiT("host")} value={value.tproxy.host} onChange={(host) => onChange({ ...value, tproxy: { ...value.tproxy, host } })} placeholder=":12345" />
                    <SwitchCard label={uiT("dnsHijacking")} checked={value.tproxy.dnsHijacking} onCheckedChange={(dnsHijacking) => onChange({ ...value, tproxy: { ...value.tproxy, dnsHijacking } })} />
                    <SwitchCard label={uiT("forceFakeip")} checked={value.tproxy.forceFakeIp} onCheckedChange={(forceFakeIp) => onChange({ ...value, tproxy: { ...value.tproxy, forceFakeIp } })} />
                </div>
            );
        case "redir":
            return <SettingInputVertical label={uiT("host")} value={value.redir.host} onChange={(host) => onChange({ ...value, redir: { ...value.redir, host } })} placeholder=":12345" />;
        case "tun":
            return <TunEditor value={value.tun} onChange={(tun) => onChange({ ...value, tun })} />;
        case "reverse_http":
            return (
                <div className="grid gap-4">
                    <SettingInputVertical label={uiT("url")} value={value.reverse_http.url} onChange={(url) => onChange({ ...value, reverse_http: { ...value.reverse_http, url } })} placeholder="http://127.0.0.1:3000" />
                    <ClientTLSConfigEditor value={value.reverse_http.tls} onChange={(tls) => onChange({ ...value, reverse_http: { ...value.reverse_http, tls } })} />
                </div>
            );
        case "reverse_tcp":
            return <SettingInputVertical label={uiT("target")} value={value.reverse_tcp.target} onChange={(target) => onChange({ ...value, reverse_tcp: { ...value.reverse_tcp, target } })} placeholder="127.0.0.1:9000" />;
        case "none":
            return <div className="rounded-ui-lg border border-dashed border-ui-border p-4 text-sm text-ui-muted">{uiT("noProtocolConfiguration")}</div>;
    }
};

const AuthFields: FC<{
    username: string;
    password: string;
    onChange: (patch: { username?: string; password?: string }) => void;
}> = ({ username, password, onChange }) => {
    const { t: uiT } = useTranslation('ui');
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SettingInputVertical label={uiT("username")} value={username} onChange={(username) => onChange({ username })} />
            <SettingInputVertical label={uiT("password")} value={password} onChange={(password) => onChange({ password })} />
        </div>
    );
};

const TunEditor: FC<{
    value: Extract<InboundProtocol, { type: "tun" }>["tun"];
    onChange: (value: Extract<InboundProtocol, { type: "tun" }>["tun"]) => void;
}> = ({ value, onChange }) => {
    const { t: uiT } = useTranslation('ui');

    const patch = (patchValue: Partial<typeof value>) => onChange({ ...value, ...patchValue });
    return (
        <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingInputVertical label={uiT("name")} value={value.name} onChange={(name) => patch({ name })} />
                <SettingInputVertical label="MTU" type="number" value={String(value.mtu)} onChange={(mtu) => patch({ mtu: numberValue(mtu) })} />
                <SettingInputVertical label="Driver" value={value.driver} onChange={(driver) => patch({ driver })} />
                <SettingInputVertical label={uiT("portalIpv4")} value={value.portal} onChange={(portal) => patch({ portal })} />
                <SettingInputVertical label={uiT("portalIpv6")} value={value.portalV6} onChange={(portalV6) => patch({ portalV6 })} />
            </div>
            <SwitchCard label={uiT("forceFakeip")} checked={value.forceFakeIp} onCheckedChange={(forceFakeIp) => patch({ forceFakeIp })} />
            <SwitchCard label={uiT("skipMulticast")} checked={value.skipMulticast} onCheckedChange={(skipMulticast) => patch({ skipMulticast })} />
            <SwitchCard label={uiT("autoFakeIpRoute")} description={uiT("autoFakeIpRouteDescription")} checked={value.autoFakeIpRoute ?? false} onCheckedChange={(autoFakeIpRoute) => patch({ autoFakeIpRoute })} />
            <InputList title={uiT("routes")} data={value.routes} onChange={(routes) => patch({ routes })} textarea />
            <InputList title="Excludes" data={value.excludes} onChange={(excludes) => patch({ excludes })} textarea />
            <InputList title={uiT("postUp")} data={value.postUp} onChange={(postUp) => patch({ postUp })} textarea />
            <InputList title={uiT("postDown")} data={value.postDown} onChange={(postDown) => patch({ postDown })} textarea />
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
    const { t: uiT } = useTranslation('ui');

    const patch = (patchValue: Partial<Certificate>) => onChange({ ...value, ...patchValue });
    return (
        <div className="rounded-ui-lg border border-ui-border bg-ui-surface-muted p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div className="font-semibold">{title}</div>
                {onRemove && <Button size="icon" variant="outline-danger" onClick={onRemove} aria-label={uiT("removeCertificate")}><Trash size={16} /></Button>}
            </div>
            <div className="grid gap-4">
                <BytesTextarea
                    label={uiT("certificatePem")}
                    valueBase64={value.certBase64}
                    onChangeBase64={(certBase64) => patch({ certBase64 })}
                />
                <BytesTextarea
                    label={uiT("privateKeyPem")}
                    valueBase64={value.keyBase64}
                    onChangeBase64={(keyBase64) => patch({ keyBase64 })}
                />
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingInputVertical label={uiT("certFile")} value={value.certFile} onChange={(certFile) => patch({ certFile })} />
                <SettingInputVertical label={uiT("keyFile")} value={value.keyFile} onChange={(keyFile) => patch({ keyFile })} />
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
    const { t: uiT } = useTranslation('ui');

    const items = Array.isArray(value) ? value : [];
    return (
        <div className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
                <SettingLabel className="mb-0">{uiT("certificates")}</SettingLabel>
                <Button size="sm" onClick={() => onChange([...items, defaultCertificate()])}><Plus size={16} className="mr-1" />{uiT("add")}</Button>
            </div>
            {items.length === 0 ? (
                <div className="rounded-ui-lg border border-dashed border-ui-border p-4 text-sm text-ui-muted">{uiT("noCertificateEntries")}</div>
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
    const { t: uiT } = useTranslation('ui');

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
                <SettingLabel className="mb-0">{uiT("serverNameCertificates")}</SettingLabel>
                <Button size="sm" onClick={() => onChange({ ...value, "": defaultCertificate() })}><Plus size={16} className="mr-1" />{uiT("add")}</Button>
            </div>
            {entries.length === 0 ? (
                <div className="rounded-ui-lg border border-dashed border-ui-border p-4 text-sm text-ui-muted">{uiT("noServerNameSpecificCertificates")}</div>
            ) : entries.map(([name, cert], index) => (
                <div key={`${name}-${index}`} className="rounded-ui-lg border border-ui-border bg-ui-surface-muted p-3">
                    <div className="mb-3 flex items-end gap-3">
                        <div className="grow">
                            <SettingInputVertical label={uiT("serverName")} value={name} onChange={(nextName) => update(index, nextName, cert)} className="!mb-0" />
                        </div>
                        <Button size="icon" variant="outline-danger" onClick={() => {
                            const next = Object.fromEntries(entries.filter((_, currentIndex) => currentIndex !== index));
                            onChange(Object.keys(next).length === 0 ? undefined : next);
                        }} aria-label={uiT("removeNamedCertificate")}><Trash size={16} /></Button>
                    </div>
                    <CertificateEditor title={uiT("certificate")} value={cert} onChange={(nextCert) => update(index, name, nextCert)} />
                </div>
            ))}
        </div>
    );
};

const ServerTLSConfigEditor: FC<{
    value?: ServerTLSConfig;
    onChange: (value: ServerTLSConfig) => void;
}> = ({ value, onChange }) => {
    const { t: uiT } = useTranslation('ui');

    const current = value ?? defaultServerTLS();
    const patch = (patchValue: Partial<ServerTLSConfig>) => onChange({ ...current, ...patchValue });
    return (
        <div className="grid gap-4">
            <InputList title={uiT("nextProtos")} data={current.nextProtos ?? []} onChange={(nextProtos) => patch({ nextProtos })} />
            <CertificateListEditor value={current.certificates ?? []} onChange={(certificates) => patch({ certificates })} />
            <NamedCertificateEditor value={current.serverNameCertificate} onChange={(serverNameCertificate) => patch({ serverNameCertificate })} />
        </div>
    );
};

const ClientTLSConfigEditor: FC<{
    value?: ClientTLSConfig;
    onChange: (value: ClientTLSConfig) => void;
}> = ({ value, onChange }) => {
    const { t: uiT } = useTranslation('ui');

    const current = value ?? defaultClientTLS();
    const patch = (patchValue: Partial<ClientTLSConfig>) => onChange({ ...current, ...patchValue });
    return (
        <div className="grid gap-4">
            <SwitchCard label={uiT("tlsEnabled")} checked={current.enabled} onCheckedChange={(enabled) => patch({ enabled })} />
            <SwitchCard label={uiT("skipCertificateVerify")} checked={current.insecureSkipVerify} onCheckedChange={(insecureSkipVerify) => patch({ insecureSkipVerify })} />
            <InputList title={uiT("serverNames")} data={current.serverNames ?? []} onChange={(serverNames) => patch({ serverNames })} />
            <InputList title={uiT("nextProtos")} data={current.nextProtos ?? []} onChange={(nextProtos) => patch({ nextProtos })} />
            <InputBytesList
                title={uiT("caCertificate")}
                data={(current.caCertsBase64 ?? []).map(base64ToBytes)}
                onChange={(caCerts) => patch({ caCertsBase64: caCerts.map(bytesToBase64) })}
            />
            <BytesTextarea
                label={uiT("echConfigList")}
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
    const { t: uiT } = useTranslation('ui');

    const current = value ?? { enabled: false, configBase64: "", privateKeyBase64: "", outerSni: "" };
    const patch = (patchValue: Partial<NonNullable<TLSAutoTransport["ech"]>>) => onChange({ ...current, ...patchValue });
    return (
        <div className="grid gap-4">
            <SwitchCard label={uiT("echEnabled")} checked={current.enabled} onCheckedChange={(enabled) => patch({ enabled })} />
            {current.enabled && (
                <SettingInputVertical label={uiT("echOuterSni")} value={current.outerSni} onChange={(outerSni) => patch({ outerSni })} />
            )}
            <SettingInputVertical label={uiT("echConfig")} value={current.configBase64} readOnly onChange={() => { }} />
            <SettingInputVertical label={uiT("echKey")} value={current.privateKeyBase64} readOnly onChange={() => { }} />
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
    const { t: uiT } = useTranslation('ui');

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
                <div className="mb-4 rounded-ui-lg border border-dashed border-ui-border p-4 text-center text-sm text-ui-muted">{uiT("noTransports")}</div>
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
                                        <Trash className="mr-1" size={16} /> {uiT("delete")}</Button>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}

            <TypeUseRow
                label={uiT("type")}
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
    const { t: uiT } = useTranslation('ui');

    switch (value.type) {
        case "normal":
        case "mux":
        case "http2":
        case "websocket":
        case "proxy":
            return <div className="rounded-ui-lg border border-dashed border-ui-border p-4 text-sm text-ui-muted">{uiT("noExtraTransportConfiguration")}</div>;
        case "tls":
            return (
                <ServerTLSConfigEditor value={value.tls.tls} onChange={(tls) => onChange({ ...value, tls: { tls } })} />
            );
        case "reality":
            return (
                <div className="grid gap-4">
                    <InputList title={uiT("shortIds")} data={value.reality.shortIds} onChange={(shortIds) => onChange({ ...value, reality: { ...value.reality, shortIds } })} />
                    <InputList title={uiT("serverNames")} data={value.reality.serverNames} onChange={(serverNames) => onChange({ ...value, reality: { ...value.reality, serverNames } })} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SettingInputVertical label={uiT("destination")} value={value.reality.dest} onChange={(dest) => onChange({ ...value, reality: { ...value.reality, dest } })} />
                        <SettingInputVertical label={uiT("privateKey")} value={value.reality.privateKey} onChange={(privateKey) => onChange({ ...value, reality: { ...value.reality, privateKey } })} />
                        <SettingInputVertical label={uiT("publicKey")} value={value.reality.publicKey} onChange={(publicKey) => onChange({ ...value, reality: { ...value.reality, publicKey } })} />
                        <SettingInputVertical label={uiT("mldsa65Seed")} value={value.reality.mldsa65Seed} onChange={(mldsa65Seed) => onChange({ ...value, reality: { ...value.reality, mldsa65Seed } })} />
                    </div>
                    <SwitchCard label={uiT("debug")} checked={value.reality.debug} onCheckedChange={(debug) => onChange({ ...value, reality: { ...value.reality, debug } })} />
                </div>
            );
        case "tls_auto":
            return (
                <div className="grid gap-4">
                    <InputList title={uiT("nextProtos")} data={value.tls_auto.nextProtos} onChange={(nextProtos) => onChange({ ...value, tls_auto: { ...value.tls_auto, nextProtos } })} />
                    <InputList title={uiT("serverNames")} data={value.tls_auto.serverNames} onChange={(serverNames) => onChange({ ...value, tls_auto: { ...value.tls_auto, serverNames } })} />
                    <ECHConfigEditor value={value.tls_auto.ech} onChange={(ech) => onChange({ ...value, tls_auto: { ...value.tls_auto, ech } })} />
                    <BytesTextarea
                        label={uiT("caCert")}
                        valueBase64={value.tls_auto.caCertBase64}
                        onChangeBase64={(caCertBase64) => onChange({ ...value, tls_auto: { ...value.tls_auto, caCertBase64 } })}
                        readOnly
                    />
                    <BytesTextarea
                        label={uiT("caKey")}
                        valueBase64={value.tls_auto.caKeyBase64}
                        onChangeBase64={(caKeyBase64) => onChange({ ...value, tls_auto: { ...value.tls_auto, caKeyBase64 } })}
                        readOnly
                    />
                </div>
            );
        case "http_mock":
            return <Textarea className="min-h-[120px] font-mono text-sm" value={value.http_mock.dataBase64} onChange={(event) => onChange({ ...value, http_mock: { dataBase64: event.target.value } })} placeholder={uiT("base64MockResponseData")} />;
        case "aead":
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SettingInputVertical label={uiT("password")} value={value.aead.password} onChange={(password) => onChange({ ...value, aead: { ...value.aead, password } })} />
                    <SettingInputVertical label={uiT("cryptoMethod")} value={value.aead.cryptoMethod} onChange={(cryptoMethod) => onChange({ ...value, aead: { ...value.aead, cryptoMethod } })} />
                </div>
            );
    }
};

export { InboundEditor };
