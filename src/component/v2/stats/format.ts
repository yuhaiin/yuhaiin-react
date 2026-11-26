/** Shared number formatting and histogram helpers for the statistics pages. */

/** A cumulative-free histogram bucket: `leMs` is the inclusive upper bound, 0 marks +Inf. */
export interface Bucket {
  leMs: number;
  count: number;
}

/**
 * Approximates a percentile from histogram buckets. The answer is the bucket's
 * upper bound; Infinity means the open-ended last bucket.
 */
export function bucketPercentile(buckets: Bucket[], quantile: number): number | null {
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

/** Durations from seconds to hours: "45 s", "5 min", "1.5 h". */
export function formatDuration(value: number | null): string {
  if (value === null) return "—";
  if (!Number.isFinite(value)) return "∞";
  if (value < 60_000) return formatMs(value);
  if (value < 3_600_000) return `${Number((value / 60_000).toFixed(value < 600_000 ? 1 : 0))} min`;
  return `${Number((value / 3_600_000).toFixed(1))} h`;
}

export function bucketLabel(bucket: Bucket, previous: Bucket | undefined, format: (value: number) => string = formatMs): string {
  if (bucket.leMs === 0) return `> ${format(previous?.leMs ?? 0)}`;
  return `≤ ${format(bucket.leMs)}`;
}
