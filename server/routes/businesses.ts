import express from 'express';
import { db } from '../db';
import { businesses } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { verifyToken, type AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = express.Router();

const businessSchema = z.object({
  slug: z.string().min(3),
  nombre: z.string().min(3),
  descripcion: z.string().optional(),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email().optional(),
  web: z.string().url().optional(),
  categoriaSlug: z.string(),
  ciudadSlug: z.string(),
  barrioSlug: z.string(),
  lat: z.number().optional(), // Convert to string in DB
  lng: z.number().optional(), // Convert to string in DB
  valoracionMedia: z.number().optional(),
  numResenas: z.number().optional(),
  serviciosDestacados: z.array(z.string()).optional(), // Convert to string in DB
  urlGoogleMaps: z.string().url().optional(),
  horario: z.string().optional(),
});

// GET /api/businesses (Public, list all)
router.get('/', async (req, res) => {
  try {
    const allBusinesses = await db.select().from(businesses).all();
    // Parse services back to array if needed
    const result = allBusinesses.map(b => ({
      ...b,
      serviciosDestacados: b.serviciosDestacados ? JSON.parse(b.serviciosDestacados) : [],
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/businesses/mine (Protected, list user's businesses)
router.get('/mine', verifyToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const userBusinesses = await db.select().from(businesses).where(eq(businesses.userId, userId)).all();
    const result = userBusinesses.map(b => ({
      ...b,
      serviciosDestacados: b.serviciosDestacados ? JSON.parse(b.serviciosDestacados) : [],
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/businesses (Protected, create new business)
router.post('/', verifyToken, async (req: AuthRequest, res) => {
  try {
    const data = businessSchema.parse(req.body);
    const userId = req.user!.id;

    // Check slug uniqueness
    const existing = await db.select().from(businesses).where(eq(businesses.slug, data.slug)).get();
    if (existing) {
      return res.status(400).json({ message: 'Slug already exists' });
    }

    const newBusiness = await db.insert(businesses).values({
      ...data,
      userId,
      lat: data.lat?.toString(),
      lng: data.lng?.toString(),
      serviciosDestacados: JSON.stringify(data.serviciosDestacados || []),
    }).returning().get();

    res.status(201).json(newBusiness);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.issues });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/businesses/:id (Protected, update business)
router.put('/:id', verifyToken, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user!.id;
    const role = req.user!.role;

    // Check if business exists
    const business = await db.select().from(businesses).where(eq(businesses.id, id)).get();
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Check permission (Admin or Owner)
    if (role !== 'admin' && business.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const data = businessSchema.partial().parse(req.body);

    const updatedBusiness = await db.update(businesses).set({
      ...data,
      lat: data.lat ? data.lat.toString() : undefined,
      lng: data.lng ? data.lng.toString() : undefined,
      serviciosDestacados: data.serviciosDestacados ? JSON.stringify(data.serviciosDestacados) : undefined,
      updatedAt: new Date(),
    }).where(eq(businesses.id, id)).returning().get();

    res.json(updatedBusiness);
  } catch (error) {
     if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.issues });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/businesses/:id (Protected, delete business)
router.delete('/:id', verifyToken, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user!.id;
    const role = req.user!.role;

    const business = await db.select().from(businesses).where(eq(businesses.id, id)).get();
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    if (role !== 'admin' && business.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await db.delete(businesses).where(eq(businesses.id, id)).run();
    res.json({ message: 'Business deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
