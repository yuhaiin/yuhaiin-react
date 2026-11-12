import { describe, expect, it } from "vitest";
import { clearBusyLatency, isLatencyError, latencyResultValue, pruneBusyLatency, pruneLatencyMap } from "./page";

describe("group latency state", () => {
    it("keeps failed latency results as errors instead of display text", () => {
        const failed = latencyResultValue({ ok: false, error: 'Get "https://clients3.google.com/generate_204": context deadline exceeded' } as never);

        expect(isLatencyError(failed)).toBe(true);
        expect(isLatencyError(latencyResultValue({ ok: true, latencyMs: 42 } as never))).toBe(false);
    });

    it("removes latency entries for nodes that disappeared even when the list size is unchanged", () => {
        const current = { old: { tcp: "42ms" } };

        expect(pruneLatencyMap(current, ["new"])).toEqual({});
    });

    it("removes completed busy tests instead of retaining false flags", () => {
        const busy = { node: { tcp: true } };

        expect(clearBusyLatency(busy, "node", "tcp")).toEqual({});
        expect(pruneBusyLatency({ old: { udp: true } }, ["new"])).toEqual({});
    });
});
