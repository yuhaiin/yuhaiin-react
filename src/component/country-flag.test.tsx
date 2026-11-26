import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import { CountryFlag, hasCountryFlag } from "./country-flag";
import flags from "./flags/flags.json";

it("covers the codes GeoIP reports, including small places", () => {
  for (const code of ["JP", "US", "CN", "TW", "HK", "MO", "SG", "KR", "DE", "GB", "XK"]) expect(hasCountryFlag(code)).toBe(true);
  expect(hasCountryFlag("jp")).toBe(true);
  expect(hasCountryFlag("")).toBe(false);
  expect(hasCountryFlag("LAN")).toBe(false);
  expect(flags.codes).toEqual([...flags.codes].sort());
});

it("draws one sprite cell per code and nothing for unknown codes", () => {
  const host = document.createElement("div");
  const root = createRoot(host);
  act(() => root.render(<><CountryFlag code="jp" /><CountryFlag code="ZZ" /></>));
  const flag = host.querySelector<HTMLElement>("[data-flag]");
  expect(host.querySelectorAll("[data-flag]")).toHaveLength(1);
  expect(flag?.dataset.flag).toBe("JP");
  expect(flag?.getAttribute("aria-hidden")).toBe("true");
  const i = flags.codes.indexOf("JP");
  expect(flag?.style.backgroundPosition).toBe(`-${(i % flags.columns) * 16}px -${Math.floor(i / flags.columns) * 12}px`);
  act(() => root.unmount());
});
