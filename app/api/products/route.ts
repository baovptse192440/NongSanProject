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

    // Get variants for products that have variants
    const ProductVariant = (await import("@/models/ProductVariant")).default;
    await connectDB();

    // Get all products with variants
    const productsWithVariants = products.filter(p => p.hasVariants);
    const productIdsWithVariants = productsWithVariants.map(p => p._id);
    
    // Fetch variants for these products
    const variantsMap = new Map();
    if (productIdsWithVariants.length > 0) {
      const variants = await ProductVariant.find({
        productId: { $in: productIdsWithVariants },
        status: "active"
      }).lean();
      
      // Group variants by productId
      variants.forEach((variant: any) => {
        const productId = variant.productId.toString();
        if (!variantsMap.has(productId)) {
          variantsMap.set(productId, []);
        }
        variantsMap.get(productId).push(variant);
      });
    }

    // Convert to plain objects and format
    const formattedProducts = products.map((product) => {
      let retailPrice = product.retailPrice;
      let wholesalePrice = product.wholesalePrice;
      let onSale = product.onSale || false;
      let salePrice = product.salePrice || null;
      let salePercentage = product.salePercentage || null;
      let stock = product.stock || 0;

      // If product has variants, calculate price from variants
      if (product.hasVariants) {
        const variants = variantsMap.get(product._id.toString()) || [];
        if (variants.length > 0) {
          // Calculate prices from variants
          const variantPrices = variants.map((v: any) => {
            const variantFinalPrice = v.onSale && v.salePrice ? v.salePrice : v.retailPrice;
            const variantRetailPrice = v.retailPrice;
            const variantWholesalePrice = v.wholesalePrice;
            return {
              retailPrice: variantRetailPrice,
              wholesalePrice: variantWholesalePrice,
              finalPrice: variantFinalPrice,
              onSale: v.onSale || false,
              stock: v.stock || 0,
            };
          });

          // Get min price for display
          const minPriceVariant = variantPrices.reduce((min: any, current: any) => 
            current.finalPrice < min.finalPrice ? current : min
          );
          
          retailPrice = minPriceVariant.retailPrice;
          wholesalePrice = minPriceVariant.wholesalePrice;
          const finalPrice = minPriceVariant.finalPrice;
          onSale = minPriceVariant.onSale;
          
          // If variant is on sale, set sale price
          if (onSale && finalPrice < retailPrice) {
            salePrice = finalPrice;
            if (salePrice !== null) {
              salePercentage = Math.floor(((retailPrice - salePrice) / retailPrice) * 100);
            }
          }
          
          // Calculate total stock from all variants
          stock = variantPrices.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
        }
      }

      return {
        id: product._id?.toString(),
        name: product.name,
        slug: product.slug,
        description: product.description || "",
        shortDescription: product.shortDescription || "",
        categoryId: product.categoryId ? 
          (typeof product.categoryId === "object" ? product.categoryId._id?.toString() : product.categoryId.toString())
          : null,
        categoryName: product.categoryId && typeof product.categoryId === "object" && product.categoryId !== null && "name" in product.categoryId
          ? (product.categoryId as { name?: string }).name || null
          : null,
        images: product.images || [],
        retailPrice: retailPrice,
        wholesalePrice: wholesalePrice,
        onSale: onSale,
        salePrice: salePrice,
        salePercentage: salePercentage,
        saleStartDate: product.saleStartDate?.toISOString() || null,
        saleEndDate: product.saleEndDate?.toISOString() || null,
        stock: stock,
        sku: product.sku || "",
        status: product.status,
        weight: product.weight || null,
        dimensions: product.dimensions || null,
        tags: product.tags || [],
        hasVariants: product.hasVariants || false,
        createdAt: product.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: product.updatedAt?.toISOString() || new Date().toISOString(),
      };
    });

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
      if (!wholesalePrice || wholesalePrice < 0) {
        return NextResponse.json(
          { success: false, error: "Giá đại lý phải hợp lệ và không âm" },
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
      productData.wholesalePrice = parseFloat(wholesalePrice);
      // Set retailPrice to same as wholesalePrice for backward compatibility
      productData.retailPrice = parseFloat(wholesalePrice);
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
    } else {
      // For products with variants, set default values or skip pricing fields
      productData.retailPrice = 0; // Default value for products with variants
      productData.wholesalePrice = 0; // Default value for products with variants
      productData.stock = 0; // Stock is managed at variant level
      productData.onSale = false;
    }

    const newProduct = await Product.create(productData);
    
    // Handle both array and single document cases
    const productDoc = Array.isArray(newProduct) ? newProduct[0] : newProduct;
    const productId = productDoc._id?.toString() || (productDoc as { id?: string }).id || "";
    
    const populated = await Product.findById(productId).populate("categoryId", "name slug").lean();

    const formattedProduct = {
      id: productId,
      name: (productDoc as { name: string }).name,
      slug: (productDoc as { slug: string }).slug,
      description: (productDoc as { description?: string }).description || "",
      shortDescription: (productDoc as { shortDescription?: string }).shortDescription || "",
      categoryId: populated?.categoryId && typeof populated.categoryId === "object"
        ? populated.categoryId._id?.toString()
        : categoryId,
      categoryName: populated?.categoryId && typeof populated.categoryId === "object" && populated.categoryId !== null && "name" in populated.categoryId
        ? (populated.categoryId as { name?: string }).name || null
        : null,
      images: (productDoc as { images?: string[] }).images || [],
      retailPrice: (productDoc as { retailPrice: number }).retailPrice,
      wholesalePrice: (productDoc as { wholesalePrice: number }).wholesalePrice,
      onSale: (productDoc as { onSale?: boolean }).onSale || false,
      salePrice: (productDoc as { salePrice?: number }).salePrice || null,
      salePercentage: (productDoc as { salePercentage?: number }).salePercentage || null,
      saleStartDate: (productDoc as { saleStartDate?: Date }).saleStartDate?.toISOString() || null,
      saleEndDate: (productDoc as { saleEndDate?: Date }).saleEndDate?.toISOString() || null,
      stock: (productDoc as { stock?: number }).stock || 0,
      sku: (productDoc as { sku?: string }).sku || "",
      status: (productDoc as { status: string }).status,
      weight: (productDoc as { weight?: number }).weight || null,
      dimensions: (productDoc as { dimensions?: unknown }).dimensions || null,
      tags: (productDoc as { tags?: string[] }).tags || [],
      createdAt: (productDoc as { createdAt?: Date }).createdAt?.toISOString(),
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

