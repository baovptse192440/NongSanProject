import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Banner from "@/models/Banner";

// GET - Lấy banner theo ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const banner = await Banner.findById(id).lean();

    if (!banner) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy banner" },
        { status: 404 }
      );
    }

    const formattedBanner = {
      id: banner._id?.toString(),
      type: banner.type,
      image: banner.image,
      title: banner.title || "",
      link: banner.link || "",
      order: banner.order,
      status: banner.status,
      createdAt: banner.createdAt?.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: formattedBanner,
    });
  } catch (error) {
    console.error("Error fetching banner:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch banner" },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật banner
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const body = await request.json();
    const { type, image, title, link, order, status } = body;

    const banner = await Banner.findById(id);
    if (!banner) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy banner" },
        { status: 404 }
      );
    }

    // Validation
    if (type && type !== "main" && type !== "side") {
      return NextResponse.json(
        { success: false, error: "Loại banner không hợp lệ" },
        { status: 400 }
      );
    }

    // Check max side banners if changing to side type
    if ((type === "side" || banner.type === "side") && status === "active") {
      const existingSideBanners = await Banner.countDocuments({
        type: "side",
        status: "active",
        _id: { $ne: id },
      });
      if (existingSideBanners >= 2) {
        return NextResponse.json(
          { success: false, error: "Tối đa 2 banner phụ có thể được kích hoạt" },
          { status: 400 }
        );
      }
    }

    // Update banner
    if (type) banner.type = type;
    if (image) banner.image = image;
    if (title !== undefined) banner.title = title;
    if (link !== undefined) banner.link = link;
    if (order !== undefined) banner.order = order;
    if (status) banner.status = status;

    await banner.save();

    const formattedBanner = {
      id: banner._id.toString(),
      type: banner.type,
      image: banner.image,
      title: banner.title || "",
      link: banner.link || "",
      order: banner.order,
      status: banner.status,
      createdAt: banner.createdAt?.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: formattedBanner,
      message: "Cập nhật banner thành công",
    });
  } catch (error: any) {
    console.error("Error updating banner:", error);
    
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: errors.join(", ") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to update banner" },
      { status: 500 }
    );
  }
}

// DELETE - Xóa banner
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const banner = await Banner.findByIdAndDelete(id);

    if (!banner) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy banner" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Xóa banner thành công",
    });
  } catch (error: any) {
    console.error("Error deleting banner:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete banner" },
      { status: 500 }
    );
  }
}

