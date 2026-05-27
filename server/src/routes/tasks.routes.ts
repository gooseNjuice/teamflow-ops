import {Router} from 'express';
import { tasks } from '../data/tasks.data.ts';

export const tasksRouter = Router();

tasksRouter.get('/', (_req, res) => {
    res.json(tasks);
});

tasksRouter.get('/:id', (req, res) => {
    const task = tasks.find(t => t.id === req.params.id);

    if (!task) {
        return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
});
