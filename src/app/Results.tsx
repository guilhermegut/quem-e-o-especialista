import { useEffect, useMemo, useState } from 'react';
import { countryName } from '../data';
import { formatDateBR } from '../engine/date';
import { duelLink, encodeDuel, type DuelPayload } from '../engine/duel';
import { LEVELS, MAX_RAW, MODULES, PRIME_MIN_RAW } from '../engine/levels';
import { TEMA_NOME } from '../engine/quiz';
import type { MatchSpec, Round } from '../engine/match';
import { finalScore, tier } from '../engine/scoring';
import { shareText } from '../engine/share';
import { getSettings, saveSettings, type RoundResult } from '../engine/storage';
import { targetInfo } from '../modules/mapa/MapRoundView';
import { CONFLITO } from '../engine/conflitos';
import { copyText, fmtInt } from './format';
import { AnimPlacar } from './Anim';
import { falar, type Fala } from './voz';
import { rankingAtivo } from '../engine/ranking';
import { RankingNoResultado } from './Ranking';

/** Uma partida terminada: um nível. O resultado mostra uma (só o Nível 1) ou duas (Nível 1 e Prime). */
export interface Parte { spec: MatchSpec; rounds: Round[]; results: RoundResult[]; ranked: boolean }

interface Props {
  partes: Parte[];
  duel?: DuelPayload;
  onHome: () => void;
  /** Depois do Nível 1: 'bloqueado' (não chegou a 60%) ou 'liberado' (chegou, mas preferiu não jogar agora). */
  prime?: 'liberado' | 'bloqueado' | null;
  onPrime?: () => void;
  onRanking?: () => void;
}

export function roundLabel(r: Round): string {
  if (r.mod === 'mapa') { const t = targetInfo(r); return t.sub ? `${t.nome}, ${t.sub}` : t.nome; }
  if (r.mod === 'conflitos') return r.tipo === 'dossie' ? `Dossiê: ${CONFLITO.get(r.answer)!.n}` : `Lados: ${CONFLITO.get(r.conflito)!.n}`;
  if (r.mod === 'bandeiras') {
    if (r.variant === 'intrusa') return `Dupla errada: ${countryName(r.pairs[r.wrongIndex].flag)}`;
    return `Bandeira: ${countryName(r.answer)}`;
  }
  return `${TEMA_NOME[r.tema]}: ${r.formato === 'pares' ? r.esquerda!.join(', ') : r.opcoes[r.certo[0]]}`;
}

const TIER_TEXT = { otimo: 'ótimo', bom: 'bom', 'raspão': 'raspão', erro: 'errou' } as const;
const COR_MOD = { mapa: '#0071e3', bandeiras: '#e0245e', mundo: '#157a33', cultura: '#8e3fd0', conflitos: '#b84a00' } as const;

export function falaDoResultado(fracao: number): Fala {
  return fracao >= 0.85 ? 'res-especialista' : fracao >= 0.6 ? 'res-bom' : fracao >= 0.35 ? 'res-medio' : 'res-baixo';
}

function Resumo({ spec, score, ranked, rounds, results }: { spec: MatchSpec; score: number; ranked: boolean; rounds: Round[]; results: RoundResult[] }) {
  const titulo = spec.kind === 'daily' ? `Desafio do Dia, ${formatDateBR(spec.date)}` : 'Partida livre';
  const porModulo = MODULES.map((m) => {
    const idx = rounds.map((r, k) => (r.mod === m.id ? k : -1)).filter((k) => k >= 0 && results[k]);
    const soma = idx.reduce((a, k) => a + results[k].raw, 0);
    return { id: m.id, nome: m.nome, soma, max: idx.length * 1000, n: idx.length };
  }).filter((m) => m.n > 0);
  return (
    <section className="resumo-cartao" aria-label="Resumo da partida">
      <div className="resumo">
        <p className="resumo-rotulo">{titulo}</p>
        <h2 className="resumo-nivel-titulo">{spec.level === 'prime' ? 'Nível 2 · Prime' : 'Nível 1 · Estagiário'}</h2>
        <p className="sr-only">{fmtInt(score)} pontos no {LEVELS[spec.level].titulo}.</p>
        <AnimPlacar pontos={score} rotulo="pontos" modulos={porModulo.map((m) => ({ nome: m.nome, cor: COR_MOD[m.id], frac: Math.max(0, Math.min(1, m.soma / m.max)) }))} />
        <p className="resumo-nota">{ranked ? 'Primeira tentativa, vale para o ranking.' : 'Treino, não vale para o ranking.'}</p>
      </div>
      <ul className="modulos sr-only">
        {porModulo.map((m) => <li key={m.id}>{m.nome}: {fmtInt(m.soma)} de {fmtInt(m.max)} pontos.</li>)}
      </ul>
    </section>
  );
}

