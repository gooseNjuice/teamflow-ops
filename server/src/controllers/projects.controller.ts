import type { RequestHandler } from 'express';
import {
  getProjectById,
  getProjects,
} from '../services/projects.service.ts';
import { AppError } from '../utils/AppError.ts';

function getProjectId(params: { id?: string | string[] }) {
  if (typeof params.id !== 'string') {
    throw new AppError('Project not found', 404);
  }

  return params.id;
}

export const listProjects: RequestHandler = async (_req, res) => {
  const projects = await getProjects();

  return res.json(projects);
};

export const getProject: RequestHandler = async (req, res) => {
  const project = await getProjectById(getProjectId(req.params));

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  return res.json(project);
};
