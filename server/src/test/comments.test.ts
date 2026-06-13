import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../app.ts';
import { TaskModel } from '../models/task.model.ts';
import { TaskCommentModel } from '../models/taskComment.model.ts';

const password = 'Password123!';

async function registerTestUser({
  email,
  role = 'developer',
}: {
  email: string;
  role?: 'admin' | 'manager' | 'developer' | 'viewer';
}) {
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Comment Test User',
      email,
      password,
      role,
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
    id: 'task-comments-1',
    title: 'Task with comments',
    description: 'Used for comment API tests.',
    status: 'todo',
    priority: 'medium',
    assigneeId,
    projectId: 'project-comments-1',
    createdAt: now,
    updatedAt: now,
    archived: false,
  });
}

describe('task comments API', () => {
  it('returns comments for a task sorted by creation date', async () => {
    const { token, user } = await registerTestUser({
      email: 'comment-reader@example.com',
    });
    await createTestTask(user.id);
    await TaskCommentModel.create([
      {
        id: 'comment-newer',
        taskId: 'task-comments-1',
        authorId: user.id,
        body: 'Newer comment',
        createdAt: '2026-06-02T09:00:00.000Z',
        updatedAt: '2026-06-02T09:00:00.000Z',
      },
      {
        id: 'comment-older',
        taskId: 'task-comments-1',
        authorId: user.id,
        body: 'Older comment',
        createdAt: '2026-06-01T09:00:00.000Z',
        updatedAt: '2026-06-01T09:00:00.000Z',
      },
    ]);

    const response = await request(app)
      .get('/api/tasks/task-comments-1/comments')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual([
      expect.objectContaining({ id: 'comment-older', body: 'Older comment' }),
      expect.objectContaining({ id: 'comment-newer', body: 'Newer comment' }),
    ]);
  });

  it('creates a comment using the authenticated user as author', async () => {
    const { token, user } = await registerTestUser({
      email: 'comment-author@example.com',
    });
    await createTestTask(user.id);

    const response = await request(app)
      .post('/api/tasks/task-comments-1/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        body: 'This is a useful update.',
        authorId: 'spoofed-user',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      taskId: 'task-comments-1',
      authorId: user.id,
      body: 'This is a useful update.',
    });
    expect(response.body.id).toEqual(expect.any(String));
    expect(response.body.createdAt).toEqual(expect.any(String));
    expect(response.body.updatedAt).toEqual(expect.any(String));
    expect(response.body).not.toHaveProperty('_id');
    expect(response.body).not.toHaveProperty('__v');
  });

  it('rejects comment creation for viewers', async () => {
    const { token, user } = await registerTestUser({
      email: 'comment-viewer@example.com',
      role: 'viewer',
    });
    await createTestTask(user.id);

    const response = await request(app)
      .post('/api/tasks/task-comments-1/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ body: 'Viewer should not create this.' })
      .expect(403);

    expect(response.body).toEqual({
      message: 'You do not have permission to perform this action',
    });
  });

  it('returns 404 when creating a comment for a missing task', async () => {
    const { token } = await registerTestUser({
      email: 'comment-missing-task@example.com',
    });

    const response = await request(app)
      .post('/api/tasks/missing-task/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ body: 'Cannot attach this comment.' })
      .expect(404);

    expect(response.body).toEqual({ message: 'Task not found' });
  });
});
