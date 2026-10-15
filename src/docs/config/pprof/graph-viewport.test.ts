import { describe, expect, it } from "vitest";
import {
    INITIAL_GRAPH_VIEW,
    graphPointDistance,
    graphPointMiddle,
    panGraph,
    prepareProfilerDOT,
    zoomGraph,
} from "./graph-viewport";

describe("pprof graph viewport", () => {
    it("keeps the point under the cursor stationary when zooming", () => {
        const view = { x: 20, y: 40, scale: 1 };
        const next = zoomGraph(view, 2, { x: 100, y: 200 });
        expect(next).toEqual({ x: -60, y: -120, scale: 2 });
    });

    it("supports two-finger midpoint translation and pinch scaling", () => {
        const fromA = { x: 10, y: 10 };
        const fromB = { x: 90, y: 10 };
        const toA = { x: 20, y: 20 };
        const toB = { x: 180, y: 20 };
        const next = zoomGraph(
            INITIAL_GRAPH_VIEW,
            graphPointDistance(toA, toB) / graphPointDistance(fromA, fromB),
            graphPointMiddle(fromA, fromB),
            graphPointMiddle(toA, toB),
        );
        expect(next).toEqual({ scale: 2, x: 32, y: 42 });
    });

    it("caps zoom levels and pans without changing scale", () => {
        expect(zoomGraph(INITIAL_GRAPH_VIEW, 100, { x: 0, y: 0 }).scale).toBe(8);
        expect(zoomGraph(INITIAL_GRAPH_VIEW, 0.001, { x: 0, y: 0 }).scale).toBe(0.15);
        expect(panGraph(INITIAL_GRAPH_VIEW, 30, -40)).toEqual({ x: 46, y: -24, scale: 1 });
    });
});

it("sets a readable sans-serif font before DOT layout", () => {
    const dot = 'digraph "pprof" {\nnode [style=filled];\nN1 [fontsize=8 label="func"];\n}';
    const result = prepareProfilerDOT(dot);
    expect(result).toContain('node [fontname="Arial"]');
    expect(result).toContain('edge [fontname="Arial"]');
    expect(result).toContain("N1 [fontsize=12");
    expect(result).toContain("digraph \"pprof\" {");
});
