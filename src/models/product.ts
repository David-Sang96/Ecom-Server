import { Document, model, Schema, Types } from 'mongoose';

export type CategoryType =
  | 'Electronics'
  | 'Clothing'
  | 'Home & Kitchen'
  | 'Books';

export type Image = {
  url: string;
  public_id: string;
};

export interface Product {
  name: string;
  description: string;
  price: number;
  images: Image[];
  categories: CategoryType[];
  countInStock: number;
  ownerId: Types.ObjectId;
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
    images: {
      type: [
        {
          _id: false,
          url: { type: String, required: true },
          public_id: { type: String, required: true },
        },
      ],
      default: [],
    },
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
