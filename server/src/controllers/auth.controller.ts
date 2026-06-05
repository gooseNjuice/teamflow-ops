import type { RequestHandler } from 'express';
import { loginSchema, registerSchema } from '../schemas/auth.schemas.ts';
import { loginUser, registerUser } from '../services/auth.service.ts';
import { AppError } from '../utils/AppError.ts';

export const register: RequestHandler = async (req, res) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(
      'Invalid registration data',
      400,
      result.error.flatten().fieldErrors,
    );
  }

  const authResult = await registerUser(result.data);

  return res.status(201).json(authResult);
};

export const login: RequestHandler = async (req, res) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(
      'Invalid login data',
      400,
      result.error.flatten().fieldErrors,
    );
  }

  const authResult = await loginUser(result.data);

  return res.json(authResult);
};

export const getCurrentUser: RequestHandler = async (req, res) => {
  if (!req.user) {
    throw new AppError('Authentication token is required', 401);
  }

  return res.json(req.user);
};
