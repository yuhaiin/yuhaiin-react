import type { Connection } from "@/contract/connection";
import type { Rate } from "./rates";

/**
 * Aggregated topology of the active connections.
 *
 * Every connection follows one path through five columns:
 * source → inbound → routing policy → outbound → destination.
 * Connections are never drawn one by one: each column groups them by the
 * identity the backend recorded (inbound id, rule and selector, node id,
 * destination host). Node ids are derived from those identities only, so a
 * node keeps its id (and its position) while connections come and go.
 * Missing fields produce explicit Unknown/Unresolved nodes; no relation is
 * inferred from configuration.
 */

export const COLUMNS = ["source", "inbound", "policy", "outbound", "destination"] as const;
export type Column = typeof COLUMNS[number];

export type NodeKind =
    | "app" | "device" | "local" | "component"
    | "inbound" | "internal"
    | "rule" | "default-route"
    | "direct" | "proxy" | "vpn" | "block" | "gateway"
    | "domain" | "ip"
    | "others" | "unknown"
    | "dns-client" | "dns-entry" | "dns-route" | "dns-resolver" | "dns-upstream";

export type OutboundClass = "direct" | "proxy" | "vpn" | "block" | "other";
export type NetworkKind = "tcp" | "udp" | "other";
export type IPFamily = "ipv4" | "ipv6" | "unknown";

/**
 * active: at least one connection moved bytes in the last sample.
 * open: connections exist but none moved bytes.
 * idle: configured and running, no connections.
 * degraded / offline: reported by the runtime status APIs.
 * closed: the node lost its last connection and is fading out.
 */
export type NodeStatus = "active" | "open" | "idle" | "degraded" | "offline" | "closed";

export interface TopologyNode {
    id: string;
    column: Column;
    kind: NodeKind;
    /** Display name from the backend; empty for nodes the UI names itself. */
    name: string;
    /** Protocol or category, e.g. "socks5", "wireguard", "domain". */
    type: string;
    /** Configuration id behind the node (inbound, node, rule) when known. */
    refId?: string;
    /** Selector the routing policy delegates to. */
    selectorId?: string;
    selectorName?: string;
    /** Route mode of the policy (proxy, direct, block, gateway). */
    mode?: string;
    status: NodeStatus;
    connections: number;
    tcp: number;
    udp: number;
    up: number;
    down: number;
    /** Aggregated identities behind an Others node. */
    members?: number;
    /** Destinations reached through a FakeIP mapping. */
    fakeIp?: boolean;
    connectionIds: string[];
    /** DNS history aggregate, for nodes of the auxiliary DNS band. */
    dns?: DnsStats;
}

export interface DnsStats {
    queries: number;
    failures: number;
    fakeip: number;
    cacheHits: number;
    /** Mean duration in milliseconds. */
    averageMs: number;
    /** History record ids, newest first. */
    recordIds: number[];
}

export interface TopologyEdge {
    id: string;
    from: string;
    to: string;
    network: NetworkKind;
    connections: number;
    up: number;
    down: number;
    connectionIds: string[];
}

export interface InboundInfo {
    id: string;
    name: string;
    protocol: string;
    enabled: boolean;
    /** Runtime status from /api/v2/inbounds/status. */
    status?: string;
}

export interface OutboundInfo {
    id: string;
    name: string;
    /** Protocol types of the node chain, outermost first. */
    protocols: string[];
}

export interface TopologyCatalog {
    inbounds: Map<string, InboundInfo>;
    nodes: Map<string, OutboundInfo>;
    nodeStatus: Map<string, string>;
    /** Outbound nodes the runtime has instantiated, used or not. */
    activeNodes: string[];
}

export const emptyCatalog = (): TopologyCatalog => ({ inbounds: new Map(), nodes: new Map(), nodeStatus: new Map(), activeNodes: [] });

export interface TopologyFilter {
    network: "all" | "tcp" | "udp";
    family: "all" | "ipv4" | "ipv6";
    classes: OutboundClass[];
    inbounds: string[];
    outbounds: string[];
    processes: string[];
    geo: string[];
}

export const emptyFilter = (): TopologyFilter => ({ network: "all", family: "all", classes: [], inbounds: [], outbounds: [], processes: [], geo: [] });

export function activeFilterCount(filter: TopologyFilter) {
    return (filter.network !== "all" ? 1 : 0) + (filter.family !== "all" ? 1 : 0)
        + filter.classes.length + filter.inbounds.length + filter.outbounds.length + filter.processes.length + filter.geo.length;
}

export interface TopologyLimits {
    sources: number;
    destinations: number;
    /** Idle (instantiated, unused) outbound nodes shown at most. */
    idleOutbounds: number;
}

