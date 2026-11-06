import { TCPSettingsEditor } from '@/component/tcp-settings';
import { FormSection } from '@/component/v2/form-section';
import { timezoneOptions } from '@/common/timezones';
import { base64ToBytes, bytesToBase64 } from "@/common/base64";

import { useTranslation } from 'react-i18next';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/component/v2/accordion";

import { Button } from "@/component/v2/button";
import { SettingLabel } from "@/component/v2/card";
import { Select, SettingInputVertical, SettingSelectVertical, SwitchCard } from "@/component/v2/forms";
import { confirmAction } from "@/component/v2/confirmation";
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "@/component/v2/dropdown";
import { ToggleGroup, ToggleItem } from "@/component/v2/togglegroup";
import { Textarea } from "@/component/v2/input";
import { Tooltip } from "@/component/v2/tooltip";
import { InputList } from "@/component/v2/listeditor";

import { createDefaultNetwork, createDefaultTransport, selectInboundProtocol, Certificate, Inbound, InboundNetwork, InboundProtocol, InboundTransport, normalizeInbound, ServerTLSConfig, TLSAutoTransport } from "@/contract/inbound";
import { ArrowDown, ArrowUp, ChevronRight, Plus, Trash } from "lucide-react";
import { FC, useId, useMemo } from "react";

import { UserAuthentication } from "./authentication";

const networkTypes: InboundNetwork["type"][] = ["empty", "tcp_udp", "quic"];

const protocolTypes: InboundProtocol["type"][] = ["hysteria2", "masque", "http", "socks5", "yuubinsya", "mixed", "socks4a", "tproxy", "redir", "tun", "wireguard", "sstp", "ssh", "krunlet", "reverse_tcp", "none"];

const transportTypes: InboundTransport["type"][] = ["normal", "tls", "mux", "http2", "websocket", "reality", "tls_auto", "http_mock", "aead", "proxy"];

function numberValue(value: string): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}


import { SecretValues } from "@/component/secret-values";
import { getInboundSecrets } from "@/api/inbounds";

const InboundEditor: FC<{
    inbound: Inbound;
    onChange: (value: Inbound) => void;
    protocols?: string[];
    platform?: string;
}> = ({ inbound, onChange, protocols, platform }) => {
    const { t: uiT } = useTranslation('ui');

    return (
        <SecretValues key={inbound.id} value={inbound} load={inbound.id ? signal => getInboundSecrets(inbound.id, signal) : undefined}><div className="grid min-w-0 gap-5 [--field-margin:0px]">
            <SwitchCard
                label={uiT("enabled")}
                checked={inbound.enabled}
                onCheckedChange={(enabled) => onChange(normalizeInbound({ ...inbound, enabled }))}
            />
            <SettingInputVertical
                label={uiT("name")}
                value={inbound.name}
                onChange={(name) => onChange(normalizeInbound({ ...inbound, name }))}
            />

            {/* The protocol decides which listeners and transports apply, so it comes first. */}
            <FormSection title={uiT("protocol")}>
                <ProtocolSection inbound={inbound} onChange={onChange} protocols={protocols} platform={platform} />
            </FormSection>

            <FormSection title={uiT("inboundEditor.listener")}>
                <NetworkSection inbound={inbound} onChange={onChange} />
            </FormSection>

            <TransportSection inbound={inbound} onChange={onChange} />

            <UserAuthentication inbound={inbound} onChange={onChange} />
        </div></SecretValues>
    );
};

/** Human labels for contract enums; the raw value stays the stored one. */
function useTypeLabels() {
    const { t: uiT } = useTranslation('ui');
    return {
        protocol: (type: string) => uiT(`inboundEditor.protocolType.${type}`, { defaultValue: type }),
        protocolHelp: (type: string) => uiT(`inboundEditor.protocolHelp.${type}`, { defaultValue: "" }),
        network: (type: string) => uiT(`inboundEditor.networkType.${type}`, { defaultValue: type }),
        transport: (type: string) => uiT(`inboundEditor.transportType.${type}`, { defaultValue: type }),
    };
}

/** A small segmented control that applies the choice immediately. */
const Segmented: FC<{
    label: string;
    value: string;
    items: { value: string; label: string }[];
    onChange: (value: string) => void;
}> = ({ label, value, items, onChange }) => (
    <ToggleGroup type="single" aria-label={label} value={value} onValueChange={(next) => next && next !== value && onChange(next)} className="flex w-full">
        {/* Equal widths on one line; a long label truncates instead of wrapping to a second row. */}
        {items.map(item => <ToggleItem key={item.value} value={item.value} title={item.label} className="min-w-0 flex-1 basis-0 overflow-hidden whitespace-nowrap px-2">{item.label}</ToggleItem>)}
    </ToggleGroup>
);

