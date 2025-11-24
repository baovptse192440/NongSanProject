import mongoose, { Schema, Model } from "mongoose";

export interface IProductVariant {
  _id?: string;
  productId: mongoose.Types.ObjectId | string;
  name: string; // Tên variant: "1kg", "Thùng 12 trái", etc.
  sku?: string;
  retailPrice: number; // Giá bán lẻ (AUD)
  wholesalePrice: number; // Giá đại lý (AUD)
  stock: number;
  onSale: boolean;
  salePrice?: number;
  salePercentage?: number;
  saleStartDate?: Date;
  saleEndDate?: Date;
  weight?: number; // Trọng lượng/số lượng của variant
  status: "active" | "inactive" | "out_of_stock";
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductVariantSchema = new Schema<IProductVariant>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID là bắt buộc"],
    },
    name: {
      type: String,
      required: [true, "Tên variant là bắt buộc"],
      trim: true,
      maxlength: [200, "Tên variant không được vượt quá 200 ký tự"],
    },
    sku: {
      type: String,
      trim: true,
      sparse: true,
    },
    retailPrice: {
      type: Number,
      required: [true, "Giá bán lẻ là bắt buộc"],
      min: [0, "Giá bán lẻ không thể âm"],
    },
    wholesalePrice: {
      type: Number,
      required: [true, "Giá đại lý là bắt buộc"],
      min: [0, "Giá đại lý không thể âm"],
    },
    stock: {
      type: Number,
      required: [true, "Số lượng tồn kho là bắt buộc"],
      min: [0, "Số lượng tồn kho không thể âm"],
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
    weight: {
      type: Number,
      min: [0, "Trọng lượng không thể âm"],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "out_of_stock"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ProductVariantSchema.index({ productId: 1 });
ProductVariantSchema.index({ status: 1 });
ProductVariantSchema.index({ sku: 1 }, { sparse: true });

// Prevent re-compilation during development
const ProductVariant: Model<IProductVariant> =
  mongoose.models.ProductVariant || mongoose.model<IProductVariant>("ProductVariant", ProductVariantSchema);

export default ProductVariant;

