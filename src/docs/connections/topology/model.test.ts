import { normalizeConnection, type Connection } from "@/contract/connection";
import { describe, expect, it } from "vitest";
import { applyConnectionEvents } from "../v2/connection-events";
import {
    buildTopology, destinationFamily, emptyCatalog, emptyFilter, filterOptions, highlightPaths, hostOf, outboundClass,
    searchConnections, selectTop, type TopologyCatalog,
} from "./model";
import type { Rate } from "./rates";

function connection(id: string, value: Partial<Connection> = {}): Connection {
    return normalizeConnection({
        id,
        addr: "example.com:443",
        domain: "example.com:443",
        network: { connType: "tcp", underlyingType: "tcp" },
        source: "192.168.1.20:50000",
        inboundId: "in-socks",
        inboundName: "SOCKS",
        mode: "proxy",
        ruleId: "rule-1",
        ruleName: "Work",
        nodeId: "node-a",
        nodeName: "Tokyo",
        ...value,
    });
}

const rates = (entries: Record<string, Rate>) => new Map(Object.entries(entries));

describe("buildTopology", () => {
    it("names app sources by app and keeps their full path", () => {
        const lark = "/Applications/Lark.app/Contents/MacOS/Lark";
        const model = buildTopology({ connections: [connection("1", { process: lark })], rates: rates({}) });
        const source = model.nodes.find(node => node.id === `source:app:${lark}`);
        expect(source).toMatchObject({ kind: "app", name: "Lark", path: lark });
    });
    it("names Android packages by their app label when the platform API knows them", () => {
        const catalog = { ...emptyCatalog(), apps: new Map([["com.android.chrome", "Chrome"]]) };
        const model = buildTopology({ connections: [connection("1", { process: "com.android.chrome" }), connection("2", { process: "com.example.unknown" })], rates: rates({}), catalog });
        expect(model.nodes.find(node => node.id === "source:app:com.android.chrome")).toMatchObject({ name: "Chrome", path: "com.android.chrome", iconUrl: "/android/v1/apps/icon?package=com.android.chrome" });
        expect(model.nodes.find(node => node.id === "source:app:com.example.unknown")).toMatchObject({ name: "com.example.unknown", iconUrl: undefined });
        expect(filterOptions([connection("1", { process: "com.android.chrome" })], catalog).processes).toEqual([{ id: "com.android.chrome", label: "Chrome" }]);
    });
    it("maps one connection onto a five-column path", () => {
        const model = buildTopology({ connections: [connection("1", { process: "curl" })], rates: rates({ "1": { up: 100, down: 900 } }) });
        expect(model.paths.get("1")).toEqual([
            "source:app:curl", "inbound:in-socks", "policy:rule-1|", "outbound:node-a", "destination:example.com",
        ]);
        expect(model.edges.map(edge => edge.id)).toEqual([
            "source:app:curl>inbound:in-socks#tcp",
            "inbound:in-socks>policy:rule-1|#tcp",
            "policy:rule-1|>outbound:node-a#tcp",
            "outbound:node-a>destination:example.com#tcp",
        ]);
        for (const node of model.nodes) {
            expect(node).toMatchObject({ connections: 1, up: 100, down: 900, status: "active" });
        }
        expect(model.nodes.find(node => node.id === "outbound:node-a")).toMatchObject({ name: "Tokyo", kind: "proxy", refId: "node-a" });
    });

    it("aggregates connections sharing a hop into one edge, per protocol", () => {
        const model = buildTopology({
            connections: [
                connection("1", { domain: "a.example:443" }),
                connection("2", { domain: "b.example:443" }),
                connection("3", { domain: "a.example:443", network: { connType: "udp", underlyingType: "udp" } }),
            ],
            rates: rates({ "1": { up: 10, down: 20 }, "2": { up: 1, down: 2 }, "3": { up: 5, down: 0 } }),
        });
        const tcp = model.edges.find(edge => edge.id === "inbound:in-socks>policy:rule-1|#tcp")!;
        expect(tcp).toMatchObject({ connections: 2, up: 11, down: 22, connectionIds: ["1", "2"] });
        const udp = model.edges.find(edge => edge.id === "inbound:in-socks>policy:rule-1|#udp")!;
        expect(udp).toMatchObject({ connections: 1, up: 5, down: 0 });
        const inbound = model.nodes.find(node => node.id === "inbound:in-socks")!;
        expect(inbound).toMatchObject({ connections: 3, tcp: 2, udp: 1, up: 16, down: 22 });
    });

    it("groups by inbound and outbound identity", () => {
        const model = buildTopology({
            connections: [
                connection("1", { inboundId: "in-a", inboundName: "A" }),
                connection("2", { inboundId: "in-b", inboundName: "B" }),
                connection("3", { inboundId: "in-a", inboundName: "A", mode: "direct", nodeId: "", nodeName: "" }),
                connection("4", { inboundId: "in-b", inboundName: "B", mode: "block", nodeId: "" }),
            ],
            rates: new Map(),
        });
        const ids = model.nodes.map(node => node.id);
        expect(ids.filter(id => id.startsWith("inbound:"))).toEqual(["inbound:in-a", "inbound:in-b"]);
        expect(ids.filter(id => id.startsWith("outbound:"))).toEqual(["outbound:node-a", "outbound:direct", "outbound:block"]);
        expect(model.nodes.find(node => node.id === "inbound:in-a")!.connections).toBe(2);
    });

    it("keeps upload on the forward direction and download on the return", () => {
        const model = buildTopology({ connections: [connection("1")], rates: rates({ "1": { up: 2048, down: 0 } }) });
        for (const edge of model.edges) expect(edge).toMatchObject({ up: 2048, down: 0 });
        expect(model.up).toBe(2048);
        expect(model.down).toBe(0);
    });

    it("marks nodes with open but silent connections as open, not active", () => {
        const model = buildTopology({ connections: [connection("1")], rates: new Map() });
        expect(new Set(model.nodes.map(node => node.status))).toEqual(new Set(["open"]));
    });

    it("represents missing fields as unknown nodes instead of guessing", () => {
        const model = buildTopology({
            connections: [connection("1", { source: "", inboundId: "", inboundName: "", ruleId: "", ruleName: "", nodeId: "", nodeName: "", addr: "", domain: "", ip: "", mode: "proxy" })],
            rates: new Map(),
        });
        expect(model.paths.get("1")).toEqual(["source:unknown", "inbound:unknown", "policy:default|", "outbound:unresolved", "destination:unknown"]);
        expect(model.nodes.map(node => node.kind)).toEqual(["unknown", "unknown", "default-route", "unknown", "unknown"]);
    });

    it("keeps one default route whatever mode its connections ended up in", () => {
        const model = buildTopology({
            connections: [
                connection("1", { ruleId: "", ruleName: "", mode: "proxy" }),
                connection("2", { ruleId: "", ruleName: "", mode: "direct" }),
                connection("3", { ruleId: "", ruleName: "", mode: "proxy" }),
            ],
            rates: new Map(),
        });
        const routes = model.nodes.filter(node => node.kind === "default-route");
        expect(routes).toHaveLength(1);
        expect(routes[0]).toMatchObject({ connections: 3, mode: "mixed" });
        // One mode only: the card keeps naming it.
        const proxyOnly = buildTopology({ connections: [connection("1", { ruleId: "", ruleName: "", mode: "proxy" })], rates: new Map() });
        expect(proxyOnly.nodes.find(node => node.kind === "default-route")?.mode).toBe("proxy");
    });

    it("tells VPN nodes from proxies only from the node chain", () => {
        const catalog: TopologyCatalog = { ...emptyCatalog(), nodes: new Map([["node-a", { id: "node-a", name: "Office", protocols: ["wireguard"] }]]) };
        expect(outboundClass(connection("1"), catalog)).toBe("vpn");
        expect(outboundClass(connection("1"))).toBe("proxy");
        expect(outboundClass(connection("1", { mode: "direct" }), catalog)).toBe("direct");
        const model = buildTopology({ connections: [connection("1")], rates: new Map(), catalog });
        expect(model.nodes.find(node => node.id === "outbound:node-a")).toMatchObject({ kind: "vpn", name: "Office", type: "wireguard" });
    });

    it("shows running inbounds and instantiated nodes as idle, never as active", () => {
        const catalog: TopologyCatalog = {
            ...emptyCatalog(),
            inbounds: new Map([
                ["in-http", { id: "in-http", name: "HTTP", protocol: "http", enabled: true, status: "running" }],
                ["in-off", { id: "in-off", name: "Off", protocol: "http", enabled: false }],
                ["in-err", { id: "in-err", name: "Broken", protocol: "tun", enabled: true, status: "error" }],
            ]),
            nodes: new Map([["node-b", { id: "node-b", name: "Spare", protocols: ["socks5"] }]]),
            activeNodes: ["node-b"],
        };
        const model = buildTopology({ connections: [], rates: new Map(), catalog });
        expect(model.nodes.map(node => [node.id, node.status, node.connections])).toEqual([
            ["inbound:in-http", "idle", 0],
            ["inbound:in-err", "offline", 0],
            ["outbound:node-b", "idle", 0],
        ]);
        expect(model.edges).toEqual([]);
    });

    it("filters connections before aggregating", () => {
        const all = [
            connection("1", { network: { connType: "udp", underlyingType: "udp" }, ip: "10.0.0.1:53" }),
            connection("2", { ip: "[2001:db8::1]:443", process: "firefox", geo: "jp" }),
            connection("3", { mode: "direct", nodeId: "", inboundId: "in-http", inboundName: "HTTP" }),
        ];
        const run = (patch: Partial<ReturnType<typeof emptyFilter>>) => buildTopology({ connections: all, rates: new Map(), filter: { ...emptyFilter(), ...patch } });
        expect(run({ network: "udp" }).visible).toBe(1);
        expect(run({ family: "ipv6" }).paths.has("2")).toBe(true);
        expect(run({ family: "ipv4" }).visible).toBe(1);
        expect(run({ classes: ["direct"] }).paths.has("3")).toBe(true);
        expect(run({ inbounds: ["inbound:in-http"] }).visible).toBe(1);
        expect(run({ outbounds: ["outbound:node-a"] }).visible).toBe(2);
        expect(run({ processes: ["firefox"] }).visible).toBe(1);
        expect(run({ geo: ["jp"] }).visible).toBe(1);
        const filtered = run({ network: "udp" });
        expect(filtered.total).toBe(3);
        expect(filtered.nodes.every(node => node.connections === 1)).toBe(true);
    });

    it("searches domain, IP, process and node names and highlights the real path", () => {
        const all = [
            connection("1", { domain: "api.github.com:443", process: "git" }),
            connection("2", { domain: "", addr: "1.1.1.1:53", ip: "1.1.1.1:53", nodeName: "Seoul", nodeId: "node-s" }),
        ];
        expect([...searchConnections(all, "GITHUB")]).toEqual(["1"]);
        expect([...searchConnections(all, "1.1.1")]).toEqual(["2"]);
        expect([...searchConnections(all, "git")]).toEqual(["1"]);
        expect([...searchConnections(all, "seoul")]).toEqual(["2"]);
        expect(searchConnections(all, "  ").size).toBe(0);
        const model = buildTopology({ connections: all, rates: new Map() });
        const emphasis = highlightPaths(model, ["2"]);
        expect(emphasis.nodes).toEqual(new Set(model.paths.get("2")));
        expect([...emphasis.edges].every(id => model.edges.find(edge => edge.id === id)!.connectionIds.includes("2"))).toBe(true);
        expect(emphasis.nodes.has("outbound:node-a")).toBe(false);
    });

    it("keeps 1000 connections within a bounded number of nodes", () => {
        const many = Array.from({ length: 1000 }, (_, index) => connection(String(index), {
            domain: `host-${index}.example:443`,
            process: `app-${index % 40}`,
            inboundId: `in-${index % 3}`,
            nodeId: `node-${index % 5}`,
            network: { connType: index % 4 ? "tcp" : "udp", underlyingType: "tcp" },
        }));
        const rateMap = new Map(many.map((item, index) => [item.id, { up: index, down: index * 2 }]));
        const model = buildTopology({ connections: many, rates: rateMap });
        expect(model.nodes.filter(node => node.column === "destination")).toHaveLength(13);
        expect(model.nodes.filter(node => node.column === "source")).toHaveLength(9);
        expect(model.nodes.find(node => node.id === "destination:others")).toMatchObject({ kind: "others", members: 988 });
        expect(model.nodes.length).toBeLessThanOrEqual(9 + 3 + 1 + 5 + 13);
        // Aggregation preserves totals.
        const sum = model.nodes.filter(node => node.column === "destination").reduce((total, node) => total + node.up, 0);
        expect(sum).toBe(model.up);
        expect(model.visible).toBe(1000);
        // The busiest destinations are the ones kept.
        expect(model.nodes.some(node => node.id === "destination:host-999.example")).toBe(true);
    });

    it("keeps node ids stable while connections come and go", () => {
        let state: Record<string, Connection> = {};
        state = applyConnectionEvents(state, [{ type: "snapshot", connections: [connection("1"), connection("2", { inboundId: "in-http", inboundName: "HTTP" })] }]);
        const before = buildTopology({ connections: Object.values(state), rates: new Map() });
        state = applyConnectionEvents(state, [{ type: "added", connections: [connection("3", { domain: "new.example:443" })] }, { type: "removed", ids: ["2"] }]);
        const after = buildTopology({ connections: Object.values(state), rates: new Map() });
        expect(after.paths.get("1")).toEqual(before.paths.get("1"));
        expect(after.nodes.some(node => node.id === "inbound:in-http")).toBe(false);
        expect(after.nodes.some(node => node.id === "destination:new.example")).toBe(true);
        expect(after.total).toBe(2);
        // Re-adding a duplicate event does not create a second node or count twice.
        state = applyConnectionEvents(state, [{ type: "added", connections: [connection("3", { domain: "new.example:443" })] }]);
        expect(buildTopology({ connections: Object.values(state), rates: new Map() }).nodes.find(node => node.id === "destination:new.example")!.connections).toBe(1);
    });
});

