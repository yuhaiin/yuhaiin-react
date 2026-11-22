import type { DNSHistoryRecord } from "@/api/dns-history";
import { describe, expect, it } from "vitest";
import { buildDnsTopology } from "./dns";

let next = 1;
function record(value: Partial<DNSHistoryRecord>): DNSHistoryRecord {
    return {
        id: next++, createdAt: "2026-11-22T08:00:00Z", durationNs: 2_000_000, transport: "udp", sourceType: "local_dns",
        domain: "example.com.", queryType: "A", queryClass: "IN", transactionId: 1, cacheStatus: "miss", resolutionSource: "upstream",
        resolver: "cloudflare", resolverLabel: "Cloudflare", server: "1.1.1.1:53",
        fakeip: { requested: false, returned: false, reason: "", allocation: "", force: false, global: false, skipCheck: false },
        outcome: "success", requestSize: 40, responseSize: 80, sentBytes: 80, answerCount: 1, authorityCount: 0, additionalCount: 0,
        ...value,
    } as DNSHistoryRecord;
}

describe("buildDnsTopology", () => {
    it("builds client → entry → route → resolver → answer source from history only", () => {
        const dns = buildDnsTopology([
            record({ processName: "curl", routeMode: "proxy" }),
            record({ processName: "curl", routeMode: "proxy", resolutionSource: "cache", cacheStatus: "hit" }),
            record({ clientIp: "10.0.0.5", sourceType: "dns_hijack", inboundId: "tun", inboundName: "TUN", routeMode: "direct", outcome: "timeout" }),
        ]);
        expect(dns.records).toBe(3);
        const ids = dns.nodes.map(node => node.id);
        expect(ids).toEqual(expect.arrayContaining([
            "dns:client:curl", "dns:client:10.0.0.5", "dns:entry:local_dns:udp", "dns:entry:hijack:tun",
            "dns:route:proxy", "dns:route:direct", "dns:resolver:cloudflare", "dns:answer:upstream:1.1.1.1:53", "dns:answer:cache",
        ]));
        const resolver = dns.nodes.find(node => node.id === "dns:resolver:cloudflare")!;
        expect(resolver.dns).toMatchObject({ queries: 3, failures: 1, cacheHits: 1, averageMs: 2 });
        expect(dns.nodes.find(node => node.id === "dns:client:curl")!.connections).toBe(2);
        // History carries counts, never byte rates.
        expect(dns.edges.every(edge => edge.up === 0 && edge.down === 0)).toBe(true);
        expect(dns.edges.find(edge => edge.id === "dns:client:curl>dns:entry:local_dns:udp#dns")!.connections).toBe(2);
    });

    it("maps FakeIP answers back to their domain", () => {
        const dns = buildDnsTopology([record({
            domain: "video.example.", resolutionSource: "fakeip",
            fakeip: { requested: true, returned: true, ipv4: "198.18.0.7", ipv6: "fc00::7", reason: "", allocation: "new", force: false, global: false, skipCheck: false },
        })]);
        expect(dns.fakeIps.get("198.18.0.7")?.domain).toBe("video.example");
        expect(dns.fakeIps.get("fc00::7")?.domain).toBe("video.example");
        expect(dns.nodes.find(node => node.id === "dns:answer:fakeip")!.dns!.fakeip).toBe(1);
    });

    it("aggregates quiet clients and marks failing paths", () => {
        const records = Array.from({ length: 10 }, (_, index) => record({ processName: `app-${index}`, outcome: "servfail" }));
        const dns = buildDnsTopology(records, 3);
        expect(dns.nodes.filter(node => node.column === "source")).toHaveLength(4);
        expect(dns.nodes.find(node => node.id === "dns:client:others")!.connections).toBe(7);
        expect(dns.nodes.find(node => node.id === "dns:resolver:cloudflare")!.status).toBe("degraded");
        expect(buildDnsTopology([]).nodes).toEqual([]);
    });
});
