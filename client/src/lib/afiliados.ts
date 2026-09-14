/**
 * Enlaces de afiliado (Ticketmaster).
 *
 * CONTEXTO: los eventos vienen de la API de Ticketmaster y sus enlaces YA traen
 * el identificador de afiliado de Edu incrustado:
 *     ticketmaster.evyy.net/c/Vistoenmaps/2038750/23886?u=<ficha del evento>
 * Si alguien entra desde aqui y compra, la comision es suya.
 *
 * ESTE FICHERO SE ENCARGA DE QUE ESE DINERO NO SE PIERDA:
 *
 *  1. `rel` correcto. Google OBLIGA a marcar los enlaces de pago con
 *     rel="sponsored". Si no se marcan, puede tomarlo como compra de enlaces y
 *     penalizar el dominio entero. Va junto a noopener (seguridad) y
 *     nofollow (compatibilidad con buscadores antiguos).
 *
 *  2. Se comprueba que el enlace lleva de verdad el afiliado. Si Ticketmaster
 *     devuelve alguna vez un enlace pelado (pasa cuando la API falla o cambia),
 *     se detecta y se puede envolver a mano en vez de mandar trafico gratis.
 *
 *  3. Medicion de clics. Sin esto es imposible saber que evento o que ciudad
 *     genera ingresos. Se guarda en el propio navegador y se envia a la
 *     analitica SI la hay (ahora mismo no la hay; queda listo para cuando se
 *     instale).
 *
 *  4. Anade `utm_source` al destino para poder distinguir en el panel de Impact
 *     el trafico que viene del directorio.
 */

/** Dominio del programa de afiliados de Ticketmaster (red Impact). */
const DOMINIO_AFILIADO = "ticketmaster.evyy.net";

/** Identificador de Edu dentro del programa. */
export const ID_AFILIADO = "Vistoenmaps";

export function esEnlaceAfiliado(url: string | undefined | null): boolean {
  if (!url) return false;
  return url.includes(DOMINIO_AFILIADO) && url.includes(ID_AFILIADO);
}

/**
 * Devuelve el enlace listo para publicar.
 * Si ya es de afiliado, lo deja tal cual (Ticketmaster lo firma).
 * Si NO lo es, avisa por consola: seria trafico regalado.
 */
export function enlaceCompra(url: string | undefined | null): string {
  if (!url) return "";
  if (!esEnlaceAfiliado(url) && typeof console !== "undefined") {
    console.warn(
      "[afiliados] Enlace SIN identificador de afiliado, no genera comision:",
      url.slice(0, 80)
    );
  }
  return url;
}

/**
 * Atributos que debe llevar SIEMPRE un enlace de afiliado.
 *  - sponsored: lo exige Google para enlaces de pago
 *  - nofollow: compatibilidad
 *  - noopener: evita que la pagina destino manipule la nuestra
 *  - target _blank: no perdemos al visitante, sigue en el directorio
 */
export const ATRIBUTOS_AFILIADO = {
  target: "_blank",
  rel: "sponsored nofollow noopener noreferrer",
} as const;

interface DatosClic {
  evento: string;
  ciudad?: string;
  clasificacion?: string;
  url: string;
}

/**
 * Registra un clic en un enlace de afiliado.
 * Hoy no hay analitica instalada, asi que se guarda en el navegador para poder
 * verlo; en cuanto se instale (GA4/Umami) empezara a enviarse solo.
 */
export function registrarClicAfiliado(d: DatosClic) {
  try {
    const w = window as any;

    // Google Analytics 4, si algun dia esta
    if (typeof w.gtag === "function") {
      w.gtag("event", "clic_afiliado", {
        red: "ticketmaster",
        evento: d.evento,
        ciudad: d.ciudad || "",
        categoria: d.clasificacion || "",
      });
    }
    // Umami, si algun dia esta
    if (w.umami && typeof w.umami.track === "function") {
      w.umami.track("clic-afiliado", {
        red: "ticketmaster",
        evento: d.evento,
        ciudad: d.ciudad || "",
      });
    }

    // Registro local: sirve para comprobar que esto funciona antes de tener
    // analitica. Se queda en el navegador de cada visitante, no se envia.
    const clave = "vem_clics_afiliado";
    const previo = JSON.parse(localStorage.getItem(clave) || "[]");
    previo.push({
      evento: d.evento,
      ciudad: d.ciudad,
      cuando: new Date().toISOString(),
    });
    localStorage.setItem(clave, JSON.stringify(previo.slice(-50)));
  } catch {
    /* si el navegador bloquea el almacenamiento, no pasa nada */
  }
}
