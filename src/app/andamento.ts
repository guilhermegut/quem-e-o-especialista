// Partida em andamento gravada a cada rodada: se a página recarregar (atualização da prévia, aba descartada pelo
// celular, recarga acidental), o jogo volta para a mesma rodada em vez de recomeçar do menu.
import { CONTENT_VERSION } from '../data';
import type { DuelPayload } from '../engine/duel';
import type { MatchSpec } from '../engine/match';
import { apagar, gravarJSON, lerJSON, type RoundResult } from '../engine/storage';
import type { Parte } from './Results';

export interface Andamento {
  cv: string;
  tela: 'jogo' | 'desbloqueio';
  spec: MatchSpec;
  ranked: boolean;
  duel?: DuelPayload;
  nivel1?: Parte;
  i: number;
  results: RoundResult[];
  /** A rodada i estava na tela, sem resposta, quando a página caiu. */
  emRodada: boolean;
  salvo: number;
}

const CHAVE = 'andamento';
const VALIDADE_MS = 12 * 3600 * 1000;

export const salvarAndamento = (a: Omit<Andamento, 'cv' | 'salvo'>) => gravarJSON(CHAVE, { ...a, cv: CONTENT_VERSION, salvo: Date.now() });
export const limparAndamento = () => apagar(CHAVE);

export function lerAndamento(hoje: string): Andamento | null {
  const a = lerJSON<Andamento | null>(CHAVE, null);
  if (!a || a.cv !== CONTENT_VERSION || Date.now() - a.salvo > VALIDADE_MS) return null;
  if (a.spec.kind === 'daily' && a.spec.date !== hoje) return null;
  return a;
}
