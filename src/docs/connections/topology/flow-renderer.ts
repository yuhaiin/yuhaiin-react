import { animatedWithinBudget, HIGHLIGHT_PERIOD_PX, phaseOf, RIBBON_PX, ribbonStyle, type FlowMapping, type RibbonStyle } from "./ribbons";

export interface RenderEdge {
    id: string;
    /** The drawn ribbon's centre line (SVG path syntax), built only when the geometry changes. */
    d: string;
    /** Start and end of the drawn centre line (x0, y0, x1, y1), for the ribbon's colour gradient. */
    ends: [number, number, number, number];
    /** Phones lay the topology out top to bottom: highlights then travel along y. */
    vertical: boolean;
    /** Length of the edge (world units). */
    length: number;
    dashed: boolean;
    /** Measured bytes per second towards the destination and back. */
    up: number;
    down: number;
    /** 0.14 dimmed by search or selection, 1 normal. */
    alpha: number;
    highlighted: boolean;
    /** Auxiliary DNS edges carry history counts, not live rates: never animated. */
    auxiliary?: { weight: number };
}

export interface Palette {
    /** Upload: arriving-end colours (two hues); download: arriving-end colours. */
    up: string;
    upAlt: string;
    down: string;
    downAlt: string;
    /** The colour between the two families (blue). */
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
    /** Ribbons with traffic, and those of them animated (within the budget). */
    ribbons: number;
    animated: number;
    running: boolean;
    frames: number;
    lastDrawMs: number;
    maxDrawMs: number;
}

/** Share of a highlight period the soft band occupies. */
const BAND_WIDTH = 0.34;

interface Ribbon {
    path: Path2D;
    style: RibbonStyle;
    phase: number;
    animated: boolean;
    gradient: CanvasGradient | string;
}

/**
 * Draws edges as single ribbons on one canvas, independently of React.
 *
 * React hands over a new scene when the model changes (a few times a second
 * at most) and the view on pan/zoom. Ribbon paths, styles and colour
 * gradients are built then; the shape never changes between scenes. Per
 * frame, only the transform of two pre-rendered highlight patterns moves, so
 * a soft band of light travels along each ribbon in the direction of flow.
 * One requestAnimationFrame loop at most, limited to `fps`, timed from frame
 * timestamps; it runs only while some ribbon carries traffic. Hidden pages,
 * pause and reduced motion stop it (ribbons are then drawn still), and
 * `destroy` releases it.
 */
export class FlowRenderer {
    private readonly ctx: CanvasRenderingContext2D | null;
    private readonly options: RendererOptions;
    private edges: RenderEdge[] = [];
    private ribbons: Ribbon[] = [];
    private cache = new Map<string, { d: string; path: Path2D }>();
    private patterns: [CanvasPattern | null, CanvasPattern | null] = [null, null];
    /** Reused for every pattern transform. */
    private readonly matrix = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
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
    private stats: RendererStats = { ribbons: 0, animated: 0, running: false, frames: 0, lastDrawMs: 0, maxDrawMs: 0 };

    constructor(private readonly canvas: HTMLCanvasElement, options: RendererOptions) {
        this.options = options;
        this.ctx = canvas.getContext("2d", { alpha: true });
    }

    private get requestFrame() { return this.options.requestFrame ?? window.requestAnimationFrame.bind(window); }
    private get cancelFrame() { return this.options.cancelFrame ?? window.cancelAnimationFrame.bind(window); }

    setScene(edges: RenderEdge[]) {
        this.edges = edges;
        const cache = new Map<string, { d: string; path: Path2D }>();
        for (const edge of edges) {
            const cached = this.cache.get(edge.id);
            cache.set(edge.id, cached && cached.d === edge.d ? cached : { d: edge.d, path: typeof Path2D === "undefined" ? (undefined as never) : new Path2D(edge.d) });
        }
        this.cache = cache;
        const styles = edges.map(edge => edge.auxiliary ? ribbonStyle(0, 0, this.options.mapping) : ribbonStyle(edge.up, edge.down, this.options.mapping));
        const animated = animatedWithinBudget(styles, this.options.mapping);
        this.ribbons = edges.map((edge, index) => ({
            path: cache.get(edge.id)!.path, style: styles[index], phase: phaseOf(edge.id), animated: animated.has(index), gradient: "gray",
        }));
        this.stats.ribbons = styles.filter(style => style.intensity > 0).length;
        this.stats.animated = animated.size;
        this.buildGradients();
        this.schedule();
    }

    setView(view: View) {
        this.view = view;
        this.schedule();
    }

    setPalette(palette: Palette) {
        this.palette = palette;
        this.patterns = [this.pattern(palette.up), this.pattern(palette.down)];
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
        this.ribbons = [];
        this.cache.clear();
    }

    /**
     * One gradient per ribbon in world coordinates along its edge, valid
     * through pan and zoom, rebuilt only with the scene or theme. Download
     * arrives at the source (violet there), upload at the destination
     * (cyan/teal there), with blue in between: an edge carrying both reads
     * violet -> blue -> cyan; one direction only leans to its own family.
     */
    private buildGradients() {
        const ctx = this.ctx;
        const { flow, up, upAlt, down, downAlt } = this.palette;
        this.edges.forEach((edge, index) => {
            const ribbon = this.ribbons[index];
            if (!ribbon || ribbon.style.intensity === 0) return;
            const start = edge.down > 0 ? down : flow;
            const end = edge.up > 0 ? up : downAlt;
            if (!ctx) {
                ribbon.gradient = end;
                return;
            }
            const [x0, y0, x1, y1] = edge.ends;
            const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
            gradient.addColorStop(0, start);
            gradient.addColorStop(0.5, edge.up > 0 && edge.down > 0 ? flow : edge.up > 0 ? upAlt : downAlt);
            gradient.addColorStop(1, end);
            ribbon.gradient = gradient;
        });
    }

