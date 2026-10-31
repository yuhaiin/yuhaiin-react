import { authorizeTest, resetTestAuth } from '@/test/auth';
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { SWRConfig } from "swr";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { Config } from "@/contract/gateway";
import { newGateway, newRule, newUpstream } from "@/contract/gateway";
import GatewayPage from "./page";

const api = vi.hoisted(() => ({
  getGatewayConfig: vi.fn(),
  getGatewaySecrets: vi.fn(),
  saveGatewayConfig: vi.fn(),
  gatewayStatus: vi.fn(),
  resetGatewayStatistics: vi.fn(),
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
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }));
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
  api.resetGatewayStatistics.mockResolvedValue({});
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
beforeEach(authorizeTest);
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
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

it("explains why an imported disabled Gateway blocks selected traffic", async () => {
  config.gateways[0].enabled = false;
  config.gateways[0].rejectWhenDisabled = true;
  await render();
  expect(host.textContent).toContain("importedGatewayGuard");
});
async function click(label: string) {
  const button = [...host.querySelectorAll<HTMLButtonElement>("button")].find(
    (button) => button.textContent?.trim() === label || button.getAttribute("aria-label") === label,
  );
  if (!button) throw Error(`Missing button ${label}`);
  await act(async () => button.click());
}
async function selectGatewayItem(label: string) {
  const navigation = host.querySelector<HTMLElement>('nav[aria-label="gateway"]');
  const button = [...(navigation?.querySelectorAll<HTMLButtonElement>("button") ?? [])].find(
    (item) => item.querySelector("span")?.textContent?.trim() === label,
  );
  if (!button) throw Error(`Missing Gateway item ${label}`);
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

it("requires confirmation before resetting per-Gateway statistics", async () => {
  api.gatewayStatus.mockResolvedValue({
    revision: 1, gateways: [{
      id: "g", enabled: true, requests: 3, blocked: 2, forwarded: 1,
      errors: 0, tlsFailures: 0, protocolFailures: 0, durationNs: 9000000,
      lastOutbound: "", filterReports: [], upstreams: [],
    }],
  });
  await render();
  await click("statistics");
  await click("resetStatistics");
  expect(api.resetGatewayStatistics).not.toHaveBeenCalled();
  await click("cancel");
  expect(api.resetGatewayStatistics).not.toHaveBeenCalled();
  await click("resetStatistics");
  await click("confirmResetStatistics");
  expect(api.resetGatewayStatistics).toHaveBeenCalledExactlyOnceWith("g");
});

it("requires confirmation before resetting all Gateway statistics", async () => {
  api.gatewayStatus.mockResolvedValue({
    revision: 1, gateways: [{
      id: "g", enabled: true, requests: 1, blocked: 1, forwarded: 0,
      errors: 0, tlsFailures: 0, protocolFailures: 0, durationNs: 1000000,
      lastOutbound: "", filterReports: [], upstreams: [],
    }],
  });
  await render();
  await click("statistics");
  await click("resetAllStatistics");
  expect(api.resetGatewayStatistics).not.toHaveBeenCalled();
  await click("confirmResetStatistics");
  expect(api.resetGatewayStatistics).toHaveBeenCalledExactlyOnceWith("");
});

it("shows a startup failure while retaining the saved Gateway for repair", async () => {
  api.gatewayStatus.mockResolvedValue({
    revision: 1,
    gateways: [],
    startupError: "listen 127.0.0.1:8080: address already in use",
  });
  await render();
  expect(host.querySelector('[role="alert"]')?.textContent).toContain("address already in use");
  expect(host.textContent).toContain("Site gateway");
  edit(input("name"), "Repaired gateway");
  await click("saveActivate");
  expect(api.saveGatewayConfig).toHaveBeenCalledWith(expect.objectContaining({
    gateways: [expect.objectContaining({ name: "Repaired gateway" })],
  }));
});

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

it("selects a newly created Gateway for editing", async () => {
  await render();
  const create = host.querySelector<HTMLButtonElement>('aside[aria-label="gateways"] button[aria-expanded]');
  expect(create?.getAttribute("aria-expanded")).toBe("false");
  expect(host.querySelector('[role="group"][aria-label="chooseGatewayMode"]')).toBeNull();
  await click("addGateway");
  expect(create?.getAttribute("aria-expanded")).toBe("true");
  await click("createHttpListener");
  expect(host.querySelector('[role="group"][aria-label="chooseGatewayMode"]')).toBeNull();
  expect(config.gateways).toHaveLength(1);
  const selectedGateway = host.querySelector('aside[aria-label="gateways"] button[aria-current="true"]');
  expect(selectedGateway?.textContent).toContain("newGateway");
  const name = input("name");
  edit(name, "New site");
  expect(name.value).toBe("New site");
});


it("offers both Gateway modes inside the directory and can dismiss the chooser", async () => {
  await render();
  expect(host.textContent).not.toContain("addInterceptionGateway");
  expect(host.querySelector('aside[aria-label="gateways"] button[aria-label="addGateway"]')).toBeNull();
  await click("addGateway");
  expect(host.querySelector('[role="group"][aria-label="chooseGatewayMode"]')).not.toBeNull();
  await click("addGateway");
  expect(host.querySelector('[role="group"][aria-label="chooseGatewayMode"]')).toBeNull();
  expect(api.saveGatewayConfig).not.toHaveBeenCalled();
});

it("creates an HTTP listener Gateway without enabling interception", async () => {
  await render();
  await click("addGateway");
  await click("createHttpListener");
  await click("saveActivate");
  const saved = api.saveGatewayConfig.mock.lastCall?.[0] as Config;
  expect(saved.gateways).toHaveLength(2);
  expect(saved.gateways[1]).toEqual(expect.objectContaining({
    enabled: false,
    listen: "127.0.0.1:8080",
    default: expect.objectContaining({ type: "block" }),
  }));
  expect(saved.interceptions).toEqual([]);
});

it("deletes rules together with their Gateway references", async () => {
  await render();
  await selectGatewayItem("Ads");
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
  await click("delete Site gateway");
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
  await selectGatewayItem("defaultAction");
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
  await selectGatewayItem("defaultAction");
  const combo = host.querySelector<HTMLButtonElement>('[role="combobox"][aria-label="action"]')!;
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


it("creates an owned HTTP rule inline without navigating away", async () => {
  await render();
  await click("addRule");
  await click("saveActivate");
  expect(api.saveGatewayConfig).toHaveBeenCalledWith(
    expect.objectContaining({
      rules: expect.arrayContaining([expect.objectContaining({ revision: 0 })]),
      gateways: [expect.objectContaining({ ruleIds: expect.arrayContaining(["ads"]) })],
    }),
  );
});

it("creates an interception-only gateway with a safe forward fallback", async () => {
  await render();
  await click("addGateway");
  await click("createTrafficInterception");
  await click("saveActivate");
  const saved = api.saveGatewayConfig.mock.lastCall?.[0] as Config;
  expect(saved.gateways).toHaveLength(2);
  expect(saved.interceptions).toEqual([expect.objectContaining({ gatewayId: saved.gateways[1].id, mode: "http_only" })]);
  expect(api.listInbounds).not.toHaveBeenCalled();
  expect(saved.gateways[1]).toEqual(expect.objectContaining({
    enabled: true, listen: "", default: expect.objectContaining({
      type: "forward", outbound: { type: "inherit_route" },
    }),
  }));
});

it("never changes the Gateway fallback merely to create a backend pool", async () => {
  await render();
  const button = host.querySelector<HTMLButtonElement>('nav[aria-label="gateway"] button[aria-label="addUpstream"]');
  expect(button?.disabled).toBe(true);
  await click("addUpstream");
  expect(api.saveGatewayConfig).not.toHaveBeenCalled();
});


it("initializes the stream idle timeout to disabled", () => {
  expect(newUpstream().streamIdleTimeoutMs).toBe(0);
});

it("preserves a configured stream idle timeout when editing another upstream field", async () => {
  const pool = {
    ...newUpstream(),
    id: "pool-a",
    name: "Pool A",
    streamIdleTimeoutMs: 45000,
  };
  config.upstreams = [pool];
  config.gateways[0].default = {
    ...config.gateways[0].default,
    type: "reverse_proxy",
    upstream: pool.id,
  };
  await render();
  await selectGatewayItem("Pool A");
  expect(input("streamIdleTimeoutMs").value).toBe("45000");
  edit(input("name"), "Renamed pool");
  await click("saveActivate");
  const saved = api.saveGatewayConfig.mock.lastCall?.[0] as Config;
  expect(saved.upstreams).toEqual([
    expect.objectContaining({
      id: pool.id,
      name: "Renamed pool",
      streamIdleTimeoutMs: 45000,
    }),
  ]);
});

it("edits and saves the stream idle timeout independently of request timeout", async () => {
  const pool = {
    ...newUpstream(),
    id: "pool-a",
    name: "Pool A",
    requestTimeoutMs: 5000,
  };
  config.upstreams = [pool];
  config.gateways[0].default = {
    ...config.gateways[0].default,
    type: "reverse_proxy",
    upstream: pool.id,
  };
  await render();
  await selectGatewayItem("Pool A");
  expect(input("streamIdleTimeoutMs").value).toBe("0");
  edit(input("streamIdleTimeoutMs"), "30000");
  await click("saveActivate");
  const saved = api.saveGatewayConfig.mock.lastCall?.[0] as Config;
  expect(saved.upstreams[0]).toEqual(
    expect.objectContaining({
      requestTimeoutMs: 5000,
      idleTimeoutMs: 90000,
      streamIdleTimeoutMs: 30000,
    }),
  );
});

it("creates a backend pool only for an explicitly selected reverse proxy action", async () => {
  config.gateways[0].default = {
    ...config.gateways[0].default, type: "reverse_proxy", upstream: "",
  };
  await render();
  await click("addUpstream");
  await click("saveActivate");
  const saved = api.saveGatewayConfig.mock.lastCall?.[0] as Config;
  expect(saved.upstreams).toHaveLength(1);
  expect(saved.gateways[0].default).toEqual(
    expect.objectContaining({ type: "reverse_proxy", upstream: saved.upstreams[0].id }),
  );
});

it("creates a second backend pool for a new reverse rule without changing the fallback pool", async () => {
  const pool = { ...newUpstream(), id: "pool-a", name: "Pool A" };
  config.upstreams = [pool];
  config.gateways[0].default = { ...config.gateways[0].default, type: "reverse_proxy", upstream: pool.id };
  await render();
  await selectGatewayItem("Ads");
  const action = host.querySelector<HTMLButtonElement>('[role="combobox"][aria-label="action"]')!;
  await act(async () => action.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })));
  const reverse = [...document.querySelectorAll<HTMLElement>('[role="option"]')]
    .find(option => option.textContent === "reverse_proxy")!;
  await act(async () => reverse.click());
  const addPool = host.querySelector<HTMLButtonElement>('nav[aria-label="gateway"] button[aria-label="addUpstream"]')!;
  expect(addPool.disabled).toBe(false);
  await click("addUpstream");
  await click("saveActivate");
  const saved = api.saveGatewayConfig.mock.lastCall?.[0] as Config;
  expect(saved.upstreams).toHaveLength(2);
  expect(saved.rules[0].action.upstream).toBe(saved.upstreams[1].id);
  expect(saved.gateways[0].default.upstream).toBe(pool.id);
});

