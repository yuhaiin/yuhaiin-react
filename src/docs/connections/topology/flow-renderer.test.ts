import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FlowRenderer, type Palette, type RenderEdge } from "./flow-renderer";
import { compactMapping, defaultMapping } from "./ribbons";

/** A frame queue driven by the test instead of the browser. */
class Frames {
    private next = 1;
    pending = new Map<number, FrameRequestCallback>();
    now = 0;
    request = (callback: FrameRequestCallback) => {
        const handle = this.next++;
        this.pending.set(handle, callback);
        return handle;
    };
    cancel = (handle: number) => { this.pending.delete(handle); };
    /** Advances time and runs the callbacks that were pending. */
    advance(ms: number, frames = 1) {
        for (let index = 0; index < frames; index++) {
            this.now += ms;
            const callbacks = [...this.pending.values()];
            this.pending.clear();
            for (const callback of callbacks) callback(this.now);
        }
    }
}

function context() {
    const gradient = { addColorStop: vi.fn() };
    return {
        setTransform: vi.fn(), clearRect: vi.fn(), stroke: vi.fn(), setLineDash: vi.fn(), fill: vi.fn(),
        beginPath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(), arc: vi.fn(),
        createLinearGradient: vi.fn(() => gradient), fillRect: vi.fn(),
        // Patterns record a copy of every transform: the renderer reuses one matrix object.
        createPattern: vi.fn(() => {
            const placed: { e: number; f: number }[] = [];
            const pattern = { placed, setTransform: vi.fn((matrix: { e: number; f: number }) => { placed.push({ e: matrix.e, f: matrix.f }); }) };
            return pattern;
        }),
        globalAlpha: 1, lineWidth: 1, lineCap: "butt", lineJoin: "miter", strokeStyle: "", fillStyle: "",
    };
}

function edge(id: string, up: number, down: number, length = 300): RenderEdge {
    return { id, d: `M0,0 C${length / 2},0 ${length / 2},0 ${length},0`, ends: [0, 0, length, 0], vertical: false, length, dashed: false, up, down, alpha: 1, highlighted: false };
}

const palette: Palette = { up: "teal", upAlt: "cyan", down: "violet", downAlt: "indigo", flow: "blue", idle: "gray", edge: "gray", highlight: "white", auxiliary: "gray", dark: true };

let ctx: ReturnType<typeof context>;
beforeEach(() => {
    ctx = context();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() => ctx as unknown as CanvasRenderingContext2D);
});
afterEach(() => vi.restoreAllMocks());

function setup(mapping = defaultMapping) {
    const frames = new Frames();
    const canvas = document.createElement("canvas");
    const renderer = new FlowRenderer(canvas, { mapping, fps: 30, maxPixelRatio: 2, requestFrame: frames.request, cancelFrame: frames.cancel, now: () => frames.now });
    renderer.setPalette(palette);
    return { frames, canvas, renderer };
}

/** Width and style of every stroke drawn while `run` executes. */
function strokes(run: () => void) {
    const drawn: { width: number; style: unknown; alpha: number }[] = [];
    const stroke = ctx.stroke;
    ctx.stroke = vi.fn(() => { drawn.push({ width: ctx.lineWidth, style: ctx.strokeStyle, alpha: ctx.globalAlpha }); });
    run();
    ctx.stroke = stroke;
    return drawn;
}

