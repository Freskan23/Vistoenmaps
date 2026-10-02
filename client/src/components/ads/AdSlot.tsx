import { AD_CONFIG, getDestacadosForSlot } from "@/lib/adConfig";
import type { AdFormat } from "@/lib/adConfig";
import GoogleAd from "./GoogleAd";
import DestacadoCard from "./DestacadoCard";
import PromoPlaceholder from "./PromoPlaceholder";
import HousePromo from "./HousePromo";

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
 * 2. Negocios Destacados de pago (si hay para este slot)
 * 3. Anuncio propio de Local Brain (casa) — sustituye al placeholder genérico
 *    para que los huecos vendan lo nuestro mientras no hay cliente de pago.
 * 4. PromoPlaceholder (queda como respaldo si se retira la marca).
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

  /* 2. Negocios Destacados de pago */
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

  /* 3. Anuncio propio: Local Brain en todos los huecos */
  return <HousePromo slot={slot} format={resolvedFormat} className={className} />;

  /* 4. PromoPlaceholder se conserva como componente para futuros usos. */
}
