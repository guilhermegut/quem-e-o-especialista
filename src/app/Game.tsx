import { useCallback, useEffect, useRef, useState } from 'react';
import { loadFlags } from '../data';
import { LEVELS, MODULES, MODULE, timerFor, type LevelId, type ModuleId } from '../engine/levels';
import type { Round } from '../engine/match';
import { tier } from '../engine/scoring';
import type { RoundResult } from '../engine/storage';
import { FlagRoundView } from '../modules/bandeiras/FlagRoundView';
import { loadGeo, type GeoData } from '../modules/mapa/geodata';
import { MapRoundView } from '../modules/mapa/MapRoundView';
import { ConflictRoundView } from '../modules/conflitos/ConflictRoundView';
import { QuizRoundView } from '../modules/quiz/QuizRoundView';
import { AnimVinheta, preloadAnim } from './Anim';
import { fmtSigned } from './format';
import { calar, falar, type Fala } from './voz';

interface Props {
  rounds: Round[];
  level: LevelId;
  titulo: string;
  onFinish: (results: RoundResult[]) => void;
  onQuit: () => void;
  /** Retomada depois de recarregar a página. */
  inicio?: { i: number; results: RoundResult[] };
  onProgresso?: (p: { i: number; results: RoundResult[]; emRodada: boolean }) => void;
}

const COR: Record<ModuleId, string> = { mapa: '#0071e3', bandeiras: '#e0245e', mundo: '#157a33', cultura: '#8e3fd0', conflitos: '#b84a00' };
const FALA_MOD: Record<ModuleId, Fala> = { mapa: 'mod-mapa', bandeiras: 'mod-bandeiras', mundo: 'mod-mundo', cultura: 'mod-cultura', conflitos: 'mod-guerras' };

