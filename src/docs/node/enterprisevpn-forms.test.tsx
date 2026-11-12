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
        editor.edit("nodeForm.ikev2Gateway", "vpn.example.test:500");
        editor.edit("nodeForm.localId", "alice@example.test");
        editor.edit("nodeForm.serverIdOptional", "vpn.example.test");
        editor.edit("nodeForm.ipsecPsk", "shared-secret");
        editor.edit("nodeForm.eapUsername", "alice");
        editor.edit("nodeForm.eapPassword", "eap-secret");
        editor.toggle("nodeForm.tcpEncapsulation");
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
        editor.edit("nodeForm.anyconnectGateway", "vpn.example.test:8443");
        editor.edit("username", "alice");
        editor.edit("password", "secret");
        editor.edit("MTU", "1300");
        editor.toggle("nodeForm.skipTlsVerify");
        editor.toggle("nodeForm.disableDtlsDataChannel");
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
        editor.edit("nodeForm.sstpGateway", "vpn.example.test:5443");
        editor.edit("username", "alice");
        editor.edit("password", "secret");
        editor.edit("MTU", "1420");
        editor.toggle("nodeForm.skipTlsVerify");
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
        editor.edit("nodeForm.fortinetGateway", "vpn.example.test:10443");
        editor.edit("username", "alice");
        editor.edit("password", "secret");
        editor.edit("nodeForm.realmOptional", "employees");
        editor.edit("nodeForm.oneTimeToken", "123456");
        editor.edit("nodeForm.totpSecret", "JBSWY3DPEHPK3PXP");
        editor.edit("nodeForm.trustedCaPem", "-----BEGIN CERTIFICATE-----\nbase64\n-----END CERTIFICATE-----");
        editor.edit("MTU", "1300");
        editor.toggle("nodeForm.skipTlsVerify");
        editor.toggle("nodeForm.disableDtls");
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
