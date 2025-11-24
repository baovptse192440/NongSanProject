import mongoose, { Schema, Model } from "mongoose";

export interface ISiteConfig {
  _id?: string;
  siteName: string;
  siteDescription?: string;
  logo?: string;
  favicon?: string;
  logoDark?: string; // Logo cho dark mode
  // SEO Settings
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImage?: string; // Open Graph image
  ogTitle?: string;
  ogDescription?: string;
  // Contact Info
  email?: string;
  phone?: string;
  address?: string;
  // Social Media
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  // Google Analytics
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const SiteConfigSchema = new Schema<ISiteConfig>(
  {
    siteName: {
      type: String,
      required: [true, "Tên website là bắt buộc"],
      trim: true,
      maxlength: [200, "Tên website không được vượt quá 200 ký tự"],
    },
    siteDescription: {
      type: String,
      trim: true,
      maxlength: [500, "Mô tả website không được vượt quá 500 ký tự"],
    },
    logo: {
      type: String,
      trim: true,
    },
    favicon: {
      type: String,
      trim: true,
    },
    logoDark: {
      type: String,
      trim: true,
    },
    metaTitle: {
      type: String,
      trim: true,
      maxlength: [60, "Meta title không được vượt quá 60 ký tự"],
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: [160, "Meta description không được vượt quá 160 ký tự"],
    },
    metaKeywords: {
      type: String,
      trim: true,
      maxlength: [255, "Meta keywords không được vượt quá 255 ký tự"],
    },
    ogImage: {
      type: String,
      trim: true,
    },
    ogTitle: {
      type: String,
      trim: true,
      maxlength: [60, "OG title không được vượt quá 60 ký tự"],
    },
    ogDescription: {
      type: String,
      trim: true,
      maxlength: [160, "OG description không được vượt quá 160 ký tự"],
    },
    email: {
      type: String,
      trim: true,
      match: [/^[\w\.-]+@[\w\.-]+\.\w+$/, "Email không hợp lệ"],
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      maxlength: [500, "Địa chỉ không được vượt quá 500 ký tự"],
    },
    facebook: {
      type: String,
      trim: true,
    },
    instagram: {
      type: String,
      trim: true,
    },
    twitter: {
      type: String,
      trim: true,
    },
    youtube: {
      type: String,
      trim: true,
    },
    googleAnalyticsId: {
      type: String,
      trim: true,
    },
    googleTagManagerId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Only allow one config document
SiteConfigSchema.index({}, { unique: true });

// Prevent re-compilation during development
const SiteConfig: Model<ISiteConfig> =
  mongoose.models.SiteConfig || mongoose.model<ISiteConfig>("SiteConfig", SiteConfigSchema);

export default SiteConfig;

