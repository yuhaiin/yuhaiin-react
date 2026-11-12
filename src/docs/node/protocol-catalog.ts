import type { NodeProtocolType } from "@/contract/node";
import { protocolTypes } from "@/contract/node";
import { useTranslation } from "react-i18next";

export type ProtocolGroup = "endpoint" | "proxy" | "transport" | "vpn" | "other";

/** Where each chain step sits; the add/change menus list steps by these groups. */
const groups: Record<ProtocolGroup, NodeProtocolType[]> = {
    endpoint: ["direct", "fixed", "fixedv2", "simple", "network_split", "set", "point_as_endpoint"],
    proxy: ["shadowsocks", "shadowsocksr", "vmess", "vless", "trojan", "socks5", "http", "ssh", "hysteria2", "yuubinsya", "masque", "cloudflare_warp_masque", "bootstrap_dns_warp"],
    transport: ["tls", "reality", "websocket", "http2", "quic", "mux", "obfs_http", "http_mock", "aead", "tls_termination", "proxy"],
    vpn: ["wireguard", "lan_link", "peer_tunnel", "amneziawg", "openvpn", "ikev2", "anyconnect", "sstp", "fortinet", "globalprotect", "softether", "l2tp", "l2tpv3", "nebula", "zerotier", "tailscale"],
    other: ["reject", "drop", "none"],
};

export const protocolGroupOrder: ProtocolGroup[] = ["endpoint", "proxy", "transport", "vpn", "other"];

/** Every known type appears exactly once; anything new lands in "other" until it is placed. */
export function protocolsByGroup(): Record<ProtocolGroup, NodeProtocolType[]> {
    const placed = new Set(Object.values(groups).flat());
    return { ...groups, other: [...groups.other, ...protocolTypes.filter(type => !placed.has(type))] };
}

export function useProtocolLabels() {
    const { t } = useTranslation("ui");
    return {
        name: (type: string) => t(`nodeProtocol.name.${type}`, { defaultValue: type }),
        help: (type: string) => t(`nodeProtocol.help.${type}`, { defaultValue: "" }),
        group: (group: ProtocolGroup) => t(`nodeProtocol.group.${group}`),
    };
}
