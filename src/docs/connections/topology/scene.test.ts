import { describe, expect, it } from "vitest";
import { desktopLayout, LayoutMemory, mobileLayout, type LayoutOptions } from "./layout";
import type { Column, NetworkKind, TopologyEdge, TopologyNode } from "./model";
import { RIBBON_PX } from "./ribbons";
import { bendOf, BUNDLE_FROM, buildScene, type SceneEdge } from "./scene";
import { detailFor } from "./stage";

function node(id: string, column: Column): TopologyNode {
    return { id, column, kind: "domain", name: id, type: "", status: "open", connections: 1, tcp: 1, udp: 0, up: 0, down: 0, connectionIds: [] };
}

function edge(from: string, to: string, network: NetworkKind = "tcp", extra: Partial<TopologyEdge> = {}): TopologyEdge {
    return { id: `${from}>${to}#${network}`, from, to, network, connections: 1, up: 100, down: 200, connectionIds: [`${from}-${to}-${network}`], ...extra };
}

function place(nodes: TopologyNode[], options: LayoutOptions = desktopLayout) {
    return new LayoutMemory().layout(nodes, 0, options);
}

const numbers = (d: string) => (d.match(/-?\d+(\.\d+)?(e-?\d+)?/g) ?? []).map(Number);

/** The drawn ribbon's cubic: p0, p1, p2, p3. */
function cubic(item: SceneEdge) {
    const n = numbers(item.render.d);
    expect(item.render.d).toMatch(/^M[^C]+C/);
    return [0, 2, 4, 6].map(i => ({ x: n[i], y: n[i + 1] }));
}

/** Smallest radius of curvature along a cubic. */
function minRadius(p: { x: number; y: number }[]) {
    let min = Infinity;
    for (let step = 0; step <= 200; step++) {
        const t = step / 200, u = 1 - t;
        const dx = 3 * u * u * (p[1].x - p[0].x) + 6 * u * t * (p[2].x - p[1].x) + 3 * t * t * (p[3].x - p[2].x);
        const dy = 3 * u * u * (p[1].y - p[0].y) + 6 * u * t * (p[2].y - p[1].y) + 3 * t * t * (p[3].y - p[2].y);
        const ddx = 6 * u * (p[2].x - 2 * p[1].x + p[0].x) + 6 * t * (p[3].x - 2 * p[2].x + p[1].x);
        const ddy = 6 * u * (p[2].y - 2 * p[1].y + p[0].y) + 6 * t * (p[3].y - 2 * p[2].y + p[1].y);
        const cross = Math.abs(dx * ddy - dy * ddx);
        if (cross > 1e-9) min = Math.min(min, Math.hypot(dx, dy) ** 3 / cross);
    }
    return min;
}

const members = (scene: ReturnType<typeof buildScene>) => scene.edges.filter(item => item.interactive !== false);
const trunks = (scene: ReturnType<typeof buildScene>) => scene.edges.filter(item => item.render.id.startsWith("trunk:"));

describe("buildScene geometry", () => {
    it("draws each edge of a sparse graph as one cubic ribbon from card edge to card edge", () => {
        const layout = place([node("s", "source"), node("a", "inbound"), node("b", "inbound")]);
        const scene = buildScene(layout, [edge("s", "a"), edge("s", "b")], null);
        expect(scene.bundles).toEqual([]);
        expect(trunks(scene)).toEqual([]);
        const { nodeWidth: w, nodeHeight: h } = desktopLayout;
        for (const item of scene.edges) {
            const [p0, p1, p2, p3] = cubic(item);
            const from = layout.byId.get(item.edge.from)!, to = layout.byId.get(item.edge.to)!;
            expect(p0.x).toBeCloseTo(from.x + w);
            expect(p3.x).toBeCloseTo(to.x);
            expect(Math.abs(p0.y - (from.y + h / 2))).toBeLessThan(h / 2);
            expect(Math.abs(p3.y - (to.y + h / 2))).toBeLessThan(h / 2);
            // Leaves and arrives along the flow: perpendicular to both cards.
            expect(p1.y).toBeCloseTo(p0.y);
            expect(p2.y).toBeCloseTo(p3.y);
            expect(item.render.ends).toEqual([p0.x, p0.y, p3.x, p3.y]);
        }
    });

    it("never bends tighter than the widest ribbon's half-width at the zoomed-out level", () => {
        // A wide fan with large vertical offsets is the hardest case for a cubic.
        const targets = Array.from({ length: 10 }, (_, index) => `d${index}`);
        const layout = place([node("s", "outbound"), ...targets.map(id => node(id, "destination"))]);
        for (const detail of ["detail", "normal", "far"] as const) {
            const scene = buildScene(layout, targets.map(id => edge("s", id)), null, false, 0, detail);
            // Ribbons are stroked, so the rasterizer never shows folded boundaries; this keeps
            // the inner edge of every bend open down to where the zoomed-out level begins.
            const halfWidthAtFar = (RIBBON_PX.max + RIBBON_PX.selectedExtra) / 2 / 0.45;
            for (const item of members(scene)) expect(minRadius(cubic(item))).toBeGreaterThan(halfWidthAtFar);
        }
    });
});

