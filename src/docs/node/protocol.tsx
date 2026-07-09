"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/component/v2/accordion";
import { Badge } from "@/component/v2/badge";
import { Button } from "@/component/v2/button";
import { Card, CardBody } from "@/component/v2/card";
import { Select, SettingInputVertical } from "@/component/v2/forms";
import { create } from "@/common/plain";
import { ArrowDown, ArrowUp, Plus, Trash } from "lucide-react";
import { FC, useEffect, useState } from 'react';
import { point } from "../schema/node/point";
import {
    aeadSchema,
    cloudflare_warp_masqueSchema,
    directSchema,
    dropSchema,
    fixedSchema,
    fixedv2Schema,
    http2Schema,
    http_mockSchema,
    http_terminationSchema,
    httpSchema,
    muxSchema,
    network_split,
    network_splitSchema,
    noneSchema,
    obfs_httpSchema,
    point_as_endpointSchema,
    protocol,
    protocolSchema,
    proxySchema,
    quicSchema,
    realitySchema,
    setSchema,
    shadowsocksrSchema,
    shadowsocksSchema,
    socks5Schema,
    tailscaleSchema,
    tls_configSchema,
    tls_server_configSchema,
    tls_terminationSchema,
    trojanSchema,
    vlessSchema,
    vmessSchema,
    websocketSchema,
    wireguardSchema,
    yuubinsyaSchema
} from "../schema/node/protocol";
import { Aead } from "./aead";
import { BootstrapDnsWarp } from "./bootstrap_dns_warp";
import { CloudflareWarpMasque } from "./cloudflare_warp_masque";
import { Directv2 } from "./direct";
import { Dropv2 } from './drop';
import { Fixed as Fixedv2 } from "./fixedv2";
import { HTTPv2, UnWrapHttp } from "./http";
import { HTTP2v2 } from "./http2";
import { HttpMock } from "./mock";
import { Muxv2 } from "./mux";
import { Nonev2 } from './none';
import { PointAsEndpoint } from "./point_as_endpoint";
import { Proxy } from "./proxy";
import { Quicv2 } from "./quic";
import { Realityv2 } from "./reality";
import { Rejectv2 } from './reject';
import { Set } from "./set";
import { ObfsHttpv2, Shadowsocksv2 } from "./shadowsocks";
import { Shadowsocksrv2 } from "./shadowsocksr";
import { Fixed } from "./simple";
import { Socks5v2 } from "./socks5";
import { Tailscale } from "./tailscale";
import { Tlsv2 } from "./tls";
import { UnWrapTls } from "./tls_server";
import { Props } from './tools';
import { Trojanv2 } from "./trojan";
import { Vlessv2 } from "./vless";
import { Vmessv2 } from "./vmess";
import { Websocketv2 } from "./websocket";
import { Wireguardv2 } from "./wireguard";
import { Yuubinsyav2 } from "./yuubinsta";

const protocolCaseAliases = [
    ["shadowsocks", "shadowsocks"],
    ["shadowsocksr", "shadowsocksr"],
    ["vmess", "vmess"],
    ["websocket", "websocket"],
    ["quic", "quic"],
    ["obfsHttp", "obfs_http"],
    ["trojan", "trojan"],
    ["simple", "simple"],
    ["none", "none"],
    ["socks5", "socks5"],
    ["http", "http"],
    ["direct", "direct"],
    ["reject", "reject"],
    ["yuubinsya", "yuubinsya"],
    ["http2", "http2"],
    ["reality", "reality"],
    ["tls", "tls"],
    ["wireguard", "wireguard"],
    ["mux", "mux"],
    ["drop", "drop"],
    ["vless", "vless"],
    ["bootstrapDnsWarp", "bootstrap_dns_warp"],
    ["tailscale", "tailscale"],
    ["set", "set"],
    ["tlsTermination", "tls_termination"],
    ["httpTermination", "http_termination"],
    ["httpMock", "http_mock"],
    ["aead", "aead"],
    ["fixed", "fixed"],
    ["networkSplit", "network_split"],
    ["cloudflareWarpMasque", "cloudflare_warp_masque"],
    ["proxy", "proxy"],
    ["fixedv2", "fixedv2"],
    ["pointAsEndpoint", "point_as_endpoint"],
] as const;

const protocolJsonName = (caseName: string) => protocolCaseAliases.find(([name]) => name === caseName)?.[1] ?? caseName;

function asRecord(value: unknown): Record<string, unknown> {
    return value !== null && typeof value === "object" ? value as Record<string, unknown> : {};
}

function firstField(value: Record<string, unknown>, ...names: string[]): unknown {
    for (const name of names) {
        const raw = value[name];
        if (raw !== undefined && raw !== null) return raw;
    }
    return undefined;
}

function boolField(value: Record<string, unknown>, ...names: string[]): boolean {
    return Boolean(firstField(value, ...names));
}

function stringField(value: Record<string, unknown>, ...names: string[]): string {
    const raw = firstField(value, ...names);
    return typeof raw === "string" ? raw : "";
}

function stringListField(value: Record<string, unknown>, ...names: string[]): string[] {
    const raw = firstField(value, ...names);
    return Array.isArray(raw) ? raw.filter((item): item is string => typeof item === "string") : [];
}

