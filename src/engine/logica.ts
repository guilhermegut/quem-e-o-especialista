// Módulo Lógica: perguntas geradas por regra, rápidas de responder (nível de um teste de QI em torno de 90).
// Cada chave `logica:<tipo>:<n>` gera sempre a mesma pergunta; o Desafio do Dia usa três tipos diferentes.
import type { LevelId } from './levels';
import { rngFrom, shuffle, type Rng } from './rng';

export type TipoLogica = 'sequencia' | 'giro' | 'lados' | 'intruso' | 'balanca' | 'espelho' | 'relogio' | 'quadro';
export const TIPOS_LOGICA: TipoLogica[] = ['sequencia', 'giro', 'lados', 'intruso', 'balanca', 'espelho', 'relogio', 'quadro'];
export const TIPO_NOME: Record<TipoLogica, string> = {
  sequencia: 'Sequência', giro: 'Giro', lados: 'Lados', intruso: 'Intruso', balanca: 'Balança', espelho: 'Espelho', relogio: 'Relógio', quadro: 'Quadro',
};

export type FormaNome = 'circulo' | 'quadrado' | 'triangulo' | 'losango' | 'pentagono' | 'hexagono' | 'estrela' | 'seta' | 'poligono';
/** Figura desenhada em SVG pela tela do módulo. */
export type Figura =
  | { tipo: 'forma'; forma: FormaNome; giro?: number; cheia?: boolean; lados?: number }
  | { tipo: 'grade'; celulas: [number, number][] }
  | { tipo: 'relogio'; h: number; m: number }
  | { tipo: 'texto'; texto: string }
  | { tipo: 'vazio' };

export interface LogicaRound {
  mod: 'logica';
  key: string;
  tipoLogica: TipoLogica;
  pergunta: string;
  /** O que aparece no enunciado, em linha (ex.: a sequência com o "?" no fim). */
  enunciado: Figura[];
  /** Linhas extras do enunciado (balança: as equivalências). */
  linhas?: Figura[][];
  /** Quadro 3x3 (tipo quadro): nove figuras, uma delas vazia. */
  quadro?: Figura[];
  opcoes: Figura[];
  certo: number;
  explicacao: string;
}

export const N_POR_TIPO = 400;
export const logicaPool = (tipo: TipoLogica): string[] => Array.from({ length: N_POR_TIPO }, (_, n) => `logica:${tipo}:${n}`);

const int = (rng: Rng, a: number, b: number) => a + Math.floor(rng() * (b - a + 1));
const pick = <T>(rng: Rng, arr: T[]) => arr[Math.floor(rng() * arr.length)];
const T = (texto: string | number): Figura => ({ tipo: 'texto', texto: String(texto) });
const F = (forma: FormaNome, extra: Partial<Extract<Figura, { tipo: 'forma' }>> = {}): Figura => ({ tipo: 'forma', forma, ...extra });
const chave = (f: Figura) => JSON.stringify(f);
const cap1 = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

/** Mistura a certa com as erradas, sem repetir figura, e devolve o índice da certa. */
function montar(rng: Rng, certa: Figura, erradas: Figura[]) {
  const vistos = new Set([chave(certa)]);
  const unicas: Figura[] = [];
  for (const e of erradas) { const k = chave(e); if (!vistos.has(k)) { vistos.add(k); unicas.push(e); } }
  const opcoes = shuffle(rng, [certa, ...unicas.slice(0, 3)]);
  return { opcoes, certo: opcoes.findIndex((o) => chave(o) === chave(certa)) };
}

