import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { createDefaultProtocol, normalizeNode, normalizeProtocol } from "@/contract/node";
import { NodeEditor } from "./NodeEditor";

vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

it("creates and normalizes a native SoftEther node without discarding future options", () => {
    const node = normalizeProtocol({type: "softether", softether: {
        gateway: "vpn.example:443", hub: "HUB", auth_type: "certificate",
        client_cert_pem: "cert", client_key_pem: "key", udp_acceleration: true,
        auto_reconnect: true, ipv6_address: "2001:db8::2/64", ipv6_router: "fe80::1"
    }});
    expect(node.type).toBe("softether");
    if (node.type !== "softether") throw Error("unexpected protocol");
    expect(node.softether.ipv6_router).toBe("fe80::1");
    expect(node.softether.client_key_pem).toBe("key");
    const defaults = createDefaultProtocol("softether");
    expect(defaults.softether.auto_reconnect).toBe(true);
    expect(defaults.softether.auth_type).toBe("password");
});

it("edits native SSL VPN node fields and retains cert, UDP and IPv6 options", () => {
    let saved = normalizeNode({ chain: [createDefaultProtocol("softether")] });
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    const noop = () => {};
    const render = () => root.render(<NodeEditor value={saved} editable groups={[]}
        onChange={noop}
        onProtocolChange={(index, protocol) => {
            saved = { ...saved, chain: saved.chain.map((p, i) => i === index ? protocol : p) };
        }}
        onMoveProtocol={noop} onRemoveProtocol={noop} onAddProtocol={noop} />);
    const edit = (label: string, value: string) => {
        const fieldLabel = [...host.querySelectorAll("label")].find(e => e.textContent === label)!;
        const input = fieldLabel.control as HTMLInputElement;
        expect(input).toBeTruthy();
        act(() => {
            Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
            input.dispatchEvent(new Event("input", { bubbles: true }));
        });
        act(render);
    };
    try {
        act(render);
        edit("softEtherGateway", "vpn.example.com:5555");
        edit("softEtherHub", "WORK");
        edit("username", "alice");
        edit("softEtherStaticIPv6", "2001:db8:42::5/64");
        edit("softEtherIPv6Router", "fe80::1");

        const controls = [...host.querySelectorAll<HTMLButtonElement>('[role="switch"]')];
        const accel = controls.find(e => document.getElementById(e.getAttribute("aria-labelledby") || "")?.textContent === "softEtherUDPAcceleration")!;
        expect(accel).toBeTruthy();
        expect(document.getElementById(accel.getAttribute("aria-describedby") || "")?.textContent)
            .toBe("softEtherUDPAccelerationHelp");
        const authLabel = [...host.querySelectorAll("label")].find(e => e.textContent === "softEtherAuthType");
        expect(authLabel?.control).toBe(host.querySelector("select"));
        act(() => accel.click());
        act(render);
        expect(saved.chain[0]).toMatchObject({ type:"softether", softether: {
            gateway:"vpn.example.com:5555",hub:"WORK",username:"alice",
            ipv6_address:"2001:db8:42::5/64",ipv6_router:"fe80::1",udp_acceleration:true,
            auto_reconnect:true
        }});
    } finally {
        act(() => root.unmount());
        host.remove();
    }
});
