// Extrai do espelho do CIA World Factbook (github.com/factbook/factbook.json) o campo Religions de cada país,
// soma as porcentagens por grande grupo e grava data/raw/factbook-religioes.json.
// Uso: node scripts/extract-religioes.mjs <pasta-do-clone> <data-do-commit>
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const wc = require('world-countries');
const [dir, commitDate] = process.argv.slice(2);

const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/^the /, '').replace(/[^a-z ]/g, '').trim();
const byName = new Map();
for (const c of wc) for (const n of [c.name.common, c.name.official, ...(c.altSpellings || [])]) byName.set(norm(n), c.cca2);
const FIX = { burma: 'MM', 'cabo verde': 'CV', 'congo democratic republic of the': 'CD', 'congo republic of the': 'CG', czechia: 'CZ', eswatini: 'SZ', 'gambia the': 'GM', 'bahamas the': 'BS', 'korea north': 'KP', 'korea south': 'KR', 'micronesia federated states of': 'FM', timorleste: 'TL', 'turkey turkiye': 'TR', turkiye: 'TR', 'holy see vatican city': 'VA', 'cote divoire': 'CI', 'north macedonia': 'MK', 'saint vincent and the grenadines': 'VC', 'sao tome and principe': 'ST', 'cocircte divoire': 'CI', turkey: 'TR' };

const decode = (s) => s.replace(/&[a-z]+;/g, (m) => ({ '&eacute;': 'é', '&iacute;': 'í', '&amp;': '&', '&ccedil;': 'ç', '&atilde;': 'ã', '&ocirc;': 'ô', '&aacute;': 'á', '&oacute;': 'ó', '&uacute;': 'ú', '&nbsp;': ' ' })[m] ?? ' ').replace(/<[^>]+>/g, ' ');

// Grande grupo e vertente cristã a partir do rótulo (sem o conteúdo entre parênteses).
function classify(label) {
  const l = label.toLowerCase();
  if (/jehovah|mormon|latter-day/.test(l)) return { g: 'cristianismo', v: 'outra' };
  if (/catholic/.test(l) && !/protestant|orthodox/.test(l)) return { g: 'cristianismo', v: 'catolicismo' };
  if (/orthodox|apostolic church|armenian apostolic|coptic/.test(l) && !/jew/.test(l)) return { g: 'cristianismo', v: 'ortodoxia' };
  if (/protestant|evangelical|anglican|lutheran|methodist|baptist|pentecostal|presbyterian|adventist|reformed|calvinist|uniting church|church of england|church of scotland|moravian|episcopal|assembl(y|ies) of god|salvation army|church of god|church of christ|zionist christian|kimbanguist|seventh/.test(l)) return { g: 'cristianismo', v: 'protestantismo' };
  if (/christian|church/.test(l)) return { g: 'cristianismo', v: null };
  if (/muslim|islam|sunni|shia|ibadhi/.test(l)) return { g: 'islamismo' };
  if (/hindu/.test(l)) return { g: 'hinduismo' };
  if (/buddhis/.test(l)) return { g: 'budismo' };
  if (/jewish|judaism/.test(l)) return { g: 'judaismo' };
  if (/shinto/.test(l)) return { g: 'xintoismo' };
  if (/^none|no religion|atheis|agnostic|nonbeliever|non-believer|unaffiliated|nonreligious|non-religious|without religion/.test(l)) return { g: 'sem-religiao' };
  if (/folk|traditional|animis|indigenous|ethnic religion|voodoo|vodou/.test(l)) return { g: 'tradicional' };
  return null;
}

// Divide no nível de topo (vírgulas fora de parênteses) e lê o primeiro número com % fora dos parênteses.
function parse(text) {
  const t = decode(text).replace(/\(\d{4}[^)]*\)\s*$/, '');
  const parts = [];
  let depth = 0, cur = '';
  for (const ch of t) {
    if (ch === '(') depth++;
    if (ch === ')') depth = Math.max(0, depth - 1);
    if ((ch === ',' || ch === ';') && depth === 0) { parts.push(cur); cur = ''; } else cur += ch;
  }
  parts.push(cur);
  const out = [];
  for (const p of parts) {
    const top = p.replace(/\([^)]*\)/g, ' ');
    const m = top.match(/(<\s*)?(\d+(?:\.\d+)?|\.\d+)(?:\s*-\s*(\d+(?:\.\d+)?))?\s*%/);
    if (!m) continue;
    const a = parseFloat(m[2]); const b = m[3] ? parseFloat(m[3]) : a;
    const label = top.slice(0, m.index).trim();
    out.push({ label, pct: m[1] ? 0 : (a + b) / 2, cls: classify(label) });
  }
  return out;
}

const paises = {};
const sem = [];
for (const region of fs.readdirSync(dir)) {
  const rdir = path.join(dir, region);
  if (!fs.statSync(rdir).isDirectory() || region.startsWith('.') || region === 'meta') continue;
  for (const f of fs.readdirSync(rdir).filter((x) => x.endsWith('.json'))) {
    const d = JSON.parse(fs.readFileSync(path.join(rdir, f), 'utf8'));
    const short = d.Government?.['Country name']?.['conventional short form']?.text;
    const rel = d['People and Society']?.Religions?.text;
    if (!short || !rel) continue;
    const key = norm(short);
    const cc = FIX[key] ?? byName.get(key);
    if (!cc) { sem.push(short); continue; }
    const itens = parse(rel);
    const grupos = {}; const vertentes = {};
    for (const it of itens) {
      if (!it.cls) continue;
      grupos[it.cls.g] = (grupos[it.cls.g] ?? 0) + it.pct;
      if (it.cls.v) vertentes[it.cls.v] = (vertentes[it.cls.v] ?? 0) + it.pct;
    }
    const ano = (decode(rel).match(/\((\d{4})[^)]*\)\s*$/) || [])[1] ?? null;
    paises[cc] = { factbook: `${region}/${f}`, texto: decode(rel).replace(/\s+/g, ' ').trim(), ano: ano ? Number(ano) : null, grupos, vertentes };
  }
}
fs.writeFileSync(path.resolve('data/raw/factbook-religioes.json'), JSON.stringify({ _fonte: `CIA World Factbook via github.com/factbook/factbook.json, commit de ${commitDate}; domínio público`, paises }, null, 1));
console.log('países', Object.keys(paises).length, '| sem casamento:', sem.join('; '));
