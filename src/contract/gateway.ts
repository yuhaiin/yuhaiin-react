import type { Go } from "@/api/generated-contracts";
import { createID } from "@/common/id";

export type Config = Go.gateway.Config;
export type Gateway = Go.gateway.Gateway;
export type Rule = Go.gateway.Rule;
export type Action = Go.gateway.Action;
export type Condition = Go.gateway.Condition;
export type Upstream = Go.gateway.Upstream;
export type Interception = Go.gateway.Interception;
export type FilterList = Go.gateway.FilterList;
export type Headers = Record<string, string[]>;

export const newAction = (type = "block"): Action => ({
  type,
  status: type === "block" ? 403 : type === "redirect" ? 302 : 200,
  outbound: { type: "inherit_route" },
  preserveHost: false,
  rewrite: {},
});
export const newGateway = (): Gateway => ({
  id: createID(),
  name: "",
  revision: 0,
  enabled: false,
  listen: "127.0.0.1:8080",
  allowedSources: [],
  tlsMode: "off",
  certificateFile: "",
  keyFile: "",
  ruleIds: [],
  default: newAction(),
  maxBodyBytes: 0,
});
export const newRule = (): Rule => ({
  id: createID(),
  name: "",
  revision: 0,
  enabled: true,
  priority: 100,
  match: { field: "path", operator: "prefix", value: "/" },
  action: newAction(),
});
export const newUpstream = (): Upstream => ({
  id: createID(),
  name: "",
  revision: 0,
  backends: [{ url: "http://127.0.0.1:3000", weight: 1 }],
  balance: "round_robin",
  outbound: { type: "inherit_route" },
  connectTimeoutMs: 10000,
  idleTimeoutMs: 90000,
  requestTimeoutMs: 0,
  maxConnections: 0,
  maxConcurrent: 0,
  requestsPerSecond: 0,
  burst: 1,
  healthIntervalMs: 10000,
  failureThreshold: 3,
  recoveryMs: 30000,
  retries: 0,
});
export const words = (value: string): string[] =>
  value.split(/[\s,]+/).filter(Boolean);
export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "msg" in error)
    return String(error.msg);
  return String(error);
}

// Delete references in the same atomic draft as their owner.
export function deleteGateway(config: Config, id: string): Config {
  return {
    ...config,
    gateways: config.gateways.filter((g) => g.id !== id),
    interceptions: config.interceptions.filter((i) => i.gatewayId !== id),
    filterLists: config.filterLists.filter((f) => f.gatewayId !== id),
  };
}
export function deleteRule(config: Config, id: string): Config {
  return {
    ...config,
    rules: config.rules.filter((r) => r.id !== id),
    gateways: config.gateways.map((g) => ({
      ...g,
      ruleIds: g.ruleIds.filter((rule) => rule !== id),
    })),
  };
}
export function upstreamInUse(config: Config, id: string): boolean {
  return [
    ...config.rules.map((r) => r.action),
    ...config.gateways.map((g) => g.default),
  ].some((action) => action.type === "reverse_proxy" && action.upstream === id);
}


/**
 * Gateway-first API document. Individual resource arrays are implementation
 * details of the HTTP engine; they are not independent top-level UI objects.
 * Route admission still requires an explicit Gateway action.
 */
export type WorkspaceGateway = {
  id: string;
  name: string;
  enabled: boolean;
  revision: number;
  listener?: {
    listen: string;
    allowedSources: string[];
    tlsMode: string;
    certificateFile?: string;
    keyFile?: string;
  };
  policies: Rule[];
  backendPools: Upstream[];
  sources: Omit<Interception, "gatewayId">[];
  filters: FilterList[];
  fallback: Action;
  maxBodyBytes: number;
};

export type GatewayWorkspaceDocument = {
  version: 2;
  revision: number;
  gateways: WorkspaceGateway[];
};

export function flattenWorkspace(document: GatewayWorkspaceDocument): Config {
  return {
    revision: document.revision,
    gateways: document.gateways.map((item) => ({
      id: item.id,
      name: item.name,
      enabled: item.enabled,
      revision: item.revision,
      listen: item.listener?.listen ?? "",
      allowedSources: item.listener?.allowedSources ?? [],
      tlsMode: item.listener?.tlsMode ?? "off",
      certificateFile: item.listener?.certificateFile ?? "",
      keyFile: item.listener?.keyFile ?? "",
      ruleIds: item.policies.map((rule) => rule.id),
      default: item.fallback,
      maxBodyBytes: item.maxBodyBytes,
    })),
    rules: document.gateways.flatMap((item) => item.policies),
    upstreams: document.gateways.flatMap((item) => item.backendPools),
    interceptions: document.gateways.flatMap((item) =>
      item.sources.map((source) => ({ ...source, gatewayId: item.id }))),
    filterLists: document.gateways.flatMap((item) =>
      item.filters.map((filter) => ({ ...filter, gatewayId: item.id }))),
  };
}

export function groupWorkspace(config: Config): GatewayWorkspaceDocument {
  return {
    version: 2,
    revision: config.revision,
    gateways: config.gateways.map((gateway) => {
      const policies = gateway.ruleIds.map((id) => config.rules.find((rule) => rule.id === id))
        .filter((rule): rule is Rule => Boolean(rule));
      const poolIDs = new Set([gateway.default, ...policies.map((rule) => rule.action)]
        .filter((action) => action.type === "reverse_proxy")
        .map((action) => action.upstream));
      return {
        id: gateway.id,
        name: gateway.name,
        enabled: gateway.enabled,
        revision: gateway.revision,
        listener: gateway.listen ? {
          listen: gateway.listen,
          allowedSources: gateway.allowedSources,
          tlsMode: gateway.tlsMode,
          certificateFile: gateway.certificateFile,
          keyFile: gateway.keyFile,
        } : undefined,
        policies,
        backendPools: config.upstreams.filter((pool) => poolIDs.has(pool.id)),
        sources: config.interceptions.filter((source) => source.gatewayId === gateway.id)
          .map(({ gatewayId: _owner, ...source }) => source),
        filters: config.filterLists.filter((filter) => filter.gatewayId === gateway.id),
        fallback: gateway.default,
        maxBodyBytes: gateway.maxBodyBytes,
      };
    }),
  };
}
