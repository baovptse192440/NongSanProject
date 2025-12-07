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

    if (!wholesalePrice || wholesalePrice < 0) {
      return NextResponse.json(
        { success: false, error: "Giá đại lý phải hợp lệ và không âm" },
        { status: 400 }
      );
    }

    const variantData: {
      productId: string;
      name: string;
      retailPrice: number;
      wholesalePrice: number;
      stock: number;
      onSale: boolean;
      status: string;
      sku?: string;
      weight?: number;
      salePrice?: number;
      salePercentage?: number;
      saleStartDate?: Date;
      saleEndDate?: Date;
    } = {
      productId,
      name,
      retailPrice: parseFloat(wholesalePrice), // Set retailPrice = wholesalePrice for backward compatibility
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
    
    // Handle both array and single document cases
    const variantDoc = Array.isArray(newVariant) ? newVariant[0] : newVariant;
    const variantObj: {
      _id?: { toString(): string } | string;
      productId?: { toString(): string } | string;
      name: string;
      sku?: string;
      retailPrice: number;
      wholesalePrice: number;
      stock: number;
      onSale?: boolean;
      salePrice?: number;
      salePercentage?: number;
      saleStartDate?: Date;
      saleEndDate?: Date;
      weight?: number;
      status: string;
      createdAt?: Date;
    } = variantDoc.toObject ? variantDoc.toObject() : (variantDoc as {
      _id?: { toString(): string } | string;
      productId?: { toString(): string } | string;
      name: string;
      sku?: string;
      retailPrice: number;
      wholesalePrice: number;
      stock: number;
      onSale?: boolean;
      salePrice?: number;
      salePercentage?: number;
      saleStartDate?: Date;
      saleEndDate?: Date;
      weight?: number;
      status: string;
      createdAt?: Date;
    });

    const formattedVariant = {
      id: variantObj._id?.toString() || "",
      productId: variantObj.productId?.toString() || "",
      name: variantObj.name,
      sku: variantObj.sku || "",
      retailPrice: variantObj.retailPrice,
      wholesalePrice: variantObj.wholesalePrice,
      stock: variantObj.stock,
      onSale: variantObj.onSale || false,
      salePrice: variantObj.salePrice || null,
      salePercentage: variantObj.salePercentage || null,
      saleStartDate: variantObj.saleStartDate?.toISOString() || null,
      saleEndDate: variantObj.saleEndDate?.toISOString() || null,
      weight: variantObj.weight || null,
      status: variantObj.status,
      createdAt: variantObj.createdAt?.toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: formattedVariant,
        message: "Tạo variant thành công",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating variant:", error);
    
    if (error instanceof Error && 'name' in error && error.name === "ValidationError" && 'errors' in error) {
      const validationError = error as { errors: Record<string, { message: string }> };
      const errors = Object.values(validationError.errors).map((err) => err.message);
      return NextResponse.json(
        { success: false, error: errors.join(", ") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create variant" },
      { status: 500 }
    );
  }
}

