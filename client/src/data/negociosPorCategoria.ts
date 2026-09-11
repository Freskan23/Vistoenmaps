/**
 * Carga de negocios POR CATEGORIA.
 *
 * Antes `negocios.json` (20 MB) se importaba directamente en el codigo, asi que
 * el bundle pesaba 21 MB y CADA pagina se descargaba los 20.253 negocios aunque
 * solo necesitara 3. En movil eso es la pantalla en blanco varios segundos.
 *
 * Ahora los datos viven en /datos/<categoria>.json y se piden solo cuando hacen
 * falta: la mayoria de categorias ocupan ~120 KB.
 */

import type { Negocio } from "./types";

const cache = new Map<string, Negocio[]>();
const enCurso = new Map<string, Promise<Negocio[]>>();

/** Devuelve los negocios ya cargados de una categoria (sin pedir nada). */
export function negociosCargados(categoriaSlug: string): Negocio[] {
  return cache.get(categoriaSlug) || [];
}

/** Todos los negocios de las categorias que se hayan cargado hasta ahora. */
export function negociosEnMemoria(): Negocio[] {
  const todos: Negocio[] = [];
  cache.forEach((lista) => {
    todos.push(...lista);
  });
  return todos;
}

/** Pide (una sola vez) los negocios de una categoria. */
export async function cargarCategoria(categoriaSlug: string): Promise<Negocio[]> {
  if (!categoriaSlug) return [];
  const ya = cache.get(categoriaSlug);
  if (ya) return ya;

  const pendiente = enCurso.get(categoriaSlug);
  if (pendiente) return pendiente;

  const promesa = fetch(`/datos/${categoriaSlug}.json`)
    .then((r) => (r.ok ? r.json() : []))
    .then((lista: Negocio[]) => {
      const datos = Array.isArray(lista) ? lista : [];
      cache.set(categoriaSlug, datos);
      enCurso.delete(categoriaSlug);
      return datos;
    })
    .catch(() => {
      enCurso.delete(categoriaSlug);
      return [];
    });

  enCurso.set(categoriaSlug, promesa);
  return promesa;
}

/** Carga varias categorias a la vez (portada, buscador). */
export async function cargarCategorias(slugs: string[]): Promise<Negocio[]> {
  const listas = await Promise.all(slugs.map((s) => cargarCategoria(s)));
  return listas.flat();
}
