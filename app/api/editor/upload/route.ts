import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Không có file được tải lên" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Chỉ chấp nhận file ảnh (JPEG, PNG, WebP, GIF)" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB for editor)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File không được vượt quá 10MB" },
        { status: 400 }
      );
    }

    // Create directory if not exists
    const uploadDir = join(process.cwd(), "public", "uploads", "editor");
    await mkdir(uploadDir, { recursive: true });

    // Sanitize filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const extension = originalName.split(".").pop();
    const filename = `editor_${timestamp}_${Math.random().toString(36).substring(7)}.${extension}`;
    const filepath = join(uploadDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return public URL - TinyMCE 5 expects JSON with location field
    const publicUrl = `/uploads/editor/${filename}`;
    
    console.log("File uploaded successfully:", {
      filename,
      publicUrl,
      filepath,
      size: file.size,
    });

    // Return JSON with location as string - TinyMCE 5 requires this format
    return NextResponse.json(
      { location: publicUrl },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: error.message || "Không thể tải file lên" },
      { status: 500 }
    );
  }
}

