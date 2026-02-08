import { AD_CONFIG } from "@/lib/adConfig";

interface GoogleAdProps {
  slotId: string;
  format: string;
  className?: string;
}

/**
 * Wrapper para Google AdSense.
 * Solo renderiza cuando Google Ads está habilitado en AD_CONFIG.
 * Por ahora es un placeholder preparado para el futuro.
 */
export default function GoogleAd({ slotId, format, className }: GoogleAdProps) {
  if (!AD_CONFIG.googleAdsEnabled || !AD_CONFIG.googleAdsClientId) {
    return null;
  }

  // Futuro: aquí irá el script de Google AdSense
  // <ins className="adsbygoogle" data-ad-client={AD_CONFIG.googleAdsClientId} data-ad-slot={slotId} />
  return (
    <div className={className} data-ad-slot={slotId} data-ad-format={format} />
  );
}
