import { useCallback, useEffect, useState } from 'react';
import {
  CONFLITO, PISTAS, PISTA_NOME, PISTA_VALOR, ladosPrecision, membroNota,
  type ConflictRound, type Conflito, type DossieRound, type LadosRound,
} from '../../engine/conflitos';
import { timerFor, type LevelId } from '../../engine/levels';
import { roundPoints } from '../../engine/scoring';
import type { RoundResult } from '../../engine/storage';
import { fmtInt } from '../../app/format';
import { useCountdown } from '../../app/useCountdown';

interface Props {
  round: ConflictRound;
  level: LevelId;
  onTimer: (fraction: number) => void;
  onResolved: (r: RoundResult) => void;
  onNext: () => void;
  isLast: boolean;
}

export function ConflictRoundView(props: Props) {
  return props.round.tipo === 'dossie' ? <DossieView {...props} round={props.round} /> : <LadosView {...props} round={props.round} />;
}

/** Acrescenta ponto final sem duplicar o de abreviações como a.C. */
const ponto = (t: string) => (t.endsWith('.') ? t : `${t}.`);

function Fontes({ c }: { c: Conflito }) {
  return (
    <p className="fonte">
      Fontes:{' '}
      {c.fontes.map((f, i) => (
        <span key={f.u}>{i > 0 && '; '}<a href={f.u} target="_blank" rel="noreferrer">{f.t}</a></span>
      ))}
      .
    </p>
  );
}

function Placar({ titulo, legenda, points }: { titulo: string; legenda: string; points: number }) {
  return (
    <div className="placar-rodada">
      <div>
        <span className="placar-numero">{titulo}</span>
        <span className="placar-legenda">{legenda}</span>
      </div>
      <div className={`placar-pontos ${points < 0 ? 'placar-negativo' : ''}`}>{points < 0 ? '−' : '+'}{fmtInt(Math.abs(points))}</div>
    </div>
  );
}

// ---------- Dossiê ----------
function DossieView({ round, level, onTimer, onResolved, onNext, isLast }: Props & { round: DossieRound }) {
  const seconds = timerFor(level, 'conflitos');
  const c = CONFLITO.get(round.answer)!;
  const [abertas, setAbertas] = useState(1);
  const [chosen, setChosen] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [points, setPoints] = useState(0);
  const done = chosen !== null || timedOut;
  const valor = PISTA_VALOR[abertas - 1];

  const choose = useCallback((id: string, timeLeft: number) => {
    if (done) return;
    setChosen(id);
    const ok = id === round.answer;
    const pts = ok ? roundPoints(valor, timeLeft / seconds) : 0;
    setPoints(pts);
    const pistas = `${abertas} ${abertas === 1 ? 'pista' : 'pistas'}`;
    onResolved({ mod: 'conflitos', precision: ok ? valor : 0, raw: pts, detail: ok ? `acertou com ${pistas}` : `marcou ${CONFLITO.get(id)!.n} com ${pistas}` });
  }, [done, round, valor, seconds, abertas, onResolved]);

  const timer = useCountdown(seconds, !done, () => {
    setTimedOut(true);
    onResolved({ mod: 'conflitos', precision: 0, raw: 0, detail: 'tempo esgotado' });
  });
  useEffect(() => { onTimer(done ? -1 : timer.fraction); }, [timer.fraction, done, onTimer]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done && e.key === 'Enter') { onNext(); return; }
      if (!done && (e.key === 'p' || e.key === 'P') && abertas < PISTAS.length) { setAbertas(abertas + 1); return; }
      const n = Number(e.key);
      if (!done && n >= 1 && n <= round.options.length) choose(round.options[n - 1], timer.now());
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const visiveis = done ? PISTAS.length : abertas;
  const stateOf = (id: string) => (!done ? '' : id === round.answer ? 'opcao-certa' : id === chosen ? 'opcao-errada' : 'opcao-apagada');

  return (
    <div className="rodada-bandeira rodada-conflito">
      <div className="enunciado">
        <p className="enunciado-rotulo">Dossiê</p>
        <p className="enunciado-texto">Que conflito é este?</p>
        {!done && <p className="enunciado-apoio">Responda quando quiser. Agora o acerto vale {Math.round(valor * 100)}%.</p>}
      </div>

      <ol className="pistas">
        {PISTAS.slice(0, visiveis).map((p, i) => (
          <li key={p} className={`pista ${i >= abertas ? 'pista-revelada' : ''}`}>
            <span className="pista-nome">{PISTA_NOME[p]}</span>
            <p className="pista-texto">{c.pistas[p]}</p>
          </li>
        ))}
        {!done && abertas < PISTAS.length && (
          <li className="pista pista-fechada">
            <button type="button" className="botao" onClick={() => setAbertas(abertas + 1)}>
              Abrir pista: {PISTA_NOME[PISTAS[abertas]].toLowerCase()} (acerto passa a valer {Math.round(PISTA_VALOR[abertas] * 100)}%)
            </button>
          </li>
        )}
      </ol>

      <div className="opcoes opcoes-lista">
        {round.options.map((id, i) => (
          <button key={id} type="button" className={`opcao ${stateOf(id)}`} disabled={done} onClick={() => choose(id, timer.now())}>
            <span className="tecla" aria-hidden>{i + 1}</span>
            {CONFLITO.get(id)!.n}
          </button>
        ))}
      </div>
      {!done && <p className="dica">Teclas 1 a 4 respondem; P abre a próxima pista.</p>}

      {done && (
        <section className="cartao-rodada cartao-bandeira" aria-live="polite">
          <Placar
            titulo={timedOut ? 'Tempo esgotado' : chosen === round.answer ? 'Acertou' : 'Errou'}
            legenda={`${ponto(`${c.n}, ${c.periodo}`)} ${abertas === 1 ? 'Você usou 1 pista.' : `Você usou ${abertas} pistas.`}`}
            points={points}
          />
          {c.lados && <p className="contexto">{ladosTexto(c)}</p>}
          {c.dado && <p className="contexto">{c.dado}</p>}
          <Fontes c={c} />
          <div className="cartao-acoes">
            <button type="button" className="botao botao-primario" onClick={onNext} autoFocus>{isLast ? 'Ver resultado' : 'Próxima rodada'}</button>
          </div>
        </section>
      )}
    </div>
  );
}

