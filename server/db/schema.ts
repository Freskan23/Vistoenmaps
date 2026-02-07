import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role', { enum: ['admin', 'business'] }).default('business'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const businesses = sqliteTable('businesses', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').references(() => users.id), // Owner of the business

  // Fields from JSON data
  slug: text('slug').notNull().unique(),
  nombre: text('nombre').notNull(),
  descripcion: text('descripcion'),
  direccion: text('direccion'),
  telefono: text('telefono'),
  email: text('email'),
  web: text('web'),

  // Categorization
  categoriaSlug: text('categoria_slug').notNull(),
  ciudadSlug: text('ciudad_slug').notNull(),
  barrioSlug: text('barrio_slug').notNull(),

  // Coordinates
  lat: text('lat'), // Storing as text to avoid precision issues, or real
  lng: text('lng'),

  // Rating
  valoracionMedia: integer('valoracion_media'), // Or real if needed
  numResenas: integer('num_resenas'),

  // Extra
  serviciosDestacados: text('servicios_destacados'), // JSON stringified array?
  urlGoogleMaps: text('url_google_maps'),
  horario: text('horario'),

  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});
