export type NodeOrigin = "reserve" | "remote" | "manual";

export type NodeProtocolType =
  | "shadowsocks"
  | "shadowsocksr"
  | "vmess"
  | "websocket"
  | "quic"
  | "obfs_http"
  | "trojan"
  | "simple"
  | "none"
  | "socks5"
  | "http"
  | "direct"
  | "reject"
  | "yuubinsya"
  | "http2"
  | "reality"
  | "tls"
  | "wireguard"
  | "mux"
  | "drop"
  | "vless"
  | "bootstrap_dns_warp"
  | "tailscale"
  | "set"
  | "tls_termination"
  | "http_termination"
  | "http_mock"
  | "aead"
  | "fixed"
  | "network_split"
  | "cloudflare_warp_masque"
  | "proxy"
  | "fixedv2"
  | "point_as_endpoint";

export type EmptyNodeProtocolConfig = { readonly __emptyProtocolConfig?: never };

export type ShadowsocksConfig = {
  method?: string;
  password?: string;
};

export type ShadowsocksrConfig = {
  server?: string;
  port?: string;
  method?: string;
  password?: string;
  obfs?: string;
  obfsparam?: string;
  protocol?: string;
  protoparam?: string;
};

export type VmessConfig = {
  id?: string;
  aid?: string;
  security?: string;
};

export type VlessConfig = {
  uuid?: string;
};

export type WebsocketConfig = {
  host?: string;
  path?: string;
};

export type QuicConfig = {
  host?: string;
  tls?: TLSConfig;
};

export type ObfsHTTPConfig = {
  host?: string;
  port?: string;
};

export type TrojanConfig = {
  password?: string;
  peer?: string;
};

export type FixedAddressConfig = {
  host?: string;
  port?: number;
  network_interface?: string;
};

export type FixedConfig = {
  host?: string;
  port?: number;
  alternate_host?: FixedAddressConfig[];
  network_interface?: string;
};

export type FixedV2Config = {
  addresses?: FixedAddressConfig[];
  udp_happy_eyeballs?: boolean;
};

export type Socks5Config = {
  user?: string;
  password?: string;
  hostname?: string;
  override_port?: number;
};

export type HTTPConfig = {
  user?: string;
  password?: string;
};

export type YuubinsyaConfig = {
  password?: string;
  udp_over_stream?: boolean;
  udp_coalesce?: boolean;
};

export type ConcurrencyConfig = {
  concurrency?: number;
};

export type RealityConfig = {
  server_name?: string;
  public_key?: string;
  mldsa65_verify?: string;
  short_id?: string;
  debug?: boolean;
};

export type TLSConfig = {
  enable?: boolean;
  servernames?: string[];
  ca_cert?: string[];
  insecure_skip_verify?: boolean;
  next_protos?: string[];
  ech_config?: string;
};

export type CertificateConfig = {
  cert?: string;
  key?: string;
  cert_file_path?: string;
  key_file_path?: string;
};

export type ServerTLSConfig = {
  certificates?: CertificateConfig[];
  next_protos?: string[];
  serverNameCertificate?: { [serverName: string]: CertificateConfig };
};

export type TLSTerminationConfig = {
  tls?: ServerTLSConfig;
};

export type WireguardPeerConfig = {
  publicKey?: string;
  preSharedKey?: string;
  endpoint?: string;
  keepAlive?: number;
  allowedIps?: string[];
};

export type WireguardConfig = {
  secretKey?: string;
  endpoint?: string[];
  peers?: WireguardPeerConfig[];
  mtu?: number;
  reserved?: string;
};

export type TailscaleConfig = {
  auth_key?: string;
  hostname?: string;
  control_url?: string;
  debug?: boolean;
};

export type SetConfig = {
  nodes?: string[];
  strategy?: string;
};

export type HTTPHeaderConfig = {
  key?: string;
  value?: string;
};

export type HTTPHeadersConfig = {
  headers?: HTTPHeaderConfig[];
};

export type HTTPTerminationConfig = {
  headers?: { [path: string]: HTTPHeadersConfig };
};

export type HTTPMockConfig = {
  data?: string;
};

export type AEADConfig = {
  password?: string;
  crypto_method?: string;
};

export type NetworkSplitConfig = {
  tcp?: NodeProtocol;
  udp?: NodeProtocol;
};

export type CloudflareWarpMasqueConfig = {
  private_key?: string;
  endpoint?: string[];
  endpoint_public_key?: string;
  local_addresses?: string[];
  mtu?: number;
};

export type PointAsEndpointConfig = {
  hash?: string;
};

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

export type Node = {
  id: string;
  name: string;
  group: string;
  origin: NodeOrigin;
  enabled: boolean;
  chain: NodeProtocol[];
};

export type NodeList = {
  items: Node[];
  page: {
    page: number;
    pageSize: number;
    total: number;
  };
};

export type NodeLatencyResponse = {
  ok: boolean;
  latencyMs?: number;
  ip?: {
    ipv4?: string;
    ipv6?: string;
  };
  stun?: {
    xorMappedAddress?: string;
    mappedAddress?: string;
    otherAddress?: string;
    responseOriginAddress?: string;
    software?: string;
    mapping?: string;
    filtering?: string;
  };
  error?: string;
};

export type NodeLatencyRequest = {
  type: "tcp" | "udp" | "doq" | "ip" | "stun" | "stun_tcp";
  url?: string;
  userAgent?: string;
  host?: string;
  targetDomain?: string;
  ipv6?: boolean;
  tcp?: boolean;
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
