import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/jwt";
import { getTokenFromRequest } from "@/lib/getTokenFromRequest";
import { sendVerificationEmail } from "@/lib/email";
import { generateToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Bạn cần đăng nhập để xác thực email" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Token không hợp lệ" },
        { status: 401 }
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
      return NextResponse.json(
        { success: false, error: "Email đã được xác thực" },
        { status: 400 }
      );
    }

    // Generate verification token
    const verificationToken = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Send verification email
    const emailResult = await sendVerificationEmail(user.email, verificationToken);

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, error: "Không thể gửi email. Vui lòng thử lại sau." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email xác thực đã được gửi. Vui lòng kiểm tra hộp thư của bạn.",
    });
  } catch (error: any) {
    console.error("Error sending verification email:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send verification email" },
      { status: 500 }
    );
  }
}

