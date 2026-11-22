import type { RenderEdge } from "./flow-renderer";
import { edgeCurve, samplePath, svgPath, type Layout, type PlacedNode } from "./layout";
import type { TopologyEdge } from "./model";

/** Offset between the TCP and UDP lanes of the same node pair. */
const NETWORK_OFFSET = 5;

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
 * Geometry for every edge whose two ends are placed. TCP and UDP between the
 * same nodes get parallel lanes. With an emphasis (search match or a
 * selection), the other edges are dimmed but still drawn.
 */
export function buildScene(layout: Layout, edges: TopologyEdge[], emphasis: Emphasis | null, auxiliary = false, offsetY = 0): SceneEdge[] {
    const pairs = new Map<string, number>();
    for (const edge of edges) pairs.set(`${edge.from}>${edge.to}`, (pairs.get(`${edge.from}>${edge.to}`) ?? 0) + 1);
    const maxCount = Math.max(1, ...edges.map(edge => edge.connections));
    const result: SceneEdge[] = [];
    for (const edge of edges) {
        const from = layout.byId.get(edge.from);
        const to = layout.byId.get(edge.to);
        if (!from || !to) continue;
        const shared = (pairs.get(`${edge.from}>${edge.to}`) ?? 1) > 1;
        const offset = shared ? (edge.network === "udp" ? NETWORK_OFFSET : -NETWORK_OFFSET) : 0;
        const curve = edgeCurve(layout, shift(from, offsetY), shift(to, offsetY), offset);
        const d = svgPath(curve);
        const highlighted = emphasis?.edges.has(edge.id) ?? false;
        result.push({
            edge,
            d,
            render: {
                id: edge.id,
                path: samplePath(curve),
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
