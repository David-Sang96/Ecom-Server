import { model, Schema } from 'mongoose';
import { CategoryType, ProductDocument } from '../types';

export const allowedCategories: CategoryType[] = [
  'Books',
  'Clothing',
  'Electronics',
  'Kitchen',
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
    },
    countInStock: { type: Number, required: true, min: 1 },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Create index for faster queries on categories
productSchema.index({ categories: 1 });

export const Product = model<ProductDocument>('Product', productSchema);
