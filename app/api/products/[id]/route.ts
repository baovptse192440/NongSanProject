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

    let retailPrice = product.retailPrice;
    let wholesalePrice = product.wholesalePrice;
    let onSale = product.onSale || false;
    let salePrice = product.salePrice || null;
    let salePercentage = product.salePercentage || null;
    let stock = product.stock || 0;

    // If product has variants, calculate price from variants
    if (product.hasVariants) {
      const ProductVariant = (await import("@/models/ProductVariant")).default;
      const variants = await ProductVariant.find({
        productId: product._id,
        status: "active"
      }).lean();

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
          salePercentage = Math.floor(((retailPrice - salePrice) / retailPrice) * 100);
        }
        
        // Calculate total stock from all variants
        stock = variantPrices.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
      }
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
      hasVariants,
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

    // Only validate pricing if product doesn't have variants
    const useVariants = hasVariants !== undefined ? hasVariants : existingProduct.hasVariants || false;
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
    
    // Handle hasVariants
    if (hasVariants !== undefined) {
      existingProduct.hasVariants = hasVariants;
    }
    
    // Only update pricing/stock if no variants
    if (!useVariants) {
      if (retailPrice !== undefined && retailPrice !== null) {
        existingProduct.retailPrice = parseFloat(retailPrice);
      }
      if (wholesalePrice !== undefined && wholesalePrice !== null) {
        existingProduct.wholesalePrice = parseFloat(wholesalePrice);
      }
      existingProduct.onSale = onSale || false;
      if (stock !== undefined && stock !== null) {
        existingProduct.stock = parseInt(stock);
      }
      
      if (onSale) {
        if (salePrice !== undefined && salePrice !== null) {
          existingProduct.salePrice = parseFloat(salePrice);
        }
        if (salePercentage !== undefined && salePercentage !== null) {
          existingProduct.salePercentage = parseFloat(salePercentage);
        }
        if (saleStartDate) existingProduct.saleStartDate = new Date(saleStartDate);
        if (saleEndDate) existingProduct.saleEndDate = new Date(saleEndDate);
      } else {
        existingProduct.salePrice = null;
        existingProduct.salePercentage = null;
        existingProduct.saleStartDate = null;
        existingProduct.saleEndDate = null;
      }
    } else {
      // For products with variants, reset pricing fields or keep defaults
      existingProduct.retailPrice = 0;
      existingProduct.wholesalePrice = 0;
      existingProduct.stock = 0;
      existingProduct.onSale = false;
      existingProduct.salePrice = null;
      existingProduct.salePercentage = null;
      existingProduct.saleStartDate = null;
      existingProduct.saleEndDate = null;
    }
    
    existingProduct.status = status || existingProduct.status;

    if (sku !== undefined) existingProduct.sku = sku || null;
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
      hasVariants: updated?.hasVariants || false,
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

