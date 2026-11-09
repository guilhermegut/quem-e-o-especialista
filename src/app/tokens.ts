// Cores do mapa em Canvas, lidas das variáveis CSS de styles.css no momento do desenho,
// para acompanhar o modo claro ou escuro.
export interface MapColors {
  oceano: string; onda: string; terra: string; fronteira: string; litoral: string; sombra: string; grade: string;
  destaque: string; tinta: string; papel: string; anel: string; palpite: string;
  continente: Record<Continente, string>;
}
export type Continente = 'norte' | 'sul' | 'europa' | 'africa' | 'asia' | 'oceania' | 'antartida';
export function mapColors(): MapColors {
  const css = getComputedStyle(document.documentElement);
  const v = (n: string) => css.getPropertyValue(`--mapa-${n}`).trim();
  return {
    oceano: v('oceano'), onda: v('onda'), terra: v('terra'), fronteira: v('fronteira'), litoral: v('litoral'), sombra: v('sombra'), grade: v('grade'),
    destaque: v('destaque'), tinta: v('tinta'), papel: v('papel'), anel: v('anel'), palpite: v('palpite'),
    continente: { norte: v('norte'), sul: v('sul'), europa: v('europa'), africa: v('africa'), asia: v('asia'), oceania: v('oceania'), antartida: v('antartida') },
  };
}
/** Evento disparado quando o tema muda (troca manual ou do sistema), para redesenhar o Canvas. */
export const THEME_EVENT = 'geoduelo:tema';
export const FONT_TEXT = '"Inter Variable", "Helvetica Neue", Arial, sans-serif';
