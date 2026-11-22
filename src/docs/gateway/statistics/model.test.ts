import { expect, it } from "vitest";
import { aggregateHistory, formatMs, latencyPercentile } from "./model";

const columns = (values: number[]) => ({
  intervalMs: 10_000, endUnixMs: 120_000,
  requests: values, blocked: values.map((v) => v > 0 ? 1 : 0), forwarded: values.map(() => 0), errors: values.map(() => 0),
  durationNs: values.map((v) => v * 2e6), bytesIn: values.map(() => 0), bytesOut: values.map((v) => v * 10),
});

it("folds history into minute buckets aligned to the newest sample", () => {
  const points = aggregateHistory(columns([1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 3]));
  expect(points).toHaveLength(2);
  expect(points[1]).toMatchObject({ end: 120_000, requests: 5, blocked: 2, bytesOut: 50, latencyMs: 2 });
  expect(points[0]).toMatchObject({ end: 60_000, requests: 1, latencyMs: 2 });
});

it("reports no latency for idle buckets", () => {
  expect(aggregateHistory(columns([0, 0, 0, 0, 0, 0]))[0].latencyMs).toBeNull();
});

it("approximates percentiles by bucket upper bound", () => {
  const buckets = [{ leMs: 10, count: 50 }, { leMs: 100, count: 45 }, { leMs: 0, count: 5 }];
  expect(latencyPercentile(buckets, 0.5)).toBe(10);
  expect(latencyPercentile(buckets, 0.95)).toBe(100);
  expect(latencyPercentile(buckets, 0.99)).toBe(Infinity);
  expect(latencyPercentile([], 0.5)).toBeNull();
  expect(formatMs(Infinity)).toBe("∞");
  expect(formatMs(2500)).toBe("2.5 s");
});
