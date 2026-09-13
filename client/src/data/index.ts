import categoriasData from "./categorias.json";
import ciudadesData from "./ciudades.json";
import barriosData from "./barrios.json";
import type { Categoria, Ciudad, Barrio, Negocio } from "./types";
import { distanceKm, type Coordinates } from "@/lib/location";
export { superCategorias, getSuperCategoria, getSuperCategoriaForCategoria } from "./superCategorias";

export const categorias: Categoria[] = categoriasData;
export const ciudades: Ciudad[] = ciudadesData;
export const barrios: Barrio[] = barriosData;
/**
 * ⚠️ VACIO A PROPOSITO. NO importar aqui negocios.json: son 20 MB y acaban
 * dentro del codigo de TODAS las paginas (ha pasado dos veces; la web tardaba
 * una eternidad y se quedaba en blanco al entrar).
 *
 * Para leer negocios en el navegador:
 *   - useNegociosCategoria(slug) -> solo esa categoria (~120 KB)
 *   - useNegociosPrincipales()   -> las 12 categorias con mas fichas
 *   - resumen.json               -> totales y rankings ya calculados (88 KB)
 */
export const negocios: Negocio[] = [];

// Helper functions
export function getCategoria(slug: string): Categoria | undefined {
  return categorias.find((c) => c.slug === slug);
}

export function getCiudad(slug: string): Ciudad | undefined {
  return ciudades.find((c) => c.slug === slug);
}

export function getBarrio(slug: string, ciudadSlug: string): Barrio | undefined {
  return barrios.find((b) => b.slug === slug && b.ciudad_slug === ciudadSlug);
}

export function getBarriosByCiudad(ciudadSlug: string): Barrio[] {
  return barrios.filter((b) => b.ciudad_slug === ciudadSlug);
}

export function getNegocio(
  categoriaSlug: string,
  ciudadSlug: string,
  barrioSlug: string,
  negocioSlug: string
): Negocio | undefined {
  return negocios.find(
    (n) =>
      n.categoria_slug === categoriaSlug &&
      n.ciudad_slug === ciudadSlug &&
      n.barrio_slug === barrioSlug &&
      n.slug === negocioSlug
  );
}

/**
 * Orden de listado.
 *
 * PRIMERO LA PERTINENCIA: una ficha cuyo tipo de Google NO corresponde a la
 * categoria (una inmobiliaria colada en "parques") nunca puede salir arriba.
 *
 * DESPUES LA CALIDAD con el campo `peso`, que combina la nota CON el numero de
 * opiniones (promedio bayesiano). Ordenar por nota pura ponia un 5,0 con 4
 * resenas por encima de El Retiro con 208.099, que es justo lo que no sirve a
 * quien busca un sitio al que ir.
 */
export function ordenarNegocios(lista: Negocio[]): Negocio[] {
  return [...lista].sort((a, b) => {
    // 1. fichas descartadas por no pertenecer a la categoria, al final
    const ra = a.categoria_rechazada === true ? 1 : 0;
    const rb = b.categoria_rechazada === true ? 1 : 0;
    if (ra !== rb) return ra - rb;
    // 2. cliente de pago
    const sa = a.super_destacado === true ? 1 : 0;
    const sb = b.super_destacado === true ? 1 : 0;
    if (sa !== sb) return sb - sa;
    const da = a.destacado === true ? 1 : 0;
    const db = b.destacado === true ? 1 : 0;
    if (da !== db) return db - da;
    // 3. categoria confirmada por Google antes que categoria sin confirmar
    const ca = a.categoria_ok === true ? 1 : 0;
    const cb = b.categoria_ok === true ? 1 : 0;
    if (ca !== cb) return cb - ca;
    // 4. calidad real (nota + volumen de opiniones)
    const pa = a.peso ?? 0;
    const pb = b.peso ?? 0;
    if (pb !== pa) return pb - pa;
    return (b.num_resenas ?? 0) - (a.num_resenas ?? 0);
  });
}

export function getNegociosByBarrio(
  categoriaSlug: string,
  ciudadSlug: string,
  barrioSlug: string
): Negocio[] {
  return ordenarNegocios(
    negocios.filter(
      (n) =>
        n.categoria_slug === categoriaSlug &&
        n.ciudad_slug === ciudadSlug &&
        n.barrio_slug === barrioSlug
    )
  );
}

export function getNegociosByCiudad(
  categoriaSlug: string,
  ciudadSlug: string
): Negocio[] {
  return ordenarNegocios(
    negocios.filter(
      (n) => n.categoria_slug === categoriaSlug && n.ciudad_slug === ciudadSlug
    )
  );
}

