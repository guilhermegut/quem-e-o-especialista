// Quiz de Mundo hoje (moedas, líderes do G20, religiões) e Cultura (esporte, filosofia, arte).
// Cada rodada sai de um item do acervo e de um formato: escolha, intruso ou pares.
import data from '../data/quiz.json';
import { COUNTRIES, COUNTRY, countryName } from '../data';
import type { LevelId } from './levels';
import { shuffle, type Rng } from './rng';

export type Tema = 'moeda' | 'lider' | 'religiao' | 'esporte' | 'filosofia' | 'arte' | 'pop';
export type Formato = 'escolha' | 'intruso' | 'pares';
export interface Fonte { t: string; u: string }
export type Destaque =
  | { tipo: 'pais'; cc: string }
  | { tipo: 'simbolo'; texto: string }
  | { tipo: 'nota'; texto: string; sub?: string }
  | { tipo: 'citacao'; texto: string };

export interface QuizRound {
  mod: 'mundo' | 'cultura';
  key: string;
  tema: Tema;
  formato: Formato;
  pergunta: string;
  destaque?: Destaque;
  /** escolha e intruso: alternativas; pares: coluna da direita, embaralhada. */
  opcoes: string[];
  /** pares: coluna da esquerda. */
  esquerda?: string[];
  /** escolha e intruso: [índice certo]; pares: para cada item da esquerda, o índice certo em opcoes. */
  certo: number[];
  explicacao: string;
  fontes: Fonte[];
}

export const TEMA_NOME: Record<Tema, string> = { moeda: 'Moedas', lider: 'Líderes do G20', religiao: 'Religiões', esporte: 'Esporte', filosofia: 'Filosofia', arte: 'Arte', pop: 'Cultura pop' };
export const TEMAS_MUNDO: Tema[] = ['moeda', 'lider', 'religiao'];
/** Cultura tem quatro temas e três rodadas: a cada dia, três deles. */
export const TEMAS_CULTURA: Tema[] = ['esporte', 'filosofia', 'arte', 'pop'];

// ---------- Dados ----------
interface Moeda { code: string; nome: string; base: string; simbolo: string | null }
interface Religiao { g: string; pct: number; ano: number | null; vertente?: string; vpct?: number }
interface Mandato { n: string; ini: string | null; fim: string | null; interino?: boolean }
interface PaisLider { cc: string; de: string; cargo: string; fontes: Fonte[]; mandatos: Mandato[]; nota?: string }
interface Copa { ano: number; sede: string; campeao: string; vice: string; placar?: string; fontes: Fonte[] }
interface Olimpiada { ano: number; estacao: 'verao' | 'inverno'; cidade: string; pais: string; nota?: string; fontes: Fonte[] }
interface F1 { ano: number; piloto: string; pais: string; equipe: string; fontes: Fonte[] }
interface Bola { ano: number; jogador: string; pais: string; clube: string; fontes: Fonte[] }
interface Filosofo { n: string; origem: string; epoca: string; obras: string[]; conceito?: string; frase?: string; extra?: string; fontes: Fonte[] }
interface Livre { pergunta: string; certa: string; erradas: string[]; explicacao: string; fontes: Fonte[] }
interface Pop {
  oscarFilme: { ano: number; filme: string; fontes: Fonte[] }[];
  oscarDirecao: { ano: number; diretor: string; filme: string; fontes: Fonte[] }[];
  livros: { titulo: string; original: string; autor: string; serie?: boolean; fontes: Fonte[] }[];
  jogos: { titulo: string; editora: string; ano: number; fontes: Fonte[] }[];
}
interface Obra { titulo: string; autor: string; ano: string | null; local?: string; cidade?: string; movimento?: string; extra?: string; fontes: Fonte[] }

const D = data as unknown as {
  fontes: { moedas: string; religioes: string };
  moedas: Record<string, Moeda>;
  simbolos: { simbolo: string; base: string }[];
  religioes: Record<string, Religiao>;
  lideres: PaisLider[];
  esportes: { copa: Copa[]; copaFem: Copa[]; olimpiadas: Olimpiada[]; f1: F1[]; bola: Bola[] };
  filosofos: Filosofo[];
  filosofiaLivres: Livre[];
  obras: Obra[];
  pop: Pop;
};

const FONTE_CLDR: Fonte = { t: D.fontes.moedas, u: 'https://cldr.unicode.org' };
const FONTE_FACTBOOK: Fonte = { t: 'CIA World Factbook, campo Religions (via factbook.json)', u: 'https://www.cia.gov/the-world-factbook/' };

const KNOWN = new Set(COUNTRIES.filter((c) => c.known && c.un).map((c) => c.cc));
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const pick = <T>(rng: Rng, arr: T[]) => arr[Math.floor(rng() * arr.length)];
const regionOf = (cc: string) => COUNTRY.get(cc)?.reg ?? null;

/** Escolhe n valores distintos de `pool`, diferentes de `evitar`, priorizando os de `preferidos`. */
function distratores(rng: Rng, pool: string[], evitar: string[], n: number, preferidos: string[] = []): string[] {
  const out: string[] = [];
  for (const v of [...shuffle(rng, preferidos), ...shuffle(rng, pool)]) {
    if (out.length >= n) break;
    if (!evitar.includes(v) && !out.includes(v)) out.push(v);
  }
  return out;
}

