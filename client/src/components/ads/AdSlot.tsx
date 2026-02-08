import { AD_CONFIG, getDestacadosForSlot } from "@/lib/adConfig";
import type { AdFormat } from "@/lib/adConfig";
import GoogleAd from "./GoogleAd";
import DestacadoCard from "./DestacadoCard";
import PromoPlaceholder from "./PromoPlaceholder";

interface AdSlotProps {
  slot: string;
  format?: AdFormat;
  className?: string;
}

/**
 * Componente orquestador del sistema de monetización.
 *
 * Prioridad:
 * 1. Google Ads (si habilitado)
 * 2. Negocios Destacados (si hay para este slot)
 * 3. PromoPlaceholder (CTA para captar anunciantes)
 */
export default function AdSlot({ slot, format, className = "" }: AdSlotProps) {
  const slotConfig = AD_CONFIG.slots[slot];
  const resolvedFormat = format || (slotConfig?.format as AdFormat) || "horizontal";

  /* 1. Google Ads */
  if (AD_CONFIG.googleAdsEnabled && slotConfig?.googleSlot) {
    return (
      <GoogleAd
        slotId={slotConfig.googleSlot}
        format={resolvedFormat}
        className={className}
      />
    );
  }

  /* 2. Negocios Destacados */
  const destacados = getDestacadosForSlot(slot);
  if (destacados.length > 0) {
    return (
      <DestacadoCard
        destacado={destacados[0]}
        format={resolvedFormat}
        className={className}
      />
    );
  }

  /* 3. PromoPlaceholder */
  return (
    <PromoPlaceholder
      format={resolvedFormat}
      slot={slot}
      className={className}
    />
  );
}