// ---------- Sequência numérica ----------
function sequencia(rng: Rng, level: LevelId): Omit<LogicaRound, 'mod' | 'key'> {
  const regras = level === 'estagiario' ? ['soma', 'soma', 'dobro', 'subtrai'] : ['soma', 'dobro', 'crescente', 'alterna', 'triplo'];
  const regra = pick(rng, regras);
  let termos: number[] = [];
  let explic = '';
  if (regra === 'soma') { const a = int(rng, 1, 20), k = int(rng, 2, level === 'prime' ? 13 : 9); termos = Array.from({ length: 5 }, (_, i) => a + i * k); explic = `Soma ${k} a cada passo.`; }
  if (regra === 'subtrai') { const k = int(rng, 2, 9), a = int(rng, 4 * k + 5, 4 * k + 40); termos = Array.from({ length: 5 }, (_, i) => a - i * k); explic = `Tira ${k} a cada passo.`; }
  if (regra === 'dobro') { const a = int(rng, 1, 6); termos = Array.from({ length: 5 }, (_, i) => a * 2 ** i); explic = 'Cada número é o dobro do anterior.'; }
  if (regra === 'triplo') { const a = int(rng, 1, 3); termos = Array.from({ length: 5 }, (_, i) => a * 3 ** i); explic = 'Cada número é o triplo do anterior.'; }
  if (regra === 'crescente') { const a = int(rng, 1, 10), d = int(rng, 1, 3); termos = [a]; for (let i = 0; i < 4; i++) termos.push(termos[i] + d + i); explic = `As diferenças crescem de 1 em 1: +${d}, +${d + 1}, +${d + 2}, +${d + 3}.`; }
  if (regra === 'alterna') { const a = int(rng, 2, 15), p = int(rng, 3, 9), m = int(rng, 1, p - 1); termos = [a]; for (let i = 0; i < 4; i++) termos.push(termos[i] + (i % 2 === 0 ? p : -m)); explic = `Alterna: soma ${p}, tira ${m}.`; }
  const resp = termos[4];
  const passo = Math.abs(termos[3] - termos[2]) || 1;
  const erradas = shuffle(rng, [resp + 1, resp - 1, resp + passo, resp - passo, resp + 2, termos[3] + (termos[3] - termos[2])]).filter((x) => x !== resp && x >= 0);
  return { tipoLogica: 'sequencia', pergunta: 'Qual número continua a sequência?', enunciado: [...termos.slice(0, 4).map(T), T('?')], ...montar(rng, T(resp), erradas.map(T)), explicacao: `${explic} Depois de ${termos[3]} vem ${resp}.` };
}

// ---------- Giro de uma seta ----------
function giro(rng: Rng, level: LevelId): Omit<LogicaRound, 'mod' | 'key'> {
  const passo = level === 'estagiario' ? pick(rng, [90, -90]) : pick(rng, [45, -45, 90, 135, -135]);
  const ini = pick(rng, [0, 45, 90, 135, 180, 225, 270, 315]);
  const ang = (i: number) => (((ini + i * passo) % 360) + 360) % 360;
  const resp = ang(4);
  const erradas = [ang(3), (resp + 180) % 360, (resp + 90) % 360, (resp + 270) % 360, (resp + 45) % 360].filter((a) => a !== resp);
  const sentido = passo > 0 ? 'horário' : 'anti-horário';
  return {
    tipoLogica: 'giro', pergunta: 'Para onde a seta aponta no próximo passo?',
    enunciado: [0, 1, 2, 3].map((i) => F('seta', { giro: ang(i) })).concat(T('?')),
    ...montar(rng, F('seta', { giro: resp }), erradas.map((a) => F('seta', { giro: a }))),
    explicacao: `A seta gira ${Math.abs(passo)}° no sentido ${sentido} a cada passo.`,
  };
}

// ---------- Número de lados ----------
function lados(rng: Rng, level: LevelId): Omit<LogicaRound, 'mod' | 'key'> {
  // Polígonos regulares com 3 a 9 lados; a sequência soma 1 (Estagiário) ou alterna +1/+2 (Prime).
  const passos = level === 'estagiario' ? [1, 1, 1, 1] : pick(rng, [[1, 2, 1, 2], [2, 1, 2, 1], [1, 1, 1, 1]]);
  const ini = 3;
  const seq = [ini]; for (let i = 0; i < 4; i++) seq.push(seq[i] + passos[i]);
  const poli = (n: number): Figura => F('poligono', { lados: n });
  const resp = seq[4];
  const erradas = [resp - 1, resp + 1, resp + 2, seq[3]].filter((n) => n !== resp && n >= 3);
  return {
    tipoLogica: 'lados', pergunta: 'Que figura vem depois?',
    enunciado: [...seq.slice(0, 4).map(poli), T('?')],
    ...montar(rng, poli(resp), erradas.map(poli)),
    explicacao: `Conte os lados: ${seq.slice(0, 4).join(', ')}… o próximo tem ${resp} lados.`,
  };
}

