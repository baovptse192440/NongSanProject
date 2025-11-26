import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Post from "@/models/Post";

// GET - Search products and posts
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const type = searchParams.get("type") || "all"; // "all", "products", "posts"
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          products: [],
          posts: [],
          totalProducts: 0,
          totalPosts: 0,
          page,
          limit,
          totalPages: 0,
        },
      });
    }

    const skip = (page - 1) * limit;
    const searchRegex = { $regex: query.trim(), $options: "i" };

    const results: {
      products: any[];
      posts: any[];
      totalProducts: number;
      totalPosts: number;
      page: number;
      limit: number;
      totalPages: number;
    } = {
      products: [],
      posts: [],
      totalProducts: 0,
      totalPosts: 0,
      page,
      limit,
      totalPages: 0,
    };

    // Search Products
    if (type === "all" || type === "products") {
      const productQuery: any = {
        status: "active",
        $or: [
          { name: searchRegex },
          { slug: searchRegex },
          { description: searchRegex },
          { shortDescription: searchRegex },
          { sku: searchRegex },
          { tags: { $in: [new RegExp(query.trim(), "i")] } },
        ],
      };

      const totalProducts = await Product.countDocuments(productQuery);
      const products = await Product.find(productQuery)
        .populate("categoryId", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      results.products = products.map((product: any) => ({
        id: product._id?.toString(),
        name: product.name,
        slug: product.slug,
        description: product.description,
        shortDescription: product.shortDescription,
        images: product.images || [],
        retailPrice: product.retailPrice,
        wholesalePrice: product.wholesalePrice,
        onSale: product.onSale,
        salePrice: product.salePrice,
        salePercentage: product.salePercentage,
        stock: product.stock,
        sku: product.sku,
        category: product.categoryId
          ? {
              id: product.categoryId._id?.toString(),
              name: product.categoryId.name,
              slug: product.categoryId.slug,
            }
          : null,
        createdAt: product.createdAt,
      }));

      results.totalProducts = totalProducts;
    }

    // Search Posts
    if (type === "all" || type === "posts") {
      const postQuery: any = {
        status: "published",
        $or: [
          { title: searchRegex },
          { slug: searchRegex },
          { excerpt: searchRegex },
          { content: searchRegex },
          { tags: { $in: [new RegExp(query.trim(), "i")] } },
        ],
      };

      const totalPosts = await Post.countDocuments(postQuery);
      const posts = await Post.find(postQuery)
        .populate("categoryId", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      results.posts = posts.map((post: any) => ({
        id: post._id?.toString(),
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        featuredImage: post.featuredImage,
        category: post.categoryId
          ? {
              id: post.categoryId._id?.toString(),
              name: post.categoryId.name,
              slug: post.categoryId.slug,
            }
          : null,
        createdAt: post.createdAt,
      }));

      results.totalPosts = totalPosts;
    }

    // Calculate total pages
    const totalItems = results.totalProducts + results.totalPosts;
    results.totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      success: true,
      data: results,
      query: query.trim(),
    });
  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Search failed" },
      { status: 500 }
    );
  }
}

