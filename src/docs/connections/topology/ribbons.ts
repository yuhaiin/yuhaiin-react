/**
 * Flowing ribbons: every edge with traffic is drawn as a bundle of thin,
 * evenly spaced strands that share one slow, gentle wave.
 *
 * Strands are not data points. A direction's measured byte rate decides how
 * many strands it gets, how bright they are and how fast a soft sheen drifts
 * along them, on a clamped log scale; a global budget bounds the total. Each
 * strand keeps its lane inside the edge's own port slot from end to end, so
 * strands of a bundle never cross and the bundle attaches exactly to the
 * real source and destination cards. An edge without traffic is one quiet
 * static line.
 */

export interface FlowMapping {
    /** Rates at or below this are drawn as the faintest flow. */
    floorRate: number;
    /** Rates at or above this get full brightness and speed. */
    ceilingRate: number;
    /** Strands per direction at most. */
    maxStrands: number;
    /** Strands in the whole scene at most. */
    budget: number;
}

export const defaultMapping: FlowMapping = { floorRate: 256, ceilingRate: 64 * 1024 * 1024, maxStrands: 5, budget: 260 };
/** Phones and coarse pointers: fewer strands. */
export const compactMapping: FlowMapping = { ...defaultMapping, maxStrands: 3, budget: 120 };

/** 0 for no traffic, then 0.02..1 on a log scale between floorRate and ceilingRate. */
export function intensityFor(rate: number, mapping: FlowMapping = defaultMapping): number {
    if (!(rate > 0)) return 0;
    if (rate <= mapping.floorRate) return 0.02;
    const value = Math.log(rate / mapping.floorRate) / Math.log(mapping.ceilingRate / mapping.floorRate);
    return Math.min(1, Math.max(0.02, value));
}

/** Strands for one direction: none without traffic, then 2..maxStrands (a bundle, never a lone line). */
export function strandsFor(rate: number, mapping: FlowMapping = defaultMapping): number {
    const intensity = intensityFor(rate, mapping);
    if (intensity === 0) return 0;
    const least = Math.min(2, mapping.maxStrands);
    return Math.min(mapping.maxStrands, least + Math.round(intensity * (mapping.maxStrands - least)));
}

export interface FlowPath {
    /** Polyline x,y pairs in world coordinates, from source to target. */
    points: Float32Array;
    /** Cumulative length at each point. */
    lengths: Float32Array;
    length: number;
}

/** Unit normals of a polyline (x,y pairs), one per point. */
export function normalsOf(points: Float32Array): Float32Array {
    const count = points.length / 2;
    const normals = new Float32Array(points.length);
    for (let index = 0; index < count; index++) {
        const a = Math.max(0, index - 1), b = Math.min(count - 1, index + 1);
        const dx = points[b * 2] - points[a * 2], dy = points[b * 2 + 1] - points[a * 2 + 1];
        const norm = Math.hypot(dx, dy) || 1;
        normals[index * 2] = -dy / norm;
        normals[index * 2 + 1] = dx / norm;
    }
    return normals;
}

export interface Strand {
    /** Index of the edge the strand belongs to. */
    edge: number;
    /** 0 = upload (source -> destination), 1 = download (back). */
    tone: 0 | 1;
    /** Which colour of the tone (neighbouring strands alternate). */
    hue: number;
    /** Fixed offset from the edge path, inside the edge's port slot, from end to end. */
    lane: number;
    /** The bundle's wave: amplitude (world units), waves along the path, phase, drift (rad/s). */
    amplitude: number;
    waves: number;
    phase: number;
    drift: number;
    /** Speed (path lengths/s, in the direction of flow) and start of the soft sheen. */
    sheen: number;
    sheenPhase: number;
    /** 0..1 opacity factor from the measured rate. */
    intensity: number;
}

export interface StrandInput {
    up: number;
    down: number;
    /** Half the width of the edge's port slot; strands stay inside it. */
    spread: number;
    length: number;
    animated: boolean;
}

/** Deterministic per-strand variation, so strands keep their look across scene updates. */
function hash(edge: string, index: number) {
    let value = 2166136261 ^ index;
    for (let i = 0; i < edge.length; i++) value = Math.imul(value ^ edge.charCodeAt(i), 16777619);
    return ((value >>> 0) % 10000) / 10000;
}

/**
 * Strands for a scene. Counts follow the rate per direction and are scaled
 * down together (keeping at least one per active direction) when the total
 * would exceed the budget, which is never exceeded.
 */
export function buildStrands(ids: string[], inputs: StrandInput[], mapping: FlowMapping = defaultMapping): Strand[] {
    const wanted = inputs.map(input => input.animated ? [strandsFor(input.up, mapping), strandsFor(input.down, mapping)] as const : [0, 0] as const);
    const total = wanted.reduce((sum, [up, down]) => sum + up + down, 0);
    const scale = total > mapping.budget ? mapping.budget / total : 1;
    const strands: Strand[] = [];
    inputs.forEach((input, edge) => {
        const counts = [0, 1].map(tone => wanted[edge][tone] ? Math.max(1, Math.floor(wanted[edge][tone] * scale)) : 0);
        const size = counts[0] + counts[1];
        if (!size) return;
        // One wave for the whole bundle: about half a wave over the edge, low and slow.
        const id = ids[edge];
        const strongest = Math.max(intensityFor(input.up, mapping), intensityFor(input.down, mapping));
        const waves = 0.45 + 0.25 * hash(id, 1);
        const phase = hash(id, 2) * Math.PI * 2;
        const amplitude = Math.min(10, input.length * 0.05) * (0.6 + 0.4 * hash(id, 3));
        const drift = 0.2 + 0.3 * strongest;
        let slot = 0;
        for (const tone of [0, 1] as const) {
            const intensity = intensityFor(tone === 0 ? input.up : input.down, mapping);
            for (let index = 0; index < counts[tone]; index++, slot++) {
                // Evenly spaced lanes across the slot: upload first, then download; strands never swap.
                const lane = size === 1 ? 0 : -input.spread + (2 * input.spread * slot) / (size - 1);
                strands.push({
                    edge, tone, hue: index % 2, lane,
                    // Barely different per strand: the bundle breathes instead of moving in lockstep.
                    amplitude: amplitude * (1 - 0.05 * slot),
                    waves,
                    phase: phase + 0.08 * slot,
                    drift,
                    sheen: 0.06 + 0.16 * intensity,
                    sheenPhase: hash(id, 100 + slot),
                    intensity,
                });
            }
        }
    });
    // Hard cap: if even one strand per direction is too many, the busiest
    // directions keep theirs; the others still show as their edge's line.
    if (strands.length > mapping.budget) {
        strands.sort((a, b) => b.intensity - a.intensity || a.edge - b.edge || a.tone - b.tone);
        strands.length = mapping.budget;
        strands.sort((a, b) => a.edge - b.edge || a.tone - b.tone);
    }
    return strands;
}

/**
 * Writes the strand's point at path index `index` at `time` seconds into
 * out[0], out[1]. The wave envelope is zero at both ends, so every strand
 * starts and ends on its lane offset at the real cards.
 */
export function strandPoint(strand: Strand, path: FlowPath, normals: Float32Array, index: number, time: number, out: Float32Array) {
    const u = path.length ? path.lengths[index] / path.length : 0;
    const offset = strand.lane + strand.amplitude * Math.sin(Math.PI * u) * Math.sin(Math.PI * 2 * strand.waves * u + strand.phase - strand.drift * time);
    out[0] = path.points[index * 2] + normals[index * 2] * offset;
    out[1] = path.points[index * 2 + 1] + normals[index * 2 + 1] * offset;
}