// ---------- Intruso ----------
const FORMAS_BASE: FormaNome[] = ['circulo', 'quadrado', 'triangulo', 'losango', 'pentagono', 'hexagono', 'estrela'];
function intruso(rng: Rng, level: LevelId): Omit<LogicaRound, 'mod' | 'key'> {
  const regra = level === 'estagiario' ? pick(rng, ['forma', 'cheia']) : pick(rng, ['forma', 'cheia', 'giro']);
  const base = pick(rng, FORMAS_BASE.filter((f) => f !== 'circulo'));
  let iguais: Figura[] = [];
  let dif: Figura;
  let explic = '';
  if (regra === 'forma') {
    const outra = pick(rng, FORMAS_BASE.filter((f) => f !== base));
    const cheia = rng() < 0.5;
    iguais = [0, 1, 2].map(() => F(base, { cheia }));
    dif = F(outra, { cheia });
    explic = `Três são ${NOME_FORMA[base]}; a outra é ${UM_FORMA(outra)}.`;
  } else if (regra === 'cheia') {
    // Mesma forma nas quatro, para que a única diferença seja o preenchimento.
    iguais = [0, 1, 2].map(() => F(base, { cheia: true }));
    dif = F(base, { cheia: false });
    explic = `Os quatro são ${NOME_FORMA[base]}, mas só um é vazado.`;
  } else {
    // Três setas apontam para o mesmo lado, uma aponta para o lado oposto.
    const a = pick(rng, [0, 90, 180, 270]);
    const cheia = rng() < 0.5;
    iguais = [0, 1, 2].map(() => F('seta', { giro: a, cheia }));
    dif = F('seta', { giro: (a + 180) % 360, cheia });
    explic = 'Três setas apontam para o mesmo lado; uma aponta para o lado oposto.';
  }
  const opcoes = shuffle(rng, [...iguais, dif]);
  return { tipoLogica: 'intruso', pergunta: 'Qual figura não combina com as outras?', enunciado: [], opcoes, certo: opcoes.indexOf(dif), explicacao: explic };
}
const NOME_FORMA: Record<FormaNome, string> = { circulo: 'círculos', quadrado: 'quadrados', triangulo: 'triângulos', losango: 'losangos', pentagono: 'pentágonos', hexagono: 'hexágonos', estrela: 'estrelas', seta: 'setas', poligono: 'polígonos' };
const SING: Partial<Record<FormaNome, string>> = { circulo: 'círculo', quadrado: 'quadrado', triangulo: 'triângulo', losango: 'losango', pentagono: 'pentágono', hexagono: 'hexágono', estrela: 'estrela' };
const UM_FORMA = (f: FormaNome) => `${f === 'estrela' ? 'uma' : 'um'} ${SING[f]}`;

// ---------- Balança ----------
function balanca(rng: Rng, level: LevelId): Omit<LogicaRound, 'mod' | 'key'> {
  const [A, B, C] = shuffle(rng, ['quadrado', 'triangulo', 'circulo', 'estrela', 'losango'] as FormaNome[]).slice(0, 3);
  const x = int(rng, 2, level === 'prime' ? 4 : 3);
  const y = int(rng, 2, level === 'prime' ? 4 : 3);
  const linhas: Figura[][] = [
    [F(A, { cheia: true }), T('='), ...Array(x).fill(F(B, { cheia: true }))],
    [F(B, { cheia: true }), T('='), ...Array(y).fill(F(C, { cheia: true }))],
  ];
  const resp = x * y;
  const erradas = [x + y, resp + 1, resp - 1, resp + x].filter((n) => n !== resp && n > 0);
  return {
    tipoLogica: 'balanca', pergunta: `Pelas balanças, ${C === 'estrela' ? 'quantas' : 'quantos'} ${NOME_FORMA[C]} valem ${UM_FORMA(A)}?`,
    enunciado: [F(A, { cheia: true }), T('= ?')], linhas,
    ...montar(rng, T(resp), erradas.map(T)),
    explicacao: `${cap1(UM_FORMA(A))} vale ${x} ${NOME_FORMA[B]}, e cada ${SING[B]} vale ${y} ${NOME_FORMA[C]}: ${x} × ${y} = ${resp}.`,
  };
}

// ---------- Espelho ----------
// Pentaminós assimétricos (sem o Z, que repete a si mesmo girado 180°): o reflexo nunca coincide com uma rotação da peça.
const PECAS: [number, number][][] = [
  [[1, 0], [2, 0], [0, 1], [1, 1], [1, 2]], // F
  [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3]], // L
  [[1, 0], [1, 1], [0, 2], [1, 2], [0, 3]], // N
  [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2]], // P
  [[1, 0], [0, 1], [1, 1], [1, 2], [1, 3]], // Y
];
const normalizar = (c: [number, number][]): [number, number][] => {
  const mx = Math.min(...c.map((p) => p[0])), my = Math.min(...c.map((p) => p[1]));
  return c.map(([x, y]) => [x - mx, y - my] as [number, number]).sort((a, b) => a[1] - b[1] || a[0] - b[0]);
};
const girar = (c: [number, number][]) => normalizar(c.map(([x, y]) => [-y, x] as [number, number]));
const refletir = (c: [number, number][]) => normalizar(c.map(([x, y]) => [-x, y] as [number, number]));
function espelho(rng: Rng): Omit<LogicaRound, 'mod' | 'key'> {
  let p = normalizar(pick(rng, PECAS));
  for (let i = int(rng, 0, 3); i > 0; i--) p = girar(p);
  const g = (c: [number, number][]): Figura => ({ tipo: 'grade', celulas: c });
  const ref = refletir(p);
  const rot1 = girar(p), rot2 = girar(rot1), rot3 = girar(rot2);
  const erradas = [rot2, rot1, rot3, p].filter((c) => chave(g(c)) !== chave(g(ref)));
  return {
    tipoLogica: 'espelho', pergunta: 'Qual é o reflexo desta peça num espelho ao lado dela?',
    enunciado: [g(p), T('│')],
    ...montar(rng, g(ref), erradas.map(g)),
    explicacao: 'No espelho, o que está à direita passa para a esquerda; girar a peça não dá o mesmo resultado.',
  };
}

