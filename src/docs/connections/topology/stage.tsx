import { useTheme } from "@/common/ThemeProvider";
import { cn } from "@/component/v2/styles";
import { Tooltip } from "@/component/v2/tooltip";
import { Maximize, Minimize, Minus, Plus, RotateCcw, Scan } from "lucide-react";
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { FlowRenderer, type Palette, type View } from "./flow-renderer";
import type { Layout, PlacedNode } from "./layout";
import type { Column } from "./model";
import type { FlowMapping } from "./ribbons";
import type { Detail, Emphasis, SceneBundle, SceneEdge } from "./scene";
import { NodeCard } from "./node-card";
import styles from "./topology.module.css";

export type Selection = { type: "node"; id: string } | { type: "edge"; id: string } | { type: "bundle"; id: string } | null;

export interface StageHandle {
    fit: () => void;
    focus: (ids: Iterable<string>) => void;
    /** Pans (without zooming) so the nodes stay clear of a panel covering `right` pixels. */
    reveal: (ids: Iterable<string>, right: number) => void;
    /** Returns to the view before the last reveal, unless the user moved the view since. */
    restore: () => void;
}

interface StageProps {
    layout: Layout;
    /** Auxiliary DNS band, placed `dnsOffset` below the traffic graph. */
    dns?: { layout: Layout; offset: number; label: string };
    scene: SceneEdge[];
    /** Shared trunks of bundled edges, for hit testing and selection. */
    bundles: SceneBundle[];
    /** Called when the zoom crosses into another level of detail (with hysteresis). */
    onDetailChange: (detail: Detail) => void;
    emphasis: Emphasis | null;
    selection: Selection;
    paused: boolean;
    compact: boolean;
    mapping: FlowMapping;
    columnLabels: Record<Column, string>;
    fullscreenTarget: React.RefObject<HTMLElement | null>;
    onSelect: (selection: Selection) => void;
    children?: ReactNode;
}

const MIN_ZOOM = 0.2;

/**
 * Zoom -> level of detail, with hysteresis: entering a level needs a clearly
 * different zoom than leaving it, so small zoom changes never flip bundling
 * back and forth.
 */
export function detailFor(k: number, current: Detail): Detail {
    if (current === "detail") return k < 0.95 ? (k < 0.5 ? "far" : "normal") : "detail";
    if (current === "far") return k > 0.6 ? (k >= 1.05 ? "detail" : "normal") : "far";
    return k >= 1.05 ? "detail" : k < 0.5 ? "far" : "normal";
}
const MAX_ZOOM = 2.5;
const PADDING = 28;
const READABLE_ZOOM = 0.66;

/**
 * Theme colours for the canvas. The topology tokens are `color-mix()`es of the app's
 * theme colours, which Canvas 2D can't be relied on to parse, so each is resolved
 * through the browser first: as a computed colour, then as pixels, to a plain rgb().
 */
let probe: { element: HTMLElement; ctx: CanvasRenderingContext2D | null } | undefined;
function resolveColor(token: string) {
    const fallback = getComputedStyle(document.documentElement).getPropertyValue(token).trim() || "gray";
    if (!document.body) return fallback;
    if (!probe) {
        const element = document.createElement("span");
        element.setAttribute("aria-hidden", "true");
        element.style.display = "none";
        let ctx: CanvasRenderingContext2D | null = null;
        try {
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = 1;
            ctx = canvas.getContext("2d", { willReadFrequently: true });
        } catch { ctx = null; }
        probe = { element, ctx };
    }
    const { element, ctx } = probe;
    if (!element.isConnected) document.body.append(element);
    element.style.color = "";
    element.style.color = `var(${token})`;
    const computed = getComputedStyle(element).color || fallback;
    if (!ctx) return computed;
    try {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = "#000";
        ctx.fillStyle = computed;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
        return a === 0 ? computed : `rgb(${r} ${g} ${b})`;
    } catch {
        return computed;
    }
}

