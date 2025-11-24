import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

// GET - Lấy product theo ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const product = await Product.findById(id).populate("categoryId", "name slug").lean();

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Sản phẩm không tồn tại" },
        { status: 404 }
      );
    }

    const formattedProduct = {
      id: product._id?.toString(),
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      shortDescription: product.shortDescription || "",
      categoryId: product.categoryId && typeof product.categoryId === "object"
        ? product.categoryId._id?.toString()
        : product.categoryId?.toString(),
      categoryName: product.categoryId && typeof product.categoryId === "object"
        ? product.categoryId.name
        : null,
      images: product.images || [],
      retailPrice: product.retailPrice,
      wholesalePrice: product.wholesalePrice,
      onSale: product.onSale || false,
      salePrice: product.salePrice || null,
      salePercentage: product.salePercentage || null,
      saleStartDate: product.saleStartDate?.toISOString() || null,
      saleEndDate: product.saleEndDate?.toISOString() || null,
      stock: product.stock || 0,
      sku: product.sku || "",
      status: product.status,
      weight: product.weight || null,
      dimensions: product.dimensions || null,
      tags: product.tags || [],
      createdAt: product.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: product.updatedAt?.toISOString() || new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: formattedProduct,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const body = await request.json();
    const {
      name,
      slug,
      description,
      shortDescription,
      categoryId,
      images,
      retailPrice,
      wholesalePrice,
      onSale,
      salePrice,
      salePercentage,
      saleStartDate,
      saleEndDate,
      stock,
      sku,
      status,
      weight,
      dimensions,
      tags,
    } = body;

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: "Sản phẩm không tồn tại" },
        { status: 404 }
      );
    }

    // Validation
    if (!name || !slug || !categoryId) {
      return NextResponse.json(
        { success: false, error: "Tên, slug và danh mục là bắt buộc" },
        { status: 400 }
      );
    }

    if (!retailPrice || retailPrice < 0 || !wholesalePrice || wholesalePrice < 0) {
      return NextResponse.json(
        { success: false, error: "Giá bán lẻ và giá đại lý phải hợp lệ và không âm" },
        { status: 400 }
      );
    }

    if (!images || images.length === 0) {
      return NextResponse.json(
        { success: false, error: "Sản phẩm phải có ít nhất một hình ảnh" },
        { status: 400 }
      );
    }

    // Check if slug already exists (except for current product)
    if (slug !== existingProduct.slug) {
      const slugExists = await Product.findOne({ slug, _id: { $ne: id } });
      if (slugExists) {
        return NextResponse.json(
          { success: false, error: "Slug đã tồn tại" },
          { status: 400 }
        );
      }
    }

    // Update product
    existingProduct.name = name;
    existingProduct.slug = slug;
    existingProduct.description = description || "";
    existingProduct.shortDescription = shortDescription || "";
    existingProduct.categoryId = categoryId;
    existingProduct.images = images || [];
    existingProduct.retailPrice = parseFloat(retailPrice);
    existingProduct.wholesalePrice = parseFloat(wholesalePrice);
    existingProduct.onSale = onSale || false;
    existingProduct.stock = stock !== undefined ? parseInt(stock) : 0;
    existingProduct.status = status || existingProduct.status;

    if (sku !== undefined) existingProduct.sku = sku || null;
    if (onSale) {
      existingProduct.salePrice = salePrice ? parseFloat(salePrice) : null;
      existingProduct.salePercentage = salePercentage ? parseFloat(salePercentage) : null;
      existingProduct.saleStartDate = saleStartDate ? new Date(saleStartDate) : null;
      existingProduct.saleEndDate = saleEndDate ? new Date(saleEndDate) : null;
    } else {
      existingProduct.salePrice = null;
      existingProduct.salePercentage = null;
      existingProduct.saleStartDate = null;
      existingProduct.saleEndDate = null;
    }
    if (weight !== undefined) existingProduct.weight = weight ? parseFloat(weight) : null;
    if (dimensions) existingProduct.dimensions = dimensions;
    if (tags) existingProduct.tags = tags;

    await existingProduct.save();
    const updated = await Product.findById(id).populate("categoryId", "name slug").lean();

    const formattedProduct = {
      id: updated?._id?.toString(),
      name: updated?.name,
      slug: updated?.slug,
      description: updated?.description || "",
      shortDescription: updated?.shortDescription || "",
      categoryId: updated?.categoryId && typeof updated.categoryId === "object"
        ? updated.categoryId._id?.toString()
        : categoryId,
      categoryName: updated?.categoryId && typeof updated.categoryId === "object"
        ? updated.categoryId.name
        : null,
      images: updated?.images || [],
      retailPrice: updated?.retailPrice,
      wholesalePrice: updated?.wholesalePrice,
      onSale: updated?.onSale || false,
      salePrice: updated?.salePrice || null,
      salePercentage: updated?.salePercentage || null,
      saleStartDate: updated?.saleStartDate?.toISOString() || null,
      saleEndDate: updated?.saleEndDate?.toISOString() || null,
      stock: updated?.stock || 0,
      sku: updated?.sku || "",
      status: updated?.status,
      weight: updated?.weight || null,
      dimensions: updated?.dimensions || null,
      tags: updated?.tags || [],
      updatedAt: updated?.updatedAt?.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: formattedProduct,
      message: "Cập nhật sản phẩm thành công",
    });
  } catch (error: any) {
    console.error("Error updating product:", error);
    
    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: errors.join(", ") },
        { status: 400 }
      );
    }

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "Slug hoặc SKU đã tồn tại" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE - Xóa product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Sản phẩm không tồn tại" },
        { status: 404 }
      );
    }

    await Product.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Xóa sản phẩm thành công",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 }
    );
  }
}

