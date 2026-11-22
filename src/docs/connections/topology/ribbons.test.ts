import { describe, expect, it } from "vitest";
import {
    buildStrands, compactMapping, defaultMapping, intensityFor, LANE_PX, normalsOf, resolveStrand, strandPoint, strandsFor, WAVE_PX,
    type FlowPath, type StrandShape,
} from "./ribbons";

function straight(length: number, segments = 20): FlowPath {
    const points = new Float32Array((segments + 1) * 2);
    const lengths = new Float32Array(segments + 1);
    for (let index = 0; index <= segments; index++) {
        points[index * 2] = (length * index) / segments;
        lengths[index] = (length * index) / segments;
    }
    return { points, lengths, length };
}

const input = (up: number, down: number, extra: Partial<{ length: number; animated: boolean }> = {}) =>
    ({ up, down, length: 300, animated: true, ...extra });
const shape = (): StrandShape => ({ lane: 0, amplitude: 0, phase: 0, waveStart: 0, waveEnd: 1 });

describe("rate mapping", () => {
    it("has no strands without traffic and more strands for more traffic, within the limit", () => {
        expect(strandsFor(0)).toBe(0);
        expect(intensityFor(0)).toBe(0);
        const counts = [1, 2048, 1 << 20, 50 * 2 ** 20, 10 * 2 ** 30].map(rate => strandsFor(rate));
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
        expect(buildStrands(many.map((_, index) => `e${index}`), many, compactMapping).length).toBe(compactMapping.budget);
        const fewer = buildStrands(["a", "b"], [input(1 << 30, 1 << 30), input(1 << 30, 1 << 30)], { ...defaultMapping, budget: 4 });
        expect(fewer.length).toBe(4);
    });

    it("is deterministic, so strands keep their shape across updates", () => {
        expect(buildStrands(["a"], [input(1 << 20, 1 << 10)])).toEqual(buildStrands(["a"], [input(1 << 20, 1 << 10)]));
    });

    it("drifts with a 6-10 s period and moves its sheen faster with more traffic", () => {
        const [slow] = buildStrands(["a"], [input(1024, 0)]);
        const [fast] = buildStrands(["a"], [input(1 << 26, 0)]);
        for (const strand of [slow, fast]) {
            const period = (Math.PI * 2) / strand.drift;
            expect(period).toBeGreaterThanOrEqual(5.5);
            expect(period).toBeLessThanOrEqual(10.5);
        }
        expect(fast.drift).toBeGreaterThan(slow.drift);
        expect(fast.sheen).toBeGreaterThan(slow.sheen);
        expect(fast.intensity).toBeGreaterThan(slow.intensity);
    });

    it("shares one wave across a bundle", () => {
        const strands = buildStrands(["a"], [input(1 << 24, 1 << 24)]);
        expect(new Set(strands.map(strand => strand.amplitudePx)).size).toBe(1);
        expect(new Set(strands.map(strand => strand.drift)).size).toBe(1);
        expect(new Set(strands.map(strand => strand.waves)).size).toBe(1);
    });
});

describe("resolveStrand", () => {
    it("keeps the wave about WAVE_PX high on screen at any zoom, capped by the edge length", () => {
        const [strand] = buildStrands(["a"], [input(1 << 24, 0, { length: 1000 })]);
        for (const k of [0.3, 0.66, 1, 2]) {
            const out = shape();
            resolveStrand(strand, k, 20, 0, 1, out);
            const screen = out.amplitude * k;
            expect(screen).toBeGreaterThanOrEqual(WAVE_PX * 0.8);
            expect(screen).toBeLessThanOrEqual(WAVE_PX * 1.35);
        }
        const [short] = buildStrands(["s"], [input(1 << 24, 0, { length: 40 })]);
        const out = shape();
        resolveStrand(short, 0.3, 20, 0, 1, out);
        expect(out.amplitude).toBeLessThanOrEqual(40 * 0.12 + 1e-6);
    });

    it("spaces lanes LANE_PX apart on screen, never wider than the slot", () => {
        const strands = buildStrands(["a"], [input(1 << 24, 1 << 24)]);
        const lanes = (k: number, spread: number) => strands.map(strand => { const out = shape(); resolveStrand(strand, k, spread, 0, 1, out); return out.lane; });
        const near = lanes(1, 50);
        expect(near[1] - near[0]).toBeCloseTo(LANE_PX, 5);
        const far = lanes(0.2, 6);
        expect(Math.max(...far.map(Math.abs))).toBeLessThanOrEqual(6 + 1e-6);
    });
});

describe("strandPoint", () => {
    it("starts and ends on its lane at any time", () => {
        const path = straight(300);
        const normals = normalsOf(path.points);
        const out = new Float32Array(2);
        for (const strand of buildStrands(["a"], [input(1 << 24, 1 << 24)])) {
            const resolved = shape();
            resolveStrand(strand, 0.7, 6, 0, 1, resolved);
            for (const time of [0, 1.7, 42]) {
                strandPoint(strand, resolved, path, normals, 0, time, out);
                expect(out[0]).toBeCloseTo(0, 4);
                expect(out[1]).toBeCloseTo(resolved.lane, 4);
                strandPoint(strand, resolved, path, normals, 20, time, out);
                expect(out[0]).toBeCloseTo(300, 4);
                expect(out[1]).toBeCloseTo(resolved.lane, 4);
            }
        }
    });

    it("runs straight outside the wave window (bundle trunks) and waves inside it", () => {
        const path = straight(300);
        const normals = normalsOf(path.points);
        const [strand] = buildStrands(["a"], [input(1 << 24, 0)]);
        const resolved = shape();
        resolveStrand(strand, 0.7, 6, 0.2, 0.8, resolved);
        const out = new Float32Array(2);
        for (const index of [0, 2, 4, 16, 18, 20]) {
            strandPoint(strand, resolved, path, normals, index, 3, out);
            expect(out[1]).toBeCloseTo(resolved.lane, 4);
        }
        const a = new Float32Array(2), b = new Float32Array(2);
        strandPoint(strand, resolved, path, normals, 10, 0, a);
        strandPoint(strand, resolved, path, normals, 10, 2.5, b);
        expect(a[1]).not.toBeCloseTo(b[1], 2);
    });

    it("keeps the strands of a bundle in order at every zoom and time: no crossings", () => {
        const path = straight(300);
        const normals = normalsOf(path.points);
        const strands = buildStrands(["a"], [input(1 << 26, 1 << 26)]);
        expect(strands.length).toBeGreaterThan(4);
        const out = new Float32Array(2);
        for (const k of [0.25, 0.66, 1.5]) {
            const shapes = strands.map(strand => { const resolved = shape(); resolveStrand(strand, k, 8, 0, 1, resolved); return resolved; });
            for (const time of [0, 3, 17.5]) {
                for (let index = 0; index <= 20; index++) {
                    const offsets = strands.map((strand, i) => { strandPoint(strand, shapes[i], path, normals, index, time, out); return out[1]; });
                    for (let next = 1; next < offsets.length; next++) expect(offsets[next]).toBeGreaterThan(offsets[next - 1]);
                }
            }
        }
    });

    it("keeps upload and download in their own halves of the slot", () => {
        const strands = buildStrands(["a"], [input(1 << 20, 1 << 20)]);
        const upload = strands.filter(strand => strand.tone === 0).map(strand => strand.laneFraction);
        const download = strands.filter(strand => strand.tone === 1).map(strand => strand.laneFraction);
        expect(Math.max(...upload)).toBeLessThan(Math.min(...download));
    });
});
