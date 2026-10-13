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
                status={{ savedRevision: 0, appliedRevision: 0, hostIndexRefreshAt: now + 5_000, ruleApplyAt: 0 }}
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
    it("keeps overdue changes and failures visible until the server confirms activation", () => {
        vi.useFakeTimers();
        const container = document.createElement("div");
        const root = createRoot(container);
        act(() => root.render(<RouteActivationProgress status={{ savedRevision: 0, appliedRevision: 0, hostIndexRefreshAt: 0, ruleApplyAt: Date.now() + 1000 }} onApplied={() => undefined} />));
        act(() => { vi.advanceTimersByTime(2000); });
        expect(container.querySelector('button')).not.toBeNull();
        act(() => root.render(<RouteActivationProgress status={{ savedRevision: 0, appliedRevision: 0, hostIndexRefreshAt: 0, ruleApplyAt: 0, error: 'Index download failed' }} onApplied={() => undefined} />));
        expect(container.querySelector('[role="alert"]')?.textContent).toBe('Index download failed');
        act(() => root.render(<RouteActivationProgress status={{ savedRevision: 0, appliedRevision: 0, hostIndexRefreshAt: 0, ruleApplyAt: 0 }} onApplied={() => undefined} />));
        expect(container.textContent).toBe('');
        act(() => root.unmount());
    });

    it("shows saved revisions that have not reached the running configuration", () => {
        const container = document.createElement("div");
        const root = createRoot(container);
        act(() => root.render(<RouteActivationProgress status={{ hostIndexRefreshAt: 0, ruleApplyAt: 0, savedRevision: 3, appliedRevision: 2 }} onApplied={() => undefined} />));
        expect(container.querySelector('button')).not.toBeNull();
        expect(container.querySelector('details')).not.toBeNull();
        act(() => root.render(<RouteActivationProgress status={{ hostIndexRefreshAt: 0, ruleApplyAt: 0, savedRevision: 3, appliedRevision: 3 }} onApplied={() => undefined} />));
        expect(container.textContent).toBe('');
        act(() => root.unmount());
    });

});
