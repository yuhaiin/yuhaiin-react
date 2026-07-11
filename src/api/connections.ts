import { requestJSON } from "@/api/client";
import type { AllHistoryList, Connections, FailedHistoryList, TelemetrySummary, TotalFlow, TrafficSeries } from "@/contract/connection";
import { normalizeAllHistory, normalizeConnection, normalizeFailedHistory } from "@/contract/connection";
import type { Go } from "@/api/generated-contracts";

export async function getTotalFlow(): Promise<TotalFlow> {
  return requestJSON<Go.connection.TotalFlow>("GET", "/api/v2/connections/total") as Promise<TotalFlow>;
}

export async function getTraffic(interval: TrafficSeries["interval"], from: Date, to: Date): Promise<TrafficSeries> {
  return requestJSON<Go.connection.TrafficSeries>("GET", "/api/v2/connections/traffic", undefined, {
    interval,
    from: from.toISOString(),
    to: to.toISOString(),
  }) as unknown as Promise<TrafficSeries>;
}

export async function getTelemetry(from: Date, to: Date, limit = 6): Promise<TelemetrySummary> {
  return requestJSON<Go.connection.TelemetrySummary>("GET", "/api/v2/connections/telemetry", undefined, {
    from: from.toISOString(),
    to: to.toISOString(),
    limit,
  }) as unknown as Promise<TelemetrySummary>;
}

export async function getConnections(): Promise<Connections> {
  const data = await requestJSON<Go.connection.Connections>("GET", "/api/v2/connections");
  return { connections: (data.connections ?? []).map(item => normalizeConnection(item as unknown as Partial<Connections["connections"][number]>)) };
}

export async function closeConnections(ids: string[]): Promise<void> {
  await requestJSON<void>("POST", "/api/v2/connections/close", { ids });
}

export async function getAllHistory(): Promise<AllHistoryList> {
  const data = await requestJSON<Go.connection.AllHistoryList>("GET", "/api/v2/connections/history");
  return { items: (data.items ?? []).map(item => normalizeAllHistory(item as unknown as Partial<import("@/contract/connection").AllHistory>)), dumpProcessEnabled: data.dumpProcessEnabled ?? false };
}

export async function getFailedHistory(): Promise<FailedHistoryList> {
  const data = await requestJSON<Go.connection.FailedHistoryList>("GET", "/api/v2/connections/failed-history");
  return { items: (data.items ?? []).map(item => normalizeFailedHistory(item as unknown as Partial<import("@/contract/connection").FailedHistory>)), dumpProcessEnabled: data.dumpProcessEnabled ?? false };
}
