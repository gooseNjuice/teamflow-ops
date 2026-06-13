import { model, Schema } from 'mongoose';
import { type TaskComment } from '../types/comment.types.ts';

const taskCommentSchema = new Schema<TaskComment>(
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
    authorId: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
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
    collection: 'task_comments',
    id: false,
    toJSON: {
      transform: (_document, returnedObject: Record<string, unknown>) => {
        const { _id: _ignoredId, __v: _ignoredVersion, ...comment } =
          returnedObject;

        return comment;
      },
    },
    toObject: {
      transform: (_document, returnedObject: Record<string, unknown>) => {
        const { _id: _ignoredId, __v: _ignoredVersion, ...comment } =
          returnedObject;

        return comment;
      },
    },
  },
);

export const TaskCommentModel = model<TaskComment>(
  'TaskComment',
  taskCommentSchema,
);
