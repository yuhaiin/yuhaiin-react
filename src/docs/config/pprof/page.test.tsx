import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import PprofPage from "./page";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

afterEach(() => {
    vi.unstubAllGlobals();
});

it("uses the shared select components instead of browser-native dropdowns", () => {
    // Leave the initial request pending: this test is about controls, not an API.
    vi.stubGlobal("fetch", vi.fn(() => new Promise<Response>(() => {})));
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    try {
        act(() => root.render(<PprofPage />));

        expect(host.querySelectorAll("select")).toHaveLength(0);
        const controls = host.querySelectorAll('[role="combobox"]');
        expect(controls).toHaveLength(3);
        expect(controls[0].getAttribute("aria-label")).toBe("profilerType");
        expect(controls[1].getAttribute("aria-label")).toBe("profilerDuration");
        expect(controls[2].getAttribute("aria-label")).toBe("profilerRecent");

        const capture = [...host.querySelectorAll("button")]
            .find(button => button.textContent?.includes("profilerCapture"));
        expect(capture).toBeDefined();
        expect(capture?.className).toContain("justify-center");
    } finally {
        act(() => root.unmount());
        host.remove();
    }
});
