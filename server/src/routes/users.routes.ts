import { Router } from 'express';
import {
  getUser,
  listUsers,
  updateUserHandler,
} from '../controllers/users.controller.ts';
import { requireRoles } from '../middleware/role.middleware.ts';
import { asyncHandler } from '../utils/asyncHandler.ts';

export const usersRouter = Router();

usersRouter.get('/', asyncHandler(listUsers));
usersRouter.get('/:id', asyncHandler(getUser));
usersRouter.patch('/:id', requireRoles('admin'), asyncHandler(updateUserHandler));
