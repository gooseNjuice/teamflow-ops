import { Router } from 'express';
import {
  createTaskCommentHandler,
  listTaskComments,
} from '../controllers/comments.controller.ts';
import { requireRoles } from '../middleware/role.middleware.ts';
import { asyncHandler } from '../utils/asyncHandler.ts';

export const commentsRouter = Router({ mergeParams: true });

const canCreateComments = requireRoles('admin', 'manager', 'developer');

commentsRouter.get('/', asyncHandler(listTaskComments));
commentsRouter.post(
  '/',
  canCreateComments,
  asyncHandler(createTaskCommentHandler),
);
