// Generates a lightweight dot-matrix world map (no runtime geo libraries needed).
// Run: npm run build:map
import { geoContains, geoBounds } from 'd3-geo';
import { feature, merge } from 'topojson-client';
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const topo = JSON.parse(readFileSync(require.resolve('world-atlas/countries-50m.json'), 'utf8'));

const STEP = 1.25; // degrees between dots
const LAT_TOP = 76;
const LAT_BOTTOM = -56;
const COLS = Math.round(360 / STEP);
const ROWS = Math.round((LAT_TOP - LAT_BOTTOM) / STEP);

// Highlighted nations: ISO numeric id + "home" bounding box (excludes far overseas territories)
const NATIONS = {
  il: { iso: '376', box: [33, 29, 37, 34] },
  us: { iso: '840', box: [-180, 15, -60, 75] },
  gb: { iso: '826', box: [-9, 49, 3, 61] },
  fr: { iso: '250', box: [-6, 41, 10, 52] },
  de: { iso: '276', box: [5, 47, 16, 56] },
};

const land = merge(topo, topo.objects.countries.geometries);
const countries = feature(topo, topo.objects.countries).features;

const lonOf = (c) => -180 + STEP / 2 + c * STEP;
const latOf = (r) => LAT_TOP - STEP / 2 - r * STEP;

// Encode a set of grid cells as a compact SVG path of zero-length segments (rendered as round dots).
function encode(cells) {
  const byRow = new Map();
  for (const [c, r] of cells) {
    if (!byRow.has(r)) byRow.set(r, []);
    byRow.get(r).push(c);
  }
  let d = '';
  for (const r of [...byRow.keys()].sort((a, b) => a - b)) {
    const cols = byRow.get(r).sort((a, b) => a - b);
    let prev = null;
    for (const c of cols) {
      d += prev === null ? `M${c} ${r}h0` : `m${+(c - prev).toFixed(2)} 0h0`;
      prev = c;
    }
  }
  return d;
}

const landCells = [];
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    if (geoContains(land, [lonOf(c), latOf(r)])) landCells.push([c, r]);
  }
}

const nationOut = {};
for (const [id, { iso, box }] of Object.entries(NATIONS)) {
  const f = countries.find((x) => String(x.id) === iso);
  const [[w, s], [e, n]] = geoBounds(f);
  const cells = [];
  // Standard grid
  for (let r = 0; r < ROWS; r++) {
    const lat = latOf(r);
    if (lat < s || lat > n || lat < box[1] || lat > box[3]) continue;
    for (let c = 0; c < COLS; c++) {
      const lon = lonOf(c);
      if (lon < box[0] || lon > box[2]) continue;
      if (geoContains(f, [lon, lat])) cells.push([c, r]);
    }
  }
  // Small nations: guarantee visibility with a denser local sample snapped to half-cells
  let fine = [];
  if (cells.length < 6) {
    const sub = STEP / 3;
    for (let lat = box[3]; lat >= box[1]; lat -= sub) {
      for (let lon = box[0]; lon <= box[2]; lon += sub) {
        if (geoContains(f, [lon, lat])) {
          const c = Math.round(((lon + 180) / STEP - 0.5) * 3) / 3;
          const r = Math.round(((LAT_TOP - lat) / STEP - 0.5) * 3) / 3;
          fine.push([+c.toFixed(2), +r.toFixed(2)]);
        }
      }
    }
  }
  nationOut[id] = { d: encode(fine.length ? fine : cells), fine: fine.length > 0, count: (fine.length || cells.length) };
  void w; void e;
}

const out = {
  step: STEP,
  latTop: LAT_TOP,
  cols: COLS,
  rows: ROWS,
  land: encode(landCells),
  nations: Object.fromEntries(Object.entries(nationOut).map(([k, v]) => [k, { d: v.d, fine: v.fine }])),
};
writeFileSync(new URL('../src/game/data/worldDots.json', import.meta.url), JSON.stringify(out));
console.log('land dots', landCells.length, Object.fromEntries(Object.entries(nationOut).map(([k, v]) => [k, v.count])));
