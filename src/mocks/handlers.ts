import { http, HttpResponse } from "msw";

const nodes = [
    { id: "jp-tokyo-01", name: "Tokyo Edge", group: "production", origin: "manual", enabled: true, chain: [{ type: "shadowsocks", shadowsocks: { address: "jp.example.net", port: 443, method: "2022-blake3-aes-128-gcm", password: "preview-password" } }] },
    { id: "us-west-02", name: "US West", group: "production", origin: "remote", enabled: true, chain: [{ type: "vmess", vmess: { address: "us.example.net", port: 443, uuid: "00000000-0000-0000-0000-000000000000", security: "auto" } }] },
    { id: "direct", name: "Direct", group: "system", origin: "manual", enabled: true, chain: [{ type: "direct", direct: { network_interface: "" } }] },
    { id: "block", name: "Block", group: "system", origin: "manual", enabled: true, chain: [{ type: "reject", reject: {} }] },
];

const inbounds = [
    { id: "socks-main", name: "Desktop SOCKS", enabled: true, network: { type: "tcp_udp", tcp_udp: { host: "127.0.0.1:1080", udp: "enabled" } }, transports: [{ type: "normal", normal: {} }], protocol: { type: "socks5", socks5: { username: "", password: "", udp: true } } },
    { id: "http-main", name: "HTTP Proxy", enabled: true, network: { type: "tcp_udp", tcp_udp: { host: "127.0.0.1:8080", udp: "tcp_only" } }, transports: [{ type: "tls", tls: {} }], protocol: { type: "http", http: { username: "", password: "" } } },
    { id: "tun0", name: "System Tunnel", enabled: false, network: { type: "empty", empty: {} }, transports: [{ type: "normal", normal: {} }], protocol: { type: "tun", tun: { name: "yuhaiin0", mtu: 1500, forceFakeIp: true, skipMulticast: true, driver: "fdbased", portal: "", portalV6: "", routes: [], excludes: [], postUp: [], postDown: [] } } },
];

const connections = [
    { id: "1", addr: "192.168.1.24:53122", source: "192.168.1.24", inbound: "socks-main", inboundName: "Desktop SOCKS", outbound: "Tokyo Edge", destination: "api.github.com:443", domain: "api.github.com", tag: "tailscale", nodeId: "jp-tokyo-01", nodeName: "Tokyo Edge", matchHistory: [{ ruleName: "Tailscale private routes", history: [{ listName: "tailscale", matched: true }] }], network: { connType: "tcp", underlyingType: "" }, protocol: "tcp", process: "curl", mode: "proxy" },
    { id: "2", addr: "192.168.1.10:44880", source: "192.168.1.10", inbound: "http-main", inboundName: "HTTP Proxy", outbound: "US West", destination: "registry.npmjs.org:443", domain: "registry.npmjs.org", tag: "to-us-west", nodeId: "us-west-02", nodeName: "US West", matchHistory: [{ ruleName: "Streaming", history: [{ listName: "streaming", matched: true }] }], network: { connType: "tcp", underlyingType: "" }, protocol: "tcp", process: "node", mode: "proxy" },
    { id: "3", addr: "192.168.1.24:53512", source: "192.168.1.24", inbound: "socks-main", inboundName: "Desktop SOCKS", outbound: "Direct", destination: "fonts.googleapis.com:443", domain: "fonts.googleapis.com", tag: "", nodeId: "direct", nodeName: "Direct", matchHistory: [{ ruleName: "Private traffic", history: [{ listName: "private-domains", matched: true }] }], network: { connType: "tcp", underlyingType: "" }, protocol: "tcp", process: "Chrome", mode: "direct" },
];

const subscriptions = [
    { name: "Team gateway", url: "https://example.com/sub/team", type: "reserve" },
    { name: "Travel nodes", url: "https://example.com/sub/travel", type: "vmess" },
];

const publishes = [
    { name: "home-pack", points: [nodes[0].id, nodes[1].id], path: "share/home", password: "", address: "proxy.example.com:443", insecure: false },
];

