import { Router } from 'express';
import {
  getProject,
  listProjects,
} from '../controllers/projects.controller.ts';
import { asyncHandler } from '../utils/asyncHandler.ts';

export const projectsRouter = Router();

projectsRouter.get('/', asyncHandler(listProjects));
projectsRouter.get('/:id', asyncHandler(getProject));
