// Pipeline de dados do GeoDuelo.
// Gera src/data/*.json a partir de pacotes npm com versão fixa e registra as decisões
// em docs/verificacao/dados.md. Rodar: node scripts/build-data.mjs
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { optimize } from 'svgo';
import { Resvg } from '@resvg/resvg-js';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'src/data');
fs.mkdirSync(OUT, { recursive: true });

const wc = require('world-countries');
const cities = require('all-the-cities');
const territoryInfo = require('cldr-core/supplemental/territoryInfo.json').supplemental.territoryInfo;
const T = require('cldr-localenames-full/main/pt/territories.json').main.pt.localeDisplayNames.territories;
const tzNames = require('cldr-dates-full/main/pt/timeZoneNames.json').main.pt.dates.timeZoneNames.zone;
const topo = require('world-atlas/countries-50m.json');
const versions = Object.fromEntries(
  ['world-atlas', 'world-countries', 'all-the-cities', 'flag-icons', 'cldr-core', 'cldr-localenames-full', 'cldr-dates-full']
    .map((p) => [p, require(`${p}/package.json`).version]),
);

const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

// ---------- Países ----------
// Nome em pt-BR: CLDR "pt" (português do Brasil). Exceções usam variantes do próprio CLDR.
// PS fica na forma-base do CLDR, "Territórios palestinos" (decisão do usuário em 06/11/2026).
const NAME_ALT = { CD: 'alt-variant', HK: 'alt-short', MO: 'alt-short' };
const countryName = (cc) => T[`${cc}-${NAME_ALT[cc]}`] ?? T[cc];

// Correção de dado: world-countries 5.1.0 marca VA como membro da ONU; a Santa Sé é Estado observador.
const isUN = (c) => c.unMember && c.cca2 !== 'VA';

const REGION = { Africa: '002', Americas: '019', Asia: '142', Europe: '150', Oceania: '009', Antarctic: 'AQ' };

const polygonIds = new Set(topo.objects.countries.geometries.map((g) => g.id).filter(Boolean));

const un = wc.filter(isUN);
const rank = (key) => [...un].sort((a, b) => +territoryInfo[b.cca2][key] - +territoryInfo[a.cca2][key]);
const top50 = new Set([...rank('_population').slice(0, 50), ...rank('_gdp').slice(0, 50)].map((c) => c.cca2));
const isKnown = (c) => top50.has(c.cca2) || c.subregion === 'South America' || Boolean(c.languages?.por);

// ---------- Cidades ----------
// Exônimos pt-BR: (1) cidades-exemplo de fuso horário do CLDR pt; (2) capitais ausentes do CLDR,
// conferidas em pt.wikipedia "Lista de capitais nacionais"; (3) cidades europeias conferidas em
// pt.wikipedia "Lista das cidades mais populosas da Europa". Fora disso, nome do GeoNames.
const cldrCity = {};
(function walk(o, p) {
  for (const k in o) {
    if (k === 'exemplarCity') cldrCity[norm(p.split('/').pop().replace(/_/g, ' '))] = o[k];
    else if (typeof o[k] === 'object') walk(o[k], `${p}/${k}`);
  }
})(tzNames, '');

