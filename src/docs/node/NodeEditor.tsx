import { OutboundTCPSettings } from './tcp-settings';
import { base64ToBytes, bytesToBase64 } from "@/common/base64";
import { WireguardForm, FixedForm, FixedV2Form } from "./tunnel-forms";
import { AmneziaWGForm } from "./amneziawg-forms";
import { NebulaForm } from "./nebula-form";
import { ZeroTierForm } from "./zerotier-form";
import { IKEv2Form, AnyConnectForm, SSTPForm, FortinetForm } from "./enterprisevpn-forms";
import { GlobalProtectForm, GlobalProtectRuntimeInfo } from "./globalprotect-forms";
import { SoftEtherForm } from "./softether-forms";
import { L2TPForm, L2TPv3Form, L2TPRuntimeInfo } from "./l2tp-forms";
import { OpenVPNForm, OpenVPNRuntimeInfo } from "./openvpn-forms";
import { TLSConfigForm, TLSTerminationForm } from "./tls-forms";
import { StringField, NumberField, BoolField, MoreOptions, numberValue, stringValue } from "./fields";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/component/v2/accordion";
import { Button } from "@/component/v2/button";
import { SettingLabel } from "@/component/v2/card";

import { SettingInputBytes, SettingInputVertical, SettingSelectVertical, SwitchCard } from "@/component/v2/forms";

import { InputList } from "@/component/v2/listeditor";