export function Results({ partes, duel, onHome, prime = null, onPrime, onRanking }: Props) {
  const [nome, setNome] = useState(getSettings().nome);
  const [copiado, setCopiado] = useState<'' | 'resultado' | 'desafio' | 'falhou'>('');
  const notas = partes.map((p) => {
    const raw = p.results.map((r) => r.raw);
    return { raw, score: finalScore(raw, LEVELS[p.spec.level].multiplicador), bruto: raw.reduce((a, b) => a + b, 0) };
  });
  const base = partes[0];
  const diarias = partes.flatMap((p) => (p.ranked && p.spec.kind === 'daily' ? [p.spec] : []));
  // O código de duelo leva o Nível 1, que todo mundo joga.
  const code = useMemo(() => encodeDuel(base.spec, nome || 'Alguém', notas[0].raw, notas[0].score), [base.spec, nome, notas]);
  const link = duelLink(code);
  const texto = partes.map((p, k) => shareText(p.spec, p.results, notas[k].score, k === partes.length - 1 ? link : '')).join('\n\n');

  const copy = async (what: 'resultado' | 'desafio', text: string) => {
    const ok = await copyText(text);
    setCopiado(ok ? what : 'falhou');
  };

  const rival = duel ? finalScore(duel.r, LEVELS[base.spec.level].multiplicador) : null;

  useEffect(() => {
    const ultima = notas[notas.length - 1];
    const fala = falaDoResultado(ultima.bruto / MAX_RAW);
    if (partes.length === 2) falar([fala, 'fim-prime']);
    else if (prime === 'bloqueado') falar([fala, 'prime-bloqueado']);
    else falar(fala);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="resultado">
      {partes.length === 2 && (
        <section className="resultado-dupla" aria-label="Pontuação nos dois níveis">
          <div><span>Nível 1 · Estagiário</span><strong>{fmtInt(notas[0].score)}</strong></div>
          <div className="resultado-dupla-prime"><span>Nível 2 · Prime</span><strong>{fmtInt(notas[1].score)}</strong></div>
        </section>
      )}
      {partes.map((p, k) => (
        <div className="resultado-parte" key={p.spec.level}>
          <div className="resultado-topo">
            <Resumo spec={p.spec} score={notas[k].score} ranked={p.ranked} rounds={p.rounds} results={p.results} />
            {k === 0 && prime === 'liberado' && (
              <section className="prime-aviso prime-liberado" aria-live="polite">
                <h2>Nível Prime liberado</h2>
                <p>Você fez {fmtInt(notas[0].bruto)} pontos brutos, acima dos {fmtInt(PRIME_MIN_RAW)} necessários. Dá para jogar o Prime de hoje quando quiser, pelo menu.</p>
                {onPrime && <button type="button" className="botao botao-prime botao-grande" onClick={onPrime}>Jogar o Nível Prime agora</button>}
              </section>
            )}
            {k === 0 && prime === 'bloqueado' && (
              <section className="prime-aviso prime-bloqueado" aria-live="polite">
                <h2>Prime fechado</h2>
                <p>Faltaram {fmtInt(PRIME_MIN_RAW - notas[0].bruto)} pontos brutos para chegar aos {fmtInt(PRIME_MIN_RAW)} (60% do máximo). Amanhã tem novo desafio.</p>
              </section>
            )}
            {k === 0 && duel && rival !== null && (
              <div className="duelo-placar" aria-live="polite">
                <p className="duelo-veredito">
                  {notas[0].score > rival ? `Você venceu ${duel.n}.` : notas[0].score < rival ? `${duel.n} venceu desta vez.` : `Empate com ${duel.n}.`}
                </p>
                <p className="duelo-numeros"><span>Você {fmtInt(notas[0].score)}</span><span>{duel.n} {fmtInt(rival)}</span></p>
              </div>
            )}
          </div>
          <details className="detalhe-dobra" open={partes.length === 1}>
            <summary>Rodada a rodada{LEVELS[p.spec.level].multiplicador === 1 ? '' : `, em pontos antes do multiplicador de ${LEVELS[p.spec.level].multiplicador.toLocaleString('pt-BR')}`}</summary>
            <table className="detalhe">
              <thead>
                <tr><th scope="col">Alvo</th><th scope="col">Resultado</th><th scope="col" className="num">Pontos</th>{k === 0 && duel && <th scope="col" className="num">{duel.n}</th>}</tr>
              </thead>
              <tbody>
                {p.rounds.map((r, i) => {
                  const res = p.results[i];
                  if (!res) return null;
                  const t = tier(res.precision);
                  return (
                    <tr key={i}>
                      <td>{roundLabel(r)}</td>
                      <td><span className={`selo selo-${t}`}>{TIER_TEXT[t]}</span> {res.detail}</td>
                      <td className="num">{res.raw < 0 ? '−' : ''}{fmtInt(Math.abs(res.raw))}</td>
                      {k === 0 && duel && <td className={`num ${(duel.r[i] ?? 0) > res.raw ? 'rival-melhor' : ''}`}>{fmtInt(Math.abs(duel.r[i] ?? 0))}</td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </details>
        </div>
      ))}

      {rankingAtivo() && onRanking && diarias.length > 0 && (
        <RankingNoResultado data={diarias[0].date} niveis={diarias.map((d) => d.level)} onVerRanking={onRanking} />
      )}

      <section className="compartilhar" aria-labelledby="titulo-desafiar">
        <h2 id="titulo-desafiar">Desafie um amigo</h2>
        <p>Quem receber joga exatamente as rodadas do seu Nível 1 e vê o seu placar rodada a rodada no final.</p>
        <label className="campo">
          <span>Seu nome no desafio</span>
          <input value={nome} maxLength={24} onChange={(e) => { setNome(e.target.value); saveSettings({ nome: e.target.value }); }} placeholder="Como seus amigos te chamam" />
        </label>
        <textarea className="texto-compartilhar" readOnly value={texto} rows={partes.length === 2 ? 12 : 7} onFocus={(e) => e.currentTarget.select()} aria-label="Texto para compartilhar" />
        {!link && <p className="dica">Nesta prévia não há endereço público. Envie o código abaixo; quem receber cola em Duelo, Aceitar um desafio.</p>}
        <div className="codigo-duelo">
          <code>{code}</code>
        </div>
        <div className="cartao-acoes">
          <button type="button" className="botao botao-primario" onClick={() => copy('resultado', texto)}>Copiar resultado e desafio</button>
          <button type="button" className="botao" onClick={() => copy('desafio', code)}>Copiar só o código</button>
          <span className="dica" aria-live="polite">
            {copiado === 'resultado' && 'Resultado copiado.'}
            {copiado === 'desafio' && 'Código copiado.'}
            {copiado === 'falhou' && 'Este navegador bloqueou a cópia. Selecione o texto acima e copie.'}
          </span>
        </div>
      </section>

      <div className="cartao-acoes">
        <button type="button" className="botao" onClick={onHome}>Voltar ao início</button>
      </div>
    </div>
  );
}
