import { CITIES, CITY, COUNTRIES, COUNTRY, CONTENT_VERSION, IDENTICAL_DE, SIMILAR, type City } from '../data';
import { dayIndex } from './date';
import { modulosDoDia, ROUNDS_PER_MODULE, type LevelId, type ModuleId } from './levels';
import { todayBR } from './date';
import { FOTOS, fotoRound, type FotoRound } from './fotos';
import { rngFrom, shuffle, type Rng } from './rng';
const pick = <T,>(rng: Rng, arr: T[]) => arr[Math.floor(rng() * arr.length)];
import { TEMAS_CULTURA, TEMAS_MUNDO, quizRound, temaDaKey, temaPool, type QuizRound, type Tema } from './quiz';
import { CONFLITO, conflictItems, conflictRound, type ConflictRound } from './conflitos';

/** Põe nas posições de Lados (2ª e 4ª) conflitos que têm lados cadastrados, sem mudar o conjunto do dia. */
function arrangeConflicts(items: Item[]): Item[] {
  const has = (it: Item) => Boolean(CONFLITO.get(it.key.slice(5))?.lados);
  const com = items.filter(has);
  const sem = items.filter((it) => !has(it));
  const out: Item[] = [];
  for (let i = 0; i < items.length; i++) {
    const querLados = i % 2 === 1;
    const fila = querLados ? (com.length ? com : sem) : (sem.length ? sem : com);
    out.push(fila.shift()!);
  }
  return out;
}

// ---------- Tipos ----------
export type MapTarget = { kind: 'country'; cc: string } | { kind: 'city'; id: number };
export interface MapRound { mod: 'mapa'; key: string; target: MapTarget; showCountry: boolean }
export interface FlagClassic { mod: 'bandeiras'; key: string; variant: 'classico'; answer: string; options: string[] }
export interface FlagReveal { mod: 'bandeiras'; key: string; variant: 'revelacao'; answer: string; options: string[]; focus: [number, number] }
export interface FlagIntruder { mod: 'bandeiras'; key: string; variant: 'intrusa'; pairs: { flag: string; label: string }[]; wrongIndex: number }
export type FlagRound = FlagClassic | FlagReveal | FlagIntruder;
export type Round = MapRound | FlagRound | ConflictRound | QuizRound | FotoRound;
export type { ConflictRound, QuizRound, FotoRound };

export type MatchSpec =
  | { kind: 'daily'; date: string; level: LevelId }
  | { kind: 'free'; seed: string; level: LevelId };

export interface Match { spec: MatchSpec; cv: string; modules: ModuleId[]; rounds: Round[] }

// ---------- Conjuntos de itens por módulo e nível ----------
interface Item { key: string; cc: string }

const cityItem = (c: City): Item => ({ key: `city:${c.id}`, cc: c.cc });
const countryItem = (cc: string): Item => ({ key: `country:${cc}`, cc });

const UN = COUNTRIES.filter((c) => c.un);
const KNOWN = UN.filter((c) => c.known);
/**
 * Territórios que usam oficialmente a bandeira de um membro da ONU ficam fora: ΔE < 8 em relação a um membro
 * (Guadalupe 0, Svalbard 5; o primeiro com bandeira própria é a Polinésia Francesa, 14) e, por lista, a Ilha
 * Bouvet, que usa a bandeira da Noruega mas o flag-icons desenha com outra proporção (ΔE 25).
 */
const TERRITORY_COPY_DE = 8;
const SHARES_SOVEREIGN_FLAG = new Set(['BV']);
const copiesUN = (cc: string) => SHARES_SOVEREIGN_FLAG.has(cc) || (SIMILAR[cc] ?? []).some(([o, d]) => d < TERRITORY_COPY_DE && COUNTRY.get(o)?.un);
const TERRITORIES = COUNTRIES.filter((c) => !c.un && !copiesUN(c.cc));

export function mapPool(level: LevelId): Item[] {
  if (level === 'estagiario') {
    const known = new Set(KNOWN.map((c) => c.cc));
    const countries = KNOWN.filter((c) => c.poly).map((c) => countryItem(c.cc));
    const capitals = CITIES.filter((c) => c.cap && known.has(c.cc)).map(cityItem);
    return [...countries, ...capitals];
  }
  // Prime: capitais dos membros da ONU e cidades com 1 milhão de habitantes ou mais.
  const un = new Set(UN.map((c) => c.cc));
  return CITIES.filter((c) => (c.cap && un.has(c.cc)) || c.pop >= 1_000_000).map(cityItem);
}

export function flagPool(level: LevelId): Item[] {
  const base = level === 'estagiario' ? KNOWN : UN;
  return base.map((c) => ({ key: `flag:${c.cc}`, cc: c.cc }));
}

