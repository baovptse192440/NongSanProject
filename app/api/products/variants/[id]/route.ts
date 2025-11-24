import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ProductVariant from "@/models/ProductVariant";

// PUT - Cập nhật variant
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
      sku,
      retailPrice,
      wholesalePrice,
      stock,
      onSale,
      salePrice,
      salePercentage,
      saleStartDate,
      saleEndDate,
      weight,
      status,
    } = body;

    const existingVariant = await ProductVariant.findById(id);
    if (!existingVariant) {
      return NextResponse.json(
        { success: false, error: "Variant không tồn tại" },
        { status: 404 }
      );
    }

    // Validation
    if (!name) {
      return NextResponse.json(
        { success: false, error: "Tên variant là bắt buộc" },
        { status: 400 }
      );
    }

    if (!retailPrice || retailPrice < 0 || !wholesalePrice || wholesalePrice < 0) {
      return NextResponse.json(
        { success: false, error: "Giá bán lẻ và giá đại lý phải hợp lệ và không âm" },
        { status: 400 }
      );
    }

    existingVariant.name = name;
    existingVariant.retailPrice = parseFloat(retailPrice);
    existingVariant.wholesalePrice = parseFloat(wholesalePrice);
    existingVariant.stock = stock !== undefined ? parseInt(stock) : 0;
    existingVariant.onSale = onSale || false;
    existingVariant.status = status || existingVariant.status;

    if (sku !== undefined) existingVariant.sku = sku || null;
    if (weight !== undefined) existingVariant.weight = weight ? parseFloat(weight) : null;
    if (onSale) {
      existingVariant.salePrice = salePrice ? parseFloat(salePrice) : null;
      existingVariant.salePercentage = salePercentage ? parseFloat(salePercentage) : null;
      existingVariant.saleStartDate = saleStartDate ? new Date(saleStartDate) : null;
      existingVariant.saleEndDate = saleEndDate ? new Date(saleEndDate) : null;
    } else {
      existingVariant.salePrice = null;
      existingVariant.salePercentage = null;
      existingVariant.saleStartDate = null;
      existingVariant.saleEndDate = null;
    }

    await existingVariant.save();

    const formattedVariant = {
      id: existingVariant._id.toString(),
      productId: existingVariant.productId.toString(),
      name: existingVariant.name,
      sku: existingVariant.sku || "",
      retailPrice: existingVariant.retailPrice,
      wholesalePrice: existingVariant.wholesalePrice,
      stock: existingVariant.stock,
      onSale: existingVariant.onSale || false,
      salePrice: existingVariant.salePrice || null,
      salePercentage: existingVariant.salePercentage || null,
      saleStartDate: existingVariant.saleStartDate?.toISOString() || null,
      saleEndDate: existingVariant.saleEndDate?.toISOString() || null,
      weight: existingVariant.weight || null,
      status: existingVariant.status,
      updatedAt: existingVariant.updatedAt?.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: formattedVariant,
      message: "Cập nhật variant thành công",
    });
  } catch (error: any) {
    console.error("Error updating variant:", error);
    
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: errors.join(", ") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to update variant" },
      { status: 500 }
    );
  }
}

// DELETE - Xóa variant
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const variant = await ProductVariant.findById(id);
    if (!variant) {
      return NextResponse.json(
        { success: false, error: "Variant không tồn tại" },
        { status: 404 }
      );
    }

    await ProductVariant.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Xóa variant thành công",
    });
  } catch (error) {
    console.error("Error deleting variant:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete variant" },
      { status: 500 }
    );
  }
}

