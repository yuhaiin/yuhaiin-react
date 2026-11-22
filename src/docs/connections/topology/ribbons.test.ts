import { describe, expect, it } from "vitest";
import { buildStrands, compactMapping, defaultMapping, intensityFor, normalsOf, strandPoint, strandsFor, type FlowPath } from "./ribbons";

function straight(length: number, segments = 20): FlowPath {
    const points = new Float32Array((segments + 1) * 2);
    const lengths = new Float32Array(segments + 1);
    for (let index = 0; index <= segments; index++) {
        points[index * 2] = (length * index) / segments;
        lengths[index] = (length * index) / segments;
    }
    return { points, lengths, length };
}

const input = (up: number, down: number, extra: Partial<{ spread: number; length: number; animated: boolean }> = {}) =>
    ({ up, down, spread: 20, length: 300, animated: true, ...extra });

describe("rate mapping", () => {
    it("has no strands without traffic and more strands for more traffic, within the limit", () => {
        expect(strandsFor(0)).toBe(0);
        expect(intensityFor(0)).toBe(0);
        const rates = [1, 2048, 1 << 20, 50 * 2 ** 20, 10 * 2 ** 30];
        const counts = rates.map(rate => strandsFor(rate));
        for (let index = 1; index < counts.length; index++) expect(counts[index]).toBeGreaterThanOrEqual(counts[index - 1]);
        // A flow is always a bundle, never a lone line.
        expect(Math.min(...counts)).toBe(2);
        expect(Math.max(...counts)).toBe(defaultMapping.maxStrands);
    });
});

describe("buildStrands", () => {
    it("gives each direction its own strands and none to idle or auxiliary edges", () => {
        const strands = buildStrands(["a", "b", "c", "dns"], [input(1 << 20, 0), input(0, 1 << 20), input(0, 0), input(1 << 20, 1 << 20, { animated: false })]);
        expect(strands.filter(strand => strand.edge === 0).every(strand => strand.tone === 0)).toBe(true);
        expect(strands.filter(strand => strand.edge === 1).every(strand => strand.tone === 1)).toBe(true);
        expect(strands.some(strand => strand.edge === 2 || strand.edge === 3)).toBe(false);
    });

    it("never exceeds the budget and scales every direction down together", () => {
        const many = Array.from({ length: 400 }, () => input(1 << 30, 1 << 30));
        const strands = buildStrands(many.map((_, index) => `e${index}`), many, compactMapping);
        expect(strands.length).toBe(compactMapping.budget);
        const fewer = buildStrands(["a", "b"], [input(1 << 30, 1 << 30), input(1 << 30, 1 << 30)], { ...defaultMapping, budget: 4 });
        expect(fewer.length).toBe(4);
    });

    it("is deterministic, so strands keep their shape across updates", () => {
        expect(buildStrands(["a"], [input(1 << 20, 1 << 10)])).toEqual(buildStrands(["a"], [input(1 << 20, 1 << 10)]));
    });

    it("moves faster and brighter with more traffic", () => {
        const [slow] = buildStrands(["a"], [input(1024, 0)]);
        const [fast] = buildStrands(["a"], [input(1 << 26, 0)]);
        expect(fast.intensity).toBeGreaterThan(slow.intensity);
        expect(fast.sheen).toBeGreaterThan(slow.sheen);
        expect(fast.drift).toBeGreaterThan(slow.drift);
    });
});

describe("strandPoint", () => {
    it("starts and ends on the card edges, within the spread, at any time", () => {
        const path = straight(300);
        const normals = normalsOf(path.points);
        const out = new Float32Array(2);
        for (const strand of buildStrands(["a"], [input(1 << 24, 1 << 24)])) {
            for (const time of [0, 1.7, 42]) {
                strandPoint(strand, path, normals, 0, time, out);
                expect(out[0]).toBeCloseTo(0, 4);
                expect(Math.abs(out[1])).toBeLessThanOrEqual(20);
                expect(out[1]).toBeCloseTo(strand.lane, 4);
                strandPoint(strand, path, normals, 20, time, out);
                expect(out[0]).toBeCloseTo(300, 4);
                expect(out[1]).toBeCloseTo(strand.lane, 4);
            }
        }
    });

    it("waves in the middle and the wave moves with time", () => {
        const path = straight(300);
        const normals = normalsOf(path.points);
        const [strand] = buildStrands(["a"], [input(1 << 24, 0)]);
        const a = new Float32Array(2), b = new Float32Array(2);
        strandPoint(strand, path, normals, 10, 0, a);
        strandPoint(strand, path, normals, 10, 1.5, b);
        expect(a[1]).not.toBeCloseTo(b[1], 3);
        // Bounded: ends' offsets plus the amplitude.
        expect(Math.abs(a[1])).toBeLessThanOrEqual(20 + strand.amplitude + 1e-6);
    });

    it("keeps the strands of a bundle in order along the whole path: no crossings", () => {
        const path = straight(300);
        const normals = normalsOf(path.points);
        const strands = buildStrands(["a"], [input(1 << 26, 1 << 26)]);
        expect(strands.length).toBeGreaterThan(4);
        const out = new Float32Array(2);
        for (const time of [0, 3, 17.5]) {
            for (let index = 0; index <= 20; index++) {
                const offsets = strands.map(strand => { strandPoint(strand, path, normals, index, time, out); return out[1]; });
                for (let next = 1; next < offsets.length; next++) expect(offsets[next]).toBeGreaterThan(offsets[next - 1]);
            }
        }
    });

    it("keeps upload and download in their own halves of the slot", () => {
        const strands = buildStrands(["a"], [input(1 << 20, 1 << 20)]);
        const upload = strands.filter(strand => strand.tone === 0).map(strand => strand.lane);
        const download = strands.filter(strand => strand.tone === 1).map(strand => strand.lane);
        expect(Math.max(...upload)).toBeLessThan(Math.min(...download));
        expect(Math.max(...strands.map(strand => Math.abs(strand.lane)))).toBeLessThanOrEqual(20);
    });
});