export function Game({ rounds, level, titulo, onFinish, onQuit, inicio, onProgresso }: Props) {
  const [geo, setGeo] = useState<GeoData | null>(null);
  const [flags, setFlags] = useState<Record<string, string> | null>(null);
  const [i, setI] = useState(inicio?.i ?? 0);
  const [results, setResults] = useState<RoundResult[]>(inicio?.results ?? []);
  const [vinheta, setVinheta] = useState(true);
  const [sair, setSair] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const avancou = useRef(-1);
  const retomada = Boolean(inicio && inicio.i > 0);

  // Grava o progresso a cada mudança, para retomar se a página recarregar.
  useEffect(() => { onProgresso?.({ i, results, emRodada: !vinheta && results.length <= i }); }, [i, results, vinheta, onProgresso]);
  // "Sair" pede confirmação e se desarma sozinho.
  useEffect(() => { if (!sair) return; const t = window.setTimeout(() => setSair(false), 5000); return () => window.clearTimeout(t); }, [sair]);

  useEffect(() => { preloadAnim(); loadGeo().then(setGeo); loadFlags().then(setFlags); return () => calar(); }, []);

  const round = rounds[i];
  const mod = MODULE[round.mod];
  const ready = round.mod === 'mapa' ? geo : round.mod === 'bandeiras' ? flags : true;
  const total = results.reduce((a, r) => a + r.raw, 0);

  // Narração da vinheta: na primeira, o nível; nas seguintes, o módulo.
  useEffect(() => {
    if (!vinheta) return;
    falar(i === 0 || retomada ? [level === 'prime' ? 'nivel-prime' : 'nivel-estagiario', FALA_MOD[round.mod]] : FALA_MOD[round.mod]);
  }, [vinheta, i, level, round.mod]);

  const onTimer = useCallback((f: number) => {
    const el = barRef.current;
    if (!el) return;
    el.style.transform = `scaleX(${Math.max(0, f)})`;
    el.dataset.alerta = f >= 0 && f < 0.25 ? 'sim' : 'nao';
    el.parentElement!.dataset.parado = f < 0 ? 'sim' : 'nao';
  }, []);

  const onResolved = useCallback((r: RoundResult) => setResults((prev) => (prev.length > i ? prev : [...prev, r])), [i]);

  const next = () => {
    // Enter no botão focado dispara o clique e o atalho de teclado: avança uma vez só por rodada.
    if (avancou.current === i) return;
    avancou.current = i;
    if (i + 1 >= rounds.length) { onFinish(results); return; }
    const changesModule = rounds[i + 1].mod !== round.mod;
    setI(i + 1);
    if (changesModule) setVinheta(true);
  };

  if (vinheta) {
    const n = rounds.filter((r) => r.mod === round.mod).length;
    const comecar = () => { calar(); setVinheta(false); };
    return (
      <div className="vinheta" data-mod={round.mod} role="dialog" aria-labelledby="vinheta-titulo">
        <AnimVinheta numero={mod.numero} total={MODULES.length} titulo={mod.nome} chamada={mod.chamada} cor={COR[round.mod]} icone={round.mod} nivel={LEVELS[level].titulo} />
        <div className="vinheta-texto">
          <p className="vinheta-nivel">{titulo} · {LEVELS[level].titulo}</p>
          {retomada && results.length === i && i === inicio!.i && <p className="vinheta-retomada">Partida retomada na rodada {i + 1} de {rounds.length}.{inicio!.results.some((r) => r.detail === 'rodada interrompida') ? ' A rodada que estava na tela quando a página recarregou contou zero.' : ''}</p>}
          <h1 id="vinheta-titulo" className="sr-only">{mod.nome}</h1>
          <p className="sr-only">{mod.chamada}</p>
          <p className="vinheta-detalhe">
            {n} rodadas de até {timerFor(level, round.mod)} segundos. Até 1.000 pontos por rodada
            {LEVELS[level].multiplicador !== 1 ? `, multiplicados por ${LEVELS[level].multiplicador.toLocaleString('pt-BR')} no fim` : ''}.
            {round.mod === 'conflitos' && ' Alterna Dossiê, em que cada pista aberta reduz o valor do acerto, e Lados, em que você diz quem lutou com quem.'}
            {(round.mod === 'mundo' || round.mod === 'cultura') && ' Uma pergunta de cada tema, em formatos que variam: múltipla escolha, ligue os pares e ache o intruso.'}
          </p>
          <button type="button" className="botao botao-primario botao-grande" disabled={!ready} onClick={comecar} autoFocus>
            {ready ? 'Começar' : 'Carregando…'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="jogo" data-mod={round.mod}>
      <header className="barra-jogo">
        {sair ? (
          <span className="sair-confirma" role="group" aria-label="Confirmar saída">
            <button type="button" className="botao-texto" onClick={() => setSair(false)} autoFocus>Continuar</button>
            <button type="button" className="botao-texto botao-texto-alerta" onClick={onQuit}>Sair e perder a partida</button>
          </span>
        ) : (
          <button type="button" className="botao-texto" onClick={() => setSair(true)}>Sair</button>
        )}
        <div className="progresso" role="img" aria-label={`Rodada ${i + 1} de ${rounds.length}, módulo ${mod.nome}`}>
          {rounds.map((r, k) => (
            <span key={k} data-mod={r.mod} className={`ponto ${k === i ? 'ponto-atual' : ''} ${results[k] ? `ponto-${tier(results[k].precision)}` : ''}`} />
          ))}
        </div>
        <div className="placar-total" role="status" aria-label="Pontos brutos até agora">{fmtSigned(total)}</div>
        <div className="cronometro" aria-hidden><div className="cronometro-barra" ref={barRef} /></div>
      </header>
      <main className="palco">
        {round.mod === 'mapa' && geo && (
          <MapRoundView key={i} round={round} level={level} geo={geo} onTimer={onTimer} onResolved={onResolved} onNext={next} isLast={i + 1 === rounds.length} />
        )}
        {round.mod === 'conflitos' && (
          <ConflictRoundView key={i} round={round} level={level} onTimer={onTimer} onResolved={onResolved} onNext={next} isLast={i + 1 === rounds.length} />
        )}
        {(round.mod === 'mundo' || round.mod === 'cultura') && (
          <QuizRoundView key={i} round={round} level={level} flags={flags} onTimer={onTimer} onResolved={onResolved} onNext={next} isLast={i + 1 === rounds.length} />
        )}
        {round.mod === 'bandeiras' && flags && (
          <FlagRoundView key={i} round={round} level={level} flags={flags} onTimer={onTimer} onResolved={onResolved} onNext={next} isLast={i + 1 === rounds.length} />
        )}
      </main>
    </div>
  );
}
