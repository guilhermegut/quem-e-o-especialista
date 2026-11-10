import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { timerFor, type LevelId } from '../../engine/levels';
import { ANO_INICIAL, ANO_MAX, ANO_MIN, FOTO, fotoPrecision, fotoSrc, type FotoRound } from '../../engine/fotos';
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

const DECADAS = Array.from({ length: Math.floor((ANO_MAX - ANO_MIN) / 20) + 1 }, (_, i) => ANO_MIN + i * 20);
const pos = (ano: number) => `${((ano - ANO_MIN) / (ANO_MAX - ANO_MIN)) * 100}%`;

export function FotoRoundView({ round, level, onTimer, onResolved, onNext, isLast }: Props) {
  const foto = FOTO.get(round.id)!;
  const seconds = timerFor(level, 'foto');
  const [carregada, setCarregada] = useState(false);
  const [falhou, setFalhou] = useState(false);
  const [ano, setAno] = useState(ANO_INICIAL);
  const mexeu = useRef(false);
  const anoRef = useRef(ano);
  anoRef.current = ano;
  const [fim, setFim] = useState<{ precision: number; pts: number; escolha: number | null } | null>(null);
  const done = fim !== null;
  const barra = useRef<HTMLInputElement>(null);

  const resolver = useCallback((escolha: number | null, timeLeft: number, detalhe?: string) => {
    if (fim) return;
    const precision = fotoPrecision(level, foto.ano, escolha);
    const pts = roundPoints(precision, timeLeft / seconds);
    setFim({ precision, pts, escolha });
    const d = escolha === null ? null : Math.abs(escolha - foto.ano);
    onResolved({ mod: 'foto', precision, raw: pts, detail: detalhe ?? (d === null ? 'tempo esgotado' : d === 0 ? 'cravou o ano' : `errou por ${d} ano${d > 1 ? 's' : ''}`) });
  }, [fim, level, foto.ano, seconds, onResolved]);

  // O cronômetro só corre com a foto na tela. Se o tempo acabar com o cursor movido, vale a posição dele, sem bônus de tempo.
  const timer = useCountdown(seconds, carregada && !done, () => resolver(mexeu.current ? anoRef.current : null, 0));
  useEffect(() => { onTimer(done ? -1 : carregada ? timer.fraction : 1); }, [timer.fraction, done, carregada, onTimer]);
  useEffect(() => { if (carregada) barra.current?.focus({ preventScroll: true }); }, [carregada]);

  const mudar = (v: number) => { if (done) return; mexeu.current = true; setAno(Math.min(ANO_MAX, Math.max(ANO_MIN, v))); };
  const confirmar = () => { if (!done && carregada) resolver(ano, timer.now()); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      if (done) onNext(); else confirmar();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const d = fim && fim.escolha !== null ? Math.abs(fim.escolha - foto.ano) : null;
  const veredito = !fim ? '' : d === null ? 'Tempo esgotado' : d === 0 ? 'Cravou!' : d <= 3 ? 'Perto' : d <= 10 ? 'Na década certa?' : 'Longe';

  return (
    <div className="rodada-foto">
      <div className="quiz-topo">
        <span className="quiz-chip"><span aria-hidden>◉</span> Foto</span>
        <span className="quiz-formato">Linha do tempo</span>
      </div>
      <h2 className="quiz-pergunta">Em que ano esta foto foi tirada?</h2>
      <figure className="foto-quadro" style={{ '--ar': foto.w / foto.h } as CSSProperties}>
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
            <button type="button" className="botao" onClick={() => resolver(null, 0, 'foto não carregou')}>Seguir</button>
          </figcaption>
        )}
      </figure>

      <div className={`linha-tempo${done ? ' linha-tempo-fim' : ''}`}>
        <output className="linha-ano" aria-live="off">{done && fim!.escolha === null ? '—' : done ? fim!.escolha : ano}</output>
        <div className="linha-trilho">
          <input
            ref={barra}
            type="range"
            min={ANO_MIN}
            max={ANO_MAX}
            step={1}
            value={done && fim!.escolha !== null ? fim!.escolha : ano}
            disabled={done || !carregada}
            onChange={(e) => mudar(Number(e.target.value))}
            aria-label="Ano da foto"
            aria-valuetext={String(ano)}
          />
          {done && <span className="linha-marca linha-certa" style={{ left: `calc(15px + (100% - 30px) * ${(foto.ano - ANO_MIN) / (ANO_MAX - ANO_MIN)})` }} aria-hidden><span>{foto.ano}</span></span>}
          <div className="linha-decadas" aria-hidden>
            {DECADAS.map((a) => <span key={a} style={{ left: pos(a) }}>{a}</span>)}
          </div>
        </div>
        {!done && (
          <div className="linha-acoes">
            <button type="button" className="botao" onClick={() => mudar(ano - 10)} disabled={!carregada} aria-label="Voltar 10 anos">−10</button>
            <button type="button" className="botao" onClick={() => mudar(ano - 1)} disabled={!carregada} aria-label="Voltar 1 ano">−1</button>
            <button type="button" className="botao botao-primario" onClick={confirmar} disabled={!carregada}>Confirmar {ano}</button>
            <button type="button" className="botao" onClick={() => mudar(ano + 1)} disabled={!carregada} aria-label="Avançar 1 ano">+1</button>
            <button type="button" className="botao" onClick={() => mudar(ano + 10)} disabled={!carregada} aria-label="Avançar 10 anos">+10</button>
          </div>
        )}
        {!done && <p className="linha-dica">Arraste a barra ou use as setas do teclado; Enter confirma. Cravar o ano vale o máximo.</p>}
      </div>

      {fim && (
        <section className="cartao-rodada cartao-quiz" aria-live="polite">
          <div className="placar-rodada">
            <div>
              <span className="placar-numero">{veredito}</span>
              <span className="placar-legenda">
                A foto é de {foto.ano}.{d !== null && d > 0 ? ` Você marcou ${fim.escolha}, ${d} ano${d > 1 ? 's' : ''} de diferença.` : ''}
              </span>
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
