import type { RequestHandler } from 'express';
import { createCommentSchema } from '../schemas/comment.schemas.ts';
import {
  createTaskComment,
  getCommentsByTaskId,
} from '../services/comments.service.ts';
import { createTaskActivity } from '../services/activity.service.ts';
import { getTaskById } from '../services/tasks.service.ts';
import { AppError } from '../utils/AppError.ts';

function getTaskId(params: { taskId?: string | string[] }) {
  if (typeof params.taskId !== 'string') {
    throw new AppError('Task not found', 404);
  }

  return params.taskId;
}

export const listTaskComments: RequestHandler = async (req, res) => {
  const comments = await getCommentsByTaskId(getTaskId(req.params));

  return res.json(comments);
};

export const createTaskCommentHandler: RequestHandler = async (req, res) => {
  const taskId = getTaskId(req.params);
  const result = createCommentSchema.safeParse(req.body);

  if (!result.success) {
    throw new AppError(
      'Invalid comment data',
      400,
      result.error.flatten().fieldErrors,
    );
  }

  if (!req.user) {
    throw new AppError('Authentication is required', 401);
  }

  const task = await getTaskById(taskId);

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  const comment = await createTaskComment({
    taskId,
    authorId: req.user.id,
    body: result.data.body,
  });
  await createTaskActivity({
    taskId,
    actorId: req.user.id,
    type: 'comment_created',
    message: `Commented on task "${task.title}"`,
    metadata: {
      commentId: comment.id,
    },
  });

  return res.status(201).json(comment);
};
