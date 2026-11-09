// Casa as cidades do jogo com o Natural Earth (populated places) e lista os nomes em português diferentes.
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const [nePath, out] = process.argv.slice(2);
const ne = JSON.parse(fs.readFileSync(nePath, 'utf8')).features;
const all = require('all-the-cities');
const byId = new Map(all.map((c) => [c.cityId, c]));
const game = JSON.parse(fs.readFileSync('src/data/cities.json', 'utf8'));
const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[-'’‘]/g, ' ').replace(/\s+/g, ' ').trim();
const rad = (d) => (d * Math.PI) / 180;
const hav = (a, b, c, d) => 2 * 6371 * Math.asin(Math.sqrt(Math.sin(rad(c - a) / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(rad(d - b) / 2) ** 2));
const idx = new Map();
for (const f of ne) { const [lon, lat] = f.geometry.coordinates; const k = Math.round(lat); if (!idx.has(k)) idx.set(k, []); idx.get(k).push({ lat, lon, q: f.properties }); }
const rows = [];
for (const [id, n, cc, lat, lon, pop] of game) {
  const g = byId.get(id);
  const keys = new Set([norm(g.name), norm(n), norm(g.altName)].filter(Boolean));
  let best = null;
  for (const k of [Math.round(lat) - 1, Math.round(lat), Math.round(lat) + 1]) for (const e of idx.get(k) || []) {
    const d = hav(lat, lon, e.lat, e.lon);
    if (d > 30) continue;
    const names = [e.q.NAME, e.q.NAMEASCII, e.q.NAME_EN, ...(e.q.NAMEALT || '').split(/[|,]/)].map(norm).filter(Boolean);
    if (names.some((x) => keys.has(x)) && (!best || d < best.d)) best = { d, q: e.q };
  }
  if (!best) continue;
  const pt = best.q.NAME_PT;
  if (pt && norm(pt) !== norm(n)) rows.push({ id, geonames: g.name, atual: n, cc, pop, ne_pt: pt, wikidata: best.q.WIKIDATAID });
}
rows.sort((a, b) => b.pop - a.pop);
fs.writeFileSync(out, JSON.stringify(rows, null, 1));
console.log('diferenças', rows.length, '| 500k+', rows.filter((r) => r.pop >= 500000).length);
console.log(rows.map((r) => `${r.atual}/${r.cc}→${r.ne_pt}`).join('; '));
