import { expect, it } from "vitest";
import { bucketPercentile, formatDuration } from "./format";
import { colorStep, loadWorldMap } from "./world-map";

it("colors on a log scale and leaves empty countries blank", () => {
  expect(colorStep(0, 100)).toBe(-1);
  expect(colorStep(100, 100)).toBe(4);
  expect(colorStep(1, 1_000_000)).toBe(0);
  expect(colorStep(1000, 1_000_000)).toBeGreaterThan(colorStep(10, 1_000_000));
  // Close values still spread across the scale.
  expect(colorStep(6_000, 25_000, 6_000)).toBe(0);
  expect(colorStep(19_000, 25_000, 6_000)).toBeGreaterThan(2);
});

it("ships shapes keyed by alpha-2 codes, with dots for places too small to draw", async () => {
  const map = await loadWorldMap();
  const codes = new Set(map.countries.map((c) => c.code));
  for (const code of ["US", "JP", "CN", "DE", "TW", "FR", "NO"]) expect(codes).toContain(code);
  const dots = new Set(map.points.map((p) => p.code));
  for (const code of ["SG", "HK", "MO"]) expect(dots).toContain(code);
  expect(map.countries.every((c) => c.d.startsWith("M"))).toBe(true);
});

it("formats percentiles and lifetimes", () => {
  expect(bucketPercentile([{ leMs: 1000, count: 1 }, { leMs: 0, count: 1 }], 0.99)).toBe(Infinity);
  expect(formatDuration(45_000)).toBe("45 s");
  expect(formatDuration(300_000)).toBe("5 min");
  expect(formatDuration(5_400_000)).toBe("1.5 h");
});
