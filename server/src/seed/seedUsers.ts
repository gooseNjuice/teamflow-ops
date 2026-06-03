import { users } from '../data/users.data.ts';
import { UserModel } from '../models/user.model.ts';

export async function seedUsers() {
  const existingUserCount = await UserModel.estimatedDocumentCount();

  if (existingUserCount > 0) {
    console.log('User seed skipped; users collection already has data.');
    return;
  }

  await UserModel.insertMany(users);

  console.log(`Seeded ${users.length} demo users.`);
}
