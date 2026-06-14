import { Router } from 'express';
import {
  createProjectHandler,
  getProject,
  listProjects,
  updateProjectHandler,
} from '../controllers/projects.controller.ts';
import { requireRoles } from '../middleware/role.middleware.ts';
import { asyncHandler } from '../utils/asyncHandler.ts';

export const projectsRouter = Router();

const canWriteProjects = requireRoles('admin', 'manager');

projectsRouter.get('/', asyncHandler(listProjects));
projectsRouter.post('/', canWriteProjects, asyncHandler(createProjectHandler));
projectsRouter.get('/:id', asyncHandler(getProject));
projectsRouter.patch('/:id', canWriteProjects, asyncHandler(updateProjectHandler));
