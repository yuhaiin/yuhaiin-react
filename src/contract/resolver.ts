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
export type FakeDNS = Go.resolver.FakeDNS;
export type ResolverServer = Go.resolver.Server;

export function createDefaultResolver(id: string): Resolver {
  return {
    id,
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
    whitelist: value?.whitelist ?? [],
    skipCheckList: value?.skipCheckList ?? [],
  };
}
