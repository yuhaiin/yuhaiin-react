import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { createDefaultProtocol, normalizeNode, type NodeProtocol } from "@/contract/node";
import { NodeEditor } from "./NodeEditor";

vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

function mountEditor(protocol: NodeProtocol) {
    let saved = normalizeNode({ chain: [protocol] });
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    const noop = () => {};
    const render = () => root.render(<NodeEditor value={saved} editable groups={[]}
        onChange={(patch) => { saved = normalizeNode({ ...saved, ...patch }); }}
        onProtocolChange={(index, next) => {
            saved = { ...saved, chain: saved.chain.map((item, i) => i === index ? next : item) };
        }}
        onMoveProtocol={noop} onRemoveProtocol={noop} onAddProtocol={noop} />);
    act(render);

    const edit = (label: string, value: string) => {
        const fieldLabel = [...host.querySelectorAll("label")].find((element) => element.textContent === label);
        const input = (fieldLabel?.control as HTMLInputElement | HTMLTextAreaElement | null)
            ?? [...host.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input,textarea")]
                .find((element) => element.getAttribute("aria-label") === label);
        if (!input) throw new Error(`missing ${label} field`);
        act(() => {
            const prototype = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
            Object.getOwnPropertyDescriptor(prototype, "value")!.set!.call(input, value);
            input.dispatchEvent(new Event("input", { bubbles: true }));
        });
        act(render);
    };
    const toggle = (label: string) => {
        const control = [...host.querySelectorAll<HTMLButtonElement>('[role="switch"]')].find((button) => {
            const labelID = button.getAttribute("aria-labelledby");
            return labelID !== null && document.getElementById(labelID)?.textContent === label;
        });
        expect(control, `missing ${label} switch`).toBeTruthy();
        act(() => control!.click());
        act(render);
    };

    return {
        host,
        get saved() { return saved; },
        edit,
        toggle,
        unmount() {
            act(() => root.unmount());
            host.remove();
        },
    };
}

it("edits IKEv2 credentials and transport options without dropping the other fields", () => {
    const editor = mountEditor(createDefaultProtocol("ikev2"));
    try {
        editor.edit("IKEv2 Gateway", "vpn.example.test:500");
        editor.edit("Local ID", "alice@example.test");
        editor.edit("Server ID (optional)", "vpn.example.test");
        editor.edit("IPsec PSK", "shared-secret");
        editor.edit("EAP username", "alice");
        editor.edit("EAP password", "eap-secret");
        editor.toggle("TCP encapsulation (RFC 8229)");
        editor.edit("MTU", "1370");
        expect(editor.saved.chain[0]).toMatchObject({ type: "ikev2", ikev2: {
            gateway: "vpn.example.test:500", local_id: "alice@example.test", server_id: "vpn.example.test",
            psk: "shared-secret", username: "alice", password: "eap-secret", tcp: true, mtu: 1370,
        } });
    } finally {
        editor.unmount();
    }
});

it("edits AnyConnect TLS and DTLS options", () => {
    const editor = mountEditor(createDefaultProtocol("anyconnect"));
    try {
        editor.edit("AnyConnect / ocserv gateway", "vpn.example.test:8443");
        editor.edit("Username", "alice");
        editor.edit("Password", "secret");
        editor.edit("MTU", "1300");
        editor.toggle("Skip TLS certificate verification");
        editor.toggle("Disable DTLS (TLS data channel only)");
        expect(editor.saved.chain[0]).toMatchObject({ type: "anyconnect", anyconnect: {
            gateway: "vpn.example.test:8443", username: "alice", password: "secret", mtu: 1300,
            insecure_skip_verify: true, disable_dtls: true,
        } });
    } finally {
        editor.unmount();
    }
});

it("edits SSTP authentication, certificate verification and MTU", () => {
    const editor = mountEditor(createDefaultProtocol("sstp"));
    try {
        editor.edit("SSTP gateway (TLS/443)", "vpn.example.test:5443");
        editor.edit("Username", "alice");
        editor.edit("Password", "secret");
        editor.edit("MTU", "1420");
        editor.toggle("Skip TLS certificate verification");
        expect(editor.saved.chain[0]).toMatchObject({ type: "sstp", sstp: {
            gateway: "vpn.example.test:5443", username: "alice", password: "secret", mtu: 1420,
            insecure_skip_verify: true,
        } });
    } finally {
        editor.unmount();
    }
});

it("edits Fortinet MFA, CA and data-channel settings", () => {
    const editor = mountEditor(createDefaultProtocol("fortinet"));
    try {
        editor.edit("Fortinet SSL VPN gateway", "vpn.example.test:10443");
        editor.edit("Username", "alice");
        editor.edit("Password", "secret");
        editor.edit("Realm (optional)", "employees");
        editor.edit("One-time token", "123456");
        editor.edit("TOTP secret", "JBSWY3DPEHPK3PXP");
        editor.edit("Trusted CA certificate (PEM)", "-----BEGIN CERTIFICATE-----\nbase64\n-----END CERTIFICATE-----");
        editor.edit("MTU", "1300");
        editor.toggle("Skip TLS certificate verification");
        editor.toggle("Disable DTLS");
        expect(editor.saved.chain[0]).toMatchObject({ type: "fortinet", fortinet: {
            gateway: "vpn.example.test:10443", username: "alice", password: "secret", realm: "employees",
            token: "123456", totp_secret: "JBSWY3DPEHPK3PXP",
            ca_cert_pem: "-----BEGIN CERTIFICATE-----\nbase64\n-----END CERTIFICATE-----",
            mtu: 1300, insecure_skip_verify: true, disable_dtls: true,
        } });
    } finally {
        editor.unmount();
    }
});
