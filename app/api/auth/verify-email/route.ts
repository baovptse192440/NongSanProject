import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token không hợp lệ" },
        { status: 400 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Token không hợp lệ hoặc đã hết hạn" },
        { status: 400 }
      );
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Người dùng không tồn tại" },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: "Email đã được xác thực trước đó",
      });
    }

    // Verify email
    user.emailVerified = true;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Email đã được xác thực thành công",
    });
  } catch (error: any) {
    console.error("Error verifying email:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to verify email" },
      { status: 500 }
    );
  }
}

