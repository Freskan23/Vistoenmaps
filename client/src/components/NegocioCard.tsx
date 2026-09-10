import { Star, Phone, Clock, MapPin, ExternalLink, BadgeCheck } from "lucide-react";
import { Link } from "wouter";
import type { Negocio } from "@/data/types";

interface NegocioCardProps {
  negocio: Negocio;
}

export default function NegocioCard({ negocio }: NegocioCardProps) {
  const negocioUrl = `/${negocio.categoria_slug}/${negocio.ciudad_slug}/${negocio.barrio_slug}/${negocio.slug}`;
  const superDestacado = negocio.super_destacado === true;
  const destacado = negocio.destacado === true || superDestacado;

  return (
    <article
      className={
        superDestacado
          ? "relative bg-white shadow-lg hover:shadow-2xl rounded-xl p-5 transition-all duration-300 hover:scale-[1.01] group overflow-hidden ring-2 ring-[#1B4965] hover:bg-gradient-to-br hover:from-white hover:to-[#1B4965]/[0.04]"
          : destacado
            ? "relative bg-white shadow-md hover:shadow-2xl rounded-xl p-5 transition-all duration-300 hover:scale-[1.01] group overflow-hidden ring-2 ring-amber-400/60 hover:bg-gradient-to-br hover:from-white hover:to-amber-50/40"
            : "relative bg-white shadow-sm hover:shadow-xl rounded-xl p-5 transition-all duration-300 hover:scale-[1.01] group overflow-hidden hover:bg-gradient-to-br hover:from-white hover:to-primary/[0.03]"
      }
    >
      {/* Top gradient accent line */}
      <div
        className={
          superDestacado
            ? "absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1B4965] via-[#2a6d94] to-[#1B4965] rounded-t-xl"
            : destacado
              ? "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 rounded-t-xl"
              : "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-primary to-accent/60 rounded-t-xl"
        }
      />

      {/* Distintivo */}
      {superDestacado ? (
        <div className="flex items-center gap-1.5 mb-2 mt-1">
          <span className="inline-flex items-center gap-1 bg-[#1B4965] text-white text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
            <BadgeCheck className="w-3.5 h-3.5" />
            Recomendado
          </span>
        </div>
      ) : destacado ? (
        <div className="flex items-center gap-1.5 mb-2 mt-1">
          <BadgeCheck className="w-4 h-4 text-amber-500" />
          <span className="text-[11px] font-bold uppercase tracking-wide text-amber-600">
            Ficha verificada
          </span>
        </div>
      ) : null}

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3 mt-1">
        <Link href={negocioUrl}>
          <h3 className="font-bold text-foreground text-lg leading-tight group-hover:text-primary transition-colors cursor-pointer hover:underline">
            {negocio.nombre}
          </h3>
        </Link>
        {negocio.valoracion_media ? (
          <div className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-amber-500 text-white px-2.5 py-1 rounded-full shrink-0 shadow-sm">
            <Star className="w-3.5 h-3.5 fill-white" />
            <span className="text-sm font-bold">{negocio.valoracion_media}</span>
          </div>
        ) : null}
      </div>

      {/* Rating details */}
      {negocio.num_resenas ? (
        <p className="text-xs text-muted-foreground mb-3">
          {negocio.num_resenas} opiniones en Google
        </p>
      ) : null}

      {/* Info */}
      <div className="space-y-2 mb-4">
        {negocio.direccion ? (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
            <span>{negocio.direccion}</span>
          </div>
        ) : null}
        {negocio.horario ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 shrink-0 text-accent" />
            <span>{negocio.horario}</span>
          </div>
        ) : null}
      </div>

      {/* Servicios */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {negocio.servicios_destacados.slice(0, 3).map((servicio, index) => (
          <span
            key={servicio}
            className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
              index === 0
                ? "bg-primary/10 text-primary"
                : index === 1
                  ? "bg-accent/10 text-accent"
                  : "bg-amber-50 text-amber-700"
            }`}
          >
            {servicio}
          </span>
        ))}
        {negocio.servicios_destacados.length > 3 && (
          <span className="text-xs text-muted-foreground px-1">
            +{negocio.servicios_destacados.length - 3} mas
          </span>
        )}
      </div>

      {/* CTAs */}
      <div className="flex gap-2 pt-3 border-t border-border/40">
        <a
          href={`tel:${negocio.telefono.replace(/\s/g, "")}`}
          className="flex-1 flex items-center justify-center gap-2 bg-accent text-white font-semibold text-sm py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-[0_2px_8px_rgba(234,88,12,0.25)]"
        >
          <Phone className="w-4 h-4" />
          Llamar
        </a>
        <a
          href={negocio.url_google_maps}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-white font-semibold text-sm py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-[0_2px_8px_rgba(37,99,235,0.25)]"
        >
          <ExternalLink className="w-4 h-4" />
          Ver en Maps
        </a>
      </div>
    </article>
  );
}
