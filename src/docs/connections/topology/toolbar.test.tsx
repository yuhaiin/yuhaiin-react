import "@/i18n";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { emptyFilter } from "./model";
import { TopologyToolbar } from "./toolbar";

const hosts: HTMLElement[] = [];
afterEach(() => { for (const host of hosts.splice(0)) host.remove(); });

function render(overrides: Partial<Parameters<typeof TopologyToolbar>[0]> = {}) {
    const props: Parameters<typeof TopologyToolbar>[0] = {
        state: "live", paused: false, onPausedChange: vi.fn(), visible: 126, total: 126, up: 4.4 * 1024 * 1024, down: 4.7 * 1024 * 1024,
        search: "", onSearchChange: vi.fn(), matches: 0, filter: emptyFilter(), options: { inbounds: [], outbounds: [], processes: [], geo: [] },
        onFilterChange: vi.fn(), dnsAvailable: true, dns: true, onDnsChange: vi.fn(), ...overrides,
    };
    const host = document.createElement("div");
    document.body.append(host);
    hosts.push(host);
    act(() => { createRoot(host).render(createElement(TopologyToolbar, props)); });
    return { host, props };
}

describe("TopologyToolbar", () => {
    it("groups the overview and the actions", () => {
        const { host } = render();
        const bar = host.querySelector("[data-topology-toolbar]")!;
        const overview = bar.querySelector("[data-part=overview]")!;
        expect(overview.querySelector("h1")?.textContent).toBe("Network topology");
        expect(overview.querySelector("[role=status]")?.textContent).toBe("Live");
        expect(overview.querySelector("[data-part=rates]")?.textContent).toContain("4.4 MB/s");
        expect(bar.querySelector("[data-part=actions] [data-part=search] input")).not.toBeNull();
    });

    it("keeps full accessible labels for the counts, filtered or not", () => {
        expect(render().host.querySelector("[data-part=count] .sr-only")?.textContent).toBe("126 active connections");
        const filtered = render({ visible: 7 }).host;
        expect(filtered.querySelector("[data-part=count] .sr-only")?.textContent).toBe("7 of 126 active connections shown");
        // The compact form keeps both numbers.
        expect(filtered.querySelector("[data-part=count]")?.textContent).toContain("7/126");
        expect(render().host.querySelector("[data-part=rates] .sr-only")?.textContent).toBe("Upload 4.4 MB/s, download 4.7 MB/s");
    });

    it("keeps every action labelled and wired", () => {
        const { host, props } = render({ paused: false, dns: true });
        const button = (label: string) => host.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;
        expect(button("Filters")).not.toBeNull();
        expect(button("Show DNS resolution").getAttribute("aria-pressed")).toBe("true");
        act(() => button("Show DNS resolution").click());
        expect(props.onDnsChange).toHaveBeenCalledWith(false);
        act(() => button("Pause").click());
        expect(props.onPausedChange).toHaveBeenCalledWith(true);
        expect(render({ paused: true }).host.querySelector("button[aria-label=Live]")?.getAttribute("aria-pressed")).toBe("true");
    });

    it("hides the DNS toggle without the permission", () => {
        expect(render({ dnsAvailable: false }).host.querySelector('button[aria-label="Show DNS resolution"]')).toBeNull();
    });
});
