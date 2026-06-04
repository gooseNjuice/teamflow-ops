import { Router } from 'express';
import {
  archiveTask,
  createTaskHandler,
  getTask,
  listTasks,
  restoreTask,
  updateTaskHandler,
} from '../controllers/tasks.controller.ts';
import { asyncHandler } from '../utils/asyncHandler.ts';

export const tasksRouter = Router();

tasksRouter.get('/', asyncHandler(listTasks));
tasksRouter.get('/:id', asyncHandler(getTask));
tasksRouter.post('/', asyncHandler(createTaskHandler));
tasksRouter.patch('/:id', asyncHandler(updateTaskHandler));
tasksRouter.patch('/:id/archive', asyncHandler(archiveTask));
tasksRouter.patch('/:id/restore', asyncHandler(restoreTask));
