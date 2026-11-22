import type { TFunction } from "i18next";
import {
    AppWindow, ArrowRightLeft, Ban, Cable, CircleHelp, Combine, Cpu, Database, Ellipsis, FileText, Globe, Hash, Inbox, Laptop,
    ListFilter, LogIn, Monitor, Plug, Route, Router, Server, ServerCog, ShieldCheck, Shuffle, Signpost, type LucideIcon,
} from "lucide-react";
import type { NodeKind, NodeStatus, TopologyNode } from "./model";

const inboundIcons: Record<string, LucideIcon> = {
    tun: Cable, socks5: Plug, socks4a: Plug, http: Globe, mixed: Combine, tproxy: Shuffle, redir: Shuffle,
    wireguard: ShieldCheck, yuubinsya: ShieldCheck, reverse_http: Router, reverse_tcp: Router,
};

const kindIcons: Record<NodeKind, LucideIcon> = {
    app: AppWindow, device: Laptop, local: Monitor, component: Cpu, inbound: LogIn, internal: Cpu, rule: ListFilter, "default-route": Route,
    direct: ArrowRightLeft, proxy: Server, vpn: ShieldCheck, block: Ban, gateway: Router,
    domain: Globe, ip: Hash, others: Ellipsis, unknown: CircleHelp,
    "dns-client": AppWindow, "dns-entry": Inbox, "dns-route": Signpost, "dns-resolver": ServerCog, "dns-upstream": Server,
};

const answerIcons: Record<string, LucideIcon> = { fakeip: Shuffle, cache: Database, hosts: FileText, blocked: Ban };

export function nodeIcon(node: TopologyNode): LucideIcon {
    if (node.kind === "inbound") return inboundIcons[node.type] ?? LogIn;
    if (node.kind === "dns-upstream") return answerIcons[node.type] ?? Server;
    return kindIcons[node.kind] ?? CircleHelp;
}

/** The node's name, or a translated name for nodes without one (Direct, Others, Unknown...). */
export function nodeName(node: TopologyNode, t: TFunction): string {
    if (node.name) return node.name;
    switch (node.kind) {
        case "local": return t("topology:node.local");
        case "internal": return t("topology:node.internal");
        case "others": return t("topology:node.others", { count: node.members ?? 0 });
        case "direct": return t("topology:node.direct");
        case "block": return t("topology:node.block");
        case "gateway": return t("topology:node.gateway");
        case "default-route": return t("topology:node.defaultRoute");
        case "dns-entry": return t(`topology:dnsEntry.${node.type}`, { defaultValue: node.type });
        case "dns-route": return t("topology:node.dnsRouteMode", { mode: node.type });
        case "dns-upstream": return t(`topology:dnsAnswer.${node.type}`, { defaultValue: t("topology:node.unknown") });
        case "dns-resolver": return t("topology:node.noResolver");
        case "unknown": return node.column === "outbound" ? t("topology:node.unresolvedOutbound") : t("topology:node.unknown");
        default: return t("topology:node.unknown");
    }
}

/** Short type label shown under the name. */
export function nodeType(node: TopologyNode, t: TFunction): string {
    const kind = t(`topology:kind.${node.kind}`);
    // The column already says "Inbounds": the protocol is the useful part.
    if (node.kind === "inbound" && node.type) return node.type.toUpperCase();
    if ((node.kind === "proxy" || node.kind === "vpn") && node.type) return `${kind} · ${node.type}`;
    if (node.kind === "rule" || node.kind === "default-route") return node.selectorName ? t("topology:node.viaSelector", { name: node.selectorName }) : t(`topology:mode.${node.mode}`, { defaultValue: node.mode ?? "" });
    if (node.kind === "ip") return node.type === "ipv6" ? "IPv6" : "IPv4";
    if (node.kind === "internal") return t("topology:node.noInbound");
    return kind;
}

export function statusTone(status: NodeStatus): "success" | "muted" | "warning" | "danger" | "info" {
    switch (status) {
        case "active": return "success";
        case "open": return "info";
        case "degraded": return "warning";
        case "offline": return "danger";
        default: return "muted";
    }
}

const RATE_UNITS = ["B/s", "KB/s", "MB/s", "GB/s", "TB/s"];

/** Three significant digits at most, so rates fit on a card: 512 KB/s, 6.0 MB/s. */
export function formatRate(value: number) {
    if (!(value > 0)) return "0 B/s";
    let unit = 0;
    while (value >= 1000 && unit < RATE_UNITS.length - 1) {
        value /= 1024;
        unit++;
    }
    return `${value.toFixed(value < 10 && unit > 0 ? 1 : 0)} ${RATE_UNITS[unit]}`;
}

/** Link to the configuration page of the node, when one exists. */
export function configLink(node: TopologyNode): string | undefined {
    if (!node.refId) return undefined;
    switch (node.kind) {
        case "inbound": return `#/docs/inbound?${new URLSearchParams({ inbound: node.refId })}`;
        case "proxy": case "vpn": return `#/docs/group?${new URLSearchParams({ node: node.refId })}`;
        case "rule": return `#/docs/bypass?${new URLSearchParams({ rule: node.refId })}`;
        default: return undefined;
    }
}

export function selectorLink(node: TopologyNode): string | undefined {
    return node.selectorId ? `#/docs/group/selectors?${new URLSearchParams({ selector: node.selectorId })}` : undefined;
}
