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
