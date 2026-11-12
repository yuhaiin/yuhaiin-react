import { listPeerDiscoveryPairs, updatePeerDiscoveryPair } from "@/api/inbounds";
import { confirmAction } from "@/component/v2/confirmation";
import { authorizeTest } from "@/test/auth";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { SWRConfig } from "swr";
import { expect, it, vi } from "vitest";
import { PeerDiscoveryPairs } from "./peer-discovery-pairs";

vi.mock("@/api/inbounds", () => ({ listPeerDiscoveryPairs: vi.fn(), updatePeerDiscoveryPair: vi.fn() }));
vi.mock("@/component/v2/confirmation", () => ({ confirmAction: vi.fn() }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

it("shows both registrations and can kick, block and unblock the selected pairing", async () => {
    authorizeTest();
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    const id = "000102030405060708090a0b0c0d0e0f";
    const initial = {
        running: true,
        items: [{ id, blocked: false, dialerEndpoint: "192.0.2.1:40200", publisherEndpoint: "192.0.2.2:40300" }],
    };
    vi.mocked(listPeerDiscoveryPairs).mockResolvedValue(initial);
    vi.mocked(confirmAction).mockResolvedValue(true);
    vi.mocked(updatePeerDiscoveryPair).mockImplementation(async (_id, _pair, action) => {
        vi.mocked(listPeerDiscoveryPairs).mockResolvedValue({
            running: true,
            items: [{ id, blocked: action === "block", ...(action === "kick" ? { retryAt: 1234 } : {}) }],
        });
    });
    const click = async (key: string) => {
        const button = [...host.querySelectorAll("button")].find(element => element.textContent === key);
        expect(button).toBeDefined();
        await act(async () => button?.click());
    };
    try {
        await act(async () => root.render(<SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}><PeerDiscoveryPairs id="discovery" /></SWRConfig>));
        expect(listPeerDiscoveryPairs).not.toHaveBeenCalled();
        await act(async () => {
            const details = host.querySelector("details")!;
            details.open = true;
            details.dispatchEvent(new Event("toggle"));
        });
        expect(host.textContent).toContain("192.0.2.1:40200");
        expect(host.textContent).toContain("192.0.2.2:40300");
        await click("peerTunnel.kick");
        expect(updatePeerDiscoveryPair).toHaveBeenCalledWith("discovery", id, "kick");
        expect(host.textContent).toContain("peerTunnel.peerState.kicked");
        await click("peerTunnel.block");
        expect(updatePeerDiscoveryPair).toHaveBeenCalledWith("discovery", id, "block");
        expect(host.textContent).toContain("peerTunnel.peerState.blocked");
        await click("peerTunnel.unblock");
        expect(updatePeerDiscoveryPair).toHaveBeenCalledWith("discovery", id, "unblock");
        expect(host.textContent).not.toContain("peerTunnel.peerState.blocked");
    } finally {
        act(() => root.unmount());
        host.remove();
    }
});
