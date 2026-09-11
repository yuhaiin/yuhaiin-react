import type { FailedHistory } from "@/contract/connection";
import { describe, expect, it } from "vitest";
import { sortFailedHistory } from "./page";

describe("sortFailedHistory", () => {
    it("sorts a view without mutating the SWR source array", () => {
        const source: FailedHistory[] = [
            { host: "z.example", error: "timeout", protocol: "tcp", process: "", time: "2026-09-11T00:00:00Z", failedCount: "1" },
            { host: "a.example", error: "refused", protocol: "tcp", process: "", time: "2026-09-11T01:00:00Z", failedCount: "2" },
        ];

        const sorted = sortFailedHistory(source, "Host", "asc");

        expect(sorted.map(item => item.host)).toEqual(["a.example", "z.example"]);
        expect(source.map(item => item.host)).toEqual(["z.example", "a.example"]);
        expect(sorted).not.toBe(source);
    });
});
