// Falas gravadas na voz do Guilherme (ElevenLabs). Cada arquivo em src/voz/NN-nome.mp3 entra no build;
// fala ausente simplesmente não toca. O som pode ser desligado nas preferências.
import { getSettings } from '../engine/storage';

export type Fala =
  | 'abertura' | 'nivel-estagiario' | 'nivel-prime'
  | 'mod-mapa' | 'mod-bandeiras' | 'mod-mundo' | 'mod-cultura' | 'mod-foto' | 'mod-guerras'
  | 'prime-liberado' | 'prime-bloqueado'
  | 'res-especialista' | 'res-bom' | 'res-medio' | 'res-baixo' | 'fim-prime';

const arquivos = import.meta.glob('../voz/*.mp3', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const URL_DA: Partial<Record<Fala, string>> = {};
for (const [path, url] of Object.entries(arquivos)) {
  const nome = path.split('/').pop()!.replace(/\.mp3$/, '').replace(/^\d+-/, '') as Fala;
  URL_DA[nome] = url;
}

let atual: HTMLAudioElement | null = null;
let abrirCom: Fala | null = null;

/** A próxima fala começa com esta (usado para a boas-vindas antes da primeira vinheta do dia). */
export function comecarCom(f: Fala) { abrirCom = f; }

export const temVoz = (f: Fala) => Boolean(URL_DA[f]);
export const quantasFalas = () => Object.keys(URL_DA).length;

/** Toca uma fala ou uma sequência (interrompe a anterior). O navegador só deixa tocar depois de um gesto do usuário. */
export function falar(f: Fala | Fala[]) {
  const pedido = Array.isArray(f) ? f : [f];
  if (abrirCom) { pedido.unshift(abrirCom); abrirCom = null; }
  if (!getSettings().som) return;
  const fila = pedido.map((x) => URL_DA[x]).filter((u): u is string => Boolean(u));
  calar();
  const tocar = (k: number) => {
    if (k >= fila.length) return;
    try {
      const a = new Audio(fila[k]);
      atual = a;
      a.onended = () => { if (atual === a) tocar(k + 1); };
      void a.play().catch(() => { /* bloqueado pelo navegador: segue sem som */ });
    } catch { /* sem áudio */ }
  };
  tocar(0);
}

export function calar() { try { atual?.pause(); } catch { /* ignora */ } atual = null; }
