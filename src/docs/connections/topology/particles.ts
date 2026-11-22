/**
 * Particles that visualize measured throughput along topology edges.
 *
 * Particles are not packets. Each edge has two lanes, upload (towards the
 * destination) and download (towards the source). A lane's byte rate, as
 * measured from the counters over the last sampling interval, sets how many
 * particles per second it emits and how fast they travel. The mapping is
 * logarithmic and clamped, so 1 KB/s and 1 GB/s are both readable and the
 * particle count stays bounded. A lane whose rate drops to zero stops
 * emitting at once and fades out the particles still on it.
 */

export interface FlowMapping {
    /** Rates at or below this are drawn as a trickle (minimum emission). */
    floorRate: number;
    /** Rates at or above this get the maximum emission and speed. */
    ceilingRate: number;
    minEmission: number;
    maxEmission: number;
    /** World units per second. */
    minSpeed: number;
    maxSpeed: number;
    /** A particle never lives longer than this, in seconds. */
    maxLifetime: number;
    /** Live particles at most per lane. */
    perLane: number;
    /** Live particles at most in total. */
    capacity: number;
}

export const defaultMapping: FlowMapping = {
    floorRate: 256,
    ceilingRate: 64 * 1024 * 1024,
    minEmission: 0.5,
    maxEmission: 16,
    minSpeed: 48,
    maxSpeed: 260,
    maxLifetime: 7,
    perLane: 36,
    capacity: 900,
};

/** Lower budget for phones and coarse pointers. */
export const compactMapping: FlowMapping = { ...defaultMapping, maxEmission: 9, perLane: 18, capacity: 320 };

/** 0 for no traffic, then 0..1 on a log scale between floorRate and ceilingRate. */
export function intensityFor(rate: number, mapping: FlowMapping = defaultMapping): number {
    if (!(rate > 0)) return 0;
    if (rate <= mapping.floorRate) return 0.02;
    const value = Math.log(rate / mapping.floorRate) / Math.log(mapping.ceilingRate / mapping.floorRate);
    return Math.min(1, Math.max(0.02, value));
}

export function emissionFor(rate: number, mapping: FlowMapping = defaultMapping): number {
    const intensity = intensityFor(rate, mapping);
    if (intensity === 0) return 0;
    return mapping.minEmission + (mapping.maxEmission - mapping.minEmission) * intensity;
}

export function speedFor(rate: number, mapping: FlowMapping = defaultMapping): number {
    return mapping.minSpeed + (mapping.maxSpeed - mapping.minSpeed) * intensityFor(rate, mapping);
}

export interface ParticlePath {
    /** Polyline x,y pairs in world coordinates, from source to target. */
    points: Float32Array;
    /** Cumulative length at each point. */
    lengths: Float32Array;
    length: number;
}

export interface LaneInput {
    /** Stable across updates, so particles stay on their lane when the scene changes. */
    key: string;
    path: ParticlePath;
    /** +1 moves from the path start to its end (upload), -1 the other way (download). */
    direction: 1 | -1;
    /** Perpendicular offset from the path, in world units. */
    offset: number;
    /** Measured bytes per second. */
    rate: number;
    /** 0 = upload palette, 1 = download palette. */
    tone: 0 | 1;
    /** Opacity multiplier for dimmed (filtered-out by search) lanes. */
    alpha: number;
}

interface Lane extends LaneInput {
    target: number;
    emission: number;
    speed: number;
    accumulator: number;
    count: number;
}

/** Exponential approach to the target emission, in 1/s. */
const EASE = 3;
/** Particles on a lane without traffic fade out over 1/FADE seconds. */
const FADE = 2.5;

export class ParticleSystem {
    readonly mapping: FlowMapping;
    lanes: Lane[] = [];
    /** Lane index of each live particle. */
    readonly lane: Int32Array;
    /** Distance travelled along the path. */
    readonly distance: Float32Array;
    readonly speed: Float32Array;
    readonly alpha: Float32Array;
    count = 0;
    /** Emission multiplier that keeps the expected total under the capacity. */
    scale = 1;

    constructor(mapping: FlowMapping = defaultMapping) {
        this.mapping = mapping;
        this.lane = new Int32Array(mapping.capacity);
        this.distance = new Float32Array(mapping.capacity);
        this.speed = new Float32Array(mapping.capacity);
        this.alpha = new Float32Array(mapping.capacity);
    }

