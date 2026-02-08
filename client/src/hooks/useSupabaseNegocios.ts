import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { negocios as staticNegocios } from '@/data';
import type { Negocio } from '@/data/types';

/**
 * Hook que combina negocios estaticos (JSON) + aprobados de Supabase.
 * Las paginas publicas lo usan para mostrar TODOS los negocios visibles.
 */

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Cache global para no repetir la query en cada pagina
let _cachedAll: Negocio[] | null = null;
let _loadingPromise: Promise<Negocio[]> | null = null;

async function fetchAndMerge(): Promise<Negocio[]> {
  try {
    const { data, error } = await supabase
      .from('negocios')
      .select('*')
      .eq('estado', 'aprobado');

    if (error || !data) return staticNegocios;

    // Convertir negocios de Supabase al formato Negocio
    const dbNegocios: Negocio[] = data.map((sn) => ({
      nombre: sn.nombre,
      slug: sn.slug || slugify(sn.nombre),
      categoria_slug: sn.categoria_slug || '',
      ciudad_slug: sn.ciudad_slug || '',
      barrio_slug: sn.barrio_slug || '',
      direccion: sn.direccion || '',
      telefono: sn.telefono || '',
      horario: sn.horario || '',
      coordenadas: { lat: sn.lat || 0, lng: sn.lng || 0 },
      valoracion_media: sn.valoracion_media || 0,
      num_resenas: sn.num_resenas || 0,
      servicios_destacados: sn.servicios_destacados || (sn.descripcion ? [sn.descripcion] : []),
      url_google_maps: sn.url_google_maps || '',
    }));

    // Merge: estaticos + DB (evitar duplicados por slug+categoria)
    const existingSlugs = new Set(
      staticNegocios.map((n) => `${n.slug}__${n.categoria_slug}`)
    );

    const newFromDb = dbNegocios.filter(
      (n) => !existingSlugs.has(`${n.slug}__${n.categoria_slug}`)
    );

    return [...staticNegocios, ...newFromDb];
  } catch {
    return staticNegocios;
  }
}

function loadAll(): Promise<Negocio[]> {
  if (_cachedAll) return Promise.resolve(_cachedAll);
  if (!_loadingPromise) {
    _loadingPromise = fetchAndMerge().then((result) => {
      _cachedAll = result;
      _loadingPromise = null;
      return result;
    });
  }
  return _loadingPromise;
}

/**
 * Hook principal: devuelve todos los negocios (estaticos + Supabase)
 */
export function useAllNegocios() {
  const [allNegocios, setAllNegocios] = useState<Negocio[]>(
    _cachedAll || staticNegocios
  );
  const [loaded, setLoaded] = useState(!!_cachedAll);

  useEffect(() => {
    if (_cachedAll) {
      setAllNegocios(_cachedAll);
      setLoaded(true);
      return;
    }
    loadAll().then((result) => {
      setAllNegocios(result);
      setLoaded(true);
    });
  }, []);

  return { allNegocios, loaded };
}

/**
 * Buscar un negocio individual en los datos combinados (estáticos + Supabase)
 */
export function useFindNegocio(
  categoriaSlug: string,
  ciudadSlug: string,
  barrioSlug: string,
  negocioSlug: string
) {
  const { allNegocios, loaded } = useAllNegocios();

  const negocio = useMemo(
    () =>
      allNegocios.find(
        (n) =>
          n.categoria_slug === categoriaSlug &&
          n.ciudad_slug === ciudadSlug &&
          n.barrio_slug === barrioSlug &&
          n.slug === negocioSlug
      ) || null,
    [allNegocios, categoriaSlug, ciudadSlug, barrioSlug, negocioSlug]
  );

  return { negocio, loaded };
}

/**
 * Buscar negocios en datos combinados (para SearchBar)
 */
export function useSearchNegocios() {
  const { allNegocios } = useAllNegocios();
  return allNegocios;
}

// Helpers que trabajan sobre el array combinado
export function filterByCiudad(
  all: Negocio[],
  categoriaSlug: string,
  ciudadSlug: string
): Negocio[] {
  return all.filter(
    (n) => n.categoria_slug === categoriaSlug && n.ciudad_slug === ciudadSlug
  );
}

export function filterByBarrio(
  all: Negocio[],
  categoriaSlug: string,
  ciudadSlug: string,
  barrioSlug: string
): Negocio[] {
  return all.filter(
    (n) =>
      n.categoria_slug === categoriaSlug &&
      n.ciudad_slug === ciudadSlug &&
      n.barrio_slug === barrioSlug
  );
}

export function countByBarrio(
  all: Negocio[],
  categoriaSlug: string,
  ciudadSlug: string,
  barrioSlug: string
): number {
  return filterByBarrio(all, categoriaSlug, ciudadSlug, barrioSlug).length;
}
