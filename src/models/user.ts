import { compare, genSalt, hash } from 'bcrypt';
import { Document, model, Schema } from 'mongoose';

type ROLE = 'ADMIN' | 'USER';
type STATUS = 'ACTIVE' | 'FREEZE';

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: ROLE;
  status: STATUS;
  refreshToken: string;
  errorLoginCount: number;
  updatedAt: Date;
  createdAt: Date;
  isMatchPassword: (value: string) => Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, minlength: 5 },
    email: { type: String, required: true },
    password: { type: String, required: true },
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
    refreshToken: { type: String, required: true },
    errorLoginCount: { type: Number, default: 0 },
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
