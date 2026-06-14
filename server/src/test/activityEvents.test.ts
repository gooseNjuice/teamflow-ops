import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../app.ts';
import { TaskModel } from '../models/task.model.ts';

const password = 'Password123!';

async function registerTestUser(email: string) {
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Activity Event User',
      email,
      password,
      role: 'manager',
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

async function createExistingTask(assigneeId: string) {
  const now = new Date().toISOString();

  await TaskModel.create({
    id: 'task-events-1',
    title: 'Task with tracked events',
    description: 'Used for activity event tests.',
    status: 'todo',
    priority: 'medium',
    assigneeId,
    projectId: 'project-events-1',
    createdAt: now,
    updatedAt: now,
    archived: false,
  });
}

async function getActivity(token: string, taskId: string) {
  const response = await request(app)
    .get(`/api/tasks/${taskId}/activity`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  return response.body as Array<{
    actorId: string;
    type: string;
    message: string;
    metadata?: Record<string, unknown>;
  }>;
}

describe('task activity events', () => {
  it('records task creation activity', async () => {
    const { token, user } = await registerTestUser('events-create@example.com');

    const createdTaskResponse = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Track created task',
        description: 'This task should create activity.',
        status: 'todo',
        priority: 'high',
        assigneeId: user.id,
        projectId: 'project-events-1',
      })
      .expect(201);

    const activity = await getActivity(token, createdTaskResponse.body.id);

    expect(activity[0]).toMatchObject({
      actorId: user.id,
      type: 'task_created',
      message: 'Created task "Track created task"',
    });
  });

  it('records task update and status change activity', async () => {
    const { token, user } = await registerTestUser('events-update@example.com');
    await createExistingTask(user.id);

    await request(app)
      .patch('/api/tasks/task-events-1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated tracked task',
        description: 'Used for activity event tests.',
        status: 'in-progress',
      })
      .expect(200);

    const activity = await getActivity(token, 'task-events-1');

    expect(activity).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: user.id,
          type: 'status_changed',
          metadata: {
            previousStatus: 'todo',
            nextStatus: 'in-progress',
          },
        }),
        expect.objectContaining({
          actorId: user.id,
          type: 'task_updated',
          metadata: {
            changedFields: ['title'],
          },
        }),
      ]),
    );
  });

  it('records archive and restore activity', async () => {
    const { token, user } = await registerTestUser('events-archive@example.com');
    await createExistingTask(user.id);

    await request(app)
      .patch('/api/tasks/task-events-1/archive')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    await request(app)
      .patch('/api/tasks/task-events-1/restore')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const activity = await getActivity(token, 'task-events-1');

    expect(activity).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: user.id,
          type: 'task_archived',
        }),
        expect.objectContaining({
          actorId: user.id,
          type: 'task_restored',
        }),
      ]),
    );
  });

  it('records comment creation activity', async () => {
    const { token, user } = await registerTestUser('events-comment@example.com');
    await createExistingTask(user.id);

    const commentResponse = await request(app)
      .post('/api/tasks/task-events-1/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ body: 'This comment should be tracked.' })
      .expect(201);

    const activity = await getActivity(token, 'task-events-1');

    expect(activity[0]).toMatchObject({
      actorId: user.id,
      type: 'comment_created',
      metadata: {
        commentId: commentResponse.body.id,
      },
    });
  });
});
