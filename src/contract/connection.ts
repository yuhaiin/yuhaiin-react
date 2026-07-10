export type Counter = {
  download: string;
  upload: string;
};

export type TotalFlow = {
  download: string;
  upload: string;
  counters?: Record<string, Counter>;
};

export type TrafficPoint = {
  start: string;
  download: string;
  upload: string;
};

export type TrafficSeries = {
  interval: "hour" | "day" | "month";
  items: TrafficPoint[];
};

export type TelemetryItem = {
  value: string;
  download: string;
  upload: string;
  failures: string;
};

export type TelemetryGroup = {
  dimension: "protocol" | "outbound" | "process" | "rule" | "tag" | "destination";
  items: TelemetryItem[];
};

export type TelemetrySummary = {
  groups: TelemetryGroup[];
};

export type Connection = {
  id: string;
  addr: string;
  network: {
    connType: string;
    underlyingType: string;
  };
  source: string;
  inbound: string;
  inboundName: string;
  interface: string;
  outbound: string;
  localAddr: string;
  destination: string;
  fakeIp: string;
  hosts: string;
  domain: string;
  ip: string;
  tag: string;
  nodeId: string;
  nodeName: string;
  protocol: string;
  process: string;
  pid: string;
  uid: string;
  tlsServerName: string;
  httpHost: string;
  component: string;
  udpMigrateId: string;
  mode: string;
  resolver: string;
  geo: string;
  outboundGeo: string;
  lists?: string[];
  matchHistory?: MatchHistoryEntry[];
};

export type MatchHistoryEntry = {
  ruleName: string;
  history: MatchResult[];
};

export type MatchResult = {
  listName: string;
  matched: boolean;
};

export type Connections = {
  connections: Connection[];
};

export type FailedHistory = {
  protocol: string;
  host: string;
  error: string;
  process: string;
  time: string;
  failedCount: string;
};

export type FailedHistoryList = {
  items: FailedHistory[];
  dumpProcessEnabled: boolean;
};

export type AllHistory = {
  connection: Connection;
  count: string;
  time: string;
};

export type AllHistoryList = {
  items: AllHistory[];
  dumpProcessEnabled: boolean;
};

export function normalizeConnection(value: Partial<Connection> | undefined): Connection {
  return {
    id: value?.id ?? "",
    addr: value?.addr ?? "",
    network: {
      connType: value?.network?.connType ?? "",
      underlyingType: value?.network?.underlyingType ?? "",
    },
    source: value?.source ?? "",
    inbound: value?.inbound ?? "",
    inboundName: value?.inboundName ?? "",
    interface: value?.interface ?? "",
    outbound: value?.outbound ?? "",
    localAddr: value?.localAddr ?? "",
    destination: value?.destination ?? "",
    fakeIp: value?.fakeIp ?? "",
    hosts: value?.hosts ?? "",
    domain: value?.domain ?? "",
    ip: value?.ip ?? "",
    tag: value?.tag ?? "",
    nodeId: value?.nodeId ?? "",
    nodeName: value?.nodeName ?? "",
    protocol: value?.protocol ?? "",
    process: value?.process ?? "",
    pid: value?.pid ?? "",
    uid: value?.uid ?? "",
    tlsServerName: value?.tlsServerName ?? "",
    httpHost: value?.httpHost ?? "",
    component: value?.component ?? "",
    udpMigrateId: value?.udpMigrateId ?? "",
    mode: value?.mode ?? "",
    resolver: value?.resolver ?? "",
    geo: value?.geo ?? "",
    outboundGeo: value?.outboundGeo ?? "",
    lists: Array.isArray(value?.lists) ? value.lists : [],
    matchHistory: Array.isArray(value?.matchHistory)
      ? value.matchHistory.map(entry => ({
        ruleName: entry.ruleName ?? "",
        history: Array.isArray(entry.history)
          ? entry.history.map(item => ({
            listName: item.listName ?? "",
            matched: item.matched ?? false,
          }))
          : [],
      }))
      : [],
  };
}

export function normalizeFailedHistory(value: Partial<FailedHistory> | undefined): FailedHistory {
  return {
    protocol: value?.protocol ?? "",
    host: value?.host ?? "",
    error: value?.error ?? "",
    process: value?.process ?? "",
    time: value?.time ?? "",
    failedCount: value?.failedCount ?? "0",
  };
}

export function normalizeAllHistory(value: Partial<AllHistory> | undefined): AllHistory {
  return {
    connection: normalizeConnection(value?.connection),
    count: value?.count ?? "0",
    time: value?.time ?? "",
  };
}
