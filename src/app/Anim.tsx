// Fachada com React.lazy para as animações Remotion: a tela funciona antes do código da animação chegar.
import { lazy, Suspense, type ComponentProps } from 'react';

const mod = () => import('../anim/Animacao');
const Abertura = lazy(() => mod().then((m) => ({ default: m.AberturaAnimada })));
const Vinheta = lazy(() => mod().then((m) => ({ default: m.VinhetaAnimada })));
const Celebracao = lazy(() => mod().then((m) => ({ default: m.CelebracaoAnimada })));
const Placar = lazy(() => mod().then((m) => ({ default: m.PlacarAnimadoPlayer })));

export const preloadAnim = () => { void mod(); };

export const AnimAbertura = () => <Suspense fallback={<div className="anim-reserva anim-abertura" />}><div className="anim anim-abertura" aria-hidden><Abertura /></div></Suspense>;
export const AnimVinheta = (p: ComponentProps<typeof Vinheta>) => <Suspense fallback={<div className="anim-reserva anim-vinheta" />}><div className="anim anim-vinheta" aria-hidden><Vinheta {...p} /></div></Suspense>;
export const AnimCelebracao = (p: ComponentProps<typeof Celebracao>) => <Suspense fallback={<div className="anim-reserva anim-celebracao" />}><div className="anim anim-celebracao" aria-hidden><Celebracao {...p} /></div></Suspense>;
export const AnimPlacar = (p: ComponentProps<typeof Placar>) => <Suspense fallback={<div className="anim-reserva anim-placar" />}><div className="anim anim-placar" aria-hidden><Placar {...p} /></div></Suspense>;
