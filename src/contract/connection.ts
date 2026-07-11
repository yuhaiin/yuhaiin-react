import type { Go } from "@/api/generated-contracts";

export type Counter = Go.connection.Counter;
export type TotalFlow = Go.connection.TotalFlow;
export type TrafficPoint = Go.connection.TrafficPoint;
export type TrafficSeries = Omit<Go.connection.TrafficSeries, "interval"> & {
  interval: "hour" | "day" | "month";
};
export type TelemetryItem = Go.connection.TelemetryItem;
export type TelemetryGroup = Omit<Go.connection.TelemetryGroup, "dimension"> & {
  dimension: "protocol" | "inbound" | "source" | "addr" | "outbound" | "process" | "rule" | "tag" | "destination";
};
export type TelemetrySummary = Omit<Go.connection.TelemetrySummary, "groups"> & { groups: TelemetryGroup[] };
export type Connection = Go.connection.Connection;
export type MatchHistoryEntry = Go.connection.MatchHistoryEntry;
export type MatchResult = Go.connection.MatchResult;
export type Connections = Go.connection.Connections;
export type FailedHistory = Go.connection.FailedHistory;
export type FailedHistoryList = Go.connection.FailedHistoryList;
export type AllHistory = Go.connection.AllHistory;
export type AllHistoryList = Go.connection.AllHistoryList;

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
