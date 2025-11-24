import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";

// GET - Lấy tất cả categories
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Build query
    const query: any = {};

    // Filter by status
    if (status && status !== "all") {
      query.status = status;
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
    const { name, slug, description, image, status, parentId } = body;

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
    };

    if (parentId) {
      categoryData.parentId = parentId;
    }

    const newCategory = await Category.create(categoryData);

    const formattedCategory = {
      id: newCategory._id.toString(),
      name: newCategory.name,
      slug: newCategory.slug,
      description: newCategory.description || "",
      image: newCategory.image || "",
      status: newCategory.status,
      productCount: newCategory.productCount || 0,
      parentId: newCategory.parentId?.toString(),
      createdAt: newCategory.createdAt?.toISOString(),
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