    /**
     * Replaces the lanes. Particles on a lane whose key still exists stay where
     * they are (rescaled to the new path length); the others are dropped.
     */
    setLanes(inputs: LaneInput[]) {
        const previous = new Map(this.lanes.map((lane, index) => [lane.key, { lane, index }]));
        const remap = new Int32Array(this.lanes.length).fill(-1);
        const lanes: Lane[] = inputs.map((input, index) => {
            const old = previous.get(input.key);
            const target = emissionFor(input.rate, this.mapping);
            let speed = speedFor(input.rate, this.mapping);
            if (input.path.length / speed > this.mapping.maxLifetime) speed = input.path.length / this.mapping.maxLifetime;
            const lane: Lane = { ...input, target, speed, emission: old?.lane.emission ?? 0, accumulator: old?.lane.accumulator ?? 0, count: 0 };
            if (target === 0) lane.emission = 0;
            if (old) remap[old.index] = index;
            return lane;
        });
        let write = 0;
        for (let read = 0; read < this.count; read++) {
            const oldLane = this.lanes[this.lane[read]];
            const next = remap[this.lane[read]];
            if (next < 0) continue;
            const lane = lanes[next];
            const ratio = oldLane.path.length > 0 ? lane.path.length / oldLane.path.length : 1;
            this.lane[write] = next;
            this.distance[write] = Math.min(lane.path.length, this.distance[read] * ratio);
            this.speed[write] = this.speed[read];
            this.alpha[write] = this.alpha[read];
            lane.count++;
            write++;
        }
        this.count = write;
        this.lanes = lanes;
        this.rebalance();
    }

    /** Caps each lane at perLane live particles and the sum at ~85% of capacity. */
    private rebalance() {
        let expected = 0;
        for (const lane of this.lanes) {
            const lifetime = Math.min(this.mapping.maxLifetime, lane.path.length / lane.speed);
            if (lane.target * lifetime > this.mapping.perLane) lane.target = this.mapping.perLane / lifetime;
            expected += lane.target * lifetime;
        }
        const budget = this.mapping.capacity * 0.85;
        this.scale = expected > budget ? budget / expected : 1;
    }

    /** True while anything moves or is about to. */
    active() {
        return this.count > 0 || this.lanes.some(lane => lane.target > 0);
    }

    step(dt: number) {
        if (dt <= 0) return;
        const ease = 1 - Math.exp(-EASE * dt);
        for (let index = 0; index < this.lanes.length; index++) {
            const lane = this.lanes[index];
            const target = lane.target * this.scale;
            lane.emission = target === 0 ? 0 : lane.emission + (target - lane.emission) * ease;
            if (lane.emission <= 0) {
                lane.accumulator = 0;
                continue;
            }
            lane.accumulator = Math.min(2, lane.accumulator + lane.emission * dt);
            while (lane.accumulator >= 1 && lane.count < this.mapping.perLane && this.count < this.mapping.capacity) {
                lane.accumulator -= 1;
                const slot = this.count++;
                this.lane[slot] = index;
                // Spread the particles of one step over the distance they would have covered.
                this.distance[slot] = Math.min(lane.path.length, lane.accumulator / lane.emission * lane.speed);
                this.speed[slot] = lane.speed;
                this.alpha[slot] = 1;
                lane.count++;
            }
        }
        for (let index = 0; index < this.count;) {
            const lane = this.lanes[this.lane[index]];
            this.distance[index] += this.speed[index] * dt;
            if (lane.target === 0) this.alpha[index] -= FADE * dt;
            if (this.distance[index] >= lane.path.length || this.alpha[index] <= 0) {
                lane.count--;
                this.remove(index);
                continue;
            }
            index++;
        }
    }

    /** Swap-remove keeps the arrays dense without allocating. */
    private remove(index: number) {
        const last = --this.count;
        if (index === last) return;
        this.lane[index] = this.lane[last];
        this.distance[index] = this.distance[last];
        this.speed[index] = this.speed[last];
        this.alpha[index] = this.alpha[last];
    }

    clear() {
        this.count = 0;
        for (const lane of this.lanes) {
            lane.count = 0;
            lane.accumulator = 0;
            lane.emission = 0;
        }
    }
}

/**
 * Writes the position of `distance` along a lane into `out` (x, y), offset
 * perpendicular to the path. Distances count from the lane's own start, so
 * download lanes run from the path end back to its start.
 */
export function pointOnLane(lane: Pick<LaneInput, "path" | "direction" | "offset">, distance: number, out: Float32Array) {
    const { points, lengths, length } = lane.path;
    const along = lane.direction === 1 ? distance : length - distance;
    let low = 0;
    let high = lengths.length - 1;
    while (high - low > 1) {
        const mid = (low + high) >> 1;
        if (lengths[mid] < along) low = mid;
        else high = mid;
    }
    const span = lengths[high] - lengths[low] || 1;
    const t = Math.min(1, Math.max(0, (along - lengths[low]) / span));
    const x0 = points[low * 2], y0 = points[low * 2 + 1];
    const x1 = points[high * 2], y1 = points[high * 2 + 1];
    const dx = x1 - x0, dy = y1 - y0;
    const norm = Math.hypot(dx, dy) || 1;
    out[0] = x0 + dx * t - (dy / norm) * lane.offset;
    out[1] = y0 + dy * t + (dx / norm) * lane.offset;
}
