import { randomUUID } from 'node:crypto';
import { TaskCommentModel } from '../models/taskComment.model.ts';
import type { CreateCommentInput } from '../schemas/comment.schemas.ts';
import type { TaskComment } from '../types/comment.types.ts';

export async function getCommentsByTaskId(taskId: string) {
  return TaskCommentModel.find({ taskId })
    .select('-_id -__v')
    .sort({ createdAt: 1 })
    .lean<TaskComment[]>();
}

export async function createTaskComment({
  authorId,
  body,
  taskId,
}: CreateCommentInput & { authorId: string; taskId: string }) {
  const now = new Date().toISOString();
  const comment = await TaskCommentModel.create({
    id: `comment-${randomUUID()}`,
    taskId,
    authorId,
    body,
    createdAt: now,
    updatedAt: now,
  });

  return comment.toJSON();
}
