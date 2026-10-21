import { describe, expect, it } from "vitest";
import { buildCircuitLayout, initialCollapsed, traceState, type MatchTrace } from "./match-circuit-layout";

const nested: MatchTrace = {
    type: "and", state: "hit", children: [
        { type: "or", state: "hit", children: [
            { type: "condition", label: "domain", state: "miss" },
            { type: "and", state: "hit", children: [
                { type: "condition", label: "process", state: "hit" },
                { type: "condition", label: "port", state: "hit" },
            ] },
        ] },
        { type: "not", state: "hit", children: [
            { type: "condition", label: "blocked", state: "miss" },
        ] },
        { type: "condition", label: "later", state: "skipped" },
    ],
};

describe("match circuit layout", () => {
    it("uses vertical series for AND and horizontal branches for OR", () => {
        const layout = buildCircuitLayout(nested, new Set());
        const get = (key: string) => layout.nodes.find(node => node.key === key)!;
        expect(get("0.0").y).toBeLessThan(get("0.1").y);
        expect(get("0.0.0").x).toBeLessThan(get("0.0.1").x);
        expect(get("0.0.1.0").y).toBeLessThan(get("0.0.1.1").y);
        expect(layout.wires.some(w => w.key === "0.1-inversion")).toBe(true);
        expect(layout.wires.some(w => w.state === "skipped")).toBe(true);
    });

    it("collapses complete subcircuits without rendering descendants", () => {
        const collapsed = initialCollapsed(nested);
        expect(collapsed).toEqual(new Set(["0.0", "0.1"]));
        const layout = buildCircuitLayout(nested, collapsed);
        expect(layout.nodes.map(n => n.key)).toEqual(["0", "0.0", "0.1", "0.2"]);
        expect(layout.nodes[1].collapsed).toBe(true);
        expect(layout.width).toBeGreaterThan(0);
        expect(layout.height).toBeGreaterThan(0);
    });

    it("preserves unknown and skipped separately from false", () => {
        expect(traceState("unknown")).toBe("unknown");
        expect(traceState("skipped")).toBe("skipped");
        expect(traceState("miss")).toBe("miss");
    });
});
