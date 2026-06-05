import { Router } from 'express';
import { login, register } from '../controllers/auth.controller.ts';
import { asyncHandler } from '../utils/asyncHandler.ts';

export const authRouter = Router();

authRouter.post('/register', asyncHandler(register));
authRouter.post('/login', asyncHandler(login));