    /**
     * One period of the travelling highlight: a soft band of the tone that
     * fades in and out, transparent elsewhere. It is stroked over the ribbon
     * at the ribbon's own width, so it reads as the ribbon brightening, never
     * as a dot or a head.
     */
    private pattern(color: string): CanvasPattern | null {
        if (typeof document === "undefined" || !this.ctx) return null;
        const canvas = document.createElement("canvas");
        canvas.width = HIGHLIGHT_PERIOD_PX;
        canvas.height = 2;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const fade = ctx.createLinearGradient(0, 0, canvas.width, 0);
        fade.addColorStop(0, "transparent");
        fade.addColorStop(0.5 - BAND_WIDTH / 2, "transparent");
        fade.addColorStop(0.5, "black");
        fade.addColorStop(0.5 + BAND_WIDTH / 2, "transparent");
        fade.addColorStop(1, "transparent");
        ctx.globalCompositeOperation = "destination-in";
        ctx.fillStyle = fade;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return this.ctx.createPattern(canvas, "repeat");
    }

    private animating() {
        return !this.paused && this.visible && !this.reducedMotion && this.stats.animated > 0;
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

    /** Moves a highlight pattern along the flow: bands sized in CSS px, `distance` CSS px travelled. */
    private placePattern(pattern: CanvasPattern, vertical: boolean, distance: number, k: number) {
        const scale = 1 / Math.max(0.05, k);
        const matrix = this.matrix;
        if (vertical) {
            matrix.a = 0; matrix.b = scale; matrix.c = 1; matrix.d = 0; matrix.e = 0; matrix.f = distance * scale;
        } else {
            matrix.a = scale; matrix.b = 0; matrix.c = 0; matrix.d = 1; matrix.e = distance * scale; matrix.f = 0;
        }
        pattern.setTransform?.(matrix);
    }

    private draw() {
        const ctx = this.ctx;
        if (!ctx) return;
        const started = this.options.now?.() ?? performance.now();
        const { x, y, k } = this.view;
        const { palette } = this;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.setTransform(this.ratio * k, 0, 0, this.ratio * k, this.ratio * x, this.ratio * y);
        // Butt caps meet cards and trunks squarely; round joins keep each curve one smooth shape.
        ctx.lineCap = "butt";
        ctx.lineJoin = "round";
        // Widths are set in CSS px and converted to world units.
        const px = 1 / Math.max(0.05, k);
        const moving = !(this.reducedMotion || this.paused);
        const time = this.clock;

        for (let index = 0; index < this.edges.length; index++) {
            const edge = this.edges[index];
            const ribbon = this.ribbons[index];
            if (!ribbon) continue;
            if (edge.auxiliary) {
                ctx.globalAlpha = edge.alpha * (0.35 + 0.5 * edge.auxiliary.weight);
                ctx.strokeStyle = palette.auxiliary;
                ctx.lineWidth = (1 + 1.2 * edge.auxiliary.weight) * px;
                ctx.setLineDash([2 * px, 4 * px]);
                ctx.stroke(ribbon.path);
                continue;
            }
            const style = ribbon.style;
            // UDP keeps its dashed look: long soft dashes on a ribbon, short ones on an idle line.
            ctx.setLineDash(edge.dashed ? (style.intensity > 0 ? [12 * px, 5 * px] : [5 * px, 5 * px]) : []);
            if (style.intensity === 0) {
                ctx.globalAlpha = edge.alpha * 0.9;
                ctx.strokeStyle = edge.highlighted ? palette.highlight : palette.idle;
                ctx.lineWidth = (edge.highlighted ? 1.6 : RIBBON_PX.idle) * px;
                ctx.stroke(ribbon.path);
                continue;
            }
            const width = (style.width + (edge.highlighted ? RIBBON_PX.selectedExtra : 0)) * px;
            // The ribbon itself: one continuous shape with a soft colour gradient along it.
            ctx.globalAlpha = edge.alpha * Math.min(1, style.alpha * (palette.dark ? 1 : 1.1) + (edge.highlighted ? 0.12 : 0));
            ctx.strokeStyle = ribbon.gradient;
            ctx.lineWidth = width;
            ctx.stroke(ribbon.path);
            if (!moving || !ribbon.animated) continue;
            // The flow: a long, soft band of brightness travelling in each active direction.
            for (let tone = 0; tone < 2; tone++) {
                const pattern = this.patterns[tone];
                const speed = tone === 0 ? style.upSpeed : style.downSpeed;
                if (!pattern || speed === 0) continue;
                const direction = tone === 0 ? 1 : -1;
                this.placePattern(pattern, edge.vertical, direction * (speed * time + ribbon.phase * HIGHLIGHT_PERIOD_PX), k);
                ctx.globalAlpha = edge.alpha * (tone === 0 ? style.upGlow : style.downGlow) * (palette.dark ? 1 : 0.85);
                ctx.strokeStyle = pattern;
                ctx.stroke(ribbon.path);
            }
        }
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;

        const elapsed = (this.options.now?.() ?? performance.now()) - started;
        this.stats.frames++;
        this.stats.lastDrawMs = elapsed;
        this.stats.maxDrawMs = Math.max(this.stats.maxDrawMs, elapsed);
    }
}
