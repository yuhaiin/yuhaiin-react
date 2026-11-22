import type { RenderEdge } from "./flow-renderer";
import { edgeCurve, samplePath, svgPath, type Layout, type PlacedNode } from "./layout";
import type { TopologyEdge } from "./model";

/** Space between neighbouring ports on a card edge, and the margin kept to the card corners. */
const PORT_GAP = 14;
const PORT_MARGIN = 10;

export interface SceneEdge {
    edge: TopologyEdge;
    d: string;
    render: RenderEdge;
    /** False for decorative links that have no details of their own. */
    interactive?: boolean;
}

export interface Emphasis {
    nodes: Set<string>;
    edges: Set<string>;
}

/**
 * Ports: every edge leaving (or entering) a card gets its own slot on that
 * card edge, ordered by the position of the node at its other end. Ribbons
 * therefore leave and arrive in the same order as their neighbours instead
 * of all meeting at the card centre, which removes most crossings. Slots
 * follow the layout, so they move with the cards and never jump on their own.
 */
function ports(layout: Layout, edges: TopologyEdge[]) {
    const horizontal = layout.options.orientation === "horizontal";
    const across = (node: PlacedNode) => horizontal ? node.y : node.x;
    const band = (horizontal ? layout.options.nodeHeight : layout.options.nodeWidth) - PORT_MARGIN * 2;
    const outgoing = new Map<string, TopologyEdge[]>();
    const incoming = new Map<string, TopologyEdge[]>();
    for (const edge of edges) {
        if (!layout.byId.has(edge.from) || !layout.byId.has(edge.to)) continue;
        (outgoing.get(edge.from) ?? outgoing.set(edge.from, []).get(edge.from)!).push(edge);
        (incoming.get(edge.to) ?? incoming.set(edge.to, []).get(edge.to)!).push(edge);
    }
    const start = new Map<string, number>(), end = new Map<string, number>(), gap = new Map<string, number>();
    const assign = (groups: Map<string, TopologyEdge[]>, other: (edge: TopologyEdge) => string, into: Map<string, number>) => {
        for (const list of groups.values()) {
            list.sort((a, b) => across(layout.byId.get(other(a))!) - across(layout.byId.get(other(b))!)
                || a.network.localeCompare(b.network) || a.id.localeCompare(b.id));
            const step = Math.min(PORT_GAP, band / Math.max(1, list.length));
            list.forEach((edge, slot) => {
                into.set(edge.id, (slot - (list.length - 1) / 2) * step);
                gap.set(edge.id, Math.min(gap.get(edge.id) ?? PORT_GAP, step));
            });
        }
    };
    assign(outgoing, edge => edge.to, start);
    assign(incoming, edge => edge.from, end);
    return { start, end, gap };
}

/**
 * Geometry for every edge whose two ends are placed. With an emphasis
 * (search match or a selection), the other edges are dimmed but still drawn.
 */
export function buildScene(layout: Layout, edges: TopologyEdge[], emphasis: Emphasis | null, auxiliary = false, offsetY = 0): SceneEdge[] {
    const maxCount = Math.max(1, ...edges.map(edge => edge.connections));
    const slots = ports(layout, edges);
    const result: SceneEdge[] = [];
    for (const edge of edges) {
        const from = layout.byId.get(edge.from);
        const to = layout.byId.get(edge.to);
        if (!from || !to) continue;
        const curve = edgeCurve(layout, shift(from, offsetY), shift(to, offsetY), slots.start.get(edge.id) ?? 0, slots.end.get(edge.id) ?? 0);
        const d = svgPath(curve);
        const highlighted = emphasis?.edges.has(edge.id) ?? false;
        result.push({
            edge,
            d,
            render: {
                id: edge.id,
                path: samplePath(curve, 32),
                // A bundle stays inside its own port slot, so neighbouring ribbons do not overlap.
                spread: Math.max(1.5, (slots.gap.get(edge.id) ?? PORT_GAP) * 0.4),
                d,
                dashed: edge.network === "udp",
                up: edge.up,
                down: edge.down,
                alpha: emphasis && !highlighted ? 0.14 : 1,
                highlighted,
                auxiliary: auxiliary ? { weight: Math.log1p(edge.connections) / Math.log1p(maxCount) } : undefined,
            },
        });
    }
    return result;
}

function shift(node: PlacedNode, offsetY: number): PlacedNode {
    return offsetY ? { ...node, y: node.y + offsetY } : node;
}
