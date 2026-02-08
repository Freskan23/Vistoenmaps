import categoriasData from "./categorias.json";
import ciudadesData from "./ciudades.json";
import barriosData from "./barrios.json";
import negociosData from "./negocios.json";
import type { Categoria, Ciudad, Barrio, Negocio } from "./types";
export { superCategorias, getSuperCategoria, getSuperCategoriaForCategoria } from "./superCategorias";

export const categorias: Categoria[] = categoriasData;
export const ciudades: Ciudad[] = ciudadesData;
export const barrios: Barrio[] = barriosData;
export const negocios: Negocio[] = negociosData;

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

export function getNegociosByBarrio(
  categoriaSlug: string,
  ciudadSlug: string,
  barrioSlug: string
): Negocio[] {
  return negocios.filter(
    (n) =>
      n.categoria_slug === categoriaSlug &&
      n.ciudad_slug === ciudadSlug &&
      n.barrio_slug === barrioSlug
  );
}

export function getNegociosByCiudad(
  categoriaSlug: string,
  ciudadSlug: string
): Negocio[] {
  return negocios.filter(
    (n) => n.categoria_slug === categoriaSlug && n.ciudad_slug === ciudadSlug
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
}

export function searchDirectory(query: string, limit = 10, allNegocios?: Negocio[]): SearchResult[] {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];

  const results: SearchResult[] = [];
  const negociosList = allNegocios || negocios;

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
      });
    }
  }

  return results.slice(0, limit);
}
