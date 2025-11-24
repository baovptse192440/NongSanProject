import mongoose, { Schema, Model } from "mongoose";

export interface IMenu {
  _id?: string;
  title: string;
  url?: string;
  icon?: string;
  order: number;
  status: "active" | "inactive";
  parentId?: mongoose.Types.ObjectId | string;
  createdAt?: Date;
  updatedAt?: Date;
}

const MenuSchema = new Schema<IMenu>(
  {
    title: {
      type: String,
      required: [true, "Tiêu đề menu là bắt buộc"],
      trim: true,
      maxlength: [200, "Tiêu đề menu không được vượt quá 200 ký tự"],
    },
    url: {
      type: String,
      trim: true,
      maxlength: [500, "URL không được vượt quá 500 ký tự"],
    },
    icon: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
      min: [0, "Thứ tự không thể âm"],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Menu",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
MenuSchema.index({ status: 1 });
MenuSchema.index({ parentId: 1 });
MenuSchema.index({ order: 1 });

// Prevent re-compilation during development
const Menu: Model<IMenu> =
  mongoose.models.Menu || mongoose.model<IMenu>("Menu", MenuSchema);

export default Menu;

