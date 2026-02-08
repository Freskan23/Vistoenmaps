import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { negocios as staticNegocios, barrios as staticBarrios, ciudades as staticCiudades } from '@/data';
import type { Negocio, Barrio, Ciudad } from '@/data/types';

/**
 * Hook que combina negocios estaticos (JSON) + aprobados de Supabase.
 * Las paginas publicas lo usan para mostrar TODOS los negocios visibles.
 * Tambien genera barrios/ciudades dinamicos a partir de negocios de Supabase
 * que no existan en los datos estaticos.
 */

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function titleCase(text: string): string {
  return text
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ---------- Cache global ----------
interface CachedData {
  negocios: Negocio[];
  dynamicBarrios: Barrio[];
  dynamicCiudades: Ciudad[];
}

let _cached: CachedData | null = null;
let _loadingPromise: Promise<CachedData> | null = null;

const EMPTY: CachedData = {
  negocios: staticNegocios,
  dynamicBarrios: [],
  dynamicCiudades: [],
};

async function fetchAndMerge(): Promise<CachedData> {
  try {
    const { data, error } = await supabase
      .from('negocios')
      .select('*')
      .eq('estado', 'aprobado');

    if (error || !data) return EMPTY;

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

    // Merge negocios: estaticos + DB (evitar duplicados por slug+categoria)
    const existingSlugs = new Set(
      staticNegocios.map((n) => `${n.slug}__${n.categoria_slug}`)
    );
    const newFromDb = dbNegocios.filter(
      (n) => !existingSlugs.has(`${n.slug}__${n.categoria_slug}`)
    );
    const allNegocios = [...staticNegocios, ...newFromDb];

    // ---- Barrios dinamicos ----
    // Crear barrios que existen en Supabase pero no en barrios.json
    const staticBarrioKeys = new Set(
      staticBarrios.map((b) => `${b.slug}__${b.ciudad_slug}`)
    );
    const dynamicBarrioMap = new Map<string, Barrio>();

    for (const sn of data) {
      const barrioSlug = sn.barrio_slug || '';
      const ciudadSlug = sn.ciudad_slug || '';
      if (!barrioSlug || !ciudadSlug) continue;

      const key = `${barrioSlug}__${ciudadSlug}`;
      if (staticBarrioKeys.has(key) || dynamicBarrioMap.has(key)) continue;

      dynamicBarrioMap.set(key, {
        slug: barrioSlug,
        nombre: sn.barrio_nombre || titleCase(barrioSlug.replace(/-/g, ' ')),
        ciudad_slug: ciudadSlug,
        coordenadas: { lat: sn.lat || 0, lng: sn.lng || 0 },
      });
    }

    // ---- Ciudades dinamicas ----
    const staticCiudadSlugs = new Set(staticCiudades.map((c) => c.slug));
    const dynamicCiudadMap = new Map<string, Ciudad>();

    for (const sn of data) {
      const ciudadSlug = sn.ciudad_slug || '';
      if (!ciudadSlug || staticCiudadSlugs.has(ciudadSlug) || dynamicCiudadMap.has(ciudadSlug)) continue;

      dynamicCiudadMap.set(ciudadSlug, {
        slug: ciudadSlug,
        nombre: sn.ciudad_nombre || titleCase(ciudadSlug.replace(/-/g, ' ')),
        provincia: sn.provincia || '',
        comunidad_autonoma: sn.comunidad || '',
        coordenadas: { lat: sn.lat || 0, lng: sn.lng || 0 },
        imagen: '',
      });
    }

    return {
      negocios: allNegocios,
      dynamicBarrios: Array.from(dynamicBarrioMap.values()),
      dynamicCiudades: Array.from(dynamicCiudadMap.values()),
    };
  } catch {
    return EMPTY;
  }
}

function loadAll(): Promise<CachedData> {
  if (_cached) return Promise.resolve(_cached);
  if (!_loadingPromise) {
    _loadingPromise = fetchAndMerge().then((result) => {
      _cached = result;
      _loadingPromise = null;
      return result;
    });
  }
  return _loadingPromise;
}

// ---------- Hooks ----------

/**
 * Hook principal: devuelve todos los negocios (estaticos + Supabase)
 */
export function useAllNegocios() {
  const [data, setData] = useState<CachedData>(_cached || EMPTY);
  const [loaded, setLoaded] = useState(!!_cached);

  useEffect(() => {
    if (_cached) {
      setData(_cached);
      setLoaded(true);
      return;
    }
    loadAll().then((result) => {
      setData(result);
      setLoaded(true);
    });
  }, []);

  return { allNegocios: data.negocios, loaded };
}

/**
 * Hook que devuelve todos los barrios (estaticos + dinamicos de Supabase)
 */
export function useAllBarrios() {
  const [data, setData] = useState<CachedData>(_cached || EMPTY);
  const [loaded, setLoaded] = useState(!!_cached);

  useEffect(() => {
    if (_cached) {
      setData(_cached);
      setLoaded(true);
      return;
    }
    loadAll().then((result) => {
      setData(result);
      setLoaded(true);
    });
  }, []);

  const allBarrios = useMemo(
    () => [...staticBarrios, ...data.dynamicBarrios],
    [data.dynamicBarrios]
  );

  return { allBarrios, loaded };
}

/**
 * Hook que devuelve todas las ciudades (estaticas + dinamicas de Supabase)
 */
export function useAllCiudades() {
  const [data, setData] = useState<CachedData>(_cached || EMPTY);
  const [loaded, setLoaded] = useState(!!_cached);

  useEffect(() => {
    if (_cached) {
      setData(_cached);
      setLoaded(true);
      return;
    }
    loadAll().then((result) => {
      setData(result);
      setLoaded(true);
    });
  }, []);

  const allCiudades = useMemo(
    () => [...staticCiudades, ...data.dynamicCiudades],
    [data.dynamicCiudades]
  );

  return { allCiudades, loaded };
}

/**
 * Buscar un negocio individual en los datos combinados (estaticos + Supabase)
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

// ---------- Helpers (trabajan sobre el array combinado) ----------

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