function readPalette(): Palette {
    const read = resolveColor;
    return {
        up: read("--topology-upload"),
        upAlt: read("--topology-upload-alt"),
        upHighlight: read("--topology-upload-highlight"),
        down: read("--topology-download"),
        downAlt: read("--topology-download-alt"),
        downHighlight: read("--topology-download-highlight"),
        flow: read("--topology-flow"),
        idle: read("--topology-edge-idle"),
        edge: read("--topology-edge-active"),
        highlight: read("--topology-edge-selected"),
        auxiliary: read("--topology-auxiliary"),
        dark: document.documentElement.dataset.bsTheme === "dark",
    };
}

function useReducedMotion() {
    const [reduced, setReduced] = useState(() => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
    useEffect(() => {
        const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
        if (!media) return;
        const update = () => setReduced(media.matches);
        media.addEventListener("change", update);
        return () => media.removeEventListener("change", update);
    }, []);
    return reduced;
}

export const TopologyStage = memo(forwardRef<StageHandle, StageProps>(function TopologyStage(props, ref) {
    const { layout, dns, scene, bundles, onDetailChange, emphasis, selection, paused, compact, mapping, columnLabels, fullscreenTarget, onSelect, children } = props;
    const { t } = useTranslation("topology");
    const { resolved, accent } = useTheme();
    const reducedMotion = useReducedMotion();
    const container = useRef<HTMLDivElement>(null);
    const world = useRef<HTMLDivElement>(null);
    const canvas = useRef<HTMLCanvasElement>(null);
    const renderer = useRef<FlowRenderer | null>(null);
    const view = useRef<View>({ x: PADDING, y: PADDING, k: 1 });
    const size = useRef({ width: 0, height: 0 });
    const moved = useRef(false);
    const fitted = useRef(false);
    const [fullscreen, setFullscreen] = useState(false);
    const worldWidth = layout.width;
    const worldHeight = dns ? dns.offset + dns.layout.height : layout.height;
    const bounds = useRef({ width: worldWidth, height: worldHeight });
    const motion = useRef({ paused, reducedMotion });
    useLayoutEffect(() => {
        bounds.current = { width: worldWidth, height: worldHeight };
        motion.current = { paused, reducedMotion };
    });

    const detail = useRef<Detail>("normal");
    const detailChanged = useRef(onDetailChange);
    useLayoutEffect(() => { detailChanged.current = onDetailChange; });
    const apply = useCallback(() => {
        const { x, y, k } = view.current;
        const next = detailFor(k, detail.current);
        if (next !== detail.current) {
            detail.current = next;
            detailChanged.current(next);
        }
        if (world.current) {
            world.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${k})`;
            world.current.dataset.lod = k < 0.5 ? "far" : k < 0.85 ? "mid" : "near";
        }
        if (container.current) {
            const step = 24 * k;
            container.current.style.backgroundSize = `${step}px ${step}px`;
            container.current.style.backgroundPosition = `${x}px ${y}px`;
        }
        renderer.current?.setView({ x, y, k });
    }, []);

    const beforeReveal = useRef<View | null>(null);
    const zoomAt = useCallback((factor: number, cx: number, cy: number) => {
        beforeReveal.current = null;
        const current = view.current;
        const k = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, current.k * factor));
        const ratio = k / current.k;
        view.current = { k, x: cx - (cx - current.x) * ratio, y: cy - (cy - current.y) * ratio };
        moved.current = true;
        apply();
    }, [apply]);

    const fitTo = useCallback((box: { x: number; y: number; width: number; height: number }, maxZoom = 1.1) => {
        const { width, height } = size.current;
        if (!width || !height || !box.width) return;
        const byWidth = Math.min(maxZoom, (width - PADDING * 2) / box.width);
        const byHeight = (height - PADDING * 2) / box.height;
        // Fitting a tall graph by height would shrink the cards unreadably: below
        // READABLE_ZOOM fit the width instead, top-aligned, and let the user pan down.
        let k = compact || Math.min(byWidth, byHeight) < READABLE_ZOOM ? byWidth : Math.min(byWidth, byHeight);
        k = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, k));
        const x = (width - box.width * k) / 2 - box.x * k;
        const y = box.height * k > height - PADDING * 2 ? PADDING - box.y * k : (height - box.height * k) / 2 - box.y * k;
        view.current = { x, y, k };
        apply();
    }, [apply, compact]);

    const fit = useCallback(() => {
        moved.current = false;
        beforeReveal.current = null;
        fitTo({ x: 0, y: 0, width: bounds.current.width, height: bounds.current.height });
    }, [fitTo]);

    const reset = useCallback(() => {
        moved.current = false;
        beforeReveal.current = null;
        view.current = { x: PADDING, y: PADDING, k: 1 };
        apply();
    }, [apply]);

    const tween = useRef(0);
    /** Where a running pan animation ends; a reveal during it restores to there, not mid-way. */
    const destination = useRef<View | null>(null);
    const panTo = useCallback((x: number, y: number) => {
        cancelAnimationFrame(tween.current);
        const from = { ...view.current };
        if (reducedMotion) {
            view.current = { ...from, x, y };
            destination.current = null;
            apply();
            return;
        }
        destination.current = { ...from, x, y };
        const started = performance.now();
        const step = (now: number) => {
            const t = Math.min(1, (now - started) / 220);
            const eased = 1 - (1 - t) ** 3;
            view.current = { ...view.current, x: from.x + (x - from.x) * eased, y: from.y + (y - from.y) * eased };
            apply();
            if (t < 1) tween.current = requestAnimationFrame(step);
            else destination.current = null;
        };
        tween.current = requestAnimationFrame(step);
    }, [apply, reducedMotion]);
    useEffect(() => () => cancelAnimationFrame(tween.current), []);

    const boxOf = useCallback((ids: Iterable<string>) => {
        const all = [...layout.nodes, ...(dns ? dns.layout.nodes.map(node => ({ ...node, y: node.y + dns.offset })) : [])];
        const placed = [...ids].map(id => all.find(node => node.node.id === id)).filter((node): node is PlacedNode => Boolean(node));
        if (!placed.length) return undefined;
        const { nodeWidth: w, nodeHeight: h } = layout.options;
        const minX = Math.min(...placed.map(node => node.x)), minY = Math.min(...placed.map(node => node.y));
        return { minX, minY, maxX: Math.max(...placed.map(node => node.x + w)), maxY: Math.max(...placed.map(node => node.y + h)) };
    }, [layout, dns]);

    useImperativeHandle(ref, () => ({
        reveal: (ids: Iterable<string>, right: number) => {
            const box = boxOf(ids);
            if (!box) return;
            const { x, y, k } = destination.current ?? view.current;
            const { width, height } = size.current;
            const margin = 24;
            let dx = 0, dy = 0;
            if (x + box.maxX * k > width - right - margin) dx = width - right - margin - (x + box.maxX * k);
            if (x + box.minX * k + dx < margin) dx = margin - (x + box.minX * k);
            if (y + box.maxY * k > height - margin) dy = height - margin - (y + box.maxY * k);
            if (y + box.minY * k + dy < margin) dy = margin - (y + box.minY * k);
            if (dx || dy) {
                beforeReveal.current ??= { ...(destination.current ?? view.current) };
                moved.current = true;
                panTo(x + dx, y + dy);
            }
        },
        restore: () => {
            const previous = beforeReveal.current;
            beforeReveal.current = null;
            if (previous) panTo(previous.x, previous.y);
        },
        fit,
        focus: (ids: Iterable<string>) => {
            const box = boxOf(ids);
            if (!box) return;
            moved.current = true;
            fitTo({ x: box.minX - 40, y: box.minY - 40, width: box.maxX - box.minX + 80, height: box.maxY - box.minY + 80 }, 1.2);
        },
    }), [fit, fitTo, boxOf, panTo]);

    // One renderer per mounted stage; destroyed (and its frame cancelled) on unmount.
    useEffect(() => {
        if (!canvas.current) return;
        const instance = new FlowRenderer(canvas.current, { mapping, fps: 30, maxPixelRatio: 2 });
        renderer.current = instance;
        instance.setPalette(readPalette());
        instance.setPaused(motion.current.paused);
        instance.setReducedMotion(motion.current.reducedMotion);
        instance.setVisible(document.visibilityState !== "hidden");
        if (size.current.width) instance.resize(size.current.width, size.current.height, window.devicePixelRatio);
        const onVisibility = () => instance.setVisible(document.visibilityState !== "hidden");
        document.addEventListener("visibilitychange", onVisibility);
        apply();
        return () => {
            document.removeEventListener("visibilitychange", onVisibility);
            instance.destroy();
            renderer.current = null;
        };
    }, [apply, mapping]);

    useEffect(() => {
        // Theme tokens resolve asynchronously after the data-bs-theme switch.
        const frame = requestAnimationFrame(() => renderer.current?.setPalette(readPalette()));
        return () => cancelAnimationFrame(frame);
    }, [resolved, accent]);

    useEffect(() => { renderer.current?.setPaused(paused); }, [paused]);
    useEffect(() => { renderer.current?.setReducedMotion(reducedMotion); }, [reducedMotion]);
    useEffect(() => { renderer.current?.setScene(scene.map(item => item.render)); }, [scene, mapping]);

    useEffect(() => {
        const element = container.current;
        if (!element) return;
        const observer = new ResizeObserver(() => {
            const rect = element.getBoundingClientRect();
            size.current = { width: rect.width, height: rect.height };
            renderer.current?.resize(rect.width, rect.height, window.devicePixelRatio);
            if (!moved.current) fit();
        });
        observer.observe(element);
        return () => observer.disconnect();
    }, [fit]);

    useEffect(() => {
        if (fitted.current || !layout.nodes.length || !size.current.width) return;
        fitted.current = true;
        fit();
    }, [layout, fit]);

    // Until the user moves the view, keep the whole graph framed as it grows or shrinks.
    useEffect(() => {
        if (fitted.current && !moved.current) fit();
    }, [worldWidth, worldHeight, fit]);

    // Wheel zoom needs a non-passive listener to keep the page from scrolling.
    useEffect(() => {
        const element = container.current;
        if (!element) return;
        const onWheel = (event: WheelEvent) => {
            event.preventDefault();
            const rect = element.getBoundingClientRect();
            const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
            zoomAt(Math.exp(-delta * 0.0015), event.clientX - rect.left, event.clientY - rect.top);
        };
        element.addEventListener("wheel", onWheel, { passive: false });
        return () => element.removeEventListener("wheel", onWheel);
    }, [zoomAt]);

    // Pan with one pointer, pinch with two. A drag never turns into a click.
    const pointers = useRef(new Map<number, { x: number; y: number }>());
    const gesture = useRef<{ dragged: boolean; distance: number }>({ dragged: false, distance: 0 });
    const onPointerDown = (event: React.PointerEvent) => {
        if (event.button !== 0 && event.pointerType === "mouse") return;
        pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (pointers.current.size === 1) gesture.current = { dragged: false, distance: 0 };
        if (pointers.current.size === 2) {
            const [a, b] = [...pointers.current.values()];
            gesture.current.distance = Math.hypot(a.x - b.x, a.y - b.y);
        }
    };
    const onPointerMove = (event: React.PointerEvent) => {
        const previous = pointers.current.get(event.pointerId);
        if (!previous || !container.current) return;
        const next = { x: event.clientX, y: event.clientY };
        if (pointers.current.size === 1) {
            const dx = next.x - previous.x, dy = next.y - previous.y;
            if (!gesture.current.dragged && Math.hypot(dx, dy) < 4) return;
            if (!gesture.current.dragged) {
                gesture.current.dragged = true;
                container.current.setPointerCapture(event.pointerId);
            }
            pointers.current.set(event.pointerId, next);
            view.current = { ...view.current, x: view.current.x + dx, y: view.current.y + dy };
            moved.current = true;
            beforeReveal.current = null;
            apply();
            return;
        }
        pointers.current.set(event.pointerId, next);
        if (pointers.current.size === 2) {
            const [a, b] = [...pointers.current.values()];
            const distance = Math.hypot(a.x - b.x, a.y - b.y);
            const rect = container.current.getBoundingClientRect();
            if (gesture.current.distance > 0) zoomAt(distance / gesture.current.distance, (a.x + b.x) / 2 - rect.left, (a.y + b.y) / 2 - rect.top);
            gesture.current = { dragged: true, distance };
        }
    };
    const onPointerUp = (event: React.PointerEvent) => {
        pointers.current.delete(event.pointerId);
        if (pointers.current.size < 2) gesture.current.distance = 0;
    };
    const onClickCapture = (event: React.MouseEvent) => {
        if (gesture.current.dragged) {
            event.stopPropagation();
            event.preventDefault();
            gesture.current.dragged = false;
        }
    };
    const onKeyDown = (event: React.KeyboardEvent) => {
        if (event.target !== container.current) return;
        const { width, height } = size.current;
        const pan = (dx: number, dy: number) => { view.current = { ...view.current, x: view.current.x + dx, y: view.current.y + dy }; moved.current = true; beforeReveal.current = null; apply(); };
        switch (event.key) {
            case "+": case "=": zoomAt(1.2, width / 2, height / 2); break;
            case "-": case "_": zoomAt(1 / 1.2, width / 2, height / 2); break;
            case "0": fit(); break;
            case "ArrowLeft": pan(60, 0); break;
            case "ArrowRight": pan(-60, 0); break;
            case "ArrowUp": pan(0, 60); break;
            case "ArrowDown": pan(0, -60); break;
            case "Escape": onSelect(null); break;
            default: return;
        }
        event.preventDefault();
    };

    useEffect(() => {
        const update = () => setFullscreen(document.fullscreenElement === fullscreenTarget.current && document.fullscreenElement !== null);
        document.addEventListener("fullscreenchange", update);
        return () => document.removeEventListener("fullscreenchange", update);
    }, [fullscreenTarget]);
    const canFullscreen = typeof document !== "undefined" && Boolean(document.fullscreenEnabled);
    const toggleFullscreen = () => {
        if (document.fullscreenElement) void document.exitFullscreen();
        else void fullscreenTarget.current?.requestFullscreen?.();
    };

    const selectedNode = selection?.type === "node" ? selection.id : undefined;
    const selectedEdge = selection?.type === "edge" ? selection.id : undefined;
    const { nodeWidth: w, nodeHeight: h } = layout.options;

    return (
        <div
            ref={container}
            className={cn(styles.stage, "relative min-h-0 flex-1 touch-none select-none overflow-hidden outline-none")}
            tabIndex={0}
            role="application"
            aria-label={t("stage.label")}
            aria-roledescription={t("stage.role")}
            data-no-pull-refresh
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onClickCapture={onClickCapture}
            onClick={event => { if (event.target === container.current || event.target === world.current) onSelect(null); }}
            onKeyDown={onKeyDown}
        >
            <canvas ref={canvas} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" />
            <div ref={world} className={styles.world} style={{ width: worldWidth, height: worldHeight }}>
                {layout.columns.map(frame => (
                    <div key={frame.column} className={styles.columnHeader} style={{ transform: `translate(${frame.x}px, ${frame.y}px)`, width: frame.width }}>
                        <span className="truncate">{columnLabels[frame.column]}</span>
                        <span className="font-mono tabular-nums text-ui-tertiary">{frame.count}</span>
                    </div>
                ))}
                {dns && (
                    <div className={styles.bandHeader} style={{ transform: `translate(0px, ${dns.offset - 34}px)`, width: worldWidth }}>
                        <span>{dns.label}</span>
                    </div>
                )}
                {dns?.layout.columns.map(frame => (
                    <div key={`dns-${frame.column}`} className={styles.columnHeader} style={{ transform: `translate(${frame.x}px, ${dns.offset + frame.y}px)`, width: frame.width }}>
                        <span className="truncate">{t(`dnsColumns.${frame.column}`)}</span>
                        <span className="font-mono tabular-nums text-ui-tertiary">{frame.count}</span>
                    </div>
                ))}
                <svg className={styles.hitLayer} width={worldWidth} height={worldHeight} aria-hidden="true">
                    {scene.filter(item => item.interactive !== false).map(item => (
                        <path
                            key={item.edge.id}
                            data-edge-id={item.edge.id}
                            d={item.d}
                            className={cn(styles.hitPath, selectedEdge === item.edge.id && styles.hitPathSelected)}
                            onClick={event => { event.stopPropagation(); onSelect({ type: "edge", id: item.edge.id }); }}
                        />
                    ))}
                    {bundles.map(bundle => (
                        <path
                            key={bundle.id}
                            data-bundle-id={bundle.id}
                            d={bundle.d}
                            className={cn(styles.hitBundle, selection?.type === "bundle" && selection.id === bundle.id && styles.hitPathSelected)}
                            style={{ strokeWidth: bundle.width }}
                            onClick={event => { event.stopPropagation(); onSelect({ type: "bundle", id: bundle.id }); }}
                        />
                    ))}
                </svg>
                {layout.nodes.map(placed => (
                    <NodeCard key={placed.node.id} placed={placed} width={w} height={h} compact={compact}
                        selected={selectedNode === placed.node.id}
                        dimmed={Boolean(emphasis && !emphasis.nodes.has(placed.node.id))}
                        onSelect={onSelect} />
                ))}
                {dns?.layout.nodes.map(placed => (
                    <NodeCard key={placed.node.id} placed={placed} offsetY={dns.offset} width={dns.layout.options.nodeWidth} height={dns.layout.options.nodeHeight} compact={compact}
                        selected={selectedNode === placed.node.id}
                        dimmed={Boolean(emphasis && !emphasis.nodes.has(placed.node.id))}
                        onSelect={onSelect} />
                ))}
            </div>

            <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-end justify-between gap-3">
                <Legend compact={compact} />
                <div className={cn(styles.controls, "pointer-events-auto")} role="toolbar" aria-label={t("controls.label")}>
                    <ControlButton label={t("controls.zoomIn")} onClick={() => zoomAt(1.25, size.current.width / 2, size.current.height / 2)}><Plus size={16} /></ControlButton>
                    <ControlButton label={t("controls.zoomOut")} onClick={() => zoomAt(0.8, size.current.width / 2, size.current.height / 2)}><Minus size={16} /></ControlButton>
                    <ControlButton label={t("controls.fit")} onClick={fit}><Scan size={16} /></ControlButton>
                    {!compact && <ControlButton label={t("controls.reset")} onClick={reset}><RotateCcw size={16} /></ControlButton>}
                    {canFullscreen && (
                        <ControlButton label={fullscreen ? t("controls.exitFullscreen") : t("controls.fullscreen")} onClick={toggleFullscreen}>
                            {fullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                        </ControlButton>
                    )}
                </div>
            </div>
            {children}
        </div>
    );
}));

function ControlButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
    return (
        <Tooltip content={label}>
            <button type="button" aria-label={label} className={styles.controlButton} onClick={event => { event.stopPropagation(); onClick(); }}>
                {children}
            </button>
        </Tooltip>
    );
}

function Legend({ compact }: { compact: boolean }) {
    const { t } = useTranslation("topology");
    return (
        <div className={cn(styles.legend, "pointer-events-auto")} aria-label={t("legend.label")}>
            <span className="inline-flex items-center gap-1.5"><span className={cn(styles.swatch, styles.swatchUp)} />{t("legend.upload")}</span>
            <span className="inline-flex items-center gap-1.5"><span className={cn(styles.swatch, styles.swatchDown)} />{t("legend.download")}</span>
            {!compact && <span className="inline-flex items-center gap-1.5"><span className={styles.lineTcp} />TCP</span>}
            {!compact && <span className="inline-flex items-center gap-1.5"><span className={styles.lineUdp} />UDP</span>}
        </div>
    );
}