export const desktopLimits: TopologyLimits = { sources: 8, destinations: 12, idleOutbounds: 4 };
export const mobileLimits: TopologyLimits = { sources: 4, destinations: 6, idleOutbounds: 2 };

export interface TopologyModel {
    nodes: TopologyNode[];
    edges: TopologyEdge[];
    /** Node ids of every connection's path, in column order. */
    paths: Map<string, string[]>;
    /** Connections that passed the filter. */
    visible: number;
    /** All active connections before filtering. */
    total: number;
    up: number;
    down: number;
    /** Source/destination identities kept out of Others, for hysteresis. */
    pinned: { sources: string[]; destinations: string[] };
}

export interface BuildInput {
    connections: Iterable<Connection>;
    rates: Map<string, Rate>;
    catalog?: TopologyCatalog;
    filter?: TopologyFilter;
    limits?: TopologyLimits;
    /** Identities visible in the previous model; they are kept while near the cut-off. */
    previous?: { sources: string[]; destinations: string[] };
}

const VPN_PROTOCOLS = new Set([
    "wireguard", "amneziawg", "openvpn", "ikev2", "anyconnect", "sstp", "fortinet",
    "globalprotect", "l2tp", "l2tpv3", "softether", "nebula", "zerotier", "tailscale", "lan_link", "peer_tunnel",
]);

/** Splits "host:port", "[v6]:port" or a bare host. */
export function hostOf(address: string): string {
    const value = address.trim();
    if (!value) return "";
    if (value.startsWith("[")) {
        const end = value.indexOf("]");
        return end > 0 ? value.slice(1, end) : value;
    }
    const colons = value.split(":").length - 1;
    if (colons === 1) return value.slice(0, value.lastIndexOf(":"));
    return value;
}

const IPV4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

export function ipFamilyOf(host: string): IPFamily {
    const match = IPV4.exec(host);
    if (match) return match.slice(1).every(part => Number(part) <= 255) ? "ipv4" : "unknown";
    if (host.includes(":") && /^[0-9a-f:.]+(%.+)?$/i.test(host)) return "ipv6";
    return "unknown";
}

function isLoopback(host: string) {
    return host === "::1" || host.startsWith("127.") || host === "localhost";
}

export function networkOf(connection: Connection): NetworkKind {
    const type = connection.network?.connType?.toLowerCase() ?? "";
    if (type.startsWith("tcp")) return "tcp";
    if (type.startsWith("udp")) return "udp";
    return "other";
}

/** Host of the destination: the domain when known, otherwise the address. */
export function destinationHost(connection: Connection): string {
    return (hostOf(connection.domain) || hostOf(connection.addr) || hostOf(connection.ip)).toLowerCase();
}

/** Address family of the destination; a domain without a resolved IP is unknown. */
export function destinationFamily(connection: Connection): IPFamily {
    for (const candidate of [connection.ip, connection.addr]) {
        const family = ipFamilyOf(hostOf(candidate));
        if (family !== "unknown") return family;
    }
    return "unknown";
}

export function outboundClass(connection: Connection, catalog?: TopologyCatalog): OutboundClass {
    const mode = connection.mode.toLowerCase();
    if (mode === "block") return "block";
    if (mode === "direct") return "direct";
    if (mode === "gateway") return "other";
    if (!connection.nodeId) return "other";
    const node = catalog?.nodes.get(connection.nodeId);
    return node && node.protocols.some(protocol => VPN_PROTOCOLS.has(protocol)) ? "vpn" : "proxy";
}

function sourceKey(connection: Connection): { key: string; kind: NodeKind; name: string } {
    if (connection.process) return { key: `app:${connection.process}`, kind: "app", name: connection.process };
    const host = hostOf(connection.source);
    // Opened by the core itself (DNS bootstrap, probes...): the backend records the component.
    if (!host && !connection.inboundId && !connection.inboundName && connection.component) {
        return { key: `component:${connection.component}`, kind: "component", name: connection.component };
    }
    if (!host) return { key: "unknown", kind: "unknown", name: "" };
    if (isLoopback(host)) return { key: "local", kind: "local", name: "" };
    return { key: `device:${host}`, kind: "device", name: host };
}

