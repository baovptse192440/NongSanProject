import mongoose, { Schema, Model } from "mongoose";

export interface INotification {
  _id?: string;
  userId: string; // Admin user ID
  type: "order" | "system" | "user";
  title: string;
  message: string;
  orderId?: string;
  orderNumber?: string;
  read: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["order", "system", "user"],
      required: true,
      default: "order",
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
      index: true,
    },
    orderNumber: {
      type: String,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ orderId: 1 });

// Clear existing model to avoid cached schema
if (mongoose.models.Notification) {
  delete mongoose.models.Notification;
}

const Notification: Model<INotification> = mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;

