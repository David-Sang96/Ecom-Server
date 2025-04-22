import { compare, genSalt, hash } from 'bcrypt';
import { Document, model, Schema } from 'mongoose';

type ROLE = 'ADMIN' | 'USER';
type STATUS = 'ACTIVE' | 'FREEZE';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  image: string | null;
  role: ROLE;
  status: STATUS;
  isEmailVerified: boolean;
  error: number;
  refreshToken: string | null;
  errorLoginCount: number;
  resetToken: string | null;
  emailVerifyToken: string | null;
  resetTokenExpiry: Date | null;
  emailVerifyTokenExpiry: Date | null;
  passwordChangedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;
  isMatchPassword: (value: string) => Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, minlength: 5 },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isEmailVerified: { type: Boolean, default: false },
    image: { type: String, default: null },
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

export const USER = model<IUser>('USER', userSchema);
