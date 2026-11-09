import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { geoCentroid } from 'd3-geo';
import { CITY, COUNTRY, countryName } from '../../data';
import { distanceToFeature, formatKm, haversineKm, type LonLat } from '../../engine/geo';
import { LEVELS, timerFor, type LevelId } from '../../engine/levels';
import type { MapRound } from '../../engine/match';
import { mapPrecision, roundPoints } from '../../engine/scoring';
import type { RoundResult } from '../../engine/storage';
import { fmtInt, fmtPop, popPhrase } from '../../app/format';
import { useCountdown } from '../../app/useCountdown';
import type { GeoData } from './geodata';
import { WorldMap, type MapLayers, type MapReveal } from './WorldMap';

// Fronteiras em todos os níveis (decisão do usuário em 06/11/2026); o Observador tem também a grade.
const LAYERS: Record<LevelId, MapLayers> = { estagiario: 'completo', prime: 'fronteiras' };

interface Props {
  round: MapRound;
  level: LevelId;
  geo: GeoData;
  onTimer: (fraction: number) => void;
  onResolved: (r: RoundResult) => void;
  onNext: () => void;
  isLast: boolean;
}

export function targetInfo(round: MapRound) {
  if (round.target.kind === 'country') {
    const c = COUNTRY.get(round.target.cc)!;
    return { nome: c.n, sub: null as string | null, tipo: 'país' as const, country: c, city: null };
  }
  const city = CITY.get(round.target.id)!;
  return { nome: city.n, sub: round.showCountry ? countryName(city.cc) : null, tipo: 'cidade' as const, country: COUNTRY.get(city.cc)!, city };
}

export function MapRoundView({ round, level, geo, onTimer, onResolved, onNext, isLast }: Props) {
  const info = useMemo(() => targetInfo(round), [round]);
  const seconds = timerFor(level, 'mapa');
  const [pin, setPin] = useState<LonLat | null>(null);
  const cardRef = useRef<HTMLElement>(null);
  const [inset, setInset] = useState(0);
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setInset(el.getBoundingClientRect().height + 24));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const [result, setResult] = useState<{ km: number; points: number; precision: number; reveal: MapReveal } | null>(null);

  const resolve = useCallback((guess: LonLat | null, timeLeft: number) => {
    if (result) return;
    let km = Infinity;
    let target: LonLat;
    let feature;
    if (info.city) {
      target = [info.city.lon, info.city.lat];
      if (guess) km = haversineKm(guess, target);
    } else {
      feature = geo.countries.get(info.country.n3)!;
      if (guess) { const d = distanceToFeature(guess, feature); km = d.km; target = d.nearest; }
      else target = geoCentroid(feature) as LonLat;
    }
    const precision = guess ? mapPrecision(km, LEVELS[level].kMapa) : 0;
    const points = roundPoints(precision, timeLeft / seconds);
    const label = info.sub ? `${info.nome}, ${info.sub}` : info.nome;
    setResult({ km, points, precision, reveal: { guess, target: target!, country: feature, label } });
    onResolved({ mod: 'mapa', precision, raw: points, detail: guess ? formatKm(km) : 'sem clique' });
  }, [result, info, geo, level, seconds, onResolved]);

  const timer = useCountdown(seconds, !result, () => resolve(pin, 0));
  useEffect(() => { onTimer(result ? -1 : timer.fraction); }, [timer.fraction, result, onTimer]);

  const confirm = () => { if (pin && !result) resolve(pin, timer.now()); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return;
      if (result) onNext(); else if (pin) confirm();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const contexto = useMemo(() => {
    if (info.city) {
      const capital = info.city.cap ? ' É a capital do país.' : '';
      return { texto: `${info.city.n} tem ${popPhrase(info.city.pop)}, segundo o GeoNames.${capital}`, fonte: 'GeoNames (CC BY 4.0), via all-the-cities 3.1.0' };
    }
    const c = info.country;
    const cap = c.cap ? CITY.get(c.cap)?.n : null;
    const partes = [cap ? `Capital: ${cap}.` : null, c.pop ? `População estimada: ${fmtPop(c.pop)}.` : null, c.area ? `Área: ${fmtInt(c.area)} km².` : null].filter(Boolean);
    return { texto: partes.join(' '), fonte: 'Unicode CLDR 49; world-countries 5.1.0 (ODbL); GeoNames' };
  }, [info]);

  return (
    <div className="rodada-mapa">
      <WorldMap
        geo={geo}
        layers={LAYERS[level]}
        pin={pin}
        onPick={result ? undefined : setPin}
        reveal={result?.reveal ?? null}
        insetBottom={inset}
        ariaLabel={result ? `Mapa com o alvo ${info.nome}` : 'Mapa-múndi: clique para marcar onde fica o alvo'}
      />
      <section className="cartao-rodada" aria-live="polite" ref={cardRef}>
        {!result ? (
          <>
            <p className="cartao-pergunta">Onde fica {info.tipo === 'país' ? 'este país' : 'esta cidade'}?</p>
            <h2 className="cartao-alvo">
              {info.nome}
              {info.sub && <span className="cartao-alvo-pais">{info.sub}</span>}
            </h2>
            <div className="cartao-acoes">
              <button type="button" className="botao botao-primario" disabled={!pin} onClick={confirm}>
                {pin ? 'Confirmar posição' : 'Clique no mapa'}
              </button>
              <span className="dica">Arraste para mover, role para aproximar. Enter confirma.</span>
            </div>
          </>
        ) : (
          <>
            <div className="placar-rodada">
              <div>
                <span className="placar-numero">{result.reveal.guess ? (result.km === 0 ? 'Dentro' : formatKm(result.km)) : 'Tempo esgotado'}</span>
                <span className="placar-legenda">{result.reveal.guess ? (result.km === 0 ? 'seu clique caiu dentro do país' : 'de distância do alvo') : 'nenhuma posição marcada'}</span>
              </div>
              <div className="placar-pontos">+{fmtInt(result.points)}</div>
            </div>
            <p className="contexto">{contexto.texto}</p>
            <p className="fonte">Fonte: {contexto.fonte}</p>
            <div className="cartao-acoes">
              <button type="button" className="botao botao-primario" onClick={onNext} autoFocus>
                {isLast ? 'Ver resultado' : 'Próxima rodada'}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
