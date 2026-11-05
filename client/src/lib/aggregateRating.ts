/** Emitir valoraciones únicamente con datos completos y válidos. */
export function aggregateRating(value: unknown, count: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 1 || value > 5 || typeof count !== 'number' || !Number.isSafeInteger(count) || count <= 0) return undefined;
  return { '@type': 'AggregateRating', ratingValue: value, reviewCount: count, bestRating: 5 };
}
