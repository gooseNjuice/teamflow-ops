import { Router } from 'express';
import { projects } from '../data/projects.data.ts';

export const projectsRouter = Router();

projectsRouter.get('/', (_req, res) => {
  return res.json(projects);
});

projectsRouter.get('/:id', (req, res) => {
  const project = projects.find((item) => item.id === req.params.id);

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  return res.json(project);
});
