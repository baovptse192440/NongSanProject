import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";
import mongoose from "mongoose";

// GET - Lấy tất cả categories
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const showOnHomepage = searchParams.get("showOnHomepage");

    // Build query
    const query: any = {};

    // Filter by status
    if (status && status !== "all") {
      query.status = status;
    }

    // Filter by showOnHomepage
    if (showOnHomepage === "true") {
      query.showOnHomepage = true;
    }

    // Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const categories = await Category.find(query).sort({ createdAt: -1 }).lean();

    // Convert to plain objects and format
    const formattedCategories = categories.map((cat) => ({
      id: cat._id?.toString(),
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      image: cat.image || "",
      status: cat.status,
      productCount: cat.productCount || 0,
      parentId: cat.parentId?.toString(),
      showOnHomepage: Boolean(cat.showOnHomepage),
      createdAt: cat.createdAt?.toISOString() || new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: formattedCategories,
      total: formattedCategories.length,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST - Tạo category mới
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, slug, description, image, status, parentId, showOnHomepage } = body;

    // Validation
    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: "Tên và slug là bắt buộc" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: "Slug đã tồn tại" },
        { status: 400 }
      );
    }

    // Create new category
    const categoryData: any = {
      name,
      slug,
      description: description || "",
      image: image || "",
      status: status || "active",
      productCount: 0,
      showOnHomepage: Boolean(showOnHomepage),
    };

    // Handle parentId: convert empty string to null, valid ObjectId to ObjectId
    if (parentId && parentId !== "" && mongoose.Types.ObjectId.isValid(parentId)) {
      categoryData.parentId = new mongoose.Types.ObjectId(parentId);
    } else {
      categoryData.parentId = null;
    }

    const newCategory = await Category.create(categoryData);
    
    // Handle both array and single document cases
    const categoryDoc = Array.isArray(newCategory) ? newCategory[0] : newCategory;
    
    // Convert to plain object to avoid TypeScript issues
    const categoryObj: {
      _id?: { toString(): string } | string;
      name: string;
      slug: string;
      description?: string;
      image?: string;
      status: string;
      productCount?: number;
      parentId?: { toString(): string } | string;
      showOnHomepage?: boolean;
      createdAt?: Date;
    } = categoryDoc.toObject ? categoryDoc.toObject() : (categoryDoc as {
      _id?: { toString(): string } | string;
      name: string;
      slug: string;
      description?: string;
      image?: string;
      status: string;
      productCount?: number;
      parentId?: { toString(): string } | string;
      showOnHomepage?: boolean;
      createdAt?: Date;
    });

    const formattedCategory = {
      id: categoryObj._id?.toString() || "",
      name: categoryObj.name,
      slug: categoryObj.slug,
      description: categoryObj.description || "",
      image: categoryObj.image || "",
      status: categoryObj.status,
      productCount: categoryObj.productCount || 0,
      parentId: categoryObj.parentId?.toString() || null,
      showOnHomepage: Boolean(categoryObj.showOnHomepage),
      createdAt: categoryObj.createdAt?.toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: formattedCategory,
        message: "Tạo danh mục thành công",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating category:", error);
    
    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: errors.join(", ") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to create category" },
      { status: 500 }
    );
  }
}
