import { describe, expect, it } from "vitest";
import { createDefaultProtocol, normalizeProtocol, patchProtocolConfig } from "./node";

describe("Nebula node protocol", () => {
    it("creates a standard empty YAML configuration", () => {
        expect(createDefaultProtocol("nebula")).toEqual({
            type: "nebula",
            nebula: { config_yaml: "" },
        });
    });

    it("retains multiline Nebula client YAML through JSON and normalization", () => {
        const yaml = "pki:\n  ca: |\n    example\nlighthouse:\n  hosts:\n    - 10.42.0.1\n";
        const source = patchProtocolConfig(createDefaultProtocol("nebula"), { config_yaml: yaml });
        const normalized = normalizeProtocol(JSON.parse(JSON.stringify(source)));
        expect(normalized).toEqual(source);
    });
});
