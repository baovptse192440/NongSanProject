import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

// GET - Lấy tất cả products
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const categoryId = searchParams.get("categoryId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Build query
    const query: any = {};

    // Filter by status
    if (status && status !== "all") {
      query.status = status;
    }

    // Filter by category
    if (categoryId && categoryId !== "all") {
      query.categoryId = categoryId;
    }

    // Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    // Get paginated products
    const products = await Product.find(query)
      .populate("categoryId", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get variants count for each product
    const ProductVariant = (await import("@/models/ProductVariant")).default;
    await connectDB();

    // Convert to plain objects and format
    const formattedProducts = products.map((product) => ({
      id: product._id?.toString(),
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      shortDescription: product.shortDescription || "",
      categoryId: product.categoryId ? 
        (typeof product.categoryId === "object" ? product.categoryId._id?.toString() : product.categoryId.toString())
        : null,
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
      hasVariants: product.hasVariants || false,
      createdAt: product.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: product.updatedAt?.toISOString() || new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: formattedProducts,
      total: total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST - Tạo product mới
export async function POST(request: NextRequest) {
  try {
    await connectDB();

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
      hasVariants,
    } = body;

    // Validation
    if (!name || !slug || !categoryId) {
      return NextResponse.json(
        { success: false, error: "Tên, slug và danh mục là bắt buộc" },
        { status: 400 }
      );
    }

    // Only validate pricing if product doesn't have variants
    const useVariants = hasVariants || false;
    if (!useVariants) {
      if (!retailPrice || retailPrice < 0 || !wholesalePrice || wholesalePrice < 0) {
        return NextResponse.json(
          { success: false, error: "Giá bán lẻ và giá đại lý phải hợp lệ và không âm" },
          { status: 400 }
        );
      }
    }

    if (!images || images.length === 0) {
      return NextResponse.json(
        { success: false, error: "Sản phẩm phải có ít nhất một hình ảnh" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return NextResponse.json(
        { success: false, error: "Slug đã tồn tại" },
        { status: 400 }
      );
    }

    // Create new product
    const productData: any = {
      name,
      slug,
      description: description || "",
      shortDescription: shortDescription || "",
      categoryId,
      images: images || [],
      hasVariants: useVariants,
      status: status || "active",
    };

    if (sku) productData.sku = sku;
    if (tags) productData.tags = tags;

    // Only add pricing/stock/sale if no variants
    if (!useVariants) {
      productData.retailPrice = parseFloat(retailPrice);
      productData.wholesalePrice = parseFloat(wholesalePrice);
      productData.onSale = onSale || false;
      productData.stock = stock !== undefined ? parseInt(stock) : 0;
      
      if (onSale) {
        if (salePrice) productData.salePrice = parseFloat(salePrice);
        if (salePercentage) productData.salePercentage = parseFloat(salePercentage);
        if (saleStartDate) productData.saleStartDate = new Date(saleStartDate);
        if (saleEndDate) productData.saleEndDate = new Date(saleEndDate);
      }
      if (weight) productData.weight = parseFloat(weight);
      if (dimensions) productData.dimensions = dimensions;
    }

    const newProduct = await Product.create(productData);
    const populated = await Product.findById(newProduct._id).populate("categoryId", "name slug").lean();

    const formattedProduct = {
      id: newProduct._id.toString(),
      name: newProduct.name,
      slug: newProduct.slug,
      description: newProduct.description || "",
      shortDescription: newProduct.shortDescription || "",
      categoryId: populated?.categoryId && typeof populated.categoryId === "object"
        ? populated.categoryId._id?.toString()
        : categoryId,
      categoryName: populated?.categoryId && typeof populated.categoryId === "object"
        ? populated.categoryId.name
        : null,
      images: newProduct.images || [],
      retailPrice: newProduct.retailPrice,
      wholesalePrice: newProduct.wholesalePrice,
      onSale: newProduct.onSale || false,
      salePrice: newProduct.salePrice || null,
      salePercentage: newProduct.salePercentage || null,
      saleStartDate: newProduct.saleStartDate?.toISOString() || null,
      saleEndDate: newProduct.saleEndDate?.toISOString() || null,
      stock: newProduct.stock || 0,
      sku: newProduct.sku || "",
      status: newProduct.status,
      weight: newProduct.weight || null,
      dimensions: newProduct.dimensions || null,
      tags: newProduct.tags || [],
      createdAt: newProduct.createdAt?.toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: formattedProduct,
        message: "Tạo sản phẩm thành công",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating product:", error);
    
    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: errors.join(", ") },
        { status: 400 }
      );
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { success: false, error: `${field === "slug" ? "Slug" : "SKU"} đã tồn tại` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}

