import { describe, expect, it } from "vitest";
import { MAX_PLAUSIBLE_RATE, RateSampler } from "./rates";

const counter = (download: string | number, upload: string | number) => ({ download: String(download), upload: String(upload) });

describe("RateSampler", () => {
    it("has no rate on the first sample", () => {
        const sampler = new RateSampler();
        const result = sampler.sample({ a: counter(1000, 500) }, 0);
        expect(result.rates.size).toBe(0);
        expect(result.fresh).toBe(1);
        expect(result.elapsed).toBe(0);
    });

    it("divides the counter delta by the actual elapsed time", () => {
        const sampler = new RateSampler();
        sampler.sample({ a: counter(1000, 500) }, 10_000);
        const result = sampler.sample({ a: counter(5000, 2500) }, 12_000);
        expect(result.rates.get("a")).toEqual({ down: 2000, up: 1000 });
        // A late poll: the same delta over 4 s is half the rate, not the nominal 2 s.
        const late = sampler.sample({ a: counter(9000, 4500) }, 16_000);
        expect(late.rates.get("a")).toEqual({ down: 1000, up: 500 });
    });

    it("keeps upload and download apart", () => {
        const sampler = new RateSampler();
        sampler.sample({ a: counter(0, 0) }, 0);
        expect(sampler.sample({ a: counter(0, 4096) }, 1000).rates.get("a")).toEqual({ down: 0, up: 4096 });
    });

    it("reports zero, not the cumulative total, for an idle connection", () => {
        const sampler = new RateSampler();
        sampler.sample({ a: counter(10 ** 9, 10 ** 9) }, 0);
        expect(sampler.sample({ a: counter(10 ** 9, 10 ** 9) }, 2000).rates.get("a")).toEqual({ down: 0, up: 0 });
    });

    it("treats a counter that went backwards as a reset without a rate", () => {
        const sampler = new RateSampler();
        sampler.sample({ a: counter(5000, 5000) }, 0);
        const reset = sampler.sample({ a: counter(100, 100) }, 2000);
        expect(reset.rates.has("a")).toBe(false);
        expect(reset.resets).toBe(1);
        expect(sampler.sample({ a: counter(2100, 100) }, 4000).rates.get("a")).toEqual({ down: 1000, up: 0 });
    });

    it("starts new connections fresh and forgets closed ones", () => {
        const sampler = new RateSampler();
        sampler.sample({ a: counter(0, 0) }, 0);
        const next = sampler.sample({ b: counter(800, 0) }, 2000);
        expect(next.rates.size).toBe(0);
        expect(next.fresh).toBe(1);
        // "a" closed in between; if its id came back it would be a new baseline.
        expect(sampler.sample({ a: counter(10, 0), b: counter(1800, 0) }, 4000).rates.get("a")).toBeUndefined();
    });

    it("ignores missing and malformed counters", () => {
        const sampler = new RateSampler();
        sampler.sample({ a: counter(0, 0), bad: { download: "-1", upload: "x" } }, 0);
        const result = sampler.sample({ a: counter(100, 0), bad: { download: "1e5", upload: "2" } }, 1000);
        expect([...result.rates.keys()]).toEqual(["a"]);
        expect(new RateSampler().sample(undefined, 0).rates.size).toBe(0);
    });

    it("discards implausible jumps", () => {
        const sampler = new RateSampler();
        sampler.sample({ a: counter(0, 0) }, 0);
        const result = sampler.sample({ a: counter(String(BigInt(MAX_PLAUSIBLE_RATE) * 10n), 0) }, 1000);
        expect(result.rates.has("a")).toBe(false);
        expect(result.discarded).toBe(1);
    });

    it("is exact for counters beyond 2^53", () => {
        const sampler = new RateSampler();
        const base = 2n ** 60n;
        sampler.sample({ a: counter(String(base), String(base)) }, 0);
        const result = sampler.sample({ a: counter(String(base + 3n), String(base + 1n)) }, 1000);
        // Number(2^60 + 3) - Number(2^60) would be 0 or 256; BigInt keeps the 3 bytes.
        expect(result.rates.get("a")).toEqual({ down: 3, up: 1 });
    });

    it("returns the previous result for a repeated sample", () => {
        const sampler = new RateSampler();
        sampler.sample({ a: counter(0, 0) }, 0);
        const first = sampler.sample({ a: counter(1000, 0) }, 1000);
        expect(sampler.sample({ a: counter(1000, 0) }, 1000)).toBe(first);
        expect(sampler.sample({ a: counter(3000, 0) }, 2000).rates.get("a")).toEqual({ down: 2000, up: 0 });
    });
});
