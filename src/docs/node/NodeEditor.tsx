import { base64ToBytes, bytesToBase64 } from "@/common/base64";
import { WireguardForm, FixedForm, FixedV2Form } from "./tunnel-forms";
import { GlobalProtectForm, GlobalProtectRuntimeInfo } from "./globalprotect-forms";
import { TLSConfigForm, TLSTerminationForm, HTTPTerminationForm } from "./tls-forms";
import { StringField, NumberField, BoolField } from "./fields";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/component/v2/accordion";
import { Badge } from "@/component/v2/badge";
import { Button } from "@/component/v2/button";
import { SettingLabel } from "@/component/v2/card";

import { Select, SettingInputBytes, SettingInputVertical, SettingSelectVertical, SwitchCard } from "@/component/v2/forms";

import { InputList } from "@/component/v2/listeditor";

import type { Node, NodeOrigin, NodeProtocol, NodeProtocolConfig, NodeProtocolType } from "@/contract/node";
import { createDefaultProtocol, normalizeProtocol, patchProtocolConfig, protocolTypes } from "@/contract/node";
import { ArrowDown, ArrowUp, Plus, Trash } from "lucide-react";
import React, { FC, useState } from "react";
import { useTranslation } from "react-i18next";

const NodeEditor: FC<{
    value: Node;
    editable: boolean;
    groups: string[];
    onChange: (patch: Partial<Node>) => void;
    onProtocolChange: (index: number, protocol: NodeProtocol) => void;
    onMoveProtocol: (index: number, direction: -1 | 1) => void;
    onRemoveProtocol: (index: number) => void;
    onAddProtocol: (type: NodeProtocolType) => void;
}> = ({ value, editable, groups, onChange, onProtocolChange, onMoveProtocol, onRemoveProtocol, onAddProtocol }) => {
    const { t: uiT } = useTranslation('ui');
    return (
    <div className="p-1">
        {editable && (
            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <SettingInputVertical label={uiT("name")} value={value.name} onChange={(name) => onChange({ name })} disabled={!editable} />
                <SettingSelectVertical label={uiT("groupLabel")} value={value.group} values={groups} onChange={(group) => onChange({ group })} disabled={!editable} />
                <SettingInputVertical label={uiT("idLabel")} value={value.id} onChange={(id) => onChange({ id })} disabled={!editable} />
                <SettingSelectVertical label={uiT("origin")} value={value.origin} values={["reserve", "remote", "manual"]} onChange={(origin) => onChange({ origin: origin as NodeOrigin })} disabled={!editable} />
                <div className="md:col-span-2">
                    <SwitchCard label={uiT("enabled")} checked={value.enabled} onCheckedChange={(enabled) => onChange({ enabled })} disabled={!editable} />
                </div>
            </div>
        )}

        <NodeProtocolChain
            chain={value.chain}
            editable={editable}
            onProtocolChange={onProtocolChange}
            onMoveProtocol={onMoveProtocol}
            onRemoveProtocol={onRemoveProtocol}
            onAddProtocol={onAddProtocol}
        />
        {value.chain.some(containsGlobalProtect) && <GlobalProtectRuntimeInfo key={value.id} nodeId={value.id} />}
    </div>
);
};

function containsGlobalProtect(protocol: NodeProtocol): boolean {
    if (protocol.type === "globalprotect") return true;
    if (protocol.type !== "network_split") return false;
    return [protocol.network_split.tcp, protocol.network_split.udp].some((child) => child ? containsGlobalProtect(child) : false);
}

