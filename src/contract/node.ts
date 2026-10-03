import type { Go } from "@/api/generated-contracts";

export type NodeOrigin = "reserve" | "remote" | "manual";
export type NodeProtocolType = Go.node.Protocol["type"];
export type EmptyNodeProtocolConfig = { readonly __emptyProtocolConfig?: never };
export type ShadowsocksConfig = Partial<Go.node.Shadowsocks>;
export type ShadowsocksrConfig = Partial<Go.node.Shadowsocksr>;
export type VmessConfig = Partial<Go.node.Vmess>;
export type VlessConfig = Partial<Go.node.Vless>;
export type WebsocketConfig = Partial<Go.node.Websocket>;
export type QuicConfig = Omit<Partial<Go.node.Quic>, "tls"> & { tls?: TLSConfig };
export type ObfsHTTPConfig = Partial<Go.node.ObfsHTTP>;
export type TrojanConfig = Partial<Go.node.Trojan>;
export type FixedAddressConfig = Partial<Go.node.FixedAddress>;
export type FixedConfig = Omit<Partial<Go.node.Fixed>, "alternate_host"> & { alternate_host?: FixedAddressConfig[] };
export type FixedV2Config = Omit<Partial<Go.node.FixedV2>, "addresses"> & { addresses?: FixedAddressConfig[] };
export type Socks5Config = Partial<Go.node.Socks5>;
export type HTTPConfig = Partial<Go.node.HTTP>;
export type YuubinsyaConfig = Partial<Go.node.Yuubinsya>;
export type ConcurrencyConfig = Partial<Go.node.Concurrency>;
export type RealityConfig = Partial<Go.node.Reality>;
export type TLSConfig = Partial<Go.node.TLS>;
export type CertificateConfig = Partial<Go.node.Certificate>;
export type ServerTLSConfig = Partial<Go.node.ServerTLS>;
export type TLSTerminationConfig = { tls?: ServerTLSConfig };
export type WireguardPeerConfig = Partial<Go.node.WireguardPeer>;
export type WireguardConfig = Omit<Partial<Go.node.Wireguard>, "peers"> & { peers?: WireguardPeerConfig[] };
export type TailscaleConfig = Partial<Go.node.Tailscale>;
export type SetConfig = Partial<Go.node.Set>;
export type HTTPHeaderConfig = Partial<Go.node.HTTPHeader>;
export type HTTPHeadersConfig = Partial<Go.node.HTTPHeaders>;
export type HTTPTerminationConfig = Omit<Partial<Go.node.HTTPTermination>, "headers"> & { headers?: Record<string, HTTPHeadersConfig> };
export type HTTPMockConfig = Partial<Go.node.HTTPMock>;
export type AEADConfig = Partial<Go.node.AEAD>;
export type NetworkSplitConfig = { tcp?: NodeProtocol; udp?: NodeProtocol };
export type CloudflareWarpMasqueConfig = Omit<Partial<Go.node.CloudflareWarpMasque>, "endpoint"> & { endpoint?: string[] };
export type PointAsEndpointConfig = Partial<Go.node.PointAsEndpoint>;

export type NodeProtocolConfigByType = {
  shadowsocks: ShadowsocksConfig;
  shadowsocksr: ShadowsocksrConfig;
  vmess: VmessConfig;
  websocket: WebsocketConfig;
  quic: QuicConfig;
  obfs_http: ObfsHTTPConfig;
  trojan: TrojanConfig;
  simple: FixedConfig;
  none: EmptyNodeProtocolConfig;
  socks5: Socks5Config;
  http: HTTPConfig;
  direct: { network_interface?: string };
  reject: EmptyNodeProtocolConfig;
  yuubinsya: YuubinsyaConfig;
  http2: ConcurrencyConfig;
  reality: RealityConfig;
  tls: TLSConfig;
  wireguard: WireguardConfig;
  mux: ConcurrencyConfig;
  drop: EmptyNodeProtocolConfig;
  vless: VlessConfig;
  bootstrap_dns_warp: EmptyNodeProtocolConfig;
  tailscale: TailscaleConfig;
  set: SetConfig;
  tls_termination: TLSTerminationConfig;
  http_termination: HTTPTerminationConfig;
  http_mock: HTTPMockConfig;
  aead: AEADConfig;
  fixed: FixedConfig;
  network_split: NetworkSplitConfig;
  cloudflare_warp_masque: CloudflareWarpMasqueConfig;
  proxy: EmptyNodeProtocolConfig;
  fixedv2: FixedV2Config;
  point_as_endpoint: PointAsEndpointConfig;
};

export type NodeProtocolConfig<T extends NodeProtocolType = NodeProtocolType> = NodeProtocolConfigByType[T];

export type NodeProtocol<T extends NodeProtocolType = NodeProtocolType> = {
  [K in T]: { type: K } & { [P in K]: NodeProtocolConfigByType[P] }
}[T];

export type Node = Omit<Go.node.Node, "origin" | "chain"> & {
  origin: NodeOrigin;
  chain: NodeProtocol[];
};
export type NodeList = { items: Node[]; page: Go.route.Page };
export type NodeLatencyResponse = Go.node.LatencyResponse;
export type NodeLatencyRequest = Partial<Omit<Go.node.LatencyRequest, "type">> & {
  type: "tcp" | "udp" | "doq" | "ip" | "stun" | "stun_tcp";
};

export function createDefaultProtocol<T extends NodeProtocolType = "direct">(type?: T): NodeProtocol<T> {
  const protocolType = type ?? ("direct" as T);
  return protocolWithConfig(protocolType, defaultProtocolConfig(protocolType));
}

