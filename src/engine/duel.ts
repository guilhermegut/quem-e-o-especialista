// Código de duelo: carrega a partida (data ou seed + nível + versão de conteúdo) e o placar de quem desafiou.
// Sem servidor: tudo vai no próprio link.
import { z } from 'zod';
import { CONTENT_VERSION } from '../data';
import { cyrb128 } from './rng';
import { isISODate } from './date';
import type { MatchSpec } from './match';

const LevelZ = z.enum(['estagiario', 'prime']);
const DuelZ = z.object({
  v: z.literal(1),
  k: z.enum(['d', 'f']),
  d: z.string().optional(),
  s: z.string().max(40).optional(),
  l: LevelZ,
  cv: z.string().max(10),
  n: z.string().max(24),
  r: z.array(z.number().int().min(-1000).max(1000)).max(25),
  t: z.number().int().min(0),
});
export type DuelPayload = z.infer<typeof DuelZ>;

const b64url = {
  enc: (s: string) => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
  dec: (s: string) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))),
};
const check = (body: string) => cyrb128(body)[0].toString(36).slice(0, 4);

export function encodeDuel(spec: MatchSpec, nome: string, raw: number[], total: number): string {
  const p: DuelPayload = {
    v: 1, k: spec.kind === 'daily' ? 'd' : 'f',
    ...(spec.kind === 'daily' ? { d: spec.date } : { s: spec.seed }),
    l: spec.level, cv: CONTENT_VERSION, n: nome.slice(0, 24), r: raw, t: total,
  };
  const body = b64url.enc(JSON.stringify(p));
  return `QE1.${body}.${check(body)}`;
}

export type DecodeResult = { ok: true; payload: DuelPayload; spec: MatchSpec; versaoDiferente: boolean } | { ok: false; erro: string };

/** Aceita o código puro ou um link inteiro que contenha "duelo=". */
export function decodeDuel(input: string): DecodeResult {
  const m = input.trim().match(/QE1\.([A-Za-z0-9_-]+)\.([a-z0-9]{1,4})/);
  if (!m) return { ok: false, erro: 'Não encontrei um código de duelo nesse texto.' };
  const [, body, sum] = m;
  if (check(body) !== sum) return { ok: false, erro: 'O código está incompleto ou foi alterado.' };
  let parsed: unknown;
  try { parsed = JSON.parse(b64url.dec(body)); } catch { return { ok: false, erro: 'O código não pôde ser lido.' }; }
  const r = DuelZ.safeParse(parsed);
  if (!r.success) return { ok: false, erro: 'O código não tem o formato esperado.' };
  const p = r.data;
  let spec: MatchSpec;
  if (p.k === 'd') {
    if (!p.d || !isISODate(p.d)) return { ok: false, erro: 'Data inválida no código.' };
    spec = { kind: 'daily', date: p.d, level: p.l };
  } else {
    if (!p.s) return { ok: false, erro: 'Seed ausente no código.' };
    spec = { kind: 'free', seed: p.s, level: p.l };
  }
  return { ok: true, payload: p, spec, versaoDiferente: p.cv !== CONTENT_VERSION };
}

export function duelLink(code: string): string {
  // Na prévia como artifact o endereço é interno do sandbox e não serve para compartilhar.
  if (import.meta.env.VITE_PREVIEW === '1') return '';
  try {
    const { origin, pathname } = window.location;
    if (origin && origin !== 'null' && /^https?:/.test(origin)) return `${origin}${pathname}#duelo=${code}`;
  } catch { /* sem location utilizável */ }
  return '';
}
