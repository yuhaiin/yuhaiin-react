import { COLUMNS, type Column, type TopologyNode } from "./model";

export interface LayoutOptions {
    /** Horizontal: columns left to right. Vertical (phones): layers top to bottom, wrapped. */
    orientation: "horizontal" | "vertical";
    nodeWidth: number;
    nodeHeight: number;
    columnGap: number;
    rowGap: number;
    /** Cards per row inside a vertical layer. */
    perRow: number;
    headerHeight: number;
}

export const desktopLayout: LayoutOptions = { orientation: "horizontal", nodeWidth: 224, nodeHeight: 66, columnGap: 68, rowGap: 12, perRow: 1, headerHeight: 40 };
export const mobileLayout: LayoutOptions = { orientation: "vertical", nodeWidth: 160, nodeHeight: 50, columnGap: 52, rowGap: 10, perRow: 2, headerHeight: 30 };

export interface PlacedNode {
    node: TopologyNode;
    x: number;
    y: number;
    /** The node lost its connections and is shown, faded, until its slot is released. */
    ghost: boolean;
}

export interface ColumnFrame {
    column: Column;
    x: number;
    y: number;
    width: number;
    height: number;
    count: number;
}

export interface Layout {
    options: LayoutOptions;
    nodes: PlacedNode[];
    byId: Map<string, PlacedNode>;
    columns: ColumnFrame[];
    width: number;
    height: number;
}

/** A node that disappears keeps its slot this long, so the others do not move at once. */
export const GHOST_MS = 6000;
/** A vertical layer gives back reserved rows only after being smaller this long. */
export const SHRINK_MS = 10000;

/**
 * Positions that survive model updates.
 *
 * A node gets a rank once, when it first appears: the mean slot of the nodes
 * that feed it in the previous column (so related nodes line up and edges
 * cross less), or the end of its column when nothing feeds it. Ranks never
 * change afterwards, so nodes are never re-sorted by traffic and a node
 * keeps its place relative to its neighbours; Others is always last. A node
 * that disappears stays as a faded ghost for GHOST_MS, after which the
 * column closes the gap.
 */
export class LayoutMemory {
    private sequence = 0;
    private order = new Map<string, number>();
    private rank = new Map<string, number>();
    private last = new Map<string, TopologyNode>();
    private ghosts = new Map<string, { node: TopologyNode; until: number }>();
    private reserved = new Map<Column, { rows: number; smallerSince?: number }>();

    layout(nodes: TopologyNode[], now: number, options: LayoutOptions, edges: { from: string; to: string }[] = []): Layout {
        const current = new Map(nodes.map(node => [node.id, node]));
        for (const [id, node] of this.last) {
            if (!current.has(id) && !this.ghosts.has(id)) {
                this.ghosts.set(id, { node: { ...node, status: "closed", connections: 0, tcp: 0, udp: 0, up: 0, down: 0, connectionIds: [] }, until: now + GHOST_MS });
            }
        }
        for (const [id, ghost] of this.ghosts) {
            if (current.has(id)) this.ghosts.delete(id);
            else if (ghost.until <= now) {
                this.ghosts.delete(id);
                this.order.delete(id);
                this.rank.delete(id);
            }
        }
        for (const node of nodes) {
            if (!this.order.has(node.id)) this.order.set(node.id, this.sequence++);
        }
        this.last = current;

        const entries: { node: TopologyNode; ghost: boolean }[] = [
            ...nodes.map(node => ({ node, ghost: false })),
            ...[...this.ghosts.values()].map(ghost => ({ node: ghost.node, ghost: true })),
        ];
        const byColumn = new Map<Column, { node: TopologyNode; ghost: boolean }[]>(COLUMNS.map(column => [column, []]));
        for (const entry of entries) byColumn.get(entry.node.column)?.push(entry);
        const feeds = new Map<string, string[]>();
        for (const edge of edges) {
            const list = feeds.get(edge.to) ?? [];
            if (!list.includes(edge.from)) list.push(edge.from);
            feeds.set(edge.to, list);
        }
        const slots = new Map<string, number>();
        for (const column of COLUMNS) {
            const list = byColumn.get(column) ?? [];
            const known = list.filter(entry => this.rank.has(entry.node.id)).map(entry => this.rank.get(entry.node.id)!);
            let end = known.length ? Math.max(...known) : -1;
            for (const entry of list.filter(item => !this.rank.has(item.node.id)).sort((a, b) => this.order.get(a.node.id)! - this.order.get(b.node.id)!)) {
                const sources = (feeds.get(entry.node.id) ?? []).map(id => slots.get(id)).filter((slot): slot is number => slot !== undefined);
                const rank = sources.length ? sources.reduce((sum, slot) => sum + slot, 0) / sources.length + 0.5 : ++end;
                end = Math.max(end, rank);
                this.rank.set(entry.node.id, rank);
            }
            list.sort((a, b) => Number(a.node.kind === "others") - Number(b.node.kind === "others")
                || this.rank.get(a.node.id)! - this.rank.get(b.node.id)!
                || (this.order.get(a.node.id) ?? 0) - (this.order.get(b.node.id) ?? 0));
            list.forEach((entry, slot) => slots.set(entry.node.id, slot));
        }

        const { nodeWidth: w, nodeHeight: h, columnGap, rowGap, headerHeight, perRow } = options;
        const placed: PlacedNode[] = [];
        const columns: ColumnFrame[] = [];
        if (options.orientation === "horizontal") {
            let height = 0;
            COLUMNS.forEach((column, index) => {
                const list = byColumn.get(column) ?? [];
                const x = index * (w + columnGap);
                list.forEach((entry, slot) => placed.push({ ...entry, x, y: headerHeight + slot * (h + rowGap) }));
                const columnHeight = headerHeight + Math.max(1, list.length) * (h + rowGap) - rowGap;
                columns.push({ column, x, y: 0, width: w, height: columnHeight, count: list.filter(entry => !entry.ghost).length });
                height = Math.max(height, columnHeight);
            });
            return finish(options, placed, columns, COLUMNS.length * (w + columnGap) - columnGap, height);
        }

        let top = 0;
        const width = perRow * (w + rowGap) - rowGap;
        for (const column of COLUMNS) {
            const list = byColumn.get(column) ?? [];
            const rows = this.reserveRows(column, Math.max(1, Math.ceil(list.length / perRow)), now);
            list.forEach((entry, slot) => placed.push({
                ...entry,
                x: (slot % perRow) * (w + rowGap),
                y: top + headerHeight + Math.floor(slot / perRow) * (h + rowGap),
            }));
            const layerHeight = headerHeight + rows * (h + rowGap) - rowGap;
            columns.push({ column, x: 0, y: top, width, height: layerHeight, count: list.filter(entry => !entry.ghost).length });
            top += layerHeight + columnGap;
        }
        return finish(options, placed, columns, width, top - columnGap);
    }

