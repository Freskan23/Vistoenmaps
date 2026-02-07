import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-change-me';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: 'admin' | 'business';
  };
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET) as any;
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

export const verifyAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  verifyToken(req, res, () => {
    if (req.user?.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
  });
};
