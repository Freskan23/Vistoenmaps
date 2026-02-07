import { db } from '../../server/db';
import { businesses } from '../../server/db/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

const dataDir = path.resolve('client/src/data');

const loadJson = (filename: string) => {
  const filePath = path.join(dataDir, filename);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

const migrate = async () => {
  console.log('Starting migration...');

  // Load existing data
  const negocios = loadJson('negocios.json') || [];

  for (const n of negocios) {
    try {
      // Check if exists
      const existing = await db.select().from(businesses).where(eq(businesses.slug, n.slug)).get();
      if (existing) {
        console.log(`Skipping existing business: ${n.slug}`);
        continue;
      }

      await db.insert(businesses).values({
        userId: null, // Initially unassigned
        slug: n.slug,
        nombre: n.nombre,
        categoriaSlug: n.categoria_slug,
        ciudadSlug: n.ciudad_slug,
        barrioSlug: n.barrio_slug,
        direccion: n.direccion,
        telefono: n.telefono,
        horario: n.horario,
        lat: n.coordenadas?.lat?.toString(),
        lng: n.coordenadas?.lng?.toString(),
        valoracionMedia: n.valoracion_media,
        numResenas: n.num_resenas,
        serviciosDestacados: JSON.stringify(n.servicios_destacados || []),
        urlGoogleMaps: n.url_google_maps,
      });
      console.log(`Migrated: ${n.slug}`);
    } catch (e) {
      console.error(`Error migrating ${n.slug}:`, e);
    }
  }

  console.log('Migration complete.');
};

migrate().catch(console.error);
