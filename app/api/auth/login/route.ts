import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email và mật khẩu là bắt buộc" },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Email hoặc mật khẩu không đúng" },
        { status: 401 }
      );
    }

    // Check status
    if (user.status !== "active") {
      return NextResponse.json(
        { success: false, error: "Tài khoản của bạn đã bị khóa" },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Email hoặc mật khẩu không đúng" },
        { status: 401 }
      );
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Return user without password
    const formattedUser = {
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      phone: user.phone || "",
      role: user.role,
      address: user.address || "",
      city: user.city || "",
      state: user.state || "",
      zipCode: user.zipCode || "",
      country: user.country || "",
      avatar: user.avatar || "",
      dateOfBirth: user.dateOfBirth?.toISOString() || null,
      gender: user.gender || null,
      status: user.status,
      emailVerified: user.emailVerified || false,
      lastLogin: user.lastLogin?.toISOString() || null,
      createdAt: user.createdAt?.toISOString(),
    };

    // Return response with token (client will store in localStorage)
    return NextResponse.json(
      {
        success: true,
        data: formattedUser,
        token,
        message: "Đăng nhập thành công",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error logging in:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to login" },
      { status: 500 }
    );
  }
}

