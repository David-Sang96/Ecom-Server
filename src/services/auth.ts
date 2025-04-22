import { Types } from 'mongoose';
import { USER } from '../models/user';

export const getUserByEmail = (email: string) => {
  return USER.findOne({ email });
};

export const getUserById = (id: Types.ObjectId) => {
  return USER.findOne({ _id: id });
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

export const isTokenMatch = (token: string) => {
  return USER.findOne({ resetToken: token });
};

export const isEmailVerifyTokenMatch = (token: string) => {
  return USER.findOne({ emailVerifyToken: token });
};
