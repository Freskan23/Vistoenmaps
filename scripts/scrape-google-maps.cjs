/**
 * Script de Scraping: Google Maps → Negocios via SerpAPI
 *
 * Busca negocios reales en Google Maps por categoría + ciudad
 * y los guarda en formato compatible con negocios.json
 *
 * Uso:
 *   node scripts/scrape-google-maps.cjs                    # Todas las categorías y ciudades
 *   node scripts/scrape-google-maps.cjs --categoria cerrajeros  # Solo cerrajeros
 *   node scripts/scrape-google-maps.cjs --ciudad madrid         # Solo Madrid
 *   node scripts/scrape-google-maps.cjs --limit 5               # Max 5 búsquedas (para testear)
 *   node scripts/scrape-google-maps.cjs --dry-run               # Solo muestra qué buscaría
 *
 * Plan gratuito SerpAPI: 100 búsquedas/mes
 * 20 categorías × 5 ciudades = 100 búsquedas (exacto)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ─── Config ───────────────────────────────────────────────────────────────
const SERPAPI_KEY = process.env.SERPAPI_KEY || '3994017e79958b07c191dd0920091f6ff78a3801aacf4cbd57117fc85070e2f5';
const DATA_DIR = path.join(__dirname, '..', 'client', 'src', 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'negocios-scraped.json');
const LOG_FILE = path.join(__dirname, 'scrape-log.json');

// ─── Datos del proyecto ────────────────────────────────────────────────────
const ciudades = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'ciudades.json'), 'utf8'));
const barrios = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'barrios.json'), 'utf8'));
const categorias = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'categorias.json'), 'utf8'));

// Mapeo de categoría slug → término de búsqueda en Google Maps (español)
const SEARCH_TERMS = {
  'cerrajeros': 'cerrajeros',
  'fontaneros': 'fontaneros',
  'electricistas': 'electricistas',
  'pintores': 'pintores casa',
  'limpieza': 'empresa limpieza',
  'reformas': 'reformas integrales',
  'dentistas': 'dentista clínica dental',
  'fisioterapeutas': 'fisioterapeuta',
  'veterinarios': 'veterinario clínica veterinaria',
  'farmacias': 'farmacia',
  'psicologos': 'psicólogo',
  'gimnasios': 'gimnasio',
  'cines': 'cine',
  'teatros': 'teatro',
  'parques': 'parque',
  'turismo': 'oficina turismo',
  'restaurantes': 'restaurante',
  'bares': 'bar tapas',
  'cafeterias': 'cafetería',
  'comida-rapida': 'comida rápida hamburguesería pizzería',
};

// ─── Helpers ──────────────────────────────────────────────────────────────

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function findClosestBarrio(lat, lng, ciudadSlug) {
  const barriosCiudad = barrios.filter(b => b.ciudad_slug === ciudadSlug);
  if (barriosCiudad.length === 0) return 'centro';

  let closest = barriosCiudad[0];
  let minDist = Infinity;

  for (const barrio of barriosCiudad) {
    const dist = Math.sqrt(
      Math.pow(barrio.coordenadas.lat - lat, 2) +
      Math.pow(barrio.coordenadas.lng - lng, 2)
    );
    if (dist < minDist) {
      minDist = dist;
      closest = barrio;
    }
  }

  return closest.slug;
}

function serpApiRequest(query, lat, lng) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      engine: 'google_maps',
      q: query,
      ll: `@${lat},${lng},14z`,
      type: 'search',
      hl: 'es',
      api_key: SERPAPI_KEY,
    });

    const url = `https://serpapi.com/search.json?${params.toString()}`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) {
            reject(new Error(`SerpAPI error: ${json.error}`));
          } else {
            resolve(json);
          }
        } catch (e) {
          reject(new Error(`JSON parse error: ${e.message}`));
        }
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

function mapToNegocio(place, categoriaSlug, ciudadSlug) {
  const lat = place.gps_coordinates?.latitude;
  const lng = place.gps_coordinates?.longitude;
  const nombre = place.title || '';

  if (!nombre || !lat || !lng) return null;

  const barrioSlug = findClosestBarrio(lat, lng, ciudadSlug);
  const slug = slugify(`${nombre}-${ciudadSlug}`);

  // Extraer servicios de los types/categories de Google Maps
  const servicios = [];
  if (place.type) servicios.push(place.type);
  if (place.types) {
    place.types.slice(0, 3).forEach(t => {
      if (!servicios.includes(t)) servicios.push(t);
    });
  }

  return {
    nombre: nombre,
    slug: slug,
    categoria_slug: categoriaSlug,
    ciudad_slug: ciudadSlug,
    barrio_slug: barrioSlug,
    direccion: place.address || '',
    telefono: place.phone || '',
    horario: place.operating_hours?.summary || place.hours || '',
    coordenadas: { lat, lng },
    valoracion_media: place.rating || 0,
    num_resenas: place.reviews || 0,
    servicios_destacados: servicios,
    url_google_maps: place.link || place.place_id_search
      ? `https://www.google.com/maps/place/?q=place_id:${place.place_id}`
      : '',
    // Campos extra de SerpAPI
    web: place.website || '',
    thumbnail: place.thumbnail || '',
    price_level: place.price || '',
    data_id: place.data_id || '',
    place_id: place.place_id || '',
  };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── CLI Args ─────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1) return null;
  return args[idx + 1] || null;
}
const filterCategoria = getArg('categoria');
const filterCiudad = getArg('ciudad');
const limitSearches = getArg('limit') ? parseInt(getArg('limit')) : null;
const dryRun = args.includes('--dry-run');

// ─── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log('🗺️  Scraper de Google Maps → Visto en Maps');
  console.log('═══════════════════════════════════════════\n');

  // Preparar lista de búsquedas
  const searches = [];

  for (const cat of categorias) {
    if (filterCategoria && cat.slug !== filterCategoria) continue;
    for (const city of ciudades) {
      if (filterCiudad && city.slug !== filterCiudad) continue;

      const searchTerm = SEARCH_TERMS[cat.slug] || cat.nombre.toLowerCase();
      searches.push({
        query: `${searchTerm} en ${city.nombre}`,
        categoriaSlug: cat.slug,
        categoriaNombre: cat.nombre,
        ciudadSlug: city.slug,
        ciudadNombre: city.nombre,
        lat: city.coordenadas.lat,
        lng: city.coordenadas.lng,
      });
    }
  }

  const totalSearches = limitSearches ? Math.min(searches.length, limitSearches) : searches.length;

  console.log(`📋 Búsquedas planificadas: ${totalSearches} de ${searches.length} posibles`);
  console.log(`💰 Coste: ${totalSearches} de 100 búsquedas gratuitas/mes\n`);

  if (dryRun) {
    console.log('🔍 Modo DRY RUN — solo mostrando búsquedas:\n');
    searches.slice(0, totalSearches).forEach((s, i) => {
      console.log(`  ${i + 1}. "${s.query}" → ${s.categoriaSlug} / ${s.ciudadSlug}`);
    });
    console.log(`\n✅ Total: ${totalSearches} búsquedas. Quita --dry-run para ejecutar.`);
    return;
  }

  // Cargar negocios existentes si el archivo ya existe
  let allNegocios = [];
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      allNegocios = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
      console.log(`📂 Cargados ${allNegocios.length} negocios existentes de scrapes previos\n`);
    } catch (e) {
      console.log('⚠️  Error leyendo archivo existente, empezando de cero\n');
    }
  }

  const existingSlugs = new Set(allNegocios.map(n => n.slug));
  const log = {
    timestamp: new Date().toISOString(),
    searches: [],
    totalNew: 0,
    totalDuplicates: 0,
    errors: [],
  };

  let searchCount = 0;

  for (const search of searches) {
    if (limitSearches && searchCount >= limitSearches) break;
    searchCount++;

    const progress = `[${searchCount}/${totalSearches}]`;
    console.log(`${progress} 🔍 Buscando: "${search.query}"`);

    try {
      const result = await serpApiRequest(
        search.query,
        search.lat,
        search.lng
      );

      const places = result.local_results || [];
      let newCount = 0;
      let dupCount = 0;

      for (const place of places) {
        const negocio = mapToNegocio(place, search.categoriaSlug, search.ciudadSlug);
        if (!negocio) continue;

        if (existingSlugs.has(negocio.slug)) {
          dupCount++;
          continue;
        }

        allNegocios.push(negocio);
        existingSlugs.add(negocio.slug);
        newCount++;
      }

      console.log(`       ✅ ${places.length} resultados → ${newCount} nuevos, ${dupCount} duplicados`);

      log.searches.push({
        query: search.query,
        categoria: search.categoriaSlug,
        ciudad: search.ciudadSlug,
        results: places.length,
        new: newCount,
        duplicates: dupCount,
      });
      log.totalNew += newCount;
      log.totalDuplicates += dupCount;

      // Esperar 2s entre búsquedas para no saturar
      if (searchCount < totalSearches) {
        await sleep(2000);
      }

    } catch (error) {
      console.log(`       ❌ Error: ${error.message}`);
      log.errors.push({
        query: search.query,
        error: error.message,
      });
    }
  }

  // Guardar resultados
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allNegocios, null, 2), 'utf8');
  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2), 'utf8');

  console.log('\n═══════════════════════════════════════════');
  console.log(`✅ Scraping completado!`);
  console.log(`📊 Total negocios: ${allNegocios.length}`);
  console.log(`🆕 Nuevos esta sesión: ${log.totalNew}`);
  console.log(`🔄 Duplicados saltados: ${log.totalDuplicates}`);
  console.log(`❌ Errores: ${log.errors.length}`);
  console.log(`\n💾 Guardado en: ${OUTPUT_FILE}`);
  console.log(`📝 Log en: ${LOG_FILE}`);

  // Mostrar resumen por ciudad
  console.log('\n📊 Resumen por ciudad:');
  for (const city of ciudades) {
    const count = allNegocios.filter(n => n.ciudad_slug === city.slug).length;
    if (count > 0) console.log(`   ${city.nombre}: ${count} negocios`);
  }

  // Mostrar resumen por categoría
  console.log('\n📊 Resumen por categoría:');
  for (const cat of categorias) {
    const count = allNegocios.filter(n => n.categoria_slug === cat.slug).length;
    if (count > 0) console.log(`   ${cat.nombre}: ${count} negocios`);
  }
}

main().catch(err => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
});