describe("selectTop", () => {
    const bucket = (key: string, rate: number) => ({ key, up: rate, down: 0, count: 1 });
    it("keeps previously visible keys near the cut-off", () => {
        const buckets = [bucket("a", 100), bucket("b", 90), bucket("c", 80), bucket("d", 70)];
        expect(selectTop(buckets, 2)).toEqual(new Set(["a", "b"]));
        expect(selectTop(buckets, 2, ["c"])).toEqual(new Set(["c", "a"]));
        expect(selectTop([...buckets, bucket("e", 1), bucket("f", 0)], 2, ["f"], 2)).toEqual(new Set(["a", "b"]));
    });
});

describe("helpers", () => {
    it("parses hosts and address families", () => {
        expect(hostOf("example.com:443")).toBe("example.com");
        expect(hostOf("[2001:db8::1]:443")).toBe("2001:db8::1");
        expect(hostOf("2001:db8::1")).toBe("2001:db8::1");
        expect(destinationFamily(connection("1", { ip: "", addr: "example.com:443" }))).toBe("unknown");
        expect(destinationFamily(connection("1", { ip: "8.8.8.8:53" }))).toBe("ipv4");
    });

    it("lists filter options from all connections", () => {
        const options = filterOptions([connection("1", { process: "curl", geo: "us" }), connection("2", { mode: "direct", nodeId: "" })]);
        expect(options.processes).toEqual([{ id: "curl", label: "curl" }]);
        expect(options.geo).toEqual(["us"]);
        expect(options.outbounds.map(item => item.id).sort()).toEqual(["outbound:direct", "outbound:node-a"]);
    });
});
