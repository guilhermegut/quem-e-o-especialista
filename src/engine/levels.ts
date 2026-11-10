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

export type ModuleId = 'mapa' | 'bandeiras' | 'mundo' | 'cultura' | 'foto' | 'conflitos';

// O módulo Foto entra no Desafio do Dia a partir desta data (virada à meia-noite de Brasília).
// VITE_FOTO_DESDE muda a data só em builds de teste.
const ENV = (import.meta as { env?: Record<string, string | undefined> }).env ?? {};
export const FOTO_DESDE = ENV.VITE_FOTO_DESDE ?? '2026-11-11';

type Tempos = Record<LevelId, Record<ModuleId, number>>;
/** Até 09/11/2026. */
const TEMPOS_INICIAIS: Tempos = {
  estagiario: { mapa: 18, bandeiras: 10, mundo: 14, cultura: 14, foto: 12, conflitos: 30 },
  prime: { mapa: 15, bandeiras: 9, mundo: 12, cultura: 12, foto: 10, conflitos: 27 },
};
/** De 10/11/2026: guerras com 25% mais tempo de leitura (30→38 s e 27→34 s). */
const TEMPOS_GUERRAS: Tempos = {
  estagiario: { ...TEMPOS_INICIAIS.estagiario, conflitos: 38 },
  prime: { ...TEMPOS_INICIAIS.prime, conflitos: 34 },
};
/**
 * Com o módulo Foto: os demais módulos cedem alguns segundos para a partida caber em 5 minutos de resposta
 * no Estagiário (100 s × 3 rodadas) e em 4 min 21 s no Prime.
 */
const TEMPOS_COM_FOTO: Tempos = {
  estagiario: { mapa: 15, bandeiras: 9, mundo: 13, cultura: 13, foto: 12, conflitos: 38 },
  prime: { mapa: 13, bandeiras: 8, mundo: 11, cultura: 11, foto: 10, conflitos: 34 },
};
export const temposDoDia = (date: string = todayBR()): Tempos =>
  date >= FOTO_DESDE ? TEMPOS_COM_FOTO : date >= '2026-11-10' ? TEMPOS_GUERRAS : TEMPOS_INICIAIS;
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
  { id: 'cultura', nome: 'Cultura', numero: 4, chamada: 'Esporte, filosofia, arte e cultura pop.', temas: 'Esporte, filosofia, arte e cultura pop' },
  { id: 'foto', nome: 'Foto', numero: 5, chamada: 'Em que ano esta foto foi tirada? Repare nos carros, nas roupas e na própria imagem.', temas: 'Fotografias de 1900 a 2020' },
  { id: 'conflitos', nome: 'Guerras', numero: 6, chamada: 'Descubra o conflito pelas pistas e diga quem lutou com quem.', temas: 'Guerras e conflitos' },
];
export const MODULE = Object.fromEntries(MODULES.map((m) => [m.id, m])) as Record<ModuleId, ModuleInfo>;

/** Módulos do Desafio (e das partidas livres) numa data: o Foto só a partir de FOTO_DESDE. */
export const modulosDoDia = (date: string = todayBR()): ModuleInfo[] =>
  MODULES.filter((m) => m.id !== 'foto' || date >= FOTO_DESDE).map((m, i) => ({ ...m, numero: i + 1 }));

export const maxRaw = (date: string = todayBR()) => modulosDoDia(date).length * ROUNDS_PER_MODULE * 1000;
// VITE_LIMIAR_TESTE só existe em builds de teste (para exercitar o desbloqueio sem jogar perfeito).
const LIMIAR_TESTE = Number(ENV.VITE_LIMIAR_TESTE ?? NaN);
export const primeMinRaw = (date: string = todayBR()) =>
  Number.isFinite(LIMIAR_TESTE) ? LIMIAR_TESTE : Math.round(maxRaw(date) * PRIME_FRACTION);
