import { describe, expect, it } from "vitest";
import { clearBusyLatency, pruneBusyLatency, pruneLatencyMap } from "./page";

describe("group latency state", () => {
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
