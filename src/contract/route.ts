import type { Go } from "@/api/generated-contracts";
import { createID } from "@/common/id";

export type Page = Go.route.Page;
export type RuleItem = Go.route.RuleItem;
export type RuleExpr = Go.route.RuleExpr;
export type RouteRule = Go.route.RouteRule;
export type RouteTarget = Go.route.Target;
export type RuleDraft = { rule: RouteRule; lists: RouteListDetail[]; shareLists?: string[] };
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
    savedRevision: value?.savedRevision ?? 0,
    appliedRevision: value?.appliedRevision ?? 0,
    error: value?.error ?? "",
    applying: value?.applying ?? false,
    runningConfig: value?.runningConfig ? normalizeRouteConfig(value.runningConfig) : undefined,
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
export type Registry = Go.route.Registry;
export type RegistryList = Go.route.RegistryList;
export type RegistryFile = Go.route.RegistryFile;
export type RegistryCatalog = Go.route.RegistryCatalog;
export type RegistryCatalogList = Go.route.RegistryCatalogList;
export type RuleTestResponse = Go.route.RuleTestResponse;
export type BlockHistory = Go.route.BlockHistory;
export type BlockHistoryList = Go.route.BlockHistoryList;

export function createDefaultRule(name = ""): RouteRule {
  return {
    id: createID(),
    revision: 0,
    name,
    mode: "proxy",
    target: { type: "default" },
    resolveStrategy: "default",
    udpProxyFqdnStrategy: "udp_proxy_fqdn_strategy_default",
    rules: [{ type: "all", all: [{ type: "host", host: { list: "" } }] }],
  };
}

export function normalizeRule(value: Partial<RouteRule>): RouteRule {
  return {
    id: value.id ?? value.name ?? "",
    revision: value.revision ?? 0,
    name: value.name ?? "",
    target: value.target ?? { type: "default" },
    mode: value.mode ?? "bypass",
    resolveStrategy: value.resolveStrategy ?? "default",
    udpProxyFqdnStrategy: value.udpProxyFqdnStrategy ?? "udp_proxy_fqdn_strategy_default",
    resolver: value.resolver ?? "",
    disabled: value.disabled ?? false,
    rules: Array.isArray(value.rules) ? value.rules : [],
  };
}

export function normalizeRouteConfig(value: Partial<RouteConfig> | undefined): RouteConfig {
  return {
    revision: value?.revision ?? 0,
    defaultMode: value?.defaultMode ?? "proxy",
    defaultTarget: value?.defaultTarget ?? { type: "default" },
    directResolver: value?.directResolver ?? "",
    proxyResolver: value?.proxyResolver ?? "",
    resolveLocally: value?.resolveLocally ?? false,
    udpProxyFqdnStrategy: value?.udpProxyFqdnStrategy ?? "default",
  };
}

export function normalizeRouteListConfig(value: Partial<RouteListConfig> | undefined): RouteListConfig {
  return {
    revision: value?.revision ?? 0,
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
    revision: 0,
    id: "",
    name,
    type: "host",
    source: { type: "local", local: { lists: [] } },
    errorMsgs: [],
  };
}

export function normalizeRouteList(value: Partial<RouteListDetail>): RouteListDetail {
  const source = value.source ?? { type: "local", local: { lists: [] } };
  return {
    revision: value.revision ?? 0,
    id: value.id ?? value.name ?? "",
    ownerRuleId: value.ownerRuleId ?? "",
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
    id: value?.id ?? value?.name ?? "",
    target: value?.target ?? { type: "default" },
    name: value?.name ?? "",
    disabled: value?.disabled ?? false,
    index: toUint(value?.index),
    mode: value?.mode ?? "",
    resolver: value?.resolver ?? "",
    ruleCount: toUint(value?.ruleCount),
  };
}

export function normalizeListItem(value: Partial<ListItem> | undefined): ListItem {
  return {
    id: value?.id ?? value?.name ?? "",
    ownerRuleId: value?.ownerRuleId ?? "",
    name: value?.name ?? "",
    type: value?.type ?? "",
    source: value?.source ?? "",
    itemCount: value?.itemCount ?? 0,
    errorCount: value?.errorCount ?? 0,
    preview: value?.preview ?? "",
  };
}

export function normalizeRegistry(value: Partial<Registry> | undefined): Registry {
  return {
    id: value?.id ?? "",
    name: value?.name ?? "",
    url: value?.url ?? "",
    enabled: value?.enabled ?? true,
    builtin: value?.builtin ?? false,
    updatedAt: value?.updatedAt ?? "0",
  };
}

export function normalizeRegistryFile(value: Partial<RegistryFile> | undefined): RegistryFile {
  return {
    id: value?.id ?? "",
    name: value?.name ?? "",
    category: value?.category ?? "",
    kind: value?.kind ?? "",
    usage: value?.usage ?? "",
    listType: value?.listType ?? "",
    format: value?.format ?? "",
    path: value?.path ?? "",
    url: value?.url ?? "",
    sourceUrl: value?.sourceUrl ?? "",
    size: Number.isFinite(value?.size) ? Number(value?.size) : 0,
    sha256: value?.sha256 ?? "",
    selectable: value?.selectable ?? false,
  };
}

export function normalizeRegistryCatalog(value: Partial<RegistryCatalog> | undefined): RegistryCatalog {
  return {
    registry: normalizeRegistry(value?.registry),
    schemaVersion: value?.schemaVersion ?? 0,
    repository: value?.repository ?? "",
    branch: value?.branch ?? "",
    baseUrl: value?.baseUrl ?? "",
    files: Array.isArray(value?.files) ? value.files.map(normalizeRegistryFile) : [],
    error: value?.error ?? "",
  };
}

export function normalizeRuleDraft(value: Partial<RuleDraft>): RuleDraft {
  return { shareLists: value.shareLists ?? [], rule: normalizeRule(value.rule ?? {}), lists: (value.lists ?? []).map(normalizeRouteList) };
}

export function createDefaultRuleDraft(): RuleDraft {
  const rule = createDefaultRule();
  const list = { ...createDefaultRouteList("Websites"), id: createID(), ownerRuleId: rule.id };
  rule.rules = [{ type: "host", host: { list: list.id } }];
  return { rule, lists: [list] };
}
