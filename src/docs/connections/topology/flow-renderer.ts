import { intensityFor, ParticleSystem, pointOnLane, type FlowMapping, type LaneInput, type ParticlePath } from "./particles";

export interface RenderEdge {
    id: string;
    path: ParticlePath;
    /** Path2D source, rebuilt only when the geometry changes. */
    d: string;
    dashed: boolean;
    /** Measured bytes per second towards the destination and back. */
    up: number;
    down: number;
    /** 0.15 dimmed by search, 1 normal. */
    alpha: number;
    highlighted: boolean;
    /** Auxiliary DNS edges carry history counts, not live rates: never animated. */
    auxiliary?: { weight: number };
}

export interface Palette {
    up: string;
    down: string;
    idle: string;
    edge: string;
    highlight: string;
    auxiliary: string;
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
    particles: number;
    lanes: number;
    running: boolean;
    frames: number;
    lastDrawMs: number;
    maxDrawMs: number;
}

/** Distance between the upload and download lanes of one edge. */
const LANE_OFFSET = 2.2;
const SPRITE = 24;

/**
 * Draws edges and particles on one canvas, independently of React.
 *
 * React hands over a new scene when the model changes (a few times a second
 * at most) and the view on pan/zoom. Everything per-frame happens here: one
 * requestAnimationFrame loop at most, limited to `fps`, timed from the
 * frame timestamps rather than a fixed step. The loop runs only while
 * particles exist or a lane has traffic; otherwise the canvas is redrawn
 * once per change and then sits idle. Hidden pages, pause and reduced motion
 * stop it, and `destroy` releases it.
 */
export class FlowRenderer {
    private readonly ctx: CanvasRenderingContext2D | null;
    readonly system: ParticleSystem;
    private readonly options: RendererOptions;
    private edges: RenderEdge[] = [];
    private paths = new Map<string, { d: string; path: Path2D }>();
    private laneTone: Uint8Array = new Uint8Array(0);
    private laneAlpha: Float32Array = new Float32Array(0);
    private view: View = { x: 0, y: 0, k: 1 };
    private palette: Palette = { up: "gray", down: "gray", idle: "gray", edge: "gray", highlight: "gray", auxiliary: "gray" };
    private sprites: [HTMLCanvasElement | null, HTMLCanvasElement | null] = [null, null];
    private width = 0;
    private height = 0;
    private ratio = 1;
    private handle = 0;
    private lastFrame = 0;
    private lastStep = 0;
    private paused = false;
    private visible = true;
    private reducedMotion = false;
    private destroyed = false;
    private point = new Float32Array(2);
    private stats: RendererStats = { particles: 0, lanes: 0, running: false, frames: 0, lastDrawMs: 0, maxDrawMs: 0 };

    constructor(private readonly canvas: HTMLCanvasElement, options: RendererOptions) {
        this.options = options;
        this.ctx = canvas.getContext("2d", { alpha: true });
        this.system = new ParticleSystem(options.mapping);
    }

    private get requestFrame() { return this.options.requestFrame ?? window.requestAnimationFrame.bind(window); }
    private get cancelFrame() { return this.options.cancelFrame ?? window.cancelAnimationFrame.bind(window); }

    setScene(edges: RenderEdge[]) {
        this.edges = edges;
        const paths = new Map<string, { d: string; path: Path2D }>();
        for (const edge of edges) {
            const cached = this.paths.get(edge.id);
            paths.set(edge.id, cached && cached.d === edge.d ? cached : { d: edge.d, path: typeof Path2D === "undefined" ? (undefined as never) : new Path2D(edge.d) });
        }
        this.paths = paths;
        const lanes: LaneInput[] = [];
        for (const edge of edges) {
            if (edge.auxiliary) continue;
            lanes.push({ key: `${edge.id}:u`, path: edge.path, direction: 1, offset: -LANE_OFFSET, rate: edge.up, tone: 0, alpha: edge.alpha });
            lanes.push({ key: `${edge.id}:d`, path: edge.path, direction: -1, offset: LANE_OFFSET, rate: edge.down, tone: 1, alpha: edge.alpha });
        }
        this.system.setLanes(lanes);
        this.laneTone = Uint8Array.from(lanes, lane => lane.tone);
        this.laneAlpha = Float32Array.from(lanes, lane => lane.alpha);
        this.stats.lanes = lanes.length;
        this.schedule();
    }

    setView(view: View) {
        this.view = view;
        this.schedule();
    }

    setPalette(palette: Palette) {
        this.palette = palette;
        this.sprites = [this.sprite(palette.up), this.sprite(palette.down)];
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
        if (reduced) this.system.clear();
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
        return { ...this.stats, particles: this.system.count, running: this.handle !== 0 && this.animating() };
    }

    destroy() {
        this.destroyed = true;
        this.stop();
        this.system.clear();
        this.edges = [];
        this.paths.clear();
    }

    private animating() {
        return !this.paused && this.visible && !this.reducedMotion && this.system.active();
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
        this.system.step(dt);
        this.draw();
        if (this.animating()) this.handle = this.requestFrame(this.tick);
        else {
            this.lastStep = 0;
            // One more frame clears the last faded particles.
            this.handle = this.requestFrame(this.tick);
        }
    };

