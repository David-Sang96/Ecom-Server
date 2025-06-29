import { model, Schema } from 'mongoose';
import { OrderDocument } from '../types';
import { allowedCategories, orderStatus } from './product';

const orderSchema = new Schema<OrderDocument>(
  {
    items: {
      type: [
        {
          productId: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
          },
          name: {
            type: String,
            required: true,
            minlength: 10,
            maxlength: 100,
            trim: true,
          },
          description: {
            type: String,
            required: true,
            minlength: 10,
            trim: true,
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
          price: { type: Number, required: true },
          quantity: { type: Number, required: true },
          images: { type: [String], required: true },
        },
      ],
      required: true,
    },
    totalPrice: { type: Number, required: true },
    stripeSessionId: { type: String, required: true, unique: true },
    paymentStatus: { type: String, required: true },
    status: {
      type: String,
      enum: { values: orderStatus },
      default: 'pending',
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Create index for faster queries on userId
orderSchema.index({ userId: 1 });

export const Order = model<OrderDocument>('Order', orderSchema);
