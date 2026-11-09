import { useEffect, useRef, useState } from 'react';

/** Cronômetro por timestamps (não acumula erro). Chama onExpire uma vez. */
export function useCountdown(seconds: number, running: boolean, onExpire: () => void) {
  const [left, setLeft] = useState(seconds);
  const startRef = useRef<number | null>(null);
  const expireRef = useRef(onExpire);
  expireRef.current = onExpire;

  useEffect(() => {
    if (!running) return;
    startRef.current ??= performance.now();
    let raf = 0;
    let fired = false;
    const tick = () => {
      const l = Math.max(0, seconds - (performance.now() - startRef.current!) / 1000);
      setLeft(l);
      if (l <= 0) { if (!fired) { fired = true; expireRef.current(); } return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, seconds]);

  /** Tempo restante no instante da leitura (para pontuar no clique, não no último frame). */
  const now = () => (startRef.current === null ? seconds : Math.max(0, seconds - (performance.now() - startRef.current) / 1000));
  return { left, fraction: left / seconds, now };
}
