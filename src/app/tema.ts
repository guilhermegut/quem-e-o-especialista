import { getSettings, saveSettings, type Tema } from '../engine/storage';
import { THEME_EVENT } from './tokens';

export const TEMA_NOME: Record<Tema, string> = { sistema: 'automática', claro: 'clara', escuro: 'escura' };
const PROXIMO: Record<Tema, Tema> = { sistema: 'claro', claro: 'escuro', escuro: 'sistema' };

/** Aplica o tema no <html>; "sistema" deixa a escolha para prefers-color-scheme. */
export function aplicarTema(t: Tema = getSettings().tema) {
  const el = document.documentElement;
  if (t === 'sistema') delete el.dataset.tema; else el.dataset.tema = t;
  window.dispatchEvent(new Event(THEME_EVENT));
}
export function alternarTema(): Tema {
  const t = PROXIMO[getSettings().tema];
  saveSettings({ tema: t });
  aplicarTema(t);
  return t;
}