const quizItems = (tema: Tema, level: LevelId): Item[] => temaPool(tema, level).map((key) => ({ key, cc: key }));
const fotoPool = (): Item[] => FOTOS.map((f) => ({ key: `foto:${f.id}`, cc: f.id }));
const poolFor = (mod: ModuleId, level: LevelId): Item[] =>
  mod === 'mapa' ? mapPool(level) : mod === 'bandeiras' ? flagPool(level) : mod === 'conflitos' ? conflictItems(level) : mod === 'foto' ? fotoPool() : [];
const TEMAS: Partial<Record<ModuleId, Tema[]>> = { mundo: TEMAS_MUNDO, cultura: TEMAS_CULTURA };

/** Rotação sem repetição de um único tema do quiz: um item por dia, o ciclo embaralhado pela seed. */
function dailyQuizItem(tema: Tema, level: LevelId, date: string, cv: string): Item {
  const pool = quizItems(tema, level);
  const idx = Math.max(0, dayIndex(date));
  const order = shuffle(rngFrom(`${cv}|${level}|quiz|${tema}|ciclo${Math.floor(idx / pool.length)}`), pool);
  return order[idx % pool.length];
}

/** Agrupa a ordem em grupos de 5 sem dois itens do mesmo país (evita "Brasil" e "Brasília" na mesma partida). */
function groupsUpTo(order: Item[], upTo: number): Item[][] {
  const rest = order.slice();
  const groups: Item[][] = [];
  while (groups.length <= upTo && rest.length >= ROUNDS_PER_MODULE) {
    const g: Item[] = [];
    for (let i = 0; i < rest.length && g.length < ROUNDS_PER_MODULE; ) {
      if (g.some((x) => x.cc === rest[i].cc)) { i++; continue; }
      g.push(rest.splice(i, 1)[0]);
    }
    // Fim de ciclo sem combinação possível: completa sem a restrição de país.
    while (g.length < ROUNDS_PER_MODULE) g.push(rest.shift()!);
    groups.push(g);
  }
  return groups;
}

/**
 * Desafio do Dia: rotação sem repetição. A cada ciclo o conjunto inteiro é embaralhado pela seed
 * e dividido em grupos diários; um item só volta depois que todos os outros saíram.
 */
export function dailyItems(mod: ModuleId, level: LevelId, date: string, cv = CONTENT_VERSION): Item[] {
  const temas = TEMAS[mod];
  if (temas) {
    const rng = rngFrom(`${cv}|${date}|${level}|${mod}|ordem`);
    return shuffle(rng, temas).slice(0, ROUNDS_PER_MODULE).map((t) => dailyQuizItem(t, level, date, cv));
  }
  if (mod === 'foto') {
    // Estagiário e Prime do mesmo dia nunca repetem foto: os dois níveis andam juntos na mesma ordem.
    const pool = fotoPool();
    const porDia = ROUNDS_PER_MODULE * 2;
    const perCycleF = Math.floor(pool.length / porDia);
    const idxF = Math.max(0, dayIndex(date));
    const order = shuffle(rngFrom(`${cv}|foto|ciclo${Math.floor(idxF / perCycleF)}`), pool);
    const ini = (idxF % perCycleF) * porDia + (level === 'prime' ? ROUNDS_PER_MODULE : 0);
    return order.slice(ini, ini + ROUNDS_PER_MODULE);
  }
  const pool = poolFor(mod, level);
  const perCycle = Math.floor(pool.length / ROUNDS_PER_MODULE);
  const idx = Math.max(0, dayIndex(date));
  const cycle = Math.floor(idx / perCycle);
  const pos = idx % perCycle;
  const order = shuffle(rngFrom(`${cv}|${level}|${mod}|ciclo${cycle}`), pool);
  return groupsUpTo(order, pos)[pos];
}

/** Partida livre (duelo e treino): sorteio pela seed, com exclusão opcional do que a pessoa viu há pouco. */
export function freeItems(mod: ModuleId, level: LevelId, rng: Rng, avoid: Set<string> = new Set()): Item[] {
  const temas = TEMAS[mod];
  if (temas) {
    return shuffle(rng, temas).slice(0, ROUNDS_PER_MODULE).map((t) => {
      const pool = quizItems(t, level);
      const fresh = pool.filter((it) => !avoid.has(it.key));
      return pick(rng, fresh.length ? fresh : pool);
    });
  }
  const pool = poolFor(mod, level);
  const fresh = pool.filter((it) => !avoid.has(it.key));
  const order = shuffle(rng, fresh.length >= ROUNDS_PER_MODULE * 4 ? fresh : pool);
  return groupsUpTo(order, 0)[0];
}

// ---------- Detalhes das rodadas ----------
function distractorsSimilar(rng: Rng, answer: string, allowed: Set<string>, n: number, top = 8): string[] {
  const near = (SIMILAR[answer] ?? []).filter(([cc, d]) => d >= IDENTICAL_DE && allowed.has(cc)).slice(0, top).map(([cc]) => cc);
  const picked = shuffle(rng, near).slice(0, n);
  const rest = shuffle(rng, [...allowed].filter((cc) => cc !== answer && !picked.includes(cc)));
  while (picked.length < n && rest.length) picked.push(rest.pop()!);
  return picked;
}

