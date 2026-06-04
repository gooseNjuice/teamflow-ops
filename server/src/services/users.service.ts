import { UserModel } from '../models/user.model.ts';
import type { User } from '../types/user.types.ts';

export async function getUsers() {
  return UserModel.find({}).select('-_id -__v').sort({ createdAt: 1 }).lean<User[]>();
}

export async function getUserById(id: string) {
  return UserModel.findOne({ id }).select('-_id -__v').lean<User>();
}
