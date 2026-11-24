import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import type { TopologyNode } from "./model";
import { NodeIcon } from "./node-icon";

const hosts: HTMLElement[] = [];
afterEach(() => { for (const host of hosts.splice(0)) host.remove(); });

const app = (iconUrl?: string): TopologyNode => ({
    id: "source:app:com.android.chrome", column: "source", kind: "app", name: "Chrome", type: "app", iconUrl,
    status: "open", connections: 1, tcp: 1, udp: 0, up: 0, down: 0, connectionIds: ["1"],
});

function render(node: TopologyNode) {
    const host = document.createElement("div");
    document.body.append(host);
    hosts.push(host);
    act(() => createRoot(host).render(createElement(NodeIcon, { node, size: 16, imageSize: 24 })));
    return host;
}

describe("NodeIcon", () => {
    it("shows the app icon and falls back to the kind icon when it fails to load", () => {
        const host = render(app("/android/v1/apps/icon?package=com.android.chrome"));
        const image = host.querySelector("img")!;
        expect(image.getAttribute("src")).toBe("/android/v1/apps/icon?package=com.android.chrome");
        act(() => { image.dispatchEvent(new Event("error")); });
        expect(host.querySelector("img")).toBeNull();
        expect(host.querySelector("svg")).not.toBeNull();
    });
    it("shows the kind icon for nodes without an app icon", () => {
        const host = render(app());
        expect(host.querySelector("img")).toBeNull();
        expect(host.querySelector("svg")).not.toBeNull();
    });
});
