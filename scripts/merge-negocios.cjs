/**
 * Merge negocios-scraped.json con negocios.json
 *
 * - Elimina campos extra de SerpAPI (web, thumbnail, price_level, data_id, place_id)
 * - Deduplica por slug
 * - Ordena por categoría → ciudad → valoración (desc)
 * - Genera estadísticas
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'client', 'src', 'data');

const existingFile = path.join(DATA_DIR, 'negocios.json');
const scrapedFile = path.join(DATA_DIR, 'negocios-scraped.json');
const outputFile = path.join(DATA_DIR, 'negocios.json');
const backupFile = path.join(DATA_DIR, 'negocios-backup.json');

// Cargar datos
const existing = JSON.parse(fs.readFileSync(existingFile, 'utf8'));
const scraped = JSON.parse(fs.readFileSync(scrapedFile, 'utf8'));

console.log(`📂 Negocios existentes: ${existing.length}`);
console.log(`🆕 Negocios scrapeados: ${scraped.length}`);

// Backup del archivo original
fs.writeFileSync(backupFile, JSON.stringify(existing, null, 2), 'utf8');
console.log(`💾 Backup guardado en: negocios-backup.json`);

// Limpiar scraped: quitar campos extra y normalizar formato
function cleanNegocio(n) {
  return {
    nombre: n.nombre || '',
    slug: n.slug || '',
    categoria_slug: n.categoria_slug || '',
    ciudad_slug: n.ciudad_slug || '',
    barrio_slug: n.barrio_slug || '',
    direccion: n.direccion || '',
    telefono: n.telefono || '',
    horario: n.horario || '',
    coordenadas: n.coordenadas || { lat: 0, lng: 0 },
    valoracion_media: n.valoracion_media || 0,
    num_resenas: n.num_resenas || 0,
    servicios_destacados: n.servicios_destacados || [],
    url_google_maps: n.url_google_maps || '',
    // Campos opcionales útiles
    ...(n.web ? { web: n.web } : {}),
  };
}

// Merge: existentes tienen prioridad (datos curados a mano)
const slugMap = new Map();

// Primero los existentes (prioridad)
for (const neg of existing) {
  slugMap.set(neg.slug, neg);
}

// Luego los scrapeados (solo si no existen)
let added = 0;
let skipped = 0;
for (const neg of scraped) {
  const cleaned = cleanNegocio(neg);

  // Saltar si no tiene datos mínimos
  if (!cleaned.nombre || !cleaned.direccion || !cleaned.categoria_slug) {
    skipped++;
    continue;
  }

  // Saltar si valoración es 0 (negocio sin reseñas reales)
  if (cleaned.valoracion_media === 0 && cleaned.num_resenas === 0) {
    skipped++;
    continue;
  }

  if (!slugMap.has(cleaned.slug)) {
    slugMap.set(cleaned.slug, cleaned);
    added++;
  } else {
    skipped++;
  }
}

// Convertir a array y ordenar
const merged = Array.from(slugMap.values());
merged.sort((a, b) => {
  // Primero por categoría
  if (a.categoria_slug !== b.categoria_slug) return a.categoria_slug.localeCompare(b.categoria_slug);
  // Luego por ciudad
  if (a.ciudad_slug !== b.ciudad_slug) return a.ciudad_slug.localeCompare(b.ciudad_slug);
  // Luego por valoración descendente
  return (b.valoracion_media || 0) - (a.valoracion_media || 0);
});

// Guardar
fs.writeFileSync(outputFile, JSON.stringify(merged, null, 2), 'utf8');

console.log(`\n═══════════════════════════════════════════`);
console.log(`✅ Merge completado!`);
console.log(`📊 Total final: ${merged.length} negocios`);
console.log(`🆕 Añadidos del scraping: ${added}`);
console.log(`⏭️  Saltados (duplicados/sin datos): ${skipped}`);
console.log(`💾 Guardado en: negocios.json`);

// Stats por categoría
const catStats = {};
for (const n of merged) {
  catStats[n.categoria_slug] = (catStats[n.categoria_slug] || 0) + 1;
}
console.log(`\n📊 Por categoría:`);
Object.entries(catStats).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
  console.log(`   ${cat}: ${count}`);
});

// Stats por ciudad
const cityStats = {};
for (const n of merged) {
  cityStats[n.ciudad_slug] = (cityStats[n.ciudad_slug] || 0) + 1;
}
console.log(`\n📊 Por ciudad:`);
Object.entries(cityStats).sort((a, b) => b[1] - a[1]).forEach(([city, count]) => {
  console.log(`   ${city}: ${count}`);
});
