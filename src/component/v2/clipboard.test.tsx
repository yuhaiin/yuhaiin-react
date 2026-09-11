import { act, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useClipboard } from "./clipboard";

function Probe({ onReady }: { onReady: (copy: (value: string) => Promise<void>) => void }) {
    const { copy } = useClipboard();
    useEffect(() => onReady(copy), [copy, onReady]);
    return null;
}

describe("useClipboard", () => {
    let clipboardDescriptor: PropertyDescriptor | undefined;

    beforeEach(() => {
        clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    });

    afterEach(() => {
        vi.restoreAllMocks();
        if (clipboardDescriptor) {
            Object.defineProperty(navigator, "clipboard", clipboardDescriptor);
        } else {
            Reflect.deleteProperty(navigator, "clipboard");
        }
    });

    it("does not schedule state cleanup after a delayed copy resolves post-unmount", async () => {
        let resolveCopy!: () => void;
        const writeText = vi.fn(() => new Promise<void>((resolve) => {
            resolveCopy = resolve;
        }));
        Object.defineProperty(navigator, "clipboard", {
            configurable: true,
            value: { writeText },
        });
        const setTimeout = vi.spyOn(window, "setTimeout");
        let copy!: (value: string) => Promise<void>;
        const container = document.createElement("div");
        const root = createRoot(container);

        act(() => root.render(<Probe onReady={(handler) => { copy = handler; }} />));
        act(() => { void copy("value"); });
        expect(writeText).toHaveBeenCalledWith("value");

        act(() => root.unmount());
        resolveCopy();
        await act(async () => {
            await Promise.resolve();
        });

        expect(setTimeout).not.toHaveBeenCalled();
    });
});
