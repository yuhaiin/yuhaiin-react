import { describe, expect, it } from "vitest";
import { processName } from "./process";

describe("processName", () => {
    it("shows the bundle name of a macOS app", () => {
        expect(processName("/Applications/Lark.app/Contents/MacOS/Lark")).toBe("Lark");
        expect(processName("/Applications/Brave Browser.app/Contents/MacOS/Brave Browser")).toBe("Brave Browser");
        expect(processName("/Applications/Spotify.app/Contents/Frameworks/Spotify Helper.app/Contents/MacOS/Spotify Helper")).toBe("Spotify Helper");
    });
    it("shows the executable for anything else", () => {
        expect(processName("/System/Library/Frameworks/CoreServices.framework/Versions/A/Frameworks/Metadata.framework/Versions/A/Support/mdworker")).toBe("mdworker");
        expect(processName("/Applications/Docker.app/Contents/Resources/bin/com.docker.backend")).toBe("com.docker.backend");
        expect(processName("/usr/local/bin/curl")).toBe("curl");
        expect(processName("C:\\Program Files\\App\\App.EXE")).toBe("App");
    });
    it("keeps names without a directory", () => {
        expect(processName("com.example.android")).toBe("com.example.android");
        expect(processName("")).toBe("");
        expect(processName(undefined)).toBe("");
    });
});
