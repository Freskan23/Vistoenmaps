import { Star, Phone, Clock, MapPin, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import type { Negocio } from "@/data/types";

interface NegocioCardProps {
  negocio: Negocio;
}

export default function NegocioCard({ negocio }: NegocioCardProps) {
  const negocioUrl = `/${negocio.categoria_slug}/${negocio.ciudad_slug}/${negocio.barrio_slug}/${negocio.slug}`;

  return (
    <article className="bg-card border-2 border-border hover:border-primary/30 rounded-lg p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <Link href={negocioUrl}>
          <h3 className="font-bold text-foreground text-lg leading-tight group-hover:text-primary transition-colors cursor-pointer hover:underline">
            {negocio.nombre}
          </h3>
        </Link>
        <div className="flex items-center gap-1 bg-accent/10 text-accent px-2.5 py-1 rounded-full shrink-0">
          <Star className="w-3.5 h-3.5 fill-current" />
          <span className="text-sm font-bold">{negocio.valoracion_media}</span>
        </div>
      </div>

      {/* Rating details */}
      <p className="text-xs text-muted-foreground mb-3">
        {negocio.num_resenas} reseñas en Google
      </p>

      {/* Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-primary/60" />
          <span>{negocio.direccion}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4 shrink-0 text-primary/60" />
          <span>{negocio.horario}</span>
        </div>
      </div>

      {/* Servicios */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {negocio.servicios_destacados.slice(0, 3).map((servicio) => (
          <span
            key={servicio}
            className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md font-medium"
          >
            {servicio}
          </span>
        ))}
        {negocio.servicios_destacados.length > 3 && (
          <span className="text-xs text-muted-foreground px-1">
            +{negocio.servicios_destacados.length - 3} más
          </span>
        )}
      </div>

      {/* CTAs */}
      <div className="flex gap-2 pt-3 border-t border-border">
        <a
          href={`tel:${negocio.telefono.replace(/\s/g, "")}`}
          className="flex-1 flex items-center justify-center gap-2 bg-accent text-accent-foreground font-semibold text-sm py-2.5 rounded-md hover:opacity-90 transition-opacity"
        >
          <Phone className="w-4 h-4" />
          Llamar
        </a>
        <a
          href={negocio.url_google_maps}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold text-sm py-2.5 rounded-md hover:opacity-90 transition-opacity"
        >
          <ExternalLink className="w-4 h-4" />
          Ver en Maps
        </a>
      </div>
    </article>
  );
}
