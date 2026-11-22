import type { RenderEdge } from "./flow-renderer";
import type { Layout, PlacedNode, Point } from "./layout";
import type { NetworkKind, TopologyEdge } from "./model";

/** Space between neighbouring ports on a card edge, and the margin kept to the card corners. */
const PORT_GAP = 14;
const PORT_MARGIN = 10;

/**
 * Level of detail, chosen from the zoom with hysteresis by the stage:
 * detail (zoomed in) bundles only very crowded card sides, normal bundles
 * moderately crowded ones, far (zoomed out) bundles almost everything that
 * shares a card side.
 */
export type Detail = "detail" | "normal" | "far";

/** Same-protocol edges on one card side needed before they share a trunk. */
export const BUNDLE_FROM: Record<Detail, number> = { detail: 8, normal: 4, far: 3 };
/** Distance between bundle members inside a trunk (world units). */
const TRUNK_STEP: Record<Detail, number> = { detail: 3, normal: 3.4, far: 4.6 };

export interface SceneEdge {
    edge: TopologyEdge;
    d: string;
    render: RenderEdge;
    /** False for decorative links that have no details of their own. */
    interactive?: boolean;
    /** Bundles (fan-out at the source, fan-in at the target) the edge's trunks belong to. */
    bundles?: string[];
}

/**
 * Edges that share a trunk at one card side: a visual grouping only. The
 * member edges (and through them the connections) are kept as they are;
 * nothing here merges data.
 */
export interface SceneBundle {
    id: string;
    /** The card the trunk is attached to, and whether the members leave it (out) or arrive (in). */
    node: string;
    side: "out" | "in";
    network: NetworkKind;
    edgeIds: string[];
    connectionIds: string[];
    connections: number;
    up: number;
    down: number;
    /** The card at the other end of each member, in trunk order. */
    peers: string[];
    /** The shared trunk, for hit testing and highlighting. */
    d: string;
    width: number;
}

export interface Emphasis {
    nodes: Set<string>;
    edges: Set<string>;
}

export interface Scene {
    edges: SceneEdge[];
    bundles: SceneBundle[];
}

/** Along the flow (x on desktop, y on phones) and across it. */
interface Frame {
    horizontal: boolean;
    exit: (node: PlacedNode) => { a: number; b: number };
    entry: (node: PlacedNode) => { a: number; b: number };
    point: (a: number, b: number) => Point;
    band: number;
}

function frameOf(layout: Layout, offsetY: number): Frame {
    const { nodeWidth: w, nodeHeight: h, orientation } = layout.options;
    if (orientation === "horizontal") {
        return {
            horizontal: true,
            exit: node => ({ a: node.x + w, b: node.y + offsetY + h / 2 }),
            entry: node => ({ a: node.x, b: node.y + offsetY + h / 2 }),
            point: (a, b) => ({ x: a, y: b }),
            band: h - PORT_MARGIN * 2,
        };
    }
    return {
        horizontal: false,
        exit: node => ({ a: node.y + offsetY + h, b: node.x + w / 2 }),
        entry: node => ({ a: node.y + offsetY, b: node.x + w / 2 }),
        point: (a, b) => ({ x: b, y: a }),
        band: w - PORT_MARGIN * 2,
    };
}

interface Port {
    /** Across offset from the card edge's centre. */
    offset: number;
    /** Half-width available to the edge's strands. */
    spread: number;
    bundle?: string;
}

interface BundleDraft { node: string; side: "out" | "in"; network: NetworkKind; members: TopologyEdge[] }

/**
 * Ports on every card side. Edges are ordered by the position of the node at
 * their other end, so ribbons leave and arrive in neighbour order. When a
 * card side carries at least BUNDLE_FROM[detail] edges of one protocol (and
 * none of them is to be expanded), those edges form one unit packed TRUNK_STEP
 * apart: they leave (or arrive) as one trunk and branch out to their real
 * targets. TCP and UDP never share a trunk.
 */
