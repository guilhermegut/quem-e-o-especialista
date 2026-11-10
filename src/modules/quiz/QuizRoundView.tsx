import { useCallback, useEffect, useMemo, useState } from 'react';
import { countryName } from '../../data';
import { timerFor, type LevelId } from '../../engine/levels';
import { TEMA_NOME, quizPrecision, type QuizRound } from '../../engine/quiz';
import { pontosRespondida, regrasNaoSei, roundPoints } from '../../engine/scoring';
import { NaoSei, PontosRodada } from '../comum/NaoSei';
import type { RoundResult } from '../../engine/storage';
import { useCountdown } from '../../app/useCountdown';

interface Props {
  round: QuizRound;
  level: LevelId;
  flags: Record<string, string> | null;
  onTimer: (fraction: number) => void;
  onResolved: (r: RoundResult) => void;
  onNext: () => void;
  isLast: boolean;
}

const uri = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
const FORMATO_NOME = { escolha: 'Múltipla escolha', intruso: 'Ache o intruso', pares: 'Ligue os pares' } as const;
const TEMA_ICONE = { moeda: '¤', lider: '★', religiao: '✦', esporte: '◎', filosofia: '❝', arte: '◐', pop: '♪' } as const;

function Destaque({ round, flags }: { round: QuizRound; flags: Record<string, string> | null }) {
  const d = round.destaque;
  if (!d) return null;
  if (d.tipo === 'pais') {
    const svg = flags?.[d.cc];
    return (
      <div className="quiz-destaque quiz-pais">
        {svg ? <img className="quiz-bandeira" src={uri(svg)} alt="" draggable={false} /> : <span className="quiz-bandeira quiz-bandeira-vazia" />}
        <span className="quiz-pais-nome">{countryName(d.cc)}</span>
      </div>
    );
  }
  if (d.tipo === 'simbolo') return <div className="quiz-destaque quiz-moeda" aria-label={`Símbolo ${d.texto}`}><span>{d.texto}</span></div>;
  if (d.tipo === 'citacao') return <blockquote className="quiz-destaque quiz-citacao">“{d.texto}”</blockquote>;
  return (
    <div className="quiz-destaque quiz-nota">
      <span className="quiz-nota-texto">{d.texto}</span>
      {d.sub && <span className="quiz-nota-sub">{d.sub}</span>}
    </div>
  );
}