function escolha(rng: Rng, certa: string, erradas: string[]) {
  const opcoes = shuffle(rng, [certa, ...erradas]);
  return { opcoes, certo: [opcoes.indexOf(certa)] };
}

function pares(rng: Rng, esquerda: string[], direita: string[]) {
  const opcoes = shuffle(rng, direita);
  return { formato: 'pares' as const, esquerda, opcoes, certo: direita.map((d) => opcoes.indexOf(d)) };
}

const MES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const dataLonga = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return `${d === 1 ? '1º' : d} de ${MES[m - 1]} de ${y}`; };
const dataCurta = (iso: string) => iso.split('-').reverse().join('/');

// ---------- Moedas ----------
const MOEDA_CC = Object.keys(D.moedas);
const SIMBOLOS_ESTAGIARIO = new Set(['€', 'R$', '₹', '₽', '₩', '₪', '₺', '฿']);
const SIMBOLOS_FORA = new Set(['р.', '⃀', 'C$', 'T$']);
const BASES_INTRUSO = (() => {
  const n: Record<string, number> = {};
  for (const m of Object.values(D.moedas)) n[m.base] = (n[m.base] ?? 0) + 1;
  return new Set(Object.entries(n).filter(([, k]) => k >= 3).map(([b]) => b));
})();

function moedaPool(level: LevelId): string[] {
  const paises = MOEDA_CC.filter((cc) => level === 'prime' || KNOWN.has(cc)).map((cc) => `moeda:${cc}`);
  const simbolos = D.simbolos.filter((s) => (level === 'prime' ? !SIMBOLOS_FORA.has(s.simbolo) : SIMBOLOS_ESTAGIARIO.has(s.simbolo))).map((s) => `simbolo:${s.simbolo}`);
  return [...paises, ...simbolos];
}

const usuarios = (base: string) => MOEDA_CC.filter((cc) => D.moedas[cc].base === base);
const moedaTexto = (cc: string) => { const m = D.moedas[cc]; return `${countryName(cc)}: ${m.nome.charAt(0).toLowerCase() + m.nome.slice(1)} (${m.code}${m.simbolo ? `, símbolo ${m.simbolo}` : ''})`; };

function moedaRound(rng: Rng, level: LevelId, key: string, formato: Formato): Omit<QuizRound, 'mod' | 'key'> {
  const universo = MOEDA_CC.filter((cc) => level === 'prime' || KNOWN.has(cc));
  if (key.startsWith('simbolo:')) {
    const s = key.slice(8);
    const base = D.simbolos.find((x) => x.simbolo === s)!.base;
    const bases = [...new Set(universo.map((cc) => D.moedas[cc].base))];
    const usam = usuarios(base).filter((cc) => D.moedas[cc].simbolo === s);
    return {
      tema: 'moeda', formato: 'escolha', pergunta: 'De que moeda é este símbolo?', destaque: { tipo: 'simbolo', texto: s },
      ...escolha(rng, cap(base), distratores(rng, bases, [base], 3).map(cap)),
      explicacao: `${s} é o símbolo usado por: ${usam.map(moedaTexto).join('; ')}.`, fontes: [FONTE_CLDR],
    };
  }
  const cc = key.slice(6);
  const m = D.moedas[cc];
  if (formato === 'intruso' && BASES_INTRUSO.has(m.base)) {
    const com = shuffle(rng, usuarios(m.base).filter((x) => x !== cc && COUNTRY.get(x)?.un)).slice(0, 2);
    const reg = regionOf(cc);
    const sem = distratores(rng, universo.filter((x) => D.moedas[x].base !== m.base), [], 1, universo.filter((x) => regionOf(x) === reg && D.moedas[x].base !== m.base))[0];
    const nomes = [cc, ...com].map(countryName);
    const r = escolha(rng, countryName(sem), nomes);
    return {
      tema: 'moeda', formato: 'intruso', pergunta: `Em qual destes países a moeda NÃO se chama ${m.base}?`, ...r,
      explicacao: `${moedaTexto(sem)}. Os outros: ${[cc, ...com].map(moedaTexto).join('; ')}.`, fontes: [FONTE_CLDR],
    };
  }
  if (formato === 'pares') {
    const outros: string[] = [];
    for (const x of shuffle(rng, universo)) {
      if (outros.length === 2) break;
      if (x !== cc && ![m.base, ...outros.map((o) => D.moedas[o].base)].includes(D.moedas[x].base)) outros.push(x);
    }
    const ccs = [cc, ...outros];
    return {
      tema: 'moeda', pergunta: 'Ligue cada país à sua moeda.', ...pares(rng, ccs.map(countryName), ccs.map((x) => cap(D.moedas[x].base))),
      explicacao: ccs.map(moedaTexto).join('; ') + '.', fontes: [FONTE_CLDR],
    };
  }
  const bases = [...new Set(universo.map((x) => D.moedas[x].base))];
  const reg = regionOf(cc);
  const vizinhas = level === 'prime' ? [...new Set(universo.filter((x) => regionOf(x) === reg).map((x) => D.moedas[x].base))] : [];
  return {
    tema: 'moeda', formato: 'escolha', pergunta: 'Qual é o nome da moeda oficial deste país?', destaque: { tipo: 'pais', cc },
    ...escolha(rng, cap(m.base), distratores(rng, bases, [m.base], 3, vizinhas).map(cap)),
    explicacao: `${moedaTexto(cc)}.`, fontes: [FONTE_CLDR],
  };
}

