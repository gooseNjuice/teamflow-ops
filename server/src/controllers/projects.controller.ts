import type { RequestHandler } from 'express';
import {
  createProjectSchema,
  updateProjectSchema,
} from '../schemas/project.schemas.ts';
import {
  createProject,
  getProjectById,
  getProjects,
  updateProject,
} from '../services/projects.service.ts';
import { getUserById } from '../services/users.service.ts';
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

async function validateOwner(ownerId: string) {
  const owner = await getUserById(ownerId);

  if (!owner) {
    throw new AppError('Project owner not found', 400);
  }
}

export const createProjectHandler: RequestHandler = async (req, res) => {
  const result = createProjectSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(
      'Invalid project data',
      400,
      result.error.flatten().fieldErrors,
    );
  }

  const ownerId = result.data.ownerId ?? req.user?.id;

  if (!ownerId) {
    throw new AppError('Project owner is required', 400);
  }

  await validateOwner(ownerId);

  const project = await createProject({
    ...result.data,
    ownerId,
  });

  return res.status(201).json(project);
};

export const updateProjectHandler: RequestHandler = async (req, res) => {
  const result = updateProjectSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(
      'Invalid project data',
      400,
      result.error.flatten().fieldErrors,
    );
  }

  if (result.data.ownerId) {
    await validateOwner(result.data.ownerId);
  }

  const project = await updateProject(getProjectId(req.params), result.data);

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  return res.json(project);
};
