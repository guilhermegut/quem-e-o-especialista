import { useEffect, useMemo, useRef } from 'react';
import { geoGraticule10, geoInterpolate, geoNaturalEarth1, geoPath, type GeoProjection } from 'd3-geo';
import { select } from 'd3-selection';
import { zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from 'd3-zoom';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { FONT_TEXT, THEME_EVENT, mapColors, type Continente } from '../../app/tokens';
import { COUNTRY_BY_N3 } from '../../data';
import type { LonLat } from '../../engine/geo';
import type { GeoData } from './geodata';

/** Camadas: com fronteiras (padrão) ou só o litoral. 'completo' acrescenta a grade de meridianos mais visível. */
export type MapLayers = 'completo' | 'fronteiras' | 'litoral';

export interface MapReveal {
  guess: LonLat | null;
  /** Ponto do alvo mais próximo do clique (cidade, ou borda do país). */
  target: LonLat;
  country?: Feature<Geometry>;
  label: string;
}

interface Props {
  geo: GeoData;
  layers: MapLayers;
  pin?: LonLat | null;
  onPick?: (ll: LonLat) => void;
  reveal?: MapReveal | null;
  interactive?: boolean;
  ariaLabel: string;
  /** Altura coberta por baixo (cartão da rodada): enquadramentos usam só a área visível acima. */
  insetBottom?: number;
}

/** América do Sul separada das demais Américas, como nos tabuleiros de conquista. */
const SUL = new Set(['AR', 'BO', 'BR', 'CL', 'CO', 'EC', 'GY', 'PY', 'PE', 'SR', 'UY', 'VE', 'GF', 'FK', 'GS']);
function continenteDe(id: string): Continente | null {
  const c = COUNTRY_BY_N3.get(id.padStart(3, '0'));
  if (!c?.reg) return null;
  if (c.reg === 'Américas') return SUL.has(c.cc) ? 'sul' : 'norte';
  return ({ 'Europa': 'europa', 'África': 'africa', 'Ásia': 'asia', 'Oceania': 'oceania', 'Antártida': 'antartida' } as Record<string, Continente>)[c.reg] ?? null;
}
function porContinente(geo: GeoData): [Continente, FeatureCollection<Geometry>][] {
  const g = new Map<Continente, Feature<Geometry>[]>();
  for (const [id, f] of geo.countries) {
    const k = continenteDe(id);
    if (k) (g.get(k) ?? g.set(k, []).get(k)!).push(f);
  }
  return [...g].map(([k, fs]) => [k, { type: 'FeatureCollection', features: fs }]);
}

const reduceMotion = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function WorldMap({ geo, layers, pin = null, onPick, reveal = null, interactive = true, ariaLabel, insetBottom = 0 }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useRef({
    w: 0, h: 0, dpr: 1,
    projection: geoNaturalEarth1() as GeoProjection,
    t: zoomIdentity as ZoomTransform,
    arc: 0, // progresso da animação do arco (0..1)
    pin, reveal, layers, inset: insetBottom,
    zoomer: null as ZoomBehavior<HTMLCanvasElement, unknown> | null,
    raf: 0,
  });
  const pickRef = useRef(onPick);
  pickRef.current = onPick;
  const continentes = useMemo(() => porContinente(geo), [geo]);
  const contRef = useRef(continentes);
  contRef.current = continentes;

  /** Vista inicial: o mundo inteiro; em tela vertical, já aproximado para o mapa ocupar a área visível. */
  const homeTransform = (): ZoomTransform => {
    const s = state.current;
    const hv = Math.max(120, s.h - s.inset);
    const [[x0, y0], [x1, y1]] = geoPath(s.projection).bounds({ type: 'Sphere' });
    const k = Math.min(3, Math.max(1, (hv * 0.85) / (y1 - y0)));
    if (k === 1) return zoomIdentity;
    const tx = Math.min(0, Math.max(s.w - s.w * k, s.w / 2 - k * (x0 + x1) / 2));
    const ty = Math.min(0, Math.max(s.h - s.h * k, hv / 2 - k * (y0 + y1) / 2));
    return zoomIdentity.translate(tx, ty).scale(k);
  };

  const draw = () => {
    const s = state.current;
    const canvas = canvasRef.current;
    if (!canvas || !s.w) return;
    const ctx = canvas.getContext('2d')!;
    const { w, h, dpr, t, projection } = s;
    const C = mapColors();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = C.oceano;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.scale(t.k, t.k);
    const path = geoPath(projection, ctx);
    const lw = 1 / t.k;

    ctx.beginPath(); path({ type: 'Sphere' }); ctx.fillStyle = C.oceano; ctx.fill();
    // Ondas do mar de tabuleiro: a grade de 10 graus, bem suave.
    ctx.beginPath(); path(geoGraticule10()); ctx.strokeStyle = s.layers === 'completo' ? C.grade : C.onda; ctx.lineWidth = lw; ctx.stroke();
    // Relevo: sombra projetada das terras sobre o mar.
    ctx.save();
    ctx.shadowColor = C.sombra; ctx.shadowBlur = 8; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 3;
    ctx.beginPath(); path(geo.land); ctx.fillStyle = C.terra; ctx.fill();
    ctx.restore();
    for (const [k, fc] of contRef.current) {
      ctx.beginPath(); path(fc); ctx.fillStyle = C.continente[k]; ctx.fill();
    }
    if (s.layers !== 'litoral') {
      ctx.beginPath(); path(geo.borders);
      ctx.strokeStyle = C.fronteira; ctx.lineWidth = 0.7 * lw; ctx.stroke();
    }
    ctx.beginPath(); path(geo.land); ctx.strokeStyle = C.litoral; ctx.lineWidth = 1.1 * lw; ctx.stroke();
    if (s.reveal?.country) {
      ctx.beginPath(); path(s.reveal.country); ctx.fillStyle = C.destaque; ctx.fill();
      ctx.strokeStyle = C.tinta; ctx.lineWidth = 2 * lw; ctx.stroke();
    }
    ctx.restore();

    const toScreen = (ll: LonLat): [number, number] | null => {
      const p = projection(ll);
      return p ? [t.x + t.k * p[0], t.y + t.k * p[1]] : null;
    };

    const r = s.reveal;
    if (r && r.guess && s.arc > 0) {
      const interp = geoInterpolate(r.guess, r.target);
      const n = 96;
      ctx.beginPath();
      let prev: [number, number] | null = null;
      for (let i = 0; i <= n * s.arc; i++) {
        const q = toScreen(interp(i / n) as LonLat);
        if (!q) continue;
        if (!prev || Math.abs(q[0] - prev[0]) > w / 2) ctx.moveTo(q[0], q[1]); else ctx.lineTo(q[0], q[1]);
        prev = q;
      }
      ctx.setLineDash([2, 7]); ctx.lineCap = 'round';
      ctx.strokeStyle = C.tinta; ctx.lineWidth = 5; ctx.stroke();
      ctx.strokeStyle = C.papel; ctx.lineWidth = 2.6; ctx.stroke(); ctx.lineCap = 'butt';
      ctx.setLineDash([]);
    }

    const g = r ? r.guess : s.pin;
    if (g) {
      const q = toScreen(g);
      if (q) {
        // Peça de jogo: base com sombra, cabeça na cor do palpite.
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2;
        ctx.beginPath(); ctx.arc(q[0], q[1], 9, 0, Math.PI * 2);
        ctx.fillStyle = C.palpite; ctx.fill();
        ctx.restore();
        ctx.beginPath(); ctx.arc(q[0], q[1], 9, 0, Math.PI * 2); ctx.strokeStyle = C.papel; ctx.lineWidth = 2.5; ctx.stroke();
        ctx.beginPath(); ctx.arc(q[0] - 2.5, q[1] - 2.5, 2.6, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fill();
      }
    }

    if (r && (s.arc >= 1 || !r.guess)) {
      const q = toScreen(r.target);
      if (q) {
        ctx.beginPath(); ctx.arc(q[0], q[1], 13, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fill();
        ctx.beginPath(); ctx.arc(q[0], q[1], 8, 0, Math.PI * 2);
        ctx.fillStyle = C.papel; ctx.fill(); ctx.strokeStyle = C.tinta; ctx.lineWidth = 3; ctx.stroke();
        ctx.beginPath(); ctx.arc(q[0], q[1], 3, 0, Math.PI * 2); ctx.fillStyle = C.palpite; ctx.fill();
        ctx.font = `600 14px ${FONT_TEXT}`;
        const tw = ctx.measureText(r.label).width;
        const bx = Math.min(Math.max(q[0] + 14, 8), w - tw - 30);
        const by = Math.min(Math.max(q[1] - 32, 8), h - 36);
        ctx.shadowColor = 'rgba(0,0,0,0.18)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 2;
        ctx.fillStyle = C.tinta;
        ctx.beginPath(); ctx.roundRect(bx, by, tw + 22, 28, 14); ctx.fill();
        ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
        ctx.fillStyle = C.papel; ctx.textBaseline = 'middle'; ctx.fillText(r.label, bx + 11, by + 14.5);
      }
    }
  };

  // Montagem: tamanho, zoom, clique
  useEffect(() => {
    const canvas = canvasRef.current!;
    const wrap = wrapRef.current!;
    const s = state.current;
    const sel = select(canvas);
    const z = zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([1, 90])
      .clickDistance(5)
      .on('zoom', (ev) => { s.t = ev.transform; draw(); });
    s.zoomer = z;
    if (interactive) sel.call(z).on('dblclick.zoom', null);

    const resize = () => {
      const { width, height } = wrap.getBoundingClientRect();
      s.w = Math.max(1, width); s.h = Math.max(1, height);
      s.dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(s.w * s.dpr); canvas.height = Math.round(s.h * s.dpr);
      canvas.style.width = `${s.w}px`; canvas.style.height = `${s.h}px`;
      s.projection = geoNaturalEarth1().fitExtent([[6, 6], [s.w - 6, s.h - 6]], { type: 'Sphere' });
      z.extent([[0, 0], [s.w, s.h]]).translateExtent([[0, 0], [s.w, s.h]]);
      s.t = homeTransform();
      if (interactive) sel.call(z.transform, s.t);
      if (s.reveal) fitReveal(false);
      draw();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const onClick = (ev: MouseEvent) => {
      if (!pickRef.current) return;
      const rect = canvas.getBoundingClientRect();
      const [px, py] = s.t.invert([ev.clientX - rect.left, ev.clientY - rect.top]);
      const ll = s.projection.invert?.([px, py]);
      if (ll && Number.isFinite(ll[0]) && Number.isFinite(ll[1]) && Math.abs(ll[1]) <= 90) pickRef.current([ll[0], ll[1]]);
    };
    canvas.addEventListener('click', onClick);
    return () => { ro.disconnect(); canvas.removeEventListener('click', onClick); cancelAnimationFrame(s.raf); sel.on('.zoom', null); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo, interactive]);

  /** Enquadra o clique e o alvo; anima o zoom e depois o arco. */
  const fitReveal = (animate: boolean) => {
    const s = state.current;
    const r = s.reveal;
    if (!r) return;
    const path = geoPath(s.projection);
    const pts = [r.target, ...(r.guess ? [r.guess] : [])].map((p) => s.projection(p)).filter(Boolean) as [number, number][];
    let [[x0, y0], [x1, y1]] = [[Math.min(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1]))], [Math.max(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[1]))]];
    if (r.country) {
      const b = path.bounds(r.country);
      if (b[1][0] - b[0][0] < s.w * 0.6) { x0 = Math.min(x0, b[0][0]); y0 = Math.min(y0, b[0][1]); x1 = Math.max(x1, b[1][0]); y1 = Math.max(y1, b[1][1]); }
    }
    const hv = Math.max(120, s.h - s.inset);
    const dx = Math.max(x1 - x0, 40), dy = Math.max(y1 - y0, 40);
    const k = Math.min(24, Math.max(1, 0.6 * Math.min(s.w / dx, hv / dy)));
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    const tx = Math.min(0, Math.max(s.w - s.w * k, s.w / 2 - k * cx));
    const ty = Math.min(0, Math.max(s.h - s.h * k, hv / 2 - k * cy));
    const to = zoomIdentity.translate(tx, ty).scale(k);
    const from = s.t;
    const canvas = canvasRef.current!;
    const apply = (tr: ZoomTransform) => {
      s.t = tr;
      if (interactive && s.zoomer) select(canvas).call(s.zoomer.transform, tr); else draw();
    };
    cancelAnimationFrame(s.raf);
    if (!animate || reduceMotion()) { apply(to); s.arc = 1; draw(); return; }
    const t0 = performance.now();
    const ZOOM_MS = 750, ARC_MS = 800;
    s.arc = 0;
    const step = () => {
      const e = Math.min(1, (performance.now() - t0) / ZOOM_MS);
      const q = ease(e);
      const kk = from.k * Math.pow(to.k / from.k, q);
      apply(zoomIdentity.translate(from.x + (to.x - from.x) * q, from.y + (to.y - from.y) * q).scale(kk));
      const a = (performance.now() - t0 - ZOOM_MS * 0.6) / ARC_MS;
      s.arc = Math.min(1, Math.max(0, ease(Math.min(1, a))));
      draw();
      if (e < 1 || s.arc < 1) s.raf = requestAnimationFrame(step);
    };
    s.raf = requestAnimationFrame(step);
  };

  useEffect(() => {
    const s = state.current;
    s.pin = pin; s.layers = layers; s.inset = insetBottom;
    const changed = s.reveal !== reveal;
    s.reveal = reveal;
    if (changed) {
      if (reveal) fitReveal(true);
      else {
        s.arc = 0;
        const home = homeTransform();
        if (interactive && s.zoomer && canvasRef.current) select(canvasRef.current).call(s.zoomer.transform, home);
        else s.t = home;
      }
    }
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin, reveal, layers, insetBottom]);

  // Redesenha quando o tema muda (troca manual ou preferência do sistema).
  useEffect(() => {
    const redraw = () => requestAnimationFrame(draw);
    const mq = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;
    window.addEventListener(THEME_EVENT, redraw);
    mq?.addEventListener?.('change', redraw);
    return () => { window.removeEventListener(THEME_EVENT, redraw); mq?.removeEventListener?.('change', redraw); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const zoomBy = (f: number) => {
    const s = state.current;
    if (s.zoomer && canvasRef.current) s.zoomer.scaleBy(select(canvasRef.current), f);
  };
  const recenter = () => {
    const s = state.current;
    if (s.zoomer && canvasRef.current) select(canvasRef.current).call(s.zoomer.transform, homeTransform());
  };

  return (
    <div className="mapa" ref={wrapRef}>
      <canvas ref={canvasRef} role="img" aria-label={ariaLabel} className={onPick ? 'mapa-mira' : undefined} />
      {interactive && (
        <div className="mapa-zoom">
          <button type="button" onClick={() => zoomBy(1.8)} aria-label="Aproximar">+</button>
          <button type="button" onClick={() => zoomBy(1 / 1.8)} aria-label="Afastar">−</button>
          <button type="button" onClick={recenter} aria-label="Ver o mundo inteiro" className="mapa-zoom-mundo">◯</button>
        </div>
      )}
    </div>
  );
}
