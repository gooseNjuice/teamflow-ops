import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, afterEach, beforeAll } from 'vitest';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-jwt-secret';
  process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1h';

  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();

  await mongoose.connect(process.env.MONGODB_URI);
});

afterEach(async () => {
  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    return;
  }

  const collections = await mongoose.connection.db.collections();

  await Promise.all(
    collections.map((collection) => collection.deleteMany({})),
  );
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
