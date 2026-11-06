import { describe, expect, it } from "vitest";
import { createDefaultProtocol, normalizeProtocol, patchProtocolConfig, protocolTypes } from "./node";

describe("independent Tailnet outbound types", () => {
    it.each(["tailscale", "tailscale-lite"] as const)("round trips %s with its own discriminator and payload", (type) => {
        expect(protocolTypes).toContain(type);
        const source = patchProtocolConfig(createDefaultProtocol(type), {
            hostname: "host", auth_key: "test-key", control_url: "https://control.example", debug: true,
        });
        expect(normalizeProtocol(JSON.parse(JSON.stringify(source)))).toEqual(source);
        expect(source).toHaveProperty(type);
        expect(source).not.toHaveProperty(type === "tailscale" ? "tailscale-lite" : "tailscale");
    });
});
