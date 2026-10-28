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
        case "masque":
            return { type, masque: { authToken: "", path: "/.well-known/masque/ip/*/*/", serverAddresses: ["10.88.0.1/32"], clientAddresses: ["10.88.0.2/32"], mtu: 1280, maxSessions: 64 } };
        case "hysteria2":
            return { type, hysteria2: { auth: "", uploadBps: 0, downloadBps: 0 } };
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
                    autoFakeIpRoute: true,
                    darwin: { experimentalBatch: false, batchSize: 32, pendingPackets: 32 },
                    skipMulticast: false,
                    driver: "channel",
                    stack: "lightweight",
                    congestionControl: "cubic",
                    portal: "",
                    portalV6: "",
                    routes: [],
                    excludes: [],
                    postUp: [],
                    postDown: [],
                },
            };
        case "sstp":
            return { type, sstp: { tls: { certificates: [], nextProtos: [], serverNameCertificate: {} }, serverAddress: "10.90.0.1", clientAddresses: ["10.90.0.2"], dns: "", mtu: 1400, maxSessions: 1, users: [] } };
        case "wireguard":
            return { type, wireguard: { privateKey: "", listenPort: 51820, addresses: ["10.66.0.1/24"], mtu: 1420, peers: [] } };
        case "krunlet":
            return { type, krunlet: { socket: "" } };
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

// A persisted legacy TUN configuration is normalized before editing and
// serialization. The backend no longer includes gVisor or tun2socket paths.
export function normalizeTunProtocol(value: TunProtocol): TunProtocol {
    return { ...value, stack: "lightweight", driver: "channel", congestionControl: value.congestionControl || "cubic" };
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

// Select a protocol with its required listener and certificate setup, keeping a
// usable existing certificate (and its persisted CA) rather than regenerating it.
export function selectInboundProtocol(inbound: Inbound, type: InboundProtocol["type"]): Inbound {
    if (!["http", "socks5", "mixed", "yuubinsya", "hysteria2"].includes(type)) inbound = { ...inbound, authentication: undefined };
    const protocol = inbound.protocol.type === type
        ? inbound.protocol : createDefaultProtocol(type);
    if (["tun", "tproxy", "redir", "krunlet", "wireguard"].includes(type)) return normalizeInbound({ ...inbound, protocol, network: { type: "empty", empty: {} }, transports: [] });
    if (type === "sstp") {
        const host = inbound.network.type === "tcp_udp" && inbound.network.tcp_udp.host !== ":9002" ? inbound.network.tcp_udp.host : "127.0.0.1:8443";
        return normalizeInbound({
            ...inbound,
            protocol,
            network: { type: "tcp_udp", tcp_udp: { host, udp: "tcp_only" } },
            transports: [],
        });
    }
    if (type !== "hysteria2" && type !== "masque") {
        // A virtual inbound has no network listener; restore a normal listener
        // when switching back to a stream protocol.
        if (inbound.protocol.type === "wireguard" && inbound.network.type === "empty") {
            return normalizeInbound({ ...inbound, protocol, network: createDefaultNetwork(), transports: [] });
        }
        return normalizeInbound({ ...inbound, protocol });
    }
    // inboundListen() returns a display label ("UDP :51820") for WireGuard,
    // not a socket address that Hysteria2 can bind.
    const host = inbound.protocol.type === "wireguard" ? ":9002" : inboundListen(inbound) || ":9002";
    const certificate = inbound.transports.find(item => item.type === "tls" || (type === "hysteria2" && item.type === "tls_auto"));
    return normalizeInbound({
        ...inbound,
        protocol,
        network: { type: "tcp_udp", tcp_udp: { host, udp: "udp_only" } },
        transports: [certificate ?? createDefaultTransport(type === "masque" ? "tls" : "tls_auto")],
    });
}

export function normalizeInbound(value: Partial<Inbound> & { id?: string }): Inbound {
    return {
        ...(value.authentication ? { authentication: { users: [...value.authentication.users] } } : {}),
        id: value.id ?? "",
        name: value.name ?? value.id ?? "",
        enabled: value.enabled ?? false,
        network: value.network ?? createDefaultNetwork(),
        transports: Array.isArray(value.transports) ? value.transports : [],
        protocol: value.protocol?.type === "tun"
            ? { ...value.protocol, tun: normalizeTunProtocol({ ...value.protocol.tun, autoFakeIpRoute: value.protocol.tun.autoFakeIpRoute ?? false }) }
            : value.protocol ?? createDefaultProtocol(),
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
            if (value.protocol.type === "wireguard") return `UDP :${value.protocol.wireguard.listenPort}`;
            return "";
    }
}
