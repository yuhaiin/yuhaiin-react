import { describe, expect, it } from "vitest";
import { desktopLayout, LayoutMemory, mobileLayout, type LayoutOptions } from "./layout";
import type { Column, NetworkKind, TopologyEdge, TopologyNode } from "./model";
import { BUNDLE_FROM, buildScene } from "./scene";
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

const first = (points: Float32Array) => ({ x: points[0], y: points[1] });
const last = (points: Float32Array) => ({ x: points[points.length - 2], y: points[points.length - 1] });

describe("buildScene bundling", () => {
    it("keeps a sparse graph as individual edges", () => {
        const layout = place([node("s", "source"), node("a", "inbound"), node("b", "inbound")]);
        const scene = buildScene(layout, [edge("s", "a"), edge("s", "b")], null);
        expect(scene.bundles).toEqual([]);
        expect(scene.edges.every(item => item.render.waveStart === 0 && item.render.waveEnd === 1)).toBe(true);
    });

    it("bundles a crowded fan-out into one trunk that branches to the real targets, in order", () => {
        const targets = ["i1", "i2", "i3", "i4", "i5"];
        const layout = place([node("s", "source"), ...targets.map(id => node(id, "inbound"))]);
        const edges = targets.map(id => edge("s", id));
        const scene = buildScene(layout, edges, null);
        expect(scene.bundles).toHaveLength(1);
        const [bundle] = scene.bundles;
        expect(bundle).toMatchObject({ node: "s", side: "out", network: "tcp", edgeIds: edges.map(item => item.id), peers: targets, connections: 5, up: 500, down: 1000 });
        expect(bundle.connectionIds).toHaveLength(5);
        const { nodeWidth: w, nodeHeight: h } = desktopLayout;
        const source = layout.byId.get("s")!;
        const ends: number[] = [];
        for (const item of scene.edges) {
            const start = first(item.render.path.points), end = last(item.render.path.points);
            // Starts on the source card's right edge, inside the card's height.
            expect(start.x).toBeCloseTo(source.x + w);
            expect(Math.abs(start.y - (source.y + h / 2))).toBeLessThan(h / 2);
            // Ends on its own target's left edge.
            const target = layout.byId.get(item.edge.to)!;
            expect(end.x).toBeCloseTo(target.x);
            expect(Math.abs(end.y - (target.y + h / 2))).toBeLessThan(h / 2);
            // Straight trunk first, then the waving branch.
            expect(item.render.waveStart).toBeGreaterThan(0);
            expect(item.render.path.points[3]).toBeCloseTo(start.y, 4);
            expect(item.bundles).toEqual([bundle.id]);
            ends.push(end.y);
        }
        // Trunk members are packed tighter than individual ports, ordered like their targets.
        const starts = scene.edges.map(item => first(item.render.path.points).y);
        expect(Math.max(...starts) - Math.min(...starts)).toBeLessThan(5 * 14);
        expect([...starts].sort((a, b) => a - b)).toEqual(starts);
        expect([...ends].sort((a, b) => a - b)).toEqual(ends);
    });

    it("bundles a crowded fan-in into a trunk at the shared target", () => {
        const sources = ["s1", "s2", "s3", "s4"];
        const layout = place([...sources.map(id => node(id, "source")), node("in", "inbound")]);
        const scene = buildScene(layout, sources.map(id => edge(id, "in")), null);
        expect(scene.bundles).toEqual([expect.objectContaining({ node: "in", side: "in", peers: sources })]);
        for (const item of scene.edges) {
            expect(item.render.waveEnd).toBeLessThan(1);
            expect(last(item.render.path.points).x).toBeCloseTo(layout.byId.get("in")!.x);
        }
    });

    it("never puts TCP and UDP in the same trunk", () => {
        const targets = ["i1", "i2", "i3", "i4"];
        const layout = place([node("s", "source"), ...targets.map(id => node(id, "inbound"))]);
        const scene = buildScene(layout, [...targets.map(id => edge("s", id, "tcp")), ...targets.map(id => edge("s", id, "udp"))], null);
        expect(scene.bundles.map(bundle => bundle.network).sort()).toEqual(["tcp", "udp"]);
        for (const bundle of scene.bundles) {
            expect(bundle.edgeIds.every(id => id.endsWith(`#${bundle.network}`))).toBe(true);
        }
        expect(scene.edges.filter(item => item.edge.network === "udp").every(item => item.render.dashed)).toBe(true);
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

    it("expands groups that contain a searched or selected edge", () => {
        const targets = ["i1", "i2", "i3", "i4", "i5"];
        const layout = place([node("s", "source"), ...targets.map(id => node(id, "inbound"))]);
        const edges = targets.map(id => edge("s", id));
        const emphasis = { nodes: new Set(["s", "i3"]), edges: new Set([edges[2].id]) };
        const expanded = buildScene(layout, edges, emphasis);
        expect(expanded.bundles).toHaveLength(0);
        expect(expanded.edges.find(item => item.edge.id === edges[2].id)!.render.highlighted).toBe(true);
        expect(expanded.edges.find(item => item.edge.id === edges[0].id)!.render.alpha).toBeLessThan(1);
        // A selected trunk stays bundled while its members are highlighted.
        const kept = buildScene(layout, edges, { nodes: new Set(["s"]), edges: new Set(edges.map(item => item.id)) }, false, 0, "normal", null);
        expect(kept.bundles).toHaveLength(1);
    });

    it("bundles along the vertical phone layout too", () => {
        const targets = ["i1", "i2", "i3", "i4"];
        const layout = place([node("s", "source"), ...targets.map(id => node(id, "inbound"))], mobileLayout);
        const scene = buildScene(layout, targets.map(id => edge("s", id)), null, false, 0, "normal");
        expect(scene.bundles).toHaveLength(1);
        const source = layout.byId.get("s")!;
        for (const item of scene.edges) {
            const start = first(item.render.path.points);
            expect(start.y).toBeCloseTo(source.y + mobileLayout.nodeHeight);
            expect(Math.abs(start.x - (source.x + mobileLayout.nodeWidth / 2))).toBeLessThan(mobileLayout.nodeWidth / 2);
        }
    });

    it("never bundles the DNS history band", () => {
        const targets = ["i1", "i2", "i3", "i4", "i5"];
        const layout = place([node("s", "source"), ...targets.map(id => node(id, "inbound"))]);
        expect(buildScene(layout, targets.map(id => edge("s", id)), null, true, 0, "far").bundles).toEqual([]);
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
