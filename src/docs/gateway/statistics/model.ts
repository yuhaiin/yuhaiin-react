import type { Go } from "@/api/generated-contracts";

export type GatewayStatistics = Go.gateway.GatewayStatistics;
export type LatencyBucket = Go.gateway.LatencyBucket;

export interface HistoryPoint {
  end: number;
  requests: number;
  blocked: number;
  forwarded: number;
  errors: number;
  /** Average request duration in ms, or null when the interval had no requests. */
  latencyMs: number | null;
  bytesIn: number;
  bytesOut: number;
}

/**
 * Folds the backend's fixed-interval columns into coarser buckets so an hour
 * reads as 60 one-minute points instead of 360 noisy samples.
 */
export function aggregateHistory(history: Go.gateway.StatisticsHistory, bucketMs = 60_000): HistoryPoint[] {
  const length = history.requests.length;
  if (!length || history.intervalMs <= 0) return [];
  const per = Math.max(1, Math.round(bucketMs / history.intervalMs));
  const points: HistoryPoint[] = [];
  // Align from the newest sample so the last bucket is always complete-to-now.
  for (let endIndex = length - 1; endIndex >= 0; endIndex -= per) {
    const startIndex = Math.max(0, endIndex - per + 1);
    let requests = 0, blocked = 0, forwarded = 0, errors = 0, duration = 0, bytesIn = 0, bytesOut = 0;
    for (let i = startIndex; i <= endIndex; i++) {
      requests += history.requests[i] ?? 0;
      blocked += history.blocked[i] ?? 0;
      forwarded += history.forwarded[i] ?? 0;
      errors += history.errors[i] ?? 0;
      duration += history.durationNs[i] ?? 0;
      bytesIn += history.bytesIn[i] ?? 0;
      bytesOut += history.bytesOut[i] ?? 0;
    }
    points.push({
      end: history.endUnixMs - (length - 1 - endIndex) * history.intervalMs,
      requests, blocked, forwarded, errors, bytesIn, bytesOut,
      latencyMs: requests ? duration / requests / 1e6 : null,
    });
  }
  return points.reverse();
}

/**
 * Approximates a percentile from cumulative histogram buckets. The answer is
 * the bucket's upper bound; Infinity means the open-ended last bucket.
 */
export function latencyPercentile(buckets: LatencyBucket[], quantile: number): number | null {
  const total = buckets.reduce((sum, b) => sum + b.count, 0);
  if (!total) return null;
  const target = Math.ceil(total * quantile);
  let seen = 0;
  for (const bucket of buckets) {
    seen += bucket.count;
    if (seen >= target) return bucket.leMs === 0 ? Infinity : bucket.leMs;
  }
  return Infinity;
}

export function ratio(part: number, total: number): number {
  return total > 0 ? part / total : 0;
}

export function formatPercent(value: number, locale?: string): string {
  return new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: value < 0.1 && value > 0 ? 2 : 1 }).format(value);
}

export function formatCount(value: number, locale?: string): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatMs(value: number | null): string {
  if (value === null) return "—";
  if (!Number.isFinite(value)) return "∞";
  if (value === 0) return "0 ms";
  if (value >= 10_000) return `${(value / 1000).toFixed(0)} s`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)} s`;
  return `${value < 10 ? value.toFixed(1) : value.toFixed(0)} ms`;
}

export function latencyBucketLabel(bucket: LatencyBucket, previous?: LatencyBucket): string {
  if (bucket.leMs === 0) return `> ${formatMs(previous?.leMs ?? 0)}`;
  return `≤ ${formatMs(bucket.leMs)}`;
}
