import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { SWRConfig } from "swr";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { Config } from "@/contract/gateway";
import { newGateway, newRule } from "@/contract/gateway";
import GatewayPage from "./page";

const api = vi.hoisted(() => ({
  getGatewayConfig: vi.fn(),
  saveGatewayConfig: vi.fn(),
  gatewayStatus: vi.fn(),
  getGatewayCA: vi.fn(),
  generateGatewayCA: vi.fn(),
  importGatewayCA: vi.fn(),
  testGateway: vi.fn(),
  listInbounds: vi.fn(),
  refreshGatewayFilter: vi.fn(),
}));
vi.mock("@/api/gateway", () => api);
vi.mock("@/api/inbounds", () => api);
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@/component/route-target-picker", () => ({
  RouteTargetPicker: () => <div>existing target picker</div>,
}));

let host: HTMLDivElement;
let root: Root;
let config: Config;
beforeEach(() => {
  vi.clearAllMocks();
  const gateway = {
    ...newGateway(),
    id: "g",
    name: "Site gateway",
    revision: 1,
    enabled: true,
    ruleIds: ["ads"],
  };
  const rule = { ...newRule(), id: "ads", name: "Ads", revision: 1 };
  config = {
    revision: 1,
    gateways: [gateway],
    rules: [rule],
    upstreams: [],
    interceptions: [],
    filterLists: [],
  };
  api.getGatewayConfig.mockResolvedValue(config);
  api.gatewayStatus.mockResolvedValue({ revision: 1, gateways: [] });
  api.listInbounds.mockResolvedValue({
    items: [{ id: "mixed", name: "Mixed entry" }],
  });
  api.saveGatewayConfig.mockImplementation(async (value: Config) => ({
    ...value,
    revision: value.revision + 1,
  }));
  api.testGateway.mockResolvedValue({
    ruleId: "ads",
    action: rule.action,
    steps: [{ ruleId: "ads", name: "Ads", matched: true }],
    requiresMitm: true,
  });
  api.getGatewayCA.mockResolvedValue({
    revision: 0,
    present: false,
    fingerprint: "",
    subject: "",
    cacheCapacity: 512,
    cachedCertificates: 0,
  });
  api.generateGatewayCA.mockResolvedValue({
    revision: 1,
    present: true,
    fingerprint: "fingerprint",
    subject: "Yuhaiin Local CA",
    cacheCapacity: 512,
    cachedCertificates: 0,
  });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
});
async function render() {
  await act(async () =>
    root.render(
      <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
        <GatewayPage />
      </SWRConfig>,
    ),
  );
}
async function click(label: string) {
  const button = [...host.querySelectorAll<HTMLButtonElement>("button")].find(
    (button) => button.textContent?.trim() === label,
  );
  if (!button) throw Error(`Missing button ${label}`);
  await act(async () => button.click());
}
function input(label: string) {
  const target = [...host.querySelectorAll("label")].find(
    (element) => element.textContent === label,
  )?.htmlFor;
  const element = target ? document.getElementById(target) : null;
  if (!(element instanceof HTMLInputElement))
    throw Error(`Missing input ${label}`);
  return element;
}
function edit(element: HTMLInputElement, value: string) {
  act(() => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!.call(element, value);
    element.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

it("edits named gateway fields and saves the whole revision atomically", async () => {
  await render();
  edit(input("name"), "Updated site");
  await click("saveActivate");
  expect(api.saveGatewayConfig).toHaveBeenCalledWith(
    expect.objectContaining({
      revision: 1,
      gateways: [
        expect.objectContaining({ id: "g", name: "Updated site", revision: 1 }),
      ],
    }),
  );
  expect(host.textContent).toContain("saved");
});
it("retains unsaved input when the backend rejects an obsolete revision", async () => {
  api.saveGatewayConfig.mockRejectedValue({
    code: 409,
    msg: "revision conflict",
  });
  await render();
  edit(input("name"), "Unsaved site");
  await click("saveActivate");
  expect(host.querySelector('[role="alert"]')?.textContent).toContain(
    "revision conflict",
  );
  expect(input("name").value).toBe("Unsaved site");
});
it("runs the rule tester without sending HTTP traffic to the upstream", async () => {
  await render();
  await click("tester");
  edit(input("clientSourceIP"), "192.0.2.5");
  edit(input("process"), "browser");
  await click("runTest");
  expect(api.testGateway).toHaveBeenCalledWith(
    expect.objectContaining({
      gatewayId: "g",
      url: "https://example.com/ads/banner.js",
      method: "GET",
      sourceIp: "192.0.2.5",
      process: "browser",
    }),
  );
  expect(host.textContent).toContain("Ads");
  expect(host.textContent).toContain("matchedRule");
});
it("requires a separate explicit confirmation for CA generation", async () => {
  await render();
  await click("authority");
  expect(api.generateGatewayCA).not.toHaveBeenCalled();
  await click("generateCA");
  expect(api.generateGatewayCA).not.toHaveBeenCalled();
  await click("confirmCA");
  expect(api.generateGatewayCA).toHaveBeenCalledExactlyOnceWith(0);
  expect(host.textContent).toContain("fingerprint");
});

it("keeps a newly named resource expanded while editing", async () => {
  await render();
  await click("addGateway");
  const details = host.querySelectorAll("details")[1];
  expect(details.open).toBe(true);
  const name = details.querySelector<HTMLInputElement>("input")!;
  edit(name, "New site");
  expect(details.open).toBe(true);
  expect(name.value).toBe("New site");
});

it("deletes rules together with their Gateway references", async () => {
  await render();
  await click("rules");
  await click("delete");
  await click("saveActivate");
  expect(api.saveGatewayConfig).toHaveBeenCalledWith(
    expect.objectContaining({
      rules: [],
      gateways: [expect.objectContaining({ ruleIds: [] })],
    }),
  );
});

it("deletes a Gateway together with its interception and filters", async () => {
  config.interceptions = [
    {
      inboundId: "mixed",
      gatewayId: "g",
      mode: "http_only",
      domains: [],
      excludeDomains: [],
      ports: [],
      sources: [],
      processes: [],
      unknownTls: "passthrough",
    },
  ];
  config.filterLists = [
    {
      id: "f",
      name: "Filter",
      gatewayId: "g",
      enabled: true,
      revision: 1,
      text: "||example.com^",
    },
  ];
  await render();
  await click("delete");
  await click("saveActivate");
  expect(api.saveGatewayConfig).toHaveBeenCalledWith(
    expect.objectContaining({
      gateways: [],
      interceptions: [],
      filterLists: [],
    }),
  );
});

it("restores header fields when discarding changes", async () => {
  config.gateways[0].default.responseHeaders = { "X-Policy": ["original"] };
  await render();
  const header = () =>
    host.querySelector<HTMLInputElement>(
      '[aria-label="responseHeaders value 1"]',
    )!;
  edit(header(), "discard me");
  expect(header().value).toBe("discard me");
  await click("discard");
  expect(header().value).toBe("original");
  edit(header(), "new value");
  await click("saveActivate");
  expect(api.saveGatewayConfig).toHaveBeenCalledWith(
    expect.objectContaining({
      gateways: [
        expect.objectContaining({
          default: expect.objectContaining({
            responseHeaders: { "X-Policy": ["new value"] },
          }),
        }),
      ],
    }),
  );
});

it("clears previous response headers when changing action type", async () => {
  config.gateways[0].default.responseHeaders = { "X-Old": ["old action"] };
  await render();
  const combo = host.querySelector<HTMLButtonElement>(
    '[role="combobox"][aria-label="action"]',
  )!;
  await act(async () =>
    combo.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    ),
  );
  const option = [
    ...document.querySelectorAll<HTMLElement>('[role="option"]'),
  ].find((item) => item.textContent === "respond")!;
  await act(async () => option.click());
  expect(
    host.querySelector('[aria-label="responseHeaders value 1"]'),
  ).toBeNull();
});
