import { useCallback, useEffect, useMemo, useState } from 'react';
import { CITY, COUNTRY, countryName } from '../../data';
import { timerFor, type LevelId } from '../../engine/levels';
import type { FlagRound } from '../../engine/match';
import { REVEAL_STAGE_PRECISION, roundPoints } from '../../engine/scoring';
import type { RoundResult } from '../../engine/storage';
import { fmtInt, fmtPop } from '../../app/format';
import { useCountdown } from '../../app/useCountdown';

interface Props {
  round: FlagRound;
  level: LevelId;
  flags: Record<string, string>;
  onTimer: (fraction: number) => void;
  onResolved: (r: RoundResult) => void;
  onNext: () => void;
  isLast: boolean;
}

const uri = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
const REVEAL_SCALE = [5, 3, 1.8, 1];

function Flag({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return <img className={`bandeira ${className ?? ''}`} src={src} alt={alt} draggable={false} />;
}

function countryFacts(cc: string) {
  const c = COUNTRY.get(cc);
  if (!c) return '';
  const cap = c.cap ? CITY.get(c.cap)?.n : null;
  const status = c.un ? null : 'Não é membro da ONU.';
  return [status, cap ? `Capital: ${cap}.` : null, c.reg ? `Continente: ${c.reg}.` : null, c.pop ? `População estimada: ${fmtPop(c.pop)}.` : null]
    .filter(Boolean).join(' ');
}

export function FlagRoundView({ round, level, flags, onTimer, onResolved, onNext, isLast }: Props) {
  const seconds = timerFor(level, 'bandeiras');
  const src = useMemo(() => Object.fromEntries(Object.entries(flags).map(([k, v]) => [k, uri(v)])), [flags]);
  const [chosen, setChosen] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [stage, setStage] = useState(0);
  const [points, setPoints] = useState(0);
  const done = chosen !== null || timedOut;

  const correctIndex = round.variant === 'intrusa' ? round.wrongIndex : round.options.indexOf(round.answer);
  const count = round.variant === 'intrusa' ? round.pairs.length : round.options.length;

  const choose = useCallback((i: number, timeLeft: number) => {
    if (done) return;
    setChosen(i);
    const ok = i === correctIndex;
    const precision = ok ? (round.variant === 'revelacao' ? REVEAL_STAGE_PRECISION[stage] : 1) : 0;
    const pts = roundPoints(precision, timeLeft / seconds);
    setPoints(pts);
    const marcou = round.variant === 'intrusa' ? `marcou a dupla ${countryName(round.pairs[i].label)}` : `marcou ${countryName(round.options[i])}`;
    const detail = !ok ? marcou : round.variant === 'revelacao' ? `acertou na etapa ${stage + 1} de 4` : 'acertou';
    onResolved({ mod: 'bandeiras', precision, raw: pts, detail });
  }, [done, correctIndex, round, stage, seconds, onResolved]);

  const timer = useCountdown(seconds, !done, () => {
    setTimedOut(true);
    onResolved({ mod: 'bandeiras', precision: 0, raw: 0, detail: 'tempo esgotado' });
  });
  useEffect(() => { onTimer(done ? -1 : timer.fraction); }, [timer.fraction, done, onTimer]);

  // Revelação progressiva: o recorte abre em 4 etapas ao longo do tempo da rodada.
  useEffect(() => {
    if (round.variant !== 'revelacao' || done) return;
    // Abre a cada 20% do tempo; a partir de 60% a bandeira está inteira.
    const s = Math.min(3, Math.floor((1 - timer.fraction) / 0.2));
    if (s !== stage) setStage(s);
  }, [timer.fraction, round.variant, done, stage]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done && e.key === 'Enter') { onNext(); return; }
      const n = Number(e.key);
      if (!done && n >= 1 && n <= count) choose(n - 1, timer.now());
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const stateOf = (i: number) => (!done ? '' : i === correctIndex ? 'opcao-certa' : i === chosen ? 'opcao-errada' : 'opcao-apagada');

  let enunciado: string;
  let corpo: JSX.Element;
  let resposta = '';
  if (round.variant === 'intrusa') {
    enunciado = 'Uma destas duplas de bandeira e nome está errada. Qual?';
    const wrong = round.pairs[round.wrongIndex];
    resposta = `Bandeira verdadeira: ${countryName(wrong.flag)}. Nome trocado: ${countryName(wrong.label)}.`;
    corpo = (
      <div className="duplas">
        {round.pairs.map((p, i) => (
          <button key={i} type="button" className={`dupla ${stateOf(i)}`} disabled={done} onClick={() => choose(i, timer.now())}>
            <span className="tecla" aria-hidden>{i + 1}</span>
            <Flag src={src[p.flag]} alt={`Bandeira identificada como ${countryName(p.label)}`} />
            <span className="dupla-nome">{countryName(p.label)}</span>
          </button>
        ))}
      </div>
    );
  } else {
    const r = round;
    enunciado = r.variant === 'revelacao' ? 'De quem é esta bandeira? Ela se revela aos poucos; acertar cedo vale mais.' : 'De quem é esta bandeira?';
    resposta = `Resposta: ${countryName(r.answer)}.`;
    const scale = r.variant === 'revelacao' && !done ? REVEAL_SCALE[stage] : 1;
    corpo = (
      <>
        <div className={`moldura-bandeira ${done ? 'moldura-resolvida' : ''}`}>
          <div
            className="bandeira-zoom"
            style={{ transform: `scale(${scale})`, transformOrigin: r.variant === 'revelacao' ? `${r.focus[0] * 100}% ${r.focus[1] * 100}%` : 'center' }}
          >
            <Flag src={src[r.answer]} alt="Bandeira a identificar" />
          </div>
          {r.variant === 'revelacao' && !done && <span className="etapa">Etapa {stage + 1} de 4, vale {Math.round(REVEAL_STAGE_PRECISION[stage] * 100)}%</span>}
        </div>
        <div className="opcoes">
          {r.options.map((cc, i) => (
            <button key={cc} type="button" className={`opcao ${stateOf(i)}`} disabled={done} onClick={() => choose(i, timer.now())}>
              <span className="tecla" aria-hidden>{i + 1}</span>
              {countryName(cc)}
            </button>
          ))}
        </div>
      </>
    );
  }

  const factsCC = round.variant === 'intrusa' ? round.pairs[round.wrongIndex].flag : round.answer;

  return (
    <div className="rodada-bandeira">
      <p className="cartao-pergunta">{enunciado}</p>
      {corpo}
      {done && (
      <section className="cartao-rodada cartao-bandeira" aria-live="polite">
          <>
            <div className="placar-rodada">
              <div>
                <span className="placar-numero">{timedOut ? 'Tempo esgotado' : chosen === correctIndex ? 'Acertou' : 'Errou'}</span>
                <span className="placar-legenda">{resposta}</span>
              </div>
              <div className="placar-pontos">+{fmtInt(points)}</div>
            </div>
            <p className="contexto">{countryFacts(factsCC)}</p>
            <p className="fonte">Fonte: Unicode CLDR 49; world-countries 5.1.0 (ODbL); GeoNames. Bandeiras: flag-icons 7.6.0 (MIT).</p>
            <div className="cartao-acoes">
              <button type="button" className="botao botao-primario" onClick={onNext} autoFocus>
                {isLast ? 'Ver resultado' : 'Próxima rodada'}
              </button>
            </div>
          </>
      </section>
      )}
    </div>
  );
}
