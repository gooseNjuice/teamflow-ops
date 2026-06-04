import bcrypt from 'bcryptjs';
import { users } from '../data/users.data.ts';
import { UserModel } from '../models/user.model.ts';

const DEMO_PASSWORD = 'Password123!';
const PASSWORD_SALT_ROUNDS = 10;

async function getDemoPasswordHash() {
  return bcrypt.hash(DEMO_PASSWORD, PASSWORD_SALT_ROUNDS);
}

async function backfillDemoUserPasswordHashes(passwordHash: string) {
  const backfillResults = await Promise.all(
    users.map((user) =>
      UserModel.updateOne(
        {
          id: user.id,
          $or: [
            { passwordHash: { $exists: false } },
            { passwordHash: null },
            { passwordHash: '' },
          ],
        },
        { $set: { passwordHash } },
      ),
    ),
  );
  const backfilledUserCount = backfillResults.reduce(
    (total, result) => total + result.modifiedCount,
    0,
  );

  if (backfilledUserCount > 0) {
    console.log(`Backfilled password hashes for ${backfilledUserCount} demo users.`);
  }
}

export async function seedUsers() {
  const existingUserCount = await UserModel.estimatedDocumentCount();
  const passwordHash = await getDemoPasswordHash();

  if (existingUserCount > 0) {
    await backfillDemoUserPasswordHashes(passwordHash);
    console.log('User seed skipped; users collection already has data.');
    return;
  }

  await UserModel.insertMany(users.map((user) => ({ ...user, passwordHash })));

  console.log(`Seeded ${users.length} demo users.`);
}
