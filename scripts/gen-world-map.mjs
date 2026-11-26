#!/usr/bin/env node
// Generates src/component/v2/stats/world-map-data.json from Natural Earth
// 1:110m Admin 0 countries (public domain), projected with Equal Earth.
//
//   curl -LO https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_110m_admin_0_countries.geojson
//   node scripts/gen-world-map.mjs ne_110m_admin_0_countries.geojson
//
// The output is static SVG path data keyed by ISO 3166-1 alpha-2, the codes
// the GeoIP database reports, so the page needs no map library at runtime.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const input = process.argv[2];
if (!input) {
  console.error("usage: node scripts/gen-world-map.mjs <ne_110m_admin_0_countries.geojson>");
  process.exit(2);
}
const output = fileURLToPath(new URL("../src/component/v2/stats/world-map-data.json", import.meta.url));
const WIDTH = 1000;

// Equal Earth (Šavrič, Patterson & Jenny, 2018).
const A1 = 1.340264, A2 = -0.081106, A3 = 0.000893, A4 = 0.003796, M = Math.sqrt(3) / 2;
function project([lon, lat]) {
  const lambda = (lon * Math.PI) / 180, phi = (lat * Math.PI) / 180;
  const theta = Math.asin(M * Math.sin(phi));
  const t2 = theta * theta, t6 = t2 * t2 * t2;
  const x = (lambda * Math.cos(theta)) / (M * (A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2)));
  const y = theta * (A1 + A2 * t2 + t6 * (A3 + A4 * t2));
  return [x, -y];
}

const geo = JSON.parse(readFileSync(input, "utf8"));
const features = geo.features.filter((f) => f.properties.ISO_A2_EH !== "AQ" && f.properties.NAME !== "Antarctica");

const projected = features.map((feature) => {
  const { type, coordinates } = feature.geometry;
  const polygons = type === "Polygon" ? [coordinates] : coordinates;
  return { feature, polygons: polygons.map((rings) => rings.map((ring) => ring.map(project))) };
});

let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
for (const { polygons } of projected) for (const rings of polygons) for (const ring of rings) for (const [x, y] of ring) {
  minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
}
const scale = WIDTH / (maxX - minX);
const height = Math.ceil((maxY - minY) * scale);
const round = (v) => Math.round(v * 10) / 10;
const toView = ([x, y]) => [round((x - minX) * scale), round((y - minY) * scale)];

function ringPath(ring) {
  const points = [];
  for (const point of ring.map(toView)) {
    const last = points[points.length - 1];
    if (!last || last[0] !== point[0] || last[1] !== point[1]) points.push(point);
  }
  if (points.length < 3) return "";
  return `M${points.map(([x, y]) => `${x} ${y}`).join("L")}Z`;
}

const countries = projected.map(({ feature, polygons }) => {
  const props = feature.properties;
  const code = props.ISO_A2_EH && props.ISO_A2_EH !== "-99" ? props.ISO_A2_EH : "";
  // Label position: centroid of the largest polygon's outer ring (by area).
  let best = null;
  for (const rings of polygons) {
    const outer = rings[0].map(toView);
    let area = 0, cx = 0, cy = 0;
    for (let i = 0, j = outer.length - 1; i < outer.length; j = i++) {
      const cross = outer[j][0] * outer[i][1] - outer[i][0] * outer[j][1];
      area += cross; cx += (outer[j][0] + outer[i][0]) * cross; cy += (outer[j][1] + outer[i][1]) * cross;
    }
    if (area && (!best || Math.abs(area) > Math.abs(best.area))) best = { area, x: cx / (3 * area), y: cy / (3 * area) };
  }
  return {
    code,
    name: props.NAME,
    d: polygons.flatMap((rings) => rings.map(ringPath)).join(""),
    center: best ? [round(best.x), round(best.y)] : [0, 0],
  };
}).sort((a, b) => a.code.localeCompare(b.code) || a.name.localeCompare(b.name));

// Places too small for the 1:110m shapes, drawn as dots instead. Many are
// common GeoIP answers (for example SG, HK, MO, BH, MT), so they must stay
// visible on the map.
const SMALL_PLACES = {
  AD: [1.52, 42.51], AG: [-61.8, 17.06], AI: [-63.07, 18.22], AS: [-170.7, -14.27], AW: [-69.97, 12.52],
  AX: [19.9, 60.1], BB: [-59.54, 13.19], BH: [50.56, 26.07], BL: [-62.83, 17.9], BM: [-64.75, 32.31],
  BQ: [-68.26, 12.18], CC: [96.87, -12.16], CK: [-159.78, -21.23], CV: [-23.6, 15.12], CW: [-68.99, 12.17],
  CX: [105.69, -10.45], DM: [-61.37, 15.41], FM: [158.2, 6.92], FO: [-6.91, 61.89], GD: [-61.68, 12.12],
  GF: [-53.1, 3.93], GG: [-2.58, 49.45], GI: [-5.35, 36.14], GP: [-61.55, 16.27], GU: [144.79, 13.44],
  HK: [114.17, 22.32], IM: [-4.55, 54.24], IO: [72.4, -7.3], JE: [-2.13, 49.21], KI: [173.0, 1.42],
  KM: [43.87, -11.88], KN: [-62.78, 17.36], KY: [-81.25, 19.31], LC: [-60.98, 13.91], LI: [9.55, 47.17],
  MC: [7.42, 43.74], MF: [-63.08, 18.07], MH: [171.18, 7.13], MO: [113.54, 22.2], MP: [145.7, 15.18],
  MQ: [-61.02, 14.64], MS: [-62.19, 16.74], MT: [14.38, 35.94], MU: [57.55, -20.35], MV: [73.22, 3.2],
  NF: [167.95, -29.04], NR: [166.93, -0.52], NU: [-169.87, -19.05], PF: [-149.4, -17.65], PM: [-56.3, 46.9],
  PW: [134.58, 7.51], RE: [55.54, -21.12], SC: [55.49, -4.68], SG: [103.82, 1.35], SH: [-5.7, -15.96],
  SM: [12.46, 43.94], ST: [6.61, 0.19], SX: [-63.05, 18.04], TC: [-71.8, 21.7], TO: [-175.2, -21.18],
  TV: [179.2, -8.52], VA: [12.45, 41.9], VC: [-61.29, 12.98], VG: [-64.62, 18.42], VI: [-64.9, 18.34],
  WF: [-176.2, -13.77], WS: [-172.1, -13.76], YT: [45.17, -12.83],
};
const shaped = new Set(countries.map((c) => c.code));
const points = Object.entries(SMALL_PLACES)
  .filter(([code]) => !shaped.has(code))
  .map(([code, lonLat]) => ({ code, center: toView(project(lonLat)) }));

writeFileSync(output, `${JSON.stringify({
  source: "Natural Earth 1:110m Admin 0 Countries v5.1.2 (public domain), Equal Earth projection",
  width: WIDTH, height, countries, points,
})}\n`);
console.log(`wrote ${countries.length} countries, ${points.length} points, ${WIDTH}x${height}, to ${output}`);
