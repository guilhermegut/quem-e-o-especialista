import { geoContains } from 'd3-geo';
import type { Feature, Geometry, Position } from 'geojson';

export type LonLat = [number, number];
const R = 6371.0088;
const rad = (d: number) => (d * Math.PI) / 180;

export function haversineKm([lon1, lat1]: LonLat, [lon2, lat2]: LonLat): number {
  const a = Math.sin(rad(lat2 - lat1) / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

function eachVertex(g: Geometry, fn: (p: Position) => void) {
  switch (g.type) {
    case 'Polygon': g.coordinates.forEach((ring) => ring.forEach(fn)); break;
    case 'MultiPolygon': g.coordinates.forEach((poly) => poly.forEach((ring) => ring.forEach(fn))); break;
    case 'GeometryCollection': g.geometries.forEach((x) => eachVertex(x, fn)); break;
    default: break;
  }
}

/** Distância do clique ao país: zero se cair dentro; senão, até o vértice de fronteira mais próximo (escala 1:50m). */
export function distanceToFeature(pt: LonLat, f: Feature<Geometry>): { km: number; nearest: LonLat } {
  if (geoContains(f, pt)) return { km: 0, nearest: pt };
  let best = Infinity;
  let nearest: LonLat = pt;
  eachVertex(f.geometry, (p) => {
    const d = haversineKm(pt, [p[0], p[1]]);
    if (d < best) { best = d; nearest = [p[0], p[1]]; }
  });
  return { km: best, nearest };
}

export const formatKm = (km: number) =>
  km < 1 ? 'menos de 1 km' : `${Math.round(km).toLocaleString('pt-BR')} km`;