function inboundKey(connection: Connection, catalog?: TopologyCatalog) {
    const id = connection.inboundId || connection.inboundName;
    if (!id && connection.component && !connection.source) return { id: "inbound:internal", kind: "internal" as NodeKind, name: "", type: "", refId: undefined };
    if (!id) return { id: "inbound:unknown", kind: "unknown" as NodeKind, name: "", type: "", refId: undefined };
    const info = connection.inboundId ? catalog?.inbounds.get(connection.inboundId) : undefined;
    return {
        id: `inbound:${id}`,
        kind: "inbound" as NodeKind,
        name: info?.name || connection.inboundName || connection.inboundId,
        type: info?.protocol ?? "",
        refId: connection.inboundId || undefined,
    };
}

function policyKey(connection: Connection) {
    const mode = connection.mode.toLowerCase() || "unknown";
    const rule = connection.ruleId || connection.ruleName;
    const selector = connection.selectorId || connection.selectorName;
    return {
        id: `policy:${rule || "default"}|${selector}|${rule ? "" : mode}`,
        kind: (rule ? "rule" : "default-route") as NodeKind,
        name: connection.ruleName || connection.ruleId,
        refId: connection.ruleId || undefined,
        selectorId: connection.selectorId || undefined,
        selectorName: connection.selectorName || connection.selectorId || undefined,
        mode,
    };
}

function outboundKey(connection: Connection, catalog?: TopologyCatalog) {
    const kind = outboundClass(connection, catalog);
    const mode = connection.mode.toLowerCase();
    if (kind === "block") return { id: "outbound:block", kind: "block" as NodeKind, name: "", type: "block", refId: undefined };
    if (kind === "direct") return { id: "outbound:direct", kind: "direct" as NodeKind, name: "", type: "direct", refId: undefined };
    if (mode === "gateway") return { id: "outbound:gateway", kind: "gateway" as NodeKind, name: "", type: "gateway", refId: undefined };
    if (!connection.nodeId) return { id: "outbound:unresolved", kind: "unknown" as NodeKind, name: "", type: "", refId: undefined };
    const info = catalog?.nodes.get(connection.nodeId);
    return {
        id: `outbound:${connection.nodeId}`,
        kind: kind as NodeKind,
        name: info?.name || connection.nodeName || connection.nodeId,
        type: info?.protocols.find(protocol => VPN_PROTOCOLS.has(protocol)) ?? lastOf(info?.protocols) ?? "",
        refId: connection.nodeId,
    };
}

export function matchesFilter(connection: Connection, filter: TopologyFilter, catalog?: TopologyCatalog): boolean {
    if (filter.network !== "all" && networkOf(connection) !== filter.network) return false;
    if (filter.family !== "all" && destinationFamily(connection) !== filter.family) return false;
    if (filter.classes.length && !filter.classes.includes(outboundClass(connection, catalog))) return false;
    if (filter.inbounds.length && !filter.inbounds.includes(inboundKey(connection, catalog).id)) return false;
    if (filter.outbounds.length && !filter.outbounds.includes(outboundKey(connection, catalog).id)) return false;
    if (filter.processes.length && !filter.processes.includes(connection.process)) return false;
    if (filter.geo.length && !filter.geo.includes(connection.geo || connection.outboundGeo)) return false;
    return true;
}

/** Connections whose domain, IP, process or node name contains the query. */
export function searchConnections(connections: Iterable<Connection>, query: string): Set<string> {
    const needle = query.trim().toLowerCase();
    const result = new Set<string>();
    if (!needle) return result;
    for (const connection of connections) {
        const fields = [connection.domain, connection.addr, connection.ip, connection.fakeIp, connection.process,
            connection.nodeName, connection.inboundName, connection.selectorName, connection.ruleName, connection.tlsServerName];
        if (fields.some(field => field && field.toLowerCase().includes(needle))) result.add(connection.id);
    }
    return result;
}

interface Bucket {
    key: string;
    up: number;
    down: number;
    count: number;
}

/**
 * The `limit` busiest identities, ranked by rate and then connection count.
 * An identity that was visible before stays visible while it ranks within
 * `limit + margin`, so a destination does not jump in and out of Others with
 * every sample.
 */
export function selectTop(buckets: Bucket[], limit: number, previous: Iterable<string> = [], margin = Math.max(2, Math.ceil(limit / 3))): Set<string> {
    if (buckets.length <= limit) return new Set(buckets.map(bucket => bucket.key));
    const ranked = [...buckets].sort((a, b) => (b.up + b.down) - (a.up + a.down) || b.count - a.count || a.key.localeCompare(b.key));
    const rank = new Map(ranked.map((bucket, index) => [bucket.key, index]));
    const kept = new Set<string>();
    for (const key of previous) {
        const position = rank.get(key);
        if (position !== undefined && position < limit + margin && kept.size < limit) kept.add(key);
    }
    for (const bucket of ranked) {
        if (kept.size >= limit) break;
        kept.add(bucket.key);
    }
    return kept;
}

