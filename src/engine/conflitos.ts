// Guerras e conflitos (dinâmica nova, pedida em 06/11/2026): alterna Dossiê e Lados.
// Dossiê: pistas progressivas (pano de fundo, envolvidos, estopim, desfecho); acertar cedo vale mais.
// Lados: dizer de que lado estava cada participante.
import data from '../data/conflitos.json';
import type { LevelId } from './levels';
import { shuffle, type Rng } from './rng';

export interface Membro { n: string; nota?: string; dificil?: boolean }
export interface Lado { nome: string; membros: Membro[] }
export interface Conflito {
  id: string;
  n: string;
  periodo: string;
  /** Ano de início; negativo para antes de Cristo. */
  ini: number;
  reg: string;
  pistas: { fundo: string; envolvidos: string; estopim: string; desfecho: string };
  dado?: string;
  lados?: { contexto?: string; a: Lado; b: Lado };
  fontes: { t: string; u: string }[];
}

export const CONFLITOS: Conflito[] = data.conflitos as Conflito[];
export const CONFLITO = new Map(CONFLITOS.map((c) => [c.id, c]));
export const CONFLITOS_VERSAO = data.versao;

/**
 * Recorte do jogo (pedido do usuário em 09/11/2026): as duas guerras mundiais, Afeganistão e Iraque, guerras com
 * Israel, guerras no Oriente Médio nos séculos XX e XXI e guerras com países europeus como beligerantes principais
 * nos séculos XX e XXI. As outras fichas continuam no acervo, fora da partida.
 */
export const EM_JOGO = new Set([
  'primeira-guerra-mundial', 'segunda-guerra-mundial', 'guerra-do-afeganistao', 'guerra-do-iraque',
  'primeira-guerra-arabe-israelense', 'guerra-dos-seis-dias', 'guerra-do-yom-kipur',
  'guerra-de-independencia-turca', 'guerra-ira-iraque', 'guerra-do-golfo', 'guerra-civil-siria',
  'guerra-russo-japonesa', 'guerras-balcanicas', 'guerra-civil-russa', 'guerra-civil-espanhola', 'guerra-da-indochina',
  'guerra-da-argelia', 'guerra-colonial-portuguesa', 'guerra-sovietico-afega', 'guerra-das-malvinas', 'guerras-iugoslavas',
  'guerra-russo-ucraniana',
]);
export const CONFLITOS_JOGO = CONFLITOS.filter((c) => EM_JOGO.has(c.id));

export const PISTAS = ['fundo', 'envolvidos', 'estopim', 'desfecho'] as const;
export type PistaId = (typeof PISTAS)[number];
export const PISTA_NOME: Record<PistaId, string> = {
  fundo: 'Pano de fundo',
  envolvidos: 'Quem estava envolvido',
  estopim: 'Estopim',
  desfecho: 'Desfecho',
};
/** Fração da pontuação ao acertar com 1, 2, 3 ou 4 pistas abertas. */
export const PISTA_VALOR = [1, 0.75, 0.5, 0.3];

export interface DossieRound { mod: 'conflitos'; tipo: 'dossie'; key: string; answer: string; options: string[] }
export interface LadosRound { mod: 'conflitos'; tipo: 'lados'; key: string; conflito: string; membros: { n: string; lado: 'a' | 'b' }[] }
export type ConflictRound = DossieRound | LadosRound;

export const conflictItems = (_level: LevelId) => CONFLITOS_JOGO.map((c) => ({ key: `conf:${c.id}`, cc: c.id }));

/**
 * Distratores: no Observador, os conflitos mais distantes no tempo; no Estrategista, os mais próximos
 * (mesma região pesa como 500 anos de proximidade); no Analista, sorteio livre.
 */
export function dossieRound(rng: Rng, level: LevelId, id: string): DossieRound {
  const c = CONFLITO.get(id)!;
  const dist = (o: Conflito) => Math.abs(o.ini - c.ini) + (o.reg === c.reg ? 0 : 500);
  const score = (o: Conflito) => (level === 'estagiario' ? -dist(o) : 0);
  const others = shuffle(rng, CONFLITOS_JOGO.filter((o) => o.id !== id)).sort((a, b) => score(a) - score(b));
  const options = shuffle(rng, [c, ...others.slice(0, 3)]).map((o) => o.id);
  return { mod: 'conflitos', tipo: 'dossie', key: `conf:${id}`, answer: id, options };
}

const LADOS_N: Record<LevelId, number> = { estagiario: 4, prime: 6 };

/** Participantes da rodada: ao menos um de cada lado; Observador evita os difíceis, Estrategista os prefere. */
export function ladosRound(rng: Rng, level: LevelId, id: string): LadosRound {
  const c = CONFLITO.get(id)!;
  const all = (['a', 'b'] as const).flatMap((lado) => c.lados![lado].membros.map((m) => ({ ...m, lado })));
  const rank = (m: Membro) => (level === 'estagiario' ? (m.dificil ? 1 : 0) : 0);
  const order = shuffle(rng, all).sort((x, y) => rank(x) - rank(y));
  const n = Math.min(LADOS_N[level], all.length);
  const first = (['a', 'b'] as const).map((lado) => order.find((m) => m.lado === lado)!);
  const picked = [...first, ...order.filter((m) => !first.includes(m))].slice(0, n);
  return { mod: 'conflitos', tipo: 'lados', key: `conf:${id}`, conflito: id, membros: shuffle(rng, picked).map((m) => ({ n: m.n, lado: m.lado })) };
}

/** Rodadas pares são Dossiê e ímpares, Lados (quando o conflito tem lados cadastrados). */
export function conflictRound(rng: Rng, level: LevelId, id: string, index: number): ConflictRound {
  return index % 2 === 1 && CONFLITO.get(id)!.lados ? ladosRound(rng, level, id) : dossieRound(rng, level, id);
}

const LADOS_EXP: Record<LevelId, number> = { estagiario: 1, prime: 1.5 };
/** Precisão do Lados: fração de acertos, com expoente que pune mais o erro nos níveis altos. */
export function ladosPrecision(level: LevelId, round: LadosRound, answers: ('a' | 'b' | null)[]): { p: number; certos: number } {
  const certos = round.membros.filter((m, i) => answers[i] === m.lado).length;
  return { p: (certos / round.membros.length) ** LADOS_EXP[level], certos };
}

export const membroNota = (id: string, nome: string): Membro | undefined => {
  const c = CONFLITO.get(id)!;
  return [...c.lados!.a.membros, ...c.lados!.b.membros].find((m) => m.n === nome);
};
