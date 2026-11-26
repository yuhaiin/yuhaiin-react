import { expect, it } from "vitest";
import type { Connection } from "@/contract/connection";
import { aggregateHistory, errorSummary, failedByError, failedByHost, liveCountries, sortRanked, telemetryCountries, telemetryItems } from "./model";

const columns = (opened: number[]) => ({
  intervalMs: 10_000, endUnixMs: 120_000,
  opened, failed: opened.map((v) => v ? 1 : 0), closed: opened.map(() => 0),
  active: opened.map((_, i) => i), connectNs: opened.map((v) => v * 4e6),
  download: opened.map((v) => v * 100), upload: opened.map(() => 1),
});

it("folds 10-second history into minute points with peak active and average connect time", () => {
  const points = aggregateHistory(columns([1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 3]));
  expect(points).toHaveLength(2);
  expect(points[1]).toMatchObject({ end: 120_000, opened: 5, failed: 2, active: 11, connectMs: 4, download: 500, upload: 6 });
  expect(points[0]).toMatchObject({ end: 60_000, opened: 1, active: 5, connectMs: 4 });
  expect(aggregateHistory(columns([0, 0, 0, 0, 0, 0]))[0].connectMs).toBeNull();
  expect(aggregateHistory(undefined)).toEqual([]);
});

const conn = (id: string, geo: string, domain: string, outboundGeo = "") =>
  ({ id, geo, outboundGeo, domain, ip: "", addr: `${domain}:443` }) as unknown as Connection;

it("groups open connections by country with bytes and busiest destinations", () => {
  const rows = liveCountries([
    conn("1", "jp", "a.example"), conn("2", "JP", "a.example"), conn("3", "JP", "b.example"), conn("4", "", "c.example", "US"),
  ], { "1": { download: "10", upload: "1" }, "3": { download: "5", upload: "0" } }, "geo");
  const jp = rows.find((row) => row.code === "JP")!;
  expect(jp).toMatchObject({ connections: 3, download: 15, upload: 1 });
  expect(jp.destinations).toEqual([{ value: "a.example", connections: 2 }, { value: "b.example", connections: 1 }]);
  expect(rows.find((row) => row.code === "")?.connections).toBe(1);
  expect(liveCountries([conn("4", "", "c.example", "us")], undefined, "outboundGeo")[0].code).toBe("US");
});

const summary = {
  groups: [
    { dimension: "geo" as const, items: [{ value: "US", download: "100", upload: "20", failures: "0" }, { value: "JP", download: "5", upload: "0", failures: "7" }] },
    { dimension: "rule" as const, items: [{ value: "a", download: "0", upload: "0", failures: "3" }, { value: "b", download: "9", upload: "1", failures: "0" }] },
  ],
};

it("reads telemetry countries and ranks by traffic or failures", () => {
  expect(telemetryCountries(summary, "geo").map((row) => [row.code, row.download + row.upload, row.failures])).toEqual([["US", 120, 0], ["JP", 5, 7]]);
  expect(telemetryCountries(summary, "outboundGeo")).toEqual([]);
  expect(sortRanked(telemetryItems(summary, "rule"), "traffic").map((item) => item.value)).toEqual(["b"]);
  expect(sortRanked(telemetryItems(summary, "rule"), "failures").map((item) => item.value)).toEqual(["a"]);
});

it("groups failed history by normalized error and host", () => {
  const items = [
    { protocol: "tcp", host: "a.example", error: "dial tcp 10.0.0.1:443: connect: connection refused", process: "", time: "", failedCount: "3" },
    { protocol: "tcp", host: "b.example", error: "dial tcp 10.0.0.2:443: connect: connection refused", process: "", time: "", failedCount: "1" },
  ];
  expect(errorSummary(items[0].error)).toBe("dial tcp <ip>: connect: connection refused");
  expect(failedByError(items)).toEqual([{ value: "dial tcp <ip>: connect: connection refused", count: 4 }]);
  expect(failedByHost(items)[0]).toEqual({ value: "a.example", count: 3 });
});
