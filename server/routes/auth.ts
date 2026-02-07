import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-change-me';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'business']).default('business'), // Optional, defaults to business
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, role } = registerSchema.parse(req.body);

    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).get();
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const result = await db.insert(users).values({
      email,
      password: hashedPassword,
      role: role as 'admin' | 'business',
    }).returning().get();

    res.status(201).json({ message: 'User created', userId: result.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.issues });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const user = await db.select().from(users).where(eq(users.email, email)).get();
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
     if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.issues });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
