/**
 * Pure, deterministic series/parallel layout for read-only boolean traces.
 * AND = serial, OR = parallel, NOT = serial with an inverted output terminal.
 * All geometry is independent of React and rendering technology.
 */
export type TraceState = "hit" | "miss" | "skipped" | "unknown";
export type MatchTrace = {
    type: string;
    label?: string;
    state: string;
    kind?: string;
    id?: string;
    children?: MatchTrace[];
};

export type CircuitNode = {
    key: string;
    trace: MatchTrace;
    x: number;
    y: number;
    width: number;
    height: number;
    collapsed: boolean;
};

export type CircuitWire = {
    key: string;
    d: string;
    state: TraceState;
};

export type CircuitLayout = {
    width: number;
    height: number;
    nodes: CircuitNode[];
    wires: CircuitWire[];
};

type Size = {
    width: number;
    height: number;
    children: { key: string; x: number; y: number; size: Size }[];
    collapsed: boolean;
};

const CARD_WIDTH = 184;
const CARD_HEIGHT = 64;
const GROUP_HEADER = 44;
const PADDING = 28;
const SERIES_GAP = 19;
const PARALLEL_GAP = 24;

export function traceState(state: string): TraceState {
    return state === "hit" || state === "miss" || state === "skipped" || state === "unknown" ? state : "unknown";
}

function isGroup(trace: MatchTrace): boolean {
    return (trace.type === "and" || trace.type === "or" || trace.type === "not") && (trace.children?.length ?? 0) > 0;
}

export function initialCollapsed(trace: MatchTrace): Set<string> {
    const result = new Set<string>();
    function visit(node: MatchTrace, key: string, depth: number) {
        if (!isGroup(node)) return;
        if (depth >= 1) {
            result.add(key);
            return;
        }
        node.children?.forEach((child, index) => visit(child, key + "." + index, depth + 1));
    }
    visit(trace, "0", 0);
    return result;
}

export function buildCircuitLayout(trace: MatchTrace, collapsed: ReadonlySet<string>): CircuitLayout {
    const sizes = new Map<string, Size>();
    const measure = (node: MatchTrace, key: string): Size => {
        if (!isGroup(node) || collapsed.has(key)) {
            const size = { width: isGroup(node) ? 230 : CARD_WIDTH, height: CARD_HEIGHT, children: [], collapsed: isGroup(node) };
            sizes.set(key, size);
            return size;
        }
        const parts = (node.children ?? []).map((child, index) => {
            const childKey = key + "." + index;
            return { key: childKey, size: measure(child, childKey) };
        });
        const children: Size["children"] = [];
        let width: number;
        let height: number;
        if (node.type === "or") {
            const maxChildHeight = Math.max(0, ...parts.map(part => part.size.height));
            width = parts.reduce((sum, part) => sum + part.size.width, 0) + PARALLEL_GAP * Math.max(0, parts.length - 1) + PADDING * 2;
            height = GROUP_HEADER + 28 + maxChildHeight + 34;
            let left = PADDING;
            for (const part of parts) {
                children.push({ ...part, x: left, y: GROUP_HEADER + 28 });
                left += part.size.width + PARALLEL_GAP;
            }
        } else if (node.type === "not") {
            const child = parts[0];
            width = child.size.width + PADDING * 2;
            height = GROUP_HEADER + 14 + child.size.height + 45;
            children.push({ ...child, x: PADDING, y: GROUP_HEADER + 14 });
        } else {
            width = Math.max(0, ...parts.map(part => part.size.width)) + PADDING * 2;
            let top = GROUP_HEADER + 20;
            for (const part of parts) {
                children.push({ ...part, x: (width - part.size.width) / 2, y: top });
                top += part.size.height + SERIES_GAP;
            }
            height = top + 13;
        }
        const size = { width, height, children, collapsed: false };
        sizes.set(key, size);
        return size;
    };

    const root = measure(trace, "0");
    const nodes: CircuitNode[] = [];
    const wires: CircuitWire[] = [];
    const wire = (key: string, d: string, state: string) => {
        wires.push({ key, d, state: traceState(state) });
    };
    const place = (node: MatchTrace, key: string, x: number, y: number) => {
        const size = sizes.get(key)!;
        nodes.push({ key, trace: node, x, y, width: size.width, height: size.height, collapsed: size.collapsed });
        if (!size.children.length) return;
        const center = x + size.width / 2;
        if (node.type === "and") {
            let end = y + GROUP_HEADER;
            size.children.forEach((part, index) => {
                const child = node.children![index], childX = x + part.x, childY = y + part.y;
                const childCenter = childX + part.size.width / 2;
                wire(key + "-start-" + index, "M " + center + " " + end + " L " + childCenter + " " + childY, child.state);
                place(child, part.key, childX, childY);
                end = childY + part.size.height;
            });
            wire(key + "-end", "M " + center + " " + end + " V " + (y + size.height), node.state);
        } else if (node.type === "or") {
            const first = size.children[0], last = size.children[size.children.length - 1];
            const topRail = y + GROUP_HEADER + 12;
            const bottomRail = y + size.height - 15;
            const firstCenter = x + first.x + first.size.width / 2;
            const lastCenter = x + last.x + last.size.width / 2;
            wire(key + "-top", "M " + center + " " + (y + GROUP_HEADER) + " V " + topRail + " M " + firstCenter + " " + topRail + " H " + lastCenter, node.state);
            wire(key + "-bottom", "M " + firstCenter + " " + bottomRail + " H " + lastCenter + " M " + center + " " + bottomRail + " V " + (y + size.height), node.state);
            size.children.forEach((part, index) => {
                const child = node.children![index], childX = x + part.x, childY = y + part.y;
                const childCenter = childX + part.size.width / 2;
                wire(part.key + "-input", "M " + childCenter + " " + topRail + " V " + childY, child.state);
                wire(part.key + "-output", "M " + childCenter + " " + (childY + part.size.height) + " V " + bottomRail, child.state);
                place(child, part.key, childX, childY);
            });
        } else if (node.type === "not") {
            const part = size.children[0], child = node.children![0];
            const childX = x + part.x, childY = y + part.y;
            wire(key + "-input", "M " + center + " " + (y + GROUP_HEADER) + " V " + childY, child.state);
            place(child, part.key, childX, childY);
            wire(key + "-inversion", "M " + center + " " + (childY + part.size.height) + " V " + (y + size.height - 17), child.state);
            wire(key + "-output", "M " + center + " " + (y + size.height - 5) + " V " + (y + size.height), node.state);
        }
    };
    place(trace, "0", 30, 30);
    return { width: root.width + 60, height: root.height + 60, nodes, wires };
}
