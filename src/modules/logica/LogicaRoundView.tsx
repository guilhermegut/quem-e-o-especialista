import { useCallback, useEffect, useState } from 'react';
import { timerFor, type LevelId } from '../../engine/levels';
import { TIPO_NOME, logicaPrecision, type Figura, type FormaNome, type LogicaRound } from '../../engine/logica';
import { pontosRespondida, regrasNaoSei, roundPoints } from '../../engine/scoring';
import { NaoSei, PontosRodada } from '../comum/NaoSei';
import type { RoundResult } from '../../engine/storage';
import { useCountdown } from '../../app/useCountdown';

interface Props {
  round: LogicaRound;
  level: LevelId;
  onTimer: (fraction: number) => void;
  onResolved: (r: RoundResult) => void;
  onNext: () => void;
  isLast: boolean;
}

const poligono = (n: number, r = 22, giro = -90) =>
  Array.from({ length: n }, (_, i) => {
    const a = ((giro + (360 / n) * i) * Math.PI) / 180;
    return `${(32 + r * Math.cos(a)).toFixed(2)},${(32 + r * Math.sin(a)).toFixed(2)}`;
  }).join(' ');
const estrela = () =>
  Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 ? 10 : 23;
    const a = ((-90 + 36 * i) * Math.PI) / 180;
    return `${(32 + r * Math.cos(a)).toFixed(2)},${(32 + r * Math.sin(a)).toFixed(2)}`;
  }).join(' ');
const NOMES: Record<FormaNome, string> = { circulo: 'círculo', quadrado: 'quadrado', triangulo: 'triângulo', losango: 'losango', pentagono: 'pentágono', hexagono: 'hexágono', estrela: 'estrela', seta: 'seta', poligono: 'polígono' };

function descrever(f: Figura): string {
  if (f.tipo === 'texto') return f.texto;
  if (f.tipo === 'vazio') return 'espaço vazio';
  if (f.tipo === 'relogio') return `relógio marcando ${f.h}h${f.m ? String(f.m).padStart(2, '0') : ''}`;
  if (f.tipo === 'grade') return 'peça formada por cinco quadradinhos';
  const nome = f.forma === 'poligono' ? `polígono de ${f.lados} lados` : NOMES[f.forma];
  return `${nome}${f.forma === 'seta' ? ` apontando a ${f.giro ?? 0} graus` : ''}${f.cheia === false ? ', vazado' : f.cheia ? ', pintado' : ''}`;
}

export function FiguraSvg({ f, tam = 64 }: { f: Figura; tam?: number }) {
  if (f.tipo === 'texto') return <span className="logica-texto">{f.texto}</span>;
  const cor = 'var(--c-logica)';
  let corpo: JSX.Element;
  if (f.tipo === 'vazio') corpo = <rect x="6" y="6" width="52" height="52" rx="8" fill="none" stroke="var(--linha)" strokeWidth="2" strokeDasharray="5 4" />;
  else if (f.tipo === 'relogio') {
    const am = (f.m / 60) * 360, ah = ((f.h % 12) / 12) * 360 + f.m / 2;
    const ponta = (ang: number, r: number) => [32 + r * Math.sin((ang * Math.PI) / 180), 32 - r * Math.cos((ang * Math.PI) / 180)];
    const [mx, my] = ponta(am, 21), [hx, hy] = ponta(ah, 13);
    corpo = (
      <g>
        <circle cx="32" cy="32" r="27" fill="var(--superficie)" stroke={cor} strokeWidth="3" />
        {Array.from({ length: 12 }, (_, i) => { const [x1, y1] = ponta(i * 30, 23), [x2, y2] = ponta(i * 30, i % 3 ? 25 : 21); return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth={i % 3 ? 1.2 : 2} />; })}
        <line x1="32" y1="32" x2={hx} y2={hy} stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="32" y1="32" x2={mx} y2={my} stroke={cor} strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="32" cy="32" r="2.5" fill="currentColor" />
      </g>
    );
  } else if (f.tipo === 'grade') {
    const w = Math.max(...f.celulas.map((c) => c[0])) + 1, h = Math.max(...f.celulas.map((c) => c[1])) + 1;
    const lado = Math.min(52 / w, 52 / h), ox = 32 - (w * lado) / 2, oy = 32 - (h * lado) / 2;
    corpo = <g>{f.celulas.map(([x, y]) => <rect key={`${x}-${y}`} x={ox + x * lado + 1} y={oy + y * lado + 1} width={lado - 2} height={lado - 2} rx="2" fill={cor} />)}</g>;
  } else {
    const cheia = f.cheia !== false;
    const p = { fill: cheia ? cor : 'none', stroke: cor, strokeWidth: 3, strokeLinejoin: 'round' as const };
    const g = f.giro ?? 0;
    const forma =
      f.forma === 'circulo' ? <circle cx="32" cy="32" r="21" {...p} /> :
      f.forma === 'quadrado' ? <rect x="13" y="13" width="38" height="38" rx="2" {...p} /> :
      f.forma === 'triangulo' ? <polygon points={poligono(3, 24)} {...p} /> :
      f.forma === 'losango' ? <polygon points="32,8 54,32 32,56 10,32" {...p} /> :
      f.forma === 'pentagono' ? <polygon points={poligono(5)} {...p} /> :
      f.forma === 'hexagono' ? <polygon points={poligono(6)} {...p} /> :
      f.forma === 'poligono' ? <polygon points={poligono(f.lados ?? 5, 23)} {...p} /> :
      f.forma === 'estrela' ? <polygon points={estrela()} {...p} /> :
      <path d="M32 8 L50 30 L38 30 L38 56 L26 56 L26 30 L14 30 Z" {...p} />;
    corpo = <g transform={`rotate(${g} 32 32)`}>{forma}</g>;
  }
  return <svg className="logica-figura" width={tam} height={tam} viewBox="0 0 64 64" role="img" aria-label={descrever(f)}>{corpo}</svg>;
}