import type { Node, NodeIPVersion, NodeProtocol, NodeProtocolConfig, NodeProtocolType } from "@/contract/node";
import { createDefaultProtocol, normalizeProtocol, patchProtocolConfig, protocolTypes } from "@/contract/node";
import NodePicker from "@/component/node-picker";
import { ArrowDown, ArrowUp, ChevronRight, Plus, Replace, Trash } from "lucide-react";
import { confirmAction } from "@/component/v2/confirmation";
import { Dropdown, DropdownContent, DropdownItem, DropdownLabel, DropdownTrigger } from "@/component/v2/dropdown";
import { protocolGroupOrder, protocolsByGroup, useProtocolLabels } from "./protocol-catalog";
import React, { FC, createContext, useContext, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { OutboundCredential } from "./credential";

import { Textarea } from "@/component/v2/input";
import { SecretValues } from "@/component/secret-values";
import { getNodeSecrets } from "@/api/nodes";

const EditingNodeID = createContext('');

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
    const { t } = useTranslation('routing');
    return (
    <EditingNodeID.Provider value={value.id}><SecretValues key={value.id} value={value} load={value.id ? signal => getNodeSecrets(value.id, signal) : undefined}><div>
        {editable && (
            <div className="mb-4 grid grid-cols-1 gap-4 @xl:grid-cols-2">
                <SettingInputVertical label={uiT("name")} value={value.name} onChange={(name) => onChange({ name })} disabled={!editable} />
                <SettingInputVertical label={uiT("groupLabel")} value={value.group} reminds={groups.map(group => ({ label: group, value: group }))} showAllOnFocus onChange={(group) => onChange({ group })} disabled={!editable} />
                <div className="@xl:col-span-2">
                    <SwitchCard label={uiT("enabled")} checked={value.enabled} onCheckedChange={(enabled) => onChange({ enabled })} disabled={!editable} />
                </div>
                <details className="@xl:col-span-2 rounded-ui-md border border-ui-border/70 px-4 py-3 [--field-margin:0px]"><summary className="cursor-pointer text-sm font-medium">{t("nodeAdvancedSettings")}</summary>
                <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-xs text-ui-muted">
                    <dt>{uiT("nodeProtocol.identity")}</dt><dd className="break-all font-mono">{value.id}</dd>
                    {value.origin && <><dt>{uiT("nodeProtocol.origin")}</dt><dd className="break-all">{value.origin}</dd></>}
                </dl>
                <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 @xl:grid-cols-2">
                    <div className="grid content-start gap-1.5">
                        <SettingSelectVertical
                            label={uiT("nodeIPVersion")}
                            value={value.ip_version ?? "auto"}
                            values={[
                                [uiT("nodeIPVersionAuto"), "auto"],
                                [uiT("nodeIPVersionIPv4"), "ipv4"],
                                [uiT("nodeIPVersionIPv6"), "ipv6"],
                            ]}
                            onChange={(ip_version) => onChange({ ip_version: ip_version as NodeIPVersion })}
                            disabled={!editable}
                        />
                        <p className="text-xs text-ui-muted">{uiT("nodeIPVersionHelp")}</p>
                    </div>
                    <div className="grid content-start gap-1.5">
                        <SettingInputVertical
                            label={uiT("nodeLatencyURL")}
                            value={value.latency?.url ?? ""}
                            placeholder="https://intranet.example.com/health"
                            onChange={(url) => onChange({ latency: { ...value.latency, url } })}
                            disabled={!editable}
                        />
                        <p className="text-xs text-ui-muted">{uiT("nodeLatencyURLHelp")}</p>
                    </div>
                    <div className="@xl:col-span-2">
                        <SwitchCard
                            label={uiT("nodeLatencyInsecureSkipVerify")}
                            description={uiT("nodeLatencyInsecureSkipVerifyHelp")}
                            checked={value.latency?.insecure_skip_verify ?? false}
                            onCheckedChange={(insecure_skip_verify) => onChange({ latency: { ...value.latency, insecure_skip_verify } })}
                            disabled={!editable}
                        />
                    </div>
                </div>
                </details>
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
        {value.chain.some((protocol) => containsProtocol(protocol, "globalprotect")) && <GlobalProtectRuntimeInfo key={`gp-${value.id}`} nodeId={value.id} />}
        {value.chain.some((protocol) => containsProtocol(protocol, "openvpn")) && <OpenVPNRuntimeInfo key={`ovpn-${value.id}`} nodeId={value.id} />}
        {(["l2tp", "l2tpv3"] as const).map((type) => value.chain.some((protocol) => containsProtocol(protocol, type)) && <L2TPRuntimeInfo key={`${type}-${value.id}`} nodeId={value.id} type={type} />)}
    </div></SecretValues></EditingNodeID.Provider>
);
};

type Endpoint = { host?: unknown; port?: unknown; network_interface?: unknown };

function endpointLabel(value?: Endpoint): string {
    const host = stringValue(value?.host);
    const port = numberValue(value?.port);
    return host && port > 0 ? `${host}:${port}` : host;
}

/** One-line description of a step for its collapsed header; empty when nothing identifying is configured. */
export function protocolSummary(protocol: NodeProtocol, labels: { noAuth: string; sharedCredential: string; via: (name: string) => string }): string {
    const config = ((protocol as unknown as Record<string, unknown>)[protocol.type] ?? {}) as Record<string, unknown>;
    const parts: string[] = [];
    if (protocol.type === "fixed" || protocol.type === "fixedv2") {
        const addresses = protocol.type === "fixed" ? [config as Endpoint, ...((config.alternate_host as Endpoint[] | undefined) ?? [])] : ((config.addresses as Endpoint[] | undefined) ?? []);
        const named = addresses.filter(address => stringValue(address.host));
        if (named.length > 0) parts.push(endpointLabel(named[0]) + (named.length > 1 ? ` +${named.length - 1}` : ""));
        const iface = stringValue(named[0]?.network_interface);
        if (iface) parts.push(labels.via(iface));
        return parts.join(" · ");
    }
    const host = stringValue(config.host) || stringValue(config.hostname) || stringValue(config.server) || stringValue(config.servername);
    if (host) parts.push(host);
    const path = stringValue(config.path);
    if (path) parts.push(path);
    if (protocol.type === "direct" && stringValue(config.network_interface)) parts.push(labels.via(stringValue(config.network_interface)));
    if (protocol.type === "socks5" || protocol.type === "http" || protocol.type === "ssh") {
        const user = stringValue(config.user);
        parts.push(protocol.credentialRef ? labels.sharedCredential : user || labels.noAuth);
    }
    return parts.join(" · ");
}

function containsProtocol(protocol: NodeProtocol, type: "globalprotect" | "openvpn" | "l2tp" | "l2tpv3"): boolean {
    if (protocol.type === type) return true;
    if (protocol.type !== "network_split") return false;
    return [protocol.network_split.tcp, protocol.network_split.udp].some((child) => child ? containsProtocol(child, type) : false);
}

/** Grouped protocol menu used to add a step or change a step's type. */
const ProtocolTypeMenu: FC<{ trigger: ReactNode; onSelect: (type: NodeProtocolType) => void; current?: NodeProtocolType }> = ({ trigger, onSelect, current }) => {
    const labels = useProtocolLabels();
    const grouped = protocolsByGroup();
    return <Dropdown>
        <DropdownTrigger asChild>{trigger}</DropdownTrigger>
        <DropdownContent align="end" className="w-[min(320px,calc(100vw-2rem))] max-w-[calc(100vw-2rem)]">
            {protocolGroupOrder.map(group => <div key={group} role="group" aria-label={labels.group(group)}>
                <DropdownLabel>{labels.group(group)}</DropdownLabel>
                {grouped[group].map(type => <DropdownItem key={type} disabled={type === current} onSelect={() => onSelect(type)}>
                    <span className="grid min-w-0">
                        <span className="truncate">{labels.name(type)}</span>
                        {labels.help(type) && <span className="truncate text-xs text-ui-muted">{labels.help(type)}</span>}
                    </span>
                </DropdownItem>)}
            </div>)}
        </DropdownContent>
    </Dropdown>;
};

const NodeProtocolChain: FC<{
    chain: NodeProtocol[];
    editable: boolean;
    onProtocolChange: (index: number, protocol: NodeProtocol) => void;
    onMoveProtocol: (index: number, direction: -1 | 1) => void;
    onRemoveProtocol: (index: number) => void;
    onAddProtocol: (type: NodeProtocolType) => void;
}> = ({ chain, editable, onProtocolChange, onMoveProtocol, onRemoveProtocol, onAddProtocol }) => {
    const { t: uiT } = useTranslation('ui');
    const labels = useProtocolLabels();

    const normalizedChain = chain.length > 0 ? chain.map(normalizeProtocol) : [createDefaultProtocol("direct")];
    // A single step opens directly; longer chains start collapsed so the whole chain reads at a glance.
    const [openSteps, setOpenSteps] = useState<string[]>(() => normalizedChain.length > 1 ? [] : ["item-0"]);
    const summaryLabels = { noAuth: uiT("noAuthentication"), sharedCredential: uiT("sharedCredentialShort"), via: (name: string) => uiT("viaInterface", { name }) };
    const addStep = (type: NodeProtocolType) => {
        setOpenSteps(previous => [...previous, `item-${chain.length}`]);
        onAddProtocol(type);
    };
    const changeType = async (index: number, type: NodeProtocolType) => {
        if (!await confirmAction(uiT("nodeProtocol.changeConfirm", { index: index + 1, name: labels.name(type) }))) return;
        onProtocolChange(index, createDefaultProtocol(type));
    };

    return (
        <section className="mb-3 grid gap-3" aria-label={uiT("protocolChain")}>
            <header className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                    <h6 className="mb-0 text-base font-medium text-ui-heading">
                        {uiT("protocolChain")}<span className="ml-2 text-sm font-normal text-ui-muted">{uiT("stepCount", { count: normalizedChain.length })}</span>
                    </h6>
                    <p className="mt-1 text-xs text-ui-muted">{uiT("nodeProtocol.chainHelp")}</p>
                </div>
                {editable && <ProtocolTypeMenu onSelect={addStep} trigger={
                    <Button size="sm" variant="outline-secondary" className="gap-1.5"><Plus size={15} />{uiT("nodeProtocol.addStep")}</Button>
                } />}
            </header>

            <p aria-label={uiT("nodeProtocol.flow")} className="flex flex-wrap items-center gap-1 text-xs text-ui-muted">
                <span>{uiT("nodeProtocol.local")}</span>
                {normalizedChain.map((protocol, index) => <span key={index} className="inline-flex items-center gap-1">
                    <ChevronRight size={12} aria-hidden="true" />
                    <span className="rounded-full border border-ui-border px-2 py-0.5 font-medium text-ui-secondary">{labels.name(protocol.type)}</span>
                </span>)}
                <ChevronRight size={12} aria-hidden="true" />
                <span>{uiT("nodeProtocol.target")}</span>
            </p>

            <Accordion type="multiple" value={openSteps} onValueChange={setOpenSteps}>
                {normalizedChain.map((protocol, index) => {
                    const summary = protocolSummary(protocol, summaryLabels);
                    return (
                        <AccordionItem value={`item-${index}`} key={`${index}-${protocol.type}`}>
                            <AccordionTrigger>
                                <div className="flex min-w-0 flex-1 items-center gap-2">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-ui-border text-xs font-medium tabular-nums text-ui-secondary">
                                        {index + 1}
                                    </span>
                                    <span className="shrink-0 font-medium">{labels.name(protocol.type)}</span>
                                    {summary && <span className="min-w-0 truncate text-sm font-normal text-ui-muted group-data-[state=open]:hidden">{summary}</span>}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="grid gap-3 p-1">
                                    {labels.help(protocol.type) && <p className="text-xs text-ui-muted">{labels.help(protocol.type)}</p>}
                                    <ProtocolEditor
                                        value={protocol}
                                        index={index}
                                        editable={editable}
                                        onChange={(next) => onProtocolChange(index, next)}
                                    />

                                    {editable && (
                                        <div className="flex flex-wrap justify-end gap-2 border-t border-ui-border/60 pt-3">
                                            <ProtocolTypeMenu current={protocol.type} onSelect={(type) => void changeType(index, type)} trigger={
                                                <Button size="sm" variant="outline-secondary" className="mr-auto gap-1.5"><Replace size={15} />{uiT("nodeProtocol.changeType")}</Button>
                                            } />
                                            <Button size="sm" variant="outline-secondary" aria-label={uiT("moveStepUp")} title={uiT("moveStepUp")} onClick={() => onMoveProtocol(index, -1)} disabled={index === 0}>
                                                <ArrowUp size={16} />
                                            </Button>
                                            <Button size="sm" variant="outline-secondary" aria-label={uiT("moveStepDown")} title={uiT("moveStepDown")} onClick={() => onMoveProtocol(index, 1)} disabled={index === normalizedChain.length - 1}>
                                                <ArrowDown size={16} />
                                            </Button>
                                            <Button variant="outline-danger" size="sm" onClick={() => onRemoveProtocol(index)}>
                                                <Trash size={16} className="mr-2" /> {uiT("delete")}</Button>
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>
        </section>
    );
};

const ProtocolEditor: FC<{
    value: NodeProtocol;
    index: number;
    editable: boolean;
    onChange: (value: NodeProtocol) => void;
}> = ({ value, editable, onChange }) => (
    <ProtocolConfigEditor value={normalizeProtocol(value)} editable={editable} onChange={onChange} />
);

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
            <OutboundCredential value={normalized} editable={editable} onChange={onChange} />
            <OutboundTCPSettings protocol={normalized} editable={editable} onChange={onChange} />
            {form ?? (
                <div className="rounded-ui-lg border border-dashed border-ui-border p-4 text-sm text-ui-muted">
                    {uiT("noStructuredEditorForThisProtocolYet")}</div>
            )}
        </div>
    );
};

function ProtocolForm({ protocol, onChange, editable }: { protocol: NodeProtocol; onChange: (value: NodeProtocol) => void; editable: boolean }): React.ReactNode {
    const nodeId = useContext(EditingNodeID);
    const { t: uiT } = useTranslation('ui');
    const { t } = useTranslation('routing');

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
                <div className="grid gap-2">
                    {!protocol.credentialRef && <div className="grid grid-cols-1 gap-x-4 @xl:grid-cols-2">
                        <StringField label={uiT("username")} value={protocol.socks5.user} disabled={!editable} onChange={(user) => patch(protocol, { user })} />
                        <StringField secret label={uiT("password")} value={protocol.socks5.password} disabled={!editable} onChange={(password) => patch(protocol, { password })} />
                    </div>}
                    <MoreOptions active={!!protocol.socks5.hostname || numberValue(protocol.socks5.override_port) > 0}>
                        <div className="grid grid-cols-1 gap-x-4 @xl:grid-cols-2">
                            <StringField label={uiT("hostname")} value={protocol.socks5.hostname} disabled={!editable} onChange={(hostname) => patch(protocol, { hostname })} />
                            <NumberField label={uiT("overridePort")} value={protocol.socks5.override_port} disabled={!editable} onChange={(override_port) => patch(protocol, { override_port })} />
                        </div>
                    </MoreOptions>
                </div>
            );
        case "ssh":
            return (
                <div className="grid gap-4">
                    <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2">
                        {!protocol.credentialRef && <StringField label={uiT("username")} value={protocol.ssh.user} disabled={!editable} onChange={(user) => patch(protocol, { user })} />}
                        {!protocol.credentialRef && <SettingInputVertical secret label={uiT("password")} type="password" value={protocol.ssh.password ?? ""} disabled={!editable} onChange={(password) => patch(protocol, { password })} />}
                        <SettingInputVertical label={uiT("sshHostKey")} value={protocol.ssh.host_key ?? ""} placeholder="SHA256:... / ssh-ed25519 AAAA..." disabled={!editable} onChange={(host_key) => patch(protocol, { host_key })} />
                        <NumberField label={uiT("sshKeepAliveSeconds")} value={protocol.ssh.keep_alive_seconds} disabled={!editable} onChange={(keep_alive_seconds) => patch(protocol, { keep_alive_seconds })} />
                        <SettingInputVertical secret label={uiT("sshPrivateKeyPassphrase")} type="password" value={protocol.ssh.private_key_passphrase ?? ""} disabled={!editable} onChange={(private_key_passphrase) => patch(protocol, { private_key_passphrase })} />
                    </div>
                    <div className="grid gap-2">
                        <SettingLabel>{uiT("sshPrivateKey")}</SettingLabel>
                        <Textarea code secret aria-label={uiT("sshPrivateKey")} className="min-h-32 w-full rounded-ui-md border border-ui-border bg-ui-surface p-3 text-ui-heading" spellCheck={false} autoComplete="off" value={protocol.ssh.private_key ?? ""} disabled={!editable} onChange={(event) => patch(protocol, { private_key: event.target.value })} />
                    </div>
                    <p className="text-sm text-ui-muted">{uiT("sshTCPOnlyHelp")}</p>
                </div>
            );
        case "http":
            return (
                <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2">
                    {!protocol.credentialRef && <StringField label={uiT("username")} value={protocol.http.user} disabled={!editable} onChange={(user) => patch(protocol, { user })} />}
                    {!protocol.credentialRef && <StringField secret label={uiT("password")} value={protocol.http.password} disabled={!editable} onChange={(password) => patch(protocol, { password })} />}
                </div>
            );
        case "shadowsocks":
            return (
                <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2">
                    <StringField label={uiT("method")} value={protocol.shadowsocks.method} disabled={!editable} onChange={(method) => patch(protocol, { method })} />
                    {!protocol.credentialRef && <StringField secret label={uiT("password")} value={protocol.shadowsocks.password} disabled={!editable} onChange={(password) => patch(protocol, { password })} />}
                </div>
            );
        case "shadowsocksr":
            return (
                <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2">
                    <StringField label={uiT("server")} value={protocol.shadowsocksr.server} disabled={!editable} onChange={(server) => patch(protocol, { server })} />
                    <StringField label={uiT("port")} value={protocol.shadowsocksr.port} disabled={!editable} onChange={(port) => patch(protocol, { port })} />
                    <StringField label={uiT("method")} value={protocol.shadowsocksr.method} disabled={!editable} onChange={(method) => patch(protocol, { method })} />
                    {!protocol.credentialRef && <StringField secret label={uiT("password")} value={protocol.shadowsocksr.password} disabled={!editable} onChange={(password) => patch(protocol, { password })} />}
                    <StringField label={uiT("nodeForm.obfs")} value={protocol.shadowsocksr.obfs} disabled={!editable} onChange={(obfs) => patch(protocol, { obfs })} />
                    <StringField label={uiT("obfsParam")} value={protocol.shadowsocksr.obfsparam} disabled={!editable} onChange={(obfsparam) => patch(protocol, { obfsparam })} />
                    <StringField label={uiT("protocol")} value={protocol.shadowsocksr.protocol} disabled={!editable} onChange={(nextProtocol) => patch(protocol, { protocol: nextProtocol })} />
                    <StringField secret label={uiT("protocolParam")} value={protocol.shadowsocksr.protoparam} disabled={!editable} onChange={(protoparam) => patch(protocol, { protoparam })} />
                </div>
            );
        case "vmess":
            return (
                <div className="grid grid-cols-1 gap-4 @2xl:grid-cols-3">
                    <StringField secret label={uiT("uuid")} value={protocol.vmess.id} disabled={!editable} onChange={(id) => patch(protocol, { id })} />
                    <StringField label={uiT("alterId")} value={protocol.vmess.aid} disabled={!editable} onChange={(aid) => patch(protocol, { aid })} />
                    <StringField label={uiT("nodeForm.security")} value={protocol.vmess.security} disabled={!editable} onChange={(security) => patch(protocol, { security })} />
                </div>
            );
        case "vless":
            return <StringField secret label={uiT("uuid")} value={protocol.vless.uuid} disabled={!editable} onChange={(uuid) => patch(protocol, { uuid })} />;
        case "trojan":
            return (
                <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2">
                    {!protocol.credentialRef && <StringField secret label={uiT("password")} value={protocol.trojan.password} disabled={!editable} onChange={(password) => patch(protocol, { password })} />}
                    <StringField label={uiT("nodeForm.peer")} value={protocol.trojan.peer} disabled={!editable} onChange={(peer) => patch(protocol, { peer })} />
                </div>
            );
        case "yuubinsya":
            return (
                <div className="grid gap-4">
                    {!protocol.credentialRef && <StringField secret label={uiT("password")} value={protocol.yuubinsya.password} disabled={!editable} onChange={(password) => patch(protocol, { password })} />}
                    <BoolField label={uiT("udpOverStream")} value={protocol.yuubinsya.udp_over_stream} disabled={!editable} onChange={(udp_over_stream) => patch(protocol, { udp_over_stream })} />
                    <BoolField label={uiT("udpCoalesce")} value={protocol.yuubinsya.udp_coalesce} disabled={!editable} onChange={(udp_coalesce) => patch(protocol, { udp_coalesce })} />
                </div>
            );
        case "websocket":
            return (
                <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2">
                    <StringField label={uiT("host")} value={protocol.websocket.host} disabled={!editable} onChange={(host) => patch(protocol, { host })} />
                    <StringField label={uiT("path")} value={protocol.websocket.path} disabled={!editable} onChange={(path) => patch(protocol, { path })} />
                </div>
            );
        case "hysteria2":
            return (
                <div className="grid gap-4">
                    <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2">
                        <StringField label={uiT("host")} value={protocol.hysteria2.host} disabled={!editable} onChange={(host) => patch(protocol, { host })} />
                        {!protocol.credentialRef && <StringField secret label={uiT("password")} value={protocol.hysteria2.auth} disabled={!editable} onChange={(auth) => patch(protocol, { auth })} />}
                        <NumberField label={uiT("uploadBandwidthBytes")} value={protocol.hysteria2.upload_bps} disabled={!editable} onChange={(upload_bps) => patch(protocol, { upload_bps })} />
                        <NumberField label={uiT("downloadBandwidthBytes")} value={protocol.hysteria2.download_bps} disabled={!editable} onChange={(download_bps) => patch(protocol, { download_bps })} />
                        <StringField secret label={uiT("salamanderPassword")} value={protocol.hysteria2.salamander_password} disabled={!editable} onChange={(salamander_password) => patch(protocol, { salamander_password })} />
                    </div>
                    <p className="text-sm text-ui-muted">{uiT("hysteria2BandwidthHelp")}</p>
                    <InputList title={uiT("hysteria2HopAddresses")} data={protocol.hysteria2.hop_addresses ?? []} placeholder="relay-b.example:443,20000-20020" disabled={!editable} onChange={(hop_addresses) => patch(protocol, { hop_addresses })} />
                    <SwitchCard label={uiT("hysteria2HappyEyeballs")} description={uiT("hysteria2HappyEyeballsDescription")} checked={protocol.hysteria2.happy_eyeballs ?? false} disabled={!editable} onCheckedChange={(happy_eyeballs) => patch(protocol, { happy_eyeballs })} />
                    <p className="text-sm text-ui-muted">{uiT(protocol.hysteria2.happy_eyeballs ? "hysteria2HappyEyeballsHelp" : "hysteria2AddressHopHelp")}</p>
                    {!protocol.hysteria2.happy_eyeballs && (
                        <>
                    <div className="grid grid-cols-1 gap-4 @2xl:grid-cols-3">
                        <SettingInputVertical label={uiT("hopIntervalSeconds")} type="number" min={0} step={1} value={String(protocol.hysteria2.hop_interval_seconds ?? 0)} disabled={!editable} onChange={(value) => patch(protocol, { hop_interval_seconds: Number(value) })} />
                        <SettingInputVertical label={uiT("minHopIntervalSeconds")} type="number" min={0} step={1} value={String(protocol.hysteria2.min_hop_interval_seconds ?? 0)} disabled={!editable} onChange={(value) => patch(protocol, { min_hop_interval_seconds: Number(value) })} />
                        <SettingInputVertical label={uiT("maxHopIntervalSeconds")} type="number" min={0} step={1} value={String(protocol.hysteria2.max_hop_interval_seconds ?? 0)} disabled={!editable} onChange={(value) => patch(protocol, { max_hop_interval_seconds: Number(value) })} />
                    </div>
                    <p className="text-sm text-ui-muted">{uiT("hysteria2HopClientHelp")}</p>
                        </>
                    )}
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
                <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2">
                    <StringField label={uiT("host")} value={protocol.obfs_http.host} disabled={!editable} onChange={(host) => patch(protocol, { host })} />
                    <StringField label={uiT("port")} value={protocol.obfs_http.port} disabled={!editable} onChange={(port) => patch(protocol, { port })} />
                </div>
            );
        case "reality":
            return (
                <div className="grid gap-4">
                    <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2">
                        <StringField label={uiT("serverName")} value={protocol.reality.server_name} disabled={!editable} onChange={(server_name) => patch(protocol, { server_name })} />
                        <StringField label={uiT("publicKey")} value={protocol.reality.public_key} disabled={!editable} onChange={(public_key) => patch(protocol, { public_key })} />
                        <StringField label={uiT("mldsa65Verify")} value={protocol.reality.mldsa65_verify} disabled={!editable} onChange={(mldsa65_verify) => patch(protocol, { mldsa65_verify })} />
                        <StringField secret label={uiT("shortId")} value={protocol.reality.short_id} disabled={!editable} onChange={(short_id) => patch(protocol, { short_id })} />
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
        case "ikev2":
            return <IKEv2Form config={protocol.ikev2} editable={editable} onChange={(patchValue) => patch(protocol, patchValue)} />;
        case "anyconnect":
            return <AnyConnectForm config={protocol.anyconnect} editable={editable} onChange={(patchValue) => patch(protocol, patchValue)} />;
        case "sstp":
            return <SSTPForm config={protocol.sstp} editable={editable} onChange={(patchValue) => patch(protocol, patchValue)} />;
        case "fortinet":
            return <FortinetForm config={protocol.fortinet} editable={editable} onChange={(patchValue) => patch(protocol, patchValue)} />;
        case "amneziawg":
            return <AmneziaWGForm config={protocol.amneziawg} editable={editable} onChange={(patchValue) => patch(protocol, patchValue)} />;
        case "nebula":
            return <NebulaForm config={protocol.nebula} editable={editable} onChange={(patchValue) => patch(protocol, patchValue)} />;
        case "zerotier":
            return <ZeroTierForm config={protocol.zerotier} editable={editable} onChange={(patchValue) => patch(protocol, patchValue)} />;
        case "wireguard":
            return <WireguardForm config={protocol.wireguard} editable={editable} onChange={(patchValue) => patch(protocol, patchValue)} />;
        case "globalprotect":
            return <GlobalProtectForm config={protocol.globalprotect} editable={editable} onChange={(patchValue) => patch(protocol, patchValue)} />;
        case "openvpn":
            return <OpenVPNForm config={protocol.openvpn} editable={editable} onChange={(patchValue) => patch(protocol, patchValue)} />;
        case "l2tp":
            return <L2TPForm config={protocol.l2tp} editable={editable} onChange={(patchValue) => patch(protocol, patchValue)} />;
        case "l2tpv3":
            return <L2TPv3Form config={protocol.l2tpv3} editable={editable} onChange={(patchValue) => patch(protocol, patchValue)} />;
        case "softether":
            return <SoftEtherForm config={protocol.softether} editable={editable} onChange={(patchValue) => patch(protocol, patchValue)} />;
        case "tailscale":
            return (
                <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2">
                    <StringField label={uiT("hostname")} value={protocol.tailscale.hostname} disabled={!editable} onChange={(hostname) => patch(protocol, { hostname })} />
                    <StringField secret label={uiT("authKey")} value={protocol.tailscale.auth_key} disabled={!editable} onChange={(auth_key) => patch(protocol, { auth_key })} />
                    <StringField label={uiT("controlUrl")} value={protocol.tailscale.control_url} disabled={!editable} onChange={(control_url) => patch(protocol, { control_url })} />
                    <BoolField label={uiT("debug")} value={protocol.tailscale.debug} disabled={!editable} onChange={(debug) => patch(protocol, { debug })} />
                </div>
            );
        case "http_mock":
            return (
                <SettingInputBytes
                    label={uiT("nodeForm.data")}
                    value={base64ToBytes(protocol.http_mock.data)}
                    disabled={!editable}
                    onChange={(data) => patch(protocol, { data: bytesToBase64(data) })}
                />
            );
        case "aead":
            return (
                <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2">
                    {!protocol.credentialRef && <StringField secret label={uiT("password")} value={protocol.aead.password} disabled={!editable} onChange={(password) => patch(protocol, { password })} />}
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
                    <SettingLabel>{t("setMembers")}</SettingLabel>
                    <NodePicker excludeId={nodeId} value={protocol.set.nodes ?? []} disabled={!editable} onChange={(nodes) => patch(protocol, { nodes })} />
                    <SettingSelectVertical label={t("setStrategy")} value={protocol.set.strategy || "random"} disabled={!editable}
                        values={[[t("randomFallback"), "random"], [t("orderedFallback"), "round_robin"], ...(!["", "random", "round_robin"].includes(protocol.set.strategy ?? "") ? [[protocol.set.strategy!, protocol.set.strategy!] as [string, string]] : [])]}
                        onChange={(strategy) => patch(protocol, { strategy })} />
                    <p className="text-sm text-ui-muted">{t("setFallbackHelp")}</p>
                </div>
            );
        case "point_as_endpoint":
            return <StringField label={uiT("nodeForm.hash")} value={protocol.point_as_endpoint.hash} disabled={!editable} onChange={(hash) => patch(protocol, { hash })} />;
        case "network_split":
            return <NetworkSplitForm config={protocol.network_split} editable={editable} onChange={(patchValue) => patch(protocol, patchValue)} />;
        case "masque":
            return (
                <div className="grid gap-4">
                    <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2">
                        <StringField label={uiT("nodeForm.endpointHostPort")} value={protocol.masque.endpoint} disabled={!editable} onChange={(endpoint) => patch(protocol, { endpoint })} />
                        <StringField label={uiT("nodeForm.serverNameSni")} value={protocol.masque.server_name} disabled={!editable} onChange={(server_name) => patch(protocol, { server_name })} />
                    </div>
                    <StringField label={uiT("nodeForm.connectIpUrl")} value={protocol.masque.url} disabled={!editable} onChange={(url) => patch(protocol, { url })} />
                    {!protocol.credentialRef && <StringField secret label={uiT("nodeForm.bearerToken")} value={protocol.masque.bearer_token} disabled={!editable} onChange={(bearer_token) => patch(protocol, { bearer_token })} />}
                    <InputList title={uiT("localAddresses")} data={protocol.masque.local_addresses ?? []} disabled={!editable} onChange={(local_addresses) => patch(protocol, { local_addresses })} />
                    <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2">
                        <NumberField label="MTU" value={protocol.masque.mtu} disabled={!editable} onChange={(mtu) => patch(protocol, { mtu })} />
                        <SettingSelectVertical label={uiT("transport")} value={protocol.masque.transport || "h3"} disabled={!editable}
                            values={[["HTTP/3 (QUIC / BBR)", "h3"], ["HTTP/2 (TLS / TCP)", "h2"]]}
                            onChange={(transport) => patch(protocol, { transport })} />
                    </div>
                    <StringField label={uiT("nodeForm.customCaPem")} value={protocol.masque.ca_cert_pem} disabled={!editable} onChange={(ca_cert_pem) => patch(protocol, { ca_cert_pem })} />
                    <StringField label={uiT("nodeForm.clientCertPem")} value={protocol.masque.client_cert_pem} disabled={!editable} onChange={(client_cert_pem) => patch(protocol, { client_cert_pem })} />
                    <StringField secret label={uiT("nodeForm.clientKeyPem")} value={protocol.masque.client_key_pem} disabled={!editable} onChange={(client_key_pem) => patch(protocol, { client_key_pem })} />
                    <BoolField label={uiT("nodeForm.skipTlsVerifyUnsafe")} value={protocol.masque.insecure_skip_verify} disabled={!editable} onChange={(insecure_skip_verify) => patch(protocol, { insecure_skip_verify })} />
                </div>
            );
        case "cloudflare_warp_masque":
            return (
                <div className="grid gap-4">
                    <StringField secret label={uiT("privateKey")} value={protocol.cloudflare_warp_masque.private_key} disabled={!editable} onChange={(private_key) => patch(protocol, { private_key })} />
                    <div className="grid min-w-0 gap-2">
                        <SettingLabel>{uiT("endpointPublicKey")}</SettingLabel>
                        <Textarea code aria-label={uiT("endpointPublicKey")} rows={4} value={protocol.cloudflare_warp_masque.endpoint_public_key ?? ""} disabled={!editable} onChange={(event) => patch(protocol, { endpoint_public_key: event.target.value })} />
                    </div>
                    <InputList title={uiT("nodeForm.endpoints")} data={protocol.cloudflare_warp_masque.endpoint ?? []} disabled={!editable} onChange={(endpoint) => patch(protocol, { endpoint })} />
                    <InputList title={uiT("localAddresses")} data={protocol.cloudflare_warp_masque.local_addresses ?? []} disabled={!editable} onChange={(local_addresses) => patch(protocol, { local_addresses })} />
                    <NumberField label="MTU" value={protocol.cloudflare_warp_masque.mtu} disabled={!editable} onChange={(mtu) => patch(protocol, { mtu })} />
                </div>
            );
        case "tls_termination":
            return <TLSTerminationForm config={protocol.tls_termination} editable={editable} onChange={(patchValue) => patch(protocol, patchValue)} />;
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
