import { authorizeTest, resetTestAuth } from "@/test/auth";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { SWRConfig } from "swr";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import ConnectionStatisticsPage from "./page";

const api = vi.hoisted(() => ({
  getConnectionStatistics: vi.fn(),
  resetConnectionStatistics: vi.fn(),
  getConnections: vi.fn(),
  getTotalFlow: vi.fn(),
  getTelemetry: vi.fn(),
  getFailedHistory: vi.fn(),
}));
const route = vi.hoisted(() => ({ listGeoIPCountries: vi.fn() }));
vi.mock("@/api/connections", () => api);
vi.mock("@/api/route", () => route);
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => options && "dimension" in options ? `${key}:${options.dimension}` : key,
    i18n: { language: "en", resolvedLanguage: "en" },
  }),
}));
// Canvas charts are exercised by the model tests; jsdom has no canvas.
vi.mock("react-chartjs-2", () => ({ Line: () => <div>line chart</div>, Bar: () => <div>bar chart</div> }));
vi.mock("@/common/ThemeProvider", () => ({ useTheme: () => ({ resolved: "light" }) }));

const zeros = (n: number) => Array.from({ length: n }, () => 0);
const history = {
  intervalMs: 10_000, endUnixMs: 60_000,
  opened: [...zeros(5), 3], failed: [...zeros(5), 1], closed: [...zeros(5), 1], active: [...zeros(5), 2],
  connectNs: [...zeros(5), 30_000_000], download: [...zeros(5), 2048], upload: [...zeros(5), 512],
};

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  vi.clearAllMocks();
  api.getConnectionStatistics.mockResolvedValue({
    sinceUnixMs: 1, active: 2, activeTcp: 1, activeUdp: 1, opened: 3, failed: 1, closed: 1, download: 2048, upload: 512,
    connectTime: [{ leMs: 10, count: 2 }, { leMs: 100, count: 1 }, { leMs: 0, count: 0 }],
    lifetime: [{ leMs: 1000, count: 1 }, { leMs: 0, count: 0 }],
    failures: [{ kind: "timeout", count: 1 }],
    history,
  });
  api.resetConnectionStatistics.mockResolvedValue(undefined);
  api.getConnections.mockResolvedValue({
    connections: [
      { id: "1", geo: "JP", outboundGeo: "US", domain: "a.example", nodeName: "Tokyo", network: { connType: "tcp" } },
      { id: "2", geo: "JP", outboundGeo: "US", domain: "b.example", nodeName: "Tokyo", network: { connType: "udp" } },
    ],
  });
  api.getTotalFlow.mockResolvedValue({ download: "0", upload: "0", counters: { "1": { download: "1024", upload: "10" } } });
  api.getTelemetry.mockResolvedValue({
    groups: [
      { dimension: "rule", items: [{ value: "streaming", download: "4096", upload: "0", failures: "2" }] },
      { dimension: "geo", items: [{ value: "DE", download: "900", upload: "100", failures: "4" }] },
    ],
  });
  api.getFailedHistory.mockResolvedValue({
    items: [{ protocol: "tcp", host: "down.example", error: "dial tcp 10.0.0.1:443: i/o timeout", process: "", time: "", failedCount: "2" }],
    dumpProcessEnabled: false,
  });
  route.listGeoIPCountries.mockResolvedValue({ codes: ["JP"], loaded: true });
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
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}><ConnectionStatisticsPage /></SWRConfig>,
  ));
  // The map data is imported lazily.
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 50)); });
}
function button(label: string) {
  const found = [...host.querySelectorAll<HTMLButtonElement>("button")].find((b) => b.textContent?.trim() === label);
  if (!found) throw Error(`Missing button ${label}`);
  return found;
}
async function click(label: string) {
  await act(async () => button(label).click());
}

it("shows runtime tiles, failure causes and recent failures", async () => {
  await render();
  const text = host.textContent ?? "";
  expect(text).toContain("25%"); // 1 failed of 4 attempts
  expect(text).toContain("failure.timeout");
  expect(text).toContain("down.example");
  expect(text).toContain("dial tcp <ip>: i/o timeout");
  expect(text).toContain("streaming");
});

it("maps open connections by country and links to the filtered list", async () => {
  await render();
  expect(host.querySelector('path[data-code="JP"]')?.getAttribute("fill")).toContain("color-mix");
  expect(host.querySelector('path[data-code="DE"]')?.getAttribute("fill")).toBe("var(--surface-muted)");
  const link = host.querySelector<HTMLAnchorElement>('a[href="#/docs/connections/v2?geo=JP"]');
  expect(link?.textContent).toContain("(JP)");
  expect(host.textContent).toContain("Tokyo");

  await click("geoOutbound");
  expect(host.querySelector('a[href="#/docs/connections/v2?outboundGeo=US"]')).not.toBeNull();
});

it("uses saved telemetry for a past range", async () => {
  await render();
  await click("range.24h");
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });
  const calls = api.getTelemetry.mock.calls;
  const [from, to, limit] = calls[calls.length - 1];
  expect(to.getTime() - from.getTime()).toBe(86_400_000);
  expect(limit).toBe(50);
  expect(host.querySelector('path[data-code="DE"]')?.getAttribute("fill")).toContain("color-mix");
  expect(host.querySelector('path[data-code="JP"]')?.getAttribute("fill")).toBe("var(--surface-muted)");
});

it("explains a missing GeoIP database", async () => {
  route.listGeoIPCountries.mockResolvedValue({ codes: [], loaded: false });
  api.getConnections.mockResolvedValue({ connections: [{ id: "1", geo: "", outboundGeo: "", domain: "a.example", network: { connType: "tcp" } }] });
  await render();
  expect(host.textContent).toContain("geoNotConfigured");
  expect(host.querySelector('a[href="#/docs/bypass/list"]')).not.toBeNull();
});

it("requires confirmation before resetting", async () => {
  await render();
  await click("reset");
  expect(api.resetConnectionStatistics).not.toHaveBeenCalled();
  await click("confirmReset");
  expect(api.resetConnectionStatistics).toHaveBeenCalledOnce();
});
