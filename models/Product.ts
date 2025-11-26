import mongoose, { Schema, Model } from "mongoose";

export interface IProduct {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  categoryId: mongoose.Types.ObjectId | string;
  images: string[]; // Array of image URLs
  // Pricing (Australian Dollar - AUD)
  retailPrice: number; // Giá bán lẻ
  wholesalePrice: number; // Giá đại lý
  // Sale settings
  onSale: boolean;
  salePrice?: number; // Giá sale (nếu có)
  salePercentage?: number; // % giảm giá
  saleStartDate?: Date;
  saleEndDate?: Date;
  // Stock & Status
  stock: number;
  sku?: string; // Stock Keeping Unit
  status: "active" | "inactive" | "out_of_stock";
  // Additional info
  weight?: number; // Weight in grams
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  tags?: string[];
  hasVariants?: boolean; // Sản phẩm có variants hay không
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Tên sản phẩm là bắt buộc"],
      trim: true,
      maxlength: [200, "Tên sản phẩm không được vượt quá 200 ký tự"],
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
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [500, "Mô tả ngắn không được vượt quá 500 ký tự"],
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Danh mục là bắt buộc"],
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: "Sản phẩm phải có ít nhất một hình ảnh",
      },
    },
    retailPrice: {
      type: Number,
      min: [0, "Giá bán lẻ không thể âm"],
      default: 0,
    },
    wholesalePrice: {
      type: Number,
      min: [0, "Giá đại lý không thể âm"],
      default: 0,
    },
    onSale: {
      type: Boolean,
      default: false,
    },
    salePrice: {
      type: Number,
      min: [0, "Giá sale không thể âm"],
    },
    salePercentage: {
      type: Number,
      min: [0, "Phần trăm giảm giá không thể âm"],
      max: [100, "Phần trăm giảm giá không thể vượt quá 100%"],
    },
    saleStartDate: {
      type: Date,
    },
    saleEndDate: {
      type: Date,
    },
    stock: {
      type: Number,
      min: [0, "Số lượng tồn kho không thể âm"],
      default: 0,
    },
    sku: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // Allow null/undefined but enforce uniqueness when present
    },
    status: {
      type: String,
      enum: ["active", "inactive", "out_of_stock"],
      default: "active",
    },
    weight: {
      type: Number,
      min: [0, "Trọng lượng không thể âm"],
    },
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
    },
    tags: {
      type: [String],
      default: [],
    },
    hasVariants: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
ProductSchema.index({ slug: 1 });
ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ sku: 1 });
ProductSchema.index({ onSale: 1 });
ProductSchema.index({ createdAt: -1 });

// Prevent re-compilation during development
const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;

