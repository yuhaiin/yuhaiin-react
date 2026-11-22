import { buildStrands, intensityFor, LANE_PX, normalsOf, resolveStrand, strandPoint, type FlowMapping, type FlowPath, type Strand, type StrandShape } from "./ribbons";

export interface RenderEdge {
    id: string;
    path: FlowPath;
    /** Path2D source, rebuilt only when the geometry changes. */
    d: string;
    dashed: boolean;
    /** Measured bytes per second towards the destination and back. */
    up: number;
    down: number;
    /** 0.14 dimmed by search or selection, 1 normal. */
    alpha: number;
    highlighted: boolean;
    /** Half-width of the edge's port slot (world units): its strands stay inside it. */
    spread: number;
    /** Part of the path (0..1) that may wave; bundle trunks before and after it run straight. Defaults to the whole path. */
    waveStart?: number;
    waveEnd?: number;
    /** Auxiliary DNS edges carry history counts, not live rates: never animated. */
    auxiliary?: { weight: number };
}

export interface Palette {
    /** Upload: arriving-end colours (two hues) and download: arriving-end colours. */
    up: string;
    upAlt: string;
    down: string;
    downAlt: string;
    /** The colour strands start from (blue between the two families). */
    flow: string;
    idle: string;
    edge: string;
    highlight: string;
    auxiliary: string;
    dark: boolean;
}

export interface View { x: number; y: number; k: number }

export interface RendererOptions {
    mapping: FlowMapping;
    fps: number;
    maxPixelRatio: number;
    requestFrame?: (callback: FrameRequestCallback) => number;
    cancelFrame?: (handle: number) => void;
    now?: () => number;
}

export interface RendererStats {
    strands: number;
    running: boolean;
    frames: number;
    lastDrawMs: number;
    maxDrawMs: number;
}

/** Edges get a soft halo only above this intensity (about 1 MB/s); slow paths never do. */
const GLOW_FROM = 0.68;
/**
 * Sheen: nested passes (half-length as a fraction of the strand, opacity),
 * widest first. Stacked, they form a soft bell of brightness that fades in
 * and out along the strand, at the strand's own width.
 */
const SHEEN: readonly (readonly [number, number])[] = [[0.22, 0.17], [0.1, 0.22]];
/** Strand width on screen (CSS px), dark and light; selected paths are a little wider. */
const STRAND_PX = { dark: 1.6, light: 1.7, selected: 2.2 };
/** Samples per strand; edge paths are sampled with the same count. */
const MAX_SAMPLES = 64;

interface EdgeGeometry { d: string; path: Path2D; normals: Float32Array }

/**
 * Draws edges as flowing ribbons on one canvas, independently of React.
 *
 * React hands over a new scene when the model changes (a few times a second
 * at most) and the view on pan/zoom. Strands, their gradients and the edge
 * normals are built then; per frame only strand points are computed, into
 * one reused buffer. One requestAnimationFrame loop at most, limited to
 * `fps` and timed from frame timestamps. It runs only while some edge has
 * traffic; hidden pages, pause and reduced motion stop it (the ribbons are
 * then drawn still), and `destroy` releases it.
 */
export class FlowRenderer {
    private readonly ctx: CanvasRenderingContext2D | null;
    private readonly options: RendererOptions;
    private edges: RenderEdge[] = [];
    private geometry = new Map<string, EdgeGeometry>();
    private edgeGeometry: (EdgeGeometry | undefined)[] = [];
    private strands: Strand[] = [];
    private gradients: (CanvasGradient | string)[] = [];
    private view: View = { x: 0, y: 0, k: 1 };
    private palette: Palette = { up: "gray", upAlt: "gray", down: "gray", downAlt: "gray", flow: "gray", idle: "gray", edge: "gray", highlight: "gray", auxiliary: "gray", dark: false };
    private width = 0;
    private height = 0;
    private ratio = 1;
    private handle = 0;
    private lastFrame = 0;
    private lastStep = 0;
    /** Animation clock in seconds; advances only while animating. */
    private clock = 0;
    private paused = false;
    private visible = true;
    private reducedMotion = false;
    private destroyed = false;
    private readonly scratch = new Float32Array(MAX_SAMPLES * 2);
    private readonly point = new Float32Array(2);
    private readonly shape: StrandShape = { lane: 0, amplitude: 0, phase: 0, waveStart: 0, waveEnd: 1 };
    /** Strands per edge, for the bundle's base band. */
    private edgeStrands: Uint8Array = new Uint8Array(0);
    private stats: RendererStats = { strands: 0, running: false, frames: 0, lastDrawMs: 0, maxDrawMs: 0 };

