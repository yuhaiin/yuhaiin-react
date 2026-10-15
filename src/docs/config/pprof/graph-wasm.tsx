import { Button } from "@/component/v2/button";
import { Input } from "@/component/v2/input";
import { ChevronLeft, Minus, Plus, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";

// Lazily loaded, locally bundled by Vite. No CDN or system Graphviz process.
let rendererPromise: Promise<(dot: string) => string> | undefined;
function layoutDOT(dot: string): Promise<string> {
    rendererPromise ??= import("@hpcc-js/wasm-graphviz")
        .then(async ({ Graphviz }) => {
            const graphviz = await Graphviz.load();
            return (source: string) => graphviz.layout(source, "svg", "dot");
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
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    svg.style.maxWidth = "none";
    svg.style.height = "auto";
    svg.style.minWidth = "640px";
    return svg as SVGSVGElement;
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
    const [focus, setFocus] = useState(start.get("focus") ?? "");
    const [ignore, setIgnore] = useState(start.get("ignore") ?? "");
    const [nodeCount, setNodeCount] = useState(start.get("nodecount") ?? "");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [svg, setSVG] = useState("");
    const [zoom, setZoom] = useState(1);
    const svgHost = useRef<HTMLDivElement>(null);

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
        for (const [key, value] of [["focus", focus], ["ignore", ignore], ["nodecount", nodeCount]]) {
            if (value.trim()) params.set(key, value.trim());
            else params.delete(key);
        }
        const next = params.toString();
        setLoading(true);
        setQuery(next ? "?" + next : "");
    };
    const handleNode = (event: MouseEvent<HTMLDivElement>) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const node = target.closest("g.node");
        if (!node) return;
        const firstLine = node.querySelector("text")?.textContent?.trim();
        if (firstLine) setFocus(firstLine);
    };

    return (
        <section className="flex h-full min-h-[500px] flex-col bg-ui-surface text-ui-fg" aria-label={t("profilerGraph")}>
            <div className="flex flex-wrap items-center gap-2 border-b border-ui-border px-4 py-3">
                <Button variant="outline-secondary" size="sm" onClick={() => onNavigate("flamegraph", query)}>
                    <ChevronLeft size={15} />{t("profilerGraphBack")}
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={() => onNavigate("top", query)}>Top</Button>
                <Button variant="outline-secondary" size="sm" onClick={() => onNavigate("peek", query)}>Peek</Button>
                <strong className="ml-auto text-sm text-ui-heading">{t("profilerGraph")}</strong>
            </div>
            <form className="flex flex-wrap items-end gap-3 border-b border-ui-border px-4 py-3"
                onSubmit={event => { event.preventDefault(); applyFilters(); }}>
                <label className="min-w-[160px] flex-1 text-xs text-ui-muted">
                    {t("profilerGraphFocus")}
                    <Input size="sm" className="mt-1" value={focus} onChange={event => setFocus(event.target.value)} />
                </label>
                <label className="min-w-[160px] flex-1 text-xs text-ui-muted">
                    {t("profilerGraphIgnore")}
                    <Input size="sm" className="mt-1" value={ignore} onChange={event => setIgnore(event.target.value)} />
                </label>
                <label className="w-28 text-xs text-ui-muted">
                    {t("profilerGraphNodes")}
                    <Input size="sm" type="number" min="0" max="500" className="mt-1"
                        value={nodeCount} onChange={event => setNodeCount(event.target.value)} />
                </label>
                <Button variant="primary" size="sm" type="submit" disabled={loading}>{t("profilerGraphApply")}</Button>
            </form>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ui-border px-4 py-2 text-xs text-ui-muted">
                <span>{t("profilerGraphHint")}</span>
                <div className="flex items-center gap-1">
                    <Button variant="outline-secondary" size="icon" title={t("profilerGraphZoomOut")} onClick={() => setZoom(v => Math.max(0.2, v / 1.25))}><Minus size={15}/></Button>
                    <span className="w-14 text-center">{Math.round(zoom * 100)}%</span>
                    <Button variant="outline-secondary" size="icon" title={t("profilerGraphZoomIn")} onClick={() => setZoom(v => Math.min(5, v * 1.25))}><Plus size={15}/></Button>
                    <Button variant="outline-secondary" size="icon" title={t("profilerGraphZoomReset")} onClick={() => setZoom(1)}><RotateCcw size={15}/></Button>
                </div>
            </div>
            <div className="relative min-h-[420px] flex-1 overflow-auto bg-white p-5 text-slate-900">
                {loading && <div className="absolute inset-x-0 top-3 z-10 text-center text-sm text-slate-700" role="status">{t("profilerGraphRendering")}</div>}
                {error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                <div style={{ transform: "scale(" + zoom + ")", transformOrigin: "top left", width: "max-content" }}
                    onClick={handleNode} ref={svgHost} aria-label={t("profilerGraph")}/>
            </div>
        </section>
    );
}
