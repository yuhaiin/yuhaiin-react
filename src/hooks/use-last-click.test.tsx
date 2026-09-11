import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useLastClickPosition } from "./use-last-click";

function Probe() {
    useLastClickPosition();
    return null;
}

describe("useLastClickPosition", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("removes the shared listener after the last consumer unmounts", () => {
        const addEventListener = vi.spyOn(window, "addEventListener");
        const removeEventListener = vi.spyOn(window, "removeEventListener");
        const container = document.createElement("div");
        const root = createRoot(container);

        act(() => root.render(<Probe />));
        const clickListener = addEventListener.mock.calls.find(([type]) => type === "click")?.[1];
        expect(clickListener).toBeDefined();

        act(() => root.unmount());

        expect(removeEventListener).toHaveBeenCalledWith("click", clickListener, true);
    });
});
