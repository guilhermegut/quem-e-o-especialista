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