// ---------- Líderes do G20 ----------
interface LiderItem { p: PaisLider; m: Mandato; i: number }
const LIDERES: LiderItem[] = D.lideres.flatMap((p) => p.mandatos.map((m, i) => ({ p, m, i }))).filter((x) => !x.m.interino && x.m.ini);
const MARGEM = 30 * 86400000;
const t = (iso: string | null) => (iso ? Date.parse(iso) : Date.parse('2026-11-09'));

/** Quem ocupava o cargo na data, se for alguém efetivo, sem transição ou interinidade a menos de 30 dias. */
function titularEm(p: PaisLider, iso: string): Mandato | null {
  const d = Date.parse(iso);
  for (const pp of D.lideres.filter((x) => x.cc === p.cc)) {
    for (const m of pp.mandatos) {
      if (!m.ini) continue;
      const a = t(m.ini) - MARGEM, b = t(m.fim) + MARGEM;
      if (d >= a && d <= b && (m.interino || d < t(m.ini) + MARGEM || d > t(m.fim) - MARGEM)) return null;
    }
  }
  const m = p.mandatos.find((x) => !x.interino && x.ini && d >= t(x.ini) && d < t(x.fim));
  return m ?? null;
}

function datasValidas(x: LiderItem): string[] {
  const out: string[] = [];
  const y0 = Math.max(1996, Number(x.m.ini!.slice(0, 4)));
  const y1 = Math.min(2026, Number((x.m.fim ?? '2026').slice(0, 4)));
  for (let y = y0; y <= y1; y++) for (const md of ['01-01', '07-01']) {
    const iso = `${y}-${md}`;
    if (Date.parse(iso) > Date.parse('2026-11-01')) continue;
    if (titularEm(x.p, iso) === x.m) out.push(iso);
  }
  return out;
}

const pessoa = (x: LiderItem) => `${x.p.cc}|${x.m.n}`;
function lideresTexto(cc: string, nome: string): string {
  const termos = D.lideres.filter((p) => p.cc === cc).flatMap((p) => p.mandatos.filter((m) => m.n === nome && !m.interino && m.ini).map((m) => ({ p, m })));
  return `${nome}: ${termos.map(({ p, m }) => `${p.cargo} ${p.de} ${m.fim ? `de ${dataCurta(m.ini!)} a ${dataCurta(m.fim)}` : `desde ${dataCurta(m.ini!)}`}`).join('; ')}`;
}

function liderPool(): string[] {
  const vistos = new Set<string>();
  const out: string[] = [];
  for (const x of LIDERES) {
    if (!x.m.fim && !x.m.ini) continue;
    const k = `${x.p.cc}:${x.p.cargo}:${x.i}`;
    if (vistos.has(pessoa(x) + x.p.cargo + x.m.ini)) continue;
    vistos.add(pessoa(x) + x.p.cargo + x.m.ini);
    // Só quem esteve no cargo a partir de 1996.
    if ((x.m.fim ?? '9999') < '1996-01-01') continue;
    out.push(`lider:${k}`);
  }
  return out;
}
const liderPorKey = (key: string) => { const [, cc, cargo, i] = key.split(':'); const p = D.lideres.find((q) => q.cc === cc && q.cargo === cargo)!; return { p, m: p.mandatos[Number(i)], i: Number(i) }; };

