import { describe, expect, it } from "vitest";
import { createDefaultSettings, normalizeSettings } from "./settings";

describe("local wrap settings", () => {
    it("is disabled for existing configurations", () => {
        expect(createDefaultSettings().wrap.enabled).toBe(false);
    });
    it("retains settings across normalization", () => {
        const original = createDefaultSettings();
        original.wrap = {
            enabled: true, socket: "/run/yuhaiin/custom.sock",
            uid: 1000, gid: 1000, cgroupRoot: "/sys/fs/cgroup/delegated/wrap", maxSessions: 16,
        };
        expect(normalizeSettings(JSON.parse(JSON.stringify(original))).wrap).toEqual(original.wrap);
    });
});