function assignPorts(layout: Layout, frame: Frame, edges: TopologyEdge[], detail: Detail | null, expand: Set<string> | null) {
    const across = (id: string) => {
        const node = layout.byId.get(id)!;
        return frame.horizontal ? node.y : node.x;
    };
    const sides = new Map<string, TopologyEdge[]>();
    for (const edge of edges) {
        if (!layout.byId.has(edge.from) || !layout.byId.has(edge.to)) continue;
        for (const key of [`out:${edge.from}`, `in:${edge.to}`]) {
            const list = sides.get(key) ?? [];
            list.push(edge);
            sides.set(key, list);
        }
    }
    const ports = { out: new Map<string, Port>(), in: new Map<string, Port>() };
    const bundles = new Map<string, BundleDraft>();
    for (const [key, list] of sides) {
        const side = key.startsWith("out:") ? "out" : "in";
        const node = key.slice(side.length + 1);
        const other = (edge: TopologyEdge) => across(side === "out" ? edge.to : edge.from);
        list.sort((a, b) => other(a) - other(b) || a.network.localeCompare(b.network) || a.id.localeCompare(b.id));
        // Units: one per bundled protocol group, one per remaining edge.
        const byNetwork = new Map<NetworkKind, TopologyEdge[]>();
        for (const edge of list) byNetwork.set(edge.network, [...(byNetwork.get(edge.network) ?? []), edge]);
        const bundled = new Set<NetworkKind>();
        for (const [network, members] of byNetwork) {
            if (detail && members.length >= BUNDLE_FROM[detail] && !members.some(edge => expand?.has(edge.id))) bundled.add(network);
        }
        const units: { edges: TopologyEdge[]; bundle?: string; at: number }[] = [];
        for (const network of bundled) {
            const members = byNetwork.get(network)!;
            const id = `bundle:${side}:${node}#${network}`;
            bundles.set(id, { node, side, network, members });
            units.push({ edges: members, bundle: id, at: members.reduce((sum, edge) => sum + other(edge), 0) / members.length });
        }
        for (const edge of list) if (!bundled.has(edge.network)) units.push({ edges: [edge], at: other(edge) });
        units.sort((a, b) => a.at - b.at);
        const trunkStep = detail ? TRUNK_STEP[detail] : 0;
        const trunkSpace = units.reduce((sum, unit) => sum + (unit.bundle ? unit.edges.length * trunkStep : 0), 0);
        const singles = units.filter(unit => !unit.bundle).length;
        const step = singles ? Math.max(3, Math.min(PORT_GAP, (frame.band - trunkSpace) / singles)) : 0;
        const total = trunkSpace + singles * step;
        let cursor = -total / 2;
        for (const unit of units) {
            const width = unit.bundle ? trunkStep : step;
            for (const edge of unit.edges) {
                ports[side].set(edge.id, { offset: cursor + width / 2, spread: Math.max(1.2, width * 0.4), bundle: unit.bundle });
                cursor += width;
            }
        }
    }
    return { ports, bundles };
}

/** Appends a sampled piece in flow coordinates: straight, or a cubic leaving and arriving along the flow. */
function sample(out: number[], from: { a: number; b: number }, to: { a: number; b: number }, segments: number, curved: boolean, skipFirst: boolean) {
    const bend = Math.max(12, (to.a - from.a) * 0.5);
    for (let index = skipFirst ? 1 : 0; index <= segments; index++) {
        const t = index / segments;
        if (!curved) {
            out.push(from.a + (to.a - from.a) * t, from.b + (to.b - from.b) * t);
            continue;
        }
        const u = 1 - t;
        const p1 = from.a + bend, p2 = to.a - bend;
        out.push(
            u * u * u * from.a + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * to.a,
            u * u * u * from.b + 3 * u * u * t * from.b + 3 * u * t * t * to.b + t * t * t * to.b,
        );
    }
}

/**
 * Geometry for every edge whose two ends are placed, and the bundles that
 * share trunks at crowded card sides. A bundled edge runs straight along
 * its trunk next to the other members, then branches with a smooth curve to
 * its real target (or into the target's fan-in trunk). Members whose other
 * end lies farther across split off earlier, so branches fan out in order
 * instead of crossing. Groups containing an edge in `expand` (a search
 * match or the selected node's paths) are drawn as individual edges; with an
 * emphasis, the other edges are dimmed.
 */
