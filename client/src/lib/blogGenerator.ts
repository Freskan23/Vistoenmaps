import type { BlogPost, Negocio } from "@/data/types";
import { categorias, ciudades } from "@/data";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function generateBlogPosts(allNegocios: Negocio[]): BlogPost[] {
  const posts: BlogPost[] = [];

  for (const cat of categorias) {
    for (const ciudad of ciudades) {
      const negocios = allNegocios
        .filter(
          (n) =>
            n.categoria_slug === cat.slug && n.ciudad_slug === ciudad.slug
        )
        .sort((a, b) => {
          if (b.valoracion_media !== a.valoracion_media)
            return b.valoracion_media - a.valoracion_media;
          return b.num_resenas - a.num_resenas;
        })
        .slice(0, 10);

      if (negocios.length < 3) continue;

      const count = negocios.length;
      posts.push({
        slug: `top-${count}-${slugify(cat.nombre)}-en-${ciudad.slug}`,
        titulo: `Top ${count} ${cat.nombre} en ${ciudad.nombre}`,
        extracto: `Ranking de los ${count} mejores ${cat.nombre.toLowerCase()} en ${ciudad.nombre} según valoraciones y reseñas reales de Google Maps.`,
        categoria_slug: cat.slug,
        ciudad_slug: ciudad.slug,
        ciudad_nombre: ciudad.nombre,
        categoria_nombre: cat.nombre,
        fecha_generado: new Date().toISOString().split("T")[0],
        negocios,
      });
    }
  }

  return posts.sort((a, b) => b.negocios.length - a.negocios.length);
}

export function getBlogPost(
  slug: string,
  allNegocios: Negocio[]
): BlogPost | undefined {
  return generateBlogPosts(allNegocios).find((p) => p.slug === slug);
}
