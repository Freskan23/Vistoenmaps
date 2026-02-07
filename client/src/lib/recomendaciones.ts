/**
 * Motor de recomendaciones de directorios
 * Analiza la categoria y ubicacion del negocio para recomendar
 * los directorios mas relevantes donde deberian estar listados.
 */

import { directorios, type Directorio } from '@/data/directorios';

export interface Recomendacion {
  directorio: Directorio;
  score: number; // 0-100
  razones: string[];
  prioridad: 'critica' | 'alta' | 'media' | 'baja';
}

// Mapping de categorias de negocio a categorias de directorio relevantes
const CATEGORIA_MAP: Record<string, string[]> = {
  // Servicios del hogar
  'cerrajeros': ['servicios', 'general', 'resenas'],
  'electricistas': ['servicios', 'general', 'resenas'],
  'fontaneros': ['servicios', 'general', 'resenas'],
  'pintores': ['reformas', 'servicios', 'general'],
  'reformas': ['reformas', 'general', 'resenas'],
  'limpieza': ['servicios', 'general'],
  'mudanzas': ['servicios', 'general'],
  'jardineria': ['servicios', 'general'],
  'fumigacion': ['servicios', 'general'],
  'cristaleros': ['reformas', 'servicios'],
  'persianas': ['reformas', 'servicios'],
  'carpinteros': ['reformas', 'servicios'],
  // Salud y bienestar
  'fisioterapeutas': ['servicios', 'general', 'resenas'],
  'dentistas': ['servicios', 'general', 'resenas'],
  'psicologos': ['servicios', 'general', 'resenas'],
  'veterinarios': ['servicios', 'general', 'resenas'],
  'farmacias': ['general', 'resenas'],
  'opticas': ['general', 'resenas'],
  'clinicas': ['servicios', 'general', 'resenas'],
  // Belleza
  'peluquerias': ['servicios', 'general', 'resenas'],
  'barberias': ['servicios', 'general', 'resenas'],
  'estetica': ['servicios', 'general', 'resenas'],
  // Motor
  'talleres-mecanicos': ['servicios', 'general', 'resenas'],
  'autoescuelas': ['servicios', 'general'],
  // Hosteleria
  'restaurantes': ['general', 'resenas'],
  'bares': ['general', 'resenas'],
  'hoteles': ['general', 'resenas'],
  'cafeterias': ['general', 'resenas'],
  // Comercio
  'tiendas': ['general', 'b2b'],
  'supermercados': ['general'],
  'ferreterias': ['general', 'b2b'],
  'papelerias': ['general'],
  // Profesionales
  'abogados': ['servicios', 'general', 'resenas'],
  'gestores': ['servicios', 'general', 'b2b'],
  'asesores': ['servicios', 'b2b', 'general'],
  'arquitectos': ['reformas', 'servicios', 'general'],
  'fotografos': ['servicios', 'general', 'resenas'],
  // Educacion
  'academias': ['servicios', 'general'],
  'profesores': ['servicios', 'general'],
  // Tecnologia
  'informaticos': ['servicios', 'general', 'b2b'],
  'diseno-web': ['servicios', 'b2b'],
  'marketing': ['servicios', 'b2b'],
};

// Directorios que son universalmente importantes (todo negocio deberia estar)
const DIRECTORIOS_CRITICOS = [
  'google-business-profile',
  'paginasamarillas-es',
  'yelp-es',
  'cylex-es',
  'qdq-com',
  'europages-es',
];

// Directorios especificos por tipo de servicio
const DIRECTORIOS_SERVICIOS = [
  'habitissimo-com',
  'cronoshare-com',
  'homeserve-es',
  'mister-minit-es',
  'booksy-com',
  'reparalia-es',
];

const DIRECTORIOS_RESENAS = [
  'trustpilot-com',
  'tripadvisor-es',
  'google-business-profile',
  'yelp-es',
];

const DIRECTORIOS_B2B = [
  'europages-es',
  'kompass-com',
  'axesor-es',
];

// Regiones y sus directorios locales
const REGION_MAP: Record<string, string[]> = {
  // Cataluna
  'barcelona': ['regional'],
  'tarragona': ['regional'],
  'girona': ['regional'],
  'lleida': ['regional'],
  // Galicia
  'vigo': ['regional'],
  'coruna': ['regional'],
  'santiago': ['regional'],
  // Valencia
  'valencia': ['regional'],
  'alicante': ['regional'],
  // Pais Vasco
  'bilbao': ['regional'],
  'san-sebastian': ['regional'],
  'vitoria': ['regional'],
  // Baleares
  'palma-de-mallorca': ['regional'],
  // Madrid
  'madrid': [],
  // Andalucia
  'sevilla': ['regional'],
  'malaga': ['regional'],
  'granada': ['regional'],
};

