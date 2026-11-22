export type ResolverType = "udp" | "tcp" | "doh" | "dot" | "doq" | "doh3" | "system";

import type { Go } from "@/api/generated-contracts";

export type Resolver = Omit<Go.resolver.Resolver, "type"> & { type: ResolverType };

export type ResolverList = {
  items: Resolver[];
  page: {
    page: number;
    pageSize: number;
    total: number;
  };
};

export type ResolverHosts = Go.resolver.Hosts;
/**
 * Cores that predate shared-list references return inline `whitelist` and
 * `skipCheckList` arrays instead; their presence identifies such a Core.
 */
export type FakeDNS = Go.resolver.FakeDNS & { whitelist?: string[]; skipCheckList?: string[] };
export type ResolverServer = Go.resolver.Server;
export type DNSCacheRecord = Go.resolver.DNSCacheRecord;
export type DNSCacheEntry = Go.resolver.DNSCacheEntry;
export type DNSCacheList = Go.resolver.DNSCacheList;
export type DNSCacheClearResponse = Go.resolver.DNSCacheClearResponse;

export function createDefaultResolver(id: string): Resolver {
  return {
    id,
    name: id,
    type: id === "bootstrap" ? "system" : "udp",
    host: id === "bootstrap" ? "system default" : "8.8.8.8",
    system: id === "bootstrap",
  };
}

export function normalizeResolver(value: Partial<Resolver> | undefined): Resolver {
  const resolver = value ?? {};
  const id = resolver.id ?? "resolver";
  const type = resolver.type ?? (id === "bootstrap" ? "system" : "udp");
  return {
    id,
    name: resolver.name ?? id,
    type,
    host: resolver.host ?? (type === "system" ? "system default" : ""),
    subnet: resolver.subnet ?? "",
    tlsServerName: resolver.tlsServerName ?? "",
    system: resolver.system ?? (id === "bootstrap" || type === "system"),
  };
}

export function normalizeHosts(value: Partial<ResolverHosts> | undefined): ResolverHosts {
  return { hosts: value?.hosts ?? {} };
}

export function normalizeFakeDNS(value: Partial<FakeDNS> | undefined): FakeDNS {
  return {
    enabled: value?.enabled ?? false,
    ipv4Range: value?.ipv4Range ?? "",
    ipv6Range: value?.ipv6Range ?? "",
    whitelistListIds: value?.whitelistListIds ?? [],
    skipCheckListIds: value?.skipCheckListIds ?? [],
    // Kept only for an older Core, which would otherwise clear them on save.
    ...(isLegacyFakeDNS(value) ? { whitelist: value?.whitelist ?? [], skipCheckList: value?.skipCheckList ?? [] } : {}),
  };
}

/** True when the Core stores FakeDNS entries inline rather than in shared lists. */
export function isLegacyFakeDNS(value: Partial<FakeDNS> | undefined): boolean {
  return Array.isArray(value?.whitelist) || Array.isArray(value?.skipCheckList);
}

export type FakeIPEntry = Go.resolver.FakeIPEntry;
export type FakeIPDeleteResponse = Go.resolver.FakeIPDeleteResponse;
export type FakeIPEntryList = { items: FakeIPEntry[]; page: { page: number; pageSize: number; total: number } };
