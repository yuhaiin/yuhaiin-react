/**
 * Single ribbons: every edge with traffic is one continuous band of light
 * along a stable curve.
 *
 * The ribbon's shape never animates. A direction's measured byte rate sets,
 * on a clamped log scale, how wide (within a narrow range) and how bright the
 * ribbon is and how fast a soft band of brightness travels along it in the
 * direction of flow. An edge without traffic is a quiet static line.
 */

export interface FlowMapping {
    /** Rates at or below this are drawn as the faintest flow. */
    floorRate: number;
    /** Rates at or above this get full width, brightness and speed. */
    ceilingRate: number;
    /** Ribbons animated at most (the busiest are kept); the rest are drawn still. */
    budget: number;
}

export const defaultMapping: FlowMapping = { floorRate: 256, ceilingRate: 64 * 1024 * 1024, budget: 200 };
/** Phones and coarse pointers: fewer animated ribbons. */
export const compactMapping: FlowMapping = { ...defaultMapping, budget: 90 };

/** 0 for no traffic, then 0.02..1 on a log scale between floorRate and ceilingRate. */
export function intensityFor(rate: number, mapping: FlowMapping = defaultMapping): number {
    if (!(rate > 0)) return 0;
    if (rate <= mapping.floorRate) return 0.02;
    const value = Math.log(rate / mapping.floorRate) / Math.log(mapping.ceilingRate / mapping.floorRate);
    return Math.min(1, Math.max(0.02, value));
}

/** Ribbon width on screen (CSS px): within a narrow range, so busy paths never turn into slabs. */
export const RIBBON_PX = { min: 2.4, max: 4, idle: 1, selectedExtra: 1 };

/** Length on screen (CSS px) after which the travelling highlight repeats. */
export const HIGHLIGHT_PERIOD_PX = 260;

export interface RibbonStyle {
    /** 0..1 from the busier direction. */
    intensity: number;
    /** CSS px. */
    width: number;
    /** 0..1 base opacity. */
    alpha: number;
    /** Highlight speed (CSS px/s) per direction; 0 when the direction is idle. */
    upSpeed: number;
    downSpeed: number;
    /** Highlight opacity per direction. */
    upGlow: number;
    downGlow: number;
}

function directionSpeed(rate: number, mapping: FlowMapping) {
    const intensity = intensityFor(rate, mapping);
    return intensity === 0 ? 0 : 72 + 228 * intensity;
}

function directionGlow(rate: number, mapping: FlowMapping) {
    const intensity = intensityFor(rate, mapping);
    return intensity === 0 ? 0 : 0.26 + 0.32 * intensity;
}

export function ribbonStyle(up: number, down: number, mapping: FlowMapping = defaultMapping): RibbonStyle {
    const intensity = Math.max(intensityFor(up, mapping), intensityFor(down, mapping));
    return {
        intensity,
        width: intensity === 0 ? RIBBON_PX.idle : RIBBON_PX.min + (RIBBON_PX.max - RIBBON_PX.min) * intensity,
        alpha: intensity === 0 ? 0 : 0.5 + 0.35 * intensity,
        upSpeed: directionSpeed(up, mapping),
        downSpeed: directionSpeed(down, mapping),
        upGlow: directionGlow(up, mapping),
        downGlow: directionGlow(down, mapping),
    };
}

/** Deterministic per-ribbon phase, so a ribbon keeps its highlight position across scene updates. */
export function phaseOf(id: string) {
    let value = 2166136261;
    for (let index = 0; index < id.length; index++) value = Math.imul(value ^ id.charCodeAt(index), 16777619);
    return ((value >>> 0) % 10000) / 10000;
}

/**
 * Indices of the ribbons that animate within the budget: the busiest first.
 * The others are still drawn, as their ribbon without a moving highlight.
 */
export function animatedWithinBudget(styles: RibbonStyle[], mapping: FlowMapping = defaultMapping): Set<number> {
    const active = styles.map((style, index) => ({ index, intensity: style.intensity })).filter(item => item.intensity > 0);
    active.sort((a, b) => b.intensity - a.intensity || a.index - b.index);
    return new Set(active.slice(0, mapping.budget).map(item => item.index));
}
