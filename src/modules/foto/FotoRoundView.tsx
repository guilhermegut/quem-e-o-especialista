import { useCallback, useEffect, useState } from 'react';
import { timerFor, type LevelId } from '../../engine/levels';
import { FOTO, fotoPrecision, fotoSrc, type FotoRound } from '../../engine/fotos';
import { roundPoints } from '../../engine/scoring';
import type { RoundResult } from '../../engine/storage';
import { fmtInt } from '../../app/format';
import { useCountdown } from '../../app/useCountdown';

interface Props {
  round: FotoRound;
  level: LevelId;
  onTimer: (fraction: number) => void;
  onResolved: (r: RoundResult) => void;
  onNext: () => void;
  isLast: boolean;
}

export function FotoRoundView({ round, level, onTimer, onResolved, onNext, isLast }: Props) {
  const foto = FOTO.get(round.id)!;
  const seconds = timerFor(level, 'foto');
  const [carregada, setCarregada] = useState(false);
  const [falhou, setFalhou] = useState(false);
  const [escolha, setEscolha] = useState<number | null>(null);
  const [fim, setFim] = useState<{ precision: number; pts: number; tempo: boolean } | null>(null);
  const done = fim !== null;

  const resolver = useCallback((i: number | null, timeLeft: number, tempo: boolean, detalhe?: string) => {
    if (fim) return;
    const precision = fotoPrecision(round, i);
    const pts = roundPoints(precision, tempo ? 0 : timeLeft / seconds);
    setFim({ precision, pts, tempo });
    const detail = detalhe ?? (i === null ? 'tempo esgotado' : precision === 1 ? 'acertou' : `marcou ${round.opcoes[i]}`);
    onResolved({ mod: 'foto', precision, raw: pts, detail });
  }, [fim, round, seconds, onResolved]);

  // O cronômetro só corre com a foto na tela.
  const timer = useCountdown(seconds, carregada && !done, () => resolver(null, 0, true));
  useEffect(() => { onTimer(done ? -1 : carregada ? timer.fraction : 1); }, [timer.fraction, done, carregada, onTimer]);

  const escolher = (i: number) => { if (done || !carregada) return; setEscolha(i); resolver(i, timer.now(), false); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done && e.key === 'Enter') { onNext(); return; }
      const n = Number(e.key);
      if (!done && n >= 1 && n <= 5) escolher(n - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const estado = (i: number) => (!done ? '' : i === round.certo ? 'opcao-certa' : i === escolha ? 'opcao-errada' : 'opcao-apagada');
  const veredito = !fim ? '' : fim.tempo && fim.precision === 0 ? 'Tempo esgotado' : fim.precision === 1 ? 'Acertou' : fim.precision > 0 ? 'Perto' : 'Errou';

  return (
    <div className="rodada-foto">
      <div className="quiz-topo">
        <span className="quiz-chip"><span aria-hidden>◉</span> Foto</span>
        <span className="quiz-formato">{level === 'prime' ? 'Anos próximos' : 'Décadas'}</span>
      </div>
      <h2 className="quiz-pergunta">Em que ano esta foto foi tirada?</h2>
      <figure className="foto-quadro" style={{ aspectRatio: `${foto.w} / ${foto.h}` }}>
        <img
          src={fotoSrc(round.id)}
          alt="Fotografia da rodada. A descrição aparece depois da resposta."
          onLoad={() => setCarregada(true)}
          onError={() => setFalhou(true)}
          draggable={false}
          className={carregada ? 'foto-pronta' : ''}
        />
        {!carregada && !falhou && <figcaption className="foto-carregando">Carregando a foto…</figcaption>}
        {falhou && !done && (
          <figcaption className="foto-carregando">
            A foto não carregou.{' '}
            <button type="button" className="botao" onClick={() => resolver(null, 0, true, 'foto não carregou')}>Seguir</button>
          </figcaption>
        )}
      </figure>

      <div className="opcoes foto-opcoes" role="group" aria-label="Anos">
        {round.opcoes.map((ano, i) => (
          <button key={ano} type="button" className={`opcao ${estado(i)}`} disabled={done || !carregada} onClick={() => escolher(i)}>
            <span className="tecla" aria-hidden>{i + 1}</span>
            {ano}
          </button>
        ))}
      </div>

      {fim && (
        <section className="cartao-rodada cartao-quiz" aria-live="polite">
          <div className="placar-rodada">
            <div>
              <span className="placar-numero">{veredito}</span>
              <span className="placar-legenda">A foto é de {foto.ano}.</span>
            </div>
            <div className="placar-pontos">+{fmtInt(fim.pts)}</div>
          </div>
          <p className="contexto">{foto.titulo}</p>
          <p className="fonte">
            Foto: {foto.autor} · {foto.acervo} ·{' '}
            {foto.licencaUrl ? <a href={foto.licencaUrl} target="_blank" rel="noreferrer">{foto.licenca}</a> : foto.licenca} ·{' '}
            <a href={foto.url} target="_blank" rel="noreferrer">ver na fonte</a>. Imagem reduzida para o jogo.
          </p>
          <div className="cartao-acoes">
            <button type="button" className="botao botao-primario" onClick={onNext} autoFocus>{isLast ? 'Ver resultado' : 'Próxima rodada'}</button>
          </div>
        </section>
      )}
    </div>
  );
}
