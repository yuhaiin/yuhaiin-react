import { Button } from "@/component/v2/button";
import { Input } from "@/component/v2/input";
import { ChevronLeft, Minus, Plus, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import {
    INITIAL_GRAPH_VIEW, graphPointDistance, graphPointMiddle, panGraph,
    prepareProfilerDOT, zoomGraph, type GraphPoint, type GraphViewport,
} from "./graph-viewport";
import { useTranslation } from "react-i18next";

// Lazily loaded, locally bundled by Vite. No CDN or system Graphviz process.
let rendererPromise: Promise<(dot: string) => string> | undefined;
function layoutDOT(dot: string): Promise<string> {
    rendererPromise ??= import("@hpcc-js/wasm-graphviz")
        .then(async ({ Graphviz }) => {
            const graphviz = await Graphviz.load();
            return (source: string) => graphviz.layout(prepareProfilerDOT(source), "svg", "dot");
        })
        .catch(error => {
            rendererPromise = undefined;
            throw error;
        });
    return rendererPromise.then(render => render(dot));
}

// Graph labels may originate in process symbols. Never mount SVG produced from
// those strings without removing active content, external references and URLs.
function parseSafeSVG(svgSource: string): SVGSVGElement {
    const doc = new DOMParser().parseFromString(svgSource, "image/svg+xml");
    const svg = doc.documentElement as unknown as SVGSVGElement;
    if (svg.localName !== "svg" || svg.namespaceURI !== "http://www.w3.org/2000/svg") {
        throw new Error("Invalid SVG returned by Graphviz");
    }
    for (const node of Array.from(svg.querySelectorAll("script, foreignObject, image, iframe, object, embed, use, style, animate, set, animateTransform, animateMotion"))) {
        node.remove();
    }
    for (const node of [svg, ...Array.from(svg.querySelectorAll("*"))]) {
        for (const attr of Array.from(node.attributes)) {
            const name = attr.name.toLowerCase();
            if (name.startsWith("on") || name.includes("href") || name === "src" ||
                name === "style" || attr.value.toLowerCase().includes("url(")) {
                node.removeAttributeNode(attr);
            }
        }
    }
    // Keep Graphviz's native viewBox size. The previous min-width fallback
    // shrank large graphs to 640px, turning readable text into tiny letters.
    const rawWidth = svg.getAttribute("width") || "";
    const rawHeight = svg.getAttribute("height") || "";
    const vb = (svg.getAttribute("viewBox") || "").trim().split(/[ ,]+/).map(Number);
    const width = parseFloat(rawWidth) * (rawWidth.endsWith("pt") ? 4 / 3 : 1);
    const height = parseFloat(rawHeight) * (rawHeight.endsWith("pt") ? 4 / 3 : 1);
    const intrinsicWidth = Number.isFinite(width) && width > 0 ? width : (vb[2] || 800) * 4 / 3;
    const intrinsicHeight = Number.isFinite(height) && height > 0 ? height : (vb[3] || 600) * 4 / 3;
    svg.setAttribute("width", String(intrinsicWidth));
    svg.setAttribute("height", String(intrinsicHeight));
    svg.style.display = "block";
    svg.style.maxWidth = "none";
    svg.style.userSelect = "none";
    return svg;
}

interface GraphProps {
    sessionId: string;
    initialQuery: string;
    makeURL: (path: string) => string;
    onNavigate: (view: "flamegraph" | "top" | "peek", query: string) => void;
}

export function PprofWASMGraph({ sessionId, initialQuery, makeURL, onNavigate }: GraphProps) {
    const { t } = useTranslation("ui");
    const start = new URLSearchParams(initialQuery);
    const [query, setQuery] = useState(initialQuery);
    const [focus, setFocus] = useState(start.get("f") ?? start.get("focus") ?? "");
    const [ignore, setIgnore] = useState(start.get("i") ?? start.get("ignore") ?? "");
    const [nodeCount, setNodeCount] = useState(start.get("n") ?? start.get("nodecount") ?? "");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [svg, setSVG] = useState("");
    const [view, setView] = useState<GraphViewport>(INITIAL_GRAPH_VIEW);
    const viewRef = useRef<GraphViewport>(INITIAL_GRAPH_VIEW);
    const svgHost = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);
    const pointersRef = useRef(new Map<number, GraphPoint>());
    const dragDistanceRef = useRef(0);
    const pointerNodeRef = useRef<Element | null>(null);

    const updateView = useCallback((next: GraphViewport) => {
        viewRef.current = next;
        setView(next);
    }, []);
    const zoomBy = (factor: number) => {
        const box = viewportRef.current?.getBoundingClientRect();
        const anchor = { x: (box?.width ?? 600) / 2, y: (box?.height ?? 400) / 2 };
        updateView(zoomGraph(viewRef.current, factor, anchor));
    };

    useEffect(() => {
        const controller = new AbortController();
        const url = new URL(makeURL("/debug/profiler/" + sessionId + "/dot"));
        url.search = query;
        void (async () => {
            try {
                const response = await fetch(url.toString(), {
                    signal: controller.signal,
                    credentials: "omit",
                    referrerPolicy: "no-referrer",
                    headers: { Accept: "text/vnd.graphviz" },
                });
                if (!response.ok) {
                    throw new Error((await response.text()).trim() || "HTTP " + response.status);
                }
                const dot = await response.text();
                const nextSVG = await layoutDOT(dot);
                if (!controller.signal.aborted) {
                    setSVG(nextSVG);
                    setError("");
                    setLoading(false);
                }
            } catch (cause) {
                if (!controller.signal.aborted) {
                    setError(cause instanceof Error ? cause.message : String(cause));
                    setLoading(false);
                }
            }
        })();
        return () => controller.abort();
    }, [makeURL, query, sessionId]);

    useEffect(() => {
        const host = svgHost.current;
        if (!host || !svg) return;
        try {
            host.replaceChildren(parseSafeSVG(svg));
        } catch {
            host.replaceChildren();
        }
        return () => host.replaceChildren();
    }, [svg]);

    const applyFilters = () => {
        const params = new URLSearchParams(query);
        // Prefer official pprof URL keys; do not send conflicting aliases.
        params.delete("focus");
        params.delete("ignore");
        params.delete("nodecount");
        for (const [key, value] of [["f", focus], ["i", ignore], ["n", nodeCount]]) {
            if (value.trim()) params.set(key, value.trim());
            else params.delete(key);
        }
        const next = params.toString();
        setLoading(true);
        setQuery(next ? "?" + next : "");
    };
    const pointInViewport = (event: { clientX: number; clientY: number }): GraphPoint => {
        const rect = viewportRef.current!.getBoundingClientRect();
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        const pointers = pointersRef.current;
        pointers.set(event.pointerId, pointInViewport(event));
        if (pointers.size === 1) {
            dragDistanceRef.current = 0;
            pointerNodeRef.current = event.target instanceof Element
                ? event.target.closest("g.node") : null;
        } else {
            dragDistanceRef.current = Infinity;
            pointerNodeRef.current = null;
        }
        event.currentTarget.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
        const pointers = pointersRef.current;
        const previous = pointers.get(event.pointerId);
        if (!previous) return;
        const next = pointInViewport(event);
        if (pointers.size === 1) {
            const dx = next.x - previous.x;
            const dy = next.y - previous.y;
            dragDistanceRef.current += Math.hypot(dx, dy);
            if (dx || dy) updateView(panGraph(viewRef.current, dx, dy));
        } else if (pointers.size === 2) {
            const before = [...pointers.values()];
            pointers.set(event.pointerId, next);
            const after = [...pointers.values()];
            const distance = graphPointDistance(before[0], before[1]);
            if (distance > 1) {
                updateView(zoomGraph(
                    viewRef.current,
                    graphPointDistance(after[0], after[1]) / distance,
                    graphPointMiddle(before[0], before[1]),
                    graphPointMiddle(after[0], after[1]),
                ));
            }
            return;
        }
        pointers.set(event.pointerId, next);
    };
    const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
        const pointers = pointersRef.current;
        const isClick = pointers.size === 1 && dragDistanceRef.current < 6;
        pointers.delete(event.pointerId);
        if (isClick && pointerNodeRef.current) {
            const name = pointerNodeRef.current.querySelector("text")?.textContent?.trim();
            if (name) setFocus(name);
        }
        pointerNodeRef.current = null;
        if (pointers.size) dragDistanceRef.current = Infinity;
    };
    const onPointerCancel = (event: PointerEvent<HTMLDivElement>) => {
        pointersRef.current.delete(event.pointerId);
        pointerNodeRef.current = null;
        dragDistanceRef.current = Infinity;
    };
    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;
        // React delegates wheel listeners as passive on modern browsers.
        // A non-passive native listener is required for cursor-centered zoom
        // to prevent the outer page from scrolling/zooming at the same time.
        const onWheel = (event: globalThis.WheelEvent) => {
            event.preventDefault();
            const rect = viewport.getBoundingClientRect();
            const cursor = { x: event.clientX - rect.left, y: event.clientY - rect.top };
            // Trackpad pinch emits ctrl+wheel. Two-finger trackpad scroll pans.
            if (!event.ctrlKey && !event.metaKey && (Math.abs(event.deltaX) > 0 ||
                (event.deltaMode === 0 && Math.abs(event.deltaY) < 10))) {
                updateView(panGraph(viewRef.current, -event.deltaX, -event.deltaY));
            } else {
                const factor = Math.exp(-event.deltaY * (event.deltaMode === 1 ? 0.04 : 0.002));
                updateView(zoomGraph(viewRef.current, factor, cursor));
            }
        };
        viewport.addEventListener("wheel", onWheel, { passive: false });
        return () => viewport.removeEventListener("wheel", onWheel);
    }, [updateView]);

    return (
        <section className="flex h-full w-full min-w-0 min-h-[360px] flex-col overflow-hidden bg-ui-surface text-ui-fg" aria-label={t("profilerGraph")}>
            <div className="flex flex-wrap items-center gap-2 border-b border-ui-border px-3 py-2 sm:px-4 sm:py-3">
                <Button variant="outline-secondary" size="sm" onClick={() => onNavigate("flamegraph", query)}>
                    <ChevronLeft size={15} />{t("profilerGraphBack")}
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={() => onNavigate("top", query)}>Top</Button>
                <Button variant="outline-secondary" size="sm" onClick={() => onNavigate("peek", query)}>Peek</Button>
                <strong className="ml-auto text-sm text-ui-heading">{t("profilerGraph")}</strong>
            </div>
            <form className="flex flex-wrap items-end gap-2 border-b border-ui-border px-3 py-2 sm:gap-3 sm:px-4 sm:py-3"
                onSubmit={event => { event.preventDefault(); applyFilters(); }}>
                <label className="min-w-[135px] flex-1 text-xs text-ui-muted">
                    {t("profilerGraphFocus")}
                    <Input size="sm" className="mt-1" value={focus} onChange={event => setFocus(event.target.value)} />
                </label>
                <label className="min-w-[135px] flex-1 text-xs text-ui-muted">
                    {t("profilerGraphIgnore")}
                    <Input size="sm" className="mt-1" value={ignore} onChange={event => setIgnore(event.target.value)} />
                </label>
                <label className="w-24 sm:w-28 text-xs text-ui-muted">
                    {t("profilerGraphNodes")}
                    <Input size="sm" type="number" min="0" max="500" className="mt-1"
                        value={nodeCount} onChange={event => setNodeCount(event.target.value)} />
                </label>
                <Button variant="primary" size="sm" type="submit" disabled={loading}>{t("profilerGraphApply")}</Button>
            </form>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ui-border px-3 py-2 sm:px-4 text-xs text-ui-muted">
                <span>{t("profilerGraphHint")}</span>
                <div className="flex items-center gap-1">
                    <Button variant="outline-secondary" size="icon" title={t("profilerGraphZoomOut")} onClick={() => zoomBy(1 / 1.25)}><Minus size={15}/></Button>
                    <span className="w-14 text-center">{Math.round(view.scale * 100)}%</span>
                    <Button variant="outline-secondary" size="icon" title={t("profilerGraphZoomIn")} onClick={() => zoomBy(1.25)}><Plus size={15}/></Button>
                    <Button variant="outline-secondary" size="icon" title={t("profilerGraphZoomReset")} onClick={() => updateView(INITIAL_GRAPH_VIEW)}><RotateCcw size={15}/></Button>
                </div>
            </div>
            <div ref={viewportRef}
                className="relative min-h-[320px] flex-1 overflow-hidden bg-white text-slate-900 select-none cursor-grab active:cursor-grabbing"
                style={{ touchAction: "none" }}
                onPointerDown={onPointerDown} onPointerMove={onPointerMove}
                onPointerUp={onPointerUp} onPointerCancel={onPointerCancel}
                aria-label={t("profilerGraph")}>
                {loading && <div className="absolute inset-x-0 top-3 z-10 text-center text-sm text-slate-700" role="status">{t("profilerGraphRendering")}</div>}
                {error && <p role="alert" className="absolute inset-x-3 top-3 z-10 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                <div ref={svgHost}
                    className="absolute left-0 top-0"
                    style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
                        transformOrigin: "0 0", willChange: "transform" }} />
            </div>
        </section>
    );
}
