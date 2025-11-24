import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // "logo", "favicon", "logoDark", "ogImage"

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Không có file được tải lên" },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { success: false, error: "Loại file không được chỉ định" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml", "image/x-icon"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Chỉ chấp nhận file ảnh (JPEG, PNG, WebP, SVG, ICO)" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "File không được vượt quá 5MB" },
        { status: 400 }
      );
    }

    // Create directory if not exists
    const uploadDir = join(process.cwd(), "public", "uploads", "config");
    await mkdir(uploadDir, { recursive: true });

    // Sanitize filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const extension = originalName.split(".").pop();
    const filename = `${type}_${timestamp}.${extension}`;
    const filepath = join(uploadDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return public URL
    const publicUrl = `/uploads/config/${filename}`;

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        filename: filename,
        size: file.size,
        type: file.type,
      },
      message: "Tải file lên thành công",
    });
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Không thể tải file lên" },
      { status: 500 }
    );
  }
}

