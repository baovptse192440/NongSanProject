import mongoose, { Schema, Document } from "mongoose";

export interface ICartItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  oldPrice?: number;
  quantity: number;
  variantId?: string;
  variantName?: string;
  stock: number;
}

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  oldPrice: { type: Number },
  quantity: { type: Number, required: true, min: 1 },
  variantId: { type: String },
  variantName: { type: String },
  stock: { type: Number, required: true },
}, { _id: false });

const CartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: {
      type: [CartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
CartSchema.index({ userId: 1 });

export default mongoose.models.Cart || mongoose.model<ICart>("Cart", CartSchema);

