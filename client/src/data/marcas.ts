/**
 * Marcas de Edu que se ofrecen desde el directorio.
 *
 * REGLA: cada marca aparece SOLO donde resuelve algo que el visitante acaba de
 * ver con sus propios ojos (su posicion, sus reseñas). Nada de banners sueltos.
 * Si el dato no lo tenemos comprobado, no se menciona: preferimos no decir nada
 * antes que inventar una carencia.
 */

export type Publico = "negocio" | "agencia" | "ambos";

export interface Marca {
  slug: string;
  nombre: string;
  url: string;
  publico: Publico;
  /** Frase de una linea: que consigue el cliente, no que hace el producto. */
  promesa: string;
  descripcion: string;
  /** Resultados concretos y comprobables. */
  puntos: string[];
  colorFondo: string;
  colorTexto: string;
}

export const MARCAS: Marca[] = [
  {
    slug: "trafikazo",
    nombre: "Trafikazo",
    url: "https://trafikazo.com",
    publico: "ambos",
    promesa: "Sube tu negocio en el mapa de Google y consigue más reseñas",
    descripcion:
      "Trafikazo mide en qué puesto sales en Google Maps calle por calle, no solo en el centro de tu ciudad. Te enseña dónde te ganan tus competidores, te ayuda a conseguir reseñas y te avisa si alguien cambia los datos de tu ficha.",
    puntos: [
      "Mapa de posiciones calle por calle: ves dónde apareces y dónde no",
      "Sistema de reseñas para pedirlas sin perseguir a nadie",
      "Aviso si alguien edita tu ficha de Google sin permiso",
      "Denuncia de reseñas falsas que incumplen las normas",
    ],
    colorFondo: "#1B4965",
    colorTexto: "#ffffff",
  },
  {
    slug: "local-brain",
    nombre: "Local Brain",
    url: "https://localbrain.app",
    publico: "ambos",
    promesa: "Gestiona todas tus fichas de Google desde un solo panel",
    descripcion:
      "Local Brain lleva el día a día de tus fichas de Google: publicaciones, reseñas, preguntas, seguimiento de posiciones y presencia en directorios. Pensado para quien gestiona varias ubicaciones o varios clientes a la vez.",
    puntos: [
      "Varias ubicaciones y clientes en un mismo panel",
      "Publicaciones y respuestas a reseñas centralizadas",
      "Seguimiento de posiciones con histórico",
      "Alta y control de citaciones en directorios",
    ],
    colorFondo: "#2a6d94",
    colorTexto: "#ffffff",
  },
  {
    slug: "yinyang-seo",
    nombre: "YinYang SEO",
    url: "https://yinyangseo.com",
    publico: "agencia",
    promesa: "Aprende SEO local o delega el trabajo en quien lo hace a diario",
    descripcion:
      "Formación en SEO local y servicios de agencia. Para quien quiere aprender a posicionar negocios locales y para quien prefiere que se lo hagan.",
    puntos: [
      "Formación práctica en SEO local",
      "Servicios de agencia para proyectos concretos",
    ],
    colorFondo: "#d98324",
    colorTexto: "#ffffff",
  },
];

export function marcasPara(publico: "negocio" | "agencia"): Marca[] {
  return MARCAS.filter((m) => m.publico === publico || m.publico === "ambos");
}

export function getMarca(slug: string): Marca | undefined {
  return MARCAS.find((m) => m.slug === slug);
}
