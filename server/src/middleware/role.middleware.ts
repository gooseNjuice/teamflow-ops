import type { RequestHandler } from 'express';
import type { UserRole } from '../types/user.types.ts';
import { AppError } from '../utils/AppError.ts';

export function requireRoles(...allowedRoles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      throw new AppError('Authentication is required', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError('You do not have permission to perform this action', 403);
    }

    next();
  };
}
