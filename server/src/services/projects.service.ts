import { randomUUID } from 'node:crypto';
import { ProjectModel } from '../models/project.model.ts';
import type { CreateProjectInput, UpdateProjectInput } from '../schemas/project.schemas.ts';
import type { Project } from '../types/project.types.ts';

export async function getProjects() {
  return ProjectModel.find({})
    .select('-_id -__v')
    .sort({ createdAt: 1 })
    .lean<Project[]>();
}

export async function getProjectById(id: string) {
  return ProjectModel.findOne({ id }).select('-_id -__v').lean<Project>();
}

export async function createProject(data: CreateProjectInput & { ownerId: string }) {
  const now = new Date().toISOString();
  const project = await ProjectModel.create({
    ...data,
    id: `project-${randomUUID()}`,
    createdAt: now,
    updatedAt: now,
  });

  return project.toJSON();
}

export async function updateProject(id: string, data: UpdateProjectInput) {
  return ProjectModel.findOneAndUpdate(
    { id },
    {
      ...data,
      updatedAt: new Date().toISOString(),
    },
    { new: true, runValidators: true },
  )
    .select('-_id -__v')
    .lean<Project>();
}
