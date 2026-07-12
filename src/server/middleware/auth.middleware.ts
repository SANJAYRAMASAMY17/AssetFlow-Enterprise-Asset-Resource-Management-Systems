import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: Role;
  };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';
    const decoded = jwt.verify(token, secret) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== Role.ADMIN) {
    return res.status(403).json({ error: 'Forbidden. Admin access required.' });
  }
  next();
};

export const requireApprover = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || (req.user.role !== Role.ADMIN && req.user.role !== Role.DEPARTMENT_HEAD)) {
    return res.status(403).json({ error: 'Forbidden. Approver access required.' });
  }
  next();
};
