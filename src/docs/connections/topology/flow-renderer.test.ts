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
        createLinearGradient: vi.fn(() => gradient),
        globalAlpha: 1, lineWidth: 1, lineCap: "butt", lineJoin: "miter", strokeStyle: "", fillStyle: "",
    };
}

function edge(id: string, up: number, down: number, length = 300): RenderEdge {
    const points = new Float32Array(42), lengths = new Float32Array(21);
    for (let index = 0; index <= 20; index++) { points[index * 2] = (length * index) / 20; lengths[index] = (length * index) / 20; }
    return { id, d: `M0,0 L${length},0`, dashed: false, up, down, alpha: 1, highlighted: false, spread: 20, path: { points, lengths, length } };
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

describe("FlowRenderer", () => {
    it("draws idle edges as a static line once, without a loop or strands", () => {
        const { frames, renderer } = setup();
        renderer.setScene([edge("a", 0, 0)]);
        expect(frames.pending.size).toBe(1);
        frames.advance(16);
        expect(frames.pending.size).toBe(0);
        expect(ctx.stroke).toHaveBeenCalled();
        expect(renderer.getStats()).toMatchObject({ strands: 0, running: false });
        expect(ctx.lineTo).not.toHaveBeenCalled();
    });

    it("animates strands while there is traffic and keeps a single pending frame", () => {
        const { frames, renderer } = setup();
        renderer.setScene([edge("a", 1 << 20, 1 << 20)]);
        frames.advance(34, 30);
        expect(frames.pending.size).toBe(1);
        const strands = renderer.getStats().strands;
        expect(strands).toBeGreaterThan(1);
        expect(ctx.lineTo).toHaveBeenCalled();
        // Gradients are made with the scene and the palette, never per frame.
        expect(ctx.createLinearGradient.mock.calls.length).toBeLessThanOrEqual(strands * 2);
    });

    it("never draws particles or dots: only continuous strands", () => {
        const { frames, renderer } = setup();
        renderer.setScene([edge("a", 1 << 24, 1 << 24)]);
        frames.advance(34, 20);
        expect(ctx.arc).not.toHaveBeenCalled();
        expect(ctx.fill).not.toHaveBeenCalled();
        // Every strand stroke has a constant width within a frame (no swelling heads).
        const widths = new Set<number>();
        const original = ctx.stroke;
        ctx.stroke = vi.fn(() => { widths.add(ctx.lineWidth); });
        frames.advance(34);
        ctx.stroke = original;
        expect(widths.size).toBeLessThanOrEqual(3);
    });

    it("limits drawing to the configured frame rate", () => {
        const { frames, renderer } = setup();
        renderer.setScene([edge("a", 1 << 20, 0)]);
        frames.advance(1000 / 60, 60);
        const drawn = renderer.getStats().frames;
        expect(drawn).toBeGreaterThanOrEqual(28);
        expect(drawn).toBeLessThanOrEqual(32);
    });

    it("freezes while paused and resumes without a time jump", () => {
        const { frames, renderer } = setup();
        renderer.setScene([edge("a", 1 << 20, 0)]);
        frames.advance(34, 10);
        renderer.setPaused(true);
        frames.advance(34, 2);
        expect(frames.pending.size).toBe(0);
        ctx.lineTo.mockClear();
        renderer.setView({ x: 0, y: 0, k: 1 });
        frames.advance(34);
        const paused = ctx.lineTo.mock.calls.map(call => call.join());
        frames.advance(10_000);
        renderer.setPaused(false);
        ctx.lineTo.mockClear();
        frames.advance(34);
        // The first resumed frame steps by 0: strands are where they were paused (the sheen comes back on top).
        const resumed = ctx.lineTo.mock.calls.map(call => call.join());
        expect(paused.every(point => resumed.includes(point))).toBe(true);
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
        frames.advance(34, 5);
        expect(frames.pending.size).toBe(0);
        expect(renderer.getStats().running).toBe(false);
        // Strands are drawn, just not moving.
        expect(ctx.lineTo).toHaveBeenCalled();
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

    it("stays within the strand budget with a large scene", () => {
        const { frames, renderer } = setup(compactMapping);
        renderer.setScene(Array.from({ length: 500 }, (_, index) => edge(`e${index}`, 1 << 30, 1 << 30, 1500)));
        frames.advance(34, 30);
        expect(renderer.getStats().strands).toBe(compactMapping.budget);
    });

    it("never animates auxiliary DNS edges", () => {
        const { frames, renderer } = setup();
        renderer.setScene([{ ...edge("dns", 1 << 20, 0), auxiliary: { weight: 1 } }]);
        frames.advance(34, 3);
        expect(renderer.getStats().strands).toBe(0);
        expect(frames.pending.size).toBe(0);
    });
});