function addTo(node: TopologyNode, connection: Connection, rate: Rate | undefined, network: NetworkKind) {
    node.connections++;
    if (network === "tcp") node.tcp++;
    else if (network === "udp") node.udp++;
    node.up += rate?.up ?? 0;
    node.down += rate?.down ?? 0;
    node.connectionIds.push(connection.id);
    if (connection.fakeIp) node.fakeIp = true;
}

function statusOf(node: TopologyNode): NodeStatus {
    if (node.connections === 0) return node.status;
    return node.up + node.down > 0 ? "active" : "open";
}

export function buildTopology(input: BuildInput): TopologyModel {
    const { rates, catalog, filter = emptyFilter(), limits = desktopLimits } = input;
    const all = [...input.connections];
    const connections = all.filter(connection => matchesFilter(connection, filter, catalog));

    // First pass: rank sources and destinations so only the busiest get their own node.
    const sourceBuckets = new Map<string, Bucket>();
    const destinationBuckets = new Map<string, Bucket>();
    for (const connection of connections) {
        const rate = rates.get(connection.id);
        for (const [buckets, key] of [[sourceBuckets, sourceKey(connection).key], [destinationBuckets, destinationHost(connection) || "unknown"]] as const) {
            const bucket = buckets.get(key) ?? { key, up: 0, down: 0, count: 0 };
            bucket.up += rate?.up ?? 0;
            bucket.down += rate?.down ?? 0;
            bucket.count++;
            buckets.set(key, bucket);
        }
    }
    const keptSources = selectTop([...sourceBuckets.values()], limits.sources, input.previous?.sources);
    const keptDestinations = selectTop([...destinationBuckets.values()], limits.destinations, input.previous?.destinations);
    const otherSources = sourceBuckets.size - keptSources.size;
    const otherDestinations = destinationBuckets.size - keptDestinations.size;

    const nodes = new Map<string, TopologyNode>();
    const edges = new Map<string, TopologyEdge>();
    const paths = new Map<string, string[]>();
    const node = (id: string, init: Omit<TopologyNode, "id" | "status" | "connections" | "tcp" | "udp" | "up" | "down" | "connectionIds">) => {
        let value = nodes.get(id);
        if (!value) {
            value = { id, status: "open", connections: 0, tcp: 0, udp: 0, up: 0, down: 0, connectionIds: [], ...init };
            nodes.set(id, value);
        }
        return value;
    };

    let up = 0;
    let down = 0;
    for (const connection of connections) {
        const rate = rates.get(connection.id);
        const network = networkOf(connection);
        up += rate?.up ?? 0;
        down += rate?.down ?? 0;

        const source = sourceKey(connection);
        const sourceNode = keptSources.has(source.key)
            ? node(`source:${source.key}`, { column: "source", kind: source.kind, name: source.name, type: source.kind })
            : node("source:others", { column: "source", kind: "others", name: "", type: "others", members: otherSources });

        const inbound = inboundKey(connection, catalog);
        const inboundNode = node(inbound.id, { column: "inbound", kind: inbound.kind, name: inbound.name, type: inbound.type, refId: inbound.refId });

        const policy = policyKey(connection);
        const policyNode = node(policy.id, {
            column: "policy", kind: policy.kind, name: policy.name, type: policy.mode, refId: policy.refId,
            selectorId: policy.selectorId, selectorName: policy.selectorName, mode: policy.mode,
        });

        const outbound = outboundKey(connection, catalog);
        const outboundNode = node(outbound.id, { column: "outbound", kind: outbound.kind, name: outbound.name, type: outbound.type, refId: outbound.refId });

        const host = destinationHost(connection) || "unknown";
        const destinationNode = keptDestinations.has(host)
            ? node(`destination:${host}`, {
                column: "destination",
                kind: host === "unknown" ? "unknown" : ipFamilyOf(host) === "unknown" ? "domain" : "ip",
                name: host === "unknown" ? "" : host,
                type: host === "unknown" ? "" : ipFamilyOf(host) === "unknown" ? "domain" : ipFamilyOf(host),
            })
            : node("destination:others", { column: "destination", kind: "others", name: "", type: "others", members: otherDestinations });

        const path = [sourceNode, inboundNode, policyNode, outboundNode, destinationNode];
        for (const item of path) addTo(item, connection, rate, network);
        for (let index = 0; index < path.length - 1; index++) {
            const id = `${path[index].id}>${path[index + 1].id}#${network}`;
            let edge = edges.get(id);
            if (!edge) {
                edge = { id, from: path[index].id, to: path[index + 1].id, network, connections: 0, up: 0, down: 0, connectionIds: [] };
                edges.set(id, edge);
            }
            edge.connections++;
            edge.up += rate?.up ?? 0;
            edge.down += rate?.down ?? 0;
            edge.connectionIds.push(connection.id);
        }
        paths.set(connection.id, path.map(item => item.id));
    }

    // Running inbounds and instantiated outbounds stay visible without traffic,
    // marked idle, so configured paths are distinguishable from used ones.
    for (const info of catalog?.inbounds.values() ?? []) {
        if (!info.enabled || nodes.has(`inbound:${info.id}`)) continue;
        if (filter.inbounds.length && !filter.inbounds.includes(`inbound:${info.id}`)) continue;
        const runtime = info.status?.toLowerCase();
        node(`inbound:${info.id}`, { column: "inbound", kind: "inbound", name: info.name, type: info.protocol, refId: info.id }).status =
            runtime === "error" || runtime === "failed" || runtime === "stopped" ? "offline" : runtime === "degraded" ? "degraded" : "idle";
    }
    if (!activeFilterCount(filter)) {
        let idle = 0;
        for (const id of catalog?.activeNodes ?? []) {
            if (idle >= limits.idleOutbounds || nodes.has(`outbound:${id}`)) continue;
            const info = catalog?.nodes.get(id);
            const vpn = info?.protocols.some(protocol => VPN_PROTOCOLS.has(protocol));
            node(`outbound:${id}`, {
                column: "outbound", kind: vpn ? "vpn" : "proxy", name: info?.name || id,
                type: info?.protocols.find(protocol => VPN_PROTOCOLS.has(protocol)) ?? lastOf(info?.protocols) ?? "", refId: id,
            }).status = "idle";
            idle++;
        }
    }

    for (const value of nodes.values()) {
        value.status = statusOf(value);
        if (value.column === "outbound" && value.refId) {
            const runtime = catalog?.nodeStatus.get(value.refId);
            if (runtime === "degraded") value.status = "degraded";
            else if (runtime === "disabled") value.status = "offline";
        }
    }

    return {
        nodes: [...nodes.values()],
        edges: [...edges.values()],
        paths,
        visible: connections.length,
        total: all.length,
        up,
        down,
        pinned: { sources: [...keptSources], destinations: [...keptDestinations] },
    };
}

