import { Router } from 'express';
import { ProjectModel } from '../models/project.model.ts';
import type { Project } from '../types/project.types.ts';

export const projectsRouter = Router();

projectsRouter.get('/', async (_req, res, next) => {
  try {
    const projects = await ProjectModel.find({})
      .select('-_id -__v')
      .sort({ createdAt: 1 })
      .lean<Project[]>();

    return res.json(projects);
  } catch (error) {
    return next(error);
  }
});

projectsRouter.get('/:id', async (req, res, next) => {
  try {
    const project = await ProjectModel.findOne({ id: req.params.id })
      .select('-_id -__v')
      .lean<Project>();

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    return res.json(project);
  } catch (error) {
    return next(error);
  }
});
