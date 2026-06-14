import { Router } from 'express';
import {
  archiveTask,
  createTaskHandler,
  getTask,
  listTasks,
  restoreTask,
  updateTaskHandler,
} from '../controllers/tasks.controller.ts';
import { requireRoles } from '../middleware/role.middleware.ts';
import { activityRouter } from './activity.routes.ts';
import { commentsRouter } from './comments.routes.ts';
import { asyncHandler } from '../utils/asyncHandler.ts';

export const tasksRouter = Router();

const canWriteTasks = requireRoles('admin', 'manager', 'developer');
const canArchiveTasks = requireRoles('admin', 'manager');

tasksRouter.get('/', asyncHandler(listTasks));
tasksRouter.use('/:taskId/activity', activityRouter);
tasksRouter.use('/:taskId/comments', commentsRouter);
tasksRouter.get('/:id', asyncHandler(getTask));
tasksRouter.post('/', canWriteTasks, asyncHandler(createTaskHandler));
tasksRouter.patch('/:id', canWriteTasks, asyncHandler(updateTaskHandler));
tasksRouter.patch('/:id/archive', canArchiveTasks, asyncHandler(archiveTask));
tasksRouter.patch('/:id/restore', canArchiveTasks, asyncHandler(restoreTask));
