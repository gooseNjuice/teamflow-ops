import { projects } from '../data/projects.data.ts';
import { users } from '../data/users.data.ts';
import { ProjectModel } from '../models/project.model.ts';

export async function seedProjects() {
  const existingProjectCount = await ProjectModel.estimatedDocumentCount();

  if (existingProjectCount > 0) {
    console.log('Project seed skipped; projects collection already has data.');
    return;
  }

  const demoUserIds = new Set(users.map((user) => user.id));
  const projectWithUnknownOwner = projects.find(
    (project) => !demoUserIds.has(project.ownerId),
  );

  if (projectWithUnknownOwner) {
    throw new Error(
      `Project ${projectWithUnknownOwner.id} references unknown owner ${projectWithUnknownOwner.ownerId}.`,
    );
  }

  await ProjectModel.insertMany(projects);

  console.log(`Seeded ${projects.length} demo projects.`);
}
