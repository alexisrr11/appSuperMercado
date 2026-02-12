import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  userId?: number;
}

interface JwtPayload {
  userId: number;
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token no proporcionado' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    res.status(500).json({ message: 'JWT_SECRET no configurado' });
    return;
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as JwtPayload;
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido' });
  }
}
