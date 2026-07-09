export type UDPMode = "enabled" | "disabled" | "tcp_only" | "udp_only";

export type EmptyNetwork = {
    type: "empty";
    empty: Record<string, never>;
};

export type TCPUDPNetwork = {
    type: "tcp_udp";
    tcp_udp: {
        host: string;
        udp: UDPMode;
    };
};

export type QUICNetwork = {
    type: "quic";
    quic: {
        host: string;
        tls?: ServerTLSConfig;
    };
};

export type InboundNetwork = EmptyNetwork | TCPUDPNetwork | QUICNetwork;

export type InboundProtocol =
    | { type: "http"; http: { username: string; password: string } }
    | { type: "socks5"; socks5: { username: string; password: string; udp: boolean } }
    | { type: "yuubinsya"; yuubinsya: { password: string; udpCoalesce: boolean } }
    | { type: "mixed"; mixed: { username: string; password: string } }
    | { type: "socks4a"; socks4a: { username: string } }
    | { type: "tproxy"; tproxy: { host: string; dnsHijacking: boolean; forceFakeIp: boolean } }
    | { type: "redir"; redir: { host: string } }
    | { type: "tun"; tun: TunProtocol }
    | { type: "reverse_http"; reverse_http: { url: string; tls?: ClientTLSConfig } }
    | { type: "reverse_tcp"; reverse_tcp: { target: string } }
    | { type: "none"; none: Record<string, never> };

export type TunProtocol = {
    name: string;
    mtu: number;
    forceFakeIp: boolean;
    skipMulticast: boolean;
    driver: string;
    portal: string;
    portalV6: string;
    routes: string[];
    excludes: string[];
    postUp: string[];
    postDown: string[];
};

export type InboundTransport =
    | { type: "normal"; normal: Record<string, never> }
    | { type: "tls"; tls: { tls?: ServerTLSConfig } }
    | { type: "mux"; mux: Record<string, never> }
    | { type: "http2"; http2: Record<string, never> }
    | { type: "websocket"; websocket: Record<string, never> }
    | { type: "reality"; reality: RealityTransport }
    | { type: "tls_auto"; tls_auto: TLSAutoTransport }
    | { type: "http_mock"; http_mock: { dataBase64: string } }
    | { type: "aead"; aead: { password: string; cryptoMethod: string } }
    | { type: "proxy"; proxy: Record<string, never> };

export type RealityTransport = {
    shortIds: string[];
    serverNames: string[];
    dest: string;
    privateKey: string;
    publicKey: string;
    mldsa65Seed: string;
    debug: boolean;
};

export type TLSAutoTransport = {
    serverNames: string[];
    nextProtos: string[];
    caCertBase64: string;
    caKeyBase64: string;
    ech?: {
        enabled: boolean;
        configBase64: string;
        privateKeyBase64: string;
        outerSni: string;
    };
};

export type ClientTLSConfig = {
    enabled: boolean;
    serverNames: string[];
    caCertsBase64: string[];
    insecureSkipVerify: boolean;
    nextProtos: string[];
    echConfigBase64: string;
};

export type ServerTLSConfig = {
    certificates: Certificate[];
    nextProtos: string[];
    serverNameCertificate?: Record<string, Certificate>;
};

export type Certificate = {
    certBase64: string;
    keyBase64: string;
    certFile: string;
    keyFile: string;
};

export type Inbound = {
    id: string;
    name: string;
    enabled: boolean;
    network: InboundNetwork;
    transports: InboundTransport[];
    protocol: InboundProtocol;
};

export type Page = {
    page: number;
    pageSize: number;
    total: number;
};

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
