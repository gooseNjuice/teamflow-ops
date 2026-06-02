import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { TaskModel } from '../models/task.model.ts';
import { createTaskSchema, updateTaskSchema } from '../schemas/task.schemas.ts';
import type { Task } from '../types/task.types.ts';

export const tasksRouter = Router();

tasksRouter.get('/', async (req, res, next) => {
  try {
    const includeArchived = req.query.includeArchived === 'true';
    const onlyArchived = req.query.archived === 'true';
    const filter = includeArchived ? {} : { archived: onlyArchived };
    const tasks = await TaskModel.find(filter)
      .select('-_id -__v')
      .sort({ createdAt: 1 })
      .lean<Task[]>();

    return res.json(tasks);
  } catch (error) {
    return next(error);
  }
});

tasksRouter.get('/:id', async (req, res, next) => {
  try {
    const task = await TaskModel.findOne({ id: req.params.id })
      .select('-_id -__v')
      .lean<Task>();

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.json(task);
  } catch (error) {
    return next(error);
  }
});

tasksRouter.post('/', async (req, res, next) => {
  const result = createTaskSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: 'Invalid task data',
      errors: result.error.flatten().fieldErrors,
    });
  }

  try {
    const now = new Date().toISOString();

    const newTask = await TaskModel.create({
      id: `task-${randomUUID()}`,
      title: result.data.title,
      description: result.data.description,
      status: result.data.status,
      priority: result.data.priority,
      assigneeId: result.data.assigneeId,
      projectId: result.data.projectId,
      dueDate: result.data.dueDate,
      createdAt: now,
      updatedAt: now,
      archived: false,
    });

    return res.status(201).json(newTask.toJSON());
  } catch (error) {
    return next(error);
  }
});

tasksRouter.patch('/:id', async (req, res, next) => {
  const result = updateTaskSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: 'Invalid task data',
      errors: result.error.flatten().fieldErrors,
    });
  }

  try {
    const task = await TaskModel.findOneAndUpdate(
      { id: req.params.id },
      {
        ...result.data,
        updatedAt: new Date().toISOString(),
      },
      { new: true, runValidators: true },
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.json(task.toJSON());
  } catch (error) {
    return next(error);
  }
});

tasksRouter.patch('/:id/archive', async (req, res, next) => {
  try {
    const task = await TaskModel.findOneAndUpdate(
      { id: req.params.id },
      {
        archived: true,
        updatedAt: new Date().toISOString(),
      },
      { new: true, runValidators: true },
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.json(task.toJSON());
  } catch (error) {
    return next(error);
  }
});

tasksRouter.patch('/:id/restore', async (req, res, next) => {
  try {
    const task = await TaskModel.findOneAndUpdate(
      { id: req.params.id },
      {
        archived: false,
        updatedAt: new Date().toISOString(),
      },
      { new: true, runValidators: true },
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.json(task.toJSON());
  } catch (error) {
    return next(error);
  }
});
