import mongoose, { Schema, Model } from "mongoose";

export interface IBanner {
  _id?: string;
  type: "main" | "side"; // main: banner chính trong slider, side: banner phụ
  image: string;
  title?: string;
  link?: string;
  order: number;
  status: "active" | "inactive";
  createdAt?: Date;
  updatedAt?: Date;
}

const BannerSchema = new Schema<IBanner>(
  {
    type: {
      type: String,
      enum: ["main", "side"],
      required: [true, "Loại banner là bắt buộc"],
    },
    image: {
      type: String,
      required: [true, "Ảnh banner là bắt buộc"],
      trim: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [200, "Tiêu đề không được vượt quá 200 ký tự"],
    },
    link: {
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
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
BannerSchema.index({ type: 1, status: 1 });
BannerSchema.index({ order: 1 });

// Prevent re-compilation during development
const Banner: Model<IBanner> =
  mongoose.models.Banner || mongoose.model<IBanner>("Banner", BannerSchema);

export default Banner;

