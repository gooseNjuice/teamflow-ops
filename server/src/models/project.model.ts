import { model, Schema } from 'mongoose';
import { type Project } from '../types/project.types.ts';

const projectStatuses = ['planning', 'active', 'paused', 'completed'] as const;

const projectSchema = new Schema<Project>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      default: '',
    },
    status: {
      type: String,
      enum: projectStatuses,
      required: true,
    },
    ownerId: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: String,
      required: true,
    },
    updatedAt: {
      type: String,
      required: true,
    },
  },
  {
    collection: 'projects',
    id: false,
    toJSON: {
      transform: (_document, returnedObject: Record<string, unknown>) => {
        const { _id: _ignoredId, __v: _ignoredVersion, ...project } = returnedObject;

        return project;
      },
    },
    toObject: {
      transform: (_document, returnedObject: Record<string, unknown>) => {
        const { _id: _ignoredId, __v: _ignoredVersion, ...project } = returnedObject;

        return project;
      },
    },
  },
);

export const ProjectModel = model<Project>('Project', projectSchema);
