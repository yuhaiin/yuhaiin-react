import type { Go } from "@/api/generated-contracts";

export type UDPMode = "enabled" | "disabled" | "tcp_only" | "udp_only";
type NetworkVariant<T extends Go.inbound.Network["type"]> = Extract<Go.inbound.Network, { type: T }>;
export type EmptyNetwork = NetworkVariant<"empty">;
export type TCPUDPNetwork = Omit<NetworkVariant<"tcp_udp">, "tcp_udp"> & {
    tcp_udp: Omit<Go.inbound.TCPUDPNetwork, "udp"> & { udp: UDPMode };
};
export type QUICNetwork = NetworkVariant<"quic">;
export type InboundNetwork = EmptyNetwork | TCPUDPNetwork | QUICNetwork;
export type InboundProtocol = Go.inbound.Protocol;
export type TunProtocol = Go.inbound.TunProtocol;
export type InboundTransport = Go.inbound.Transport;
export type RealityTransport = Go.inbound.RealityTransport;
export type TLSAutoTransport = Go.inbound.TLSAutoTransport;
export type ClientTLSConfig = Go.inbound.ClientTLSConfig;
export type Certificate = Go.inbound.Certificate;
export type ServerTLSConfig = Go.inbound.ServerTLSConfig;
export type Inbound = Omit<Go.inbound.Inbound, "network" | "transports" | "protocol"> & {
    network: InboundNetwork;
    transports: InboundTransport[];
    protocol: InboundProtocol;
};
export type Page = Go.route.Page;

export type InboundList = {
    items: Inbound[];
    page: Page;
};

export type InboundConfig = {
    hijackDns: boolean;
    hijackDnsFakeIp: boolean;
    sniff: boolean;
};

export function createDefaultNetwork(type: InboundNetwork["type"] = "tcp_udp"): InboundNetwork {
    switch (type) {
        case "empty":
            return { type, empty: {} };
        case "quic":
            return { type, quic: { host: "" } };
        case "tcp_udp":
            return { type, tcp_udp: { host: ":9002", udp: "enabled" } };
    }
}

export function createDefaultProtocol(type: InboundProtocol["type"] = "mixed"): InboundProtocol {
    switch (type) {
        case "http":
            return { type, http: { username: "", password: "" } };
        case "socks5":
            return { type, socks5: { username: "", password: "", udp: true } };
        case "yuubinsya":
            return { type, yuubinsya: { password: "", udpCoalesce: false } };
        case "mixed":
            return { type, mixed: { username: "", password: "" } };
        case "socks4a":
            return { type, socks4a: { username: "" } };
        case "tproxy":
            return { type, tproxy: { host: "", dnsHijacking: false, forceFakeIp: false } };
        case "redir":
            return { type, redir: { host: "" } };
        case "tun":
            return {
                type,
                tun: {
                    name: "",
                    mtu: 0,
                    forceFakeIp: false,
                    skipMulticast: false,
                    driver: "fdbased",
                    portal: "",
                    portalV6: "",
                    routes: [],
                    excludes: [],
                    postUp: [],
                    postDown: [],
                },
            };
        case "reverse_http":
            return { type, reverse_http: { url: "" } };
        case "reverse_tcp":
            return { type, reverse_tcp: { target: "" } };
        case "none":
            return { type, none: {} };
    }
}

export function createDefaultTransport(type: InboundTransport["type"] = "normal"): InboundTransport {
    switch (type) {
        case "normal":
            return { type, normal: {} };
        case "tls":
            return { type, tls: {} };
        case "mux":
            return { type, mux: {} };
        case "http2":
            return { type, http2: {} };
        case "websocket":
            return { type, websocket: {} };
        case "reality":
            return {
                type,
                reality: {
                    shortIds: [],
                    serverNames: [],
                    dest: "",
                    privateKey: "",
                    publicKey: "",
                    mldsa65Seed: "",
                    debug: false,
                },
            };
        case "tls_auto":
            return { type, tls_auto: { serverNames: [], nextProtos: [], caCertBase64: "", caKeyBase64: "" } };
        case "http_mock":
            return { type, http_mock: { dataBase64: "" } };
        case "aead":
            return { type, aead: { password: "", cryptoMethod: "Chacha20Poly1305" } };
        case "proxy":
            return { type, proxy: {} };
    }
}

export function createDefaultInbound(id: string): Inbound {
    return {
        id,
        name: id,
        enabled: false,
        network: createDefaultNetwork(),
        transports: [createDefaultTransport()],
        protocol: createDefaultProtocol(),
    };
}

export function normalizeInbound(value: Partial<Inbound> & { id?: string }): Inbound {
    return {
        id: value.id ?? "",
        name: value.name ?? value.id ?? "",
        enabled: value.enabled ?? false,
        network: value.network ?? createDefaultNetwork(),
        transports: Array.isArray(value.transports) ? value.transports : [],
        protocol: value.protocol ?? createDefaultProtocol(),
    };
}

export function normalizeInboundConfig(value?: Partial<InboundConfig>): InboundConfig {
    return {
        hijackDns: value?.hijackDns ?? false,
        hijackDnsFakeIp: value?.hijackDnsFakeIp ?? false,
        sniff: value?.sniff ?? false,
    };
}

export function inboundListen(value: Inbound): string {
    switch (value.network.type) {
        case "tcp_udp":
            return value.network.tcp_udp.host;
        case "quic":
            return value.network.quic.host;
        case "empty":
            if (value.protocol.type === "tproxy") return value.protocol.tproxy.host;
            if (value.protocol.type === "redir") return value.protocol.redir.host;
            if (value.protocol.type === "tun") return value.protocol.tun.portal;
            return "";
    }
}
