import { describe, expect, it } from "vitest";
import { animatedWithinBudget, compactMapping, defaultMapping, intensityFor, phaseOf, RIBBON_PX, ribbonStyle } from "./ribbons";

describe("ribbonStyle", () => {
    it("is a quiet line without traffic", () => {
        const style = ribbonStyle(0, 0);
        expect(style).toMatchObject({ intensity: 0, width: RIBBON_PX.idle, alpha: 0, upSpeed: 0, downSpeed: 0 });
        expect(intensityFor(-1)).toBe(0);
    });

    it("keeps the width within 2.4-4 CSS px and grows brightness and speed with traffic", () => {
        const rates = [1, 2048, 1 << 20, 50 * 2 ** 20, 10 * 2 ** 30];
        const styles = rates.map(rate => ribbonStyle(rate, 0));
        for (let index = 1; index < styles.length; index++) {
            expect(styles[index].width).toBeGreaterThanOrEqual(styles[index - 1].width);
            expect(styles[index].alpha).toBeGreaterThanOrEqual(styles[index - 1].alpha);
            expect(styles[index].upSpeed).toBeGreaterThanOrEqual(styles[index - 1].upSpeed);
        }
        expect(Math.min(...styles.map(style => style.width))).toBeGreaterThanOrEqual(RIBBON_PX.min);
        expect(Math.max(...styles.map(style => style.width))).toBeLessThanOrEqual(RIBBON_PX.max);
        expect(Math.max(...styles.map(style => style.alpha))).toBeLessThanOrEqual(1);
    });

    it("animates each direction only when it carries traffic", () => {
        expect(ribbonStyle(1 << 20, 0)).toMatchObject({ downSpeed: 0, downGlow: 0 });
        expect(ribbonStyle(0, 1 << 20)).toMatchObject({ upSpeed: 0, upGlow: 0 });
        const both = ribbonStyle(1 << 20, 1 << 10);
        expect(both.upSpeed).toBeGreaterThan(both.downSpeed);
        expect(both.downSpeed).toBeGreaterThan(0);
    });
});

describe("animatedWithinBudget", () => {
    it("animates the busiest ribbons within the budget and never idle ones", () => {
        const styles = [ribbonStyle(0, 0), ribbonStyle(1024, 0), ribbonStyle(1 << 26, 0), ribbonStyle(1 << 20, 0)];
        expect(animatedWithinBudget(styles, { ...defaultMapping, budget: 2 })).toEqual(new Set([2, 3]));
        expect(animatedWithinBudget(styles).has(0)).toBe(false);
        const many = Array.from({ length: 500 }, () => ribbonStyle(1 << 20, 1 << 20));
        expect(animatedWithinBudget(many, compactMapping).size).toBe(compactMapping.budget);
    });

    it("gives every ribbon a stable highlight phase", () => {
        expect(phaseOf("a>b#tcp")).toBe(phaseOf("a>b#tcp"));
        expect(phaseOf("a>b#tcp")).not.toBe(phaseOf("a>b#udp"));
        expect(phaseOf("x")).toBeGreaterThanOrEqual(0);
        expect(phaseOf("x")).toBeLessThan(1);
    });
});
