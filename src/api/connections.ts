import { requestJSON } from "@/api/client";
import type { AllHistoryList, Connections, FailedHistoryList, TotalFlow, TrafficSeries } from "@/contract/connection";
import { normalizeAllHistory, normalizeConnection, normalizeFailedHistory } from "@/contract/connection";

export async function getTotalFlow(): Promise<TotalFlow> {
  return requestJSON<TotalFlow>("GET", "/api/v2/connections/total");
}

export async function getTraffic(interval: TrafficSeries["interval"], from: Date, to: Date): Promise<TrafficSeries> {
  return requestJSON<TrafficSeries>("GET", "/api/v2/connections/traffic", undefined, {
    interval,
    from: from.toISOString(),
    to: to.toISOString(),
  });
}

export async function getConnections(): Promise<Connections> {
  const data = await requestJSON<Connections>("GET", "/api/v2/connections");
  return { connections: (data.connections ?? []).map(item => normalizeConnection(item)) };
}

export async function closeConnections(ids: string[]): Promise<void> {
  await requestJSON<void>("POST", "/api/v2/connections/close", { ids });
}

export async function getAllHistory(): Promise<AllHistoryList> {
  const data = await requestJSON<AllHistoryList>("GET", "/api/v2/connections/history");
  return { items: (data.items ?? []).map(item => normalizeAllHistory(item)), dumpProcessEnabled: data.dumpProcessEnabled ?? false };
}

export async function getFailedHistory(): Promise<FailedHistoryList> {
  const data = await requestJSON<FailedHistoryList>("GET", "/api/v2/connections/failed-history");
  return { items: (data.items ?? []).map(item => normalizeFailedHistory(item)), dumpProcessEnabled: data.dumpProcessEnabled ?? false };
}
