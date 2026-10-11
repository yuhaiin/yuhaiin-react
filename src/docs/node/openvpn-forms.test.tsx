import { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, expect, it, vi } from "vitest";
import { getNodeExtraInfo } from "@/api/nodes";
import { createDefaultProtocol, normalizeNode, normalizeProtocol } from "@/contract/node";
import { NodeEditor } from "./NodeEditor";

vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock("@/api/nodes", () => ({ getNodeExtraInfo: vi.fn() }));
beforeEach(() => vi.clearAllMocks());

it("retains OpenVPN credentials and explicit options in imported nested chains", () => {
    const source = { type: "network_split", network_split: {
        tcp: { type: "openvpn", openvpn: {
            gateway: "vpn.example:1194", network: "tcp", client_cert_pem: "cert",
            client_key_pem: "key", tls_auth_key: "static", key_direction: 0,
            data_ciphers: ["AES-128-GCM"], auto_reconnect: false, renegotiate_seconds: 60,
        } }, udp: createDefaultProtocol("direct"),
    } };
    expect(normalizeProtocol(JSON.parse(JSON.stringify(source)))).toMatchObject(source);
    expect(createDefaultProtocol("openvpn").openvpn).toMatchObject({
        network: "udp", insecure_skip_verify: false, auto_reconnect: false,
    });
});

it("edits credentials and makes control keys mutually exclusive in the saved node", () => {
    let saved = normalizeNode({ chain: [createDefaultProtocol("openvpn")] });
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    const noop = () => {};
    const render = (editable = true) => root.render(<NodeEditor value={saved} editable={editable} groups={[]}
        onChange={noop} onProtocolChange={(index, protocol) => {
            saved = { ...saved, chain: saved.chain.map((item, i) => i === index ? protocol : item) };
        }} onMoveProtocol={noop} onRemoveProtocol={noop} onAddProtocol={noop} />);
    const field = (label: string) => {
        const input = [...host.querySelectorAll("label")].find((item) => item.textContent === label)?.control;
        if (!input) throw Error(`missing field ${label}`);
        return input;
    };
    const edit = (label: string, value: string) => {
        const input = field(label);
        const prototype = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
        act(() => {
            Object.getOwnPropertyDescriptor(prototype, "value")!.set!.call(input, value);
            input.dispatchEvent(new Event("input", { bubbles: true }));
        });
        act(() => render());
    };
    const select = (label: string, value: string) => {
        const input = field(label) as HTMLSelectElement;
        act(() => { input.value = value; input.dispatchEvent(new Event("change", { bubbles: true })); });
        act(() => render());
    };
    try {
        act(() => render());
        edit("openVPNGateway", "vpn.example.com:1194");
        edit("username", "alice");
        edit("password", "test-secret");
        edit("openVPNClientCert", "client-cert");
        edit("openVPNClientKey", "client-key");
        select("openVPNNetwork", "tcp");
        select("openVPNProtection", "tls-crypt");
        edit("openVPNStaticKey", "old-crypt-key");
        select("openVPNProtection", "tls-auth");
        edit("openVPNStaticKey", "auth-key");
        select("openVPNKeyDirection", "0");
        select("openVPNAuthDigest", "SHA512");
        expect(JSON.parse(JSON.stringify(saved)).chain[0]).toMatchObject({ type: "openvpn", openvpn: {
            gateway: "vpn.example.com:1194", network: "tcp", username: "alice", password: "test-secret",
            client_cert_pem: "client-cert", client_key_pem: "client-key",
            tls_auth_key: "auth-key", key_direction: 0, auth: "SHA512",
        } });
        expect(JSON.stringify(saved)).not.toContain("tls_crypt_key");
        select("openVPNProtection", "none");
        expect(JSON.stringify(saved)).not.toContain("tls_auth_key");
        for (const cipher of ["AES-256-GCM", "CHACHA20-POLY1305"]) {
            const input = field(cipher) as HTMLInputElement;
            act(() => input.click());
            act(() => render());
        }
        expect(saved.chain[0]).toMatchObject({ openvpn: { data_ciphers: ["AES-128-GCM"] } });
        expect((field("AES-128-GCM") as HTMLInputElement).disabled).toBe(true);
        expect(getNodeExtraInfo).not.toHaveBeenCalled();
        act(() => render(false));
        expect([...host.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input,select,textarea")]
            .filter((input) => !input.disabled)).toEqual([]);
    } finally {
        act(() => root.unmount());
        host.remove();
    }
});

it("loads cached OpenVPN information on demand for a nested outbound and clears stale data", async () => {
    vi.mocked(getNodeExtraInfo).mockResolvedValueOnce({ openvpn: {
        tunnel_prefixes: ["10.8.0.2/24", "fd88::2/64"], dns: ["10.8.0.1"],
        routes: ["route 10.99.0.0 255.255.0.0"], cipher: "AES-256-GCM", mtu: 1400,
    } }).mockResolvedValueOnce({});
    const saved = normalizeNode({ id: "ovpn-node", chain: [{ type: "network_split", network_split: {
        tcp: createDefaultProtocol("openvpn"), udp: createDefaultProtocol("direct"),
    } }] });
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    const noop = () => {};
    try {
        act(() => root.render(<NodeEditor value={saved} editable={false} groups={[]}
            onChange={noop} onProtocolChange={noop} onMoveProtocol={noop} onRemoveProtocol={noop} onAddProtocol={noop} />));
        expect(getNodeExtraInfo).not.toHaveBeenCalled();
        const button = host.querySelector<HTMLButtonElement>('button[aria-label="openVPNFetchInfo"]')!;
        await act(async () => button.click());
        expect(getNodeExtraInfo).toHaveBeenCalledWith("ovpn-node");
        expect(host.textContent).toContain("fd88::2/64");
        expect(host.textContent).toContain("route 10.99.0.0 255.255.0.0");
        await act(async () => button.click());
        expect(host.textContent).toContain("openVPNInfoUnavailable");
        expect(host.textContent).not.toContain("fd88::2/64");
    } finally {
        act(() => root.unmount());
        host.remove();
    }
});
