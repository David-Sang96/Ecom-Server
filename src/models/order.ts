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
            minlength: 3,
            maxlength: 20,
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
          },
          price: { type: Number, required: true },
          quantity: { type: Number, required: true },
          image: { type: String, required: true },
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
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Create index for faster queries on userId
orderSchema.index({ userId: 1 });

export const Order = model<OrderDocument>('Order', orderSchema);
