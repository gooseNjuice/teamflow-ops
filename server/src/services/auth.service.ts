import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { UserModel } from '../models/user.model.ts';
import type { LoginInput, RegisterInput } from '../schemas/auth.schemas.ts';
import type { User, UserRole } from '../types/user.types.ts';
import { AppError } from '../utils/AppError.ts';
import { signAuthToken } from '../utils/jwt.ts';

type PublicUser = Omit<User, 'passwordHash'>;

type AuthResult = {
  user: PublicUser;
  token: string;
};

function toPublicUser(user: User): PublicUser {
  const { passwordHash: _ignoredPasswordHash, ...publicUser } = user;

  return publicUser;
}

function createToken(user: PublicUser) {
  return signAuthToken({
    userId: user.id,
    email: user.email,
    role: user.role as UserRole,
  });
}

export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  const existingUser = await UserModel.findOne({ email: input.email }).select('_id');

  if (existingUser) {
    throw new AppError('Email is already registered', 409);
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await UserModel.create({
    id: `user-${randomUUID()}`,
    name: input.name,
    email: input.email,
    role: input.role,
    passwordHash,
    createdAt: new Date().toISOString(),
  });
  const publicUser = toPublicUser(user.toJSON() as User);

  return {
    user: publicUser,
    token: createToken(publicUser),
  };
}

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const user = await UserModel.findOne({ email: input.email }).select('+passwordHash');

  if (!user?.passwordHash) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const publicUser = toPublicUser(user.toJSON() as User);

  return {
    user: publicUser,
    token: createToken(publicUser),
  };
}
