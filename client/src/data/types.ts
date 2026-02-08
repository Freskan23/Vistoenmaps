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

export interface ResenaEmpleado {
  nombre: string;
  cargo: string;
  texto: string;
  valoracion: number;
  fecha?: string;
}

export interface ResenaCliente {
  nombre: string;
  texto: string;
  valoracion: number;
  fecha?: string;
  servicio?: string;
}

export interface MencionMedio {
  medio: string;
  titulo: string;
  url: string;
  fecha?: string;
}

export interface Producto {
  nombre: string;
  descripcion?: string;
  precio?: string;
  imagen?: string;
}

export interface ServicioDetallado {
  nombre: string;
  descripcion?: string;
  precio?: string;
}

export interface RedesSociales {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
  linkedin?: string;
  tiktok?: string;
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
  // Campos extendidos (opcionales — negocios de Supabase)
  descripcion?: string;
  email?: string;
  web?: string;
  fotos?: string[];
  redes_sociales?: RedesSociales;
  youtube_videos?: string[];
  resenas_empleados?: ResenaEmpleado[];
  resenas_clientes?: ResenaCliente[];
  citaciones?: string[];
  menciones_medios?: MencionMedio[];
  productos?: Producto[];
  servicios_detallados?: ServicioDetallado[];
  valor_anadido?: string[];
  anos_experiencia?: number;
  certificaciones?: string[];
}
