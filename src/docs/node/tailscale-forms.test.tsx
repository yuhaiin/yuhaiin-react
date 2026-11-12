import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { createDefaultProtocol, normalizeNode } from "@/contract/node";
import { NodeEditor } from "./NodeEditor";

vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

it.each(["tailscale", "tailscale-lite"] as const)("edits %s without changing its protocol type", (type) => {
    let saved = normalizeNode({ chain: [createDefaultProtocol(type)] });
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    const noop = () => {};
    const render = (editable = true) => root.render(<NodeEditor value={saved} editable={editable} groups={[]}
        onChange={noop}
        onProtocolChange={(index, protocol) => {
            saved = { ...saved, chain: saved.chain.map((p, i) => i === index ? protocol : p) };
        }}
        onMoveProtocol={noop} onRemoveProtocol={noop} onAddProtocol={noop} />);
    const input = (label: string) => {
        const fieldLabel = [...host.querySelectorAll("label")].find(e => e.textContent === label)!;
        return fieldLabel.control as HTMLInputElement;
    };
    const edit = (label: string, value: string) => {
        const field = input(label);
        act(() => {
            Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(field, value);
            field.dispatchEvent(new Event("input", { bubbles: true }));
        });
        act(() => render());
    };
    try {
        act(() => render());
        edit("hostname", "lite-host");
        edit("authKey", "test-only-key");
        edit("controlUrl", "https://control.example");
        expect(saved.chain[0]).toMatchObject({type, [type]: {
            hostname: "lite-host", auth_key: "test-only-key", control_url: "https://control.example",
        }});
        act(() => render(false));
        expect(host.textContent).toContain("lite-host");
        expect(host.querySelector('input[value="lite-host"]')).toBeNull();
    } finally {
        act(() => root.unmount());
        host.remove();
    }
});
