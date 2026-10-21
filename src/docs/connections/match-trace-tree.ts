/** Deterministic, UI-independent explanation-path selection for policy traces. */
export type TraceState = "hit" | "miss" | "skipped" | "unknown";

export type MatchTrace = {
    type: string;
    label?: string;
    state: string;
    kind?: string;
    id?: string;
    children?: MatchTrace[];
};

export function traceState(value: string): TraceState {
    switch (value) {
        case "hit":
        case "miss":
        case "skipped":
        case "unknown":
            return value;
        default:
            return "unknown";
    }
}

export function isTraceGroup(trace: MatchTrace): boolean {
    return (trace.type === "and" || trace.type === "or" || trace.type === "not")
        && (trace.children?.length ?? 0) > 0;
}

/**
 * Indices necessary to explain the result, in evaluation order:
 * - true AND: all children were true
 * - false AND: first false child is decisive
 * - true OR: first true child is decisive
 * - false OR: all evaluated children explain the failure
 * - NOT: descend into the child even when it is false.
 *
 * This is an explanation tree, not a packet-flow path. Skipped and unknown
 * branches are never presented as a successful match.
 */
export function decisiveChildren(node: MatchTrace): number[] {
    const children = node.children ?? [];
    if (traceState(node.state) === "skipped" || traceState(node.state) === "unknown") return [];

    if (node.type === "not") return children.length ? [0] : [];
    if (node.type === "and") {
        if (node.state === "hit") {
            return children.flatMap((child, index) => child.state === "hit" ? [index] : []);
        }
        const index = children.findIndex(child => child.state === "miss");
        return index < 0 ? [] : [index];
    }
    if (node.type === "or") {
        if (node.state === "hit") {
            const index = children.findIndex(child => child.state === "hit");
            return index < 0 ? [] : [index];
        }
        return children.flatMap((child, index) => child.state === "miss" ? [index] : []);
    }
    return [];
}

/**
 * Open only decisive group nodes at first render. Leaves and losing siblings
 * remain visible in the expanded parent, but deep unrelated branches stay
 * folded. The 32-child guard protects unusually wide rules.
 */
export function defaultTraceExpansion(trace: MatchTrace): Set<string> {
    const expanded = new Set<string>();
    const visit = (node: MatchTrace, key: string) => {
        if (!isTraceGroup(node)) return;
        expanded.add(key);
        for (const index of decisiveChildren(node)) {
            const child = node.children![index];
            // A wide failed OR (e.g. under NOT) still shows its immediate
            // choices, but does not expand every complex subbranch at once.
            if ((node.children?.length ?? 0) > 32 && node.state === "miss") break;
            visit(child, key + "." + index);
        }
    };
    visit(trace, "0");
    return expanded;
}

export function decisiveTraceNodes(trace: MatchTrace): Set<string> {
    const result = new Set<string>();
    const visit = (node: MatchTrace, key: string) => {
        result.add(key);
        for (const index of decisiveChildren(node)) {
            visit(node.children![index], key + "." + index);
        }
    };
    visit(trace, "0");
    return result;
}
