// Módulo Foto: em que ano esta fotografia foi tirada? O jogador arrasta uma linha do tempo de 1900 a 2026.
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

export interface FotoRound { mod: 'foto'; key: string; id: string }

export const FOTOS = FOTOS_JSON as Foto[];
export const FOTO = new Map(FOTOS.map((f) => [f.id, f]));
export const fotoSrc = (id: string) => `fotos/${id}.webp`;

/** A linha do tempo vai de 1900 ao ano atual; fotos mais antigas ficam fora do acervo. */
export const ANO_MIN = 1900;
export const ANO_MAX = 2026;
/** O cursor começa no meio da linha, igual para todas as fotos, para não dar pista. */
export const ANO_INICIAL = 1963;

export function fotoRound(_rng: Rng, _level: LevelId, id: string): FotoRound {
  if (!FOTO.get(id)) throw new Error(`foto desconhecida: ${id}`);
  return { mod: 'foto', key: `foto:${id}`, id };
}

/** Anos de tolerância: a pontuação cai a cerca de 37% a essa distância, como os quilômetros do mapa. */
export const K_FOTO: Record<LevelId, number> = { estagiario: 6, prime: 4 };
/** Cravar o ano vale 1; errar por um ano já vale 0,85 (o bônus de cravar) e daí cai exponencialmente. */
export function fotoPrecision(level: LevelId, certo: number, escolha: number | null): number {
  if (escolha === null) return 0;
  const d = Math.abs(escolha - certo);
  return d === 0 ? 1 : 0.85 * Math.exp(-(d - 1) / K_FOTO[level]);
}
