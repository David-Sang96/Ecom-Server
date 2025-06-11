import { compare, genSalt, hash } from 'bcrypt';
import { model, Schema, Types } from 'mongoose';
import { UserDocument } from '../types';

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, minlength: 5, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, minlength: 8, required: true },
    isEmailVerified: { type: Boolean, default: false },
    image: {
      type: {
        url: { type: String },
        public_id: { type: String },
      },
      default: null,
      _id: false,
    },
    role: {
      type: String,
      enum: ['ADMIN', 'USER'],
      default: 'USER',
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'FREEZE'],
      default: 'ACTIVE',
      required: true,
    },
    error: { type: Number, default: 0 },
    refreshToken: { type: String, default: null },
    errorLoginCount: { type: Number, default: 0 },
    resetToken: { type: String, default: null },
    emailVerifyToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },
    emailVerifyTokenExpiry: { type: Date, default: null },
    passwordChangedAt: { type: Date, default: null },
    ban: {
      isBanned: { type: Boolean, default: false },
      adminId: { type: Types.ObjectId, ref: 'User', default: null },
      reason: { type: String, default: '' },
      bannedAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await genSalt(10);
  this.password = await hash(this.password, salt);
  next();
});

userSchema.methods.isMatchPassword = async function (password: string) {
  return await compare(password, this.password);
};

export const User = model<UserDocument>('User', userSchema);
