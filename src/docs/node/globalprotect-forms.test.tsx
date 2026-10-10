import { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, expect, it, vi } from "vitest";
import { getNodeExtraInfo } from "@/api/nodes";
import { normalizeNode } from "@/contract/node";
import { NodeEditor } from "./NodeEditor";

vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock("@/api/nodes", () => ({ getNodeExtraInfo: vi.fn() }));

beforeEach(() => vi.clearAllMocks());

it("edits a GlobalProtect outbound and loads cached gateway routes on demand", async () => {
    vi.mocked(getNodeExtraInfo).mockResolvedValue({
        globalprotect: {
            tunnel_prefix: "192.0.2.8/32",
            access_routes_ipv4: ["198.51.100.0/24", "203.0.113.5/32"],
            exclude_routes_ipv4: [],
            access_routes_ipv6: [],
            exclude_routes_ipv6: [],
            dns: [],
            dns_v6: [],
            dns_suffix: [],
            no_direct_access_to_local_network: "no",
        },
    });

    let saved = normalizeNode({
        id: "pa-node",
        chain: [{ type: "globalprotect", globalprotect: { gateway: "vpn.example.com", username: "alice", password: "secret" } }],
    });
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    const noop = () => {};
    const render = () => root.render(<NodeEditor
        value={saved}
        editable
        groups={[]}
        onChange={noop}
        onProtocolChange={(index, protocol) => {
            saved = { ...saved, chain: saved.chain.map((item, current) => current === index ? protocol : item) };
        }}
        onMoveProtocol={noop}
        onRemoveProtocol={noop}
        onAddProtocol={noop}
    />);

    try {
        act(render);
        expect(host.textContent).toContain("globalProtectGatewayInfo");

        const gatewayLabel = [...host.querySelectorAll("label")].find((label) => label.textContent === "globalProtectGateway")!;
        const gatewayInput = gatewayLabel.control as HTMLInputElement;
        act(() => {
            Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(gatewayInput, "pa.example.com");
            gatewayInput.dispatchEvent(new Event("input", { bubbles: true }));
        });
        act(render);
        expect(saved.chain[0]).toMatchObject({ type: "globalprotect", globalprotect: { gateway: "pa.example.com" } });

        const loadButton = host.querySelector<HTMLButtonElement>('button[aria-label="globalProtectFetchGatewayInfo"]')!;
        await act(async () => {
            loadButton.click();
            await Promise.resolve();
        });

        expect(getNodeExtraInfo).toHaveBeenCalledWith("pa-node");
        expect(host.textContent).toContain("198.51.100.0/24");
        expect(host.textContent).toContain("203.0.113.5/32");
        expect(host.textContent).toContain("globalProtectAccessRoutesIPv4");
    } finally {
        act(() => root.unmount());
        host.remove();
    }
});