// ---------- Relógio ----------
const fmtHora = (h: number, m: number) => `${h}h${m ? String(m).padStart(2, '0') : ''}`;
function relogio(rng: Rng, level: LevelId): Omit<LogicaRound, 'mod' | 'key'> {
  const h = int(rng, 1, 12), m = level === 'estagiario' ? 0 : pick(rng, [0, 15, 30, 45]);
  const dh = int(rng, 1, 5), dm = level === 'estagiario' ? pick(rng, [0, 0, 30]) : pick(rng, [15, 30, 45]);
  const total = (h * 60 + m + dh * 60 + dm) % 720;
  const rh = Math.floor(total / 60) || 12, rm = total % 60;
  const alt = (min: number): Figura => { const t = ((min % 720) + 720) % 720; return { tipo: 'relogio', h: Math.floor(t / 60) || 12, m: t % 60 }; };
  const base = h * 60 + m;
  const erradas = [alt(base + dh * 60 + dm + 60), alt(base + dh * 60 + dm - 60), alt(base - dh * 60 - dm), alt(base + dh * 60), alt(base + dm)];
  const quanto = `${dh} hora${dh > 1 ? 's' : ''}${dm ? ` e ${dm} minutos` : ''}`;
  return {
    tipoLogica: 'relogio', pergunta: `Que horas o relógio vai marcar daqui a ${quanto}?`,
    enunciado: [{ tipo: 'relogio', h, m }],
    ...montar(rng, { tipo: 'relogio', h: rh, m: rm }, erradas),
    explicacao: `${fmtHora(h, m)} mais ${quanto} dá ${fmtHora(rh, rm)}.`,
  };
}

// ---------- Quadro 3x3 ----------
function quadro(rng: Rng, level: LevelId): Omit<LogicaRound, 'mod' | 'key'> {
  // Cada linha e cada coluna têm as três formas uma vez (quadrado latino). No Prime, cada linha tem também um preenchimento.
  const formas = shuffle(rng, ['circulo', 'quadrado', 'triangulo', 'estrela', 'losango'] as FormaNome[]).slice(0, 3);
  const desloc = rng() < 0.5 ? 1 : 2;
  const cheiaLinha = [true, false, rng() < 0.5];
  const cel = (l: number, c: number): Figura => F(formas[(l * desloc + c) % 3], { cheia: level === 'prime' ? cheiaLinha[l] : true });
  const falta = int(rng, 0, 8);
  const fl = Math.floor(falta / 3), fc = falta % 3;
  const resp = cel(fl, fc);
  const q: Figura[] = Array.from({ length: 9 }, (_, i) => (i === falta ? { tipo: 'vazio' } : cel(Math.floor(i / 3), i % 3)));
  const r = resp as Extract<Figura, { tipo: 'forma' }>;
  const erradas: Figura[] = [...formas.filter((f) => f !== r.forma).map((f) => F(f, { cheia: r.cheia })), F(r.forma, { cheia: !r.cheia })];
  return {
    tipoLogica: 'quadro', pergunta: 'Que figura completa o quadro?', enunciado: [], quadro: q,
    ...montar(rng, resp, level === 'prime' ? erradas : erradas.slice(0, 2).concat(F(pick(rng, ['hexagono', 'pentagono'] as FormaNome[]), { cheia: true }))),
    explicacao: level === 'prime'
      ? 'Em cada linha e em cada coluna, cada forma aparece uma vez; e cada linha mantém o mesmo preenchimento.'
      : 'Em cada linha e em cada coluna, cada forma aparece uma vez.',
  };
}

const GERADORES: Record<TipoLogica, (rng: Rng, level: LevelId) => Omit<LogicaRound, 'mod' | 'key'>> = {
  sequencia, giro, lados, intruso, balanca, espelho: (rng) => espelho(rng), relogio, quadro,
};

export const tipoDaKey = (key: string) => key.split(':')[1] as TipoLogica;

export function logicaRound(level: LevelId, key: string): LogicaRound {
  const tipo = tipoDaKey(key);
  const rng = rngFrom(`logica|${key}|${level}`);
  return { mod: 'logica', key, ...GERADORES[tipo](rng, level) };
}

export const logicaPrecision = (r: LogicaRound, escolha: number | null) => (escolha !== null && escolha === r.certo ? 1 : 0);
export const _logicaInternals = { normalizar, girar, refletir, PECAS };
