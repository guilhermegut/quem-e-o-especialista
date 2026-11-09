// Monta src/data/quiz.json: moedas (Unicode CLDR), religiões (CIA World Factbook) e os arquivos curados de
// data/curated/quiz (líderes do G20, esportes, filosofia e arte).
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const countries = read('src/data/countries.json');
const UN = new Set(countries.filter((c) => c.un).map((c) => c.cc));
const cd = require('cldr-core/supplemental/currencyData.json').supplemental.currencyData.region;
const cur = require('cldr-numbers-full/main/pt/currencies.json').main.pt.numbers.currencies;
const cldrVersion = require('cldr-core/package.json').version;

// Nome-base da moeda, sem o adjetivo pátrio (o "peso" de "Peso argentino").
const BASE_FIX = {
  AED: 'dirham', BAM: 'marco conversível', BOB: 'boliviano', ILS: 'shekel', PEN: 'sol', XAF: 'franco CFA', XOF: 'franco CFA',
  GBP: 'libra esterlina', XCD: 'dólar do Caribe Oriental', TOP: 'paʻanga', ZWG: 'ouro do Zimbábue', MMK: 'quiate', STN: 'dobra',
  SLE: 'leone', ERN: 'nakfa', VUV: 'vatu', SAR: 'rial', KPW: 'won', KRW: 'won',
};
const base = (code) => BASE_FIX[code] ?? cur[code].displayName.split(' ')[0].toLowerCase();

const moedas = {};
for (const cc of UN) {
  const lst = cd[cc] ?? [];
  const atuais = lst.flatMap((e) => Object.entries(e)).filter(([, v]) => !v._to && v._tender !== 'false').map(([k]) => k);
  if (atuais.length !== 1) continue;
  const code = atuais[0];
  moedas[cc] = { code, nome: cur[code].displayName, base: base(code), simbolo: cur[code]['symbol-alt-narrow'] ?? null };
}
// Símbolo distintivo: um único nome-base usa aquele símbolo, e ele não é só letras.
const porSimbolo = {};
for (const m of Object.values(moedas)) if (m.simbolo) (porSimbolo[m.simbolo] ??= new Set()).add(m.base);
const simbolos = Object.entries(porSimbolo).filter(([s, b]) => b.size === 1 && /[^A-Za-z.\s]/.test(s) && s !== '$').map(([s, b]) => ({ simbolo: s, base: [...b][0] }));

// Religiões: só países em que o maior grupo passa de 50% e supera o segundo em 15 pontos, com soma coerente.
const fb = read('data/raw/factbook-religioes.json');
const religioes = {};
for (const [cc, v] of Object.entries(fb.paises)) {
  if (!UN.has(cc)) continue;
  const g = Object.entries(v.grupos).sort((a, b) => b[1] - a[1]);
  const soma = g.reduce((a, [, p]) => a + p, 0);
  if (!g.length || soma > 103) continue;
  const [top, pct] = g[0];
  const seg = g[1]?.[1] ?? 0;
  if (pct < 50 || pct - seg < 15 || top === 'sem-religiao' || top === 'tradicional') continue;
  const vs = Object.entries(v.vertentes).filter(([k]) => k !== 'outra').sort((a, b) => b[1] - a[1]);
  const vert = top === 'cristianismo' && vs.length && vs[0][1] >= 50 ? { v: vs[0][0], pct: vs[0][1] } : null;
  religioes[cc] = { g: top, pct: Math.round(pct * 10) / 10, ano: v.ano, texto: v.texto, factbook: v.factbook, ...(vert ? { vertente: vert.v, vpct: Math.round(vert.pct * 10) / 10 } : {}) };
}

const lideres = read('data/curated/quiz/lideres.json');
const esportes = read('data/curated/quiz/esportes.json');
const filosofia = read('data/curated/quiz/filosofia.json');
const arte = read('data/curated/quiz/arte.json');
const pop = read('data/curated/quiz/pop.json');

const out = {
  fontes: {
    moedas: `Unicode CLDR ${cldrVersion} (supplemental/currencyData e nomes em português)`,
    religioes: fb._fonte,
  },
  moedas, simbolos, religioes, lideres: lideres.paises, esportes, filosofos: filosofia.filosofos, filosofiaLivres: filosofia.livres, obras: arte.obras, pop,
};
fs.writeFileSync('src/data/quiz.json', JSON.stringify(out));
console.log('moedas', Object.keys(moedas).length, '| símbolos', simbolos.length, '| religiões', Object.keys(religioes).length,
  '| líderes', lideres.paises.reduce((a, p) => a + p.mandatos.length, 0));
const bases = {}; for (const m of Object.values(moedas)) bases[m.base] = (bases[m.base] ?? 0) + 1;
console.log(Object.entries(bases).sort((a, b) => b[1] - a[1]).map(([b, n]) => `${b}:${n}`).join(' '));
console.log(simbolos.map((s) => `${s.simbolo}=${s.base}`).join(' '));