    constructor(private readonly canvas: HTMLCanvasElement, options: RendererOptions) {
        this.options = options;
        this.ctx = canvas.getContext("2d", { alpha: true });
    }

    private get requestFrame() { return this.options.requestFrame ?? window.requestAnimationFrame.bind(window); }
    private get cancelFrame() { return this.options.cancelFrame ?? window.cancelAnimationFrame.bind(window); }

    setScene(edges: RenderEdge[]) {
        this.edges = edges;
        const geometry = new Map<string, EdgeGeometry>();
        for (const edge of edges) {
            const cached = this.geometry.get(edge.id);
            geometry.set(edge.id, cached && cached.d === edge.d ? cached : {
                d: edge.d,
                path: typeof Path2D === "undefined" ? (undefined as never) : new Path2D(edge.d),
                normals: normalsOf(edge.path.points),
            });
        }
        this.geometry = geometry;
        this.edgeGeometry = edges.map(edge => geometry.get(edge.id));
        const animated = edges.map(edge => !edge.auxiliary);
        this.strands = buildStrands(edges.map(edge => edge.id), edges.map((edge, index) => ({
            up: edge.up, down: edge.down, length: edge.path.length, animated: animated[index],
        })), this.options.mapping);
        this.edgeStrands = new Uint8Array(edges.length);
        for (const strand of this.strands) this.edgeStrands[strand.edge] = strand.size;
        this.stats.strands = this.strands.length;
        this.buildGradients();
        this.schedule();
    }

    setView(view: View) {
        this.view = view;
        this.schedule();
    }

    setPalette(palette: Palette) {
        this.palette = palette;
        this.buildGradients();
        this.schedule();
    }

    setPaused(paused: boolean) {
        this.paused = paused;
        this.lastStep = 0;
        this.schedule();
    }

    setVisible(visible: boolean) {
        this.visible = visible;
        this.lastStep = 0;
        if (!visible) this.stop();
        else this.schedule();
    }

    setReducedMotion(reduced: boolean) {
        this.reducedMotion = reduced;
        this.lastStep = 0;
        this.schedule();
    }

    /** CSS pixel size; the backing store uses at most `maxPixelRatio`. */
    resize(width: number, height: number, devicePixelRatio: number) {
        this.width = Math.max(0, width);
        this.height = Math.max(0, height);
        this.ratio = Math.max(1, Math.min(this.options.maxPixelRatio, devicePixelRatio || 1));
        this.canvas.width = Math.round(this.width * this.ratio);
        this.canvas.height = Math.round(this.height * this.ratio);
        this.schedule();
    }

    getStats(): RendererStats {
        return { ...this.stats, running: this.handle !== 0 && this.animating() };
    }

    destroy() {
        this.destroyed = true;
        this.stop();
        this.edges = [];
        this.strands = [];
        this.gradients = [];
        this.geometry.clear();
    }