const resolvers = [
    { id: "system", type: "system", host: "system default", system: true },
    { id: "cloudflare", type: "doh", host: "https://cloudflare-dns.com/dns-query", system: false },
];

const routeLists = [
    { name: "private-domains", type: "domain", source: "local", itemCount: 248, errorCount: 0, preview: "internal.example.com" },
    { name: "ads", type: "host", source: "remote", itemCount: 18420, errorCount: 0, preview: "https://lists.example.com/ads.txt" },
];

const routeRules = [
    { name: "Private traffic", index: 0, disabled: false, mode: "direct", tag: "", resolver: "system", ruleCount: 1 },
    { name: "Tailscale private routes", index: 1, disabled: false, mode: "proxy", tag: "tailscale", resolver: "cloudflare", ruleCount: 2 },
];

const routeTags = [
    { name: "tailscale", type: "node", hash: ["jp-tokyo-01", "us-west-02"] },
    { name: "to-us-west", type: "node", hash: ["us-west-02"] },
    { name: "work", type: "host", hash: ["d4e5f6"] },
];

let mockSettings = {
    ipv6: true,
    useDefaultInterface: true,
    netInterface: "",
    pprof: false,
    systemProxy: { http: true, socks5: false },
    logcat: { level: "info", save: true, ignoreTimeoutError: false, ignoreDnsError: false },
    advanced: { udpBufferSize: 2048, relayBufferSize: 4096, udpRingbufferSize: 250, happyEyeballsSemaphore: 250 },
    backup: { instanceName: "preview", interval: 24, lastBackupHash: "" },
};
let mockInboundConfig = { hijackDns: true, hijackDnsFakeIp: true, sniff: true };
let mockRouteConfig = { directResolver: "system", proxyResolver: "cloudflare", resolveLocally: true, udpProxyFqdnStrategy: "default" };
let mockRouteListConfig = { refreshInterval: "86400", lastRefreshTime: String(Math.floor(Date.now() / 1000) - 3600), error: "", hostIndexDisk: false, maxMindDbGeoIp: { downloadUrl: "", error: "" } };
let mockResolverHosts = { hosts: { "localhost": "127.0.0.1", "router.local": "192.168.1.1" } };
let mockFakeDNS = { enabled: true, ipv4Range: "198.18.0.0/15", ipv6Range: "", whitelist: [] as string[], skipCheckList: [] as string[] };
let mockResolverServer = { server: "127.0.0.1:5353" };

function page(items: unknown[], request: Record<string, unknown>) {
    return { items, page: { page: Number(request.page ?? 1), pageSize: Number(request.page_size ?? items.length), total: items.length } };
}

let flowTick = 0;

function replaceById<T extends { id: string }>(items: T[], value: T) {
    const index = items.findIndex((item) => item.id === value.id);
    if (index === -1) items.push(value);
    else items[index] = value;
}

async function requestBody(request: Request) {
    try {
        return await request.json() as Record<string, unknown>;
    } catch {
        return {};
    }
}

