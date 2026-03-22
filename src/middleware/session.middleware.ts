import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const SessionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.authToken || req.headers['authorization'];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized access: Missing token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = (decoded as any).user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized access' });
  }
};