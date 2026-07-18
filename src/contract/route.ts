import type { Go } from "@/api/generated-contracts";

export type Page = Go.route.Page;
export type RuleItem = Go.route.RuleItem;
export type RuleExpr = Go.route.RuleExpr;
export type RouteRule = Go.route.RouteRule;
export type RuleList = Go.route.RuleList;
export type RouteConfig = Go.route.Config;
export type RouteListConfig = Go.route.ListConfig;
export type RouteListActivationStatus = Go.route.ListActivationStatus;

export function normalizeRouteListActivationStatus(value: Partial<RouteListActivationStatus> | undefined): RouteListActivationStatus {
  return { hostIndexRefreshAt: value?.hostIndexRefreshAt ?? 0 };
}

export type RouteActivationStatus = Go.route.ActivationStatus;

export function normalizeRouteActivationStatus(value: Partial<RouteActivationStatus> | undefined): RouteActivationStatus {
  return {
    hostIndexRefreshAt: value?.hostIndexRefreshAt ?? 0,
    ruleApplyAt: value?.ruleApplyAt ?? 0,
  };
}

export type ListItem = Go.route.ListItem;
export type ListSource = {
  type: string;
  local?: Go.route.LocalSource;
  remote?: Go.route.RemoteSource;
};
export type RouteListDetail = Omit<Go.route.RouteListDetail, "source"> & { source: ListSource };
export type RouteList = Go.route.RouteList;
export type TagItem = Go.route.TagItem;
export type TagList = Go.route.TagList;
export type RuleTestResponse = Go.route.RuleTestResponse;
export type BlockHistory = Go.route.BlockHistory;
export type BlockHistoryList = Go.route.BlockHistoryList;

export function createDefaultRule(name = ""): RouteRule {
  return {
    name,
    mode: "proxy",
    resolveStrategy: "default",
    udpProxyFqdnStrategy: "udp_proxy_fqdn_strategy_default",
    rules: [{ type: "all", all: [{ type: "host", host: { list: "" } }] }],
  };
}

export function normalizeRule(value: Partial<RouteRule>): RouteRule {
  return {
    name: value.name ?? "",
    mode: value.mode ?? "bypass",
    tag: value.tag ?? "",
    resolveStrategy: value.resolveStrategy ?? "default",
    udpProxyFqdnStrategy: value.udpProxyFqdnStrategy ?? "udp_proxy_fqdn_strategy_default",
    resolver: value.resolver ?? "",
    disabled: value.disabled ?? false,
    rules: Array.isArray(value.rules) ? value.rules : [],
  };
}

export function normalizeRouteConfig(value: Partial<RouteConfig> | undefined): RouteConfig {
  return {
    directResolver: value?.directResolver ?? "",
    proxyResolver: value?.proxyResolver ?? "",
    resolveLocally: value?.resolveLocally ?? false,
    udpProxyFqdnStrategy: value?.udpProxyFqdnStrategy ?? "default",
  };
}

export function normalizeRouteListConfig(value: Partial<RouteListConfig> | undefined): RouteListConfig {
  return {
    refreshInterval: value?.refreshInterval ?? "0",
    lastRefreshTime: value?.lastRefreshTime ?? "0",
    error: value?.error ?? "",
    hostIndexDisk: value?.hostIndexDisk ?? false,
    maxMindDbGeoIp: {
      downloadUrl: value?.maxMindDbGeoIp?.downloadUrl ?? "",
      error: value?.maxMindDbGeoIp?.error ?? "",
    },
  };
}

export function createDefaultRouteList(name = ""): RouteListDetail {
  return {
    name,
    type: "host",
    source: { type: "local", local: { lists: [] } },
    errorMsgs: [],
  };
}

export function normalizeRouteList(value: Partial<RouteListDetail>): RouteListDetail {
  const source = value.source ?? { type: "local", local: { lists: [] } };
  return {
    name: value.name ?? "",
    type: value.type ?? "host",
    source: {
      type: source.type ?? "local",
      local: { lists: source.local?.lists ?? [] },
      remote: { urls: source.remote?.urls ?? [] },
    },
    errorMsgs: value.errorMsgs ?? [],
  };
}

function toUint(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.trunc(n) : fallback;
}

export function normalizeRuleItem(value: Partial<RuleItem> | undefined): RuleItem {
  return {
    name: value?.name ?? "",
    disabled: value?.disabled ?? false,
    index: toUint(value?.index),
    mode: value?.mode ?? "",
    tag: value?.tag ?? "",
    resolver: value?.resolver ?? "",
    ruleCount: toUint(value?.ruleCount),
  };
}

export function normalizeListItem(value: Partial<ListItem> | undefined): ListItem {
  return {
    name: value?.name ?? "",
    type: value?.type ?? "",
    source: value?.source ?? "",
    itemCount: value?.itemCount ?? 0,
    errorCount: value?.errorCount ?? 0,
    preview: value?.preview ?? "",
  };
}

export function normalizeTagItem(value: Partial<TagItem> | undefined): TagItem {
  return {
    name: value?.name ?? "",
    type: value?.type ?? "",
    hash: Array.isArray(value?.hash) ? value.hash : [],
  };
}