export const handlers = [
    http.post("*/api/v2/rpc/:operation", async ({ params, request }) => {
        const operation = String(params.operation);
        const body = await requestBody(request);
        let result: unknown;

        switch (operation) {
            case "nodes.get": result = page(nodes, body); break;
            case "node.get": result = nodes.find((node) => node.id === body.id) ?? nodes[0]; break;
            case "nodes.selected": result = { tcp: nodes[0], udp: nodes[1] }; break;
            case "nodes.active": result = { items: [nodes[0], nodes[1]] }; break;
            case "node.put":
            case "nodes.post":
                if (typeof body.id === "string") replaceById(nodes, body as typeof nodes[number]);
                result = body;
                break;
            case "node.delete":
                if (typeof body.id === "string") {
                    const index = nodes.findIndex((node) => node.id === body.id);
                    if (index >= 0) nodes.splice(index, 1);
                }
                result = {};
                break;
            case "inbounds.get": result = page(inbounds, body); break;
            case "inbound.get": result = inbounds.find((item) => item.id === body.id) ?? inbounds[0]; break;
            case "inbounds.config.get": result = mockInboundConfig; break;
            case "inbounds.config.put": mockInboundConfig = { ...mockInboundConfig, ...body }; result = mockInboundConfig; break;
            case "inbound.put":
            case "inbounds.post":
                if (typeof body.id === "string") replaceById(inbounds, body as typeof inbounds[number]);
                result = body;
                break;
            case "inbound.delete":
                if (typeof body.id === "string") {
                    const index = inbounds.findIndex((inbound) => inbound.id === body.id);
                    if (index >= 0) inbounds.splice(index, 1);
                }
                result = {};
                break;
            case "connections": result = { connections }; break;
            case "connections.total": {
                flowTick += 1;
                result = {
                    upload: String(134217728 + flowTick * 16384),
                    download: String(3006477107 + flowTick * 98304),
                    counters: {
                        "1": { upload: String(flowTick * 4096), download: String(flowTick * 24576) },
                        "2": { upload: String(flowTick * 2048), download: String(flowTick * 16384) },
                        "3": { upload: String(flowTick * 1024), download: String(flowTick * 8192) },
                    },
                };
                break;
            }
            case "connections.traffic": result = { interval: body.interval ?? "hour", items: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00"].map((start, index) => ({ start: new Date(Date.now() - (5 - index) * 3600000).toISOString(), upload: String(120 + index * 40), download: String(820 + index * 190) })) }; break;
            case "connections.telemetry": result = {
                groups: [
                    { dimension: "destination", items: [
                        { value: "api.github.com:443", download: "1543503872", upload: "25165824", failures: "0" },
                        { value: "registry.npmjs.org:443", download: "943718400", upload: "12582912", failures: "0" },
                        { value: "fonts.googleapis.com:443", download: "314572800", upload: "6291456", failures: "1" },
                    ] },
                    { dimension: "addr", items: [
                        { value: "192.168.1.24:53122", download: "1855979520", upload: "31457280", failures: "0" },
                        { value: "192.168.1.10:44880", download: "943718400", upload: "12582912", failures: "0" },
                    ] },
                    { dimension: "outbound", items: [
                        { value: "Tokyo Edge", download: "1543503872", upload: "25165824", failures: "0" },
                        { value: "US West", download: "943718400", upload: "12582912", failures: "0" },
                        { value: "Direct", download: "314572800", upload: "6291456", failures: "1" },
                    ] },
                    { dimension: "inbound", items: [
                        { value: "Desktop SOCKS", download: "1855979520", upload: "31457280", failures: "0" },
                        { value: "HTTP Proxy", download: "943718400", upload: "12582912", failures: "0" },
                    ] },
                ],
            }; break;
            case "settings.get": result = mockSettings; break;
            case "settings.put": mockSettings = { ...mockSettings, ...body, systemProxy: { ...mockSettings.systemProxy, ...(body.systemProxy as Record<string, unknown> | undefined) }, logcat: { ...mockSettings.logcat, ...(body.logcat as Record<string, unknown> | undefined) }, advanced: { ...mockSettings.advanced, ...(body.advanced as Record<string, unknown> | undefined) }, backup: { ...mockSettings.backup, ...(body.backup as Record<string, unknown> | undefined) } }; result = mockSettings; break;
            case "route.activation":
            case "route.lists.activation": result = { hostIndexRefreshAt: Date.now() - 1800000, ruleApplyAt: Date.now() - 900000 }; break;
            case "route.config.get": result = mockRouteConfig; break;
            case "route.config.put": mockRouteConfig = { ...mockRouteConfig, ...body }; result = mockRouteConfig; break;
            case "route.lists.config.get": result = mockRouteListConfig; break;
            case "route.lists.config.put": mockRouteListConfig = { ...mockRouteListConfig, ...body, maxMindDbGeoIp: { ...mockRouteListConfig.maxMindDbGeoIp, ...(body.maxMindDbGeoIp as Record<string, unknown> | undefined) } }; result = mockRouteListConfig; break;
            case "route.rules.get": result = page(routeRules, body); break;
            case "route.lists.get": result = page(routeLists, body); break;
            case "route.tags.get": result = page(routeTags, body); break;
            case "resolvers.get": result = page(resolvers, body); break;
            case "resolver.get": result = resolvers.find((item) => item.id === body.id) ?? resolvers[0]; break;
            case "resolver.hosts.get": result = mockResolverHosts; break;
            case "resolver.hosts.put": mockResolverHosts = { hosts: { ...mockResolverHosts.hosts, ...((body.hosts ?? {}) as Record<string, string>) } }; result = mockResolverHosts; break;
            case "resolver.fakedns.get": result = mockFakeDNS; break;
            case "resolver.fakedns.put": mockFakeDNS = { ...mockFakeDNS, ...body, whitelist: Array.isArray(body.whitelist) ? body.whitelist as string[] : mockFakeDNS.whitelist, skipCheckList: Array.isArray(body.skipCheckList) ? body.skipCheckList as string[] : mockFakeDNS.skipCheckList }; result = mockFakeDNS; break;
            case "resolver.server.get": result = mockResolverServer; break;
            case "resolver.server.put": mockResolverServer = { server: String(body.server ?? mockResolverServer.server) }; result = mockResolverServer; break;
            case "users.get": result = page([{ id: "local", name: "Local user", enabled: true, usage: "both", credential: { type: "basic", username: "preview", password: "" } }], body); break;
            case "user.get": result = { id: String(body.id ?? "local"), name: "Local user", enabled: true, usage: "both", credential: { type: "basic", username: "preview", password: "" } }; break;
            case "subscriptions.get": result = { items: subscriptions }; break;
            case "publishes": result = { items: publishes }; break;
            case "publish.resolve": result = { points: nodes.slice(0, 2) }; break;
            case "subscriptions.delete_preview": result = { nodes: 2, users: 1 }; break;
            case "subscriptions.put": result = { items: subscriptions }; break;
            case "publish.put": result = body; break;
            case "route.rule.get": result = { ...routeRules.find((item) => item.name === body.name && Number(item.index) === Number(body.index)) ?? routeRules[0], rules: [{ type: "all", all: [{ type: "host", host: { list: "" } }] }] }; break;
            case "route.list.get": result = routeLists.find((item) => item.name === body.id) ?? routeLists[0]; break;
            case "route.tag.put": result = body; break;
            case "route.lists.post": {
                const source = (body.source ?? {}) as Record<string, unknown>;
                const local = (source.local ?? {}) as Record<string, unknown>;
                const remote = (source.remote ?? {}) as Record<string, unknown>;
                const values = (source.type === "remote" ? remote.urls : local.lists) as unknown;
                const lines = Array.isArray(values) ? values.filter((value): value is string => typeof value === "string") : [];
                routeLists.push({ name: String(body.name ?? "new-list"), type: String(body.type ?? "host"), source: String(source.type ?? "local"), itemCount: lines.length, errorCount: 0, preview: lines[0] ?? "" });
                result = body;
                break;
            }
            case "route.list.put": {
                const index = routeLists.findIndex((item) => item.name === body.id || item.name === body.name);
                if (index >= 0) routeLists[index] = { ...routeLists[index], type: String(body.type ?? routeLists[index].type), source: String((body.source as Record<string, unknown> | undefined)?.type ?? routeLists[index].source) };
                result = body;
                break;
            }
            case "route.list.delete": {
                const index = routeLists.findIndex((item) => item.name === body.id);
                if (index >= 0) routeLists.splice(index, 1);
                result = {};
                break;
            }
            case "connections.history": result = { items: [], dumpProcessEnabled: true }; break;
            case "connections.failed_history": result = { items: [], dumpProcessEnabled: true }; break;
            case "tools.interfaces": result = { items: [] }; break;
            case "info": result = { version: "design preview", platform: "darwin", arch: "arm64" }; break;
            default: result = {};
        }

        return HttpResponse.json(result);
    }),
];
