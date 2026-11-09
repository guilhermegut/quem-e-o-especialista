// Extrai do espelho do CIA World Factbook (github.com/factbook/factbook.json) o campo de independência
// de cada país e casa com o código ISO pelo nome. Saída: data/raw/factbook-independencia.json
// Uso: node scripts/extract-factbook.mjs <pasta-do-clone> <data-do-commit>
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const wc = require('world-countries');
const [dir, commitDate] = process.argv.slice(2);

const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/^the /, '').replace(/[^a-z ]/g, '').trim();
const byName = new Map();
for (const c of wc) for (const n of [c.name.common, c.name.official, ...(c.altSpellings || [])]) byName.set(norm(n), c.cca2);
// Nomes do Factbook que não batem com o world-countries
const FIX = { 'burma': 'MM', 'cabo verde': 'CV', 'congo democratic republic of the': 'CD', 'congo republic of the': 'CG', 'czechia': 'CZ', 'eswatini': 'SZ', 'gambia the': 'GM', 'bahamas the': 'BS', 'korea north': 'KP', 'korea south': 'KR', 'micronesia federated states of': 'FM', 'timorleste': 'TL', 'turkey turkiye': 'TR', 'turkiye': 'TR', 'holy see vatican city': 'VA', 'cote divoire': 'CI', 'north macedonia': 'MK', 'saint vincent and the grenadines': 'VC', 'sao tome and principe': 'ST', 'congo brazzaville': 'CG', 'cocircte divoire': 'CI', 'turkey': 'TR' };

const out = {};
const unmatched = [];
for (const region of fs.readdirSync(dir)) {
  const rdir = path.join(dir, region);
  if (!fs.statSync(rdir).isDirectory() || region.startsWith('.') || region === 'meta') continue;
  for (const f of fs.readdirSync(rdir).filter((x) => x.endsWith('.json'))) {
    const d = JSON.parse(fs.readFileSync(path.join(rdir, f), 'utf8'));
    const g = d.Government || {};
    const short = g['Country name']?.['conventional short form']?.text;
    const indep = g.Independence?.text;
    if (!short || !indep) continue;
    const key = norm(short);
    const cc = FIX[key] ?? byName.get(key);
    if (!cc) { unmatched.push(short); continue; }
    out[cc] = { factbook: `${region}/${f}`, nome: short, independencia: indep };
  }
}
fs.writeFileSync(path.resolve('data/raw/factbook-independencia.json'), JSON.stringify({ _fonte: `CIA World Factbook via github.com/factbook/factbook.json, commit de ${commitDate}; domínio público`, paises: out }, null, 1));
console.log('casados', Object.keys(out).length, '| sem casamento:', unmatched.join('; '));
