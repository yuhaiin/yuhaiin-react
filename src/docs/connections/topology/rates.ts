import type { Counter } from "@/contract/connection";

/** Bytes per second in each direction, measured between two counter samples. */
export interface Rate {
    up: number;
    down: number;
}

export interface RateSample {
    /** Rates of connections that had a counter in both samples. */
    rates: Map<string, Rate>;
    /** Seconds between the two samples; 0 for the first sample. */
    elapsed: number;
    /** Connections whose counter appeared for the first time (no rate yet). */
    fresh: number;
    /** Connections whose counter went backwards; treated as a new baseline. */
    resets: number;
    /** Deltas dropped because they exceeded the plausible link speed. */
    discarded: number;
}

/**
 * The fastest rate accepted from one counter. Anything above it is an
 * artifact (a counter jump or a restarted backend that reused an id),
 * not traffic, and must not reach the animation. 100 GB/s is far above any
 * real yuhaiin deployment.
 */
export const MAX_PLAUSIBLE_RATE = 100 * 1024 ** 3;

/**
 * Per-connection rates from cumulative counters.
 *
 * `/api/v2/connections/total` returns cumulative per-connection byte counts as
 * decimal uint64 strings. A rate needs two samples of the same counter:
 * `(current - previous) / elapsed`, where `elapsed` is the actual time
 * between the samples, never the nominal polling interval. Deltas are
 * computed with BigInt so counters above 2^53 stay exact. A counter that
 * decreases was reset (the backend restarted or reused the id) and becomes a
 * new baseline without a rate. Counters that disappear belong to closed
 * connections and are forgotten.
 */
export class RateSampler {
    private previous = new Map<string, { down: bigint; up: bigint }>();
    private previousAt: number | undefined;
    private last: RateSample = { rates: new Map(), elapsed: 0, fresh: 0, resets: 0, discarded: 0 };

    sample(counters: Record<string, Counter> | undefined, at: number): RateSample {
        const result: RateSample = { rates: new Map(), elapsed: 0, fresh: 0, resets: 0, discarded: 0 };
        const next = new Map<string, { down: bigint; up: bigint }>();
        const elapsed = this.previousAt === undefined ? 0 : (at - this.previousAt) / 1000;
        // The same sample delivered twice (or a clock that moved backwards)
        // carries no new information: keep the baseline and the last rates.
        if (this.previousAt !== undefined && elapsed <= 0.05) return this.last;
        result.elapsed = elapsed;
        for (const [id, counter] of Object.entries(counters ?? {})) {
            const down = parseCounter(counter.download);
            const up = parseCounter(counter.upload);
            if (down === undefined || up === undefined) continue;
            next.set(id, { down, up });
            const before = this.previous.get(id);
            if (!before || elapsed === 0) {
                result.fresh++;
                continue;
            }
            if (down < before.down || up < before.up) {
                result.resets++;
                continue;
            }
            const downRate = Number(down - before.down) / elapsed;
            const upRate = Number(up - before.up) / elapsed;
            if (downRate > MAX_PLAUSIBLE_RATE || upRate > MAX_PLAUSIBLE_RATE) {
                result.discarded++;
                continue;
            }
            result.rates.set(id, { down: downRate, up: upRate });
        }
        this.previous = next;
        this.previousAt = at;
        this.last = result;
        return result;
    }

    reset() {
        this.previous.clear();
        this.previousAt = undefined;
        this.last = { rates: new Map(), elapsed: 0, fresh: 0, resets: 0, discarded: 0 };
    }
}

function parseCounter(value: string | number | undefined): bigint | undefined {
    if (value === undefined || value === null) return undefined;
    const text = String(value).trim();
    if (!/^\d{1,20}$/.test(text)) return undefined;
    return BigInt(text);
}