    private sprite(color: string): HTMLCanvasElement | null {
        if (typeof document === "undefined") return null;
        const canvas = document.createElement("canvas");
        canvas.width = SPRITE;
        canvas.height = SPRITE;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;
        // Solid color masked by a radial falloff: a bright core and a soft halo.
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, SPRITE, SPRITE);
        const mask = ctx.createRadialGradient(SPRITE / 2, SPRITE / 2, 0, SPRITE / 2, SPRITE / 2, SPRITE / 2);
        mask.addColorStop(0, "black");
        mask.addColorStop(0.26, "black");
        mask.addColorStop(1, "transparent");
        ctx.globalCompositeOperation = "destination-in";
        ctx.fillStyle = mask;
        ctx.fillRect(0, 0, SPRITE, SPRITE);
        return canvas;
    }

    private draw() {
        const ctx = this.ctx;
        if (!ctx) return;
        const started = this.options.now?.() ?? performance.now();
        const { x, y, k } = this.view;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.setTransform(this.ratio * k, 0, 0, this.ratio * k, this.ratio * x, this.ratio * y);
        ctx.lineCap = "round";
        const still = this.reducedMotion || this.paused;

        for (const edge of this.edges) {
            const cached = this.paths.get(edge.id);
            if (!cached) continue;
            if (edge.auxiliary) {
                ctx.globalAlpha = edge.alpha * (0.35 + 0.5 * edge.auxiliary.weight);
                ctx.strokeStyle = this.palette.auxiliary;
                ctx.lineWidth = 1 + 2 * edge.auxiliary.weight;
                ctx.setLineDash([2, 4]);
                ctx.stroke(cached.path);
                continue;
            }
            const intensity = intensityFor(edge.up + edge.down, this.system.mapping);
            ctx.setLineDash(edge.dashed ? [5, 5] : []);
            if (intensity > 0) {
                // A wide, faint stroke in the dominant direction's tone under the line.
                ctx.globalAlpha = edge.alpha * (0.06 + 0.16 * intensity);
                ctx.strokeStyle = edge.up >= edge.down ? this.palette.up : this.palette.down;
                ctx.lineWidth = 6 + 8 * intensity;
                ctx.stroke(cached.path);
            }
            ctx.globalAlpha = edge.alpha * (intensity > 0 ? 0.45 + 0.45 * intensity : 0.55);
            ctx.strokeStyle = edge.highlighted ? this.palette.highlight : intensity > 0 ? this.palette.edge : this.palette.idle;
            ctx.lineWidth = edge.highlighted ? 2.4 : intensity > 0 ? 1.2 + 1.8 * intensity : 1;
            ctx.stroke(cached.path);
            if (still) this.drawChevrons(ctx, edge);
        }
        ctx.setLineDash([]);

        const system = this.system;
        const size = 7 + 3 / Math.max(0.6, k);
        for (let index = 0; index < system.count; index++) {
            const laneIndex = system.lane[index];
            const lane = system.lanes[laneIndex];
            const sprite = this.sprites[this.laneTone[laneIndex]];
            if (!sprite) continue;
            pointOnLane(lane, system.distance[index], this.point);
            ctx.globalAlpha = Math.max(0, system.alpha[index]) * this.laneAlpha[laneIndex];
            ctx.drawImage(sprite, this.point[0] - size / 2, this.point[1] - size / 2, size, size);
        }
        ctx.globalAlpha = 1;

        const elapsed = (this.options.now?.() ?? performance.now()) - started;
        this.stats.frames++;
        this.stats.lastDrawMs = elapsed;
        this.stats.maxDrawMs = Math.max(this.stats.maxDrawMs, elapsed);
    }

    /** Static direction marks for reduced motion and pause: no movement, same information. */
    private drawChevrons(ctx: CanvasRenderingContext2D, edge: RenderEdge) {
        for (const [rate, direction, color, offset] of [[edge.up, 1, this.palette.up, -LANE_OFFSET * 2], [edge.down, -1, this.palette.down, LANE_OFFSET * 2]] as const) {
            if (!(rate > 0)) continue;
            const intensity = intensityFor(rate, this.system.mapping);
            ctx.globalAlpha = edge.alpha * (0.5 + 0.5 * intensity);
            ctx.fillStyle = color;
            const lane = { path: edge.path, direction: direction as 1 | -1, offset };
            for (const fraction of [0.3, 0.55, 0.8]) {
                const distance = edge.path.length * fraction;
                pointOnLane(lane, distance, this.point);
                const ax = this.point[0], ay = this.point[1];
                pointOnLane(lane, Math.min(edge.path.length, distance + 1), this.point);
                const angle = Math.atan2(this.point[1] - ay, this.point[0] - ax);
                const s = 3 + 2 * intensity;
                ctx.beginPath();
                ctx.moveTo(ax + Math.cos(angle) * s, ay + Math.sin(angle) * s);
                ctx.lineTo(ax + Math.cos(angle + 2.5) * s, ay + Math.sin(angle + 2.5) * s);
                ctx.lineTo(ax + Math.cos(angle - 2.5) * s, ay + Math.sin(angle - 2.5) * s);
                ctx.closePath();
                ctx.fill();
            }
        }
    }
}
