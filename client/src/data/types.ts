export interface Categoria {
  slug: string;
  nombre: string;
  descripcion: string;
  icono: string;
  imagen: string;
}

export interface Ciudad {
  slug: string;
  nombre: string;
  provincia: string;
  comunidad_autonoma: string;
  coordenadas: { lat: number; lng: number };
  imagen: string;
}

export interface Barrio {
  slug: string;
  nombre: string;
  ciudad_slug: string;
  coordenadas: { lat: number; lng: number };
}

export interface Negocio {
  nombre: string;
  slug: string;
  categoria_slug: string;
  ciudad_slug: string;
  barrio_slug: string;
  direccion: string;
  telefono: string;
  horario: string;
  coordenadas: { lat: number; lng: number };
  valoracion_media: number;
  num_resenas: number;
  servicios_destacados: string[];
  url_google_maps: string;
}
