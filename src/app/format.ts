export const fmtInt = (n: number) => Math.round(n).toLocaleString('pt-BR');
/** Inteiro com sinal de menos tipográfico. */
export const fmtSigned = (n: number) => `${n < 0 ? '−' : ''}${fmtInt(Math.abs(n))}`;

/** 1,1 milhão · 12,3 milhões · 540 mil */
export function fmtPop(n: number): string {
  // Singular só quando o número exibido é menor que 2 (1; 1,4), decidido depois do arredondamento.
  const plural = (s: string) => Number(s.replace(/\./g, '').replace(',', '.')) >= 2;
  if (n >= 1_000_000_000) {
    const s = (n / 1_000_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
    return `${s} ${plural(s) ? 'bilhões' : 'bilhão'}`;
  }
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    const s = v.toLocaleString('pt-BR', { maximumFractionDigits: v >= 100 ? 0 : 1 });
    return `${s} ${plural(s) ? 'milhões' : 'milhão'}`;
  }
  if (n >= 1000) return `${Math.round(n / 1000).toLocaleString('pt-BR')} mil`;
  return fmtInt(n);
}

/** "1,1 milhão de habitantes" · "540 mil habitantes" */
export const popPhrase = (n: number) => `${fmtPop(n)}${n >= 1_000_000 ? ' de' : ''} habitantes`;
// "1,1 milhão de habitantes"; "1,4 bilhão de habitantes"; "540 mil habitantes"

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
