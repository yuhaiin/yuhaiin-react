import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { normalizeNode } from "@/contract/node";
import { NodeEditor } from "./NodeEditor";

vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

it("selects an existing outbound group and accepts a new group name", () => {
    let node = normalizeNode({ id: "group-node", name: "Test node", group: "manual" });
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    const noop = () => {};
    const render = () => root.render(
        <NodeEditor
            value={node}
            editable
            groups={["manual", "existing-group", "other-group"]}
            onChange={(patch) => { node = normalizeNode({ ...node, ...patch }); }}
            onProtocolChange={noop}
            onMoveProtocol={noop}
            onRemoveProtocol={noop}
            onAddProtocol={noop}
        />,
    );

    try {
        act(render);
        const label = [...host.querySelectorAll("label")].find(item => item.textContent === "groupLabel");
        const input = label?.control as HTMLInputElement;
        expect(input).toBeInstanceOf(HTMLInputElement);
        expect(input.value).toBe("manual");

        // The full list must be accessible without first erasing the selected group.
        act(() => input.focus());
        const existingOption = [...document.querySelectorAll<HTMLElement>("[data-highlighted]")]
            .find(item => item.textContent === "existing-group");
        expect(existingOption).toBeDefined();
        act(() => existingOption!.click());
        act(render);
        expect(node.group).toBe("existing-group");
        expect(input.value).toBe("existing-group");

        // A value absent from the suggestions must be kept as a free-form group.
        act(() => {
            Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "brand-new-group");
            input.dispatchEvent(new Event("input", { bubbles: true }));
        });
        act(render);
        expect(node.group).toBe("brand-new-group");
        expect(input.value).toBe("brand-new-group");
        expect(node.name).toBe("Test node");
    } finally {
        act(() => root.unmount());
        host.remove();
    }
});
