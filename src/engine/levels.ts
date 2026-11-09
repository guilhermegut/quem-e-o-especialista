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

export type ModuleId = 'mapa' | 'bandeiras' | 'mundo' | 'cultura' | 'conflitos';

/**
 * Segundos por rodada. Com 3 rodadas por módulo, o tempo máximo de resposta é de 4 min 18 s no Estagiário e
 * 3 min 45 s no Prime; somando revelações e vinhetas, a partida fica em até 5 minutos por nível.
 */
export const TIMERS: Record<LevelId, Record<ModuleId, number>> = {
  estagiario: { mapa: 18, bandeiras: 10, mundo: 14, cultura: 14, conflitos: 30 },
  prime: { mapa: 15, bandeiras: 9, mundo: 12, cultura: 12, conflitos: 27 },
};
export const timerFor = (level: LevelId, mod: ModuleId) => TIMERS[level][mod];

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
  { id: 'conflitos', nome: 'Guerras', numero: 5, chamada: 'Descubra o conflito pelas pistas e diga quem lutou com quem.', temas: 'Guerras e conflitos' },
];
export const MODULE = Object.fromEntries(MODULES.map((m) => [m.id, m])) as Record<ModuleId, ModuleInfo>;

export const MAX_RAW = MODULES.length * ROUNDS_PER_MODULE * 1000;
// VITE_LIMIAR_TESTE só existe em builds de teste (para exercitar o desbloqueio sem jogar perfeito).
const LIMIAR_TESTE = Number((import.meta as { env?: Record<string, string | undefined> }).env?.VITE_LIMIAR_TESTE ?? NaN);
export const PRIME_MIN_RAW = Number.isFinite(LIMIAR_TESTE) ? LIMIAR_TESTE : Math.round(MAX_RAW * PRIME_FRACTION);
