import type { Go } from "@/api/generated-contracts";
import type { Connection, Counter, FailedHistory, TelemetryGroup, TelemetrySummary } from "@/contract/connection";

export type ConnectionStatistics = Go.connection.Statistics;

export interface HistoryPoint {
  end: number;
  opened: number;
  failed: number;
  closed: number;
  /** Highest number of open connections in the bucket. */
  active: number;
  /** Average connect time in ms, or null when nothing opened in the bucket. */
  connectMs: number | null;
  download: number;
  upload: number;
}

/** Folds the 10-second columns into one-minute points aligned to the newest sample. */
export function aggregateHistory(history: Go.connection.StatisticsHistory | undefined, bucketMs = 60_000): HistoryPoint[] {
  const length = history?.opened?.length ?? 0;
  if (!history || !length || history.intervalMs <= 0) return [];
  const per = Math.max(1, Math.round(bucketMs / history.intervalMs));
  const points: HistoryPoint[] = [];
  for (let endIndex = length - 1; endIndex >= 0; endIndex -= per) {
    const startIndex = Math.max(0, endIndex - per + 1);
    let opened = 0, failed = 0, closed = 0, active = 0, connect = 0, download = 0, upload = 0;
    for (let i = startIndex; i <= endIndex; i++) {
      opened += history.opened[i] ?? 0;
      failed += history.failed[i] ?? 0;
      closed += history.closed[i] ?? 0;
      active = Math.max(active, history.active[i] ?? 0);
      connect += history.connectNs[i] ?? 0;
      download += history.download[i] ?? 0;
      upload += history.upload[i] ?? 0;
    }
    points.push({
      end: history.endUnixMs - (length - 1 - endIndex) * history.intervalMs,
      opened, failed, closed, active, download, upload,
      connectMs: opened ? connect / opened / 1e6 : null,
    });
  }
  return points.reverse();
}

export const rankedDimensions = ["rule", "outbound", "selector", "destination", "process", "inbound", "source", "addr", "protocol"] as const;
export type RankedDimension = typeof rankedDimensions[number];
export type GeoDimension = "geo" | "outboundGeo";
export type TelemetrySort = "traffic" | "failures";

export interface RankedItem {
  value: string;
  download: number;
  upload: number;
  failures: number;
}

const num = (value: string | number | undefined) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export function telemetryItems(summary: TelemetrySummary | undefined, dimension: TelemetryGroup["dimension"]): RankedItem[] {
  const group = summary?.groups.find((g) => g.dimension === dimension);
  return (group?.items ?? []).map((item) => ({
    value: item.value, download: num(item.download), upload: num(item.upload), failures: num(item.failures),
  }));
}

export function sortRanked(items: RankedItem[], sort: TelemetrySort): RankedItem[] {
  const key = (item: RankedItem) => sort === "failures" ? item.failures : item.download + item.upload;
  return [...items].filter((item) => key(item) > 0)
    .sort((a, b) => key(b) - key(a) || a.value.localeCompare(b.value));
}

export interface CountryRow {
  code: string;
  connections: number;
  download: number;
  upload: number;
  failures: number;
  /** Busiest destinations; only known for live connections. */
  destinations: { value: string; connections: number }[];
}

/** Groups the open connections by country. An empty code means GeoIP had no answer. */
export function liveCountries(connections: Connection[], counters: Record<string, Counter> | undefined, dimension: GeoDimension): CountryRow[] {
  const rows = new Map<string, CountryRow & { hosts: Map<string, number> }>();
  for (const connection of connections) {
    const code = (dimension === "geo" ? connection.geo : connection.outboundGeo)?.toUpperCase() ?? "";
    let row = rows.get(code);
    if (!row) rows.set(code, row = { code, connections: 0, download: 0, upload: 0, failures: 0, destinations: [], hosts: new Map() });
    const counter = counters?.[connection.id];
    row.connections++;
    row.download += num(counter?.download);
    row.upload += num(counter?.upload);
    const host = connection.domain || connection.ip || connection.addr;
    if (host) row.hosts.set(host, (row.hosts.get(host) ?? 0) + 1);
  }
  return [...rows.values()].map(({ hosts, ...row }) => ({
    ...row,
    destinations: [...hosts].map(([value, connections]) => ({ value, connections }))
      .sort((a, b) => b.connections - a.connections || a.value.localeCompare(b.value)).slice(0, 3),
  }));
}

export function telemetryCountries(summary: TelemetrySummary | undefined, dimension: GeoDimension): CountryRow[] {
  return telemetryItems(summary, dimension).map((item) => ({
    code: item.value.toUpperCase(), connections: 0, download: item.download, upload: item.upload, failures: item.failures, destinations: [],
  }));
}

export type CountryMetric = "connections" | "traffic" | "failures";

export function countryValue(row: CountryRow, metric: CountryMetric): number {
  if (metric === "connections") return row.connections;
  if (metric === "failures") return row.failures;
  return row.download + row.upload;
}

export interface Tally { value: string; count: number }

/** Counts values with an optional weight, most frequent first. */
export function tally<T>(items: T[], key: (item: T) => string, weight: (item: T) => number = () => 1): Tally[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const value = key(item);
    counts.set(value, (counts.get(value) ?? 0) + weight(item));
  }
  return [...counts].map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

/** Normalizes noisy dial errors so the same cause groups together. */
export function errorSummary(error: string): string {
  return error
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?\b/g, "<ip>")
    .replace(/\[[0-9a-f:]+\](?::\d+)?/gi, "<ip>")
    .replace(/:\d{2,5}\b/g, ":<port>")
    .trim();
}

export function failedByHost(items: FailedHistory[]): Tally[] {
  return tally(items, (item) => item.host || "—", (item) => Math.max(1, num(item.failedCount)));
}

export function failedByError(items: FailedHistory[]): Tally[] {
  return tally(items, (item) => errorSummary(item.error || "—"), (item) => Math.max(1, num(item.failedCount)));
}
