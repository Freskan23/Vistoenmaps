import type { SuperCategoria } from "./types";

export const superCategorias: SuperCategoria[] = [
  {
    slug: "servicios",
    nombre: "Servicios",
    descripcion: "Profesionales del hogar y servicios a domicilio",
    icono: "Wrench",
    color: {
      bg: "from-blue-500/20 to-cyan-500/10",
      icon: "text-blue-500",
      border: "border-blue-500/20",
      hover: "hover:border-blue-500/40 hover:shadow-blue-500/10",
    },
    categorias: ["cerrajeros", "fontaneros", "electricistas", "pintores", "limpieza", "reformas"],
  },
  {
    slug: "salud",
    nombre: "Salud",
    descripcion: "Centros de salud, clínicas y profesionales sanitarios",
    icono: "HeartPulse",
    color: {
      bg: "from-emerald-500/20 to-teal-500/10",
      icon: "text-emerald-500",
      border: "border-emerald-500/20",
      hover: "hover:border-emerald-500/40 hover:shadow-emerald-500/10",
    },
    categorias: ["dentistas", "fisioterapeutas", "veterinarios", "farmacias", "psicologos"],
  },
  {
    slug: "ocio",
    nombre: "Ocio",
    descripcion: "Entretenimiento, deporte y tiempo libre",
    icono: "Ticket",
    color: {
      bg: "from-purple-500/20 to-pink-500/10",
      icon: "text-purple-500",
      border: "border-purple-500/20",
      hover: "hover:border-purple-500/40 hover:shadow-purple-500/10",
    },
    categorias: ["gimnasios", "cines", "teatros", "parques", "turismo"],
  },
  {
    slug: "restaurantes",
    nombre: "Restaurantes",
    descripcion: "Restaurantes, bares y gastronomía local",
    icono: "UtensilsCrossed",
    color: {
      bg: "from-amber-500/20 to-orange-500/10",
      icon: "text-amber-500",
      border: "border-amber-500/20",
      hover: "hover:border-amber-500/40 hover:shadow-amber-500/10",
    },
    categorias: ["restaurantes", "bares", "cafeterias", "comida-rapida"],
  },
];

export function getSuperCategoria(slug: string): SuperCategoria | undefined {
  return superCategorias.find((sc) => sc.slug === slug);
}

export function getSuperCategoriaForCategoria(catSlug: string): SuperCategoria | undefined {
  return superCategorias.find((sc) => sc.categorias.includes(catSlug));
}
