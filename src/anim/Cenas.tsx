// Composições Remotion do jogo: abertura, vinhetas dos módulos, liberação do Prime e placar final.
// Tocadas no navegador pelo @remotion/player (projeto pessoal: licença gratuita da Remotion).
import { geoGraticule10, geoOrthographic, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology } from 'topojson-specification';
import land110 from 'world-atlas/land-110m.json';
import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from 'remotion';

const FONTE = "'Inter Variable', 'Helvetica Neue', Arial, sans-serif";
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const SUAVE = Easing.bezier(0.16, 1, 0.3, 1);
const land = feature(land110 as unknown as Topology, (land110 as unknown as Topology).objects.land);
const grade = geoGraticule10();

export const PALETA = ['#0071e3', '#e0245e', '#157a33', '#8e3fd0', '#b84a00', '#f5c542', '#30b0c7'];

// ---------- Abertura: o nome do jogo entra palavra por palavra, com bolas coloridas em órbita ----------
export const Abertura = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const palavras = ['Quem', 'é', 'o', 'Especialista'];
  const volta = 300; // uma volta das bolas a cada 10 s
  return (
    <AbsoluteFill style={{ fontFamily: FONTE, alignItems: 'center', justifyContent: 'center' }}>
      {PALETA.map((cor, i) => {
        const a = ((frame % volta) / volta) * Math.PI * 2 + (i * Math.PI * 2) / PALETA.length;
        const rx = width * 0.42, ry = height * 0.36;
        const s = spring({ frame: frame - i * 3, fps, config: { damping: 14 } });
        const r = (14 + 10 * random(`r${i}`)) * s;
        return <div key={cor} style={{ position: 'absolute', left: width / 2 + Math.cos(a) * rx - r, top: height / 2 + Math.sin(a) * ry - r, width: r * 2, height: r * 2, borderRadius: '50%', background: cor, opacity: 0.9 }} />;
      })}
      <div style={{ display: 'flex', gap: width * 0.018, alignItems: 'baseline', flexWrap: 'wrap', justifyContent: 'center', maxWidth: width * 0.86 }}>
        {palavras.map((p, i) => {
          const s = spring({ frame: frame - 6 - i * 6, fps, config: { damping: 12, mass: 0.7 } });
          const destaque = p === 'Especialista';
          return (
            <span
              key={p}
              style={{
                fontSize: height * (destaque ? 0.27 : 0.2), fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1,
                transform: `translateY(${(1 - s) * 60}px) scale(${0.8 + 0.2 * s})`, opacity: s, display: 'inline-block',
                ...(destaque
                  ? { backgroundImage: 'linear-gradient(120deg, #0071e3, #8e3fd0 45%, #e0245e 75%, #ff9500)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }
                  : { color: 'var(--preto, #1d1d1f)' }),
              }}
            >
              {p}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- Ícones animados por módulo ----------
const Globo = ({ frame, size }: { frame: number; size: number }) => {
  const proj = geoOrthographic().scale(size * 0.46).translate([size / 2, size / 2]).rotate([-20 + frame * 1.4, -18]);
  const path = geoPath(proj);
  return (
    <svg width={size} height={size}>
      <path d={path({ type: 'Sphere' }) ?? ''} fill="rgba(255,255,255,0.14)" stroke="#fff" strokeWidth={3} />
      <path d={path(grade) ?? ''} fill="none" stroke="#fff" strokeOpacity={0.25} strokeWidth={1.2} />
      <path d={path(land) ?? ''} fill="rgba(255,255,255,0.85)" stroke="#fff" strokeWidth={1} />
    </svg>
  );
};

const Bandeira = ({ frame, size }: { frame: number; size: number }) => {
  const faixas = ['#fff', 'rgba(255,255,255,0.55)', '#fff'];
  const w = size, h = size * 0.66;
  return (
    <svg width={w} height={h + 40} viewBox={`0 0 ${w} ${h + 40}`}>
      {faixas.map((cor, k) => {
        const pts: string[] = [];
        for (let x = 0; x <= w; x += 8) {
          const y = Math.sin(x / 40 - frame / 5) * 10 * (x / w);
          pts.push(`${x},${20 + (k * h) / 3 + y}`);
        }
        for (let x = w; x >= 0; x -= 8) {
          const y = Math.sin(x / 40 - frame / 5) * 10 * (x / w);
          pts.push(`${x},${20 + ((k + 1) * h) / 3 + y}`);
        }
        return <polygon key={k} points={pts.join(' ')} fill={cor} />;
      })}
    </svg>
  );
};

const Moedas = ({ frame, size }: { frame: number; size: number }) => {
  const simbolos = ['R$', '€', '$', '¥', '£', '₹'];
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {simbolos.map((s, i) => {
        const a = (i / simbolos.length) * Math.PI * 2 + frame / 30;
        const r = size * 0.32;
        const giro = Math.cos(frame / 8 + i);
        return (
          <div key={s} style={{
            position: 'absolute', left: size / 2 + Math.cos(a) * r - size * 0.12, top: size / 2 + Math.sin(a) * r - size * 0.12,
            width: size * 0.24, height: size * 0.24, borderRadius: '50%', background: '#fff', color: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: size * 0.085,
            transform: `scaleX(${0.35 + 0.65 * Math.abs(giro)})`, boxShadow: '0 6px 18px rgba(0,0,0,0.2)',
          }}>{s}</div>
        );
      })}
    </div>
  );
};

const Moldura = ({ frame, size }: { frame: number; size: number }) => {
  const p = interpolate(frame, [0, 40], [0, 1], { ...clamp, easing: SUAVE });
  const comprimento = 900;
  return (
    <svg width={size} height={size} viewBox="0 0 300 300">
      <rect x={30} y={30} width={240} height={240} rx={18} fill="rgba(255,255,255,0.14)" stroke="#fff" strokeWidth={10} />
      <path d="M60 210 C 100 120, 150 250, 190 150 S 250 90, 245 70" fill="none" stroke="#fff" strokeWidth={16} strokeLinecap="round"
        strokeDasharray={comprimento} strokeDashoffset={comprimento * (1 - p)} />
      <circle cx={90} cy={90} r={22 * p} fill="#fff" opacity={0.85} />
    </svg>
  );
};

const Radar = ({ frame, size }: { frame: number; size: number }) => (
  <svg width={size} height={size} viewBox="0 0 300 300">
    {[0, 1, 2].map((k) => {
      const t = ((frame + k * 15) % 45) / 45;
      return <circle key={k} cx={150} cy={150} r={30 + t * 110} fill="none" stroke="#fff" strokeWidth={6} opacity={1 - t} />;
    })}
    <path d="M150 40 L150 260 M40 150 L260 150" stroke="#fff" strokeOpacity={0.35} strokeWidth={3} />
    <circle cx={150} cy={150} r={16} fill="#fff" />
  </svg>
);

const ICONE = { mapa: Globo, bandeiras: Bandeira, mundo: Moedas, cultura: Moldura, conflitos: Radar } as const;
export type IconeId = keyof typeof ICONE;

// ---------- Vinheta de módulo ----------
export interface VinhetaProps extends Record<string, unknown> { numero: number; total: number; titulo: string; chamada: string; cor: string; icone: IconeId; nivel: string }
export const VinhetaModulo = ({ numero, total, titulo, chamada, cor, icone, nivel }: VinhetaProps) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const entra = spring({ frame, fps, config: { damping: 15 } });
  const titulo1 = spring({ frame: frame - 8, fps, config: { damping: 13, mass: 0.8 } });
  const sub = interpolate(frame, [22, 40], [0, 1], { ...clamp, easing: SUAVE });
  const Icone = ICONE[icone];
  const size = height * 0.52;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 120% at 15% 10%, ${cor} 0%, ${cor} 45%, #111 140%)`, fontFamily: FONTE, color: '#fff', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: -width * 0.04, bottom: -height * 0.18, fontSize: height * 1.05, fontWeight: 900, letterSpacing: '-0.06em', opacity: 0.12 * entra, transform: `translateY(${(1 - entra) * 120}px)` }}>{numero}</div>
      <div style={{ position: 'absolute', right: width * 0.07, top: height * 0.22, transform: `scale(${0.6 + 0.4 * entra}) rotate(${(1 - entra) * -20}deg)`, opacity: entra }}>
        <Icone frame={frame} size={size} />
      </div>
      <div style={{ position: 'absolute', left: width * 0.07, top: height * 0.2, width: width * 0.5, textAlign: 'left' }}>
        <div style={{ fontSize: height * 0.05, fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase', transform: `translateX(${(1 - entra) * -40}px)`, opacity: entra * 0.9 }}>
          {nivel} · Módulo {numero} de {total}
        </div>
        <div style={{ fontSize: height * 0.2, fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 0.95, marginTop: height * 0.03, transform: `translateY(${(1 - titulo1) * 80}px)`, opacity: titulo1 }}>
          {titulo}
        </div>
        <div style={{ fontSize: height * 0.058, fontWeight: 600, marginTop: height * 0.05, lineHeight: 1.2, opacity: sub, transform: `translateY(${(1 - sub) * 20}px)` }}>
          {chamada}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Celebração (Prime liberado) ----------
export interface CelebracaoProps extends Record<string, unknown> { titulo: string; sub: string; cor: string }
export const Celebracao = ({ titulo, sub, cor }: CelebracaoProps) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const s = spring({ frame: frame - 4, fps, config: { damping: 10, mass: 0.9 } });
  return (
    <AbsoluteFill style={{ background: `linear-gradient(135deg, ${cor}, #8e3fd0 60%, #e0245e)`, fontFamily: FONTE, color: '#fff', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {Array.from({ length: 70 }, (_, i) => {
        const ang = random(`a${i}`) * Math.PI * 2;
        const vel = 6 + random(`v${i}`) * 14;
        const t = Math.max(0, frame - 2);
        const x = width / 2 + Math.cos(ang) * vel * t;
        const y = height / 2 + Math.sin(ang) * vel * t + 0.35 * t * t;
        const w = 8 + random(`w${i}`) * 12;
        return <div key={i} style={{ position: 'absolute', left: x, top: y, width: w, height: w * 0.45, background: PALETA[i % PALETA.length], borderRadius: 2, transform: `rotate(${t * 12 + i * 20}deg)`, opacity: interpolate(t, [0, 50, 70], [1, 1, 0], clamp) }} />;
      })}
      <div style={{ textAlign: 'center', transform: `scale(${0.6 + 0.4 * s})`, opacity: Math.min(1, s * 1.4) }}>
        <div style={{ fontSize: height * 0.07, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', opacity: 0.9 }}>{sub}</div>
        <div style={{ fontSize: height * 0.2, fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1 }}>{titulo}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Placar animado ----------
export interface PlacarProps extends Record<string, unknown> { pontos: number; rotulo: string; modulos: { nome: string; cor: string; frac: number }[] }
export const PlacarAnimado = ({ pontos, rotulo, modulos }: PlacarProps) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const conta = interpolate(frame, [0, 1.4 * fps], [0, pontos], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ fontFamily: FONTE, color: 'var(--preto, #1d1d1f)', textAlign: 'center', padding: `${height * 0.08}px ${width * 0.06}px`, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ fontSize: height * 0.07, fontWeight: 600, opacity: 0.7 }}>{rotulo}</div>
      <div style={{ fontSize: height * 0.3, fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
        {Math.round(conta).toLocaleString('pt-BR')}
      </div>
      <div style={{ display: 'flex', gap: width * 0.02, marginTop: height * 0.07, alignItems: 'flex-end', height: height * 0.32 }}>
        {modulos.map((m, i) => {
          const s = spring({ frame: frame - 12 - i * 5, fps, config: { damping: 14 } });
          return (
            <div key={m.nome} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ height: `${Math.max(4, m.frac * 100 * s)}%`, background: m.cor, borderRadius: 12 }} />
              <div style={{ fontSize: height * 0.05, fontWeight: 600, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.nome}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
