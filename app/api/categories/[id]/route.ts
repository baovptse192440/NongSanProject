import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";
import mongoose from "mongoose";

// GET - Lấy category theo ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "ID không hợp lệ" },
        { status: 400 }
      );
    }

    const category = await Category.findById(id).lean();

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy danh mục" },
        { status: 404 }
      );
    }

    const formattedCategory = {
      id: category._id?.toString(),
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      image: category.image || "",
      status: category.status,
      productCount: category.productCount || 0,
      parentId: category.parentId?.toString(),
      showOnHomepage: Boolean(category.showOnHomepage),
      createdAt: category.createdAt?.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: formattedCategory,
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "ID không hợp lệ" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy danh mục" },
        { status: 404 }
      );
    }

    // Check if slug is being changed and if it already exists
    if (body.slug && body.slug !== category.slug) {
      const existingCategory = await Category.findOne({
        slug: body.slug,
        _id: { $ne: id },
      });
      if (existingCategory) {
        return NextResponse.json(
          { success: false, error: "Slug đã tồn tại" },
          { status: 400 }
        );
      }
    }

    // Update category - handle parentId properly
    if (body.name) category.name = body.name;
    if (body.slug) category.slug = body.slug;
    if (body.description !== undefined) category.description = body.description || "";
    if (body.image !== undefined) category.image = body.image || "";
    if (body.status) category.status = body.status;
    if (body.showOnHomepage !== undefined) {
      category.showOnHomepage = Boolean(body.showOnHomepage);
    }
    
    // Handle parentId: convert empty string to null, valid ObjectId to ObjectId
    if (body.parentId !== undefined) {
      if (!body.parentId || body.parentId === "" || !mongoose.Types.ObjectId.isValid(body.parentId)) {
        category.parentId = null;
      } else {
        category.parentId = new mongoose.Types.ObjectId(body.parentId);
      }
    }
    
    await category.save();

    const formattedCategory = {
      id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      image: category.image || "",
      status: category.status,
      productCount: category.productCount || 0,
      parentId: category.parentId?.toString() || null,
      showOnHomepage: Boolean(category.showOnHomepage),
      createdAt: category.createdAt?.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: formattedCategory,
      message: "Cập nhật danh mục thành công",
    });
  } catch (error: any) {
    console.error("Error updating category:", error);
    
    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: errors.join(", ") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE - Xóa category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "ID không hợp lệ" },
        { status: 400 }
      );
    }

    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy danh mục" },
        { status: 404 }
      );
    }

    // Check if category has products
    if (category.productCount && category.productCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Không thể xóa danh mục có sản phẩm",
        },
        { status: 400 }
      );
    }

    // Check if category has children
    const childrenCount = await Category.countDocuments({ parentId: id });
    if (childrenCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Không thể xóa danh mục có danh mục con",
        },
        { status: 400 }
      );
    }

    await Category.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Xóa danh mục thành công",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
