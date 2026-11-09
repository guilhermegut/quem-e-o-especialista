import countriesRaw from './countries.json';
import citiesRaw from './cities.json';
import similarRaw from './flag-similar.json';
import meta from './meta.json';

export interface Country {
  cc: string;
  n3: string;
  n: string; // nome pt-BR (CLDR)
  un: number;
  known: number;
  poly: number;
  reg: string | null;
  cap: number | null; // cityId da capital (GeoNames PPLC)
  pop: number | null; // estimativa CLDR
  area: number | null; // km², world-countries
}

export interface City { id: number; n: string; cc: string; lat: number; lon: number; pop: number; cap: boolean; amb: boolean; /** sem rótulo de país (soberania contestada) */ nc: boolean }

export const CONTENT_VERSION: string = meta.contentVersion;
export const DATA_VERSIONS: Record<string, string> = meta.versions;

export const COUNTRIES = countriesRaw as Country[];
export const COUNTRY = new Map(COUNTRIES.map((c) => [c.cc, c]));
export const COUNTRY_BY_N3 = new Map(COUNTRIES.map((c) => [c.n3, c]));

export const CITIES: City[] = (citiesRaw as (string | number)[][]).map(([id, n, cc, lat, lon, pop, cap, amb, nc]) => ({
  id: id as number, n: n as string, cc: cc as string, lat: lat as number, lon: lon as number, pop: pop as number, cap: cap === 1, amb: amb === 1, nc: nc === 1,
}));
export const CITY = new Map(CITIES.map((c) => [c.id, c]));

/** Bandeiras mais parecidas: [código, ΔE médio]. */
export const SIMILAR = similarRaw as unknown as Record<string, [string, number][]>;
export const IDENTICAL_DE = 2;

export const countryName = (cc: string) => COUNTRY.get(cc)?.n ?? cc;

let flagsPromise: Promise<Record<string, string>> | null = null;
export const loadFlags = () => (flagsPromise ??= import('./flags.json').then((m) => m.default as Record<string, string>));
