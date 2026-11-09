import { feature, mesh } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry, MultiLineString } from 'geojson';
import type { Topology, GeometryCollection } from 'topojson-specification';

export interface GeoData {
  land: FeatureCollection<Geometry>;
  borders: MultiLineString;
  countries: Map<string, Feature<Geometry>>; // chave: código numérico ISO 3166-1 (ccn3)
}
/** 110m para a demonstração do menu (leve); 50m na partida, onde a precisão do clique importa. */
export type GeoRes = '110m' | '50m';

const raw: Partial<Record<GeoRes, Promise<[unknown, unknown]>>> = {};
const done: Partial<Record<GeoRes, Promise<GeoData>>> = {};

const fetchRaw = (res: GeoRes) =>
  (raw[res] ??= res === '110m'
    ? Promise.all([import('world-atlas/countries-110m.json'), import('world-atlas/land-110m.json')]).then(([c, l]) => [c.default, l.default] as [unknown, unknown])
    : Promise.all([import('world-atlas/countries-50m.json'), import('world-atlas/land-50m.json')]).then(([c, l]) => [c.default, l.default] as [unknown, unknown]));

/** Só baixa os arquivos, sem processar (para adiantar a partida enquanto o menu está parado). */
export const prefetchGeo = (res: GeoRes) => { void fetchRaw(res); };

export function loadGeo(res: GeoRes = '50m'): Promise<GeoData> {
  done[res] ??= fetchRaw(res).then(([c, l]) => {
    const ct = c as Topology<{ countries: GeometryCollection }>;
    const lt = l as Topology<{ land: GeometryCollection }>;
    const fc = feature(ct, ct.objects.countries) as FeatureCollection<Geometry>;
    const countries = new Map<string, Feature<Geometry>>();
    for (const f of fc.features) if (f.id) countries.set(String(f.id), f);
    return {
      land: feature(lt, lt.objects.land) as FeatureCollection<Geometry>,
      borders: mesh(ct, ct.objects.countries, (a, b) => a !== b) as MultiLineString,
      countries,
    };
  });
  return done[res]!;
}
