import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtRequest extends Request {
  user?: { id: string; email: string };
}

export const jwtMiddleware = (req: JwtRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No autorizado' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No autorizado' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret_key') as {
      id: string;
      email: string;
    };
    req.user = { id: payload.id, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido' });
  }
};
