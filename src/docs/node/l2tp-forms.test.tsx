import { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, expect, it, vi } from "vitest";
import { getNodeExtraInfo } from "@/api/nodes";
import { createDefaultProtocol, normalizeNode, normalizeProtocol } from "@/contract/node";
import { NodeEditor } from "./NodeEditor";

vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock("@/api/nodes", () => ({ getNodeExtraInfo: vi.fn() }));
beforeEach(() => vi.clearAllMocks());

it("preserves nested L2TP protocols, cookies, uint32 IDs and unknown future settings", () => {
    const source = { type: "network_split", network_split: {
        tcp: { type: "l2tp", l2tp: { gateway: "vpn.example:1701", auth_type: "mschap-v2", ipv6: true, ipv6_address: "fd88::2/64" } },
        udp: { type: "l2tpv3", l2tpv3: { gateway: "vpn.example:1701", static: true, local_session_id: 4294967295, peer_session_id: 200,
            local_cookie: "1122334455667788", peer_cookie: "aabbccdd", sublayer: false, address: "10.89.0.2/24", future_option: true } },
    } };
    expect(normalizeProtocol(JSON.parse(JSON.stringify(source)))).toMatchObject(source);
    expect(createDefaultProtocol("l2tp").l2tp).toMatchObject({ auth_type: "auto", mtu: 1400 });
    expect(createDefaultProtocol("l2tpv3").l2tpv3).toMatchObject({ static: false, sublayer: true });
});

it.each(["l2tp", "l2tpv3"] as const)("edits %s settings and disables imported read-only forms", (type) => {
    let saved = normalizeNode({ chain: [createDefaultProtocol(type)] });
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    const noop = () => {};
    const render = (editable = true) => root.render(<NodeEditor value={saved} editable={editable} groups={[]} onChange={noop}
        onProtocolChange={(index, protocol) => { saved = { ...saved, chain: saved.chain.map((item, i) => index === i ? protocol : item) }; }}
        onMoveProtocol={noop} onRemoveProtocol={noop} onAddProtocol={noop} />);
    const field = (label: string) => {
        const input = [...host.querySelectorAll("label")].find((item) => item.textContent === label)?.control;
        if (!input) throw Error(`missing field ${label}`);
        return input as HTMLInputElement;
    };
    const edit = (label: string, value: string) => {
        act(() => {
            const input = field(label);
            Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
            input.dispatchEvent(new Event("input", { bubbles: true }));
        });
        act(() => render());
    };
    const toggle = (label: string) => {
        const button = [...host.querySelectorAll<HTMLButtonElement>('button[role="switch"]')].find((button) => document.getElementById(button.getAttribute("aria-labelledby") ?? "")?.textContent === label);
        if (!button) throw Error(`missing switch ${label}`);
        act(() => button.click());
        act(() => render());
    };
    try {
        act(() => render());
        edit("l2tpGateway", "vpn.example.com:1701");
        edit("MTU", "1380");
        if (type === "l2tp") {
            edit("username", "alice"); edit("password", "test-secret");
            edit("l2tpSharedSecret", "tunnel-secret");
            const select = field("l2tpAuthType");
            act(() => { select.value = "mschap-v2"; select.dispatchEvent(new Event("change", { bubbles: true })); });
            act(() => render());
            toggle("l2tpIPv6");
            edit("l2tpIPv6Address", "fd88::2/64");
            expect(saved.chain[0]).toMatchObject({ l2tp: { username: "alice", password: "test-secret", auth_type: "mschap-v2", ipv6_address: "fd88::2/64" } });
            toggle("l2tpIPv6");
            expect(JSON.stringify(saved)).not.toContain("ipv6_address");
        } else {
            edit("l2tpSharedSecret", "tunnel-secret");
            edit("l2tpRemoteEndID", "site-b");
            toggle("l2tpStatic");
            edit("l2tpLocalSessionID", "4294967295"); edit("l2tpPeerSessionID", "200");
            edit("l2tpLocalCookie", "1122334455667788"); edit("l2tpPeerCookie", "aabbccdd");
            edit("l2tpAddress", "10.89.0.2/24"); edit("softEtherIPv4Router", "10.89.0.1");
            expect(saved.chain[0]).toMatchObject({ l2tpv3: { static: true, local_session_id: 4294967295, peer_session_id: 200,
                local_cookie: "1122334455667788", peer_cookie: "aabbccdd", address: "10.89.0.2/24", router: "10.89.0.1" } });
            toggle("l2tpStatic");
            expect(field("l2tpRemoteEndID").value).toBe("site-b");
            expect(field("l2tpSharedSecret").value).toBe("tunnel-secret");
        }
        expect(saved.chain[0]).toMatchObject({ [type]: { gateway: "vpn.example.com:1701", mtu: 1380 } });
        expect(getNodeExtraInfo).not.toHaveBeenCalled();
        act(() => render(false));
        expect([...host.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input,select")].some((input) => !input.disabled)).toBe(false);
    } finally { act(() => root.unmount()); host.remove(); }
});

it.each(["l2tp", "l2tpv3"] as const)("loads cached %s information in nested chains and clears stale information", async (type) => {
    vi.mocked(getNodeExtraInfo).mockResolvedValueOnce({ [type]: { tunnel_prefixes: ["fd89::2/64"], auth: "pap", local_session_id: 4294967295 } }).mockRejectedValueOnce(Error("offline"));
    const saved = normalizeNode({ id: "l2tp-node", chain: [{ type: "network_split", network_split: { tcp: createDefaultProtocol(type) } }] });
    const host = document.createElement("div"); document.body.append(host);
    const root = createRoot(host); const noop = () => {};
    try {
        act(() => root.render(<NodeEditor value={saved} editable={false} groups={[]} onChange={noop} onProtocolChange={noop}
            onMoveProtocol={noop} onRemoveProtocol={noop} onAddProtocol={noop} />));
        expect(getNodeExtraInfo).not.toHaveBeenCalled();
        const button = host.querySelector<HTMLButtonElement>('button[aria-label="l2tpFetchInfo"]')!;
        await act(async () => button.click());
        expect(getNodeExtraInfo).toHaveBeenCalledWith("l2tp-node");
        expect(host.textContent).toContain("fd89::2/64"); expect(host.textContent).toContain("4294967295");
        await act(async () => button.click());
        expect(host.textContent).toContain("l2tpInfoUnavailable"); expect(host.textContent).not.toContain("fd89::2/64");
    } finally { act(() => root.unmount()); host.remove(); }
});