const NodeProtocolChain: FC<{
    chain: NodeProtocol[];
    editable: boolean;
    onProtocolChange: (index: number, protocol: NodeProtocol) => void;
    onMoveProtocol: (index: number, direction: -1 | 1) => void;
    onRemoveProtocol: (index: number) => void;
    onAddProtocol: (type: NodeProtocolType) => void;
}> = ({ chain, editable, onProtocolChange, onMoveProtocol, onRemoveProtocol, onAddProtocol }) => {
    const { t: uiT } = useTranslation('ui');

    const [newProtocol, setNewProtocol] = useState<NodeProtocolType>("direct");
    const normalizedChain = chain.length > 0 ? chain.map(normalizeProtocol) : [createDefaultProtocol("direct")];

    return (
        <div className="mb-3">
            <div className="mb-2 flex items-center justify-between px-1">
                <h6 className="mb-0 font-bold opacity-75">{uiT("protocolChain")}</h6>
                <small className="text-ui-muted">{normalizedChain.length} {uiT("steps")}</small>
            </div>

            <Accordion type="multiple" defaultValue={normalizedChain.length > 0 ? ["item-0"] : []} className="mb-3">
                {normalizedChain.map((protocol, index) => (
                    <AccordionItem value={`item-${index}`} key={`${index}-${protocol.type}`}>
                        <AccordionTrigger>
                            <div className="flex min-w-0 flex-1 items-center gap-2">
                                <Badge variant="primary" pill className="px-2 text-[0.7rem]">
                                    {index + 1}
                                </Badge>
                                <span className="truncate">{protocol.type}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="p-1">
                                <ProtocolEditor
                                    value={protocol}
                                    index={index}
                                    editable={editable}
                                    onChange={(next) => onProtocolChange(index, next)}
                                />

                                {editable && (
                                    <div className="mt-3 flex justify-end gap-2 pt-3">
                                        <Button size="sm" aria-label={uiT("moveStepUp")} onClick={() => onMoveProtocol(index, -1)} disabled={index === 0}>
                                            <ArrowUp size={16} />
                                        </Button>
                                        <Button size="sm" aria-label={uiT("moveStepDown")} onClick={() => onMoveProtocol(index, 1)} disabled={index === normalizedChain.length - 1}>
                                            <ArrowDown size={16} />
                                        </Button>
                                        <Button variant="outline-danger" size="sm" onClick={() => onRemoveProtocol(index)}>
                                            <Trash size={16} className="mr-2" /> {uiT("delete")}</Button>
                                    </div>
                                )}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>

            {editable && (
                <div className="flex flex-wrap items-end gap-3 rounded-ui-lg bg-ui-surface-muted p-3 sm:flex-nowrap">
                    <div className="w-full flex-1">
                        <label className="mb-2 block text-sm font-bold opacity-75">{uiT("newProtocolStep")}</label>
                        <Select
                            value={newProtocol}
                            onValueChange={(value) => setNewProtocol(value as NodeProtocolType)}
                            items={protocolTypes.map(value => ({ value, label: value }))}
                        />
                    </div>
                    <Button
                        className="mb-1"
                        onClick={() => onAddProtocol(newProtocol)}
                    >
                        <Plus className="mr-1" size={16} /> {uiT("addStep")}</Button>
                </div>
            )}
        </div>
    );
};

const ProtocolEditor: FC<{
    value: NodeProtocol;
    index: number;
    editable: boolean;
    onChange: (value: NodeProtocol) => void;
}> = ({ value, index, editable, onChange }) => {
    const { t: uiT } = useTranslation('ui');

    const normalized = normalizeProtocol(value);

    const updateType = (type: string) => {
        onChange(createDefaultProtocol(type as NodeProtocolType));
    };

    return (
        <div className="grid gap-3">
            {editable && (
                <div className="grow">
                    <SettingLabel className="mb-2 block">#{index + 1} {uiT("type")}</SettingLabel>
                    <SettingSelectVertical
                        label=""
                        className="!mb-0"
                        value={normalized.type}
                        values={protocolTypes}
                        onChange={updateType}
                        disabled={!editable}
                    />
                </div>
            )}
            <ProtocolConfigEditor
                value={normalized}
                editable={editable}
                onChange={onChange}
            />
        </div>
    );
};

const ProtocolConfigEditor: FC<{
    value: NodeProtocol;
    editable: boolean;
    onChange: (value: NodeProtocol) => void;
}> = ({ value, editable, onChange }) => {
    const { t: uiT } = useTranslation('ui');

    const normalized = normalizeProtocol(value);

    const form = <ProtocolForm protocol={normalized} onChange={onChange} editable={editable} />;
    return (
        <div className="grid gap-3">
            {form ?? (
                <div className="rounded-ui-lg border border-dashed border-ui-border p-4 text-sm text-ui-muted">
                    {uiT("noStructuredEditorForThisProtocolYet")}</div>
            )}
        </div>
    );
};

function ProtocolForm({ protocol, onChange, editable }: { protocol: NodeProtocol; onChange: (value: NodeProtocol) => void; editable: boolean }): React.ReactNode {
    const { t: uiT } = useTranslation('ui');

    const patch = <T extends NodeProtocolType>(value: NodeProtocol<T>, patchValue: Partial<NodeProtocolConfig<T>>) => {
        onChange(patchProtocolConfig(value, patchValue) as unknown as NodeProtocol);
    };

    switch (protocol.type) {
        case "direct":
            return (
                <StringField
                    label={uiT("networkInterface")}
                    value={protocol.direct.network_interface}
                    disabled={!editable}
                    onChange={(network_interface) => patch(protocol, { network_interface })}
                />
            );
        case "reject":
        case "drop":
        case "none":
        case "bootstrap_dns_warp":
        case "proxy":
            return <div className="rounded-ui-lg border border-dashed border-ui-border p-4 text-sm text-ui-muted">{uiT("noExtraProtocolConfiguration")}</div>;
        case "socks5":
            return (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <StringField label={uiT("hostname")} value={protocol.socks5.hostname} disabled={!editable} onChange={(hostname) => patch(protocol, { hostname })} />
                    <StringField label={uiT("username")} value={protocol.socks5.user} disabled={!editable} onChange={(user) => patch(protocol, { user })} />
                    <StringField label={uiT("password")} value={protocol.socks5.password} disabled={!editable} onChange={(password) => patch(protocol, { password })} />
                    <NumberField label={uiT("overridePort")} value={protocol.socks5.override_port} disabled={!editable} onChange={(override_port) => patch(protocol, { override_port })} />
                </div>
            );
        case "http":
            return (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <StringField label={uiT("username")} value={protocol.http.user} disabled={!editable} onChange={(user) => patch(protocol, { user })} />
                    <StringField label={uiT("password")} value={protocol.http.password} disabled={!editable} onChange={(password) => patch(protocol, { password })} />
                </div>
            );
        case "shadowsocks":
            return (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <StringField label={uiT("method")} value={protocol.shadowsocks.method} disabled={!editable} onChange={(method) => patch(protocol, { method })} />
                    <StringField label={uiT("password")} value={protocol.shadowsocks.password} disabled={!editable} onChange={(password) => patch(protocol, { password })} />
                </div>
            );
        case "shadowsocksr":
            return (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <StringField label={uiT("server")} value={protocol.shadowsocksr.server} disabled={!editable} onChange={(server) => patch(protocol, { server })} />
                    <StringField label={uiT("port")} value={protocol.shadowsocksr.port} disabled={!editable} onChange={(port) => patch(protocol, { port })} />
                    <StringField label={uiT("method")} value={protocol.shadowsocksr.method} disabled={!editable} onChange={(method) => patch(protocol, { method })} />
                    <StringField label={uiT("password")} value={protocol.shadowsocksr.password} disabled={!editable} onChange={(password) => patch(protocol, { password })} />
                    <StringField label="Obfs" value={protocol.shadowsocksr.obfs} disabled={!editable} onChange={(obfs) => patch(protocol, { obfs })} />
                    <StringField label={uiT("obfsParam")} value={protocol.shadowsocksr.obfsparam} disabled={!editable} onChange={(obfsparam) => patch(protocol, { obfsparam })} />
                    <StringField label={uiT("protocol")} value={protocol.shadowsocksr.protocol} disabled={!editable} onChange={(nextProtocol) => patch(protocol, { protocol: nextProtocol })} />
                    <StringField label={uiT("protocolParam")} value={protocol.shadowsocksr.protoparam} disabled={!editable} onChange={(protoparam) => patch(protocol, { protoparam })} />
                </div>
            );
        case "vmess":
            return (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <StringField label={uiT("uuid")} value={protocol.vmess.id} disabled={!editable} onChange={(id) => patch(protocol, { id })} />
                    <StringField label={uiT("alterId")} value={protocol.vmess.aid} disabled={!editable} onChange={(aid) => patch(protocol, { aid })} />
                    <StringField label="Security" value={protocol.vmess.security} disabled={!editable} onChange={(security) => patch(protocol, { security })} />
                </div>
            );
        case "vless":
            return <StringField label={uiT("uuid")} value={protocol.vless.uuid} disabled={!editable} onChange={(uuid) => patch(protocol, { uuid })} />;
        case "trojan":
            return (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <StringField label={uiT("password")} value={protocol.trojan.password} disabled={!editable} onChange={(password) => patch(protocol, { password })} />
                    <StringField label="Peer" value={protocol.trojan.peer} disabled={!editable} onChange={(peer) => patch(protocol, { peer })} />
                </div>
            );
        case "yuubinsya":
            return (
                <div className="grid gap-4">
                    <StringField label={uiT("password")} value={protocol.yuubinsya.password} disabled={!editable} onChange={(password) => patch(protocol, { password })} />
                    <BoolField label={uiT("udpOverStream")} value={protocol.yuubinsya.udp_over_stream} disabled={!editable} onChange={(udp_over_stream) => patch(protocol, { udp_over_stream })} />
                    <BoolField label={uiT("udpCoalesce")} value={protocol.yuubinsya.udp_coalesce} disabled={!editable} onChange={(udp_coalesce) => patch(protocol, { udp_coalesce })} />
                </div>
            );
        case "websocket":
            return (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <StringField label={uiT("host")} value={protocol.websocket.host} disabled={!editable} onChange={(host) => patch(protocol, { host })} />
                    <StringField label={uiT("path")} value={protocol.websocket.path} disabled={!editable} onChange={(path) => patch(protocol, { path })} />
                </div>
            );
        case "hysteria2":
            return (
                <div className="grid gap-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <StringField label={uiT("host")} value={protocol.hysteria2.host} disabled={!editable} onChange={(host) => patch(protocol, { host })} />
                        <StringField label={uiT("password")} value={protocol.hysteria2.auth} disabled={!editable} onChange={(auth) => patch(protocol, { auth })} />
                        <NumberField label={uiT("uploadBandwidthBytes")} value={protocol.hysteria2.upload_bps} disabled={!editable} onChange={(upload_bps) => patch(protocol, { upload_bps })} />
                        <NumberField label={uiT("downloadBandwidthBytes")} value={protocol.hysteria2.download_bps} disabled={!editable} onChange={(download_bps) => patch(protocol, { download_bps })} />
                        <StringField label={uiT("salamanderPassword")} value={protocol.hysteria2.salamander_password} disabled={!editable} onChange={(salamander_password) => patch(protocol, { salamander_password })} />
                    </div>
                    <p className="text-sm text-ui-muted">{uiT("hysteria2BandwidthHelp")}</p>
                    <InputList title={uiT("hysteria2HopAddresses")} data={protocol.hysteria2.hop_addresses ?? []} textarea placeholder="relay-b.example:443,20000-20020" disabled={!editable} onChange={(hop_addresses) => patch(protocol, { hop_addresses })} />
                    <p className="text-sm text-ui-muted">{uiT("hysteria2AddressHopHelp")}</p>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <SettingInputVertical label={uiT("hopIntervalSeconds")} type="number" min={0} step={1} value={String(protocol.hysteria2.hop_interval_seconds ?? 0)} disabled={!editable} onChange={(value) => patch(protocol, { hop_interval_seconds: Number(value) })} />
                        <SettingInputVertical label={uiT("minHopIntervalSeconds")} type="number" min={0} step={1} value={String(protocol.hysteria2.min_hop_interval_seconds ?? 0)} disabled={!editable} onChange={(value) => patch(protocol, { min_hop_interval_seconds: Number(value) })} />
                        <SettingInputVertical label={uiT("maxHopIntervalSeconds")} type="number" min={0} step={1} value={String(protocol.hysteria2.max_hop_interval_seconds ?? 0)} disabled={!editable} onChange={(value) => patch(protocol, { max_hop_interval_seconds: Number(value) })} />
                    </div>
                    <p className="text-sm text-ui-muted">{uiT("hysteria2HopClientHelp")}</p>
                    <TLSConfigForm config={protocol.hysteria2.tls ?? {}} editable={editable} showEnabled={false} showNextProtos={false} onChange={(tls) => patch(protocol, { tls })} />
                </div>
            );
        case "quic":
            return (
                <div className="grid gap-4">
                    <StringField label={uiT("host")} value={protocol.quic.host} disabled={!editable} onChange={(host) => patch(protocol, { host })} />
                    <TLSConfigForm
                        config={protocol.quic.tls ?? {}}
                        editable={editable}
                        showEnabled={false}
                        onChange={(tls) => patch(protocol, { tls })}
                    />
                </div>
            );
        case "obfs_http":
            return (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <StringField label={uiT("host")} value={protocol.obfs_http.host} disabled={!editable} onChange={(host) => patch(protocol, { host })} />
                    <StringField label={uiT("port")} value={protocol.obfs_http.port} disabled={!editable} onChange={(port) => patch(protocol, { port })} />
                </div>
            );
        case "reality":
            return (
                <div className="grid gap-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <StringField label={uiT("serverName")} value={protocol.reality.server_name} disabled={!editable} onChange={(server_name) => patch(protocol, { server_name })} />
                        <StringField label={uiT("publicKey")} value={protocol.reality.public_key} disabled={!editable} onChange={(public_key) => patch(protocol, { public_key })} />
                        <StringField label={uiT("mldsa65Verify")} value={protocol.reality.mldsa65_verify} disabled={!editable} onChange={(mldsa65_verify) => patch(protocol, { mldsa65_verify })} />
                        <StringField label={uiT("shortId")} value={protocol.reality.short_id} disabled={!editable} onChange={(short_id) => patch(protocol, { short_id })} />
                    </div>
                    <BoolField label={uiT("debug")} value={protocol.reality.debug} disabled={!editable} onChange={(debug) => patch(protocol, { debug })} />
                </div>
            );
        case "simple":
            return <FixedForm config={protocol.simple} editable={editable} onChange={(patchValue) => patch(protocol, patchValue)} />;
        case "fixed":
            return <FixedForm config={protocol.fixed} editable={editable} onChange={(patchValue) => patch(protocol, patchValue)} />;
        case "tls":
            return <TLSConfigForm config={protocol.tls} editable={editable} onChange={(patchValue) => patch(protocol, patchValue)} />;
        case "wireguard":
            return <WireguardForm config={protocol.wireguard} editable={editable} onChange={(patchValue) => patch(protocol, patchValue)} />;
        case "globalprotect":
            return <GlobalProtectForm config={protocol.globalprotect} editable={editable} onChange={(patchValue) => patch(protocol, patchValue)} />;
        case "tailscale":
            return (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <StringField label={uiT("hostname")} value={protocol.tailscale.hostname} disabled={!editable} onChange={(hostname) => patch(protocol, { hostname })} />
                    <StringField label={uiT("authKey")} value={protocol.tailscale.auth_key} disabled={!editable} onChange={(auth_key) => patch(protocol, { auth_key })} />
                    <StringField label={uiT("controlUrl")} value={protocol.tailscale.control_url} disabled={!editable} onChange={(control_url) => patch(protocol, { control_url })} />
                    <BoolField label={uiT("debug")} value={protocol.tailscale.debug} disabled={!editable} onChange={(debug) => patch(protocol, { debug })} />
                </div>
            );
        case "http_mock":
            return (
                <SettingInputBytes
                    label="Data"
                    value={base64ToBytes(protocol.http_mock.data)}
                    disabled={!editable}
                    onChange={(data) => patch(protocol, { data: bytesToBase64(data) })}
                />
            );
        case "aead":
            return (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <StringField label={uiT("password")} value={protocol.aead.password} disabled={!editable} onChange={(password) => patch(protocol, { password })} />
                    <StringField label={uiT("cryptoMethod")} value={protocol.aead.crypto_method} disabled={!editable} onChange={(crypto_method) => patch(protocol, { crypto_method })} />
                </div>
            );
        case "http2":
            return <NumberField label={uiT("concurrency")} value={protocol.http2.concurrency} disabled={!editable} onChange={(concurrency) => patch(protocol, { concurrency })} />;
        case "mux":
            return <NumberField label={uiT("concurrency")} value={protocol.mux.concurrency} disabled={!editable} onChange={(concurrency) => patch(protocol, { concurrency })} />;
        case "set":
            return (
                <div className="grid gap-4">
                    <InputList title={uiT("nodes")} data={protocol.set.nodes ?? []} disabled={!editable} onChange={(nodes) => patch(protocol, { nodes })} />
                    <StringField label="Strategy" value={protocol.set.strategy} disabled={!editable} onChange={(strategy) => patch(protocol, { strategy })} />
                </div>
            );
        case "point_as_endpoint":
            return <StringField label="Hash" value={protocol.point_as_endpoint.hash} disabled={!editable} onChange={(hash) => patch(protocol, { hash })} />;
        case "network_split":
            return <NetworkSplitForm config={protocol.network_split} editable={editable} onChange={(patchValue) => patch(protocol, patchValue)} />;
        case "cloudflare_warp_masque":
            return (
                <div className="grid gap-4">
                    <StringField label={uiT("privateKey")} value={protocol.cloudflare_warp_masque.private_key} disabled={!editable} onChange={(private_key) => patch(protocol, { private_key })} />
                    <StringField label={uiT("endpointPublicKey")} value={protocol.cloudflare_warp_masque.endpoint_public_key} disabled={!editable} onChange={(endpoint_public_key) => patch(protocol, { endpoint_public_key })} />
                    <InputList title="Endpoints" data={protocol.cloudflare_warp_masque.endpoint ?? []} disabled={!editable} onChange={(endpoint) => patch(protocol, { endpoint })} />
                    <InputList title={uiT("localAddresses")} data={protocol.cloudflare_warp_masque.local_addresses ?? []} disabled={!editable} onChange={(local_addresses) => patch(protocol, { local_addresses })} />
                    <NumberField label="MTU" value={protocol.cloudflare_warp_masque.mtu} disabled={!editable} onChange={(mtu) => patch(protocol, { mtu })} />
                </div>
            );
        case "tls_termination":
            return <TLSTerminationForm config={protocol.tls_termination} editable={editable} onChange={(patchValue) => patch(protocol, patchValue)} />;
        case "http_termination":
            return <HTTPTerminationForm config={protocol.http_termination} editable={editable} onChange={(patchValue) => patch(protocol, patchValue)} />;
        case "fixedv2":
            return <FixedV2Form config={protocol.fixedv2} editable={editable} onChange={(patchValue) => patch(protocol, patchValue)} />;
        default:
            return undefined;
    }
}

const NestedProtocolEditor: FC<{
    label: string;
    value?: NodeProtocol;
    editable: boolean;
    onChange: (value: NodeProtocol) => void;
}> = ({ label, value, editable, onChange }) => {
    const { t: uiT } = useTranslation('ui');

    const current = normalizeProtocol(value ?? createDefaultProtocol("direct"));
    const nestedProtocolTypes = protocolTypes.filter((type) => type !== "network_split");

    return (
        <div className="grid gap-3 rounded-ui-lg border border-ui-border bg-ui-surface-muted p-3">
            <SettingLabel className="block">{label}</SettingLabel>
            <SettingSelectVertical
                label={uiT("type")}
                value={current.type}
                values={nestedProtocolTypes}
                onChange={(type) => onChange(createDefaultProtocol(type as NodeProtocolType))}
                disabled={!editable}
            />
            <ProtocolConfigEditor value={current} editable={editable} onChange={onChange} />
        </div>
    );
};

const NetworkSplitForm: FC<{
    config: NodeProtocolConfig<"network_split">;
    editable: boolean;
    onChange: (value: Partial<NodeProtocolConfig<"network_split">>) => void;
}> = ({ config, editable, onChange }) => {
    const { t: uiT } = useTranslation('ui');
    return (
    <div className="grid gap-4">
        <NestedProtocolEditor label={uiT("tcpProtocol")} value={config.tcp} editable={editable} onChange={(tcp) => onChange({ tcp })} />
        <NestedProtocolEditor label={uiT("udpProtocol")} value={config.udp} editable={editable} onChange={(udp) => onChange({ udp })} />
    </div>
);
};

export { NodeEditor, NodeProtocolChain };