function liderRound(rng: Rng, level: LevelId, key: string, formato: Formato): Omit<QuizRound, 'mod' | 'key'> {
  const x = liderPorKey(key);
  const { p, m } = x;
  const fontes = p.fontes;
  const datas = datasValidas(x);
  const nomesPais = [...new Set(D.lideres.filter((q) => q.cc === p.cc).flatMap((q) => q.mandatos.filter((mm) => !mm.interino).map((mm) => mm.n)))];
  if (formato === 'pares' || (formato === 'escolha' && level === 'estagiario' && (!datas.length || rng() < 0.5))) {
    // Estagiário: "governou qual destes países?"; Prime: ligar três líderes a seus países.
    const outrosPaises = shuffle(rng, [...new Set(D.lideres.map((q) => q.cc))].filter((c) => c !== p.cc));
    if (formato === 'pares') {
      const ccs = [p.cc, ...outrosPaises.slice(0, 2)];
      const nomes = [m.n, ...ccs.slice(1).map((c) => pick(rng, LIDERES.filter((y) => y.p.cc === c && (y.m.fim ?? '9999') >= '1996-01-01')).m.n)];
      return {
        tema: 'lider', pergunta: 'Ligue cada líder ao país que governou.', ...pares(rng, nomes, ccs.map(countryName)),
        explicacao: ccs.map((c, k) => lideresTexto(c, nomes[k])).join('. ') + '.', fontes: [...new Set(ccs.flatMap((c) => D.lideres.filter((q) => q.cc === c).flatMap((q) => q.fontes)))],
      };
    }
    return {
      tema: 'lider', formato: 'escolha', pergunta: `${m.n} governou qual destes países?`,
      ...escolha(rng, countryName(p.cc), outrosPaises.slice(0, 3).map(countryName)),
      explicacao: `${lideresTexto(p.cc, m.n)}.`, fontes,
    };
  }
  if (formato === 'intruso') {
    const reais = shuffle(rng, [...new Set(p.mandatos.filter((mm) => !mm.interino && mm.n !== m.n && (mm.fim ?? '9999') >= '1996-01-01').map((mm) => mm.n))]).slice(0, 2);
    const mesmoCargo = LIDERES.filter((y) => y.p.cc !== p.cc && y.p.cargo === p.cargo && !nomesPais.includes(y.m.n));
    const intruso = pick(rng, mesmoCargo.length ? mesmoCargo : LIDERES.filter((y) => y.p.cc !== p.cc && !nomesPais.includes(y.m.n)));
    if (reais.length === 2) {
      return {
        tema: 'lider', formato: 'intruso', pergunta: `Qual destes nunca ocupou o cargo de ${p.cargo} ${p.de}?`, destaque: { tipo: 'pais', cc: p.cc },
        ...escolha(rng, intruso.m.n, [m.n, ...reais]),
        explicacao: `${lideresTexto(intruso.p.cc, intruso.m.n)}. ${[m.n, ...reais].map((n) => lideresTexto(p.cc, n)).join('. ')}.`, fontes: [...p.fontes, ...intruso.p.fontes],
      };
    }
  }
  // Escolha por data.
  const iso = datas.length ? pick(rng, datas) : null;
  if (!iso) {
    return {
      tema: 'lider', formato: 'escolha', pergunta: `${m.n} governou qual destes países?`,
      ...escolha(rng, countryName(p.cc), shuffle(rng, [...new Set(D.lideres.map((q) => q.cc))].filter((c) => c !== p.cc)).slice(0, 3).map(countryName)),
      explicacao: `${lideresTexto(p.cc, m.n)}.`, fontes,
    };
  }
  let erradas: string[];
  if (level === 'prime') {
    erradas = distratores(rng, nomesPais.filter((n) => n !== m.n), [m.n], 3);
  } else {
    // Estagiário: líderes de outros países do G20 na mesma data.
    erradas = distratores(rng, D.lideres.filter((q) => q.cc !== p.cc).map((q) => titularEm(q, iso)?.n).filter((n): n is string => Boolean(n)), [m.n], 3);
  }
  if (erradas.length < 3) erradas = [...erradas, ...distratores(rng, LIDERES.map((y) => y.m.n), [m.n, ...erradas], 3 - erradas.length)];
  return {
    tema: 'lider', formato: 'escolha', pergunta: `Quem ocupava o cargo de ${p.cargo} ${p.de} em ${dataLonga(iso)}?`, destaque: { tipo: 'pais', cc: p.cc },
    ...escolha(rng, m.n, erradas), explicacao: `${lideresTexto(p.cc, m.n)}.${p.nota ? ` ${p.nota}` : ''}`, fontes,
  };
}

// ---------- Religiões ----------
const GRUPO_NOME: Record<string, string> = { cristianismo: 'Cristianismo', islamismo: 'Islamismo', hinduismo: 'Hinduísmo', budismo: 'Budismo', judaismo: 'Judaísmo', xintoismo: 'Xintoísmo' };
const VERTENTE_NOME: Record<string, string> = { catolicismo: 'Catolicismo', protestantismo: 'Protestantismo', ortodoxia: 'Ortodoxia' };
const REL_CC = Object.keys(D.religioes).filter((cc) => GRUPO_NOME[D.religioes[cc].g]);
const relUniverso = (level: LevelId) => REL_CC.filter((cc) => level === 'prime' || KNOWN.has(cc));
const pctBR = (n: number) => `${n.toLocaleString('pt-BR')}%`;
const relTexto = (cc: string) => {
  const r = D.religioes[cc];
  const v = r.vertente ? ` (${VERTENTE_NOME[r.vertente].toLowerCase()}, ${pctBR(r.vpct!)})` : '';
  return `${countryName(cc)}: ${GRUPO_NOME[r.g].toLowerCase()}, ${pctBR(r.pct)}${v}${r.ano ? ` (dado de ${r.ano})` : ''}`;
};

