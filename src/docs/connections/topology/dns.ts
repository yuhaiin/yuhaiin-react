import type { DNSHistoryRecord } from "@/api/dns-history";
import type { Column, NodeKind, TopologyEdge, TopologyNode } from "./model";

/**
 * The DNS path, built from DNS history records only:
 * client → entry (local listener or hijack) → DNS route → resolver → answer source.
 *
 * It is a separate, auxiliary graph: history describes requests that already
 * finished, not traffic in flight, so its edges carry query counts and are
 * never animated. Nothing here is derived from configuration; a field the
 * server did not record stays "unknown".
 */
export interface DnsTopology {
    nodes: TopologyNode[];
    edges: TopologyEdge[];
    /** FakeIP address → domain, from records whose answer was a FakeIP. */
    fakeIps: Map<string, { domain: string; recordId: number; at: string }>;
    records: number;
}

/** DNS columns share the x positions of the traffic columns above them. */
const COLUMN: Record<"client" | "entry" | "route" | "resolver" | "upstream", Column> = {
    client: "source", entry: "inbound", route: "policy", resolver: "outbound", upstream: "destination",
};

const isFailure = (outcome: string) => !["success", "nxdomain", "nodata"].includes(outcome);

function answerSource(record: DNSHistoryRecord): { key: string; name: string; type: string } {
    switch (record.resolutionSource) {
        case "upstream": return { key: `upstream:${record.server || "unknown"}`, name: record.server || "", type: record.serverType || "upstream" };
        case "fakeip": return { key: "fakeip", name: "", type: "fakeip" };
        case "cache": return { key: "cache", name: "", type: "cache" };
        case "hosts": return { key: "hosts", name: "", type: "hosts" };
        case "custom_response": return { key: "custom", name: "", type: "custom_response" };
        case "local_response": return { key: "local", name: "", type: "local_response" };
        case "blocked": return { key: "blocked", name: "", type: "blocked" };
        default: return { key: "unknown", name: "", type: "unknown" };
    }
}

export function buildDnsTopology(records: DNSHistoryRecord[], limit = 6): DnsTopology {
    const nodes = new Map<string, TopologyNode>();
    const edges = new Map<string, TopologyEdge>();
    const fakeIps = new Map<string, { domain: string; recordId: number; at: string }>();
    const durations = new Map<string, number>();

    // Clients beyond the busiest `limit` share one node.
    const clientCounts = new Map<string, number>();
    const clientOf = (record: DNSHistoryRecord) => record.processName || record.clientIp || "";
    for (const record of records) clientCounts.set(clientOf(record), (clientCounts.get(clientOf(record)) ?? 0) + 1);
    const keptClients = new Set([...clientCounts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, limit).map(([key]) => key));

    const node = (id: string, column: Column, kind: NodeKind, name: string, type: string, refId?: string) => {
        let value = nodes.get(id);
        if (!value) {
            value = {
                id, column, kind, name, type, refId, status: "open", connections: 0, tcp: 0, udp: 0, up: 0, down: 0, connectionIds: [],
                dns: { queries: 0, failures: 0, fakeip: 0, cacheHits: 0, averageMs: 0, recordIds: [] },
            };
            nodes.set(id, value);
        }
        return value;
    };

    for (const record of records) {
        const failed = isFailure(record.outcome);
        const client = clientOf(record);
        const clientNode = keptClients.has(client)
            ? node(`dns:client:${client || "unknown"}`, COLUMN.client, client ? "dns-client" : "unknown", client, record.processName ? "app" : record.clientIp ? "device" : "")
            : node("dns:client:others", COLUMN.client, "others", "", "others");
        const entryKey = record.sourceType === "dns_hijack" ? `hijack:${record.inboundId || record.inboundName || "unknown"}` : `${record.sourceType || "unknown"}:${record.transport}`;
        const entryNode = node(`dns:entry:${entryKey}`, COLUMN.entry, "dns-entry", record.sourceType === "dns_hijack" ? record.inboundName || "" : "", record.sourceType || "unknown", record.inboundId);
        const routeNode = node(`dns:route:${record.routeRuleId || record.routeRuleName || record.routeMode || "unknown"}`, COLUMN.route, "dns-route",
            record.routeRuleName || "", record.routeMode || "unknown", record.routeRuleId);
        const resolverNode = node(`dns:resolver:${record.resolver || "none"}`, COLUMN.resolver, "dns-resolver", record.resolverLabel || record.resolver || "", "resolver");
        const source = answerSource(record);
        const upstreamNode = node(`dns:answer:${source.key}`, COLUMN.upstream, "dns-upstream", source.name, source.type);

        const path = [clientNode, entryNode, routeNode, resolverNode, upstreamNode];
        for (const item of path) {
            const stats = item.dns!;
            stats.queries++;
            if (failed) stats.failures++;
            if (record.fakeip?.returned) stats.fakeip++;
            if (record.cacheStatus === "hit") stats.cacheHits++;
            if (stats.recordIds.length < 50) stats.recordIds.push(record.id);
            item.connections = stats.queries;
            durations.set(item.id, (durations.get(item.id) ?? 0) + record.durationNs / 1e6);
        }
        for (let index = 0; index < path.length - 1; index++) {
            const id = `${path[index].id}>${path[index + 1].id}#dns`;
            let edge = edges.get(id);
            if (!edge) {
                edge = { id, from: path[index].id, to: path[index + 1].id, network: "udp", connections: 0, up: 0, down: 0, connectionIds: [] };
                edges.set(id, edge);
            }
            edge.connections++;
        }
        if (record.fakeip?.returned && record.domain) {
            for (const address of [record.fakeip.ipv4, record.fakeip.ipv6]) {
                if (address && !fakeIps.has(address)) fakeIps.set(address, { domain: record.domain.replace(/\.$/, ""), recordId: record.id, at: record.createdAt });
            }
        }
    }
    for (const item of nodes.values()) {
        item.dns!.averageMs = item.dns!.queries ? (durations.get(item.id) ?? 0) / item.dns!.queries : 0;
        item.status = item.dns!.failures === item.dns!.queries && item.dns!.queries > 0 ? "degraded" : "open";
    }
    return { nodes: [...nodes.values()], edges: [...edges.values()], fakeIps, records: records.length };
}
