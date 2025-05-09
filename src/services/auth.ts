import { Types } from 'mongoose';
import { User } from '../models/user';

export const getUserByEmail = (email: string) => {
  return User.findOne({ email });
};

export const getUserById = (id: Types.ObjectId) => {
  return User.findOne({ _id: id });
};

export const createUser = (
  name: string,
  email: string,
  password: string,
  role: string
) => {
  return User.create({ name, email, password, role });
};

export const updateUser = (id: Types.ObjectId, data: any) => {
  return User.findByIdAndUpdate(id, data, { new: true });
};

export const isTokenMatch = (token: string) => {
  return User.findOne({ resetToken: token });
};

export const isEmailVerifyTokenMatch = (token: string) => {
  return User.findOne({ emailVerifyToken: token });
};
