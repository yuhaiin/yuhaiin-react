import { describe, expect, it } from "vitest";
import { desktopLayout, edgeCurve, GHOST_MS, LayoutMemory, mobileLayout, samplePath, SHRINK_MS } from "./layout";
import type { Column, TopologyNode } from "./model";

function node(id: string, column: Column, kind: TopologyNode["kind"] = "domain"): TopologyNode {
    return { id, column, kind, name: id, type: "", status: "open", connections: 1, tcp: 1, udp: 0, up: 0, down: 0, connectionIds: [] };
}

const position = (layout: ReturnType<LayoutMemory["layout"]>, id: string) => {
    const placed = layout.byId.get(id)!;
    return { x: placed.x, y: placed.y, ghost: placed.ghost };
};

describe("LayoutMemory", () => {
    it("keeps existing nodes in place when others appear", () => {
        const memory = new LayoutMemory();
        const first = memory.layout([node("a", "destination"), node("b", "destination")], 0, desktopLayout);
        const second = memory.layout([node("new", "destination"), node("a", "destination"), node("b", "destination")], 100, desktopLayout);
        expect(position(second, "a")).toEqual(position(first, "a"));
        expect(position(second, "b")).toEqual(position(first, "b"));
        expect(position(second, "new").y).toBeGreaterThan(position(second, "b").y);
    });

    it("never reorders by traffic", () => {
        const memory = new LayoutMemory();
        const quiet = node("a", "destination");
        const busy = { ...node("b", "destination"), up: 10 ** 9 };
        memory.layout([quiet, node("b", "destination")], 0, desktopLayout);
        const next = memory.layout([busy, quiet], 10, desktopLayout);
        expect(position(next, "a").y).toBeLessThan(position(next, "b").y);
    });

    it("keeps a removed node as a ghost, then closes the gap", () => {
        const memory = new LayoutMemory();
        const start = memory.layout([node("a", "destination"), node("b", "destination"), node("c", "destination")], 0, desktopLayout);
        const removed = memory.layout([node("a", "destination"), node("c", "destination")], 1000, desktopLayout);
        expect(position(removed, "b")).toEqual({ ...position(start, "b"), ghost: true });
        expect(removed.byId.get("b")!.node).toMatchObject({ status: "closed", connections: 0, up: 0, down: 0 });
        expect(position(removed, "c")).toEqual(position(start, "c"));
        const later = memory.layout([node("a", "destination"), node("c", "destination")], 1000 + GHOST_MS, desktopLayout);
        expect(later.byId.has("b")).toBe(false);
        expect(position(later, "c")).toEqual(position(start, "b"));
    });

    it("revives a ghost that comes back in its old slot", () => {
        const memory = new LayoutMemory();
        const start = memory.layout([node("a", "inbound"), node("b", "inbound")], 0, desktopLayout);
        memory.layout([node("b", "inbound")], 10, desktopLayout);
        const back = memory.layout([node("a", "inbound"), node("b", "inbound")], 20, desktopLayout);
        expect(position(back, "a")).toEqual(position(start, "a"));
        expect(back.byId.get("a")!.ghost).toBe(false);
    });

    it("places a new node next to the nodes that feed it, without moving the order of others", () => {
        const memory = new LayoutMemory();
        const sources = [node("s1", "source"), node("s2", "source"), node("s3", "source")];
        const first = memory.layout([...sources, node("i1", "inbound"), node("i3", "inbound")], 0, desktopLayout,
            [{ from: "s1", to: "i1" }, { from: "s3", to: "i3" }]);
        expect(position(first, "i1").y).toBeLessThan(position(first, "i3").y);
        // i2 is fed by s2: it belongs between i1 and i3, not after them.
        const next = memory.layout([...sources, node("i1", "inbound"), node("i3", "inbound"), node("i2", "inbound")], 10, desktopLayout,
            [{ from: "s1", to: "i1" }, { from: "s3", to: "i3" }, { from: "s2", to: "i2" }]);
        const order = ["i1", "i2", "i3"].map(id => position(next, id).y);
        expect([...order].sort((a, b) => a - b)).toEqual(order);
        // Ranks are fixed once given: new feeds do not reorder existing nodes.
        const later = memory.layout([...sources, node("i1", "inbound"), node("i3", "inbound"), node("i2", "inbound")], 20, desktopLayout,
            [{ from: "s3", to: "i1" }, { from: "s1", to: "i3" }]);
        expect(["i1", "i2", "i3"].map(id => position(later, id).y)).toEqual(order);
    });

    it("puts Others last", () => {
        const memory = new LayoutMemory();
        const layout = memory.layout([node("destination:others", "destination", "others"), node("x", "destination")], 0, desktopLayout);
        expect(position(layout, "destination:others").y).toBeGreaterThan(position(layout, "x").y);
    });

    it("places columns left to right and is idempotent for the same input", () => {
        const memory = new LayoutMemory();
        const nodes = [node("s", "source"), node("i", "inbound"), node("p", "policy"), node("o", "outbound"), node("d", "destination")];
        const layout = memory.layout(nodes, 0, desktopLayout);
        const xs = nodes.map(item => position(layout, item.id).x);
        expect([...xs].sort((a, b) => a - b)).toEqual(xs);
        expect(memory.layout(nodes, 0, desktopLayout).nodes.map(item => [item.x, item.y])).toEqual(layout.nodes.map(item => [item.x, item.y]));
    });

    it("reserves vertical rows so lower layers do not jump", () => {
        const memory = new LayoutMemory();
        const three = [node("a", "source"), node("b", "source"), node("c", "source"), node("d", "destination")];
        const before = memory.layout(three, 0, mobileLayout);
        const one = [node("a", "source"), node("d", "destination")];
        memory.layout(one, 1, mobileLayout);
        // The removed nodes are ghosts until 1 + GHOST_MS; then the layer is smaller,
        // but keeps its height for SHRINK_MS more.
        const expired = memory.layout(one, 1 + GHOST_MS, mobileLayout);
        expect(expired.byId.has("b")).toBe(false);
        expect(position(expired, "d").y).toBe(position(before, "d").y);
        const shrunk = memory.layout(one, 1 + GHOST_MS + SHRINK_MS, mobileLayout);
        expect(position(shrunk, "d").y).toBeLessThan(position(before, "d").y);
    });
});

describe("edge geometry", () => {
    it("connects the right edge of one card to the left edge of the next", () => {
        const memory = new LayoutMemory();
        const layout = memory.layout([node("s", "source"), node("i", "inbound")], 0, desktopLayout);
        const [start, , , end] = edgeCurve(layout, layout.byId.get("s")!, layout.byId.get("i")!);
        expect(start).toEqual({ x: desktopLayout.nodeWidth, y: desktopLayout.headerHeight + desktopLayout.nodeHeight / 2 });
        expect(end.x).toBeCloseTo(desktopLayout.nodeWidth + desktopLayout.columnGap);
        const path = samplePath(edgeCurve(layout, layout.byId.get("s")!, layout.byId.get("i")!));
        expect(path.length).toBeCloseTo(desktopLayout.columnGap, 0);
        expect(path.lengths[path.lengths.length - 1]).toBeCloseTo(path.length);
    });
});
