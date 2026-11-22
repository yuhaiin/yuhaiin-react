import { authorizeTest, resetTestAuth } from '@/test/auth';
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { SWRConfig } from "swr";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import GatewayStatisticsPage from "./page";

const api = vi.hoisted(() => ({
  getGatewayConfig: vi.fn(),
  gatewayStatus: vi.fn(),
  gatewayStatistics: vi.fn(),
  resetGatewayStatistics: vi.fn(),
}));
vi.mock("@/api/gateway", () => api);
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));
// Canvas charts are exercised by the model tests; jsdom has no canvas.
vi.mock("react-chartjs-2", () => ({ Line: () => <div>line chart</div>, Bar: () => <div>bar chart</div> }));
vi.mock("@/common/ThemeProvider", () => ({ useTheme: () => ({ resolved: "light" }) }));

const empty = (n: number) => Array.from({ length: n }, () => 0);
let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  vi.clearAllMocks();
  api.getGatewayConfig.mockResolvedValue({
    revision: 1, gateways: [{ id: "g", name: "Site gateway" }],
    rules: [{ id: "ads", name: "Ads" }], upstreams: [], interceptions: [], filterLists: [],
  });
  api.gatewayStatus.mockResolvedValue({
    revision: 1, gateways: [{
      id: "g", enabled: true, requests: 4, blocked: 3, forwarded: 1,
      errors: 0, tlsFailures: 0, protocolFailures: 0, durationNs: 4_000_000,
      lastOutbound: "Hysteria 2", filterReports: [], upstreams: [],
    }],
  });
  api.gatewayStatistics.mockResolvedValue({
    gateways: [{
      id: "g", sinceUnixMs: 1, activeRequests: 2, bytesIn: 0, bytesOut: 100,
      statusClasses: [0, 0, 1, 0, 3, 0],
      latency: [{ leMs: 10, count: 4 }, { leMs: 0, count: 0 }],
      rules: [{ id: "ads", hits: 3 }], filterHits: 0, defaultHits: 1,
      topHosts: [{ host: "ads.example", requests: 3, blocked: 3 }], hostCountError: 0,
      history: {
        intervalMs: 10_000, endUnixMs: 60_000,
        requests: [...empty(5), 4], blocked: [...empty(5), 3], forwarded: [...empty(5), 1], errors: empty(6),
        durationNs: [...empty(5), 4_000_000], bytesIn: empty(6), bytesOut: [...empty(5), 100],
      },
    }],
  });
  api.resetGatewayStatistics.mockResolvedValue({});
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
beforeEach(authorizeTest);
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  resetTestAuth();
});

async function render() {
  await act(async () => root.render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}><GatewayStatisticsPage /></SWRConfig>,
  ));
}
async function click(label: string) {
  const button = [...host.querySelectorAll<HTMLButtonElement>("button")].find((b) => b.textContent?.trim() === label);
  if (!button) throw Error(`Missing button ${label}`);
  await act(async () => button.click());
}

it("shows breakdowns with configured names", async () => {
  await render();
  expect(host.textContent).toContain("Site gateway");
  expect(host.textContent).toContain("75%");
  expect(host.textContent).toContain("Ads");
  expect(host.textContent).toContain("ads.example");
  expect(host.textContent).toContain("4xx");
  expect(host.textContent).toContain("Hysteria 2");
});

it("requires confirmation before resetting one Gateway", async () => {
  await render();
  await click("resetStatistics");
  expect(api.resetGatewayStatistics).not.toHaveBeenCalled();
  await click("confirmResetStatistics");
  expect(api.resetGatewayStatistics).toHaveBeenCalledExactlyOnceWith("g");
});

it("requires confirmation before resetting all Gateways", async () => {
  await render();
  await click("resetAllStatistics");
  await click("confirmResetStatistics");
  expect(api.resetGatewayStatistics).toHaveBeenCalledExactlyOnceWith("");
});
