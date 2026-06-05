import { Router } from 'express';
import { getCurrentUser, login, register } from '../controllers/auth.controller.ts';
import { authenticate } from '../middleware/auth.middleware.ts';
import { asyncHandler } from '../utils/asyncHandler.ts';

export const authRouter = Router();

authRouter.get('/me', asyncHandler(authenticate), asyncHandler(getCurrentUser));
authRouter.post('/register', asyncHandler(register));
authRouter.post('/login', asyncHandler(login));
