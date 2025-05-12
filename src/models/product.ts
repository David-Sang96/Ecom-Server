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
  categories: CategoryType[];
  countInStock: number;
  ownerId: Types.ObjectId;
  public_ids: string[];
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
    public_ids: { type: [String], default: [] },
    categories: {
      type: [String],
      enum: {
        values: allowedCategories,
      },
      default: [],
    },
    countInStock: { type: Number, required: true, min: 1 },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Create index for faster queries on categories
productSchema.index({ categories: 1 });

export const Product = model<ProductDocument>('Product', productSchema);
