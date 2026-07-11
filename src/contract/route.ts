export type Page = {
  page: number;
  pageSize: number;
  total: number;
};

export type RuleItem = {
  name: string;
  disabled: boolean;
  index: number;
  mode: string;
  tag: string;
  resolver: string;
  ruleCount: number;
};

export type RouteRule = {
  name: string;
  mode: string;
  tag?: string;
  resolveStrategy?: string;
  udpProxyFqdnStrategy?: string;
  resolver?: string;
  rules?: RuleExpr[];
  disabled?: boolean;
};

export type RuleExpr = {
  type: string;
  all?: RuleExpr[];
  any?: RuleExpr[];
  not?: RuleExpr;
  host?: { list: string };
  process?: { list: string };
  inbound?: { name?: string; names?: string[] };
  network?: { network: string };
  port?: { ports: string };
  geoip?: { countries: string };
};

export type RuleList = {
  items: RuleItem[];
  page: Page;
};

export type RouteConfig = {
  directResolver: string;
  proxyResolver: string;
  resolveLocally: boolean;
  udpProxyFqdnStrategy: string;
};

export type RouteListConfig = {
  refreshInterval: string;
  lastRefreshTime: string;
  error: string;
  maxMindDbGeoIp: {
    downloadUrl: string;
    error: string;
  };
};

export type RouteListActivationStatus = {
  hostIndexRefreshAt: number;
};

export function normalizeRouteListActivationStatus(value: Partial<RouteListActivationStatus> | undefined): RouteListActivationStatus {
  return { hostIndexRefreshAt: value?.hostIndexRefreshAt ?? 0 };
}

export type RouteActivationStatus = {
  hostIndexRefreshAt: number;
  ruleApplyAt: number;
};

export function normalizeRouteActivationStatus(value: Partial<RouteActivationStatus> | undefined): RouteActivationStatus {
  return {
    hostIndexRefreshAt: value?.hostIndexRefreshAt ?? 0,
    ruleApplyAt: value?.ruleApplyAt ?? 0,
  };
}

export type ListItem = {
  name: string;
  type: string;
  source: string;
  itemCount: number;
  errorCount: number;
  preview: string;
};

export type RouteListDetail = {
  name: string;
  type: string;
  source: ListSource;
  errorMsgs?: string[];
};

export type ListSource = {
  type: string;
  local?: { lists?: string[] };
  remote?: { urls?: string[] };
};

export type RouteList = {
  items: ListItem[];
  page: Page;
};

export type TagItem = {
  name: string;
  type: string;
  hash: string[];
};

export type TagList = {
  items: TagItem[];
  page: Page;
};

export type RuleTestResponse = {
  mode: string;
  tag: string;
  resolver: string;
  afterAddr: string;
  lists: string[];
  ips: string[];
  matchResult: {
    ruleName: string;
    history: { listName: string; matched: boolean }[];
  }[];
};

export type BlockHistory = {
  protocol: string;
  host: string;
  time: string;
  process: string;
  blockCount: string;
};

export type BlockHistoryList = {
  items: BlockHistory[];
  dumpProcessEnabled: boolean;
};

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

export function normalizeRuleItem(value: Partial<RuleItem> | undefined): RuleItem {
  return {
    name: value?.name ?? "",
    disabled: value?.disabled ?? false,
    index: value?.index ?? 0,
    mode: value?.mode ?? "",
    tag: value?.tag ?? "",
    resolver: value?.resolver ?? "",
    ruleCount: value?.ruleCount ?? 0,
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
