import mongoose, { Schema, Document } from "mongoose";

export interface ICartHistoryItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  oldPrice?: number;
  quantity: number;
  variantId?: string;
  variantName?: string;
}

export interface ICartHistory extends Document {
  userId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  items: ICartHistoryItem[];
  totalAmount: number;
  status: "completed" | "cancelled" | "abandoned";
  createdAt: Date;
}

const CartHistoryItemSchema = new Schema<ICartHistoryItem>({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  oldPrice: { type: Number },
  quantity: { type: Number, required: true },
  variantId: { type: String },
  variantName: { type: String },
}, { _id: false });

const CartHistorySchema = new Schema<ICartHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
    items: {
      type: [CartHistoryItemSchema],
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["completed", "cancelled", "abandoned"],
      default: "completed",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
CartHistorySchema.index({ userId: 1, createdAt: -1 });
CartHistorySchema.index({ orderId: 1 });

export default mongoose.models.CartHistory || mongoose.model<ICartHistory>("CartHistory", CartHistorySchema);

