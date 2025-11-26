import mongoose, { Schema, Model } from "mongoose";

export interface IOrderItem {
  productId: string;
  productName: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
  variantId?: string;
  variantName?: string;
}

export interface IOrder {
  _id?: string;
  orderNumber: string; // Auto-generated order number
  userId: string;
  userEmail: string;
  userFullName: string;
  userPhone?: string;
  // Shipping address
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZipCode: string;
  shippingCountry: string;
  // Order items
  items: IOrderItem[];
  // Pricing
  subtotal: number;
  shippingFee: number;
  total: number;
  // Status
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  // Additional info
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  slug: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  variantId: { type: String },
  variantName: { type: String },
}, { _id: false });

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    userEmail: {
      type: String,
      required: true,
      index: true,
    },
    userFullName: {
      type: String,
      required: true,
    },
    userPhone: {
      type: String,
    },
    shippingAddress: {
      type: String,
      required: true,
    },
    shippingCity: {
      type: String,
      required: true,
    },
    shippingState: {
      type: String,
      required: true,
    },
    shippingZipCode: {
      type: String,
      required: true,
    },
    shippingCountry: {
      type: String,
      required: true,
      default: "Australia",
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (items: IOrderItem[]) => items.length > 0,
        message: "Order must have at least one item",
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
    notes: {
      type: String,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes (orderNumber already has index from unique: true, don't add duplicate)
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });

// Clear existing model to avoid cached schema with old hooks
if (mongoose.models.Order) {
  delete mongoose.models.Order;
}

const Order: Model<IOrder> = mongoose.model<IOrder>("Order", OrderSchema);

export default Order;

