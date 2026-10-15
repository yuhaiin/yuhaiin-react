export type GraphViewport = { x: number; y: number; scale: number };
export type GraphPoint = { x: number; y: number };

export const INITIAL_GRAPH_VIEW: GraphViewport = { x: 16, y: 16, scale: 1 };

export function panGraph(view: GraphViewport, dx: number, dy: number): GraphViewport {
    return { ...view, x: view.x + dx, y: view.y + dy };
}

export function zoomGraph(
    view: GraphViewport,
    factor: number,
    before: GraphPoint,
    after: GraphPoint = before,
): GraphViewport {
    const scale = Math.max(0.15, Math.min(8, view.scale * factor));
    const ratio = scale / view.scale;
    return {
        scale,
        x: after.x + (view.x - before.x) * ratio,
        y: after.y + (view.y - before.y) * ratio,
    };
}

export function graphPointMiddle(a: GraphPoint, b: GraphPoint): GraphPoint {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function graphPointDistance(a: GraphPoint, b: GraphPoint): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

// pprof writes DOT with Graphviz's default Times family and some 8pt labels.
// Apply readable font defaults BEFORE layout so Graphviz measures the actual
// text sizes instead of overflowing the node boxes after SVG generation.
export function prepareProfilerDOT(dot: string): string {
    const result = dot.replace(
        /^digraph[^\n]*\{/m,
        header => header + '\ngraph [fontname="Arial"]; node [fontname="Arial"]; edge [fontname="Arial"];',
    );
    return result.replace(/fontsize=(\d+)\b/g, (_, size: string) => {
        return 'fontsize=' + Math.max(12, Number(size));
    });
}
