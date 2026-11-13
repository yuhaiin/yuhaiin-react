import { listLANLinkNetworks } from "@/api/inbounds";
import { getNodeExtraInfo } from "@/api/nodes";
import { authorizeTest } from "@/test/auth";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { SWRConfig } from "swr";
import { expect, it, vi } from "vitest";
import { LANLinkInboundForm, LANLinkRuntimeInfo } from "./lan-link-form";

vi.mock("@/api/inbounds", () => ({ listLANLinkNetworks: vi.fn() }));
vi.mock("@/api/nodes", () => ({ getNodeExtraInfo: vi.fn() }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

const render = async (host: HTMLElement, onChange: (patch: unknown) => void, value = { networks: [] as string[] }) => {
    const root = createRoot(host);
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><LANLinkInboundForm value={value} onChange={onChange} /></SWRConfig>));
    await act(async () => { await Promise.resolve(); });
    return root;
};

it("offers detected networks without sharing any by default and hides credentials", async () => {
    authorizeTest();
    const host = document.createElement("div");
    document.body.append(host);
    vi.mocked(listLANLinkNetworks).mockResolvedValue({ supported: true, items: [{ cidr: "192.168.50.0/24", interface: "eth0", family: "ipv4" }] });
    const onChange = vi.fn();
    const root = await render(host, onChange);
    try {
        const box = host.querySelector('input[type="checkbox"]') as HTMLInputElement;
        expect(box.checked).toBe(false);
        await act(async () => box.click());
        expect(onChange).toHaveBeenCalledWith({ networks: ["192.168.50.0/24"] });
        for (const hidden of ["registration", "privateKey", "coordinator"]) expect(host.innerHTML).not.toContain(hidden);
        expect(host.textContent).toContain("lanLink.autoSubnet");
        expect(host.textContent).toContain("lanLink.publicEndpoint");
    } finally {
        await act(async () => root.unmount());
        host.remove();
    }
});

it("explains when network detection is unavailable and keeps manual entry", async () => {
    authorizeTest();
    const host = document.createElement("div");
    document.body.append(host);
    vi.mocked(listLANLinkNetworks).mockResolvedValue({ supported: false, reason: "android", items: [] });
    const root = await render(host, vi.fn(), { networks: ["10.0.0.0/24"] });
    try {
        expect(host.textContent).toContain("lanLink.detectionUnsupported");
        expect(host.querySelector("textarea")?.value ?? host.innerHTML).toContain("10.0.0.0/24");
    } finally {
        await act(async () => root.unmount());
        host.remove();
    }
});

it("shows the outbound's own addresses and the peer path in the node editor", async () => {
    authorizeTest();
    const host = document.createElement("div");
    document.body.append(host);
    vi.mocked(getNodeExtraInfo).mockResolvedValue({ lan_link: {
        pairingId: "ffeeddccbbaa99887766554433221100", state: "connected", coordinator: "198.51.100.7:51821",
        localIp: "10.20.0.3", peerIp: "10.20.0.1", listen: "192.168.1.5:40200", peerEndpoint: "203.0.113.9:51821", path: "public",
    } });
    const root = createRoot(host);
    try {
        await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><LANLinkRuntimeInfo nodeId="node" /></SWRConfig>));
        await act(async () => { await Promise.resolve(); });
        expect(getNodeExtraInfo).toHaveBeenCalledWith("node");
        for (const text of ["lanLink.linkState.connected", "10.20.0.3", "10.20.0.1", "192.168.1.5:40200", "ffeeddccbbaa", "198.51.100.7:51821", "203.0.113.9:51821", "lanLink.path.public"]) {
            expect(host.textContent).toContain(text);
        }
    } finally {
        await act(async () => root.unmount());
        host.remove();
    }
});
