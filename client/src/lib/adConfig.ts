import type { Destacado } from "@/data/types";

/* ── Configuración global del sistema de ads ── */

export type AdFormat = "horizontal" | "card" | "banner" | "inline";

export interface SlotConfig {
  googleSlot: string;
  format: AdFormat;
}

export const AD_CONFIG = {
  googleAdsEnabled: false,
  googleAdsClientId: "",

  slots: {
    "home-after-directorio":  { googleSlot: "", format: "horizontal" as AdFormat },
    "home-after-eventos":     { googleSlot: "", format: "horizontal" as AdFormat },
    "home-before-trust":      { googleSlot: "", format: "horizontal" as AdFormat },
    "eventos-after-filters":  { googleSlot: "", format: "horizontal" as AdFormat },
    "blog-after-filters":     { googleSlot: "", format: "horizontal" as AdFormat },
    "barrio-grid-4":          { googleSlot: "", format: "card" as AdFormat },
    "barrio-grid-8":          { googleSlot: "", format: "card" as AdFormat },
    "categoria-grid-6":       { googleSlot: "", format: "card" as AdFormat },
  } as Record<string, SlotConfig>,
};

/* ── Destacados (en futuro vendrán de Supabase) ── */
export const destacados: Destacado[] = [];

export function getDestacadosForSlot(slotId: string): Destacado[] {
  const now = new Date().toISOString().slice(0, 10);
  return destacados.filter(
    (d) =>
      d.slots.includes(slotId) &&
      d.activo_desde <= now &&
      d.activo_hasta >= now
  );
}
