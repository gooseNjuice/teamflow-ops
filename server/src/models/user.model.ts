import { model, Schema } from 'mongoose';
import { type User } from '../types/user.types.ts';

const userRoles = ['admin', 'manager', 'developer', 'viewer'] as const;

const userSchema = new Schema<User>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: userRoles,
      required: true,
    },
    avatarUrl: {
      type: String,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    createdAt: {
      type: String,
      required: true,
    },
  },
  {
    collection: 'users',
    id: false,
    toJSON: {
      transform: (_document, returnedObject: Record<string, unknown>) => {
        const {
          _id: _ignoredId,
          __v: _ignoredVersion,
          passwordHash: _ignoredPasswordHash,
          ...user
        } = returnedObject;

        return user;
      },
    },
    toObject: {
      transform: (_document, returnedObject: Record<string, unknown>) => {
        const {
          _id: _ignoredId,
          __v: _ignoredVersion,
          passwordHash: _ignoredPasswordHash,
          ...user
        } = returnedObject;

        return user;
      },
    },
  },
);

export const UserModel = model<User>('User', userSchema);
