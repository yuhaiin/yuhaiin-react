import { describe, expect, it } from "vitest";
import { chainTemplate, templateChain } from "@/docs/node/templates";
import { createDefaultProtocol, normalizeProtocol, patchProtocolConfig } from "./node";

describe("ZeroTier node protocol", () => {
    it("initializes as a root protocol with explicit network identity", () => {
        expect(createDefaultProtocol("zerotier")).toEqual({
            type: "zerotier",
            zerotier: { network_id: "", identity: "", listen: "", moons: [], low_bandwidth: false },
        });
        expect(templateChain("zerotier")).toEqual([createDefaultProtocol("zerotier")]);
        expect(chainTemplate(templateChain("zerotier"))).toBe("zerotier");
    });

    it("preserves 64-bit Moon IDs as hexadecimal strings through JSON", () => {
        const source = patchProtocolConfig(createDefaultProtocol("zerotier"), {
            network_id: "8056c2e21c000001",
            identity: "my-home",
            listen: ":0",
            moons: [{ id: "fffffffffffffffe", seed: "0123456789abcdef" }],
        });
        const normalized = normalizeProtocol(JSON.parse(JSON.stringify(source)));
        expect(normalized).toEqual(source);
        expect(normalized.type === "zerotier" && normalized.zerotier.moons?.[0].id).toBe("fffffffffffffffe");
    });
});