export function QuizRoundView({ round, level, flags, onTimer, onResolved, onNext, isLast }: Props) {
  const seconds = timerFor(level, round.mod);
  const pares = round.formato === 'pares';
  const [escolha, setEscolha] = useState<number | null>(null);
  const [ligacoes, setLigacoes] = useState<(number | null)[]>(() => (round.esquerda ?? []).map(() => null));
  const [fim, setFim] = useState<{ precision: number; pts: number; tempo: boolean } | null>(null);
  const done = fim !== null;

  const [naoSabia, setNaoSabia] = useState(false);
  const resolver = useCallback((resposta: number[] | null, timeLeft: number, tempo: boolean) => {
    if (fim) return;
    const precision = quizPrecision(round, resposta);
    // Penalidade só para quem marcou uma resposta e errou; "Não sei" e tempo esgotado valem zero.
    const pts = tempo || !resposta ? roundPoints(precision, 0) : pontosRespondida(precision, timeLeft / seconds);
    setFim({ precision, pts, tempo });
    const detail = !resposta ? (tempo ? 'tempo esgotado' : 'não sabia') : pares ? `${Math.round(precision * 3)} de 3 ligações certas` : precision === 1 ? 'acertou' : `marcou ${round.opcoes[resposta[0]]}`;
    onResolved({ mod: round.mod, precision, raw: pts, detail });
  }, [fim, round, seconds, pares, onResolved]);

  const timer = useCountdown(seconds, !done, () => {
    if (pares && ligacoes.some((l) => l !== null)) resolver(ligacoes.map((l) => l ?? -1), 0, true);
    else resolver(null, 0, true);
  });
  useEffect(() => { onTimer(done ? -1 : timer.fraction); }, [timer.fraction, done, onTimer]);

  const escolher = (i: number) => { if (done) return; setEscolha(i); resolver([i], timer.now(), false); };

  const ligar = (linha: number, opcao: number) => {
    if (done) return;
    setLigacoes((prev) => {
      const nova = [...prev];
      const outra = nova.indexOf(opcao);
      if (outra >= 0 && outra !== linha) nova[outra] = nova[linha];
      nova[linha] = opcao;
      return nova;
    });
  };
  const completo = ligacoes.every((l) => l !== null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done && e.key === 'Enter') { onNext(); return; }
      if (done) return;
      if (e.key === '0' && regrasNaoSei()) { setNaoSabia(true); resolver(null, 0, false); return; }
      if (pares) return;
      const n = Number(e.key);
      if (n >= 1 && n <= round.opcoes.length) escolher(n - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const certoLinha = useMemo(() => round.certo, [round]);
  const estado = (i: number) => (!done ? '' : i === round.certo[0] ? 'opcao-certa' : i === escolha ? 'opcao-errada' : 'opcao-apagada');
  const veredito = !fim ? '' : naoSabia ? 'Não sabia' : fim.tempo && fim.precision === 0 ? 'Tempo esgotado' : fim.precision === 1 ? 'Acertou' : fim.precision > 0 ? 'Quase lá' : 'Errou';

  return (
    <div className={`rodada-quiz formato-${round.formato}`}>
      <div className="quiz-topo">
        <span className="quiz-chip"><span aria-hidden>{TEMA_ICONE[round.tema]}</span> {TEMA_NOME[round.tema]}</span>
        <span className="quiz-formato">{FORMATO_NOME[round.formato]}</span>
      </div>
      <h2 className="quiz-pergunta">{round.pergunta}</h2>
      <Destaque round={round} flags={flags} />

      {!pares && (
        <div className="opcoes quiz-opcoes">
          {round.opcoes.map((o, i) => (
            <button key={o} type="button" className={`opcao ${estado(i)}`} disabled={done} onClick={() => escolher(i)}>
              <span className="tecla" aria-hidden>{i + 1}</span>
              {o}
            </button>
          ))}
        </div>
      )}

      {pares && (
        <ul className="quiz-pares">
          {round.esquerda!.map((e, linha) => {
            const marcada = ligacoes[linha];
            const certa = done && marcada === certoLinha[linha];
            return (
              <li key={e} className={`quiz-par ${done ? (certa ? 'lado-certo' : 'lado-errado') : ''}`}>
                <span className="quiz-par-nome">
                  {e}
                  {done && <span className="lado-marca">{certa ? '✓ certo' : `✕ era ${round.opcoes[certoLinha[linha]]}`}</span>}
                </span>
                <div className="quiz-par-opcoes" role="group" aria-label={`Par de ${e}`}>
                  {round.opcoes.map((o, k) => (
                    <button key={o} type="button" className={`lado-botao ${marcada === k ? 'lado-ativo' : ''}`} aria-pressed={marcada === k} disabled={done} onClick={() => ligar(linha, k)}>
                      {o}
                    </button>
                  ))}
                </div>
              </li>
            );
          })}
          {!done && (
            <li className="quiz-confirmar">
              <button type="button" className="botao botao-primario" disabled={!completo} onClick={() => resolver(ligacoes.map((l) => l ?? -1), timer.now(), false)}>
                Confirmar
              </button>
            </li>
          )}
        </ul>
      )}

      {!done && regrasNaoSei() && <NaoSei onClick={() => { setNaoSabia(true); resolver(null, 0, false); }} />}

      {fim && (
        <section className="cartao-rodada cartao-quiz" aria-live="polite">
          <div className="placar-rodada">
            <div>
              <span className="placar-numero">{veredito}</span>
              {!pares && round.certo[0] !== escolha && <span className="placar-legenda">Resposta: {round.opcoes[round.certo[0]]}.</span>}
            </div>
            <PontosRodada pontos={fim.pts} />
          </div>
          <p className="contexto">{round.explicacao}</p>
          <p className="fonte">
            Fontes:{' '}
            {round.fontes.map((f, i) => (
              <span key={f.u + i}>{i > 0 && '; '}<a href={f.u} target="_blank" rel="noreferrer">{f.t}</a></span>
            ))}.
          </p>
          <div className="cartao-acoes">
            <button type="button" className="botao botao-primario" onClick={onNext} autoFocus>{isLast ? 'Ver resultado' : 'Próxima rodada'}</button>
          </div>
        </section>
      )}
    </div>
  );
}
