import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../app.ts';
import { TaskActivityModel } from '../models/taskActivity.model.ts';
import { TaskModel } from '../models/task.model.ts';

const password = 'Password123!';

async function registerTestUser(email: string) {
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Activity Test User',
      email,
      password,
      role: 'developer',
    })
    .expect(201);

  return response.body as {
    token: string;
    user: {
      id: string;
      email: string;
      role: string;
    };
  };
}

async function createTestTask(assigneeId: string) {
  const now = new Date().toISOString();

  await TaskModel.create({
    id: 'task-activity-1',
    title: 'Task with activity',
    description: 'Used for activity API tests.',
    status: 'todo',
    priority: 'medium',
    assigneeId,
    projectId: 'project-activity-1',
    createdAt: now,
    updatedAt: now,
    archived: false,
  });
}

describe('task activity API', () => {
  it('returns activity for a task sorted by newest first', async () => {
    const { token, user } = await registerTestUser('activity-reader@example.com');
    await createTestTask(user.id);
    await TaskActivityModel.create([
      {
        id: 'activity-older',
        taskId: 'task-activity-1',
        actorId: user.id,
        type: 'task_updated',
        message: 'Updated task details',
        createdAt: '2026-06-01T09:00:00.000Z',
      },
      {
        id: 'activity-newer',
        taskId: 'task-activity-1',
        actorId: user.id,
        type: 'status_changed',
        message: 'Moved task to review',
        metadata: {
          fromStatus: 'todo',
          toStatus: 'in-review',
        },
        createdAt: '2026-06-02T09:00:00.000Z',
      },
    ]);

    const response = await request(app)
      .get('/api/tasks/task-activity-1/activity')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual([
      expect.objectContaining({
        id: 'activity-newer',
        type: 'status_changed',
        metadata: {
          fromStatus: 'todo',
          toStatus: 'in-review',
        },
      }),
      expect.objectContaining({
        id: 'activity-older',
        type: 'task_updated',
      }),
    ]);
    expect(response.body[0]).not.toHaveProperty('_id');
    expect(response.body[0]).not.toHaveProperty('__v');
  });

  it('returns 404 when reading activity for a missing task', async () => {
    const { token } = await registerTestUser('activity-missing-task@example.com');

    const response = await request(app)
      .get('/api/tasks/missing-task/activity')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    expect(response.body).toEqual({ message: 'Task not found' });
  });
});