export function buildScene(layout: Layout, edges: TopologyEdge[], emphasis: Emphasis | null, auxiliary = false, offsetY = 0, detail: Detail = "normal", expand: Set<string> | null = emphasis?.edges ?? null): Scene {
    const maxCount = Math.max(1, ...edges.map(edge => edge.connections));
    const frame = frameOf(layout, offsetY);
    // DNS history edges are never bundled: their details come from another graph.
    const { ports, bundles } = assignPorts(layout, frame, edges, auxiliary ? null : detail, expand);
    const trunks = new Map<string, number>();
    const result: SceneEdge[] = [];
    for (const edge of edges) {
        const from = layout.byId.get(edge.from);
        const to = layout.byId.get(edge.to);
        if (!from || !to) continue;
        const exit = frame.exit(from), entry = frame.entry(to);
        const out = ports.out.get(edge.id)!, into = ports.in.get(edge.id)!;
        const start = { a: exit.a, b: exit.b + out.offset };
        const end = { a: entry.a, b: entry.b + into.offset };
        const gap = Math.max(1, end.a - start.a);
        const trunkLength = (port: Port, here: number, there: number) => {
            if (!port.bundle) return 0;
            const members = bundles.get(port.bundle)!.members.length;
            // Farther branches split earlier (up to 35% shorter trunk).
            const share = 1 - 0.35 * Math.min(1, Math.abs(there - here) / (Math.max(1, frame.band) * 3));
            const length = Math.min(gap * 0.28, 22 + 3 * members) * share;
            trunks.set(port.bundle, Math.max(trunks.get(port.bundle) ?? 0, length));
            return length;
        };
        const lead = trunkLength(out, start.b, end.b);
        const tail = trunkLength(into, end.b, start.b);
        const coords: number[] = [];
        const branchStart = { a: start.a + lead, b: start.b };
        const branchEnd = { a: end.a - tail, b: end.b };
        if (lead) sample(coords, start, branchStart, 3, false, false);
        sample(coords, branchStart, branchEnd, 18, true, lead > 0);
        if (tail) sample(coords, branchEnd, end, 3, false, true);
        const points = new Float32Array(coords.length);
        const lengths = new Float32Array(coords.length / 2);
        let length = 0;
        for (let index = 0; index < coords.length / 2; index++) {
            const p = frame.point(coords[index * 2], coords[index * 2 + 1]);
            points[index * 2] = p.x;
            points[index * 2 + 1] = p.y;
            if (index) length += Math.hypot(p.x - points[index * 2 - 2], p.y - points[index * 2 - 1]);
            lengths[index] = length;
        }
        let d = `M${points[0]},${points[1]}`;
        for (let index = 1; index < points.length / 2; index++) d += ` L${points[index * 2]},${points[index * 2 + 1]}`;
        const highlighted = emphasis?.edges.has(edge.id) ?? false;
        result.push({
            edge,
            d,
            bundles: [out.bundle, into.bundle].filter((id): id is string => Boolean(id)),
            render: {
                id: edge.id,
                path: { points, lengths, length },
                spread: Math.min(out.spread, into.spread),
                // Strands wave only along the branch: trunks are calm, parallel runs.
                waveStart: length > 0 ? lead / length : 0,
                waveEnd: length > 0 ? 1 - tail / length : 1,
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

    const sceneBundles: SceneBundle[] = [];
    for (const [id, bundle] of bundles) {
        const node = layout.byId.get(bundle.node);
        if (!node) continue;
        const anchor = bundle.side === "out" ? frame.exit(node) : frame.entry(node);
        const offsets = bundle.members.map(edge => (bundle.side === "out" ? ports.out : ports.in).get(edge.id)!.offset);
        const centre = anchor.b + (Math.min(...offsets) + Math.max(...offsets)) / 2;
        const reach = (trunks.get(id) ?? 0) * (bundle.side === "out" ? 1 : -1);
        const a = frame.point(anchor.a, centre), b = frame.point(anchor.a + reach, centre);
        sceneBundles.push({
            id, node: bundle.node, side: bundle.side, network: bundle.network,
            edgeIds: bundle.members.map(edge => edge.id),
            connectionIds: [...new Set(bundle.members.flatMap(edge => edge.connectionIds))],
            connections: bundle.members.reduce((sum, edge) => sum + edge.connections, 0),
            up: bundle.members.reduce((sum, edge) => sum + edge.up, 0),
            down: bundle.members.reduce((sum, edge) => sum + edge.down, 0),
            peers: bundle.members.map(edge => bundle.side === "out" ? edge.to : edge.from),
            d: `M${a.x},${a.y} L${b.x},${b.y}`,
            width: Math.max(...offsets) - Math.min(...offsets) + 10,
        });
    }
    return { edges: result, bundles: sceneBundles };
}
