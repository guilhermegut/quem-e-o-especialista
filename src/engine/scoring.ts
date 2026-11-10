import { todayBR } from './date';
// Pontuação: cada rodada vale até 1.000 pontos brutos.
// 850 pela precisão e até 150 pela velocidade, proporcional à precisão
// (chute rápido e errado não ganha bônus). A soma é multiplicada pelo nível.

export const PRECISION_POINTS = 850;
export const SPEED_POINTS = 150;

/** Precisão no mapa: decai exponencialmente com a distância; k define a tolerância do nível. */
export const mapPrecision = (km: number, k: number) => (km <= 0 ? 1 : Math.exp(-km / k));

/** Revelação progressiva de bandeira: acertar mais cedo vale mais. */
export const REVEAL_STAGE_PRECISION = [1, 0.8, 0.6, 0.45];

export function roundPoints(precision: number, timeLeftFraction: number): number {
  const p = Math.min(Math.max(precision, 0), 1);
  const t = Math.min(Math.max(timeLeftFraction, 0), 1);
  return Math.round(PRECISION_POINTS * p + SPEED_POINTS * p * t);
}

/** Rodadas de aposta podem ser negativas; o total da partida nunca fica abaixo de zero. */
export const finalScore = (rawPoints: number[], multiplier: number) =>
  Math.max(0, Math.round(rawPoints.reduce((a, b) => a + b, 0) * multiplier));

export type Tier = 'otimo' | 'bom' | 'raspão' | 'erro';
export function tier(precision: number): Tier {
  if (precision >= 0.8) return 'otimo';
  if (precision >= 0.4) return 'bom';
  if (precision > 0.05) return 'raspão';
  return 'erro';
}
/** Símbolo monocromático da rodada no texto de compartilhamento (seção 13 do documento). */
export function shareSymbol(precision: number): string {
  if (precision >= 0.8) return '●';
  if (precision >= 0.6) return '◕';
  if (precision >= 0.4) return '◑';
  if (precision > 0.05) return '◔';
  return '○';
}

// ---------- "Não sei" e penalidade por erro (a partir do Desafio de 11/11/2026) ----------
// Em Bandeiras, Mundo hoje, Cultura e Guerras: errar com resposta marcada custa 10% de uma resposta certa;
// "Não sei" e tempo esgotado valem zero. O total do dia nunca fica abaixo de zero (finalScore).
export const PENALIDADE_ERRO = 100;
export const NAO_SEI_DESDE = '2026-11-10';
export const regrasNaoSei = (date: string = todayBR()) => date >= NAO_SEI_DESDE;

/** Pontos de uma rodada respondida: se a precisão for zero e a regra valer, perde a penalidade. */
export function pontosRespondida(precision: number, timeLeftFraction: number): number {
  return precision <= 0 && regrasNaoSei() ? -PENALIDADE_ERRO : roundPoints(precision, timeLeftFraction);
}
