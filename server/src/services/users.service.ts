import { UserModel } from '../models/user.model.ts';
import type { UpdateUserInput } from '../schemas/user.schemas.ts';
import type { PublicUser } from '../types/user.types.ts';

export async function getUsers() {
  return UserModel.find({})
    .select('-_id -__v -passwordHash')
    .sort({ createdAt: 1 })
    .lean<PublicUser[]>();
}

export async function getUserById(id: string) {
  return UserModel.findOne({ id }).select('-_id -__v -passwordHash').lean<PublicUser>();
}

export async function updateUser(id: string, data: UpdateUserInput) {
  return UserModel.findOneAndUpdate(
    { id },
    data,
    { new: true, runValidators: true },
  )
    .select('-_id -__v -passwordHash')
    .lean<PublicUser>();
}
