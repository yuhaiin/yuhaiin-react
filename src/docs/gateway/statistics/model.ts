import type { Go } from "@/api/generated-contracts";
import { bucketLabel } from "@/component/v2/stats/format";

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

export { bucketPercentile as latencyPercentile, formatCount, formatMs, formatPercent, ratio } from "@/component/v2/stats/format";

export function latencyBucketLabel(bucket: LatencyBucket, previous?: LatencyBucket): string {
  return bucketLabel(bucket, previous);
}
