import { todayBR } from './date';
// Dois níveis (decisão do usuário em 09/11/2026): Estagiário e Prime, com diferença moderada de dificuldade.
export type LevelId = 'estagiario' | 'prime';

export interface Level {
  id: LevelId;
  nome: string;
  titulo: string;
  multiplicador: number;
  kMapa: number; // km: tolerância do mapa (precisão 37% a essa distância)
}

export const LEVELS: Record<LevelId, Level> = {
  estagiario: { id: 'estagiario', nome: 'Estagiário', titulo: 'Nível Estagiário', multiplicador: 1, kMapa: 1200 },
  prime: { id: 'prime', nome: 'Prime', titulo: 'Nível Prime', multiplicador: 1.25, kMapa: 800 },
};

export const LEVEL_ORDER: LevelId[] = ['estagiario', 'prime'];

export type ModuleId = 'mapa' | 'bandeiras' | 'mundo' | 'cultura' | 'esportes' | 'foto' | 'logica' | 'conflitos';

// O Foto entrou no Desafio de 10/11/2026 (em múltipla escolha); Esportes, Lógica e o Foto em linha do tempo entram
// a partir de NOVOS_DESDE (virada à meia-noite de Brasília). As variáveis VITE_* mudam as datas só em builds de teste.
const ENV = (import.meta as { env?: Record<string, string | undefined> }).env ?? {};
export const FOTO_DESDE = ENV.VITE_FOTO_DESDE ?? '2026-11-10';
export const NOVOS_DESDE = ENV.VITE_NOVOS_DESDE ?? '2026-11-10';
const DESDE: Partial<Record<ModuleId, string>> = { foto: FOTO_DESDE, esportes: NOVOS_DESDE, logica: NOVOS_DESDE };

type Tempos = Record<LevelId, Record<ModuleId, number>>;
/** Até 09/11/2026 (cinco módulos). */
const TEMPOS_INICIAIS: Tempos = {
  estagiario: { mapa: 18, bandeiras: 10, mundo: 14, cultura: 14, esportes: 14, foto: 12, logica: 15, conflitos: 30 },
  prime: { mapa: 15, bandeiras: 9, mundo: 12, cultura: 12, esportes: 12, foto: 10, logica: 13, conflitos: 27 },
};
/** Com o Foto em múltipla escolha (seis módulos) e guerras com 25% mais tempo de leitura. */
const TEMPOS_COM_FOTO: Tempos = {
  estagiario: { mapa: 15, bandeiras: 9, mundo: 13, cultura: 13, esportes: 12, foto: 12, logica: 15, conflitos: 38 },
  prime: { mapa: 13, bandeiras: 8, mundo: 11, cultura: 11, esportes: 10, foto: 10, logica: 13, conflitos: 34 },
};
/**
 * Oito módulos (a partir de NOVOS_DESDE). Somando tudo, a resposta cabe em 6 min 27 s no Estagiário e
 * 5 min 36 s no Prime; na prática termina-se antes.
 */
const TEMPOS_NOVOS: Tempos = {
  estagiario: { mapa: 15, bandeiras: 9, mundo: 13, cultura: 12, esportes: 12, foto: 15, logica: 15, conflitos: 38 },
  prime: { mapa: 13, bandeiras: 8, mundo: 11, cultura: 10, esportes: 10, foto: 13, logica: 13, conflitos: 34 },
};
export const temposDoDia = (date: string = todayBR()): Tempos =>
  date >= NOVOS_DESDE ? TEMPOS_NOVOS : date >= FOTO_DESDE ? TEMPOS_COM_FOTO : TEMPOS_INICIAIS;
export const timerFor = (level: LevelId, mod: ModuleId, date: string = todayBR()) => temposDoDia(date)[level][mod];

export const ROUNDS_PER_MODULE = 3;

/** O Prime do dia libera com 60% da pontuação bruta máxima no Estagiário do mesmo dia. */
export const PRIME_FRACTION = 0.6;

export interface ModuleInfo { id: ModuleId; nome: string; numero: number; chamada: string; temas: string }

/** Ordem fixa: começa no mapa e termina nas guerras. */
export const MODULES: ModuleInfo[] = [
  { id: 'mapa', nome: 'Mapa', numero: 1, chamada: 'Clique onde fica. Quanto mais perto, mais pontos.', temas: 'Países, capitais e cidades' },
  { id: 'bandeiras', nome: 'Bandeiras', numero: 2, chamada: 'Reconheça a bandeira antes que o tempo acabe.', temas: 'Bandeiras do mundo' },
  { id: 'mundo', nome: 'Mundo hoje', numero: 3, chamada: 'Moedas, líderes do G20 e religiões.', temas: 'Moedas, líderes e religiões' },
  { id: 'cultura', nome: 'Cultura', numero: 4, chamada: 'Filosofia, arte e cultura pop.', temas: 'Filosofia, arte e cultura pop' },
  { id: 'esportes', nome: 'Esportes', numero: 5, chamada: 'Futebol, Olimpíadas, tênis, F1, lutas, NBA e NFL.', temas: 'Futebol, Olimpíadas, tênis, F1, boxe, MMA, NBA e NFL' },
  { id: 'foto', nome: 'Foto', numero: 6, chamada: 'Em que ano esta foto foi tirada? Arraste a linha do tempo até o ano.', temas: 'Fotografias de 1900 a 2026' },
  { id: 'logica', nome: 'Lógica', numero: 7, chamada: 'Descubra a regra e responda rápido.', temas: 'Sequências, formas e raciocínio' },
  { id: 'conflitos', nome: 'Guerras', numero: 8, chamada: 'Descubra o conflito pelas pistas e diga quem lutou com quem.', temas: 'Guerras e conflitos' },
];
export const MODULE = Object.fromEntries(MODULES.map((m) => [m.id, m])) as Record<ModuleId, ModuleInfo>;

/** Módulos do Desafio (e das partidas livres) numa data: o Foto só a partir de FOTO_DESDE; Esportes e Lógica, de NOVOS_DESDE. */
export const modulosDoDia = (date: string = todayBR()): ModuleInfo[] =>
  MODULES.filter((m) => !DESDE[m.id] || date >= DESDE[m.id]!).map((m, i) => ({ ...m, numero: i + 1 }));

export const maxRaw = (date: string = todayBR()) => modulosDoDia(date).length * ROUNDS_PER_MODULE * 1000;
// VITE_LIMIAR_TESTE só existe em builds de teste (para exercitar o desbloqueio sem jogar perfeito).
const LIMIAR_TESTE = Number(ENV.VITE_LIMIAR_TESTE ?? NaN);
export const primeMinRaw = (date: string = todayBR()) =>
  Number.isFinite(LIMIAR_TESTE) ? LIMIAR_TESTE : Math.round(maxRaw(date) * PRIME_FRACTION);