describe("bendOf", () => {
    it("keeps branch cubics monotonic along the flow", () => {
        for (const span of [5, 12, 20, 60, 300]) {
            const bend = bendOf(span);
            expect(bend).toBeGreaterThan(0);
            // a(t) of a cubic with controls at bend and span - bend advances while bend <= span.
            expect(bend).toBeLessThanOrEqual(span);
        }
    });
});

describe("buildScene bundling", () => {
    it("draws a crowded fan-out as one trunk ribbon, then one branch per real target, in order", () => {
        const targets = ["i1", "i2", "i3", "i4", "i5"];
        const layout = place([node("s", "source"), ...targets.map(id => node(id, "inbound"))]);
        const edges = targets.map(id => edge("s", id));
        const scene = buildScene(layout, edges, null);
        expect(scene.bundles).toHaveLength(1);
        const [bundle] = scene.bundles;
        expect(bundle).toMatchObject({ node: "s", side: "out", network: "tcp", edgeIds: edges.map(item => item.id), peers: targets, connections: 5, up: 500, down: 1000 });
        expect(bundle.connectionIds).toHaveLength(5);

        // The trunk is drawn once, carrying the members' combined rates.
        const [trunk] = trunks(scene);
        expect(trunks(scene)).toHaveLength(1);
        expect(trunk.render).toMatchObject({ up: 500, down: 1000, dashed: false });
        const [tx0, ty0, tx1, ty1] = trunk.render.ends;
        const source = layout.byId.get("s")!;
        expect(tx0).toBeCloseTo(source.x + desktopLayout.nodeWidth);
        expect(ty1).toBeCloseTo(ty0);

        const ends: number[] = [];
        for (const item of members(scene)) {
            const [p0, p1, , p3] = cubic(item);
            // Each branch starts on the trunk's centre line, inside its length, along the flow.
            expect(p0.y).toBeCloseTo(ty0);
            expect(p0.x).toBeGreaterThan(tx0);
            expect(p0.x).toBeLessThanOrEqual(tx1 + 1e-6);
            expect(p1.y).toBeCloseTo(p0.y);
            // ...and ends on its own target card.
            expect(p3.x).toBeCloseTo(layout.byId.get(item.edge.to)!.x);
            // The hit path still covers the whole route, trunk included.
            expect(numbers(item.d)[0]).toBeCloseTo(tx0);
            expect(item.bundles).toEqual([bundle.id]);
            ends.push(p3.y);
        }
        expect([...ends].sort((a, b) => a - b)).toEqual(ends);
    });

    it("draws a crowded fan-in as branches joining one trunk at the shared target", () => {
        const sources = ["s1", "s2", "s3", "s4"];
        const layout = place([...sources.map(id => node(id, "source")), node("in", "inbound")]);
        const scene = buildScene(layout, sources.map(id => edge(id, "in")), null);
        expect(scene.bundles).toEqual([expect.objectContaining({ node: "in", side: "in", peers: sources })]);
        const [trunk] = trunks(scene);
        const [tx0, ty0, tx1] = trunk.render.ends;
        expect(tx0).toBeCloseTo(layout.byId.get("in")!.x);
        for (const item of members(scene)) {
            const [, , p2, p3] = cubic(item);
            expect(p3.y).toBeCloseTo(ty0);
            expect(p3.x).toBeLessThan(tx0);
            expect(p3.x).toBeGreaterThanOrEqual(tx1 - 1e-6);
            expect(p2.y).toBeCloseTo(p3.y);
        }
    });

    it("never puts TCP and UDP in the same trunk, and keeps UDP dashed", () => {
        const targets = ["i1", "i2", "i3", "i4"];
        const layout = place([node("s", "source"), ...targets.map(id => node(id, "inbound"))]);
        const scene = buildScene(layout, [...targets.map(id => edge("s", id, "tcp")), ...targets.map(id => edge("s", id, "udp"))], null);
        expect(scene.bundles.map(bundle => bundle.network).sort()).toEqual(["tcp", "udp"]);
        for (const bundle of scene.bundles) expect(bundle.edgeIds.every(id => id.endsWith(`#${bundle.network}`))).toBe(true);
        expect(trunks(scene).map(item => item.render.dashed).sort()).toEqual([false, true]);
        expect(members(scene).filter(item => item.edge.network === "udp").every(item => item.render.dashed)).toBe(true);
    });

    it("bundles more eagerly when zoomed out and less when zoomed in", () => {
        const targets = Array.from({ length: BUNDLE_FROM.normal }, (_, index) => `i${index}`);
        const layout = place([node("s", "source"), ...targets.map(id => node(id, "inbound"))]);
        const edges = targets.map(id => edge("s", id));
        expect(buildScene(layout, edges, null, false, 0, "normal").bundles).toHaveLength(1);
        expect(buildScene(layout, edges, null, false, 0, "detail").bundles).toHaveLength(0);
        expect(buildScene(layout, edges.slice(0, BUNDLE_FROM.far), null, false, 0, "far").bundles).toHaveLength(1);
        expect(buildScene(layout, edges.slice(0, BUNDLE_FROM.far), null, false, 0, "normal").bundles).toHaveLength(0);
    });

    it("expands groups that contain a searched or selected edge, and keeps a selected trunk", () => {
        const targets = ["i1", "i2", "i3", "i4", "i5"];
        const layout = place([node("s", "source"), ...targets.map(id => node(id, "inbound"))]);
        const edges = targets.map(id => edge("s", id));
        const emphasis = { nodes: new Set(["s", "i3"]), edges: new Set([edges[2].id]) };
        const expanded = buildScene(layout, edges, emphasis);
        expect(expanded.bundles).toHaveLength(0);
        expect(trunks(expanded)).toHaveLength(0);
        expect(expanded.edges.find(item => item.edge.id === edges[2].id)!.render.highlighted).toBe(true);
        expect(expanded.edges.find(item => item.edge.id === edges[0].id)!.render.alpha).toBeLessThan(1);
        const kept = buildScene(layout, edges, { nodes: new Set(["s"]), edges: new Set(edges.map(item => item.id)) }, false, 0, "normal", null);
        expect(kept.bundles).toHaveLength(1);
        expect(trunks(kept)[0].render.highlighted).toBe(true);
    });

    it("bundles along the vertical phone layout too", () => {
        const targets = ["i1", "i2", "i3", "i4"];
        const layout = place([node("s", "source"), ...targets.map(id => node(id, "inbound"))], mobileLayout);
        const scene = buildScene(layout, targets.map(id => edge("s", id)), null, false, 0, "normal");
        expect(scene.bundles).toHaveLength(1);
        const source = layout.byId.get("s")!;
        const [trunk] = trunks(scene);
        expect(trunk.render.vertical).toBe(true);
        expect(trunk.render.ends[1]).toBeCloseTo(source.y + mobileLayout.nodeHeight);
        for (const item of members(scene)) {
            const [p0, p1] = cubic(item);
            expect(p0.x).toBeCloseTo(trunk.render.ends[0]);
            expect(p1.x).toBeCloseTo(p0.x);
        }
    });

    it("never bundles the DNS history band", () => {
        const targets = ["i1", "i2", "i3", "i4", "i5"];
        const layout = place([node("s", "source"), ...targets.map(id => node(id, "inbound"))]);
        const scene = buildScene(layout, targets.map(id => edge("s", id)), null, true, 0, "far");
        expect(scene.bundles).toEqual([]);
        expect(trunks(scene)).toEqual([]);
    });
});

describe("detailFor", () => {
    it("switches level only past a margin around each threshold", () => {
        expect(detailFor(0.7, "normal")).toBe("normal");
        expect(detailFor(1.1, "normal")).toBe("detail");
        expect(detailFor(1.0, "detail")).toBe("detail");
        expect(detailFor(0.9, "detail")).toBe("normal");
        expect(detailFor(0.45, "normal")).toBe("far");
        expect(detailFor(0.55, "far")).toBe("far");
        expect(detailFor(0.65, "far")).toBe("normal");
        expect(detailFor(0.3, "detail")).toBe("far");
    });
});
