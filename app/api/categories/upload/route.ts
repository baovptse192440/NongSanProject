import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// Upload image endpoint
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Không có file được tải lên" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Loại file không hợp lệ. Chỉ chấp nhận JPEG, PNG và WebP.",
        },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: "Kích thước file quá lớn. Tối đa 5MB.",
        },
        { status: 400 }
      );
    }

    // Generate safe filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const extension = originalName.split(".").pop() || "jpg";
    const safeFileName = `category-${timestamp}.${extension}`;
    
    // Define upload directory
    const uploadDir = join(process.cwd(), "public", "uploads", "categories");
    
    // Create directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file
    const filePath = join(uploadDir, safeFileName);
    await writeFile(filePath, buffer);

    // Return URL (accessible from /uploads/categories/filename)
    const imageUrl = `/uploads/categories/${safeFileName}`;

    return NextResponse.json({
      success: true,
      data: {
        url: imageUrl,
        fileName: safeFileName,
        size: file.size,
        type: file.type,
      },
      message: "Tải ảnh lên thành công",
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi tải ảnh lên" },
      { status: 500 }
    );
  }
}