export function createDefaultNode(group = "manual"): Node {
  const id = createID();
  return {
    id,
    name: "new-node",
    group,
    origin: "manual",
    enabled: true,
    chain: [createDefaultProtocol("direct")],
  };
}

export function normalizeProtocol(value: unknown): NodeProtocol {
  const type = normalizeProtocolType(protocolObject(value)?.type) ?? findProtocolType(value) ?? "direct";
  return protocolWithConfig(type, protocolObject(value)?.[type]);
}

export function normalizeNode(value: Partial<Node> | undefined): Node {
  const node = value ?? {};
  return {
    id: node.id ?? createID(),
    name: node.name ?? "new-node",
    group: node.group ?? "manual",
    origin: node.origin ?? "manual",
    enabled: node.enabled ?? true,
    chain: Array.isArray(node.chain) && node.chain.length > 0
      ? node.chain.map((item) => normalizeProtocol(item))
      : [createDefaultProtocol("direct")],
  };
}

export function getProtocolConfig<T extends NodeProtocolType>(protocol: NodeProtocol<T>): NodeProtocolConfig<T> {
  return protocol[protocol.type] as NodeProtocolConfig<T>;
}

export function patchProtocolConfig<T extends NodeProtocolType>(
  protocol: NodeProtocol<T>,
  patch: Partial<NodeProtocolConfig<T>>,
): NodeProtocol<T> {
  return protocolWithConfig(protocol.type, { ...getProtocolConfig(protocol), ...patch });
}

export function protocolWithConfig<T extends NodeProtocolType>(type: T, value: unknown): NodeProtocol<T> {
  const config = normalizeProtocolConfig(type, value);
  return { type, [type]: config } as NodeProtocol<T>;
}

export function normalizeProtocolConfig<T extends NodeProtocolType>(type: T, value: unknown): NodeProtocolConfig<T> {
  const object = objectValue(value);
  const config = object ?? defaultProtocolConfig(type);
  switch (type) {
    case "network_split":
      return {
        tcp: object?.tcp ? normalizeProtocol(object.tcp) : undefined,
        udp: object?.udp ? normalizeProtocol(object.udp) : undefined,
      } as NodeProtocolConfig<T>;
    case "tls":
    case "quic":
      return normalizeObjectWithDefaults(defaultProtocolConfig(type), config) as NodeProtocolConfig<T>;
    default:
      return normalizeObjectWithDefaults(defaultProtocolConfig(type), config) as NodeProtocolConfig<T>;
  }
}

function defaultProtocolConfig<T extends NodeProtocolType>(type: T): NodeProtocolConfig<T> {
  switch (type) {
    case "network_split":
      return { tcp: createDefaultProtocol("direct"), udp: createDefaultProtocol("direct") } as NodeProtocolConfig<T>;
    case "tls":
      return { enable: true } as NodeProtocolConfig<T>;
    case "quic":
      return { tls: { enable: true } } as NodeProtocolConfig<T>;
    case "tls_termination":
      return { tls: {} } as NodeProtocolConfig<T>;
    case "http_termination":
      return { headers: {} } as NodeProtocolConfig<T>;
    case "fixedv2":
      return { addresses: [] } as NodeProtocolConfig<T>;
    case "wireguard":
      return { endpoint: [], peers: [] } as NodeProtocolConfig<T>;
    case "set":
      return { nodes: [] } as NodeProtocolConfig<T>;
    case "none":
    case "reject":
    case "drop":
    case "bootstrap_dns_warp":
    case "proxy":
      return {} as NodeProtocolConfig<T>;
    default:
      return {} as NodeProtocolConfig<T>;
  }
}

type ProtocolObject = {
  type?: unknown;
} & {
  [K in NodeProtocolType]?: unknown;
};

function protocolObject(value: unknown): ProtocolObject | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  return value as ProtocolObject;
}

function objectValue(value: unknown): { [key: string]: unknown } | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  return value as { [key: string]: unknown };
}

function normalizeObjectWithDefaults<T extends object>(defaults: T, value: { [key: string]: unknown }): T {
  return { ...defaults, ...value };
}

function createID(): string {
  const randomUUID = globalThis.crypto?.randomUUID;
  if (typeof randomUUID === "function") {
    return randomUUID.call(globalThis.crypto);
  }

  const bytes = new Uint8Array(16);
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function findProtocolType(value: unknown): NodeProtocolType | undefined {
  const object = protocolObject(value);
  if (!object) return undefined;
  for (const key of protocolTypes) {
    if (object[key] !== undefined) return key;
  }
  return undefined;
}

function normalizeProtocolType(value: unknown): NodeProtocolType | undefined {
  return typeof value === "string" && protocolTypes.includes(value as NodeProtocolType)
    ? value as NodeProtocolType
    : undefined;
}

export const protocolTypes: NodeProtocolType[] = [
  "shadowsocks",
  "shadowsocksr",
  "vmess",
  "websocket",
  "quic",
  "obfs_http",
  "trojan",
  "simple",
  "none",
  "socks5",
  "http",
  "direct",
  "reject",
  "yuubinsya",
  "http2",
  "reality",
  "tls",
  "wireguard",
  "mux",
  "drop",
  "vless",
  "bootstrap_dns_warp",
  "tailscale",
  "set",
  "tls_termination",
  "http_termination",
  "http_mock",
  "aead",
  "fixed",
  "network_split",
  "cloudflare_warp_masque",
  "proxy",
  "fixedv2",
  "point_as_endpoint",
];
