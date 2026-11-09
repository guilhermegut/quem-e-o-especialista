// localStorage sempre protegido: pode falhar (modo privado, iframe, cota) sem derrubar o jogo.
import { primeMinRaw, type LevelId, type ModuleId } from './levels';

const PREFIX = 'geoduelo:';
const memory = new Map<string, string>();

function get(key: string): string | null {
  try { return window.localStorage.getItem(PREFIX + key); } catch { return memory.get(key) ?? null; }
}
function set(key: string, value: string) {
  try { window.localStorage.setItem(PREFIX + key, value); } catch { memory.set(key, value); }
}
function readJSON<T>(key: string, fallback: T): T {
  try { const v = get(key); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
}

/** Acesso genérico para estados da interface (partida em andamento). */
export const lerJSON = readJSON;
export const gravarJSON = (key: string, value: unknown) => set(key, JSON.stringify(value));
export function apagar(key: string) {
  try { window.localStorage.removeItem(PREFIX + key); } catch { memory.delete(key); }
}

// ---------- Desafio do Dia: só a primeira tentativa conta ----------
export interface RoundResult { mod: ModuleId; precision: number; raw: number; detail: string }
export interface DailyRecord { score: number; rounds: RoundResult[]; finishedAt: string }

const dailyKey = (date: string, level: LevelId) => `diario:${date}:${level}`;
export const getDaily = (date: string, level: LevelId) => readJSON<DailyRecord | null>(dailyKey(date, level), null);
export const saveDailyIfFirst = (date: string, level: LevelId, rec: DailyRecord) => {
  if (getDaily(date, level)) return false;
  set(dailyKey(date, level), JSON.stringify(rec));
  return true;
};
/** Marca a tentativa no início da partida: abandonar no meio não libera nova tentativa ranqueada. */
export const startDaily = (date: string, level: LevelId) => {
  if (!get(`${dailyKey(date, level)}:inicio`)) set(`${dailyKey(date, level)}:inicio`, new Date().toISOString());
};
export const dailyStarted = (date: string, level: LevelId) => Boolean(get(`${dailyKey(date, level)}:inicio`));
/** Segundos entre o início e o fim da tentativa ranqueada, limitados ao que o ranking aceita. */
export const dailyDuracao = (date: string, level: LevelId): number | null => {
  const ini = get(`${dailyKey(date, level)}:inicio`);
  const rec = getDaily(date, level);
  if (!ini || !rec) return null;
  const s = Math.round((Date.parse(rec.finishedAt) - Date.parse(ini)) / 1000);
  return Number.isFinite(s) ? Math.min(10800, Math.max(30, s)) : null;
};

/** O Prime do dia libera quando a tentativa ranqueada do Estagiário fez ao menos PRIME_MIN_RAW pontos brutos. */
export const rawOf = (rec: DailyRecord | null) => (rec ? rec.rounds.reduce((a, r) => a + r.raw, 0) : 0);
export const primeLiberado = (date: string) => rawOf(getDaily(date, 'estagiario')) >= primeMinRaw(date);

// ---------- Memória de exposição (treino) ----------
const EXPOSURE_MAX = 400;
const EXPOSURE_DAYS = 7;
type Exposure = [string, number][];

export function recentExposure(mod: ModuleId): Set<string> {
  const cutoff = Date.now() - EXPOSURE_DAYS * 86400000;
  return new Set(readJSON<Exposure>(`exposicao:${mod}`, []).filter(([, t]) => t > cutoff).map(([k]) => k));
}
export function recordExposure(mod: ModuleId, keys: string[]) {
  const now = Date.now();
  const list = readJSON<Exposure>(`exposicao:${mod}`, []).filter(([k]) => !keys.includes(k));
  set(`exposicao:${mod}`, JSON.stringify([...list, ...keys.map((k) => [k, now] as [string, number])].slice(-EXPOSURE_MAX)));
}

// ---------- Preferências ----------
export type Tema = 'sistema' | 'claro' | 'escuro';
export interface Settings { nome: string; nivel: LevelId; som: boolean; tema: Tema }
const DEFAULTS: Settings = { nome: '', nivel: 'estagiario', som: true, tema: 'sistema' };
export const getSettings = (): Settings => {
  const s = { ...DEFAULTS, ...readJSON<Partial<Settings>>('preferencias', {}) };
  // Níveis antigos (Observador, Analista, Estrategista) viram Estagiário.
  if (s.nivel !== 'estagiario' && s.nivel !== 'prime') s.nivel = 'estagiario';
  return s;
};
export const saveSettings = (s: Partial<Settings>) => set('preferencias', JSON.stringify({ ...getSettings(), ...s }));

// ---------- Nível do treino adaptativo ----------
export const getTrainingLevel = (mod: ModuleId): LevelId | null => {
  const l = readJSON<string | null>(`treino:${mod}`, null);
  return l === 'estagiario' || l === 'prime' ? l : null;
};
export const saveTrainingLevel = (mod: ModuleId, l: LevelId) => set(`treino:${mod}`, JSON.stringify(l));
