import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { SWRConfig } from "swr";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import HomeCountries from "./HomeCountries";

vi.mock("@/api/route", () => ({ listGeoIPCountries: vi.fn().mockResolvedValue({ codes: ["US"], loaded: true }) }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en", resolvedLanguage: "en" } }) }));

let host: HTMLDivElement;
let root: Root;
beforeEach(() => { host = document.createElement("div"); document.body.append(host); root = createRoot(host); });
afterEach(() => { act(() => root.unmount()); host.remove(); });

async function render(groups: { dimension: string; items: { value: string; download: string; upload: string; failures: string }[] }[]) {
  await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}>
    <HomeCountries range="24H" telemetry={{ groups } as never} />
  </SWRConfig>));
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 50)); });
}

it("shows the country map and ranked countries from the home telemetry", async () => {
  await render([{ dimension: "geo", items: [{ value: "US", download: "900", upload: "100", failures: "0" }, { value: "JP", download: "10", upload: "0", failures: "2" }] }]);
  expect(host.textContent).toContain("geoTitle");
  expect(host.querySelector('a[href="#/docs/connections/statistics"]')).not.toBeNull();
  expect(host.querySelector('[data-flag="US"]')).not.toBeNull();
  expect(host.querySelector('path[data-code="US"]')?.getAttribute("fill")).toContain("color-mix");
});

it("stays hidden for servers without country telemetry", async () => {
  await render([{ dimension: "protocol", items: [] }]);
  expect(host.innerHTML).toBe("");
});
