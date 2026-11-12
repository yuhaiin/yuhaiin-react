import type { Go } from "@/api/generated-contracts";

export function defaultPeerTunnel(publisher = false): Go.transport.PeerTunnel {
    return {
        coordinator: "",
        token: "",
        privateKey: "",
        peerPublicKey: "",
        localIp: publisher ? "10.88.1.1" : "10.88.1.2",
        peerIp: publisher ? "10.88.1.2" : "10.88.1.1",
        routes: [],
    };
}
