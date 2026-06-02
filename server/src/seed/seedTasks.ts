import { tasks } from '../data/tasks.data.ts';
import { TaskModel } from '../models/task.model.ts';

export async function seedTasks() {
  const existingTaskCount = await TaskModel.estimatedDocumentCount();

  if (existingTaskCount > 0) {
    console.log('Task seed skipped; tasks collection already has data.');
    return;
  }

  await TaskModel.insertMany(tasks);

  console.log(`Seeded ${tasks.length} demo tasks.`);
}