    /** Rows grow at once and shrink only after a quiet period, so lower layers stay put. */
    private reserveRows(column: Column, needed: number, now: number) {
        const state = this.reserved.get(column) ?? { rows: needed };
        if (needed >= state.rows) {
            state.rows = needed;
            state.smallerSince = undefined;
        } else if (state.smallerSince === undefined) {
            state.smallerSince = now;
        } else if (now - state.smallerSince >= SHRINK_MS) {
            state.rows = needed;
            state.smallerSince = undefined;
        }
        this.reserved.set(column, state);
        return state.rows;
    }

    reset() {
        this.sequence = 0;
        this.order.clear();
        this.rank.clear();
        this.last.clear();
        this.ghosts.clear();
        this.reserved.clear();
    }
}

function finish(options: LayoutOptions, nodes: PlacedNode[], columns: ColumnFrame[], width: number, height: number): Layout {
    return { options, nodes, byId: new Map(nodes.map(node => [node.node.id, node])), columns, width, height };
}

export interface Point { x: number; y: number }

/** Cubic Bézier control points of an edge between two placed nodes, in world coordinates. */
export function edgeCurve(layout: Layout, from: PlacedNode, to: PlacedNode, offset = 0): [Point, Point, Point, Point] {
    const { nodeWidth: w, nodeHeight: h, orientation } = layout.options;
    if (orientation === "horizontal") {
        const start = { x: from.x + w, y: from.y + h / 2 + offset };
        const end = { x: to.x, y: to.y + h / 2 + offset };
        const bend = Math.max(24, (end.x - start.x) * 0.5);
        return [start, { x: start.x + bend, y: start.y }, { x: end.x - bend, y: end.y }, end];
    }
    const start = { x: from.x + w / 2 + offset, y: from.y + h };
    const end = { x: to.x + w / 2 + offset, y: to.y };
    const bend = Math.max(18, (end.y - start.y) * 0.5);
    return [start, { x: start.x, y: start.y + bend }, { x: end.x, y: end.y - bend }, end];
}

/** Samples a cubic Bézier into a polyline with cumulative lengths. */
export function samplePath(curve: [Point, Point, Point, Point], segments = 24) {
    const points = new Float32Array((segments + 1) * 2);
    const lengths = new Float32Array(segments + 1);
    const [p0, p1, p2, p3] = curve;
    let length = 0;
    for (let index = 0; index <= segments; index++) {
        const t = index / segments;
        const u = 1 - t;
        const x = u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x;
        const y = u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y;
        if (index > 0) length += Math.hypot(x - points[(index - 1) * 2], y - points[(index - 1) * 2 + 1]);
        points[index * 2] = x;
        points[index * 2 + 1] = y;
        lengths[index] = length;
    }
    return { points, lengths, length };
}

export function svgPath(curve: [Point, Point, Point, Point]) {
    const [a, b, c, d] = curve;
    return `M${a.x},${a.y} C${b.x},${b.y} ${c.x},${c.y} ${d.x},${d.y}`;
}
