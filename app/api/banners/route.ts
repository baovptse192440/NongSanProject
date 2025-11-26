import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Banner from "@/models/Banner";

// GET - Lấy tất cả banners
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    // Build query
    const query: any = {};

    // Filter by status
    if (status && status !== "all") {
      query.status = status;
    }

    // Filter by type
    if (type && (type === "main" || type === "side")) {
      query.type = type;
    }

    const banners = await Banner.find(query).sort({ order: 1, createdAt: -1 }).lean();

    // Convert to plain objects and format
    const formattedBanners = banners.map((banner) => ({
      id: banner._id?.toString(),
      type: banner.type,
      image: banner.image,
      title: banner.title || "",
      link: banner.link || "",
      order: banner.order,
      status: banner.status,
      createdAt: banner.createdAt?.toISOString() || new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: formattedBanners,
      total: formattedBanners.length,
    });
  } catch (error) {
    console.error("Error fetching banners:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch banners" },
      { status: 500 }
    );
  }
}

// POST - Tạo banner mới
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { type, image, title, link, order, status } = body;

    // Validation
    if (!type || !image) {
      return NextResponse.json(
        { success: false, error: "Loại banner và ảnh là bắt buộc" },
        { status: 400 }
      );
    }

    if (type !== "main" && type !== "side") {
      return NextResponse.json(
        { success: false, error: "Loại banner không hợp lệ" },
        { status: 400 }
      );
    }

    // Check max banners by type
    if (type === "side") {
      const existingSideBanners = await Banner.countDocuments({ type: "side", status: "active" });
      if (existingSideBanners >= 2) {
        return NextResponse.json(
          { success: false, error: "Tối đa 2 banner phụ có thể được kích hoạt" },
          { status: 400 }
        );
      }
    }

    // Create new banner
    const bannerData: any = {
      type,
      image,
      order: order || 0,
      status: status || "active",
    };

    if (title) bannerData.title = title;
    if (link) bannerData.link = link;

    const newBanner = await Banner.create(bannerData);

    const formattedBanner = {
      id: newBanner._id.toString(),
      type: newBanner.type,
      image: newBanner.image,
      title: newBanner.title || "",
      link: newBanner.link || "",
      order: newBanner.order,
      status: newBanner.status,
      createdAt: newBanner.createdAt?.toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: formattedBanner,
        message: "Tạo banner thành công",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating banner:", error);
    
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: errors.join(", ") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to create banner" },
      { status: 500 }
    );
  }
}