export function LogicaRoundView({ round, level, onTimer, onResolved, onNext, isLast }: Props) {
  const seconds = timerFor(level, 'logica');
  const [escolha, setEscolha] = useState<number | null>(null);
  const [fim, setFim] = useState<{ precision: number; pts: number; tempo: boolean; naoSabia: boolean } | null>(null);
  const done = fim !== null;

  const resolver = useCallback((i: number | null, timeLeft: number, tempo: boolean) => {
    if (fim) return;
    const precision = logicaPrecision(round, i);
    const pts = i === null ? roundPoints(0, 0) : pontosRespondida(precision, timeLeft / seconds);
    setFim({ precision, pts, tempo, naoSabia: i === null && !tempo });
    onResolved({ mod: 'logica', precision, raw: pts, detail: i === null ? (tempo ? 'tempo esgotado' : 'não sabia') : precision === 1 ? 'acertou' : 'errou' });
  }, [fim, round, seconds, onResolved]);

  const timer = useCountdown(seconds, !done, () => resolver(null, 0, true));
  useEffect(() => { onTimer(done ? -1 : timer.fraction); }, [timer.fraction, done, onTimer]);
  const escolher = (i: number) => { if (done) return; setEscolha(i); resolver(i, timer.now(), false); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done && e.key === 'Enter') { onNext(); return; }
      if (done) return;
      if (e.key === '0' && regrasNaoSei()) { resolver(null, 0, false); return; }
      const n = Number(e.key);
      if (n >= 1 && n <= round.opcoes.length) escolher(n - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const estado = (i: number) => (!done ? '' : i === round.certo ? 'opcao-certa' : i === escolha ? 'opcao-errada' : 'opcao-apagada');
  const veredito = !fim ? '' : fim.naoSabia ? 'Não sabia' : fim.tempo ? 'Tempo esgotado' : fim.precision === 1 ? 'Acertou' : 'Errou';
  const soTexto = round.opcoes.every((o) => o.tipo === 'texto');

  return (
    <div className="rodada-quiz rodada-logica">
      <div className="quiz-topo">
        <span className="quiz-chip"><span aria-hidden>◇</span> Lógica</span>
        <span className="quiz-formato">{TIPO_NOME[round.tipoLogica]}</span>
      </div>
      <h2 className="quiz-pergunta">{round.pergunta}</h2>

      {round.linhas && (
        <div className="logica-linhas">
          {round.linhas.map((l, i) => <div key={i} className="logica-linha">{l.map((f, k) => <FiguraSvg key={k} f={f} tam={44} />)}</div>)}
        </div>
      )}
      {round.enunciado.length > 0 && <div className="logica-enunciado">{round.enunciado.map((f, i) => <FiguraSvg key={i} f={f} />)}</div>}
      {round.quadro && <div className="logica-quadro">{round.quadro.map((f, i) => <FiguraSvg key={i} f={f} tam={56} />)}</div>}

      <div className={`opcoes quiz-opcoes logica-opcoes${soTexto ? '' : ' logica-opcoes-figura'}`}>
        {round.opcoes.map((o, i) => (
          <button key={i} type="button" className={`opcao ${estado(i)}`} disabled={done} onClick={() => escolher(i)} aria-label={`Opção ${i + 1}: ${descrever(o)}`}>
            <span className="tecla" aria-hidden>{i + 1}</span>
            <FiguraSvg f={o} tam={soTexto ? 28 : 56} />
          </button>
        ))}
      </div>

      {!done && regrasNaoSei() && <NaoSei onClick={() => resolver(null, 0, false)} />}

      {fim && (
        <section className="cartao-rodada cartao-quiz" aria-live="polite">
          <div className="placar-rodada">
            <div><span className="placar-numero">{veredito}</span></div>
            <PontosRodada pontos={fim.pts} />
          </div>
          <p className="contexto">{round.explicacao}</p>
          <div className="cartao-acoes">
            <button type="button" className="botao botao-primario" onClick={onNext} autoFocus>{isLast ? 'Ver resultado' : 'Próxima rodada'}</button>
          </div>
        </section>
      )}
    </div>
  );
}