/**
 * Motor principal de recomendaciones
 * @param categoriaNegocio - slug de la categoria del negocio (ej: 'cerrajeros')
 * @param ciudadNegocio - slug de la ciudad (ej: 'barcelona')
 * @returns Array de recomendaciones ordenado por score descendente
 */
export function getRecomendaciones(
  categoriaNegocio: string,
  ciudadNegocio: string
): Recomendacion[] {
  const recomendaciones: Recomendacion[] = [];

  // Categorias de directorio relevantes para este tipo de negocio
  const categoriasRelevantes = CATEGORIA_MAP[categoriaNegocio] || ['general'];

  for (const dir of directorios) {
    let score = 0;
    const razones: string[] = [];

    // 1. Match por categoria del directorio (0-35 pts)
    if (categoriasRelevantes.includes(dir.categoria)) {
      const idx = categoriasRelevantes.indexOf(dir.categoria);
      const catScore = Math.max(35 - idx * 10, 10);
      score += catScore;
      razones.push(`Relevante para ${categoriaNegocio}`);
    }

    // 2. Popularidad del directorio (0-25 pts)
    score += Math.round(dir.popularidad * 0.25);
    if (dir.popularidad >= 80) {
      razones.push('Directorio muy popular');
    }

    // 3. Premium tier bonus (0-15 pts)
    if (dir.tipo === 'premium') {
      score += 15;
      razones.push('Directorio de referencia');
    } else if (dir.tipo === 'estandar') {
      score += 5;
    }

    // 4. Es critico / universal (0-15 pts)
    if (DIRECTORIOS_CRITICOS.includes(dir.slug)) {
      score += 15;
      razones.push('Imprescindible para SEO local');
    }

    // 5. Match regional (0-10 pts)
    const regionCats = REGION_MAP[ciudadNegocio];
    if (regionCats && regionCats.includes('regional') && dir.categoria === 'regional') {
      score += 10;
      razones.push(`Directorio regional para tu zona`);
    }

    // 6. Permite resenas - bonus si relevante (0-5 pts)
    if (dir.permiteResenas && categoriasRelevantes.includes('resenas')) {
      score += 5;
      razones.push('Permite resenas de clientes');
    }

    // 7. Es gratuito (0-5 pts)
    if (dir.gratis) {
      score += 5;
      razones.push('Registro gratuito');
    }

    // 8. Servicios especificos bonus (0-10 pts)
    if (categoriasRelevantes.includes('servicios') && DIRECTORIOS_SERVICIOS.includes(dir.slug)) {
      score += 10;
      razones.push('Especializado en servicios');
    }

    // 9. B2B bonus
    if (categoriasRelevantes.includes('b2b') && DIRECTORIOS_B2B.includes(dir.slug)) {
      score += 10;
      razones.push('Directorio empresarial B2B');
    }

    // 10. Resenas bonus
    if (categoriasRelevantes.includes('resenas') && DIRECTORIOS_RESENAS.includes(dir.slug)) {
      score += 8;
      razones.push('Plataforma de resenas importante');
    }

    // Cap score at 100
    score = Math.min(score, 100);

    // Solo incluir si tiene alguna relevancia
    if (score >= 15) {
      // Determinar prioridad
      let prioridad: Recomendacion['prioridad'];
      if (score >= 75) prioridad = 'critica';
      else if (score >= 55) prioridad = 'alta';
      else if (score >= 35) prioridad = 'media';
      else prioridad = 'baja';

      recomendaciones.push({
        directorio: dir,
        score,
        razones: razones.slice(0, 3), // Max 3 razones
        prioridad,
      });
    }
  }

  // Ordenar por score descendente
  recomendaciones.sort((a, b) => b.score - a.score);

  return recomendaciones;
}

/**
 * Resumen rapido de recomendaciones para mostrar en el dashboard
 */
export function getResumenRecomendaciones(
  categoriaNegocio: string,
  ciudadNegocio: string
) {
  const recs = getRecomendaciones(categoriaNegocio, ciudadNegocio);

  return {
    total: recs.length,
    criticas: recs.filter(r => r.prioridad === 'critica'),
    altas: recs.filter(r => r.prioridad === 'alta'),
    medias: recs.filter(r => r.prioridad === 'media'),
    bajas: recs.filter(r => r.prioridad === 'baja'),
    gratuitas: recs.filter(r => r.directorio.gratis),
    conResenas: recs.filter(r => r.directorio.permiteResenas),
  };
}
