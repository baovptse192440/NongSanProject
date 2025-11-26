import mongoose, { Schema, Model } from "mongoose";

export interface ICategory {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  status: "active" | "inactive";
  productCount?: number;
  parentId?: mongoose.Types.ObjectId | string;
  showOnHomepage?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Tên danh mục là bắt buộc"],
      trim: true,
      maxlength: [200, "Tên danh mục không được vượt quá 200 ký tự"],
    },
    slug: {
      type: String,
      required: [true, "Slug là bắt buộc"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9-]+$/, "Slug chỉ được chứa chữ thường, số và dấu gạch ngang"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Mô tả không được vượt quá 1000 ký tự"],
    },
    image: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    productCount: {
      type: Number,
      default: 0,
      min: [0, "Số lượng sản phẩm không thể âm"],
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    showOnHomepage: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
// Note: slug already has index from unique: true
CategorySchema.index({ status: 1 });
CategorySchema.index({ parentId: 1 });

// Prevent re-compilation during development
const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);

export default Category;

