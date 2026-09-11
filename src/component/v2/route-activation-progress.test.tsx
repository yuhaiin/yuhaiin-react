import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RouteActivationProgress } from "./route-activation-progress";

describe("RouteActivationProgress", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it("keeps one refresh interval while the activation is pending", () => {
        vi.useFakeTimers();
        const setInterval = vi.spyOn(window, "setInterval");
        const container = document.createElement("div");
        const root = createRoot(container);
        const now = Date.now();

        act(() => root.render(
            <RouteActivationProgress
                status={{ hostIndexRefreshAt: now + 5_000, ruleApplyAt: 0 }}
                onApplied={() => undefined}
            />,
        ));

        expect(setInterval).toHaveBeenCalledTimes(1);

        act(() => {
            vi.advanceTimersByTime(1_000);
        });

        expect(setInterval).toHaveBeenCalledTimes(1);
        act(() => root.unmount());
    });
});
