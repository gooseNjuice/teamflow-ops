import { model, Schema } from 'mongoose';
import { type TaskActivity } from '../types/activity.types.ts';

const taskActivityTypes = [
  'task_created',
  'task_updated',
  'status_changed',
  'task_archived',
  'task_restored',
  'comment_created',
] as const;

const taskActivitySchema = new Schema<TaskActivity>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    taskId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    actorId: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: taskActivityTypes,
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    createdAt: {
      type: String,
      required: true,
    },
  },
  {
    collection: 'task_activities',
    id: false,
    toJSON: {
      transform: (_document, returnedObject: Record<string, unknown>) => {
        const { _id: _ignoredId, __v: _ignoredVersion, ...activity } =
          returnedObject;

        return activity;
      },
    },
    toObject: {
      transform: (_document, returnedObject: Record<string, unknown>) => {
        const { _id: _ignoredId, __v: _ignoredVersion, ...activity } =
          returnedObject;

        return activity;
      },
    },
  },
);

export const TaskActivityModel = model<TaskActivity>(
  'TaskActivity',
  taskActivitySchema,
);