function religiaoRound(rng: Rng, level: LevelId, key: string, formato: Formato): Omit<QuizRound, 'mod' | 'key'> {
  const cc = key.slice(9);
  const r = D.religioes[cc];
  const universo = relUniverso(level);
  const fontes = [FONTE_FACTBOOK];
  if (formato === 'pares') {
    const ccs = [cc];
    for (const x of shuffle(rng, universo)) if (ccs.length < 3 && !ccs.some((c) => D.religioes[c].g === D.religioes[x].g)) ccs.push(x);
    if (ccs.length === 3) return { tema: 'religiao', pergunta: 'Ligue cada país à sua religião predominante.', ...pares(rng, ccs.map(countryName), ccs.map((c) => GRUPO_NOME[D.religioes[c].g])), explicacao: `Segundo o CIA World Factbook. ${ccs.map(relTexto).join('; ')}.`, fontes };
  }
  if (formato === 'intruso') {
    const mesmos = shuffle(rng, universo.filter((x) => x !== cc && D.religioes[x].g === r.g)).slice(0, 2);
    const reg = regionOf(cc);
    const outro = distratores(rng, universo.filter((x) => D.religioes[x].g !== r.g), [], 1, universo.filter((x) => regionOf(x) === reg && D.religioes[x].g !== r.g))[0];
    if (mesmos.length === 2 && outro) {
      return {
        tema: 'religiao', formato: 'intruso', pergunta: `Em qual destes países a religião predominante NÃO é o ${GRUPO_NOME[r.g].toLowerCase()}?`,
        ...escolha(rng, countryName(outro), [cc, ...mesmos].map(countryName)),
        explicacao: `Segundo o CIA World Factbook. ${[outro, cc, ...mesmos].map(relTexto).join('; ')}.`, fontes,
      };
    }
  }
  if (level === 'prime' && r.vertente && rng() < 0.5) {
    const certa = VERTENTE_NOME[r.vertente];
    return {
      tema: 'religiao', formato: 'escolha', pergunta: 'Qual vertente do cristianismo predomina neste país?', destaque: { tipo: 'pais', cc },
      ...escolha(rng, certa, Object.values(VERTENTE_NOME).filter((v) => v !== certa)), explicacao: `Segundo o CIA World Factbook. ${relTexto(cc)}.`, fontes,
    };
  }
  const certa = GRUPO_NOME[r.g];
  const grupos = ['Cristianismo', 'Islamismo', 'Hinduísmo', 'Budismo', 'Judaísmo'];
  return {
    tema: 'religiao', formato: 'escolha', pergunta: 'Qual é a religião predominante neste país?', destaque: { tipo: 'pais', cc },
    ...escolha(rng, certa, distratores(rng, grupos, [certa], 3)), explicacao: `Segundo o CIA World Factbook. ${relTexto(cc)}.`, fontes,
  };
}

// ---------- Esporte ----------
const E = D.esportes;
function esportePool(level: LevelId): string[] {
  return [
    ...E.copa.map((c) => `copa:${c.ano}`),
    ...E.olimpiadas.filter((o) => level === 'prime' || o.estacao === 'verao').map((o) => `olim:${o.estacao}:${o.ano}`),
    ...E.f1.map((f) => `f1:${f.ano}`),
    ...E.bola.map((b) => `bola:${b.ano}`),
    ...(level === 'prime' ? E.copaFem.map((c) => `copafem:${c.ano}`) : []),
  ];
}

function esporteRound(rng: Rng, level: LevelId, key: string, formato: Formato): Omit<QuizRound, 'mod' | 'key'> {
  const [tipo, a, b] = key.split(':');
  if (tipo === 'copa' || tipo === 'copafem') {
    const lista = tipo === 'copa' ? E.copa : E.copaFem;
    const nome = tipo === 'copa' ? 'Copa do Mundo masculina' : 'Copa do Mundo feminina';
    const c = lista.find((x) => x.ano === Number(a))!;
    const txt = (x: Copa) => `${x.ano}: ${x.campeao} venceu ${x.vice} na final${x.placar ? ` (${x.placar})` : ''}; sede: ${x.sede}`;
    if (formato === 'pares') {
      const sel = [c];
      for (const x of shuffle(rng, lista)) if (sel.length < 3 && !sel.some((s) => s.campeao === x.campeao)) sel.push(x);
      return { tema: 'esporte', pergunta: `Ligue cada edição da ${nome} à seleção campeã.`, ...pares(rng, sel.map((x) => String(x.ano)), sel.map((x) => x.campeao)), explicacao: sel.map(txt).join('; ') + '.', fontes: c.fontes };
    }
    const campeoes = [...new Set([...lista.map((x) => x.campeao), ...lista.map((x) => x.vice)])];
    if (rng() < 0.35) {
      const sedes = [...new Set(lista.map((x) => x.sede))];
      return { tema: 'esporte', formato: 'escolha', pergunta: `Onde foi disputada a ${nome} de ${c.ano}?`, ...escolha(rng, c.sede, distratores(rng, sedes, [c.sede], 3)), explicacao: txt(c) + '.', fontes: c.fontes };
    }
    const pref = level === 'prime' ? [c.vice] : [];
    return { tema: 'esporte', formato: 'escolha', pergunta: `Quem venceu a ${nome} de ${c.ano}?`, ...escolha(rng, c.campeao, distratores(rng, campeoes, [c.campeao], 3, pref)), explicacao: txt(c) + '.', fontes: c.fontes };
  }
  if (tipo === 'olim') {
    const o = E.olimpiadas.find((x) => x.estacao === a && x.ano === Number(b))!;
    const est = o.estacao === 'verao' ? 'Verão' : 'Inverno';
    const futuro = o.ano > 2026 || (o.ano === 2026 && o.estacao === 'verao');
    const cidades = [...new Set(E.olimpiadas.filter((x) => x.estacao === o.estacao).map((x) => x.cidade))];
    return {
      tema: 'esporte', formato: 'escolha', pergunta: `Que cidade ${futuro ? 'vai sediar' : 'sediou'} os Jogos Olímpicos de ${est} de ${o.ano}?`,
      ...escolha(rng, o.cidade, distratores(rng, cidades, [o.cidade], 3)), explicacao: `${o.ano}: ${o.cidade}, ${o.pais}.${o.nota ? ` ${o.nota}` : ''}`, fontes: o.fontes,
    };
  }
  if (tipo === 'f1') {
    const f = E.f1.find((x) => x.ano === Number(a))!;
    const txt = (x: F1) => `${x.ano}: ${x.piloto} (${x.pais}), pela ${x.equipe}`;
    if (formato === 'pares') {
      const sel = [f];
      for (const x of shuffle(rng, E.f1)) if (sel.length < 3 && !sel.some((s) => s.piloto === x.piloto)) sel.push(x);
      return { tema: 'esporte', pergunta: 'Ligue cada temporada da Fórmula 1 ao campeão mundial.', ...pares(rng, sel.map((x) => String(x.ano)), sel.map((x) => x.piloto)), explicacao: sel.map(txt).join('; ') + '.', fontes: f.fontes };
    }
    const pilotos = [...new Set(E.f1.map((x) => x.piloto))];
    const perto = level === 'prime' ? E.f1.filter((x) => Math.abs(x.ano - f.ano) <= 4).map((x) => x.piloto) : [];
    return { tema: 'esporte', formato: 'escolha', pergunta: `Quem foi campeão mundial de Fórmula 1 em ${f.ano}?`, ...escolha(rng, f.piloto, distratores(rng, pilotos, [f.piloto], 3, perto)), explicacao: txt(f) + '.', fontes: f.fontes };
  }
  const g = E.bola.find((x) => x.ano === Number(a))!;
  const jogadores = [...new Set(E.bola.map((x) => x.jogador))];
  const perto = level === 'prime' ? E.bola.filter((x) => Math.abs(x.ano - g.ano) <= 4).map((x) => x.jogador) : [];
  return {
    tema: 'esporte', formato: 'escolha', pergunta: `Quem ganhou a Bola de Ouro de ${g.ano}?`,
    ...escolha(rng, g.jogador, distratores(rng, jogadores, [g.jogador], 3, perto)), explicacao: `${g.ano}: ${g.jogador} (${g.pais}), do ${g.clube}.`, fontes: g.fontes,
  };
}

