import { Router } from 'express';
import { getUser, listUsers } from '../controllers/users.controller.ts';
import { asyncHandler } from '../utils/asyncHandler.ts';

export const usersRouter = Router();

usersRouter.get('/', asyncHandler(listUsers));
usersRouter.get('/:id', asyncHandler(getUser));
