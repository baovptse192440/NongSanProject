import mongoose, { Schema, Model } from "mongoose";

export interface IPost {
  _id?: string;
  title: string;
  slug: string;
  excerpt?: string; // Short description/summary
  content: string; // Full content with HTML
  tableOfContents?: string; // Auto-generated table of contents
  featuredImage?: string;
  authorId: string; // Reference to User
  tags?: string[];
  status: "draft" | "published" | "archived";
  publishedAt?: Date;
  views?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const PostSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: [500, "Excerpt cannot exceed 500 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    tableOfContents: {
      type: String,
      default: "",
    },
    featuredImage: {
      type: String,
      trim: true,
    },
    authorId: {
      type: String,
      required: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
    publishedAt: {
      type: Date,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes (slug already has index from unique: true)
PostSchema.index({ authorId: 1, createdAt: -1 });
PostSchema.index({ status: 1, publishedAt: -1 });

const Post: Model<IPost> = mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);

export default Post;