describe("FlowRenderer", () => {
    it("draws idle edges as a quiet static line once, without a loop", () => {
        const { frames, renderer } = setup();
        renderer.setScene([edge("a", 0, 0)]);
        expect(frames.pending.size).toBe(1);
        const drawn = strokes(() => frames.advance(16));
        expect(frames.pending.size).toBe(0);
        expect(drawn).toEqual([{ width: 1, style: "gray", alpha: 0.9 }]);
        expect(renderer.getStats()).toMatchObject({ ribbons: 0, animated: 0, running: false });
    });

    it("draws one ribbon per edge with traffic, plus one highlight per active direction", () => {
        const { frames, renderer } = setup();
        renderer.setScene([edge("up", 1 << 20, 0), edge("both", 1 << 20, 1 << 20)]);
        const drawn = strokes(() => frames.advance(34));
        // up: ribbon + upload highlight; both: ribbon + upload + download highlight.
        expect(drawn).toHaveLength(5);
        // A single width per ribbon: the highlight never swells or thins it.
        expect(new Set(drawn.slice(0, 2).map(item => item.width)).size).toBe(1);
        expect(new Set(drawn.slice(2).map(item => item.width)).size).toBe(1);
        expect(renderer.getStats()).toMatchObject({ ribbons: 2, animated: 2 });
        expect(frames.pending.size).toBe(1);
    });

    it("keeps a ribbon 2.4-4 CSS px wide on screen at any zoom", () => {
        const { frames, renderer } = setup();
        renderer.setScene([edge("a", 1 << 24, 0)]);
        for (const k of [0.25, 0.66, 1, 2.5]) {
            renderer.setView({ x: 0, y: 0, k });
            const [base] = strokes(() => frames.advance(34));
            expect(base.width * k).toBeGreaterThanOrEqual(2.4 - 1e-9);
            expect(base.width * k).toBeLessThanOrEqual(4 + 1e-9);
        }
    });

    it("moves only the highlight, in the direction of flow, never the shape", () => {
        const { frames, renderer } = setup();
        renderer.setScene([edge("up", 1 << 20, 0), edge("down", 0, 1 << 20)]);
        const [up, down] = ctx.createPattern.mock.results.map(result => result.value as { placed: { e: number }[]; setTransform: ReturnType<typeof vi.fn> });
        frames.advance(34);
        frames.advance(34, 15);
        const shift = (pattern: { placed: { e: number }[] }) => pattern.placed[pattern.placed.length - 1].e - pattern.placed[0].e;
        expect(shift(up)).toBeGreaterThan(0);
        expect(shift(down)).toBeLessThan(0);
        // Every pattern placement reuses one matrix object: no allocation per frame.
        expect(new Set(up.setTransform.mock.calls.map(call => call[0])).size).toBe(1);
        // The ribbon geometry is built once: no new paths, gradients or patterns while animating.
        const gradients = ctx.createLinearGradient.mock.calls.length;
        frames.advance(34, 10);
        expect(ctx.createLinearGradient.mock.calls.length).toBe(gradients);
        expect(ctx.moveTo).not.toHaveBeenCalled();
    });

    it("never draws particles or dots", () => {
        const { frames, renderer } = setup();
        renderer.setScene([edge("a", 1 << 24, 1 << 24)]);
        frames.advance(34, 20);
        expect(ctx.arc).not.toHaveBeenCalled();
    });

    it("limits drawing to the configured frame rate", () => {
        const { frames, renderer } = setup();
        renderer.setScene([edge("a", 1 << 20, 0)]);
        frames.advance(1000 / 60, 60);
        const drawn = renderer.getStats().frames;
        expect(drawn).toBeGreaterThanOrEqual(28);
        expect(drawn).toBeLessThanOrEqual(32);
    });

    it("draws still ribbons while paused and resumes without a time jump", () => {
        const { frames, renderer } = setup();
        renderer.setScene([edge("a", 1 << 20, 0)]);
        const [pattern] = ctx.createPattern.mock.results.map(result => result.value as { placed: { e: number }[] });
        frames.advance(34, 10);
        renderer.setPaused(true);
        frames.advance(34, 2);
        expect(frames.pending.size).toBe(0);
        const paused = strokes(() => { renderer.setView({ x: 0, y: 0, k: 1 }); frames.advance(34); });
        // Paused: the ribbon only, no highlight.
        expect(paused).toHaveLength(1);
        const before = pattern.placed[pattern.placed.length - 1].e;
        frames.advance(10_000);
        renderer.setPaused(false);
        frames.advance(34);
        // The first resumed frame steps by 0: the highlight is where it was.
        expect(pattern.placed[pattern.placed.length - 1].e).toBeCloseTo(before, 6);
        expect(frames.pending.size).toBe(1);
    });

    it("stops while the page is hidden", () => {
        const { frames, renderer } = setup();
        renderer.setScene([edge("a", 1 << 20, 0)]);
        frames.advance(34, 3);
        renderer.setVisible(false);
        expect(frames.pending.size).toBe(0);
        renderer.setScene([edge("a", 2 << 20, 0)]);
        expect(frames.pending.size).toBe(0);
        renderer.setVisible(true);
        expect(frames.pending.size).toBe(1);
    });

    it("draws still ribbons with reduced motion", () => {
        const { frames, renderer } = setup();
        renderer.setReducedMotion(true);
        renderer.setScene([edge("a", 1 << 20, 1 << 10)]);
        const drawn = strokes(() => frames.advance(34, 5));
        expect(frames.pending.size).toBe(0);
        expect(renderer.getStats().running).toBe(false);
        expect(drawn).toHaveLength(1);
    });

    it("caps the backing store pixel ratio on resize", () => {
        const { canvas, renderer } = setup();
        renderer.resize(800, 600, 3);
        expect([canvas.width, canvas.height]).toEqual([1600, 1200]);
        renderer.resize(800, 600, 1);
        expect([canvas.width, canvas.height]).toEqual([800, 600]);
    });

    it("releases its frame on destroy", () => {
        const { frames, renderer } = setup();
        renderer.setScene([edge("a", 1 << 20, 0)]);
        frames.advance(34, 3);
        expect(frames.pending.size).toBe(1);
        renderer.destroy();
        expect(frames.pending.size).toBe(0);
        renderer.setScene([edge("a", 1 << 20, 0)]);
        renderer.setView({ x: 1, y: 1, k: 1 });
        expect(frames.pending.size).toBe(0);
    });

    it("animates at most the budget with a large scene, drawing the rest still", () => {
        const { frames, renderer } = setup(compactMapping);
        renderer.setScene(Array.from({ length: 500 }, (_, index) => edge(`e${index}`, 1 << 30, 1 << 30, 1500)));
        const drawn = strokes(() => frames.advance(34));
        expect(renderer.getStats()).toMatchObject({ ribbons: 500, animated: compactMapping.budget });
        expect(drawn).toHaveLength(500 + compactMapping.budget * 2);
    });

    it("never animates auxiliary DNS edges", () => {
        const { frames, renderer } = setup();
        renderer.setScene([{ ...edge("dns", 1 << 20, 0), auxiliary: { weight: 1 } }]);
        frames.advance(34, 3);
        expect(renderer.getStats().animated).toBe(0);
        expect(frames.pending.size).toBe(0);
    });
});
