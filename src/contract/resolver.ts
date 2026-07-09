export type ResolverType = "udp" | "tcp" | "doh" | "dot" | "doq" | "doh3" | "system";

export type Resolver = {
  id: string;
  type: ResolverType;
  host: string;
  subnet?: string;
  tlsServerName?: string;
  system?: boolean;
};

export type ResolverList = {
  items: Resolver[];
  page: {
    page: number;
    pageSize: number;
    total: number;
  };
};

export type ResolverHosts = {
  hosts: Record<string, string>;
};

export type FakeDNS = {
  enabled: boolean;
  ipv4Range: string;
  ipv6Range: string;
  whitelist: string[];
  skipCheckList: string[];
};

export type ResolverServer = {
  server: string;
};

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
