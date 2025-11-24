import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Menu from "@/models/Menu";

// GET - Lấy tất cả menus
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Build query
    const query: any = {};

    // Filter by status
    if (status && status !== "all") {
      query.status = status;
    }

    // Search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { url: { $regex: search, $options: "i" } },
      ];
    }

    const menus = await Menu.find(query).sort({ order: 1, createdAt: -1 }).lean();

    // Convert to plain objects and format
    const formattedMenus = menus.map((menu) => ({
      id: menu._id?.toString(),
      title: menu.title,
      url: menu.url || "",
      icon: menu.icon || "",
      order: menu.order || 0,
      status: menu.status,
      parentId: menu.parentId?.toString(),
      createdAt: menu.createdAt?.toISOString() || new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: formattedMenus,
      total: formattedMenus.length,
    });
  } catch (error) {
    console.error("Error fetching menus:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch menus" },
      { status: 500 }
    );
  }
}

// POST - Tạo menu mới
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { title, url, icon, order, status, parentId } = body;

    // Validation
    if (!title) {
      return NextResponse.json(
        { success: false, error: "Tiêu đề menu là bắt buộc" },
        { status: 400 }
      );
    }

    // Check if parent exists (if parentId provided)
    if (parentId) {
      const parentMenu = await Menu.findById(parentId);
      if (!parentMenu) {
        return NextResponse.json(
          { success: false, error: "Menu cha không tồn tại" },
          { status: 400 }
        );
      }
    }

    // Create new menu
    const menuData: any = {
      title,
      url: url || "",
      icon: icon || "",
      order: order || 0,
      status: status || "active",
    };

    if (parentId) {
      menuData.parentId = parentId;
    }

    const newMenu = await Menu.create(menuData);

    const formattedMenu = {
      id: newMenu._id.toString(),
      title: newMenu.title,
      url: newMenu.url || "",
      icon: newMenu.icon || "",
      order: newMenu.order || 0,
      status: newMenu.status,
      parentId: newMenu.parentId?.toString(),
      createdAt: newMenu.createdAt?.toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: formattedMenu,
        message: "Tạo menu thành công",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating menu:", error);
    
    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: errors.join(", ") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to create menu" },
      { status: 500 }
    );
  }
}

