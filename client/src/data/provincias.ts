/**
 * Provincias de España agrupadas por Comunidad Autónoma
 */

export interface Provincia {
  slug: string;
  nombre: string;
  comunidad: string;
}

export const COMUNIDADES_AUTONOMAS = [
  'Andalucia',
  'Aragon',
  'Asturias',
  'Baleares',
  'Canarias',
  'Cantabria',
  'Castilla-La Mancha',
  'Castilla y Leon',
  'Cataluna',
  'Ceuta',
  'Comunidad Valenciana',
  'Extremadura',
  'Galicia',
  'La Rioja',
  'Madrid',
  'Melilla',
  'Murcia',
  'Navarra',
  'Pais Vasco',
] as const;

export const PROVINCIAS: Provincia[] = [
  // Andalucia
  { slug: 'almeria', nombre: 'Almeria', comunidad: 'Andalucia' },
  { slug: 'cadiz', nombre: 'Cadiz', comunidad: 'Andalucia' },
  { slug: 'cordoba', nombre: 'Cordoba', comunidad: 'Andalucia' },
  { slug: 'granada', nombre: 'Granada', comunidad: 'Andalucia' },
  { slug: 'huelva', nombre: 'Huelva', comunidad: 'Andalucia' },
  { slug: 'jaen', nombre: 'Jaen', comunidad: 'Andalucia' },
  { slug: 'malaga', nombre: 'Malaga', comunidad: 'Andalucia' },
  { slug: 'sevilla', nombre: 'Sevilla', comunidad: 'Andalucia' },
  // Aragon
  { slug: 'huesca', nombre: 'Huesca', comunidad: 'Aragon' },
  { slug: 'teruel', nombre: 'Teruel', comunidad: 'Aragon' },
  { slug: 'zaragoza', nombre: 'Zaragoza', comunidad: 'Aragon' },
  // Asturias
  { slug: 'asturias', nombre: 'Asturias', comunidad: 'Asturias' },
  // Baleares
  { slug: 'baleares', nombre: 'Illes Balears', comunidad: 'Baleares' },
  // Canarias
  { slug: 'las-palmas', nombre: 'Las Palmas', comunidad: 'Canarias' },
  { slug: 'santa-cruz-de-tenerife', nombre: 'Santa Cruz de Tenerife', comunidad: 'Canarias' },
  // Cantabria
  { slug: 'cantabria', nombre: 'Cantabria', comunidad: 'Cantabria' },
  // Castilla-La Mancha
  { slug: 'albacete', nombre: 'Albacete', comunidad: 'Castilla-La Mancha' },
  { slug: 'ciudad-real', nombre: 'Ciudad Real', comunidad: 'Castilla-La Mancha' },
  { slug: 'cuenca', nombre: 'Cuenca', comunidad: 'Castilla-La Mancha' },
  { slug: 'guadalajara', nombre: 'Guadalajara', comunidad: 'Castilla-La Mancha' },
  { slug: 'toledo', nombre: 'Toledo', comunidad: 'Castilla-La Mancha' },
  // Castilla y Leon
  { slug: 'avila', nombre: 'Avila', comunidad: 'Castilla y Leon' },
  { slug: 'burgos', nombre: 'Burgos', comunidad: 'Castilla y Leon' },
  { slug: 'leon', nombre: 'Leon', comunidad: 'Castilla y Leon' },
  { slug: 'palencia', nombre: 'Palencia', comunidad: 'Castilla y Leon' },
  { slug: 'salamanca', nombre: 'Salamanca', comunidad: 'Castilla y Leon' },
  { slug: 'segovia', nombre: 'Segovia', comunidad: 'Castilla y Leon' },
  { slug: 'soria', nombre: 'Soria', comunidad: 'Castilla y Leon' },
  { slug: 'valladolid', nombre: 'Valladolid', comunidad: 'Castilla y Leon' },
  { slug: 'zamora', nombre: 'Zamora', comunidad: 'Castilla y Leon' },
  // Cataluna
  { slug: 'barcelona', nombre: 'Barcelona', comunidad: 'Cataluna' },
  { slug: 'girona', nombre: 'Girona', comunidad: 'Cataluna' },
  { slug: 'lleida', nombre: 'Lleida', comunidad: 'Cataluna' },
  { slug: 'tarragona', nombre: 'Tarragona', comunidad: 'Cataluna' },
  // Ceuta
  { slug: 'ceuta', nombre: 'Ceuta', comunidad: 'Ceuta' },
  // Comunidad Valenciana
  { slug: 'alicante', nombre: 'Alicante', comunidad: 'Comunidad Valenciana' },
  { slug: 'castellon', nombre: 'Castellon', comunidad: 'Comunidad Valenciana' },
  { slug: 'valencia', nombre: 'Valencia', comunidad: 'Comunidad Valenciana' },
  // Extremadura
  { slug: 'badajoz', nombre: 'Badajoz', comunidad: 'Extremadura' },
  { slug: 'caceres', nombre: 'Caceres', comunidad: 'Extremadura' },
  // Galicia
  { slug: 'a-coruna', nombre: 'A Coruna', comunidad: 'Galicia' },
  { slug: 'lugo', nombre: 'Lugo', comunidad: 'Galicia' },
  { slug: 'ourense', nombre: 'Ourense', comunidad: 'Galicia' },
  { slug: 'pontevedra', nombre: 'Pontevedra', comunidad: 'Galicia' },
  // La Rioja
  { slug: 'la-rioja', nombre: 'La Rioja', comunidad: 'La Rioja' },
  // Madrid
  { slug: 'madrid', nombre: 'Madrid', comunidad: 'Madrid' },
  // Melilla
  { slug: 'melilla', nombre: 'Melilla', comunidad: 'Melilla' },
  // Murcia
  { slug: 'murcia', nombre: 'Murcia', comunidad: 'Murcia' },
  // Navarra
  { slug: 'navarra', nombre: 'Navarra', comunidad: 'Navarra' },
  // Pais Vasco
  { slug: 'alava', nombre: 'Alava', comunidad: 'Pais Vasco' },
  { slug: 'bizkaia', nombre: 'Bizkaia', comunidad: 'Pais Vasco' },
  { slug: 'gipuzkoa', nombre: 'Gipuzkoa', comunidad: 'Pais Vasco' },
];

export function getProvinciasByComunidad(comunidad: string): Provincia[] {
  return PROVINCIAS.filter(p => p.comunidad === comunidad);
}
