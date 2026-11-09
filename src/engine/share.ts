import { formatDateBR } from './date';
import { LEVELS, MODULE } from './levels';
import type { MatchSpec } from './match';
import type { RoundResult } from './storage';
import { shareSymbol } from './scoring';

export function shareText(spec: MatchSpec, rounds: RoundResult[], score: number, link: string): string {
  const titulo = spec.kind === 'daily' ? `Desafio do Dia ${formatDateBR(spec.date)}` : 'Partida livre';
  const linhas: string[] = [];
  let cur: RoundResult['mod'] | null = null;
  let buf = '';
  for (const r of rounds) {
    if (r.mod !== cur) { if (cur) linhas.push(`${MODULE[cur].nome} ${buf}`); cur = r.mod; buf = ''; }
    buf += shareSymbol(r.precision);
  }
  if (cur) linhas.push(`${MODULE[cur].nome} ${buf}`);
  return [
    `Quem é o Especialista · ${titulo} · ${LEVELS[spec.level].titulo}`,
    ...linhas,
    `${score.toLocaleString('pt-BR')} pontos`,
    link ? `Me desafie: ${link}` : '',
  ].filter(Boolean).join('\n');
}
