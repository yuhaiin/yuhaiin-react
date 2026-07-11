import { requestJSON } from "@/api/client";
import type { Go } from "@/api/generated-contracts";
import type { BlockHistoryList, RouteActivationStatus, RouteConfig, RouteList, RouteListActivationStatus, RouteListConfig, RouteListDetail, RouteRule, RuleList, RuleTestResponse, TagList } from "@/contract/route";
import { normalizeListItem, normalizeRouteActivationStatus, normalizeRouteConfig, normalizeRouteList, normalizeRouteListActivationStatus, normalizeRouteListConfig, normalizeRule, normalizeRuleItem, normalizeTagItem } from "@/contract/route";

export async function listRouteLists(params?: { page?: number; pageSize?: number; query?: string }): Promise<RouteList> {
  const data = await requestJSON<Go.route.RouteList>("GET", "/api/v2/route/lists", undefined, {
    page: params?.page,
    page_size: params?.pageSize,
    query: params?.query,
  });
  return { items: (data.items ?? []).map(item => normalizeListItem(item)), page: data.page ?? { page: 1, pageSize: 0, total: 0 } };
}

export async function getRouteListConfig(): Promise<RouteListConfig> {
  return normalizeRouteListConfig(await requestJSON<Go.route.ListConfig>("GET", "/api/v2/route/lists/config") as unknown as RouteListConfig);
}

export async function saveRouteListConfig(config: RouteListConfig): Promise<RouteListConfig> {
  return normalizeRouteListConfig(await requestJSON<Go.route.ListConfig>("PUT", "/api/v2/route/lists/config", normalizeRouteListConfig(config)) as unknown as RouteListConfig);
}

export async function refreshRouteLists(): Promise<void> {
  await requestJSON<void>("POST", "/api/v2/route/lists/refresh");
}

export async function getRouteListActivationStatus(): Promise<RouteListActivationStatus> {
  return normalizeRouteListActivationStatus(await requestJSON<RouteListActivationStatus>("GET", "/api/v2/route/lists/activation"));
}

export async function getRouteActivationStatus(): Promise<RouteActivationStatus> {
  return normalizeRouteActivationStatus(await requestJSON<RouteActivationStatus>("GET", "/api/v2/route/activation"));
}

export async function applyRouteChanges(): Promise<void> {
  await requestJSON<void>("POST", "/api/v2/route/apply");
}

export async function createRouteList(list: RouteListDetail): Promise<RouteListDetail> {
  return normalizeRouteList(await requestJSON<Go.route.RouteListDetail>("POST", "/api/v2/route/lists", normalizeRouteList(list)) as unknown as RouteListDetail);
}

export async function getRouteList(id: string): Promise<RouteListDetail> {
  return normalizeRouteList(await requestJSON<Go.route.RouteListDetail>("GET", `/api/v2/route/lists/${encodeURIComponent(id)}`) as unknown as RouteListDetail);
}

export async function saveRouteList(id: string, list: RouteListDetail): Promise<RouteListDetail> {
  return normalizeRouteList(await requestJSON<Go.route.RouteListDetail>("PUT", `/api/v2/route/lists/${encodeURIComponent(id)}`, normalizeRouteList({ ...list, name: id })) as unknown as RouteListDetail);
}

export async function deleteRouteList(id: string): Promise<void> {
  await requestJSON<void>("DELETE", `/api/v2/route/lists/${encodeURIComponent(id)}`);
}

export async function listRules(params?: { page?: number; pageSize?: number; query?: string }): Promise<RuleList> {
  const data = await requestJSON<Go.route.RuleList>("GET", "/api/v2/route/rules", undefined, {
    page: params?.page,
    page_size: params?.pageSize,
    query: params?.query,
  });
  return { items: (data.items ?? []).map(item => normalizeRuleItem(item)), page: data.page ?? { page: 1, pageSize: 0, total: 0 } };
}

export async function getRouteConfig(): Promise<RouteConfig> {
  return normalizeRouteConfig(await requestJSON<Go.route.Config>("GET", "/api/v2/route/config") as unknown as RouteConfig);
}

export async function saveRouteConfig(config: RouteConfig): Promise<RouteConfig> {
  return normalizeRouteConfig(await requestJSON<Go.route.Config>("PUT", "/api/v2/route/config", normalizeRouteConfig(config)) as unknown as RouteConfig);
}

export async function deleteRule(name: string, index: number): Promise<void> {
  await requestJSON<void>("DELETE", `/api/v2/route/rules/${encodeURIComponent(name)}/${index}`);
}

export async function createRule(rule: RouteRule): Promise<RouteRule> {
  return normalizeRule(await requestJSON<Go.route.RouteRule>("POST", "/api/v2/route/rules", normalizeRule(rule)) as unknown as RouteRule);
}

export async function getRule(name: string, index: number): Promise<RouteRule> {
  return normalizeRule(await requestJSON<Go.route.RouteRule>("GET", `/api/v2/route/rules/${encodeURIComponent(name)}/${index}`) as unknown as RouteRule);
}

export async function saveRule(name: string, index: number, rule: RouteRule): Promise<RouteRule> {
  return normalizeRule(await requestJSON<Go.route.RouteRule>("PUT", `/api/v2/route/rules/${encodeURIComponent(name)}/${index}`, normalizeRule({ ...rule, name })) as unknown as RouteRule);
}

export async function changeRulePriority(
  source: { name: string; index: number },
  target: { name: string; index: number },
  operate: "exchange" | "insert_before" | "insert_after" = "exchange",
): Promise<void> {
  await requestJSON<void>("POST", "/api/v2/route/rules/priority", { source, target, operate });
}

export async function testRule(host: string): Promise<RuleTestResponse> {
  return requestJSON<Go.route.RuleTestResponse>("POST", "/api/v2/route/rules/test", { host }) as Promise<RuleTestResponse>;
}

export async function blockHistory(): Promise<BlockHistoryList> {
  const data = await requestJSON<Go.route.BlockHistoryList>("GET", "/api/v2/route/rules/block-history");
  return { items: data.items ?? [], dumpProcessEnabled: data.dumpProcessEnabled ?? false };
}

export async function listTags(params?: { page?: number; pageSize?: number; query?: string }): Promise<TagList> {
  const data = await requestJSON<Go.route.TagList>("GET", "/api/v2/route/tags", undefined, {
    page: params?.page,
    page_size: params?.pageSize,
    query: params?.query,
  });
  return { items: (data.items ?? []).map(item => normalizeTagItem(item)), page: data.page ?? { page: 1, pageSize: 0, total: 0 } };
}

export async function saveTag(tag: string, type: string, hash: string): Promise<void> {
  await requestJSON<void>("PUT", `/api/v2/route/tags/${encodeURIComponent(tag)}`, { tag, type, hash });
}

export async function deleteTag(tag: string): Promise<void> {
  await requestJSON<void>("DELETE", `/api/v2/route/tags/${encodeURIComponent(tag)}`);
}
