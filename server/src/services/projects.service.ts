import { ProjectModel } from '../models/project.model.ts';
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
