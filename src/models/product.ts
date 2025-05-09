import { Document, model, Schema, Types } from 'mongoose';

export type CategoryType =
  | 'Electronics'
  | 'Clothing'
  | 'Home & Kitchen'
  | 'Books';

export interface Product {
  name: string;
  description: string;
  price: number;
  images: string[];
  category: CategoryType[];
  countInStock: number;
  owner: Types.ObjectId;
  public_id: string[];
}

type ProductDocument = Product & Document;

const allowedCategories: CategoryType[] = [
  'Books',
  'Clothing',
  'Electronics',
  'Home & Kitchen',
];

const productSchema = new Schema<ProductDocument>(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 20,
      trim: true,
    },
    description: { type: String, required: true, minlength: 10, trim: true },
    price: { type: Number, default: 0 },
    images: { type: [String], default: [] },
    public_id: { type: [String], default: [] },
    category: {
      type: [String],
      enum: {
        values: allowedCategories,
      },
      required: true,
    },
    countInStock: { type: Number, required: true, min: 1 },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Product = model<ProductDocument>('Product', productSchema);