function numberField(value: Record<string, unknown>, ...names: string[]): number {
    const raw = firstField(value, ...names);
    if (typeof raw === "number" && Number.isFinite(raw)) return raw;
    if (typeof raw === "string" && raw !== "") {
        const parsed = Number(raw);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
}

function arrayField(value: Record<string, unknown>, ...names: string[]): unknown[] {
    const raw = firstField(value, ...names);
    return Array.isArray(raw) ? raw : [];
}

function bytesField(value: Record<string, unknown>, ...names: string[]): Uint8Array {
    const raw = firstField(value, ...names);
    if (raw instanceof Uint8Array) return raw;
    if (Array.isArray(raw)) return Uint8Array.from(raw.filter((item): item is number => typeof item === "number"));
    if (typeof raw !== "string" || raw === "") return new Uint8Array(0);
    try {
        return Uint8Array.from(atob(raw), (char) => char.charCodeAt(0));
    } catch {
        return new TextEncoder().encode(raw);
    }
}

function bytesListField(value: Record<string, unknown>, ...names: string[]): Uint8Array[] {
    const raw = firstField(value, ...names);
    if (!Array.isArray(raw)) return [];
    return raw.map((item) => bytesField({ value: item }, "value"));
}

function bytesToBase64(value: unknown): string {
    if (typeof value === "string") return value;
    const bytes = value instanceof Uint8Array
        ? value
        : Array.isArray(value)
            ? Uint8Array.from(value.filter((item): item is number => typeof item === "number"))
            : new Uint8Array(0);
    let binary = "";
    bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
    return btoa(binary);
}

function normalizeCertificate(value: unknown): Record<string, unknown> {
    const current = asRecord(value);
    return {
        ...current,
        cert: bytesField(current, "cert"),
        key: bytesField(current, "key"),
        certFilePath: stringField(current, "certFilePath", "cert_file_path"),
        keyFilePath: stringField(current, "keyFilePath", "key_file_path"),
    };
}

function toPlainCertificate(value: unknown): Record<string, unknown> {
    const current = normalizeCertificate(value);
    return {
        ...current,
        cert: bytesToBase64(current.cert),
        key: bytesToBase64(current.key),
        cert_file_path: current.certFilePath,
        key_file_path: current.keyFilePath,
    };
}

function normalizeTlsConfig(value: unknown): Record<string, unknown> {
    const current = asRecord(value);
    return {
        ...current,
        enable: boolField(current, "enable"),
        serverNames: stringListField(current, "serverNames", "servernames", "server_names"),
        caCert: bytesListField(current, "caCert", "ca_cert"),
        insecureSkipVerify: boolField(current, "insecureSkipVerify", "insecure_skip_verify"),
        nextProtos: stringListField(current, "nextProtos", "next_protos"),
        echConfig: bytesField(current, "echConfig", "ech_config"),
    };
}

function toPlainTlsConfig(value: unknown): Record<string, unknown> {
    const current = normalizeTlsConfig(value);
    return {
        ...current,
        servernames: current.serverNames,
        ca_cert: Array.isArray(current.caCert) ? current.caCert.map(bytesToBase64) : [],
        insecure_skip_verify: current.insecureSkipVerify,
        next_protos: current.nextProtos,
        ech_config: bytesToBase64(current.echConfig),
    };
}

function normalizeTlsServerConfig(value: unknown): Record<string, unknown> {
    const current = asRecord(value);
    const certs = firstField(current, "certificates");
    const sniCerts = asRecord(firstField(current, "serverNameCertificate", "server_name_certificate"));
    return {
        ...current,
        certificates: Array.isArray(certs) ? certs.map(normalizeCertificate) : [],
        nextProtos: stringListField(current, "nextProtos", "next_protos"),
        serverNameCertificate: Object.fromEntries(Object.entries(sniCerts).map(([name, cert]) => [name, normalizeCertificate(cert)])),
    };
}

function toPlainTlsServerConfig(value: unknown): Record<string, unknown> {
    const current = normalizeTlsServerConfig(value);
    const sniCerts = asRecord(current.serverNameCertificate);
    return {
        ...current,
        certificates: Array.isArray(current.certificates) ? current.certificates.map(toPlainCertificate) : [],
        next_protos: current.nextProtos,
        serverNameCertificate: Object.fromEntries(Object.entries(sniCerts).map(([name, cert]) => [name, toPlainCertificate(cert)])),
    };
}

function normalizeTlsTermination(value: unknown): Record<string, unknown> {
    const current = asRecord(value);
    return {
        ...current,
        tls: normalizeTlsServerConfig(firstField(current, "tls")),
    };
}

function toPlainTlsTermination(value: unknown): Record<string, unknown> {
    const current = normalizeTlsTermination(value);
    return {
        ...current,
        tls: toPlainTlsServerConfig(current.tls),
    };
}

function normalizeHost(value: unknown): Record<string, unknown> {
    const current = asRecord(value);
    return {
        ...current,
        host: stringField(current, "host"),
        port: numberField(current, "port"),
    };
}

function normalizeFixed(value: unknown): Record<string, unknown> {
    const current = asRecord(value);
    return {
        ...current,
        host: stringField(current, "host"),
        networkInterface: stringField(current, "networkInterface", "network_interface"),
        port: numberField(current, "port"),
        alternateHost: arrayField(current, "alternateHost", "alternate_host").map(normalizeHost),
    };
}

function toPlainFixed(value: unknown): Record<string, unknown> {
    const current = normalizeFixed(value);
    return {
        ...current,
        network_interface: current.networkInterface,
        alternate_host: Array.isArray(current.alternateHost) ? current.alternateHost.map(normalizeHost) : [],
    };
}

function normalizeFixedv2Address(value: unknown): Record<string, unknown> {
    const current = asRecord(value);
    return {
        ...current,
        host: stringField(current, "host"),
        networkInterface: stringField(current, "networkInterface", "network_interface"),
    };
}

function toPlainFixedv2Address(value: unknown): Record<string, unknown> {
    const current = normalizeFixedv2Address(value);
    return {
        ...current,
        network_interface: current.networkInterface,
    };
}

function normalizeFixedv2(value: unknown): Record<string, unknown> {
    const current = asRecord(value);
    return {
        ...current,
        addresses: arrayField(current, "addresses").map(normalizeFixedv2Address),
        udpHappyEyeballs: boolField(current, "udpHappyEyeballs", "udp_happy_eyeballs"),
    };
}

function toPlainFixedv2(value: unknown): Record<string, unknown> {
    const current = normalizeFixedv2(value);
    return {
        ...current,
        addresses: Array.isArray(current.addresses) ? current.addresses.map(toPlainFixedv2Address) : [],
        udp_happy_eyeballs: current.udpHappyEyeballs,
    };
}

function normalizeWireguardPeer(value: unknown): Record<string, unknown> {
    const current = asRecord(value);
    return {
        ...current,
        publicKey: stringField(current, "publicKey", "public_key"),
        preSharedKey: stringField(current, "preSharedKey", "pre_shared_key"),
        endpoint: stringField(current, "endpoint"),
        keepAlive: numberField(current, "keepAlive", "keep_alive"),
        allowedIps: stringListField(current, "allowedIps", "allowed_ips"),
    };
}

function toPlainWireguardPeer(value: unknown): Record<string, unknown> {
    const current = normalizeWireguardPeer(value);
    return {
        ...current,
        publicKey: current.publicKey,
        preSharedKey: current.preSharedKey,
        keepAlive: current.keepAlive,
        allowedIps: current.allowedIps,
    };
}

function normalizeWireguard(value: unknown): Record<string, unknown> {
    const current = asRecord(value);
    return {
        ...current,
        secretKey: stringField(current, "secretKey", "secret_key"),
        endpoint: stringListField(current, "endpoint"),
        peers: arrayField(current, "peers").map(normalizeWireguardPeer),
        mtu: numberField(current, "mtu"),
        reserved: bytesField(current, "reserved"),
    };
}

function toPlainWireguard(value: unknown): Record<string, unknown> {
    const current = normalizeWireguard(value);
    return {
        ...current,
        secretKey: current.secretKey,
        endpoint: current.endpoint,
        peers: Array.isArray(current.peers) ? current.peers.map(toPlainWireguardPeer) : [],
        mtu: current.mtu,
        reserved: bytesToBase64(current.reserved),
    };
}

function normalizeSet(value: unknown): Record<string, unknown> {
    const current = asRecord(value);
    return {
        ...current,
        nodes: stringListField(current, "nodes"),
        strategy: numberField(current, "strategy"),
    };
}

function normalizeDirect(value: unknown): Record<string, unknown> {
    const current = asRecord(value);
    return {
        ...current,
        networkInterface: stringField(current, "networkInterface", "network_interface"),
    };
}

function toPlainDirect(value: unknown): Record<string, unknown> {
    const current = normalizeDirect(value);
    return {
        ...current,
        network_interface: current.networkInterface,
    };
}

function normalizeSocks5(value: unknown): Record<string, unknown> {
    const current = asRecord(value);
    return {
        ...current,
        hostname: stringField(current, "hostname"),
        user: stringField(current, "user"),
        password: stringField(current, "password"),
        overridePort: numberField(current, "overridePort", "override_port"),
    };
}

function toPlainSocks5(value: unknown): Record<string, unknown> {
    const current = normalizeSocks5(value);
    return {
        ...current,
        override_port: current.overridePort,
    };
}

function normalizeVmess(value: unknown): Record<string, unknown> {
    const current = asRecord(value);
    return {
        ...current,
        uuid: stringField(current, "uuid", "id"),
        alterId: stringField(current, "alterId", "aid"),
        security: stringField(current, "security"),
    };
}

function toPlainVmess(value: unknown): Record<string, unknown> {
    const current = normalizeVmess(value);
    return {
        ...current,
        id: current.uuid,
        aid: current.alterId,
    };
}

function normalizeYuubinsya(value: unknown): Record<string, unknown> {
    const current = asRecord(value);
    return {
        ...current,
        password: stringField(current, "password"),
        udpOverStream: boolField(current, "udpOverStream", "udp_over_stream"),
        udpCoalesce: boolField(current, "udpCoalesce", "udp_coalesce"),
    };
}

function toPlainYuubinsya(value: unknown): Record<string, unknown> {
    const current = normalizeYuubinsya(value);
    return {
        ...current,
        udp_over_stream: current.udpOverStream,
        udp_coalesce: current.udpCoalesce,
    };
}

function normalizeReality(value: unknown): Record<string, unknown> {
    const current = asRecord(value);
    return {
        ...current,
        serverName: stringField(current, "serverName", "server_name"),
        publicKey: stringField(current, "publicKey", "public_key"),
        mldsa65Verify: stringField(current, "mldsa65Verify", "mldsa65_verify"),
        shortId: stringField(current, "shortId", "short_id"),
        debug: boolField(current, "debug"),
    };
}

function toPlainReality(value: unknown): Record<string, unknown> {
    const current = normalizeReality(value);
    return {
        ...current,
        server_name: current.serverName,
        public_key: current.publicKey,
        mldsa65_verify: current.mldsa65Verify,
        short_id: current.shortId,
    };
}

function normalizeConcurrency(value: unknown): Record<string, unknown> {
    const current = asRecord(value);
    return {
        ...current,
        concurrency: numberField(current, "concurrency"),
    };
}

function normalizeHttpMock(value: unknown): Record<string, unknown> {
    const current = asRecord(value);
    return {
        ...current,
        data: bytesField(current, "data"),
    };
}

function toPlainHttpMock(value: unknown): Record<string, unknown> {
    const current = normalizeHttpMock(value);
    return {
        ...current,
        data: bytesToBase64(current.data),
    };
}

function normalizeAead(value: unknown): Record<string, unknown> {
    const current = asRecord(value);
    return {
        ...current,
        password: stringField(current, "password"),
        cryptoMethod: numberField(current, "cryptoMethod", "crypto_method"),
    };
}

function toPlainAead(value: unknown): Record<string, unknown> {
    const current = normalizeAead(value);
    return {
        ...current,
        crypto_method: current.cryptoMethod,
    };
}

function normalizeCloudflareWarpMasque(value: unknown): Record<string, unknown> {
    const current = asRecord(value);
    return {
        ...current,
        privateKey: stringField(current, "privateKey", "private_key"),
        endpoint: stringField(current, "endpoint"),
        endpointPublicKey: stringField(current, "endpointPublicKey", "endpoint_public_key"),
        localAddresses: stringListField(current, "localAddresses", "local_addresses"),
        mtu: numberField(current, "mtu"),
    };
}

function toPlainCloudflareWarpMasque(value: unknown): Record<string, unknown> {
    const current = normalizeCloudflareWarpMasque(value);
    return {
        ...current,
        private_key: current.privateKey,
        endpoint_public_key: current.endpointPublicKey,
        local_addresses: current.localAddresses,
    };
}

function normalizeTailscale(value: unknown): Record<string, unknown> {
    const current = asRecord(value);
    return {
        ...current,
        authKey: stringField(current, "authKey", "auth_key"),
        hostname: stringField(current, "hostname"),
        controlUrl: stringField(current, "controlUrl", "control_url"),
        debug: boolField(current, "debug"),
    };
}

function toPlainTailscale(value: unknown): Record<string, unknown> {
    const current = normalizeTailscale(value);
    return {
        ...current,
        auth_key: current.authKey,
        control_url: current.controlUrl,
    };
}

function normalizeNetworkSplit(value: network_split | undefined): network_split {
    const current = value ?? {};
    return {
        ...current,
        tcp: current.tcp ? normalizeProtocol(current.tcp) : undefined,
        udp: current.udp ? normalizeProtocol(current.udp) : undefined,
    };
}

function normalizeProtocolValue(caseName: string, value: unknown): unknown {
    if (caseName === "networkSplit") return normalizeNetworkSplit(value as network_split | undefined);
    if (caseName === "direct") return normalizeDirect(value);
    if (caseName === "socks5") return normalizeSocks5(value);
    if (caseName === "vmess") return normalizeVmess(value);
    if (caseName === "yuubinsya") return normalizeYuubinsya(value);
    if (caseName === "reality") return normalizeReality(value);
    if (caseName === "http2" || caseName === "mux") return normalizeConcurrency(value);
    if (caseName === "fixed" || caseName === "simple") return normalizeFixed(value);
    if (caseName === "fixedv2") return normalizeFixedv2(value);
    if (caseName === "wireguard") return normalizeWireguard(value);
    if (caseName === "set") return normalizeSet(value);
    if (caseName === "httpMock") return normalizeHttpMock(value);
    if (caseName === "aead") return normalizeAead(value);
    if (caseName === "cloudflareWarpMasque") return normalizeCloudflareWarpMasque(value);
    if (caseName === "tailscale") return normalizeTailscale(value);
    if (caseName === "tls") return normalizeTlsConfig(value);
    if (caseName === "quic") {
        const current = asRecord(value);
        return { ...current, tls: normalizeTlsConfig(firstField(current, "tls")) };
    }
    if (caseName === "tlsTermination") return normalizeTlsTermination(value);
    return value ?? {};
}

export function normalizeProtocol(value: protocol | undefined): protocol {
    const current = value ?? {};
    if (current.protocol?.case) {
        return {
            ...current,
            protocol: {
                ...current.protocol,
                value: normalizeProtocolValue(current.protocol.case, current.protocol.value),
            },
        };
    }

    for (const [caseName, jsonName] of protocolCaseAliases) {
        const raw = current[caseName] ?? current[jsonName];
        if (raw !== undefined && raw !== null) {
            return {
                ...current,
                protocol: {
                    case: caseName,
                    value: normalizeProtocolValue(caseName, raw),
                },
            };
        }
    }

    return { ...current, protocol: { case: "none", value: create(noneSchema, {}) } };
}

export function normalizePoint(value: point | undefined): point {
    const current = value ?? {};
    return {
        ...current,
        protocols: Array.isArray(current.protocols) ? current.protocols.map(normalizeProtocol) : [],
    };
}

function toPlainProtocolValue(caseName: string, value: unknown): unknown {
    if (caseName === "direct") return toPlainDirect(value);
    if (caseName === "socks5") return toPlainSocks5(value);
    if (caseName === "vmess") return toPlainVmess(value);
    if (caseName === "yuubinsya") return toPlainYuubinsya(value);
    if (caseName === "reality") return toPlainReality(value);
    if (caseName === "http2" || caseName === "mux") return normalizeConcurrency(value);
    if (caseName === "fixed" || caseName === "simple") return toPlainFixed(value);
    if (caseName === "fixedv2") return toPlainFixedv2(value);
    if (caseName === "wireguard") return toPlainWireguard(value);
    if (caseName === "set") return normalizeSet(value);
    if (caseName === "httpMock") return toPlainHttpMock(value);
    if (caseName === "aead") return toPlainAead(value);
    if (caseName === "cloudflareWarpMasque") return toPlainCloudflareWarpMasque(value);
    if (caseName === "tailscale") return toPlainTailscale(value);
    if (caseName === "tls") return toPlainTlsConfig(value);
    if (caseName === "quic") {
        const current = asRecord(value);
        return { ...current, tls: toPlainTlsConfig(firstField(current, "tls")) };
    }
    if (caseName === "tlsTermination") return toPlainTlsTermination(value);
    if (caseName !== "networkSplit") return value ?? {};

    const current = normalizeNetworkSplit(value as network_split | undefined);
    return {
        ...current,
        tcp: current.tcp ? toPlainProtocol(current.tcp) : undefined,
        udp: current.udp ? toPlainProtocol(current.udp) : undefined,
    };
}

export function toPlainProtocol(value: protocol | undefined): protocol {
    const current = normalizeProtocol(value);
    const next: Record<string, unknown> = { ...current };
    delete next.protocol;
    for (const [caseName, jsonName] of protocolCaseAliases) {
        delete next[caseName];
        delete next[jsonName];
    }
    next[protocolJsonName(current.protocol.case)] = toPlainProtocolValue(current.protocol.case, current.protocol.value);
    return next;
}

export function toPlainPoint(value: point | undefined): point {
    const current = normalizePoint(value);
    return {
        ...current,
        protocols: current.protocols.map(toPlainProtocol),
    };
}


export const Point: FC<{ value: point, onChange: (x: point) => void, groups?: string[], editable?: boolean }> =
    ({ value, onChange, groups, editable = true }) => {
        const current = normalizePoint(value);
        const [newProtocol, setNewProtocol] = useState(Object.keys(protocols)[0]);

        const moveProtocol = (index: number, direction: 'up' | 'down') => {
            if (!editable) return
            const next = [...current.protocols];
            if (direction === 'up') {
                if (index === 0) return;
                [next[index - 1], next[index]] = [next[index], next[index - 1]];
            } else {
                if (index === next.length - 1) return;
                [next[index], next[index + 1]] = [next[index + 1], next[index]];
            }
            onChange({ ...current, protocols: next });
        };

        const deleteProtocol = (index: number) => {
            if (!editable) return
            const next = [...current.protocols];
            next.splice(index, 1);
            onChange({ ...current, protocols: next });
        };

        return <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div>
                    <SettingInputVertical
                        label="Name"
                        value={current.name ?? ""}
                        disabled={!editable}
                        onChange={(e: string) => { onChange({ ...current, name: e }) }}
                    />
                </div>
                <div>
                    <SettingInputVertical
                        label="Group"
                        value={current.group ?? ""}
                        disabled={!editable}
                        onChange={(e: string) => { onChange({ ...current, group: e }) }}
                        reminds={groups ? groups.map(x => ({ label: x, value: x })) : undefined}
                    />
                </div>
            </div>

            <div className="mb-3">
                <div className="flex justify-between items-center mb-2 px-1">
                    <h6 className="font-bold mb-0 opacity-75">Protocol Chain</h6>
                    <small className="text-gray-500 dark:text-gray-400">{current.protocols.length} steps</small>
                </div>

                <Accordion type="multiple" className="mb-3">
                    {
                        current.protocols.map((x, i) => {
                            return (
                                <AccordionItem value={`item-${i}`} key={i}>
                                    <AccordionTrigger>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="primary" pill className="text-[0.7rem] px-2">
                                                {i + 1}
                                            </Badge>
                                            {x.protocol.case ?? "Unknown"}
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="p-1">
                                            <Protocol value={current.protocols[i]} editable={editable} onChange={(e) => {
                                                const next = [...current.protocols];
                                                next[i] = e;
                                                onChange({ ...current, protocols: next })
                                            }} />

                                            {editable && (
                                                <div className="flex justify-end gap-2 mt-3 pt-3">
                                                    <Button size="sm" onClick={() => moveProtocol(i, 'up')} disabled={i === 0}>
                                                        <ArrowUp size={16} />
                                                    </Button>
                                                    <Button size="sm" onClick={() => moveProtocol(i, 'down')} disabled={i === current.protocols.length - 1}>
                                                        <ArrowDown size={16} />
                                                    </Button>
                                                    <Button variant="outline-danger" size="sm" onClick={() => deleteProtocol(i)}>
                                                        <Trash size={16} className="me-2" /> Delete
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            )
                        })
                    }
                </Accordion>

                {editable && (
                    <div className="bg-gray-100 dark:bg-[#2b2b40] p-3 rounded-lg flex items-end gap-3 flex-wrap sm:flex-nowrap">
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-bold opacity-75 mb-2">New Protocol Step</label>
                            <Select
                                value={newProtocol}
                                onValueChange={(e) => setNewProtocol(e)}
                                items={Object.keys(protocols).map(v => ({ value: v, label: v }))}
                            />
                        </div>
                        <Button
                            className="mb-1"
                            style={{ height: '35px' }}
                            onClick={() => {
                                onChange({ ...current, protocols: [...current.protocols, protocols[newProtocol]] })
                            }}
                        >
                            <Plus className="mr-1" size={16} /> Add Step
                        </Button>
                    </div>
                )}
            </div>
        </>
    }

const Protocol: FC<Props<protocol>> = ({ value, onChange, editable = true }) => {
    const current = normalizeProtocol(value);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const update = (data: any) => onChange({ ...current, protocol: { ...current.protocol, value: data } })

    useEffect(() => {
        if (!editable) return
        switch (current.protocol.case) {
            case "simple":
                onChange(create(protocolSchema, {
                    protocol: {
                        case: "fixed",
                        value: create(fixedSchema, {
                            host: current.protocol.value.host,
                            networkInterface: current.protocol.value.networkInterface,
                            alternateHost: current.protocol.value.alternateHost,
                            port: current.protocol.value.port
                        })
                    }
                }))
                break
        }
    }, [current.protocol.case])

    const data = current.protocol
    switch (data.case) {
        case "fixed":
            return <Fixed value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "direct":
            return <Directv2 value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "drop":
            return Dropv2
        case "tls":
            return <Tlsv2 value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "websocket":
            return <Websocketv2 value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "shadowsocks":
            return <Shadowsocksv2 value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "quic":
            return <Quicv2 value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "vless":
            return <Vlessv2 value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "vmess":
            return <Vmessv2 value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "trojan":
            return <Trojanv2 value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "shadowsocksr":
            return <Shadowsocksrv2 value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "obfsHttp":
            return <ObfsHttpv2 value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "none":
            return Nonev2
        case "socks5":
            return <Socks5v2 value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "http":
            return <HTTPv2 value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "reject":
            return Rejectv2
        case "yuubinsya":
            return <Yuubinsyav2 value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "http2":
            return <HTTP2v2 value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "reality":
            return <Realityv2 value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "wireguard":
            return <Wireguardv2 value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "mux":
            return <Muxv2 value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "bootstrapDnsWarp":
            return BootstrapDnsWarp
        case "tailscale":
            return <Tailscale value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "set":
            return <Set value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "tlsTermination":
            return <UnWrapTls value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "httpTermination":
            return <UnWrapHttp value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "httpMock":
            return HttpMock
        case "aead":
            return <Aead value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "networkSplit":
            return <NetworkSplit value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "cloudflareWarpMasque":
            return <CloudflareWarpMasque value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "proxy":
            return Proxy
        case "fixedv2":
            return <Fixedv2 value={data.value} editable={editable} onChange={(e) => update(e)} />
        case "pointAsEndpoint":
            return <PointAsEndpoint value={data.value} editable={editable} onChange={(e) => update(e)} />
        default: return Unknown
    }
}


const NetworkSplit: FC<Props<network_split>> = ({ value, onChange, editable = true }) => {
    const current = normalizeNetworkSplit(value);
    const protocolNames = Object.keys(protocols).filter(x => x !== "networkSplit")
    return <>
        <div className="mb-3">
            <label className="block text-sm font-bold opacity-75 mb-2">TCP Protocol</label>
            <Select value={current.tcp?.protocol.case ?? ""} items={protocolNames.map(v => ({ value: v, label: v }))}
                disabled={!editable}
                onValueChange={(e) => { onChange({ ...current, tcp: protocols[e] }) }} />
        </div>

        <Card className="mb-4">
            <CardBody>
                {current.tcp && <Protocol value={current.tcp} editable={editable} onChange={(e) => { onChange({ ...current, tcp: e }) }} />}
            </CardBody>
        </Card>

        <div className="mb-3">
            <label className="block text-sm font-bold opacity-75 mb-2">UDP Protocol</label>
            <Select value={current.udp?.protocol.case ?? ""} items={protocolNames.map(v => ({ value: v, label: v }))}
                disabled={!editable}
                onValueChange={(e) => { onChange({ ...current, udp: protocols[e] }) }} />
        </div>

        <Card>
            <CardBody>
                {current.udp && <Protocol value={current.udp} editable={editable} onChange={(e) => { onChange({ ...current, udp: e }) }} />}
            </CardBody>
        </Card >
    </>
}

const Unknown = <div className="text-center my-2 opacity-40">Not Implement</div>


const tlsConfig = create(tls_configSchema, {
    enable: false,
    caCert: [new TextEncoder().encode(`-----CERTIFICATE-----
        MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQD4MVvq8SAOzdeE
        SUfehAij/kdTYKPfuc+5SBTNSykilsGsY1mEu4qS6Abc/8bfRM7e9+4bAkA9rSma
        p9Rza0YWNwdYQD3j3vuFlR6ic6tTYN7estRGGFOoI5MxA8OsYDbWNnO/3jYlErtn
        XUqDK5iABtBYNsSrLEc/Y2iISCm0zIT7Bfn3gzboggbqx5bpWjT5HmMRZmezl6EB
        y6HjCSIgZzP2v3yOfOVcu70vKABD3X1bzaKEn86rXNra0TZkqvB9vPv1PsBrELrO
        JxFRrAZylgeShzXgBXWjZKyj/toZ7FJLDv896sW/LuQarQufIcluisO++Xkz/EwQ
        VuXURFENAgMBAAECggEAIuOnaPfD+qjHiNZXVsmnQExswOUHLFpdv81I9VIBQpZA
        PAhMS3skoAGjg1omXfj5fsEKFPxkRPdMb6vzktUL6XALZYXEXX3ZTD456/rIJQSr
        V9F6Qy9ExVBY7u05SshMtSC69Ugawuvm8cEcyiMtASRUEe6DB5AGJPxHs863JC3M
        Dcb5nNYPGjFCsahkwz4rQq/eQQI0j+8TZlHtPFjTCgqMblk2qR/vwkfTI6Wv/rO6
        YZ+M3xXpYc4j1qcHz5PFxIh3kZMgP/GdqLf+l5O4JaFv2aqxEmCjTHq3rAlxJeiV
        tCT5xYCwYzZtZkZq5jPP6CruNbO+L8iyLYHgLAgmsQKBgQD+Pw5nO2FR7arAMR4I
        K+bK2fFWfBTSkMRJrVqtbjr3LIjRGbGmqaF0HjR/8ZNxmyHBPmG35rfUw32NIAFc
        q9nqXVgeL07CXRadYaMoVys3mukMiQSnuycA5se5uNXk/8bulaudLX0Q605GDWto
        29W3CnWyuz1qNGRZHYZ0Duyk3QKBgQD5550WA/5Fwco2WosDqNBCetf3GZazwtKU
        46Dk1QEXeGYrw3p/o42+nNuawqqxbKhH/OJarir8oT4amXMaf60M3tRjj/DYRLx1
        WS9LkuU9bWSRFIpdJxC4BWi9IPCOsfbF0Cui9nD5dXCE6YwoQEXZ8OhE8+y+2fHU
        OULeYZVB8QKBgQDYtnrad3zuzry68aL9qB4jTj4uT7mX+hm2C3O9XLYaNfWw9ku9
        Gd4rEgwB+rKJJYhSJZA5pwmO68s63csLaNhosoQHxp9FgP9jyvO90P9feEWpj6lO
        J3KJjC02G10GwxaYCy+q3Dk8kLW5dHrXeHrkeJ/2Zy9kNaBLbaVLi+UeaQKBgQDo
        +GsRIxfgoBCLK019U9sSnsLGsSw02OLHuo07xvcFklBtbAa/BxIVKNXxKJlIXitj
        MPUz5Dpe2VK0KWmMwono/bKyPnYgp7OpEkNtCLx8z4Z5WdTDkq+bXi+OYS7hWDbd
        onuLqIMZi8ohnjfzLjfwPQ3LejqykStI1TjpZ79lgQKBgQDJAQe8Wnn2+QbWSbda
        NFGyG+hs7SkqqZmEQl3nA5kyAeOSsGtJG9tiLxDE52eMUM1iL6wNPQMDkROp3yRg
        7muJLMjiVeLFxXUyCXKj11W1VER5i16RsuWW3m5aGxumaXw4TJviJzT/dnwHe+x9
        pWZqcBJfEUP6uTLSp3CmyEPcfA==
        -----CERTIFICATE-----`)],
    insecureSkipVerify: false,
    nextProtos: ["h2"],
    serverNames: ["www.example.com"],
    echConfig: new Uint8Array(8)
})


export const protocols: { [key: string]: protocol } = {
    "fixedv2": create(protocolSchema, {
        protocol: {
            case: "fixedv2",
            value: create(fixedv2Schema, { addresses: [] })
        }
    }),
    "fixed": create(protocolSchema, {
        protocol: {
            case: "fixed",
            value: create(fixedSchema, {
                host: "",
                alternateHost: [],
                port: 1080,
            })
        }
    }),
    "none": create(protocolSchema, {
        protocol: {
            case: "none",
            value: create(noneSchema, {}),
        }
    }),
    "websocket": create(protocolSchema, {
        protocol: {
            case: "websocket",
            value: create(websocketSchema, {
                host: "www.example.com",
                path: "/msg",
            })
        }
    }),
    "quic": create(protocolSchema, {
        protocol: {
            case: "quic",
            value: create(quicSchema, {
                tls: tlsConfig
            })
        }
    }),
    "shadowsocks": create(protocolSchema, {
        protocol: {
            case: "shadowsocks",
            value: create(shadowsocksSchema, {
                method: "CHACHA20-IETF-POLY1305",
                password: "password"
            })
        }
    }),
    "obfshttp": create(protocolSchema, {
        protocol: {
            case: "obfsHttp",
            value: create(obfs_httpSchema, {
                host: "www.example.com",
                port: "443"
            })
        }
    }),
    "shadowsocksr": create(protocolSchema, {
        protocol: {
            case: "shadowsocksr",
            value: create(shadowsocksrSchema, {
                method: "chacha20-ietf",
                obfs: "http_post",
                obfsparam: "#name=v",
                password: "password",
                port: "1080",
                protocol: "auth_aes128_sha1",
                protoparam: "",
                server: "127.0.0.1"
            })
        }
    }),
    "vmess": create(protocolSchema, {
        protocol: {
            case: "vmess",
            value: create(vmessSchema, {
                alterId: "0",
                security: "chacha20-poly1305",
                uuid: "9d5031b6-4ef5-11ee-be56-0242ac120002"
            })
        }
    }),
    "trojan": create(protocolSchema, {
        protocol: {
            case: "trojan",
            value: create(trojanSchema, {
                password: "password",
                peer: "peer"
            })
        }
    }),
    "socks5": create(protocolSchema, {
        protocol: {
            case: "socks5",
            value: create(socks5Schema, {
                hostname: "127.0.0.1:1080",
                password: "password",
                user: "username"
            })
        }
    }),
    "http": create(protocolSchema, {
        protocol: {
            case: "http",
            value: create(httpSchema, {
                password: "password",
                user: "username"
            })
        }
    }),
    "direct": create(protocolSchema, {
        protocol: {
            case: "direct",
            value: create(directSchema, {})
        }
    }),
    "yuubinsya": create(protocolSchema, {
        protocol: {
            case: "yuubinsya",
            value: create(yuubinsyaSchema, {
                password: "password",
                udpOverStream: false,
            })
        }
    }),
    "tls": create(protocolSchema, {
        protocol: {
            case: "tls",
            value: tlsConfig,
        }
    }),
    "wireguard": create(protocolSchema, {
        protocol: {
            case: "wireguard",
            value: create(wireguardSchema, {
                endpoint: ["10.0.0.2/32"],
                mtu: 1500,
                reserved: new Uint8Array([0, 0, 0]),
                secretKey: "SHVqHEGI7k2+OQ/oWMmWY2EQObbRQjRBdDPimh0h1WY=",
                peers: [
                    {
                        allowedIps: ["0.0.0.0/0"],
                        endpoint: "127.0.0.1:51820",
                        publicKey: "SHVqHEGI7k2+OQ/oWMmWY2EQObbRQjRBdDPimh0h1WY=",
                    },
                ]
            })
        }
    }),
    "cloudflareWarpMasque": create(protocolSchema, {
        protocol: {
            case: "cloudflareWarpMasque",
            value: create(cloudflare_warp_masqueSchema, {
                privateKey: "SHVqHEGI7k2+OQ/oWMmWY2EQObbRQjRBdDPimh0h1WY=",
                endpointPublicKey: `-----BEGIN PUBLIC KEY-----
SHVqHEGI7k2+OQ/oWMmWY2EQObbRQjRBdDPimh0h1WY
SHVqHEGI7k2+OQ/oWMmWY2EQObbRQjRBdDPimh0h1WY
-----END PUBLIC KEY-----
`,
                endpoint: "198.122.111.1",
                mtu: 1280,
                localAddresses: [
                    "172.16.0.2/32",
                    "3333:4444:111:8567:3333:6666:a888:95a0/128",
                ]
            }),
        }
    }),
    "mux": create(protocolSchema, {
        protocol: {
            case: "mux",
            value: create(muxSchema, {
                concurrency: 8,
            })
        }
    }),
    "drop": create(protocolSchema, {
        protocol: {
            case: "drop",
            value: create(dropSchema, {})
        }
    }),
    "vless": create(protocolSchema, {
        protocol: {
            case: "vless",
            value: create(vlessSchema, {
                uuid: "c48619fe-8f02-49e0-b9e9-edf763e17e21",
            })
        }
    }),
    "http2": create(protocolSchema, {
        protocol: {
            case: "http2",
            value: create(http2Schema, { concurrency: 8, })
        }
    }),
    "reality": create(protocolSchema, {
        protocol: {
            case: "reality",
            value: create(realitySchema, {
                debug: false,
                publicKey: "SHVqHEGI7k2+OQ/oWMmWY2EQObbRQjRBdDPimh0h1WY=",
                serverName: "127.0.0.1",
                shortId: "9d5031b6-4ef5-11ee-be56-0242ac120002"
            })
        }
    }),
    "bootstrapDnsWarp": create(protocolSchema, {
        protocol: {
            case: "bootstrapDnsWarp",
            value: {}
        }
    }),
    "tailscale": create(protocolSchema, {
        protocol: {
            case: "tailscale",
            value: create(tailscaleSchema, {
                authKey: "tskey-auth-xxxxx",
                hostname: "yuhaiin-node",
            })
        }
    }),
    "set": create(protocolSchema, {
        protocol: {
            case: "set",
            value: create(setSchema, { nodes: [] })
        }
    }),
    "tlsTermination": create(protocolSchema, {
        protocol: {
            case: "tlsTermination",
            value: create(tls_terminationSchema, {
                tls: create(tls_server_configSchema, {
                    certificates: [],
                    nextProtos: [],
                    serverNameCertificate: {}
                })
            })
        }
    }),
    "httpTermination": create(protocolSchema, {
        protocol: {
            case: "httpTermination",
            value: create(http_terminationSchema, {
                headers: {},
                // unwrapTls: true,
                // defaultScheme: "https"
            })
        }
    }),
    "httpMock": create(protocolSchema, {
        protocol: {
            case: "httpMock",
            value: create(http_mockSchema, {
                data: new Uint8Array()
            })
        }
    }),
    "aead": create(protocolSchema, {
        protocol: {
            case: "aead",
            value: create(aeadSchema, {
                password: "password",
            })
        }
    }),
    "networkSplit": create(protocolSchema, {
        protocol: {
            case: "networkSplit",
            value: create(network_splitSchema, {
                tcp: create(protocolSchema, { protocol: { case: "none", value: create(noneSchema, {}) } }),
                udp: create(protocolSchema, { protocol: { case: "none", value: create(noneSchema, {}) } }),
            })
        }
    }),
    "proxy": create(protocolSchema, {
        protocol: {
            case: "proxy",
            value: create(proxySchema, {})
        }
    }),
    "pointAsEndpoint": create(protocolSchema, {
        protocol: {
            case: "pointAsEndpoint",
            value: create(point_as_endpointSchema, {
                hash: ""
            })
        }
    }),
}
