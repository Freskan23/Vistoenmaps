import { ExternalLink, Check } from "lucide-react";
import { getMarca } from "@/data/marcas";
import type { AdFormat } from "@/lib/adConfig";

interface HousePromoProps {
  slot: string;
  format: AdFormat;
  className?: string;
}

/**
 * Anuncio propio de las marcas de Edu en los huecos publicitarios.
 *
 * Reglas:
 * - Solo datos que ya estan en marcas.ts (nada de cifras inventadas).
 * - Etiqueta "Publicidad" visible: es casa, pero ocupa hueco de anuncio.
 * - Enlace con UTM del slot para saber que hueco trae visitas.
 * - rel nofollow: son miles de paginas y no queremos empujar SEO con esto.
 */
export default function HousePromo({ slot, format, className = "" }: HousePromoProps) {
  const marca = getMarca("local-brain");
  if (!marca) return null;

  const href = `${marca.url}/?utm_source=vistoenmaps&utm_medium=ads&utm_campaign=${slot}`;
  const puntos = format === "card" ? marca.puntos.slice(0, 2) : marca.puntos.slice(0, 3);

  if (format === "card") {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl text-white shadow-sm hover:shadow-md transition-all duration-300 ${className}`}
        style={{ backgroundColor: marca.colorFondo }}
      >
        <span className="absolute top-2.5 right-2.5 text-[9px] font-bold uppercase tracking-widest text-white/50">
          Publicidad
        </span>
        <div className="p-5 flex flex-col h-full justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/60 mb-2">
              Para agencias y gestorias de fichas
            </p>
            <p className="font-bold text-sm leading-snug mb-2">{marca.promesa}</p>
            <ul className="space-y-1">
              {puntos.map((p) => (
                <li key={p} className="flex items-start gap-1.5 text-xs text-white/85">
                  <Check className="w-3.5 h-3.5 shrink-0 mt-0.5 text-white/70" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <a
            href={href}
            target="_blank"
            rel="nofollow noopener sponsored"
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white/95 px-4 py-2 text-xs font-bold hover:bg-white transition-colors"
            style={{ color: marca.colorFondo }}
          >
            {marca.nombre}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl text-white shadow-sm ${className}`}
      style={{ backgroundColor: marca.colorFondo }}
    >
      <span className="absolute top-3 right-4 text-[9px] font-bold uppercase tracking-widest text-white/50">
        Publicidad
      </span>
      <div className="px-6 py-5 md:flex md:items-center md:gap-6">
        <div className="md:flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1.5">
            Para agencias y gestorias de fichas
          </p>
          <p className="font-bold text-base leading-snug mb-2">{marca.promesa}</p>
          <ul className="grid gap-1 sm:grid-cols-2">
            {puntos.map((p) => (
              <li key={p} className="flex items-start gap-1.5 text-xs text-white/85">
                <Check className="w-3.5 h-3.5 shrink-0 mt-0.5 text-white/70" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <a
          href={href}
          target="_blank"
          rel="nofollow noopener sponsored"
          className="mt-4 md:mt-0 inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-white/95 px-5 py-2.5 text-sm font-bold hover:bg-white transition-colors"
          style={{ color: marca.colorFondo }}
        >
          Ver {marca.nombre}
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
