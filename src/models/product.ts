import { model, Schema } from 'mongoose';
import { CategoryType, OrderStatus, ProductDocument } from '../types';

export const allowedCategories: CategoryType[] = [
  'Books',
  'Clothing',
  'Electronics',
  'Kitchen',
];

export const orderStatus: OrderStatus[] = [
  'pending',
  'shipped',
  'cancelled',
  'completed',
  'failed',
  'processing',
];

const productSchema = new Schema<ProductDocument>(
  {
    name: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 100,
      trim: true,
    },
    description: { type: String, required: true, minlength: 10, trim: true },
    price: { type: Number, required: true },
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
      required: true,
      validate: [
        (val: any) => val.length > 0,
        'At least one category is required',
      ],
    },
    subCategories: {
      type: [String],
      required: true,
      validate: [
        (val: any) => val.length > 0,
        'At least one subcategory is required',
      ],
    },
    status: {
      type: String,
      enum: { values: orderStatus },
      default: 'pending',
    },
    countInStock: { type: Number, required: true, min: 1 },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Create index for faster queries on categories
productSchema.index({ categories: 1 });

export const Product = model<ProductDocument>('Product', productSchema);
