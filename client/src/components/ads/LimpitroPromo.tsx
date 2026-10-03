import { Link } from "wouter";
import { Sparkles } from "lucide-react";
import { LIMPITRO_MUNIS, limpitriza } from "@/lib/limpitroMunis";

/**
 * Destacado propio de Limpitro (limpiezadesofasdomicilio.madrid) en las
 * paginas de ubicacion de LIMPIEZA donde llega su servicio (Comunidad de
 * Madrid). Edu lo pidio literal: "metelo como destacado en todas las paginas
 * de ubicacion de vistoenmaps donde llegue limpitro".
 *
 * Reglas que se mantienen:
 * - Solo paginas de limpieza, solo municipios/barrios que su propia web lista
 *   como zona de servicio (lista generada desde su sitemap).
 * - Etiqueta Publicidad visible: es casa, ocupa un hueco de anuncio.
 * - No altera el orden de los listados organicos.
 * - Precios: "desde 60 € + IVA", tal y como publican ellos. Nada mas.
 */

const URL_BASE = "https://limpiezadesofasdomicilio.madrid";

interface Props {
  ciudadSlug: string;
  slot: string;
  className?: string;
}

export default function LimpitroPromo({ ciudadSlug, slot, className = "" }: Props) {
  if (!limpitriza(ciudadSlug)) return null;
  const href = `${URL_BASE}/limpieza-de-sofas-en-${ciudadSlug}/?utm_source=vistoenmaps&utm_medium=destacado&utm_campaign=${slot}`;
  return (
    <div
      className={`relative overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border-2 border-amber-400/50 bg-gradient-to-br from-amber-50 via-white to-orange-50/60 ${className ?? ""}`}
    >
      <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />
      <div className="p-5">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1">
            <Sparkles className="w-3 h-3" />
            Destacado · Publicidad
          </span>
        </div>
        <p className="font-bold text-base leading-snug mb-1">
          Limpieza de sofás a domicilio en tu zona — desde 60 € + IVA
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          Limpitro limpia tu sofá en casa, sin desplazamiento: foto por WhatsApp y precio cerrado en minutos. También colchones, alfombras y tapicerías.
        </p>
        <a
          href={href}
          target="_blank"
          rel="nofollow sponsored noopener"
          className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 hover:bg-amber-500 text-white px-4 py-2 text-xs font-bold transition-colors"
        >
          Ver Limpitro
        </a>
      </div>
    </div>
  );
}

export function LimpitroLink({ ciudadSlug }: { ciudadSlug: string }) {
  if (!limpitriza(ciudadSlug)) return null;
  return (
    <Link href={`${URL_BASE}/limpieza-de-sofas-en-${ciudadSlug}/`} rel="nofollow sponsored">
      Limpitro
    </Link>
  );
}
