import { createLANLinkInvitation, listLANLinkClients, renameLANLinkClient, revokeLANLinkClient, updateLANLinkClient } from "@/api/inbounds";
import { confirmAction } from "@/component/v2/confirmation";
import { authorizeTest } from "@/test/auth";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { SWRConfig } from "swr";
import { expect, it, vi } from "vitest";
import { LANLinkClients } from "./lan-link-clients";

vi.mock("@/api/inbounds", () => ({
    createLANLinkInvitation: vi.fn(), listLANLinkClients: vi.fn(), renameLANLinkClient: vi.fn(), revokeLANLinkClient: vi.fn(), updateLANLinkClient: vi.fn(),
}));
vi.mock("@/auth/context", async importOriginal => ({ ...await importOriginal<typeof import("@/auth/context")>(), usePermission: () => true }));
vi.mock("@/component/v2/confirmation", () => ({ confirmAction: vi.fn() }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

const client = { id: "000102030405060708090a0b0c0d0e0f", address: "10.20.0.3", pairingId: "ffeeddccbbaa99887766554433221100", online: true, blocked: false, dialerEndpoint: "192.0.2.1:40200", name: "Office laptop", path: "lan" };

it("generates an invitation and manages a client without exposing credentials", async () => {
    authorizeTest();
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    vi.mocked(listLANLinkClients).mockResolvedValue({ running: true, publicEndpoint: "198.51.100.7:51821", items: [client] });
    vi.mocked(confirmAction).mockResolvedValue(true);
    vi.mocked(createLANLinkInvitation).mockResolvedValue({ invitation: "lan-link:v1:abc", clientId: client.id, address: client.address });
    const click = async (key: string) => {
        const button = [...host.querySelectorAll("button")].find(element => element.textContent === key);
        expect(button, key).toBeDefined();
        await act(async () => button?.click());
    };
    try {
        await act(async () => root.render(<SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}><LANLinkClients id="gateway" /></SWRConfig>));
        await act(async () => { await Promise.resolve(); });
        expect(host.textContent).toContain(client.address);
        expect(host.textContent).toContain(client.pairingId.slice(0, 12));
        expect(host.textContent).toContain("lanLink.online");
        expect(host.textContent).not.toContain("registration");
        expect(host.textContent).toContain("Office laptop");
        expect(host.textContent).toContain("lanLink.path.lan");

        await click("lanLink.rename");
        const input = host.querySelector('input[aria-label="lanLink.clientName"]') as HTMLInputElement;
        expect(input.value).toBe("Office laptop");
        await act(async () => input.form?.requestSubmit());
        expect(renameLANLinkClient).toHaveBeenCalledWith("gateway", client.id, "Office laptop");

        await click("lanLink.generateInvitation");
        expect(createLANLinkInvitation).toHaveBeenCalledWith("gateway", undefined);
        expect((host.querySelector("input[readonly]") as HTMLInputElement).value).toBe("lan-link:v1:abc");

        await click("peerTunnel.kick");
        expect(updateLANLinkClient).toHaveBeenCalledWith("gateway", client.id, "kick");
        await click("peerTunnel.block");
        expect(updateLANLinkClient).toHaveBeenCalledWith("gateway", client.id, "block");
        await click("lanLink.revoke");
        expect(revokeLANLinkClient).toHaveBeenCalledWith("gateway", client.id);
    } finally {
        await act(async () => root.unmount());
        host.remove();
    }
});

it("asks to enable an inactive gateway before issuing invitations", async () => {
    authorizeTest();
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    vi.mocked(listLANLinkClients).mockResolvedValue({ running: false, items: [] });
    try {
        await act(async () => root.render(<SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}><LANLinkClients id="gateway" /></SWRConfig>));
        await act(async () => { await Promise.resolve(); });
        expect(host.textContent).toContain("lanLink.inactive");
        const generate = [...host.querySelectorAll("button")].find(element => element.textContent === "lanLink.generateInvitation");
        expect(generate?.hasAttribute("disabled")).toBe(true);
    } finally {
        await act(async () => root.unmount());
        host.remove();
    }
});
