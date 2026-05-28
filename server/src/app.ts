import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.routes.ts';
import { projectsRouter } from './routes/projects.routes.ts';
import { tasksRouter } from './routes/tasks.routes.ts';
import { usersRouter } from './routes/users.routes.ts';

export const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/health', healthRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/users', usersRouter);
