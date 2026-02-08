import { Link } from "wouter";
import { Star, Phone, ExternalLink, Crown } from "lucide-react";
import type { Destacado } from "@/data/types";
import type { AdFormat } from "@/lib/adConfig";

interface DestacadoCardProps {
  destacado: Destacado;
  format: AdFormat;
  className?: string;
}

export default function DestacadoCard({ destacado, format, className = "" }: DestacadoCardProps) {
  if (format === "card") {
    return (
      <div
        className={`group relative bg-gradient-to-br from-amber-50 via-white to-orange-50/50 border-2 border-amber-400/40 rounded-2xl shadow-sm hover:shadow-lg hover:border-amber-400/70 transition-all duration-300 overflow-hidden ${className}`}
      >
        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />

        <div className="p-5">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1 mb-3">
            <Crown className="w-3 h-3" />
            Destacado
          </div>

          {/* Nombre */}
          <h4 className="font-bold text-base text-foreground mb-1 line-clamp-2">
            {destacado.negocio_nombre}
          </h4>

          {/* Descripción */}
          <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
            {destacado.descripcion_corta}
          </p>

          {/* Rating */}
          {destacado.valoracion != null && (
            <div className="flex items-center gap-1.5 mb-3">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-xs font-bold text-foreground">
                {destacado.valoracion.toFixed(1)}
              </span>
              {destacado.num_resenas != null && (
                <span className="text-xs text-muted-foreground">
                  ({destacado.num_resenas})
                </span>
              )}
            </div>
          )}

          {/* CTAs */}
          <div className="flex gap-2">
            {destacado.telefono && (
              <a
                href={`tel:${destacado.telefono}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2 rounded-lg transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                Llamar
              </a>
            )}
            {destacado.web && (
              <a
                href={destacado.web}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white border border-amber-300 text-amber-700 text-xs font-bold py-2 rounded-lg hover:bg-amber-50 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Web
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── Formato horizontal ── */
  return (
    <div
      className={`relative bg-gradient-to-r from-amber-50 via-white to-orange-50/50 border border-amber-400/40 rounded-2xl p-5 md:p-6 hover:shadow-md hover:border-amber-400/60 transition-all duration-300 ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Image o icon */}
        {destacado.imagen ? (
          <img
            src={destacado.imagen}
            alt={destacado.negocio_nombre}
            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-amber-200"
          />
        ) : (
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400/20 to-orange-400/10 rounded-xl flex items-center justify-center shrink-0">
            <Crown className="w-7 h-7 text-amber-500" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5 mb-1.5">
            <Crown className="w-3 h-3" />
            Destacado
          </div>
          <h4 className="font-bold text-base text-foreground mb-0.5">
            {destacado.negocio_nombre}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-1">
            {destacado.descripcion_corta}
          </p>
          {destacado.valoracion != null && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-xs font-bold text-foreground">
                {destacado.valoracion.toFixed(1)}
              </span>
              {destacado.num_resenas != null && (
                <span className="text-xs text-muted-foreground">
                  ({destacado.num_resenas} reseñas)
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 shrink-0">
          {destacado.telefono && (
            <a
              href={`tel:${destacado.telefono}`}
              className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-sm shadow-amber-500/20"
            >
              <Phone className="w-3.5 h-3.5" />
              Llamar
            </a>
          )}
          {destacado.web && (
            <a
              href={destacado.web}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-white border border-amber-300 text-amber-700 text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-amber-50 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Ver web
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