// ---------- Filosofia ----------
const FIL = D.filosofos;
const filTexto = (f: Filosofo) => `${f.n} (${f.origem}; ${f.epoca}): ${f.obras.join(', ')}.${f.extra ? ` ${f.extra}` : ''}`;
function filosofiaRound(rng: Rng, level: LevelId, key: string, formato: Formato): Omit<QuizRound, 'mod' | 'key'> {
  if (key.startsWith('fillivre:')) {
    const l = D.filosofiaLivres[Number(key.slice(9))];
    return { tema: 'filosofia', formato: 'escolha', pergunta: l.pergunta, ...escolha(rng, l.certa, l.erradas), explicacao: l.explicacao, fontes: l.fontes };
  }
  const f = FIL[Number(key.slice(4))];
  const nomes = FIL.map((x) => x.n);
  const pref = level === 'prime' ? FIL.filter((x) => x.epoca === f.epoca).map((x) => x.n) : [];
  if (formato === 'pares') {
    const sel = [f, ...shuffle(rng, FIL.filter((x) => x !== f)).slice(0, 2)];
    const obras = sel.map((x) => pick(rng, x.obras));
    return { tema: 'filosofia', pergunta: 'Ligue cada pensador à sua obra.', ...pares(rng, sel.map((x) => x.n), obras), explicacao: sel.map(filTexto).join(' '), fontes: sel.flatMap((x) => x.fontes) };
  }
  const tipos: string[] = ['obra', 'obra', 'autor'];
  if (f.conceito) tipos.push('conceito');
  if (f.frase) tipos.push('frase', 'frase');
  const tipo = pick(rng, tipos);
  if (tipo === 'autor') {
    const obra = pick(rng, f.obras);
    const outras = FIL.filter((x) => x !== f).flatMap((x) => x.obras);
    return { tema: 'filosofia', formato: 'escolha', pergunta: `Qual destas obras é de ${f.n}?`, ...escolha(rng, obra, distratores(rng, outras, [obra], 3)), explicacao: filTexto(f), fontes: f.fontes };
  }
  if (tipo === 'conceito') {
    return { tema: 'filosofia', formato: 'escolha', pergunta: 'A que pensador se associa este conceito?', destaque: { tipo: 'nota', texto: cap(f.conceito!) }, ...escolha(rng, f.n, distratores(rng, nomes, [f.n], 3, pref)), explicacao: filTexto(f), fontes: f.fontes };
  }
  if (tipo === 'frase') {
    return { tema: 'filosofia', formato: 'escolha', pergunta: 'De quem é esta frase?', destaque: { tipo: 'citacao', texto: f.frase! }, ...escolha(rng, f.n, distratores(rng, nomes, [f.n], 3, pref)), explicacao: filTexto(f), fontes: f.fontes };
  }
  const obra = pick(rng, f.obras);
  return { tema: 'filosofia', formato: 'escolha', pergunta: 'Quem escreveu esta obra?', destaque: { tipo: 'nota', texto: obra }, ...escolha(rng, f.n, distratores(rng, nomes, [f.n], 3, pref)), explicacao: filTexto(f), fontes: f.fontes };
}

