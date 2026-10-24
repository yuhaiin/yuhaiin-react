import { requestJSON } from "@/api/client";
import type { Go } from "@/api/generated-contracts";
import type { RuleDraft, BlockHistoryList, Registry, RegistryCatalogList, RegistryList, RouteActivationStatus, RouteConfig, RouteList, RouteListActivationStatus, RouteListConfig, RouteListDetail, RuleList, RuleTestResponse } from "@/contract/route";
import { normalizeRuleDraft, normalizeListItem, normalizeRegistry, normalizeRegistryCatalog, normalizeRouteActivationStatus, normalizeRouteConfig, normalizeRouteList, normalizeRouteListActivationStatus, normalizeRouteListConfig, normalizeRuleItem } from "@/contract/route";

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

export async function getRouteListSecrets(id: string, signal?: AbortSignal): Promise<RouteListDetail> {
  return normalizeRouteList(await requestJSON<Go.route.RouteListDetail>("GET", `/api/v2/route/lists/${encodeURIComponent(id)}`, undefined, undefined, signal, { revealSecrets: true }) as unknown as RouteListDetail);
}

export async function saveRouteList(id: string, list: RouteListDetail): Promise<RouteListDetail> {
  return normalizeRouteList(await requestJSON<Go.route.RouteListDetail>("PUT", `/api/v2/route/lists/${encodeURIComponent(id)}`, normalizeRouteList({ ...list, id })) as unknown as RouteListDetail);
}

export async function deleteRouteList(id: string): Promise<void> {
  await requestJSON<void>("DELETE", `/api/v2/route/lists/${encodeURIComponent(id)}`);
}

export async function listRouteRegistries(): Promise<RegistryList> {
  const data = await requestJSON<Go.route.RegistryList>("GET", "/api/v2/route/registries");
  return { items: (data.items ?? []).map(item => normalizeRegistry(item)) };
}

export async function createRouteRegistry(registry: Registry): Promise<Registry> {
  return normalizeRegistry(await requestJSON<Go.route.Registry>("POST", "/api/v2/route/registries", registry));
}

export async function saveRouteRegistry(id: string, registry: Registry): Promise<Registry> {
  return normalizeRegistry(await requestJSON<Go.route.Registry>("PUT", `/api/v2/route/registries/${encodeURIComponent(id)}`, { ...registry, id }));
}

export async function deleteRouteRegistry(id: string): Promise<void> {
  await requestJSON<void>("DELETE", `/api/v2/route/registries/${encodeURIComponent(id)}`);
}

export async function listRouteRegistryCatalogs(refresh = false): Promise<RegistryCatalogList> {
  const data = await requestJSON<Go.route.RegistryCatalogList>("GET", "/api/v2/route/registries/catalogs", undefined, { refresh });
  return { items: (data.items ?? []).map(item => normalizeRegistryCatalog(item)) };
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

export async function deleteRule(id: string): Promise<void> {
  await requestJSON<void>("DELETE", `/api/v2/route/rules/${encodeURIComponent(id)}`);
}

export async function createRule(draft: RuleDraft): Promise<RuleDraft> {
  return normalizeRuleDraft(await requestJSON<RuleDraft>("POST", "/api/v2/route/rules", draft));
}

export async function getRule(id: string): Promise<RuleDraft> {
  return normalizeRuleDraft(await requestJSON<RuleDraft>("GET", `/api/v2/route/rules/${encodeURIComponent(id)}`));
}

export async function saveRule(id: string, draft: RuleDraft): Promise<RuleDraft> {
  return normalizeRuleDraft(await requestJSON<RuleDraft>("PUT", `/api/v2/route/rules/${encodeURIComponent(id)}`, draft));
}

export async function changeRulePriority(
  source: { id: string },
  target: { id: string },
  operate: "exchange" | "insert_before" | "insert_after" = "exchange",
): Promise<void> {
  await requestJSON<void>("POST", "/api/v2/route/rules/priority", {
    source,
    target,
    operate,
  });
}

export async function testRule(host: string): Promise<RuleTestResponse> {
  return requestJSON<Go.route.RuleTestResponse>("POST", "/api/v2/route/rules/test", { host }) as Promise<RuleTestResponse>;
}

export async function blockHistory(): Promise<BlockHistoryList> {
  const data = await requestJSON<Go.route.BlockHistoryList>("GET", "/api/v2/route/rules/block-history");
  return { items: data.items ?? [], dumpProcessEnabled: data.dumpProcessEnabled ?? false };
}

export async function listGeoIPCountries(): Promise<Go.route.GeoIPCountries> {
  const data = await requestJSON<Go.route.GeoIPCountries>("GET", "/api/v2/route/geoip/countries");
  return { codes: data.codes ?? [], loaded: data.loaded ?? false };
}
