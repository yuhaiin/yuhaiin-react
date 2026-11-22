import { describe, expect, it } from "vitest";
import { compactMapping, defaultMapping, emissionFor, intensityFor, ParticleSystem, pointOnLane, speedFor, type LaneInput, type ParticlePath } from "./particles";

function straight(length: number): ParticlePath {
    return { points: new Float32Array([0, 0, length, 0]), lengths: new Float32Array([0, length]), length };
}

function lane(key: string, rate: number, length = 400, direction: 1 | -1 = 1): LaneInput {
    return { key, path: straight(length), direction, offset: 0, rate, tone: direction === 1 ? 0 : 1, alpha: 1 };
}

function run(system: ParticleSystem, seconds: number, step = 1 / 30) {
    for (let elapsed = 0; elapsed < seconds; elapsed += step) system.step(step);
}

describe("rate mapping", () => {
    it("is zero without traffic and grows monotonically, within bounds", () => {
        expect(emissionFor(0)).toBe(0);
        expect(intensityFor(0)).toBe(0);
        expect(intensityFor(-5)).toBe(0);
        const rates = [1, 300, 4096, 2 ** 20, 50 * 2 ** 20, 10 * 2 ** 30];
        const emissions = rates.map(rate => emissionFor(rate));
        const speeds = rates.map(rate => speedFor(rate));
        for (let index = 1; index < rates.length; index++) {
            expect(emissions[index]).toBeGreaterThanOrEqual(emissions[index - 1]);
            expect(speeds[index]).toBeGreaterThanOrEqual(speeds[index - 1]);
        }
        expect(Math.min(...emissions)).toBeGreaterThanOrEqual(defaultMapping.minEmission);
        expect(Math.max(...emissions)).toBeLessThanOrEqual(defaultMapping.maxEmission);
        expect(Math.max(...speeds)).toBeLessThanOrEqual(defaultMapping.maxSpeed);
        expect(Math.min(...speeds)).toBeGreaterThanOrEqual(defaultMapping.minSpeed);
    });
});

describe("ParticleSystem", () => {
    it("emits nothing for idle lanes", () => {
        const system = new ParticleSystem();
        system.setLanes([lane("a", 0), lane("b", 0, 400, -1)]);
        run(system, 3);
        expect(system.count).toBe(0);
        expect(system.active()).toBe(false);
    });

    it("emits more particles for more traffic", () => {
        const slow = new ParticleSystem();
        slow.setLanes([lane("a", 2048)]);
        run(slow, 2);
        const fast = new ParticleSystem();
        fast.setLanes([lane("a", 20 << 20)]);
        run(fast, 2);
        expect(slow.count).toBeGreaterThan(0);
        expect(fast.count).toBeGreaterThan(slow.count);
    });

    it("stops emitting at once and fades the rest out when traffic stops", () => {
        const system = new ParticleSystem();
        system.setLanes([lane("a", 10 << 20, 4000)]);
        run(system, 2);
        const before = system.count;
        expect(before).toBeGreaterThan(0);
        system.setLanes([lane("a", 0, 4000)]);
        run(system, 0.5);
        expect(system.count).toBe(0);
        expect(system.active()).toBe(false);
    });

    it("caps particles per lane and in total", () => {
        const one = new ParticleSystem();
        one.setLanes([lane("a", 10 * 2 ** 30, 100_000)]);
        run(one, 10);
        expect(one.count).toBeLessThanOrEqual(defaultMapping.perLane);

        const many = new ParticleSystem(compactMapping);
        many.setLanes(Array.from({ length: 400 }, (_, index) => lane(`l${index}`, 1 << 30, 2000)));
        run(many, 8);
        expect(many.count).toBeLessThanOrEqual(compactMapping.capacity);
        expect(many.scale).toBeLessThan(1);
    });

    it("never lets a particle outlive maxLifetime", () => {
        const system = new ParticleSystem();
        system.setLanes([lane("a", 300, 100_000)]);
        run(system, 2);
        expect(system.count).toBeGreaterThan(0);
        const speed = system.speed[0];
        expect(100_000 / speed).toBeLessThanOrEqual(defaultMapping.maxLifetime + 1e-6);
    });

    it("keeps particles of surviving lanes across scene updates", () => {
        const system = new ParticleSystem();
        system.setLanes([lane("a", 1 << 20), lane("b", 1 << 20)]);
        run(system, 1);
        const onA = Array.from({ length: system.count }, (_, index) => system.lane[index]).filter(index => system.lanes[index].key === "a").length;
        system.setLanes([lane("a", 1 << 20, 800)]);
        expect(system.count).toBe(onA);
        expect(system.lanes[0].count).toBe(onA);
    });

    it("ignores a zero time step", () => {
        const system = new ParticleSystem();
        system.setLanes([lane("a", 1 << 20)]);
        system.step(0);
        expect(system.count).toBe(0);
    });
});

describe("pointOnLane", () => {
    it("walks forward for upload and backward for download, with a perpendicular offset", () => {
        const out = new Float32Array(2);
        pointOnLane({ path: straight(100), direction: 1, offset: 2 }, 25, out);
        expect([out[0], out[1]]).toEqual([25, 2]);
        pointOnLane({ path: straight(100), direction: -1, offset: 0 }, 25, out);
        expect([out[0], out[1]]).toEqual([75, 0]);
    });
});