export function countNegociosByBarrio(
  categoriaSlug: string,
  ciudadSlug: string,
  barrioSlug: string
): number {
  return getNegociosByBarrio(categoriaSlug, ciudadSlug, barrioSlug).length;
}

export function getCiudadesConNegocios(categoriaSlug: string): Ciudad[] {
  const ciudadSlugs = new Set(
    negocios
      .filter((n) => n.categoria_slug === categoriaSlug)
      .map((n) => n.ciudad_slug)
  );
  return ciudades.filter((c) => ciudadSlugs.has(c.slug));
}

export function getBarriosConNegocios(
  categoriaSlug: string,
  ciudadSlug: string
): Barrio[] {
  const barrioSlugs = new Set(
    negocios
      .filter(
        (n) => n.categoria_slug === categoriaSlug && n.ciudad_slug === ciudadSlug
      )
      .map((n) => n.barrio_slug)
  );
  return barrios.filter(
    (b) => b.ciudad_slug === ciudadSlug && barrioSlugs.has(b.slug)
  );
}

export interface SearchResult {
  type: "negocio" | "categoria" | "ciudad" | "barrio";
  label: string;
  sublabel: string;
  href: string;
  coordinates?: Coordinates;
  distanceKm?: number;
}

export function searchDirectory(
  query: string,
  limit = 10,
  allNegocios?: Negocio[],
  userLocation?: Coordinates | null,
): SearchResult[] {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];

  const results: SearchResult[] = [];
  // Si no llega lista, no se buscan negocios: `negocios` esta vacio a proposito.
  const negociosList = allNegocios || [];

  // Search categorias
  for (const cat of categorias) {
    if (cat.nombre.toLowerCase().includes(q) || cat.slug.includes(q)) {
      results.push({
        type: "categoria",
        label: cat.nombre,
        sublabel: "Categoría",
        href: `/${cat.slug}`,
      });
    }
  }

  // Search ciudades
  for (const ciu of ciudades) {
    if (ciu.nombre.toLowerCase().includes(q) || ciu.slug.includes(q)) {
      results.push({
        type: "ciudad",
        label: ciu.nombre,
        sublabel: ciu.comunidad_autonoma,
        href: `/${categorias[0]?.slug}/${ciu.slug}`,
        coordinates: ciu.coordenadas,
      });
    }
  }

  // Search barrios
  for (const bar of barrios) {
    if (bar.nombre.toLowerCase().includes(q) || bar.slug.includes(q)) {
      const ciu = getCiudad(bar.ciudad_slug);
      results.push({
        type: "barrio",
        label: bar.nombre,
        sublabel: ciu?.nombre || bar.ciudad_slug,
        href: `/${categorias[0]?.slug}/${bar.ciudad_slug}/${bar.slug}`,
        coordinates: bar.coordenadas,
      });
    }
  }

  // Search negocios (uses combined list if provided)
  for (const neg of negociosList) {
    if (
      neg.nombre.toLowerCase().includes(q) ||
      neg.servicios_destacados.some((s) => s.toLowerCase().includes(q))
    ) {
      const cat = getCategoria(neg.categoria_slug);
      const ciu = getCiudad(neg.ciudad_slug);
      const bar = getBarrio(neg.barrio_slug, neg.ciudad_slug);
      results.push({
        type: "negocio",
        label: neg.nombre,
        sublabel: `${cat?.nombre || ""} · ${bar?.nombre || ""}, ${ciu?.nombre || ""}`,
        href: `/${neg.categoria_slug}/${neg.ciudad_slug}/${neg.barrio_slug}/${neg.slug}`,
        coordinates: neg.coordenadas,
      });
    }
  }

  if (!userLocation) return results.slice(0, limit);

  // Mantener primero las categorías exactas; dentro del resto, lo más cercano
  // sale antes. Así buscar "fontanero" conserva la categoría y debajo enseña
  // negocios cercanos, no resultados de la otra punta de España.
  const categories = results.filter((result) => result.type === "categoria");
  const locatable = results
    .filter((result) => result.type !== "categoria" && result.coordinates)
    .map((result) => ({
      ...result,
      distanceKm: distanceKm(userLocation, result.coordinates!),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
  const withoutCoordinates = results.filter(
    (result) => result.type !== "categoria" && !result.coordinates,
  );

  return [...categories, ...locatable, ...withoutCoordinates].slice(0, limit);
}
