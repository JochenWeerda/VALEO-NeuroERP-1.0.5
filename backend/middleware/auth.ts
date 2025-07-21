import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';
import config from '../config/database';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        permissions: string[];
      };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Kein Token bereitgestellt', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'valeo-secret') as any;

    // Check if user still exists
    const client = await config.connect();
    try {
      const result = await client.query(
        'SELECT id, email, vorname, nachname, rolle FROM personal.mitarbeiter WHERE id = $1 AND aktiv = true',
        [decoded.id]
      );

      if (result.rows.length === 0) {
        throw new AppError('Benutzer nicht gefunden oder inaktiv', 401);
      }

      const user = result.rows[0];

      // Get user permissions
      const permissionsResult = await client.query(
        'SELECT berechtigung FROM personal.benutzer_berechtigungen WHERE mitarbeiter_id = $1',
        [user.id]
      );

      const permissions = permissionsResult.rows.map(row => row.berechtigung);

      // Add user to request
      req.user = {
        id: user.id,
        email: user.email,
        role: user.rolle,
        permissions
      };

      next();
    } finally {
      client.release();
    }
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Ungültiger Token', 401));
    }
  }
};

// Role-based authorization middleware
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Nicht authentifiziert', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Keine Berechtigung für diese Aktion', 403));
    }

    next();
  };
};

// Permission-based authorization middleware
export const requirePermission = (permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Nicht authentifiziert', 401));
    }

    const hasPermission = permissions.some(permission => 
      req.user!.permissions.includes(permission)
    );

    if (!hasPermission) {
      return next(new AppError('Keine Berechtigung für diese Aktion', 403));
    }

    next();
  };
};

// Optional authentication middleware (for public endpoints)
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without user
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'valeo-secret') as any;

    const client = await config.connect();
    try {
      const result = await client.query(
        'SELECT id, email, vorname, nachname, rolle FROM personal.mitarbeiter WHERE id = $1 AND aktiv = true',
        [decoded.id]
      );

      if (result.rows.length > 0) {
        const user = result.rows[0];
        
        const permissionsResult = await client.query(
          'SELECT berechtigung FROM personal.benutzer_berechtigungen WHERE mitarbeiter_id = $1',
          [user.id]
        );

        const permissions = permissionsResult.rows.map(row => row.berechtigung);

        req.user = {
          id: user.id,
          email: user.email,
          role: user.rolle,
          permissions
        };
      }
    } finally {
      client.release();
    }

    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
}; 