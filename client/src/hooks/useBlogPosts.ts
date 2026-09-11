import { useEffect, useState } from "react";
import type { BlogPost } from "@/data/types";
import destacadosData from "@/data/blogDestacado.json";

/**
 * Rankings del blog.
 *
 * Antes se generaban en el navegador recorriendo 72 categorias x 1.069 ciudades
 * sobre los 20.253 negocios: para eso habia que descargar ~10 MB solo para
 * pintar 3 tarjetas en la portada.
 *
 * Ahora los rankings vienen ya calculados:
 *  - `blogDestacado.json` (4 KB, en el bundle): titulares para la portada.
 *  - `/datos/blog.json` (3 MB): los 1.094 rankings completos, y solo se pide
 *    cuando el visitante entra de verdad en el blog.
 */

let cache: BlogPost[] | null = null;
let enCurso: Promise<BlogPost[]> | null = null;

function cargarBlog(): Promise<BlogPost[]> {
  if (cache) return Promise.resolve(cache);
  if (enCurso) return enCurso;
  enCurso = fetch("/datos/blog.json")
    .then((r) => (r.ok ? r.json() : []))
    .then((lista: BlogPost[]) => {
      cache = Array.isArray(lista) ? lista : [];
      enCurso = null;
      return cache;
    })
    .catch(() => {
      enCurso = null;
      return [];
    });
  return enCurso;
}

/** Titulares para la portada: sin descargar nada. */
export function useBlogDestacado() {
  return { posts: destacadosData as unknown as BlogPost[], loaded: true };
}

/** Todos los rankings (pagina de blog). */
export function useBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>(cache || []);
  const [loaded, setLoaded] = useState(!!cache);

  useEffect(() => {
    let vivo = true;
    cargarBlog().then((lista) => {
      if (!vivo) return;
      setPosts(lista);
      setLoaded(true);
    });
    return () => {
      vivo = false;
    };
  }, []);

  return { posts, loaded };
}

/** Un ranking concreto. */
export function useBlogPost(slug: string) {
  const [post, setPost] = useState<BlogPost | undefined>(
    cache ? cache.find((p) => p.slug === slug) : undefined
  );
  const [loaded, setLoaded] = useState(!!cache);

  useEffect(() => {
    let vivo = true;
    cargarBlog().then((lista) => {
      if (!vivo) return;
      setPost(lista.find((p) => p.slug === slug));
      setLoaded(true);
    });
    return () => {
      vivo = false;
    };
  }, [slug]);

  return { post, loaded };
}