// ---------- Arte ----------
const OB = D.obras;
const obraTexto = (o: Obra) => `${o.titulo}, de ${o.autor}${o.ano ? ` (${o.ano})` : ''}${o.local ? `: ${o.local}${o.cidade ? `, ${o.cidade}` : ''}` : ''}${o.movimento ? `; ${o.movimento.toLowerCase()}` : ''}.${o.extra ? ` ${o.extra}` : ''}`;
function arteRound(rng: Rng, _level: LevelId, key: string, formato: Formato): Omit<QuizRound, 'mod' | 'key'> {
  const o = OB[Number(key.slice(5))];
  if (formato === 'pares') {
    const sel = [o];
    for (const x of shuffle(rng, OB)) if (sel.length < 3 && !sel.some((s) => s.autor === x.autor)) sel.push(x);
    return { tema: 'arte', pergunta: 'Ligue cada obra ao artista.', ...pares(rng, sel.map((x) => x.titulo), sel.map((x) => x.autor)), explicacao: sel.map(obraTexto).join(' '), fontes: sel.flatMap((x) => x.fontes) };
  }
  // Sem perguntas sobre onde a obra está (pedido do usuário em 09/11/2026); o museu aparece só na explicação.
  const tipos = ['autor', 'autor'];
  if (o.movimento) tipos.push('movimento');
  const tipo = pick(rng, tipos);
  if (tipo === 'movimento') {
    const movs = [...new Set(OB.map((x) => x.movimento).filter((c): c is string => Boolean(c)))];
    return { tema: 'arte', formato: 'escolha', pergunta: 'A que movimento ou período pertence esta obra?', destaque: { tipo: 'nota', texto: o.titulo, sub: o.autor }, ...escolha(rng, o.movimento!, distratores(rng, movs, [o.movimento!], 3)), explicacao: obraTexto(o), fontes: o.fontes };
  }
  const autores = [...new Set(OB.map((x) => x.autor))];
  return { tema: 'arte', formato: 'escolha', pergunta: 'Quem é o autor desta obra?', destaque: { tipo: 'nota', texto: o.titulo }, ...escolha(rng, o.autor, distratores(rng, autores, [o.autor], 3)), explicacao: obraTexto(o), fontes: o.fontes };
}

// ---------- Cultura pop ----------
const P = D.pop;
function popRound(rng: Rng, level: LevelId, key: string, formato: Formato): Omit<QuizRound, 'mod' | 'key'> {
  const [tipo, a] = key.split(':');
  if (tipo === 'oscar') {
    const f = P.oscarFilme.find((x) => x.ano === Number(a))!;
    const txt = (x: { ano: number; filme: string }) => `${x.ano}: ${x.filme}`;
    if (formato === 'pares') {
      const sel = [f, ...shuffle(rng, P.oscarFilme.filter((x) => x !== f)).slice(0, 2)];
      return { tema: 'pop', pergunta: 'Ligue cada cerimônia do Oscar ao vencedor de Melhor Filme.', ...pares(rng, sel.map((x) => String(x.ano)), sel.map((x) => x.filme)), explicacao: `Melhor Filme, pelo ano da cerimônia. ${sel.map(txt).join('; ')}.`, fontes: f.fontes };
    }
    const perto = level === 'prime' ? P.oscarFilme.filter((x) => Math.abs(x.ano - f.ano) <= 4).map((x) => x.filme) : [];
    return { tema: 'pop', formato: 'escolha', pergunta: `Qual filme ganhou o Oscar de Melhor Filme na cerimônia de ${f.ano}?`, ...escolha(rng, f.filme, distratores(rng, P.oscarFilme.map((x) => x.filme), [f.filme], 3, perto)), explicacao: `Na cerimônia de ${f.ano}, o Oscar de Melhor Filme foi para ${f.filme}.`, fontes: f.fontes };
  }
  if (tipo === 'direcao') {
    const d = P.oscarDirecao.find((x) => x.ano === Number(a))!;
    const nomes = [...new Set(P.oscarDirecao.map((x) => x.diretor))];
    if (formato === 'pares') {
      const sel = [d];
      for (const x of shuffle(rng, P.oscarDirecao)) if (sel.length < 3 && !sel.some((y) => y.diretor === x.diretor)) sel.push(x);
      return { tema: 'pop', pergunta: 'Ligue cada filme a quem ganhou o Oscar de Melhor Direção por ele.', ...pares(rng, sel.map((x) => x.filme), sel.map((x) => x.diretor)), explicacao: sel.map((x) => `${x.filme}: ${x.diretor}, na cerimônia de ${x.ano}`).join('; ') + '.', fontes: d.fontes };
    }
    return { tema: 'pop', formato: 'escolha', pergunta: 'Quem ganhou o Oscar de Melhor Direção por este filme?', destaque: { tipo: 'nota', texto: d.filme, sub: `Cerimônia de ${d.ano}` }, ...escolha(rng, d.diretor, distratores(rng, nomes, [d.diretor], 3)), explicacao: `${d.diretor} ganhou o Oscar de Melhor Direção por ${d.filme}, na cerimônia de ${d.ano}.`, fontes: d.fontes };
  }
  if (tipo === 'livro') {
    const l = P.livros[Number(a)];
    const autores = [...new Set(P.livros.map((x) => x.autor))];
    const txt = (x: typeof l) => `${x.titulo}${x.original !== x.titulo ? ` (${x.original})` : ''}, de ${x.autor}`;
    if (formato === 'pares') {
      const sel = [l, ...shuffle(rng, P.livros.filter((x) => x.autor !== l.autor)).filter((x, k, arr) => arr.findIndex((y) => y.autor === x.autor) === k).slice(0, 2)];
      return { tema: 'pop', pergunta: 'Ligue cada livro best-seller ao autor.', ...pares(rng, sel.map((x) => x.titulo), sel.map((x) => x.autor)), explicacao: sel.map(txt).join('; ') + '. Todos estão entre os livros ou séries de livros mais vendidos do mundo.', fontes: l.fontes };
    }
    return { tema: 'pop', formato: 'escolha', pergunta: 'Quem escreveu este best-seller?', destaque: { tipo: 'nota', texto: l.titulo, sub: l.original !== l.titulo ? l.original : undefined }, ...escolha(rng, l.autor, distratores(rng, autores, [l.autor], 3)), explicacao: `${txt(l)}, ${l.serie ? 'uma das séries de livros mais vendidas' : 'um dos livros mais vendidos'} do mundo.`, fontes: l.fontes };
  }
  const j = P.jogos[Number(a)];
  // Empresas ligadas entre si não entram como alternativa errada uma da outra.
  const LIGADAS: Record<string, string[]> = { 'Blizzard Entertainment': ['Activision'], Activision: ['Blizzard Entertainment'] };
  const editoras = [...new Set(P.jogos.map((x) => x.editora))].filter((e) => !(LIGADAS[j.editora] ?? []).includes(e));
  return { tema: 'pop', formato: 'escolha', pergunta: 'Que empresa lançou este videogame?', destaque: { tipo: 'nota', texto: j.titulo, sub: `Lançado em ${j.ano}` }, ...escolha(rng, j.editora, distratores(rng, editoras, [j.editora], 3)), explicacao: `${j.titulo} (${j.ano}) foi publicado pela ${j.editora} e está entre os videogames mais vendidos da história.`, fontes: j.fontes };
}

