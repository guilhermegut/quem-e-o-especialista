// Gerador pseudoaleatório determinístico: mesma seed, mesma partida em qualquer aparelho.

/** Hash de 128 bits (cyrb128) de uma string em quatro inteiros de 32 bits. */
export function cyrb128(str: string): [number, number, number, number] {
  let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
  for (let i = 0; i < str.length; i++) {
    const k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  h1 ^= h2 ^ h3 ^ h4; h2 ^= h1; h3 ^= h1; h4 ^= h1;
  return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
}

export type Rng = () => number;

/** sfc32: rápido e com período longo; retorna números em [0, 1). */
export function sfc32(a: number, b: number, c: number, d: number): Rng {
  return () => {
    a |= 0; b |= 0; c |= 0; d |= 0;
    const t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

export const rngFrom = (seed: string): Rng => {
  const r = sfc32(...cyrb128(seed));
  for (let i = 0; i < 12; i++) r(); // descarta os primeiros valores
  return r;
};

export const int = (rng: Rng, n: number) => Math.floor(rng() * n);

export function shuffle<T>(rng: Rng, arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = int(rng, i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Amostra sem reposição, ponderada (Efraimidis–Spirakis). */
export function weightedSample<T>(rng: Rng, items: readonly T[], weight: (t: T) => number, k: number): T[] {
  return items
    .map((it) => ({ it, key: Math.pow(rng() || 1e-12, 1 / Math.max(weight(it), 1e-9)) }))
    .sort((x, y) => y.key - x.key)
    .slice(0, k)
    .map((x) => x.it);
}

export const randomSeed = () => {
  const b = new Uint32Array(2);
  crypto.getRandomValues(b);
  return b[0].toString(36) + b[1].toString(36);
};
