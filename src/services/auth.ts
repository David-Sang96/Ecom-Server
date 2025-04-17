import { Types } from 'mongoose';
import { USER } from '../models/user';

export const getUserByEmail = (email: string) => {
  return USER.findOne({ email });
};

export const createUser = (
  name: string,
  email: string,
  password: string,
  role: string
) => {
  return USER.create({ name, email, password, role });
};

export const updateUser = (id: Types.ObjectId, data: any) => {
  return USER.findByIdAndUpdate(id, data, { new: true });
};
