import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import type { SuperCategoria } from "@/data/types";
import { categorias } from "@/data";
import CategoryIcon from "@/components/CategoryIcon";

interface SuperCategoriaCardProps {
  superCategoria: SuperCategoria;
}

export default function SuperCategoriaCard({ superCategoria }: SuperCategoriaCardProps) {
  const childCategorias = categorias.filter((c) =>
    superCategoria.categorias.includes(c.slug)
  );

  return (
    <Link href={`/directorio/${superCategoria.slug}`}>
      <div
        className={`group relative bg-white border ${superCategoria.color.border} rounded-2xl shadow-sm ${superCategoria.color.hover} hover:shadow-xl p-5 transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden`}
      >
        {/* Gradient background overlay on hover */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${superCategoria.color.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        />

        <div className="relative">
          {/* Icon + Text */}
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 bg-gradient-to-br ${superCategoria.color.bg} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}
            >
              <CategoryIcon
                iconName={superCategoria.icono}
                className={`w-6 h-6 ${superCategoria.color.icon}`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                {superCategoria.nombre}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                {superCategoria.descripcion}
              </p>
            </div>
          </div>

          {/* Child category pills */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {childCategorias.map((cat) => (
              <span
                key={cat.slug}
                className="inline-block bg-gray-100 text-gray-600 text-xs font-medium rounded-full px-2.5 py-0.5"
              >
                {cat.nombre}
              </span>
            ))}
          </div>

          {/* "Explorar" hover link */}
          <div className="flex items-center gap-1 text-sm font-semibold text-accent mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
            Explorar
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}