function flagRound(rng: Rng, item: Item, level: LevelId, variant: FlagRound['variant']): FlagRound {
  const answer = item.cc;
  if (level === 'estagiario') {
    const allowed = KNOWN.map((c) => c.cc).filter((cc) => cc !== answer);
    const options = shuffle(rng, [answer, ...shuffle(rng, allowed).slice(0, 3)]);
    return { mod: 'bandeiras', key: item.key, variant: 'classico', answer, options };
  }
  const allowed = new Set(flagPool(level).map((i) => i.cc));
  if (variant === 'intrusa') {
    // Quatro pares bandeira–nome; em um deles o nome é de um país de bandeira parecida.
    const others = shuffle(rng, [...allowed].filter((cc) => cc !== answer)).slice(0, 3);
    const flags = shuffle(rng, [answer, ...others]);
    const wrongIndex = flags.indexOf(answer);
    const decoy = distractorsSimilar(rng, answer, new Set([...allowed].filter((cc) => !flags.includes(cc))), 1, 4)[0];
    const pairs = flags.map((f, i) => ({ flag: f, label: i === wrongIndex ? decoy : f }));
    return { mod: 'bandeiras', key: item.key, variant: 'intrusa', pairs, wrongIndex };
  }
  const options = shuffle(rng, [answer, ...distractorsSimilar(rng, answer, allowed, 3)]);
  if (variant === 'revelacao') {
    const focus: [number, number] = [0.3 + rng() * 0.4, 0.3 + rng() * 0.4];
    return { mod: 'bandeiras', key: item.key, variant: 'revelacao', answer, options, focus };
  }
  return { mod: 'bandeiras', key: item.key, variant: 'classico', answer, options };
}

function flagVariants(rng: Rng, level: LevelId): FlagRound['variant'][] {
  if (level === 'prime') return shuffle(rng, ['classico', 'classico', 'revelacao']);
  return Array(ROUNDS_PER_MODULE).fill('classico');
}

function mapRound(item: Item, level: LevelId): MapRound {
  const [kind, id] = item.key.split(':');
  const target: MapTarget = kind === 'country' ? { kind: 'country', cc: id } : { kind: 'city', id: Number(id) };
  // País entre parênteses nas cidades, nos dois níveis (exceto onde a soberania é contestada).
  const city = target.kind === 'city' ? CITY.get(target.id) : undefined;
  void level;
  const showCountry = Boolean(city) && !city!.nc;
  return { mod: 'mapa', key: item.key, target, showCountry };
}

export function buildRounds(mod: ModuleId, level: LevelId, items: Item[], rng: Rng): Round[] {
  if (mod === 'mapa') return items.map((it) => mapRound(it, level));
  if (mod === 'conflitos') return arrangeConflicts(items).map((it, i) => conflictRound(rng, level, it.key.slice(5), i));
  if (mod === 'mundo' || mod === 'cultura') return items.map((it) => quizRound(rng, level, mod, temaDaKey(it.key), it.key));
  if (mod === 'foto') return items.map((it) => fotoRound(rng, level, it.key.slice(5)));
  const variants = flagVariants(rng, level);
  return items.map((it, i) => flagRound(rng, it, level, variants[i]));
}

export const specSeed = (spec: MatchSpec, cv = CONTENT_VERSION) =>
  spec.kind === 'daily' ? `${cv}|diario|${spec.date}|${spec.level}` : `${cv}|livre|${spec.seed}|${spec.level}`;

export function generateMatch(spec: MatchSpec, cv = CONTENT_VERSION): Match {
  const rng = rngFrom(specSeed(spec, cv));
  const modules = modulosDoDia(spec.kind === 'daily' ? spec.date : todayBR()).map((m) => m.id);
  const rounds: Round[] = [];
  for (const mod of modules) {
    const items = spec.kind === 'daily' ? dailyItems(mod, spec.level, spec.date, cv) : freeItems(mod, spec.level, rng);
    rounds.push(...buildRounds(mod, spec.level, items, rngFrom(`${specSeed(spec, cv)}|${mod}`)));
  }
  return { spec, cv, modules, rounds };
}

/** Treino de um módulo: 3 rodadas evitando o que a pessoa viu recentemente. */
export function trainingSet(mod: ModuleId, level: LevelId, seed: string, avoid: Set<string>): Round[] {
  const rng = rngFrom(`${CONTENT_VERSION}|treino|${seed}|${mod}|${level}`);
  return buildRounds(mod, level, freeItems(mod, level, rng, avoid), rng);
}

export const _internals = { groupsUpTo, TERRITORIES };