// ---------- Acervo e montagem ----------
export function temaPool(tema: Tema, level: LevelId): string[] {
  switch (tema) {
    case 'moeda': return moedaPool(level);
    case 'lider': return liderPool();
    case 'religiao': return relUniverso(level).map((cc) => `religiao:${cc}`);
    case 'esporte': return esportePool(level);
    case 'filosofia': return [...FIL.map((_, i) => `fil:${i}`), ...D.filosofiaLivres.map((_, i) => `fillivre:${i}`)];
    case 'arte': return OB.map((_, i) => `obra:${i}`);
    case 'pop': return [...P.oscarFilme.map((x) => `oscar:${x.ano}`), ...P.oscarDirecao.map((x) => `direcao:${x.ano}`), ...P.livros.map((_, i) => `livro:${i}`), ...P.jogos.map((_, i) => `jogo:${i}`)];
  }
}

/** Formato da rodada: Estagiário quase sempre escolha; Prime mistura escolha, pares e intruso. */
export function formatoPara(rng: Rng, level: LevelId, tema: Tema, key: string): Formato {
  const r = rng();
  const podeIntruso = tema === 'lider' || tema === 'religiao' || (tema === 'moeda' && key.startsWith('moeda:') && BASES_INTRUSO.has(D.moedas[key.slice(6)].base));
  const podePares = !key.startsWith('simbolo:') && !key.startsWith('olim:') && !key.startsWith('bola:') && !key.startsWith('fillivre:') && !key.startsWith('jogo:');
  if (level === 'estagiario') return podePares && r < 0.2 ? 'pares' : 'escolha';
  if (podeIntruso && r < 0.25) return 'intruso';
  if (podePares && r < 0.5) return 'pares';
  return 'escolha';
}

export function quizRound(rng: Rng, level: LevelId, mod: 'mundo' | 'cultura', tema: Tema, key: string): QuizRound {
  const formato = formatoPara(rng, level, tema, key);
  const build = { moeda: moedaRound, lider: liderRound, religiao: religiaoRound, esporte: esporteRound, filosofia: filosofiaRound, arte: arteRound, pop: popRound }[tema];
  return { mod, key, ...build(rng, level, key, formato) };
}

/** Precisão: escolha e intruso valem 1 ou 0; pares, a fração de ligações certas. */
export function quizPrecision(round: QuizRound, resposta: number[] | null): number {
  if (!resposta) return 0;
  if (round.formato === 'pares') return round.certo.filter((c, i) => resposta[i] === c).length / round.certo.length;
  return resposta[0] === round.certo[0] ? 1 : 0;
}

export const temaDaKey = (key: string): Tema => {
  const p = key.split(':')[0];
  return ({ moeda: 'moeda', simbolo: 'moeda', lider: 'lider', religiao: 'religiao', copa: 'esporte', copafem: 'esporte', olim: 'esporte', f1: 'esporte', bola: 'esporte', fil: 'filosofia', fillivre: 'filosofia', obra: 'arte', oscar: 'pop', direcao: 'pop', livro: 'pop', jogo: 'pop' } as Record<string, Tema>)[p];
};

export const _quizInternals = { titularEm, datasValidas, LIDERES, D };
