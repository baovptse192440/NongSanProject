import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

// GET - Lấy product theo slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const { slug } = await params;

    const product = await Product.findOne({ slug, status: "active" })
      .populate("categoryId", "name slug")
      .lean();

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
          if (salePrice !== null) {
            salePercentage = Math.floor(((retailPrice - salePrice) / retailPrice) * 100);
          }
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
      categoryName: product.categoryId && typeof product.categoryId === "object" && product.categoryId !== null && "name" in product.categoryId
        ? (product.categoryId as { name?: string }).name || null
        : null,
      categorySlug: product.categoryId && typeof product.categoryId === "object" && product.categoryId !== null && "slug" in product.categoryId
        ? (product.categoryId as { slug?: string }).slug || null
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
    console.error("Error fetching product by slug:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

