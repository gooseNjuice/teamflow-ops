import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.routes.ts';
import { tasksRouter } from './routes/tasks.routes.ts';

export const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/health', healthRouter);
app.use('/api/tasks', tasksRouter);