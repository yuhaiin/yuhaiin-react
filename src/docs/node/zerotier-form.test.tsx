import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import type { NodeProtocolConfig } from "@/contract/node";
import i18n from "@/i18n";
import { ZeroTierForm } from "./zerotier-form";

it("translates ZeroTier settings and Moon fields when the language changes", async () => {
    const previousLanguage = i18n.language;
    const config: NodeProtocolConfig<"zerotier"> = {
        network_id: "8056c2e21c000001",
        moons: [{ id: "fffffffffffffffe", seed: "0123456789abcdef" }],
    };
    const host = document.createElement("div");
    const root = createRoot(host);
    const render = () => root.render(<ZeroTierForm config={config} editable onChange={() => undefined} />);

    try {
        await act(async () => {
            await i18n.changeLanguage("en");
            render();
        });
        expect(host.textContent).toContain("ZeroTier Network ID (16 hexadecimal digits)");
        expect(host.textContent).toContain("Moon 1 ID (hex)");
        expect(host.textContent).toContain("Add Moon");

        await act(async () => i18n.changeLanguage("ja"));
        expect(host.textContent).toContain("ZeroTier ネットワーク ID（16 桁の16進数）");
        expect(host.textContent).toContain("Moon 1 ID（16進数）");
        expect(host.textContent).toContain("Moon を追加");
        expect(host.textContent).toContain("削除");
    } finally {
        act(() => root.unmount());
        await i18n.changeLanguage(previousLanguage);
    }
});
