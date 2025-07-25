import { Document, Types } from 'mongoose';

type ROLE = 'ADMIN' | 'USER';
type STATUS = 'ACTIVE' | 'FREEZE';

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  image: Image | null;
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
  ban: {
    isBanned: boolean;
    adminId: Types.ObjectId | null;
    reason: string;
    bannedAt: Date | null;
  };
  deActivate: {
    isDeActivated: boolean;
    reason: string;
    deActivateAt: Date | null;
  };
  lastLogin: Date;
  updatedAt: Date;
  createdAt: Date;
  isMatchPassword: (value: string) => Promise<boolean>;
}

export type CategoryType = 'Electronics' | 'Clothing' | 'Kitchen' | 'Books';
export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'failed'
  | 'shipped'
  | 'cancelled'
  | 'completed';

type Image = {
  url: string;
  public_id: string;
};

export interface ProductDocument extends Document {
  name: string;
  description: string;
  price: number;
  images: Image[];
  categories: CategoryType[];
  countInStock: number;
  ownerId: Types.ObjectId;
  status: OrderStatus;
  subCategories: [string];
}

export type CartProductType = {
  _id: string;
  name: string;
  price: number;
  description: string;
  quantity: number;
  image: string;
  categories: [string];
  subCategories: String[];
};

export interface OrderDocument extends Document {
  userId: Types.ObjectId;
  items: CartProductType[];
  totalPrice: number;
  stripeSessionId: string;
  paymentStatus: string;
  status: OrderStatus;
}