const ladosTexto = (c: Conflito) =>
  (['a', 'b'] as const).map((k) => `${c.lados![k].nome}: ${c.lados![k].membros.map((m) => m.n).join(', ')}.`).join(' ') +
  (c.lados!.contexto ? ` (${c.lados!.contexto}.)` : '');

// ---------- Lados ----------
function LadosView({ round, level, onTimer, onResolved, onNext, isLast }: Props & { round: LadosRound }) {
  const seconds = timerFor(level, 'conflitos');
  const c = CONFLITO.get(round.conflito)!;
  const lados = c.lados!;
  const [answers, setAnswers] = useState<('a' | 'b' | null)[]>(() => round.membros.map(() => null));
  const [done, setDone] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [points, setPoints] = useState(0);
  const [certos, setCertos] = useState(0);
  const completo = answers.every((a) => a !== null);

  const finish = useCallback((timeLeft: number, porTempo: boolean) => {
    if (done) return;
    setDone(true);
    setTimedOut(porTempo);
    const r = ladosPrecision(level, round, answers);
    const pts = roundPoints(r.p, porTempo ? 0 : timeLeft / seconds);
    setPoints(pts);
    setCertos(r.certos);
    onResolved({ mod: 'conflitos', precision: r.p, raw: pts, detail: `${r.certos} de ${round.membros.length} no lado certo${porTempo ? ', tempo esgotado' : ''}` });
  }, [done, level, round, answers, seconds, onResolved]);

  const timer = useCountdown(seconds, !done, () => finish(0, true));
  useEffect(() => { onTimer(done ? -1 : timer.fraction); }, [timer.fraction, done, onTimer]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done && e.key === 'Enter') onNext();
      else if (!done && completo && e.key === 'Enter') finish(timer.now(), false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const set = (i: number, lado: 'a' | 'b') => setAnswers((prev) => prev.map((x, k) => (k === i ? lado : x)));

  return (
    <div className="rodada-bandeira rodada-conflito">
      <div className="enunciado">
        <p className="enunciado-rotulo">Lados</p>
        <p className="enunciado-texto">De que lado estava cada um?</p>
        <p className="enunciado-apoio">{ponto(lados.contexto ? `${lados.contexto}, parte das ${c.n}` : `${c.n}, ${c.periodo}`)}</p>
      </div>

      <ul className="lados" aria-label="Participantes">
        {round.membros.map((m, i) => {
          const ok = done && answers[i] === m.lado;
          const nota = done ? membroNota(c.id, m.n)?.nota : undefined;
          return (
            <li key={m.n} className={`lado-linha ${done ? (ok ? 'lado-certo' : 'lado-errado') : ''}`}>
              <div className="lado-nome">
                <span>{m.n}</span>
                {done && <span className="lado-marca">{ok ? '✓ certo' : `✕ era ${lados[m.lado].nome}`}</span>}
                {nota && <span className="lado-nota">{nota}</span>}
              </div>
              <div className="lado-escolha" role="group" aria-label={`Lado de ${m.n}`}>
                {(['a', 'b'] as const).map((lado) => (
                  <button
                    key={lado}
                    type="button"
                    className={`lado-botao ${answers[i] === lado ? 'lado-ativo' : ''}`}
                    aria-pressed={answers[i] === lado}
                    disabled={done}
                    onClick={() => set(i, lado)}
                  >
                    {lados[lado].nome}
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ul>

      {!done && (
        <div className="cartao-acoes">
          <button type="button" className="botao botao-primario" disabled={!completo} onClick={() => finish(timer.now(), false)}>Confirmar</button>
          {!completo && <span className="dica">Escolha um lado para todos.</span>}
        </div>
      )}

      {done && (
        <section className="cartao-rodada cartao-bandeira" aria-live="polite">
          <Placar
            titulo={`${certos} de ${round.membros.length}`}
            legenda={timedOut ? 'no lado certo; o tempo acabou.' : 'no lado certo.'}
            points={points}
          />
          {c.dado && <p className="contexto">{c.dado}</p>}
          <Fontes c={c} />
          <div className="cartao-acoes">
            <button type="button" className="botao botao-primario" onClick={onNext} autoFocus>{isLast ? 'Ver resultado' : 'Próxima rodada'}</button>
          </div>
        </section>
      )}
    </div>
  );
}