    /**
     * One gradient per strand, in world coordinates along its edge: it stays
     * valid through pan and zoom and is rebuilt only with the scene or theme.
     * Upload strands brighten towards the destination (blue -> teal/cyan),
     * download strands towards the source (violet/indigo), so an edge with
     * both reads violet on the source side and cyan on the destination side.
     */
    private buildGradients() {
        const ctx = this.ctx;
        const { flow, up, upAlt, down, downAlt } = this.palette;
        this.gradients = this.strands.map(strand => {
            const end = strand.tone === 0 ? (strand.hue ? upAlt : up) : (strand.hue ? downAlt : down);
            const points = this.edges[strand.edge].path.points;
            if (!ctx || points.length < 4) return end;
            const gradient = ctx.createLinearGradient(points[0], points[1], points[points.length - 2], points[points.length - 1]);
            if (strand.tone === 0) {
                gradient.addColorStop(0, flow);
                gradient.addColorStop(1, end);
            } else {
                gradient.addColorStop(0, end);
                gradient.addColorStop(1, flow);
            }
            return gradient;
        });
    }

    private animating() {
        return !this.paused && this.visible && !this.reducedMotion && this.strands.length > 0;
    }

    private stop() {
        if (this.handle) this.cancelFrame(this.handle);
        this.handle = 0;
    }

    /** At most one pending frame: the loop when animating, otherwise a single redraw. */
    private schedule() {
        if (this.destroyed || !this.visible || this.handle) return;
        this.handle = this.requestFrame(this.tick);
    }

    private tick = (now: number) => {
        this.handle = 0;
        if (this.destroyed || !this.visible) return;
        if (!this.animating()) {
            this.lastStep = 0;
            this.draw();
            return;
        }
        const interval = 1000 / this.options.fps;
        if (this.lastFrame && now - this.lastFrame < interval - 1) {
            this.handle = this.requestFrame(this.tick);
            return;
        }
        const dt = this.lastStep ? Math.min(0.1, Math.max(0, (now - this.lastStep) / 1000)) : 0;
        this.lastStep = now;
        this.lastFrame = now;
        this.clock += dt;
        this.draw();
        this.handle = this.requestFrame(this.tick);
    };

