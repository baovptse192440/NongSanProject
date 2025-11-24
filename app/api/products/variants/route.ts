import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ProductVariant from "@/models/ProductVariant";

// GET - Lấy tất cả variants của một product
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID là bắt buộc" },
        { status: 400 }
      );
    }

    const variants = await ProductVariant.find({ productId }).sort({ createdAt: -1 }).lean();

    const formattedVariants = variants.map((variant) => ({
      id: variant._id?.toString(),
      productId: variant.productId.toString(),
      name: variant.name,
      sku: variant.sku || "",
      retailPrice: variant.retailPrice,
      wholesalePrice: variant.wholesalePrice,
      stock: variant.stock,
      onSale: variant.onSale || false,
      salePrice: variant.salePrice || null,
      salePercentage: variant.salePercentage || null,
      saleStartDate: variant.saleStartDate?.toISOString() || null,
      saleEndDate: variant.saleEndDate?.toISOString() || null,
      weight: variant.weight || null,
      status: variant.status,
      createdAt: variant.createdAt?.toISOString() || new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: formattedVariants,
    });
  } catch (error) {
    console.error("Error fetching variants:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch variants" },
      { status: 500 }
    );
  }
}

// POST - Tạo variant mới
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      productId,
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

    // Validation
    if (!productId || !name) {
      return NextResponse.json(
        { success: false, error: "Product ID và tên variant là bắt buộc" },
        { status: 400 }
      );
    }

    if (!retailPrice || retailPrice < 0 || !wholesalePrice || wholesalePrice < 0) {
      return NextResponse.json(
        { success: false, error: "Giá bán lẻ và giá đại lý phải hợp lệ và không âm" },
        { status: 400 }
      );
    }

    const variantData: any = {
      productId,
      name,
      retailPrice: parseFloat(retailPrice),
      wholesalePrice: parseFloat(wholesalePrice),
      stock: stock !== undefined ? parseInt(stock) : 0,
      onSale: onSale || false,
      status: status || "active",
    };

    if (sku) variantData.sku = sku;
    if (weight) variantData.weight = parseFloat(weight);
    if (onSale) {
      if (salePrice) variantData.salePrice = parseFloat(salePrice);
      if (salePercentage) variantData.salePercentage = parseFloat(salePercentage);
      if (saleStartDate) variantData.saleStartDate = new Date(saleStartDate);
      if (saleEndDate) variantData.saleEndDate = new Date(saleEndDate);
    }

    const newVariant = await ProductVariant.create(variantData);

    const formattedVariant = {
      id: newVariant._id.toString(),
      productId: newVariant.productId.toString(),
      name: newVariant.name,
      sku: newVariant.sku || "",
      retailPrice: newVariant.retailPrice,
      wholesalePrice: newVariant.wholesalePrice,
      stock: newVariant.stock,
      onSale: newVariant.onSale || false,
      salePrice: newVariant.salePrice || null,
      salePercentage: newVariant.salePercentage || null,
      saleStartDate: newVariant.saleStartDate?.toISOString() || null,
      saleEndDate: newVariant.saleEndDate?.toISOString() || null,
      weight: newVariant.weight || null,
      status: newVariant.status,
      createdAt: newVariant.createdAt?.toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: formattedVariant,
        message: "Tạo variant thành công",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating variant:", error);
    
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: errors.join(", ") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to create variant" },
      { status: 500 }
    );
  }
}

