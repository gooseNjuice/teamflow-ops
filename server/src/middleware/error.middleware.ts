import type { ErrorRequestHandler } from 'express';
import { AppError } from '../utils/AppError.ts';

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      ...(error.details ? { errors: error.details } : {}),
    });
  }

  console.error(error);

  return res.status(500).json({ message: 'Internal server error' });
};