it("lets an existing reverse rule select a new pool while the fallback retains its pool", async () => {
  const pool = { ...newUpstream(), id: "pool-a", name: "Pool A" };
  config.upstreams = [pool];
  config.gateways[0].default = { ...config.gateways[0].default, type: "reverse_proxy", upstream: pool.id };
  config.rules[0].action = { ...config.rules[0].action, type: "reverse_proxy", upstream: pool.id };
  await render();
  await selectGatewayItem("Ads");
  const upstream = host.querySelector<HTMLButtonElement>('[role="combobox"][aria-label="upstream"]')!;
  await act(async () => upstream.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })));
  const create = [...document.querySelectorAll<HTMLElement>('[role="option"]')]
    .find(option => option.textContent === "newBackendPool");
  expect(create).toBeDefined();
  await act(async () => create!.click());
  await click("addUpstream");
  await click("saveActivate");
  const saved = api.saveGatewayConfig.mock.lastCall?.[0] as Config;
  expect(saved.upstreams).toHaveLength(2);
  expect(saved.rules[0].action.upstream).toBe(saved.upstreams[1].id);
  expect(saved.gateways[0].default.upstream).toBe(pool.id);
});

it("shows scoped filters and allows editing within the owning gateway", async () => {
  await render();
  await click("addFilter");
  await click("saveActivate");
  const saved = api.saveGatewayConfig.mock.lastCall?.[0] as Config;
  expect(saved.filterLists).toEqual([
    expect.objectContaining({ gatewayId: "g", enabled: true }),
  ]);
});


it("configures HTTPS MITM directly on the Gateway without attaching an Inbound", async () => {
  await render();
  await selectGatewayItem("interception");
  expect(host.textContent).not.toContain("addSource");
  const mode = host.querySelector<HTMLButtonElement>('[role="combobox"][aria-label="interceptionMode"]')!;
  await act(async () => mode.click());
  const mitm = [...document.querySelectorAll<HTMLElement>('[role="option"]')]
    .find(option => option.textContent === "https_mitm")!;
  await act(async () => mitm.click());
  edit(input("domains"), "app.example.com");
  await click("saveActivate");
  expect(api.saveGatewayConfig).toHaveBeenCalledWith(expect.objectContaining({
    interceptions: [expect.objectContaining({ gatewayId: "g", mode: "https_mitm", domains: ["app.example.com"] })],
  }));
  expect(api.listInbounds).not.toHaveBeenCalled();
});

afterEach(resetTestAuth);
