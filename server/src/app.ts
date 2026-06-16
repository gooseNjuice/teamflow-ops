import express from 'express';
import cors from 'cors';
import { authenticate } from './middleware/auth.middleware.ts';
import { errorMiddleware } from './middleware/error.middleware.ts';
import { notFoundMiddleware } from './middleware/notFound.middleware.ts';
import { authRouter } from './routes/auth.routes.ts';
import { healthRouter } from './routes/health.routes.ts';
import { projectsRouter } from './routes/projects.routes.ts';
import { searchRouter } from './routes/search.routes.ts';
import { tasksRouter } from './routes/tasks.routes.ts';
import { usersRouter } from './routes/users.routes.ts';
import { asyncHandler } from './utils/asyncHandler.ts';

export const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/health', healthRouter);
app.use('/api/search', asyncHandler(authenticate), searchRouter);
app.use('/api/projects', asyncHandler(authenticate), projectsRouter);
app.use('/api/tasks', asyncHandler(authenticate), tasksRouter);
app.use('/api/users', asyncHandler(authenticate), usersRouter);
app.use('/api', notFoundMiddleware);
app.use(errorMiddleware);
