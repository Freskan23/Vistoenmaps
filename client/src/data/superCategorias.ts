import type { SuperCategoria } from "./types";

export const superCategorias: SuperCategoria[] = [
  {
    slug: "servicios",
    nombre: "Servicios",
    descripcion: "Cerrajero a las 3AM, fontanero que no cancela, electricista de confianza. Aquí están.",
    icono: "Wrench",
    color: {
      bg: "from-blue-500/20 to-cyan-500/10",
      icon: "text-blue-500",
      border: "border-blue-500/20",
      hover: "hover:border-blue-500/40 hover:shadow-blue-500/10",
    },
    categorias: ["cerrajeros", "fontaneros", "electricistas", "pintores", "limpieza", "reformas", "pavimentos-suelos", "taxis-transporte-pasajeros", "talleres-mecanicos", "tejados-impermeabilizacion", "control-plagas", "interiorismo-decoracion", "mudanzas-trasteros", "energia-solar", "aislamiento-eficiencia", "reparacion-electrodomesticos", "jardineria", "transporte-logistica", "ventanas-cerramientos", "carpinteria-muebles", "tapiceria-cortinas", "seguridad-alarmas", "piscinas", "informatica-moviles", "residencias-mayores", "ascensores", "mascotas-servicios"],
  },
  {
    slug: "salud",
    nombre: "Salud",
    descripcion: "Dentistas, fisios, veterinarios y más. Con valoraciones reales de pacientes.",
    icono: "HeartPulse",
    color: {
      bg: "from-emerald-500/20 to-teal-500/10",
      icon: "text-emerald-500",
      border: "border-emerald-500/20",
      hover: "hover:border-emerald-500/40 hover:shadow-emerald-500/10",
    },
    categorias: ["dentistas", "fisioterapeutas", "veterinarios", "farmacias", "psicologos", "clinicas-medicas"],
  },
  {
    slug: "ocio",
    nombre: "Ocio",
    descripcion: "Gimnasios, cines, teatros y planes para no quedarte en el sofá.",
    icono: "Ticket",
    color: {
      bg: "from-purple-500/20 to-pink-500/10",
      icon: "text-purple-500",
      border: "border-purple-500/20",
      hover: "hover:border-purple-500/40 hover:shadow-purple-500/10",
    },
    categorias: ["gimnasios", "cines", "teatros", "parques", "turismo", "ocio-nocturno", "nautica-embarcaciones", "eventos-bodas", "ocio-infantil", "deportes-clubes"],
  },
  {
    slug: "restaurantes",
    nombre: "Restaurantes",
    descripcion: "Dónde comer bien sin arruinarte. Los mejor valorados de tu barrio.",
    icono: "UtensilsCrossed",
    color: {
      bg: "from-amber-500/20 to-orange-500/10",
      icon: "text-amber-500",
      border: "border-amber-500/20",
      hover: "hover:border-amber-500/40 hover:shadow-amber-500/10",
    },
    categorias: ["restaurantes", "bares", "cafeterias", "comida-rapida"],
  },
  {
    slug: "servicios-profesionales",
    nombre: "Servicios profesionales",
    descripcion: "Abogados, gestorías, arquitectos y agencias. Quien te resuelve el papeleo y el negocio.",
    icono: "Briefcase",
    color: {
      bg: "from-indigo-500/20 to-indigo-400/10",
      icon: "text-indigo-500",
      border: "border-indigo-500/20",
      hover: "hover:border-indigo-500/40 hover:shadow-indigo-500/10",
    },
    categorias: ["marketing-diseno", "inmobiliarias", "servicios-empresa", "arquitectura", "imprenta-rotulacion", "fotografia-video", "seguros", "coworking-oficinas", "detectives"],
  },
  {
    slug: "tiendas-comercio",
    nombre: "Tiendas y comercio",
    descripcion: "El comercio de tu barrio: lo que quieres ver antes de comprarlo.",
    icono: "Store",
    color: {
      bg: "from-rose-500/20 to-rose-400/10",
      icon: "text-rose-500",
      border: "border-rose-500/20",
      hover: "hover:border-rose-500/40 hover:shadow-rose-500/10",
    },
    categorias: ["arte-manualidades", "tiendas", "moda-ropa", "ferreterias", "alimentacion", "floristerias", "joyerias"],
  },
  {
    slug: "belleza",
    nombre: "Belleza y bienestar",
    descripcion: "Peluquerías, estética, tatuajes y masaje. Cuidarse cerca de casa.",
    icono: "Sparkles",
    color: {
      bg: "from-fuchsia-500/20 to-fuchsia-400/10",
      icon: "text-fuchsia-500",
      border: "border-fuchsia-500/20",
      hover: "hover:border-fuchsia-500/40 hover:shadow-fuchsia-500/10",
    },
    categorias: ["tatuajes", "peluquerias-estetica", "masajes-bienestar"],
  },
  {
    slug: "academias",
    nombre: "Formación",
    descripcion: "Academias, autoescuelas y escuelas de música. Aprender lo que toque.",
    icono: "GraduationCap",
    color: {
      bg: "from-sky-500/20 to-sky-400/10",
      icon: "text-sky-500",
      border: "border-sky-500/20",
      hover: "hover:border-sky-500/40 hover:shadow-sky-500/10",
    },
    categorias: ["academias-formacion", "autoescuelas", "musica-danza"],
  },
];

export function getSuperCategoria(slug: string): SuperCategoria | undefined {
  return superCategorias.find((sc) => sc.slug === slug);
}

export function getSuperCategoriaForCategoria(catSlug: string): SuperCategoria | undefined {
  return superCategorias.find((sc) => sc.categorias.includes(catSlug));
}
