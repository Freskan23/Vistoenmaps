import { Link } from "wouter";
import { MapPin, Star, Calendar } from "lucide-react";
import { getSuperCategoriaForCategoria } from "@/data/superCategorias";
import type { BlogPost } from "@/data/types";

/* ------------------------------------------------------------------ */
/*  Color mapping by super-category                                    */
/* ------------------------------------------------------------------ */
function getAccentColors(categoriaSlug: string) {
  const sc = getSuperCategoriaForCategoria(categoriaSlug);
  switch (sc?.slug) {
    case "servicios":
      return {
        bar: "bg-blue-500",
        badge: "bg-blue-50 text-blue-700",
      };
    case "salud":
      return {
        bar: "bg-emerald-500",
        badge: "bg-emerald-50 text-emerald-700",
      };
    case "ocio":
      return {
        bar: "bg-purple-500",
        badge: "bg-purple-50 text-purple-700",
      };
    case "restaurantes":
      return {
        bar: "bg-amber-500",
        badge: "bg-amber-50 text-amber-700",
      };
    default:
      return {
        bar: "bg-gray-400",
        badge: "bg-gray-50 text-gray-700",
      };
  }
}

interface BlogPostCardProps {
  post: BlogPost;
}

export default function BlogPostCard({ post }: BlogPostCardProps) {
  const colors = getAccentColors(post.categoria_slug);

  return (
    <Link href={`/blog/${post.slug}`}>
      <article className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-border/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full flex flex-col">
        {/* Accent bar */}
        <div className={`h-1 w-full ${colors.bar}`} />

        {/* Body */}
        <div className="p-5 flex flex-col flex-1">
          {/* Category badge */}
          <span
            className={`inline-block self-start text-xs font-semibold px-2.5 py-0.5 rounded-full ${colors.badge}`}
          >
            {post.categoria_nombre}
          </span>

          {/* Title */}
          <h3 className="font-bold text-base mt-2 line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {post.titulo}
          </h3>

          {/* Excerpt */}
          <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
            {post.extracto}
          </p>

          {/* Bottom row */}
          <div className="mt-auto pt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {post.ciudad_nombre}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5" />
              {post.negocios.length} negocios
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {post.fecha_generado}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
