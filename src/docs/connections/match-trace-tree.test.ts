import { describe, expect, it } from "vitest";
import { decisiveChildren, decisiveTraceNodes, defaultTraceExpansion, traceState, type MatchTrace } from "./match-trace-tree";

const example: MatchTrace = {
    type: "and", state: "hit", children: [
        { type: "or", state: "hit", children: [
            { type: "condition", state: "miss", label: "first" },
            { type: "and", state: "hit", children: [
                { type: "condition", state: "hit", label: "second" },
                { type: "condition", state: "hit", label: "third" },
            ] },
            { type: "condition", state: "skipped", label: "short-circuited" },
        ] },
        { type: "not", state: "hit", children: [
            { type: "or", state: "miss", children: [
                { type: "condition", state: "miss" },
                { type: "condition", state: "miss" },
            ] },
        ] },
    ],
};

describe("policy trace explanation tree", () => {
    it("expands successful AND members and only the decisive OR branch", () => {
        expect([...defaultTraceExpansion(example)]).toEqual([
            "0", "0.0", "0.0.1", "0.1", "0.1.0",
        ]);
        const path = decisiveTraceNodes(example);
        expect(path.has("0.0.0")).toBe(false);
        expect(path.has("0.0.1.0")).toBe(true);
        expect(path.has("0.0.2")).toBe(false);
    });

    it("descends through NOT to false inputs, without labeling them as hits", () => {
        expect(decisiveChildren(example.children![1])).toEqual([0]);
        expect(decisiveChildren(example.children![1].children![0])).toEqual([0, 1]);
        expect(traceState("miss")).toBe("miss");
        expect(traceState("skipped")).toBe("skipped");
        expect(traceState("unknown")).toBe("unknown");
    });

    it("explains failing AND with its failing child", () => {
        const root: MatchTrace = { type: "and", state: "miss", children: [
            { type: "or", state: "hit", children: [{ type: "condition", state: "hit" }] },
            { type: "not", state: "miss", children: [{ type: "condition", state: "hit" }] },
            { type: "condition", state: "skipped" },
        ] };
        expect([...defaultTraceExpansion(root)]).toEqual(["0", "0.1"]);
        expect(decisiveTraceNodes(root).has("0.2")).toBe(false);
    });

    it("does not invent decisive matches for unknown or skipped groups", () => {
        for (const state of ["skipped", "unknown"]) {
            const node: MatchTrace = { type: "or", state, children: [{ type: "condition", state: "unknown" }] };
            expect(decisiveChildren(node)).toEqual([]);
        }
    });

    it("does not eagerly expand complex subtrees under a 1000-child failed OR", () => {
        const trace: MatchTrace = { type: "or", state: "miss", children:
            Array.from({ length: 1000 }, () => ({ type: "and", state: "miss", children: [
                { type: "condition", state: "miss" },
            ] })),
        };
        expect([...defaultTraceExpansion(trace)]).toEqual(["0"]);
    });
});
