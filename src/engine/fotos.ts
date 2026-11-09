// Módulo Foto: em que ano esta fotografia foi tirada? Cinco anos como opções, igualmente espaçados.
// As fotos ficam em public/fotos/<id>.webp, com ficha (ano, acervo, autor, licença, link) em src/data/fotos.json.
import FOTOS_JSON from '../data/fotos.json';
import type { LevelId } from './levels';
import type { Rng } from './rng';

export interface Foto {
  id: string;
  ano: number;
  titulo: string;       // descrição curta em português, sem o ano
  acervo: string;       // instituição ou coleção de origem
  autor: string;
  licenca: string;      // CC0, Domínio público, CC BY 3.0 BR, CC BY-SA 4.0...
  licencaUrl?: string;
  url: string;          // página da imagem na fonte (Wikimedia Commons ou acervo)
  w: number;
  h: number;
}

export interface FotoRound { mod: 'foto'; key: string; id: string; opcoes: number[]; certo: number; passo: number }

export const FOTOS = FOTOS_JSON as Foto[];
export const FOTO = new Map(FOTOS.map((f) => [f.id, f]));
export const fotoSrc = (id: string) => `fotos/${id}.webp`;

const ANO_MIN = 1880;
const ANO_MAX = 2026;

/** Estagiário: anos a 8–12 de distância; Prime: a 3–5. A resposta cai numa posição sorteada. */
export function fotoRound(rng: Rng, level: LevelId, id: string): FotoRound {
  const f = FOTO.get(id);
  if (!f) throw new Error(`foto desconhecida: ${id}`);
  const passo = level === 'estagiario' ? 8 + Math.floor(rng() * 5) : 3 + Math.floor(rng() * 3);
  let pos = Math.floor(rng() * 5);
  while (pos < 4 && f.ano + (4 - pos) * passo > ANO_MAX) pos++;
  while (pos > 0 && f.ano - pos * passo < ANO_MIN) pos--;
  const opcoes = Array.from({ length: 5 }, (_, i) => f.ano + (i - pos) * passo);
  return { mod: 'foto', key: `foto:${id}`, id, opcoes, certo: pos, passo };
}

/** Acerto vale 1; uma opção ao lado vale 0,6; duas, 0,2. */
export function fotoPrecision(r: FotoRound, escolha: number | null): number {
  if (escolha === null || escolha < 0) return 0;
  const erro = Math.abs(r.opcoes[escolha] - r.opcoes[r.certo]);
  return Math.max(0, Math.round((1 - erro / (2.5 * r.passo)) * 100) / 100);
}
