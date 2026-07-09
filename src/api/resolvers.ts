import { requestJSON } from "@/api/client";
import type { FakeDNS, Resolver, ResolverHosts, ResolverList, ResolverServer } from "@/contract/resolver";
import { normalizeFakeDNS, normalizeHosts, normalizeResolver } from "@/contract/resolver";

export async function listResolvers(params?: { page?: number; pageSize?: number; query?: string }): Promise<ResolverList> {
  const data = await requestJSON<ResolverList>("GET", "/api/v2/resolvers", undefined, {
    page: params?.page,
    page_size: params?.pageSize,
    query: params?.query,
  });
  return {
    items: (data.items ?? []).map((item) => normalizeResolver(item)),
    page: data.page ?? { page: params?.page ?? 1, pageSize: params?.pageSize ?? 0, total: 0 },
  };
}

export async function getResolver(id: string): Promise<Resolver> {
  return normalizeResolver(await requestJSON<Resolver>("GET", `/api/v2/resolvers/${encodeURIComponent(id)}`));
}

export async function createResolver(resolver: Resolver): Promise<Resolver> {
  return normalizeResolver(await requestJSON<Resolver>("POST", "/api/v2/resolvers", normalizeResolver(resolver)));
}

export async function saveResolver(resolver: Resolver): Promise<Resolver> {
  const normalized = normalizeResolver(resolver);
  return normalizeResolver(await requestJSON<Resolver>("PUT", `/api/v2/resolvers/${encodeURIComponent(normalized.id)}`, normalized));
}

export async function deleteResolver(id: string): Promise<void> {
  await requestJSON<void>("DELETE", `/api/v2/resolvers/${encodeURIComponent(id)}`);
}

export async function getResolverHosts(): Promise<ResolverHosts> {
  return normalizeHosts(await requestJSON<ResolverHosts>("GET", "/api/v2/resolver/hosts"));
}

export async function saveResolverHosts(hosts: ResolverHosts): Promise<ResolverHosts> {
  return normalizeHosts(await requestJSON<ResolverHosts>("PUT", "/api/v2/resolver/hosts", normalizeHosts(hosts)));
}

export async function getFakeDNS(): Promise<FakeDNS> {
  return normalizeFakeDNS(await requestJSON<FakeDNS>("GET", "/api/v2/resolver/fakedns"));
}

export async function saveFakeDNS(config: FakeDNS): Promise<FakeDNS> {
  return normalizeFakeDNS(await requestJSON<FakeDNS>("PUT", "/api/v2/resolver/fakedns", normalizeFakeDNS(config)));
}

export async function getResolverServer(): Promise<ResolverServer> {
  const data = await requestJSON<ResolverServer>("GET", "/api/v2/resolver/server");
  return { server: data.server ?? "" };
}

export async function saveResolverServer(server: ResolverServer): Promise<ResolverServer> {
  const data = await requestJSON<ResolverServer>("PUT", "/api/v2/resolver/server", { server: server.server ?? "" });
  return { server: data.server ?? "" };
}
