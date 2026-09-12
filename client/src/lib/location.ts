export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Locatable {
  coordenadas?: Coordinates | null;
}

const EARTH_RADIUS_KM = 6371;

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

/** Distancia geográfica entre dos puntos mediante Haversine. */
export function distanceKm(a: Coordinates, b: Coordinates): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/** Devuelve la ciudad más cercana a la ubicación del visitante. */
export function findNearestCity<T extends Locatable>(
  point: Coordinates,
  cities: T[],
): T | undefined {
  let nearest: T | undefined;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const city of cities) {
    const coordinates = city.coordenadas;
    if (!coordinates || (!coordinates.lat && !coordinates.lng)) continue;
    const distance = distanceKm(point, coordinates);
    if (distance < nearestDistance) {
      nearest = city;
      nearestDistance = distance;
    }
  }

  return nearest;
}

/** Ordena de cerca a lejos; conserva al final los elementos sin coordenadas. */
export function sortByDistance<T extends Locatable>(
  items: T[],
  point: Coordinates,
): T[] {
  return [...items].sort((a, b) => {
    const da = a.coordenadas ? distanceKm(point, a.coordenadas) : Number.POSITIVE_INFINITY;
    const db = b.coordenadas ? distanceKm(point, b.coordenadas) : Number.POSITIVE_INFINITY;
    return da - db;
  });
}