/** Nodes and edges on the paths of the given connections. */
export function highlightPaths(model: TopologyModel, connectionIds: Iterable<string>) {
    const nodes = new Set<string>();
    const edges = new Set<string>();
    const edgeByPair = new Map<string, TopologyEdge[]>();
    for (const edge of model.edges) {
        const key = `${edge.from}>${edge.to}`;
        const list = edgeByPair.get(key) ?? [];
        list.push(edge);
        edgeByPair.set(key, list);
    }
    const wanted = new Set(connectionIds);
    for (const id of wanted) {
        const path = model.paths.get(id);
        if (!path) continue;
        path.forEach(nodeId => nodes.add(nodeId));
        for (let index = 0; index < path.length - 1; index++) {
            for (const edge of edgeByPair.get(`${path[index]}>${path[index + 1]}`) ?? []) {
                if (edge.connectionIds.some(connectionId => wanted.has(connectionId))) edges.add(edge.id);
            }
        }
    }
    return { nodes, edges };
}

export interface FilterOptions {
    inbounds: { id: string; label: string }[];
    outbounds: { id: string; label: string }[];
    processes: string[];
    geo: string[];
}

/** Choices for the filter menus, from every active connection (not only the filtered ones). */
export function filterOptions(connections: Iterable<Connection>, catalog?: TopologyCatalog): FilterOptions {
    const inbounds = new Map<string, string>();
    const outbounds = new Map<string, string>();
    const processes = new Set<string>();
    const geo = new Set<string>();
    for (const connection of connections) {
        const inbound = inboundKey(connection, catalog);
        inbounds.set(inbound.id, inbound.name);
        const outbound = outboundKey(connection, catalog);
        outbounds.set(outbound.id, outbound.name);
        if (connection.process) processes.add(connection.process);
        const country = connection.geo || connection.outboundGeo;
        if (country) geo.add(country);
    }
    const sorted = (values: Map<string, string>) => [...values].map(([id, label]) => ({ id, label })).sort((a, b) => (a.label || a.id).localeCompare(b.label || b.id));
    return { inbounds: sorted(inbounds), outbounds: sorted(outbounds), processes: [...processes].sort(), geo: [...geo].sort() };
}

function lastOf(values: string[] | undefined) {
    return values && values.length ? values[values.length - 1] : undefined;
}
