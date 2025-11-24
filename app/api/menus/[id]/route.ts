import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Menu from "@/models/Menu";

// GET - Lấy menu theo ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const menu = await Menu.findById(id).lean();

    if (!menu) {
      return NextResponse.json(
        { success: false, error: "Menu không tồn tại" },
        { status: 404 }
      );
    }

    const formattedMenu = {
      id: menu._id?.toString(),
      title: menu.title,
      url: menu.url || "",
      icon: menu.icon || "",
      order: menu.order || 0,
      status: menu.status,
      parentId: menu.parentId?.toString(),
      createdAt: menu.createdAt?.toISOString() || new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: formattedMenu,
    });
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch menu" },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật menu
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const body = await request.json();
    const { title, url, icon, order, status, parentId } = body;

    // Check if menu exists
    const existingMenu = await Menu.findById(id);
    if (!existingMenu) {
      return NextResponse.json(
        { success: false, error: "Menu không tồn tại" },
        { status: 404 }
      );
    }

    // Validation
    if (!title) {
      return NextResponse.json(
        { success: false, error: "Tiêu đề menu là bắt buộc" },
        { status: 400 }
      );
    }

    // Prevent circular reference (menu cannot be its own parent)
    if (parentId === id) {
      return NextResponse.json(
        { success: false, error: "Menu không thể là menu cha của chính nó" },
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

    // Update menu
    const updateData: any = {
      title,
      url: url || "",
      icon: icon || "",
      order: order ?? existingMenu.order,
      status: status || existingMenu.status,
    };

    if (parentId !== undefined) {
      updateData.parentId = parentId || null;
    }

    const updatedMenu = await Menu.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    const formattedMenu = {
      id: updatedMenu?._id.toString(),
      title: updatedMenu?.title,
      url: updatedMenu?.url || "",
      icon: updatedMenu?.icon || "",
      order: updatedMenu?.order || 0,
      status: updatedMenu?.status,
      parentId: updatedMenu?.parentId?.toString(),
      createdAt: updatedMenu?.createdAt?.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: formattedMenu,
      message: "Cập nhật menu thành công",
    });
  } catch (error: any) {
    console.error("Error updating menu:", error);
    
    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: errors.join(", ") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to update menu" },
      { status: 500 }
    );
  }
}

// DELETE - Xóa menu
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const menu = await Menu.findById(id);
    if (!menu) {
      return NextResponse.json(
        { success: false, error: "Menu không tồn tại" },
        { status: 404 }
      );
    }

    // Check if menu has children
    const childMenus = await Menu.find({ parentId: id });
    if (childMenus.length > 0) {
      return NextResponse.json(
        { success: false, error: "Không thể xóa menu có menu con. Vui lòng xóa các menu con trước." },
        { status: 400 }
      );
    }

    await Menu.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Xóa menu thành công",
    });
  } catch (error) {
    console.error("Error deleting menu:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete menu" },
      { status: 500 }
    );
  }
}

