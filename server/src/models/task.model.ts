import { model, Schema } from 'mongoose';
import { type Task } from '../types/task.types.ts';

const taskStatuses = ['backlog', 'todo', 'in-progress', 'in-review', 'done'] as const;
const taskPriorities = ['low', 'medium', 'high'] as const;

const taskSchema = new Schema<Task>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
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
      enum: taskStatuses,
      required: true,
    },
    priority: {
      type: String,
      enum: taskPriorities,
      required: true,
    },
    assigneeId: {
      type: String,
      required: true,
      trim: true,
    },
    projectId: {
      type: String,
      required: true,
      trim: true,
    },
    dueDate: {
      type: String,
    },
    createdAt: {
      type: String,
      required: true,
    },
    updatedAt: {
      type: String,
      required: true,
    },
    archived: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    collection: 'tasks',
    id: false,
    toJSON: {
      transform: (_document, returnedObject: Record<string, unknown>) => {
        const { _id: _ignoredId, __v: _ignoredVersion, ...task } = returnedObject;

        return task;
      },
    },
    toObject: {
      transform: (_document, returnedObject: Record<string, unknown>) => {
        const { _id: _ignoredId, __v: _ignoredVersion, ...task } = returnedObject;

        return task;
      },
    },
  },
);

export const TaskModel = model<Task>('Task', taskSchema);