    private draw() {
        const ctx = this.ctx;
        if (!ctx) return;
        const started = this.options.now?.() ?? performance.now();
        const { x, y, k } = this.view;
        const { palette } = this;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.setTransform(this.ratio * k, 0, 0, this.ratio * k, this.ratio * x, this.ratio * y);
        // Butt caps and bevel joins: identical on thin strokes, cheaper to rasterize.
        ctx.lineCap = "butt";
        ctx.lineJoin = "bevel";
        // Widths are set in CSS px and converted to world units: lines never turn
        // sub-pixel when zoomed out, nor thick when zoomed in.
        const px = 1 / Math.max(0.05, k);

        // Spines: idle edges are a quiet static line; busy ones get a faint base band
        // under their strands (and a soft halo only when very busy).
        for (let index = 0; index < this.edges.length; index++) {
            const edge = this.edges[index];
            const geometry = this.edgeGeometry[index];
            if (!geometry) continue;
            if (edge.auxiliary) {
                ctx.globalAlpha = edge.alpha * (0.35 + 0.5 * edge.auxiliary.weight);
                ctx.strokeStyle = palette.auxiliary;
                ctx.lineWidth = (1 + 1.2 * edge.auxiliary.weight) * px;
                ctx.setLineDash([2 * px, 4 * px]);
                ctx.stroke(geometry.path);
                continue;
            }
            const intensity = intensityFor(edge.up + edge.down, this.options.mapping);
            const size = this.edgeStrands[index];
            const half = size > 1 ? Math.min(edge.spread, ((size - 1) / 2) * LANE_PX * px) : 0;
            ctx.setLineDash(edge.dashed ? [5 * px, 5 * px] : []);
            if (edge.highlighted) {
                ctx.globalAlpha = edge.alpha * 0.14;
                ctx.strokeStyle = palette.highlight;
                ctx.lineWidth = 2 * half + 10 * px;
                ctx.stroke(geometry.path);
            } else if (intensity > GLOW_FROM) {
                ctx.globalAlpha = edge.alpha * (intensity - GLOW_FROM) * (palette.dark ? 0.3 : 0.18);
                ctx.strokeStyle = palette.flow;
                ctx.lineWidth = 2 * half + (8 + 8 * intensity) * px;
                ctx.stroke(geometry.path);
            }
            if (size) {
                // The bundle's base band: binds its strands into one ribbon without hiding them.
                ctx.globalAlpha = edge.alpha * (palette.dark ? 0.08 : 0.07);
                ctx.strokeStyle = palette.flow;
                ctx.lineWidth = 2 * half + 3 * px;
                ctx.stroke(geometry.path);
            }
            ctx.globalAlpha = edge.alpha * (intensity > 0 ? 0.3 : 0.9);
            ctx.strokeStyle = intensity > 0 ? palette.edge : palette.idle;
            ctx.lineWidth = px;
            ctx.stroke(geometry.path);
        }
        ctx.setLineDash([]);

        const still = this.reducedMotion || this.paused;
        const time = this.clock;
        const points = this.scratch;
        const shape = this.shape;
        const strandWidth = (palette.dark ? STRAND_PX.dark : STRAND_PX.light) * px;
        for (let index = 0; index < this.strands.length; index++) {
            const strand = this.strands[index];
            const edge = this.edges[strand.edge];
            const geometry = this.edgeGeometry[strand.edge];
            if (!geometry) continue;
            resolveStrand(strand, k, edge.spread, edge.waveStart ?? 0, edge.waveEnd ?? 1, shape);
            const count = Math.min(MAX_SAMPLES, edge.path.points.length / 2);
            for (let sample = 0; sample < count; sample++) {
                strandPoint(strand, shape, edge.path, geometry.normals, sample, time, this.point);
                points[sample * 2] = this.point[0];
                points[sample * 2 + 1] = this.point[1];
            }
            // Uniform strokes; the bundle, not the width, gives the flow its weight.
            const width = edge.highlighted ? STRAND_PX.selected * px : strandWidth;
            ctx.globalAlpha = edge.alpha * Math.min(1, (palette.dark ? 0.55 : 0.62) + 0.4 * strand.intensity) * (edge.highlighted ? 1.15 : 1);
            ctx.strokeStyle = this.gradients[index];
            ctx.lineWidth = width;
            ctx.beginPath();
            ctx.moveTo(points[0], points[1]);
            for (let sample = 1; sample < count; sample++) ctx.lineTo(points[sample * 2], points[sample * 2 + 1]);
            ctx.stroke();
            if (still) continue;

            // Sheen: the strand's own colour brightens over a long stretch that drifts in
            // the direction of flow, fading in and out; no head, no dot, no change of width.
            const travel = (time * strand.sheen + strand.sheenPhase) % 1;
            const centre = (strand.tone === 0 ? travel : 1 - travel) * (count - 1);
            ctx.strokeStyle = strand.tone === 0 ? (strand.hue ? palette.upAlt : palette.up) : (strand.hue ? palette.downAlt : palette.down);
            for (const [reach, alpha] of SHEEN) {
                const from = Math.max(0, Math.round(centre - reach * count)), to = Math.min(count - 1, Math.round(centre + reach * count));
                if (to - from < 1) continue;
                ctx.globalAlpha = edge.alpha * alpha * (0.6 + 0.4 * strand.intensity);
                ctx.beginPath();
                ctx.moveTo(points[from * 2], points[from * 2 + 1]);
                for (let sample = from + 1; sample <= to; sample++) ctx.lineTo(points[sample * 2], points[sample * 2 + 1]);
                ctx.stroke();
            }
        }
        ctx.globalAlpha = 1;

        const elapsed = (this.options.now?.() ?? performance.now()) - started;
        this.stats.frames++;
        this.stats.lastDrawMs = elapsed;
        this.stats.maxDrawMs = Math.max(this.stats.maxDrawMs, elapsed);
    }
}
