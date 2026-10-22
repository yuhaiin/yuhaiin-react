import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import PprofPage from "./page";

vi.mock("react-i18next", () => {
    const t = (key: string) => key;
    return { useTranslation: () => ({ t }) };
});

const session = {
    id: "a".repeat(48),
    type: "heap",
    seconds: 0,
    status: "completed",
    createdAt: "2026-10-15T11:00:00Z",
    completedAt: "2026-10-15T11:00:01Z",
    size: 1024,
};

async function renderProfiler(): Promise<{ host: HTMLDivElement; root: Root }> {
    vi.stubGlobal("fetch", vi.fn(async () =>
        new Response(JSON.stringify({ enabled: true, sessions: [session] }), {
            status: 200, headers: { "Content-Type": "application/json" },
        })));
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    await act(async () => {
        root.render(<PprofPage />);
        await new Promise(resolve => setTimeout(resolve, 20));
    });
    // Effects schedule the initial session fetch for the following task.
    await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 20));
    });
    return { host, root };
}

function teardown(host: HTMLDivElement, root: Root) {
    act(() => root.unmount());
    host.remove();
}

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    Reflect.deleteProperty(document, "fullscreenElement");
    Reflect.deleteProperty(document, "exitFullscreen");
});

it("expands viewer to a viewport overlay and exits with Escape when Fullscreen API is unavailable", async () => {
    const { host, root } = await renderProfiler();
    try {
        const panel = host.querySelector<HTMLElement>('[data-testid="profiler-viewer-panel"]')!;
        const enter = host.querySelector<HTMLButtonElement>('[aria-label="profilerExpand"]')!;
        expect(enter).toBeTruthy();

        act(() => enter.click());
        expect(panel.className).toContain("fixed inset-0");
        expect(document.body.style.overflow).toBe("hidden");
        expect(host.querySelector('[aria-label="profilerExitFullscreen"]')).toBeTruthy();

        act(() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })));
        expect(panel.className).not.toContain("fixed inset-0");
        expect(host.querySelector('[aria-label="profilerExitFullscreen"]')).toBeNull();
        expect(document.body.style.overflow).not.toBe("hidden");
    } finally {
        teardown(host, root);
    }
});

it("requests native fullscreen, has a visible exit control, and handles browser exit", async () => {
    const { host, root } = await renderProfiler();
    try {
        const panel = host.querySelector<HTMLElement>('[data-testid="profiler-viewer-panel"]')!;
        let active: Element | null = null;
        Object.defineProperty(document, "fullscreenElement", {
            configurable: true, get: () => active,
        });
        const request = vi.fn(async () => { active = panel; });
        Object.defineProperty(panel, "requestFullscreen", { configurable: true, value: request });
        const exit = vi.fn(async () => { active = null; });
        Object.defineProperty(document, "exitFullscreen", { configurable: true, value: exit });

        act(() => host.querySelector<HTMLButtonElement>('[aria-label="profilerExpand"]')!.click());
        expect(request).toHaveBeenCalledOnce();
        expect(panel.className).toContain("fixed inset-0");

        await act(async () => {
            host.querySelector<HTMLButtonElement>('[aria-label="profilerExitFullscreen"]')!.click();
        });
        expect(exit).toHaveBeenCalledOnce();
        expect(panel.className).not.toContain("fixed inset-0");

        act(() => host.querySelector<HTMLButtonElement>('[aria-label="profilerExpand"]')!.click());
        expect(request).toHaveBeenCalledTimes(2);
        active = null;
        act(() => document.dispatchEvent(new Event("fullscreenchange")));
        expect(panel.className).not.toContain("fixed inset-0");
    } finally {
        teardown(host, root);
    }
});
