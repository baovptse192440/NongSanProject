import mongoose, { Schema, Model } from "mongoose";

export interface IUser {
  _id?: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: "admin" | "user";
  // Address information
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  // Additional info
  avatar?: string;
  dateOfBirth?: Date;
  gender?: "male" | "female" | "other";
  status: "active" | "inactive" | "banned";
  emailVerified: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email là bắt buộc"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Email không hợp lệ"],
    },
    password: {
      type: String,
      required: [true, "Mật khẩu là bắt buộc"],
      minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
    },
    fullName: {
      type: String,
      required: [true, "Họ tên là bắt buộc"],
      trim: true,
      maxlength: [200, "Họ tên không được vượt quá 200 ký tự"],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9+\-\s()]+$/, "Số điện thoại không hợp lệ"],
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    address: {
      type: String,
      trim: true,
      maxlength: [500, "Địa chỉ không được vượt quá 500 ký tự"],
    },
    city: {
      type: String,
      trim: true,
      maxlength: [100, "Thành phố không được vượt quá 100 ký tự"],
    },
    state: {
      type: String,
      trim: true,
      maxlength: [100, "Tỉnh/Thành phố không được vượt quá 100 ký tự"],
    },
    zipCode: {
      type: String,
      trim: true,
      maxlength: [20, "Mã bưu điện không được vượt quá 20 ký tự"],
    },
    country: {
      type: String,
      trim: true,
      maxlength: [100, "Quốc gia không được vượt quá 100 ký tự"],
      default: "Australia",
    },
    avatar: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "banned"],
      default: "active",
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes (email already has index from unique: true)
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