const SRC_CAP = 'https://pt.wikipedia.org/wiki/Lista_de_capitais_nacionais';
const SRC_EUR = 'https://pt.wikipedia.org/wiki/Lista_das_cidades_mais_populosas_da_Europa';
// Chave: "nome no GeoNames|país". O build falha se a chave não achar exatamente uma cidade 100k+.
const OVERRIDE_BY_NAME = {
  'Beijing|CN': ['Pequim', SRC_CAP],
  'New Delhi|IN': ['Nova Déli', SRC_CAP],
  'Canberra|AU': ['Camberra', SRC_CAP],
  'Bern|CH': ['Berna', SRC_CAP],
  'Ankara|TR': ['Ancara', SRC_CAP],
  'Pretoria|ZA': ['Pretória', SRC_CAP],
  'Hanoi|VN': ['Hanói', SRC_CAP],
  'Kathmandu|NP': ['Catmandu', SRC_CAP],
  'Nur-Sultan|KZ': ['Astana', SRC_CAP], // GeoNames ainda usa "Nur-Sultan"; a página lista Astana
  'Kyiv|UA': ['Kiev', SRC_CAP],
  'Sanaa|YE': ['Saná', SRC_CAP],
  'Nay Pyi Taw|MM': ['Naypyidaw', SRC_CAP],
  'Saint Petersburg|RU': ['São Petersburgo', SRC_EUR],
  'Hamburg|DE': ['Hamburgo', SRC_EUR],
  'Munich|DE': ['Munique', SRC_EUR],
  'Milan|IT': ['Milão', SRC_EUR],
  'Köln|DE': ['Colônia', SRC_EUR],
  'Turin|IT': ['Turim', SRC_EUR],
  'Yekaterinburg|RU': ['Ecaterimburgo', SRC_EUR],
  'Nizhniy Novgorod|RU': ['Nizhny Novgorod', SRC_EUR],
};
const big = cities.filter((c) => c.population >= 100000);
const resolve = (key) => {
  const [n, cc] = key.split('|');
  const hits = big.filter((c) => c.name === n && c.country === cc);
  if (hits.length !== 1) throw new Error(`override "${key}" achou ${hits.length} cidades`);
  return hits[0].cityId;
};
const OVERRIDES = Object.fromEntries(Object.entries(OVERRIDE_BY_NAME).map(([k, v]) => [resolve(k), v]));
// Cidades excluídas do sorteio (nenhuma no momento).
const EXCLUDED = {};
// Cidades que entram sem rótulo de país, por soberania contestada (decisão do usuário em 06/11/2026).
const NO_COUNTRY_LABEL = new Set([resolve('Jerusalem|IL')]);
// Exônimos do Natural Earth revisados para pt-BR (data/curated/exonimos-ne.json).
const NE_EXO = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/curated/exonimos-ne.json'), 'utf8'));
let NE_NAMES = {}; // preenchido depois de cleanTranslit
const SRC_NE = 'Natural Earth 5.1.2 (NAME_PT), revisado para pt-BR';