const NetworkSection: FC<{
    inbound: Inbound;
    onChange: (value: Inbound) => void;
}> = ({ inbound, onChange }) => {
    const { t: uiT } = useTranslation('ui');

    const labels = useTypeLabels();

    if (inbound.protocol.type === "wireguard") {
        return <p className="text-sm text-ui-muted">{uiT("wgNoSystemTun")}</p>;
    }

    if (inbound.protocol.type === "sstp" || inbound.protocol.type === "ssh") {
        return <NetworkEditor value={inbound.network} tcpOnly onChange={(network) => onChange(normalizeInbound({ ...inbound, network }))} />;
    }

    if (inbound.protocol.type === "hysteria2") {
        return <NetworkEditor value={inbound.network} udpOnly onChange={(network) => onChange(normalizeInbound({ ...inbound, network }))} />;
    }

    return (
        <>
            <Segmented
                label={uiT("networkType")}
                value={inbound.network.type}
                items={networkTypes.map(type => ({ value: type, label: labels.network(type) }))}
                onChange={(value) => {
                    // Keep the listen address when switching between TCP/UDP and QUIC.
                    const host = inbound.network.type === "tcp_udp" ? inbound.network.tcp_udp.host : inbound.network.type === "quic" ? inbound.network.quic.host : "";
                    const network = createDefaultNetwork(value as InboundNetwork["type"]);
                    if (host && network.type === "tcp_udp") network.tcp_udp.host = host;
                    if (host && network.type === "quic") network.quic.host = host;
                    onChange(normalizeInbound({ ...inbound, network }));
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
    protocols?: string[];
    platform?: string;
}> = ({ inbound, onChange, protocols, platform }) => {
    const { t: uiT } = useTranslation('ui');

    const labels = useTypeLabels();
    const available = protocolTypes.filter(type => !protocols || protocols.includes(type) || type === inbound.protocol.type);
    const help = labels.protocolHelp(inbound.protocol.type);

    return (
        <>
            <div className="grid gap-1.5">
                <Select
                    ariaLabel={uiT("protocol")}
                    value={inbound.protocol.type}
                    items={available.map(type => ({ value: type, label: labels.protocol(type) }))}
                    onValueChange={(value) => {
                        if (value === inbound.protocol.type) return;
                        void (async () => {
                            if (!await confirmAction(uiT("inboundEditor.protocolChangeConfirm", { name: labels.protocol(value) }))) return;
                            onChange(selectInboundProtocol(inbound, value as InboundProtocol["type"]));
                        })();
                    }}
                />
                {help && <p className="text-xs text-ui-muted">{help}</p>}
            </div>
            <ProtocolConfigEditor
                value={inbound.protocol}
                platform={platform}
                onChange={(protocol) => onChange(normalizeInbound({ ...inbound, protocol }))}
            />
        </>
    );
};

const NetworkEditor: FC<{
    value: InboundNetwork;
    udpOnly?: boolean;
    tcpOnly?: boolean;
    onChange: (value: InboundNetwork) => void;
}> = ({ value, udpOnly = false, tcpOnly = false, onChange }) => {
    const { t: uiT } = useTranslation('ui');

    switch (value.type) {
        case "empty":
            return <div className="rounded-ui-lg border border-dashed border-ui-border p-4 text-sm text-ui-muted">{uiT("thisInboundDoesNotBindANetworkListener")}</div>;
        case "tcp_udp":
            return (
                <div className="grid gap-4">
                    <SettingInputVertical
                        label={uiT("listenHost")}
                        value={value.tcp_udp.host}
                        onChange={(host) => onChange({ ...value, tcp_udp: { ...value.tcp_udp, host } })}
                        placeholder=":9002"
                    />
                    {udpOnly || tcpOnly ? (
                        <div className="grid content-start gap-2">
                            <span className="text-sm font-medium text-ui-secondary">{uiT("inboundEditor.mode")}</span>
                            <p className="rounded-ui-sm border border-ui-border/70 px-3 py-2.5 text-sm text-ui-secondary">
                                {uiT(udpOnly ? "inboundEditor.udpOnlyFixed" : "inboundEditor.tcpOnlyFixed")}
                            </p>
                        </div>
                    ) : (
                        <div className="grid content-start gap-2">
                            <span className="text-sm font-medium text-ui-secondary">{uiT("inboundEditor.mode")}</span>
                            {/* "disabled" behaves exactly like "tcp_only" in the backend. */}
                            <Segmented
                                label={uiT("inboundEditor.mode")}
                                value={value.tcp_udp.udp === "disabled" ? "tcp_only" : value.tcp_udp.udp}
                                items={(["enabled", "tcp_only", "udp_only"] as const).map(mode => ({ value: mode, label: uiT(`inboundEditor.udpMode.${mode}`) }))}
                                onChange={(udp) => onChange({ ...value, tcp_udp: { ...value.tcp_udp, udp: udp as typeof value.tcp_udp.udp } })}
                            />
                        </div>
                    )}
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
    platform?: string;
}> = ({ value, onChange, platform }) => {
    const { t: uiT } = useTranslation('ui');
    const hoppingHelpID = useId();

    switch (value.type) {
        case "masque":
            return (
                <div className="grid gap-4">
                    <p className="text-sm text-ui-muted">{uiT("inboundEditor.masqueHelp")}</p>
                    <SettingInputVertical label={uiT("inboundEditor.connectIpPath")} value={value.masque.path ?? ""} onChange={(path) => onChange({ ...value, masque: { ...value.masque, path } })} placeholder="/.well-known/masque/ip/*/*/" />
                    <SettingInputVertical label={uiT("inboundEditor.bearerToken")} value={value.masque.authToken} onChange={(authToken) => onChange({ ...value, masque: { ...value.masque, authToken } })} />
                    <InputList title={uiT("inboundEditor.serverAddresses")} data={value.masque.serverAddresses} onChange={(serverAddresses) => onChange({ ...value, masque: { ...value.masque, serverAddresses } })} />
                    <InputList title={uiT("inboundEditor.clientAddresses")} data={value.masque.clientAddresses} onChange={(clientAddresses) => onChange({ ...value, masque: { ...value.masque, clientAddresses } })} />
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <SettingInputVertical label="MTU" type="number" min={1280} max={65535} step={1} value={String(value.masque.mtu ?? 1280)} onChange={(mtu) => onChange({ ...value, masque: { ...value.masque, mtu: numberValue(mtu) } })} />
                        <SettingInputVertical label={uiT("inboundEditor.maxSessions")} type="number" min={1} max={1024} step={1} value={String(value.masque.maxSessions ?? 64)} onChange={(maxSessions) => onChange({ ...value, masque: { ...value.masque, maxSessions: numberValue(maxSessions) } })} />
                    </div>
                </div>
            );
        case "hysteria2":
            return (
                <div className="grid gap-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <SettingInputVertical label={uiT("password")} value={value.hysteria2.auth} onChange={(auth) => onChange({ ...value, hysteria2: { ...value.hysteria2, auth } })} />
                        <SettingInputVertical label={uiT("salamanderPassword")} value={value.hysteria2.salamanderPassword ?? ""} onChange={(salamanderPassword) => onChange({ ...value, hysteria2: { ...value.hysteria2, salamanderPassword } })} />
                        <SettingInputVertical label={uiT("uploadBandwidthBytes")} type="number" min={0} step={1} value={String(value.hysteria2.uploadBps ?? 0)} onChange={(uploadBps) => onChange({ ...value, hysteria2: { ...value.hysteria2, uploadBps: numberValue(uploadBps) } })} />
                        <SettingInputVertical label={uiT("downloadBandwidthBytes")} type="number" min={0} step={1} value={String(value.hysteria2.downloadBps ?? 0)} onChange={(downloadBps) => onChange({ ...value, hysteria2: { ...value.hysteria2, downloadBps: numberValue(downloadBps) } })} />
                    </div>
                    <p className="text-sm text-ui-muted">{uiT("hysteria2BandwidthHelp")}</p>
                    <SettingInputVertical label={<span className="inline-flex items-center gap-1">
                        {uiT("hopPorts")}
                        <Tooltip id={hoppingHelpID} openOnClick content={uiT("hysteria2HopServerHelp")}>
                            <button type="button" aria-label={uiT("hopPortsHelp")} aria-describedby={hoppingHelpID}
                                className="inline-flex h-6 w-6 items-center justify-center rounded-full cursor-help focus-visible:outline-2 focus-visible:outline-ui-focus"
                                onClick={(e) => { e.preventDefault(); e.currentTarget.focus(); }}>
                                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-ui-danger" />
                            </button>
                        </Tooltip>
                    </span>} placeholder="20000-50000" value={value.hysteria2.hopPorts ?? ""} onChange={(hopPorts) => onChange({ ...value, hysteria2: { ...value.hysteria2, hopPorts } })} />
                    <SwitchCard label={uiT("ignoreClientBandwidth")} checked={value.hysteria2.ignoreClientBandwidth ?? false} onCheckedChange={(ignoreClientBandwidth) => onChange({ ...value, hysteria2: { ...value.hysteria2, ignoreClientBandwidth } })} />
                    <SwitchCard label={uiT("disableUdp")} checked={value.hysteria2.disableUdp ?? false} onCheckedChange={(disableUdp) => onChange({ ...value, hysteria2: { ...value.hysteria2, disableUdp } })} />
                </div>
            );
        case "http":
            return <AuthFields username={value.http.username} password={value.http.password} onChange={(patch) => onChange({ ...value, http: { ...value.http, ...patch } })} />;
        case "mixed":
            return <AuthFields username={value.mixed.username} password={value.mixed.password} onChange={(patch) => onChange({ ...value, mixed: { ...value.mixed, ...patch } })} />;
        case "socks5":
            return (
                <div className="grid gap-4">
                    <AuthFields username={value.socks5.username} password={value.socks5.password} onChange={(patch) => onChange({ ...value, socks5: { ...value.socks5, ...patch } })} />
                    <SwitchCard label={uiT("inboundEditor.allowUdp")} checked={value.socks5.udp} onCheckedChange={(udp) => onChange({ ...value, socks5: { ...value.socks5, udp } })} />
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
        case "krunlet":
            return <SettingInputVertical label={uiT("inboundEditor.unixSocket")} value={value.krunlet.socket} onChange={socket => onChange({ ...value, krunlet: { ...value.krunlet, socket } })} />;
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
        case "ssh":
            return <SSHServerEditor value={value.ssh} onChange={(ssh) => onChange({ ...value, ssh })} />;
        case "sstp":
            return <SSTPServerEditor value={value.sstp} onChange={(sstp) => onChange({ ...value, sstp })} />;
        case "wireguard":
            return <WireguardServerEditor value={value.wireguard} onChange={(wireguard) => onChange({ ...value, wireguard })} />;
        case "tun":
            return <TunEditor value={value.tun} platform={platform} onChange={(tun) => onChange({ ...value, tun })} />;
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

const SSHServerEditor: FC<{
    value: Extract<InboundProtocol, { type: "ssh" }>["ssh"];
    onChange: (value: Extract<InboundProtocol, { type: "ssh" }>["ssh"]) => void;
}> = ({ value, onChange }) => {
    const { t: uiT } = useTranslation("ui");
    const patch = (fields: Partial<typeof value>) => onChange({ ...value, ...fields });
    const timezoneChoices = useMemo(() => timezoneOptions(), []);
    return (
        <div className="grid gap-4">
            <p className="text-sm text-ui-muted">{uiT("sshSessionHelp")}</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SettingInputVertical label={uiT("sshLoginUsername")} value={value.username}
                    onChange={(username) => patch({ username })} placeholder="alice" />
                <SettingInputVertical label={uiT("sshShell")} value={value.shell ?? ""}
                    onChange={(shell) => patch({ shell })} placeholder={uiT("sshShellAuto")} />
                <SettingInputVertical label={uiT("sshUID")} type="number" min={1} step={1}
                    value={String(value.uid)} onChange={(uid) => patch({ uid: numberValue(uid) })} />
                <SettingInputVertical label={uiT("sshGID")} type="number" min={1} step={1}
                    value={String(value.gid)} onChange={(gid) => patch({ gid: numberValue(gid) })} />
                <SettingInputVertical label="MTU" type="number" min={1280} max={9000} step={1}
                    value={String(value.mtu ?? 1500)} onChange={(mtu) => patch({ mtu: numberValue(mtu) })} />
                <SettingInputVertical label={uiT("sshMaxSessions")} type="number" min={1} max={128} step={1}
                    value={String(value.maxSessions ?? 8)} onChange={(maxSessions) => patch({ maxSessions: numberValue(maxSessions) })} />
            </div>
            <p className="text-xs text-ui-muted">{uiT("sshShellHelp")}</p>
            <div>
                <SettingInputVertical label={uiT("sshTimezone")} value={value.timezone ?? ""}
                    onChange={(timezone) => patch({ timezone })}
                    reminds={[{ value: "", label: uiT("sshTimezoneSystem") }, ...timezoneChoices]}
                    showAllOnFocus placeholder={uiT("sshTimezoneSystem")} spellCheck={false} autoComplete="off" />
                <p className="mt-1 text-xs text-ui-muted">{uiT("sshTimezoneHelp")}</p>
            </div>
            <FormSection title="SFTP">
                <p className="text-sm text-ui-muted">{uiT("sshSFTPHelp")}</p>
                <InputList title={uiT("sshSFTPReadOnlyPaths")} data={value.sftpReadOnlyPaths}
                    onChange={(sftpReadOnlyPaths) => patch({ sftpReadOnlyPaths })} placeholder="/srv/archive" />
                <p className="text-xs text-ui-muted">{uiT("sshSFTPReadOnlyHelp")}</p>
            </FormSection>
            <div>
                <p className="mb-2 text-sm font-medium text-ui-heading">{uiT("sshAuthorizedPublicKey")}</p>
                <Textarea code rows={3} value={value.authorizedKey} onChange={(event) => patch({ authorizedKey: event.target.value })}
                    placeholder="ssh-ed25519 AAAA... user@device" />
            </div>
            <p className="text-xs text-ui-muted">{uiT("sshHostKeyAutoHelp")}</p>
            <details>
                <summary className="cursor-pointer text-sm text-ui-heading">{uiT("sshAdvancedSettings")}</summary>
                <div className="mt-3 grid gap-4">
                    <div>
                        <p className="mb-2 text-sm font-medium text-ui-heading">{uiT("sshOverrideHostKey")}</p>
                        <Textarea code secret rows={3} value={value.hostKey} onChange={(event) => patch({ hostKey: event.target.value })}
                            placeholder="-----BEGIN PRIVATE KEY-----" />
                    </div>
                    <SettingInputVertical label={uiT("sshCgroupRoot")} value={value.cgroupRoot ?? ""}
                        onChange={(cgroupRoot) => patch({ cgroupRoot })} placeholder="/sys/fs/cgroup/yuhaiin/ssh/..." />
                    <p className="text-xs text-ui-muted">{uiT("sshCgroupRootHelp")}</p>
                    <SwitchCard label={uiT("sshEnableIPv6")} checked={value.ipv6}
                        onCheckedChange={(ipv6) => patch({ ipv6 })} />
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <SettingInputVertical label={uiT("sshGatewayIPv4")} value={value.gatewayIPv4 ?? ""}
                            onChange={(gatewayIPv4) => patch({ gatewayIPv4 })} placeholder="172.31.254.1" />
                        <SettingInputVertical label={uiT("sshSessionIPv4")} value={value.sessionIPv4 ?? ""}
                            onChange={(sessionIPv4) => patch({ sessionIPv4 })} placeholder="172.31.254.2/30" />
                        {value.ipv6 && <>
                            <SettingInputVertical label={uiT("sshGatewayIPv6")} value={value.gatewayIPv6 ?? ""}
                                onChange={(gatewayIPv6) => patch({ gatewayIPv6 })} placeholder="fd42:7d2a:9b31::1" />
                            <SettingInputVertical label={uiT("sshSessionIPv6")} value={value.sessionIPv6 ?? ""}
                                onChange={(sessionIPv6) => patch({ sessionIPv6 })} placeholder="fd42:7d2a:9b31::2/64" />
                        </>}
                    </div>
                </div>
            </details>
            <SwitchCard label={uiT("sshUnsafeShellAcknowledgement")} description={uiT("sshUnsafeShellWarning")}
                checked={value.allowUnsafeShell}
                onCheckedChange={(allowUnsafeShell) => patch({ allowUnsafeShell })} />
        </div>
    );
};

const SSTPServerEditor: FC<{
    value: Extract<InboundProtocol, { type: "sstp" }>["sstp"];
    onChange: (value: Extract<InboundProtocol, { type: "sstp" }>["sstp"]) => void;
}> = ({ value, onChange }) => {
    const { t: uiT } = useTranslation("ui");
    const patch = (fields: Partial<typeof value>) => onChange({ ...value, ...fields });
    return (
        <div className="grid gap-4">
            <p className="text-sm text-ui-muted">{uiT("sstpRootlessHelp")}</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SettingInputVertical label={uiT("sstpServerAddress")} value={value.serverAddress}
                    onChange={(serverAddress) => patch({ serverAddress })} placeholder="10.90.0.1" />
                <SettingInputVertical label={uiT("sstpDNS")} value={value.dns ?? ""}
                    onChange={(dns) => patch({ dns })} placeholder="1.1.1.1" />
                <SettingInputVertical label="MTU" type="number" min={576} max={4000} step={1}
                    value={String(value.mtu ?? 1400)} onChange={(mtu) => patch({ mtu: numberValue(mtu) })} />
                <SettingInputVertical label={uiT("sstpMaxSessions")} type="number" min={1} max={1024} step={1}
                    value={String(value.maxSessions ?? value.clientAddresses.length)}
                    onChange={(maxSessions) => patch({ maxSessions: numberValue(maxSessions) })} />
            </div>
            <InputList title={uiT("sstpClientAddresses")} data={value.clientAddresses}
                onChange={(clientAddresses) => patch({ clientAddresses })} />
            <p className="text-xs text-ui-muted">{uiT("sstpAddressHint")}</p>
            <FormSection title={uiT("sstpTLSCertificate")}>
                <ServerTLSConfigEditor value={value.tls} showNextProtos={false} onChange={(tls) => patch({ tls })} />
            </FormSection>
            <p className="text-xs text-ui-muted">{uiT("sstpCredentialsHelp")}</p>
        </div>
    );
};

const WireguardServerEditor: FC<{
    value: Extract<InboundProtocol, { type: "wireguard" }>["wireguard"];
    onChange: (value: Extract<InboundProtocol, { type: "wireguard" }>["wireguard"]) => void;
}> = ({ value, onChange }) => {
    const { t: uiT } = useTranslation("ui");
    const peers = value.peers ?? [];
    const patch = (fields: Partial<typeof value>) => onChange({ ...value, ...fields });
    const updatePeer = (index: number, fields: Partial<(typeof peers)[number]>) =>
        patch({ peers: peers.map((peer, i) => i === index ? { ...peer, ...fields } : peer) });

    return (
        <div className="grid gap-4">
            <p className="text-sm text-ui-muted">{uiT("wgNoSystemTun")}</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SettingInputVertical label={uiT("wgPrivateKey")} type="password" value={value.privateKey}
                    onChange={(privateKey) => patch({ privateKey })} />
                <SettingInputVertical label={uiT("wgListenPort")} type="number" min={1} max={65535}
                    value={String(value.listenPort)} onChange={(listenPort) => patch({ listenPort: numberValue(listenPort) })} />
                <SettingInputVertical label="MTU" type="number" min={576} max={65535}
                    value={String(value.mtu ?? 1420)} onChange={(mtu) => patch({ mtu: numberValue(mtu) })} />
            </div>
            <InputList title={uiT("wgServerAddresses")} data={value.addresses ?? []}
                onChange={(addresses) => patch({ addresses })} />
            <p className="text-xs text-ui-muted">{uiT("wgAddressesHint")}</p>
            <div className="flex items-center justify-between gap-3">
                <SettingLabel className="mb-0">{uiT("wgPeers")}</SettingLabel>
                <Button size="sm" onClick={() => patch({ peers: [...peers, { publicKey: "", preSharedKey: "", allowedIps: [] }] })}>
                    <Plus size={16} className="mr-1" />{uiT("add")}
                </Button>
            </div>
            {peers.map((peer, index) => (
                <div key={index} className="grid gap-4 rounded-ui-lg border border-ui-border p-4">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold">{uiT("wgPeer")} #{index + 1}</span>
                        <Button size="icon" variant="outline-danger"
                            aria-label={`${uiT("delete")} ${uiT("wgPeer")} ${index + 1}`}
                            onClick={() => patch({ peers: peers.filter((_, i) => i !== index) })}>
                            <Trash size={16} />
                        </Button>
                    </div>
                    <SettingInputVertical label={uiT("wgPublicKey")} value={peer.publicKey}
                        onChange={(publicKey) => updatePeer(index, { publicKey })} />
                    <SettingInputVertical label={uiT("wgPresharedKey")} type="password" value={peer.preSharedKey ?? ""}
                        onChange={(preSharedKey) => updatePeer(index, { preSharedKey })} />
                    <InputList title={uiT("wgAllowedIps")} data={peer.allowedIps}
                        onChange={(allowedIps) => updatePeer(index, { allowedIps })} />
                </div>
            ))}
            <p className="text-xs text-ui-muted">{uiT("wgSecurityHint")}</p>
        </div>
    );
};

const TunEditor: FC<{
    value: Extract<InboundProtocol, { type: "tun" }>["tun"];
    onChange: (value: Extract<InboundProtocol, { type: "tun" }>["tun"]) => void;
    platform?: string;
}> = ({ value, onChange, platform }) => {
    const { t: uiT } = useTranslation('ui');
    const patch = (patchValue: Partial<typeof value>) => onChange({
        ...value, ...patchValue, stack: "lightweight", driver: "channel",
    });
    const patchDarwin = (fields: Partial<NonNullable<typeof value.darwin>>) => patch({
        darwin: { experimentalBatch: false, batchSize: 32, pendingPackets: 32, ...value.darwin, ...fields },
    });
    return (
        <div className="grid gap-4">
            <div className="grid gap-3 rounded-ui-lg border border-ui-border p-4">
                <TCPSettingsEditor defaultCongestion="cubic"
                    value={{ congestionControl: value.congestionControl, lossRecovery: value.lossRecovery }}
                    onChange={(settings) => patch(settings)} />
                <SettingSelectVertical
                    label={uiT("tunOutputScheduler")}
                    value={value.outputScheduler || "fifo"}
                    values={[[uiT("tunOutputSchedulerFIFO"), "fifo"], [uiT("tunOutputSchedulerFair"), "fq_codel"]]}
                    onChange={(outputScheduler) => patch({ outputScheduler })}
                />
                <p className="text-xs text-ui-muted">{uiT("tunOutputSchedulerHint")}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingInputVertical label={uiT("name")} value={value.name} onChange={(name) => patch({ name })} />
                <SettingInputVertical label="MTU" type="number" min={576} max={65535} step={1} value={String(value.mtu)} onChange={(mtu) => patch({ mtu: numberValue(mtu) })} />
                <SettingInputVertical label={uiT("portalIpv4")} value={value.portal} onChange={(portal) => patch({ portal })} />
                <SettingInputVertical label={uiT("portalIpv6")} value={value.portalV6} onChange={(portalV6) => patch({ portalV6 })} />
            </div>
            <SwitchCard label={uiT("forceFakeip")} checked={value.forceFakeIp} onCheckedChange={(forceFakeIp) => patch({ forceFakeIp })} />
            <SwitchCard label={uiT("skipMulticast")} checked={value.skipMulticast} onCheckedChange={(skipMulticast) => patch({ skipMulticast })} />
            <SwitchCard label={uiT("autoFakeIpRoute")} description={uiT("autoFakeIpRouteDescription")} checked={value.autoFakeIpRoute ?? false} onCheckedChange={(autoFakeIpRoute) => patch({ autoFakeIpRoute })} />
            {platform === "darwin" && <FormSection title="macOS">
                <SwitchCard label={uiT("tunDarwinBatch")} description={uiT("tunDarwinBatchDescription")}
                    checked={value.darwin?.experimentalBatch ?? false}
                    onCheckedChange={(experimentalBatch) => patchDarwin({ experimentalBatch })} />
                {value.darwin?.experimentalBatch && <>
                    <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                        <SettingSelectVertical label={uiT("tunDarwinBatchSize")} value={String(value.darwin.batchSize || 32)} values={["1", "16", "32", "64", "128"]}
                            onChange={(batchSize) => patchDarwin({ batchSize: Number(batchSize) })} />
                        <SettingSelectVertical label={uiT("tunDarwinPendingPackets")} value={String(value.darwin.pendingPackets || value.darwin.batchSize || 32)} values={["1", "16", "32", "64", "128"]}
                            onChange={(pendingPackets) => patchDarwin({ pendingPackets: Number(pendingPackets) })} />
                    </div>
                    <p className="text-xs text-ui-muted">{uiT("tunDarwinPendingHint")}</p>
                </>}
            </FormSection>}
            <InputList title={uiT("routes")} data={value.routes} onChange={(routes) => patch({ routes })} />
            <InputList title={uiT("inboundEditor.excludes")} data={value.excludes} onChange={(excludes) => patch({ excludes })} />
            <InputList secret executable title={uiT("postUp")} data={value.postUp} onChange={(postUp) => patch({ postUp })} />
            <InputList secret executable title={uiT("postDown")} data={value.postDown} onChange={(postDown) => patch({ postDown })} />
        </div>
    );
};

function defaultCertificate(): Certificate {
    return { certBase64: "", keyBase64: "", certFile: "", keyFile: "" };
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
                <BytesTextarea secret
                    label={uiT("privateKeyPem")}
                    valueBase64={value.keyBase64}
                    onChangeBase64={(keyBase64) => patch({ keyBase64 })}
                />
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingInputVertical label={uiT("certFile")} value={value.certFile} onChange={(certFile) => patch({ certFile })} />
                <SettingInputVertical secret label={uiT("keyFile")} value={value.keyFile} onChange={(keyFile) => patch({ keyFile })} />
            </div>
        </div>
    );
};

const BytesTextarea: FC<{
    label: string;
    valueBase64: string | undefined;
    secret?: boolean;
    onChangeBase64: (value: string) => void;
    rows?: number;
    readOnly?: boolean;
}> = ({ label, valueBase64, onChangeBase64, rows = 4, readOnly, secret }) => {
    const text = new TextDecoder().decode(base64ToBytes(valueBase64));
    return (
        <div>
            <SettingLabel className="mb-2 block">{label}</SettingLabel>
            <Textarea code secret={secret}
                value={text}
                readOnly={readOnly}
                onChange={(event) => onChangeBase64(bytesToBase64(new TextEncoder().encode(event.target.value)))}
                rows={rows}
                
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
    showNextProtos?: boolean;
    onChange: (value: ServerTLSConfig) => void;
}> = ({ value, showNextProtos = true, onChange }) => {
    const { t: uiT } = useTranslation('ui');

    const current = value ?? defaultServerTLS();
    const patch = (patchValue: Partial<ServerTLSConfig>) => onChange({ ...current, ...patchValue });
    return (
        <div className="grid gap-4">
            {showNextProtos && <InputList title={uiT("nextProtos")} data={current.nextProtos ?? []} onChange={(nextProtos) => patch({ nextProtos })} />}
            <CertificateListEditor value={current.certificates ?? []} onChange={(certificates) => patch({ certificates })} />
            <NamedCertificateEditor value={current.serverNameCertificate} onChange={(serverNameCertificate) => patch({ serverNameCertificate })} />
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

    const labels = useTypeLabels();
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

    const title = uiT("transport");
    const fixed = (message: string) => <FormSection title={title}><p className="text-sm text-ui-muted">{message}</p></FormSection>;
    if (inbound.protocol.type === "ssh") return fixed(uiT("sshNoExtraTransports"));
    if (inbound.protocol.type === "sstp") return fixed(uiT("sstpNoExtraTransports"));
    if (inbound.protocol.type === "wireguard") return fixed(uiT("wgNoExtraTransports"));
    if (inbound.protocol.type === "hysteria2") return <FormSection title={title}><HysteriaTLSSection inbound={inbound} onChange={onChange} /></FormSection>;

    const add = (type: InboundTransport["type"]) => onChange(normalizeInbound({ ...inbound, transports: [...transports, createDefaultTransport(type)] }));
    return (
        <FormSection title={title} description={uiT("inboundEditor.transportHelp")}
            actions={<Dropdown>
                <DropdownTrigger asChild>
                    <Button size="sm" variant="outline-secondary" className="gap-1.5"><Plus size={15} />{uiT("inboundEditor.addTransport")}</Button>
                </DropdownTrigger>
                <DropdownContent align="end" className="w-auto min-w-[200px]">
                    {transportTypes.map(type => <DropdownItem key={type} onSelect={() => add(type)}>{labels.transport(type)}</DropdownItem>)}
                </DropdownContent>
            </Dropdown>}>
            {transports.length === 0 ? (
                <p className="text-sm text-ui-muted">{uiT("inboundEditor.noTransports")}</p>
            ) : (
                <>
                    <p aria-label={uiT("inboundEditor.transportOrder")} className="flex flex-wrap items-center gap-1 text-xs text-ui-muted">
                        <span>{uiT("inboundEditor.client")}</span>
                        {transports.map((transport, index) => <span key={index} className="inline-flex items-center gap-1">
                            <ChevronRight size={12} aria-hidden="true" />
                            <span className="rounded-full border border-ui-border px-2 py-0.5 font-medium text-ui-secondary">{labels.transport(transport.type)}</span>
                        </span>)}
                        <ChevronRight size={12} aria-hidden="true" />
                        <span>{labels.protocol(inbound.protocol.type)}</span>
                    </p>
                    <Accordion type="multiple" defaultValue={["transport-0"]}>
                        {transports.map((transport, index) => (
                            <AccordionItem value={`transport-${index}`} key={`${index}-${transport.type}`}>
                                <AccordionTrigger>
                                    <span className="flex min-w-0 items-center gap-3">
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-ui-border text-xs font-medium tabular-nums text-ui-secondary">
                                            {index + 1}
                                        </span>
                                        <span className="truncate font-medium">{labels.transport(transport.type)}</span>
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <TransportEditor value={transport} onChange={(value) => changeTransport(index, value)} />
                                    <div className="mt-4 flex justify-end gap-2 border-t border-ui-border pt-4">
                                        <Button size="sm" variant="outline-secondary" aria-label={uiT("inboundEditor.moveUp")} title={uiT("inboundEditor.moveUp")} onClick={() => moveTransport(index, -1)} disabled={index === 0}>
                                            <ArrowUp size={16} />
                                        </Button>
                                        <Button size="sm" variant="outline-secondary" aria-label={uiT("inboundEditor.moveDown")} title={uiT("inboundEditor.moveDown")} onClick={() => moveTransport(index, 1)} disabled={index === transports.length - 1}>
                                            <ArrowDown size={16} />
                                        </Button>
                                        <Button variant="outline-danger" size="sm" onClick={() => removeTransport(index)}>
                                            <Trash className="mr-1" size={16} /> {uiT("delete")}</Button>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </>
            )}
        </FormSection>
    );
};

const HysteriaTLSSection: FC<{
    inbound: Inbound;
    onChange: (value: Inbound) => void;
}> = ({ inbound, onChange }) => {
    const { t: uiT } = useTranslation('ui');
    const certificate = inbound.transports.find(item => item.type === "tls" || item.type === "tls_auto");
    const labels = useTypeLabels();
    // Nothing is selected until a certificate source is chosen.
    const selected = certificate?.type ?? "";
    return (
        <div className="grid gap-4">
            <p className="text-sm text-ui-muted">{uiT("hysteria2ServerHelp")}</p>
            <Segmented label={uiT("type")} value={selected} items={(["tls_auto", "tls"] as const).map(type => ({ value: type, label: labels.transport(type) }))}
                onChange={(type) => onChange(normalizeInbound({ ...inbound, transports: [createDefaultTransport(type as "tls" | "tls_auto")] }))} />
            {certificate && <TransportConfigEditor value={certificate} showNextProtos={false}
                onChange={(value) => onChange(normalizeInbound({ ...inbound, transports: [value] }))} />}
        </div>
    );
};

const TransportConfigEditor: FC<{
    value: InboundTransport;
    showNextProtos?: boolean;
    onChange: (value: InboundTransport) => void;
}> = ({ value, showNextProtos = true, onChange }) => {
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
                <ServerTLSConfigEditor value={value.tls.tls} showNextProtos={showNextProtos} onChange={(tls) => onChange({ ...value, tls: { tls } })} />
            );
        case "reality":
            return (
                <div className="grid gap-4">
                    <InputList secret title={uiT("shortIds")} data={value.reality.shortIds} onChange={(shortIds) => onChange({ ...value, reality: { ...value.reality, shortIds } })} />
                    <InputList title={uiT("serverNames")} data={value.reality.serverNames} onChange={(serverNames) => onChange({ ...value, reality: { ...value.reality, serverNames } })} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SettingInputVertical label={uiT("destination")} value={value.reality.dest} onChange={(dest) => onChange({ ...value, reality: { ...value.reality, dest } })} />
                        <SettingInputVertical secret label={uiT("privateKey")} value={value.reality.privateKey} onChange={(privateKey) => onChange({ ...value, reality: { ...value.reality, privateKey } })} />
                        <SettingInputVertical label={uiT("publicKey")} value={value.reality.publicKey} onChange={(publicKey) => onChange({ ...value, reality: { ...value.reality, publicKey } })} />
                        <SettingInputVertical label={uiT("mldsa65Seed")} value={value.reality.mldsa65Seed} onChange={(mldsa65Seed) => onChange({ ...value, reality: { ...value.reality, mldsa65Seed } })} />
                    </div>
                    <SwitchCard label={uiT("debug")} checked={value.reality.debug} onCheckedChange={(debug) => onChange({ ...value, reality: { ...value.reality, debug } })} />
                </div>
            );
        case "tls_auto":
            return (
                <div className="grid gap-4">
                    {showNextProtos && <InputList title={uiT("nextProtos")} data={value.tls_auto.nextProtos} onChange={(nextProtos) => onChange({ ...value, tls_auto: { ...value.tls_auto, nextProtos } })} />}
                    <InputList title={uiT("serverNames")} data={value.tls_auto.serverNames} onChange={(serverNames) => onChange({ ...value, tls_auto: { ...value.tls_auto, serverNames } })} />
                    <ECHConfigEditor value={value.tls_auto.ech} onChange={(ech) => onChange({ ...value, tls_auto: { ...value.tls_auto, ech } })} />
                    <BytesTextarea
                        label={uiT("caCert")}
                        valueBase64={value.tls_auto.caCertBase64}
                        onChangeBase64={(caCertBase64) => onChange({ ...value, tls_auto: { ...value.tls_auto, caCertBase64 } })}
                        readOnly
                    />
                    <BytesTextarea secret
                        label={uiT("caKey")}
                        valueBase64={value.tls_auto.caKeyBase64}
                        onChangeBase64={(caKeyBase64) => onChange({ ...value, tls_auto: { ...value.tls_auto, caKeyBase64 } })}
                        readOnly
                    />
                </div>
            );
        case "http_mock":
            return <Textarea code className="min-h-[120px]" value={value.http_mock.dataBase64} onChange={(event) => onChange({ ...value, http_mock: { dataBase64: event.target.value } })} placeholder={uiT("base64MockResponseData")} />;
        case "aead":
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SettingInputVertical label={uiT("password")} value={value.aead.password} onChange={(password) => onChange({ ...value, aead: { ...value.aead, password } })} />
                    <SettingInputVertical label={uiT("cryptoMethod")} value={value.aead.cryptoMethod} onChange={(cryptoMethod) => onChange({ ...value, aead: { ...value.aead, cryptoMethod } })} />
                </div>
            );
    }
};

export { InboundEditor, ProtocolConfigEditor };
