// Players do Remotion usados nas telas. Carregado sob demanda (React.lazy) para não pesar na abertura.
import { useEffect, useRef } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import { Abertura, Celebracao, PlacarAnimado, VinhetaModulo, type CelebracaoProps, type PlacarProps, type VinhetaProps } from './Cenas';

const reduz = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const comum = { fps: 30, autoPlay: !reduz(), moveToBeginningWhenEnded: false, controls: false, clickToPlay: false, acknowledgeRemotionLicense: true, numberOfSharedAudioTags: 0, initiallyMuted: true, style: { width: '100%' } } as const;

/** Toca ao montar; se o navegador não deixar, mostra o quadro final em vez de ficar parado no início. */
function useToca(duracao: number, loop = false) {
  const ref = useRef<PlayerRef>(null);
  useEffect(() => {
    const p = ref.current;
    if (!p) return;
    if (reduz()) { p.seekTo(loop ? Math.floor(duracao * 0.6) : duracao - 1); return; }
    try { if (!p.isPlaying()) p.play(); } catch { /* ignora */ }
    const t = window.setTimeout(() => {
      const q = ref.current ?? p;
      if (q.getCurrentFrame() === 0) { q.pause(); q.seekTo(loop ? Math.floor(duracao * 0.6) : duracao - 1); }
    }, 1200);
    return () => window.clearTimeout(t);
  }, [duracao, loop]);
  return ref;
}

export function AberturaAnimada() {
  const ref = useToca(1800);
  return <Player ref={ref} component={Abertura} durationInFrames={1800} compositionWidth={1200} compositionHeight={380} {...comum} />;
}

export function VinhetaAnimada(props: VinhetaProps) {
  const ref = useToca(75);
  return <Player ref={ref} component={VinhetaModulo} inputProps={props} durationInFrames={75} compositionWidth={1280} compositionHeight={600} {...comum} />;
}

export function CelebracaoAnimada(props: CelebracaoProps) {
  const ref = useToca(80);
  return <Player ref={ref} component={Celebracao} inputProps={props} durationInFrames={80} compositionWidth={1200} compositionHeight={420} {...comum} />;
}

export function PlacarAnimadoPlayer(props: PlacarProps) {
  const ref = useToca(70);
  return <Player ref={ref} component={PlacarAnimado} inputProps={props} durationInFrames={70} compositionWidth={1200} compositionHeight={600} {...comum} />;
}