const KEEP_CODES = new Set(['PPL', 'PPLA', 'PPLA2', 'PPLA3', 'PPLA4', 'PPLC', 'PPLG']);
const R = 6371.0088;
const rad = (d) => (d * Math.PI) / 180;
function haversine(lat1, lon1, lat2, lon2) {
  const a = Math.sin(rad(lat2 - lat1) / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

const validCC = new Set(wc.map((c) => c.cca2));
let pool = cities.filter((c) => c.population >= 100000 && KEEP_CODES.has(c.featureCode) && validCC.has(c.country) && !EXCLUDED[c.cityId]);
pool.sort((a, b) => b.population - a.population);
const kept = [];
const droppedNear = [];
for (const c of pool) {
  const [lon, lat] = c.loc.coordinates;
  // Até 12 km de uma cidade maior: bairro ou subúrbio. Perto de metrópoles (3 milhões+), lugares sem
  // sede administrativa (código PPL) até 30 km também são distritos, como Ümraniye em Istambul.
  const near = kept.find((k) => {
    if (k.country !== c.country) return false;
    const d = haversine(lat, lon, k.lat, k.lon);
    return d < 12 || (c.featureCode === 'PPL' && k.population >= 3_000_000 && d < 30);
  });
  if (near && c.featureCode !== 'PPLC') { droppedNear.push(`${c.name} (${c.country}) ← ${near.name}`); continue; }
  kept.push({ ...c, lat, lon });
}

// Marcas de transliteração do árabe, das línguas indianas e do coreano (Sūrat, Al Ḩudaydah, Ta‘izz, Wŏnsan) não existem
// em português: mácrons, pontos e vírgulas subscritos e apóstrofos de transliteração saem. Acentos de
// alfabetos latinos nativos (Łódź, İzmir, Kraków, Huế, Chișinău) ficam.
const TRANSLIT = { ā: 'a', ī: 'i', ū: 'u', ē: 'e', ō: 'o', Ā: 'A', Ī: 'I', Ū: 'U', Ē: 'E', Ō: 'O', ḩ: 'h', Ḩ: 'H', ḥ: 'h', Ḥ: 'H', ṭ: 't', Ṭ: 'T', ṣ: 's', Ṣ: 'S', ḍ: 'd', Ḍ: 'D', ẕ: 'z', Ẕ: 'Z', ẖ: 'h', ţ: 't', Ţ: 'T', ḑ: 'd', ḏ: 'd', ṯ: 't', ŏ: 'o', ŭ: 'u', Ŏ: 'O', Ŭ: 'U', '\u0327': '', '\u2018': '', '\u2019': '', '\u02BC': '', '\u02BB': '' };
const cleanTranslit = (s) => s.replace(/[āīūēōĀĪŪĒŌḩḨḥḤṭṬṣṢḍḌẕẔẖţŢḑḏṯŏŭŎŬ\u0327‘’ʼʻ]/g, (ch) => TRANSLIT[ch] ?? ch);
const transliterated = [];
// As chaves da tabela do Natural Earth usam o nome do GeoNames, cru ou já sem marcas de transliteração.
NE_NAMES = Object.fromEntries(Object.entries(NE_EXO.aceitos).map(([key, v]) => {
  const [n, cc] = key.split('|');
  const hits = big.filter((c) => c.country === cc && (c.name === n || cleanTranslit(c.name) === n));
  if (hits.length !== 1) throw new Error(`exônimo "${key}" achou ${hits.length} cidades`);
  return [hits[0].cityId, v];
}));

const nameSource = {};
// O nome do CLDR vale só para a cidade mais populosa com aquele nome (London, Canadá, não vira "Londres").
const topByName = new Map();
for (const c of kept) { const k = norm(c.name); if (!topByName.has(k)) topByName.set(k, c.cityId); }
function cityName(c) {
  if (OVERRIDES[c.cityId]) { nameSource[c.cityId] = OVERRIDES[c.cityId][1]; return OVERRIDES[c.cityId][0]; }
  if (NE_NAMES[c.cityId]) { nameSource[c.cityId] = SRC_NE; return NE_NAMES[c.cityId]; }
  // GeoNames usa "New York City", "Ho Chi Minh City"; o fuso do CLDR omite o "City".
  const isTop = topByName.get(norm(c.name)) === c.cityId;
  const ex = isTop ? (cldrCity[norm(c.name)] ?? cldrCity[norm(c.name).replace(/ city$/, '')]) : undefined;
  if (ex) { nameSource[c.cityId] = 'CLDR 49 pt (exemplarCity)'; return ex; }
  const clean = cleanTranslit(c.name);
  if (clean !== c.name) transliterated.push(`${c.name} → ${clean}`);
  return clean;
}

// Desambiguação: o nome é ambíguo se outra cidade de 50 mil+ ou outra capital nacional, em qualquer país,
// tem o mesmo nome (ex.: Victoria no Canadá e Victoria nas Seicheles). No Estrategista, só esses mostram o país.
const cityRows = kept.map((c) => ({ id: c.cityId, n: cityName(c), cc: c.country, lat: +c.lat.toFixed(3), lon: +c.lon.toFixed(3), pop: c.population, cap: c.featureCode === 'PPLC' ? 1 : 0 }));
const nameCount = {};
for (const c of cities) {
  if (!KEEP_CODES.has(c.featureCode) || (c.population < 50000 && c.featureCode !== 'PPLC')) continue;
  const k = norm(c.name);
  nameCount[k] = (nameCount[k] || 0) + 1;
}
for (const r of cityRows) {
  const geoName = norm(kept.find((c) => c.cityId === r.id).name);
  if ((nameCount[geoName] || 0) > 1 || cityRows.some((o) => o !== r && norm(o.n) === norm(r.n))) r.amb = 1;
}

// Capitais: as do GeoNames (PPLC). Países sem PPLC no pool ficam sem alvo de capital.
const capitalOf = {};
for (const r of cityRows) if (r.cap && !capitalOf[r.cc]) capitalOf[r.cc] = r;

// ---------- Bandeiras ----------
const FLAG_DIR = path.join(ROOT, 'node_modules/flag-icons/flags/4x3');
const flagFiles = new Set(fs.readdirSync(FLAG_DIR).map((f) => f.replace('.svg', '')));

const countryRows = wc
  .filter((c) => flagFiles.has(c.cca2.toLowerCase()) && T[c.cca2])
  .map((c) => {
    const ti = territoryInfo[c.cca2] || {};
    const cap = capitalOf[c.cca2];
    return {
      cc: c.cca2,
      n3: c.ccn3,
      n: countryName(c.cca2),
      un: isUN(c) ? 1 : 0,
      known: isUN(c) && isKnown(c) ? 1 : 0,
      poly: polygonIds.has(c.ccn3) ? 1 : 0,
      reg: T[REGION[c.region]] ?? null,
      cap: cap ? cap.id : null,
      pop: ti._population ? +ti._population : null,
      area: c.area > 0 ? c.area : null,
    };
  })
  .sort((a, b) => a.n.localeCompare(b.n, 'pt-BR'));

// SVG otimizado com ids prefixados (vários na mesma página não colidem).
const flags = {};
for (const r of countryRows) {
  const raw = fs.readFileSync(path.join(FLAG_DIR, `${r.cc.toLowerCase()}.svg`), 'utf8');
  flags[r.cc] = optimize(raw, {
    multipass: true,
    plugins: ['preset-default', { name: 'prefixIds', params: { prefix: `f${r.cc}` } }],
  }).data;
}

// Similaridade visual: rasteriza 48x36 e mede a diferença média de cor (CIELAB, ΔE76) pixel a pixel.
function toLab([r, g, b]) {
  const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const [R1, G1, B1] = [lin(r), lin(g), lin(b)];
  const X = (R1 * 0.4124 + G1 * 0.3576 + B1 * 0.1805) / 0.95047;
  const Y = R1 * 0.2126 + G1 * 0.7152 + B1 * 0.0722;
  const Z = (R1 * 0.0193 + G1 * 0.1192 + B1 * 0.9505) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
}
const W = 48, H = 36;
const labs = {};
for (const r of countryRows) {
  const png = new Resvg(fs.readFileSync(path.join(FLAG_DIR, `${r.cc.toLowerCase()}.svg`)), { fitTo: { mode: 'width', value: W } }).render();
  const px = png.pixels; // RGBA
  const arr = new Float32Array(W * H * 3);
  for (let i = 0; i < W * H; i++) {
    const a = px[i * 4 + 3] / 255;
    const rgb = [0, 1, 2].map((k) => px[i * 4 + k] * a + 255 * (1 - a));
    const l = toLab(rgb);
    arr.set(l, i * 3);
  }
  labs[r.cc] = arr;
}
const similar = {};
const ccs = Object.keys(labs);
for (const a of ccs) {
  const d = ccs.filter((b) => b !== a).map((b) => {
    let s = 0;
    const A = labs[a], B = labs[b];
    for (let i = 0; i < A.length; i += 3) s += Math.hypot(A[i] - B[i], A[i + 1] - B[i + 1], A[i + 2] - B[i + 2]);
    return [b, s / (W * H)];
  }).sort((x, y) => x[1] - y[1]);
  similar[a] = d.slice(0, 15).map(([b, s]) => [b, Math.round(s)]);
}

// ---------- Saída ----------
// d2: ordem fixa dos módulos e fronteiras no Estrategista (06/11/2026)
const CONTENT_VERSION = 'd7';
const write = (f, o) => fs.writeFileSync(path.join(OUT, f), JSON.stringify(o));
write('countries.json', countryRows);
write('cities.json', cityRows.map((r) => [r.id, r.n, r.cc, r.lat, r.lon, r.pop, r.cap, r.amb ? 1 : 0, NO_COUNTRY_LABEL.has(r.id) ? 1 : 0]));
write('flags.json', flags);
// [código, ΔE médio]; ΔE < 4 = bandeira praticamente idêntica (ex.: NO, SJ e BV), nunca vira distrator.
write('flag-similar.json', similar);
write('meta.json', { contentVersion: CONTENT_VERSION, versions, built: new Date().toISOString().slice(0, 10) });

// Relatório de verificação
const known = countryRows.filter((r) => r.known);
const lines = [
  '# Dados do GeoDuelo: fontes, regras e correções',
  '',
  `Gerado por scripts/build-data.mjs em ${new Date().toISOString().slice(0, 10)}. Versão de conteúdo: ${CONTENT_VERSION}.`,
  '',
  '## Fontes e licenças',
  '',
  '| Pacote | Versão | Uso | Licença |',
  '| --- | --- | --- | --- |',
  `| world-atlas | ${versions['world-atlas']} | polígonos dos países e terras (Natural Earth 1:50m) | ISC; Natural Earth em domínio público |`,
  `| world-countries | ${versions['world-countries']} | códigos ISO, ONU, região, área, idiomas | ODbL 1.0 (atribuição e compartilhamento pela mesma licença) |`,
  `| all-the-cities | ${versions['all-the-cities']} | cidades, coordenadas e população | MIT; dados do GeoNames, CC BY 4.0 |`,
  `| flag-icons | ${versions['flag-icons']} | SVGs das bandeiras (4x3) | MIT |`,
  `| cldr-core, cldr-localenames-full, cldr-dates-full | ${versions['cldr-core']} | nomes de países e de cidades em pt-BR, população e PIB (PPC) estimados | Unicode License v3 |`,
  '',
  '## Correções e decisões',
  '',
  '- Nomes de países: CLDR 49 "pt" (pt-BR). world-countries e i18n-iso-countries foram descartados para nomes: usam português de Portugal (Irão, Quénia, Polónia) e o i18n-iso-countries 7.14.0 troca os nomes dos dois Congos.',
  '- Variantes do CLDR usadas: CD = "República Democrática do Congo" (o nome-base é "Congo - Kinshasa"); HK e MO na forma curta ("Hong Kong", "Macau"). PS fica na forma-base, "Territórios palestinos", por decisão do usuário.',
  '- Jerusalém entra no sorteio sem rótulo de país, por decisão do usuário (soberania contestada).',
  '- world-countries 5.1.0 marca o Vaticano (VA) como membro da ONU. A Santa Sé é Estado observador; o pipeline corrige para 193 membros.',
  '- GeoNames ainda nomeia a capital do Cazaquistão como "Nur-Sultan"; corrigido para Astana.',
  `- Excluídas do sorteio: ${Object.values(EXCLUDED).join('; ')}.`,
  '- Tuvalu não tem polígono na escala 1:50m e não entra como alvo de país no mapa.',
  `- Bairros e subúrbios: descartado o lugar a menos de 12 km de uma cidade mais populosa do mesmo país, ou a menos de 30 km de uma metrópole de 3 milhões+ quando não é sede administrativa (código PPL). ${droppedNear.length} descartados, além dos códigos PPLX, PPLQ, PPLH, PPLL e PPLS.`,
  '',
  '## Critério de "conhecidos" (nível Observador)',
  '',
  `Membros da ONU entre os 50 mais populosos ou os 50 maiores PIBs (PPC) segundo o CLDR ${versions['cldr-core']}, mais os países da América do Sul e os de língua oficial portuguesa. Total: ${known.length} países.`,
  '',
  known.map((r) => r.n).join(', '),
  '',
  '## Exônimos em português',
  '',
  'Ordem de precedência: tabela abaixo (Wikipédia em português); exônimos do Natural Earth revisados para pt-BR (data/curated/exonimos-ne.json, com a lista do que foi aceito, adaptado e recusado); cidades-exemplo de fuso horário do CLDR 49 pt, aplicadas só à cidade mais populosa com aquele nome; nome do GeoNames sem marcas de transliteração.',
  '',
  '| GeoNames | Nome usado | Fonte |',
  '| --- | --- | --- |',
  ...Object.entries(OVERRIDES).map(([id, [n, src]]) => `| ${cities.find((c) => c.cityId === +id)?.name ?? id} | ${n} | ${src} |`),
  '',
  `Cidades no sorteio (100 mil+ habitantes): ${cityRows.length}; com nome do CLDR: ${Object.values(nameSource).filter((s) => s.startsWith('CLDR')).length}; com exônimo do Natural Earth: ${Object.values(nameSource).filter((s) => s === SRC_NE).length}.`,
  '',
  `Marcas de transliteração removidas em ${transliterated.length} nomes do GeoNames. Exemplos: ${transliterated.slice(0, 12).join('; ')}.`,
  '',
];
fs.mkdirSync(path.join(ROOT, 'docs/verificacao'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'docs/verificacao/dados.md'), lines.join('\n'));

// Checagens que travam o build
const missingIds = Object.keys(OVERRIDES).filter((id) => !cities.find((c) => c.cityId === +id));
if (missingIds.length) throw new Error(`cityId inexistente nos overrides: ${missingIds}`);
if (countryRows.filter((r) => r.un).length !== 193) throw new Error('ONU deveria ter 193 membros');
console.log(`países ${countryRows.length} (ONU ${countryRows.filter((r) => r.un).length}, conhecidos ${known.length}), cidades ${cityRows.length}, descartadas por proximidade ${droppedNear.length}`);
console.log('exemplos descartados:', droppedNear.slice(0, 12).join(' | '));
console.log('tamanhos (KB):', ['countries.json', 'cities.json', 'flags.json', 'flag-similar.json'].map((f) => `${f}=${Math.round(fs.statSync(path.join(OUT, f)).size / 1024)}`).join(' '));
