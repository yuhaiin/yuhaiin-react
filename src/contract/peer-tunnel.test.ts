import { describe, expect, it } from "vitest";
import { createDefaultInbound, selectInboundProtocol } from "./inbound";
import { createDefaultProtocol, normalizeProtocol } from "./node";

describe("Peer tunnel configuration", () => {
    it("uses UDP only for discovery and removes transports", () => {
        const initial = createDefaultInbound("discovery");
        const discovery = selectInboundProtocol(initial, "peer_discovery");
        expect(discovery.network).toEqual({ type: "tcp_udp", tcp_udp: { host: ":51821", udp: "udp_only" } });
        expect(discovery.transports).toEqual([]);
        expect(discovery.protocol).toEqual({ type: "peer_discovery", peer_discovery: { tokens: [] } });
        expect(selectInboundProtocol(discovery, "mixed").network).toEqual(initial.network);
    });

    it("pairs complementary tunnel IPs and retains the saved outbound payload", () => {
        const publisher = selectInboundProtocol(createDefaultInbound("publisher"), "peer_tunnel");
        const outbound = createDefaultProtocol("peer_tunnel");
        expect(publisher.network.type).toBe("empty");
        expect(publisher.transports).toEqual([]);
        expect(publisher.protocol).toMatchObject({ type: "peer_tunnel", peer_tunnel: {
            localIp: outbound.peer_tunnel.peerIp, peerIp: outbound.peer_tunnel.localIp,
        } });
        outbound.peer_tunnel.routes = ["192.168.1.0/24"];
        outbound.peer_tunnel.token = "saved-token";
        expect(normalizeProtocol(JSON.parse(JSON.stringify(outbound)))).toEqual(outbound);
        expect(selectInboundProtocol(publisher, "mixed").network.type).toBe("tcp_udp");
    });
});
