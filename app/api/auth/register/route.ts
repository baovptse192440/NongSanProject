import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, password, fullName, phone } = body;

    // Validation
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { success: false, error: "Email, mật khẩu và họ tên là bắt buộc" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Mật khẩu phải có ít nhất 6 ký tự" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email đã tồn tại" },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      fullName,
      phone: phone || "",
      role: "user",
      status: "active",
      emailVerified: false,
    });

    // Generate JWT token for session
    const token = generateToken({
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
    });

    // Generate verification token for email
    const verificationToken = generateToken({
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
    });

    // Send verification email
    try {
      const { sendVerificationEmail } = await import("@/lib/email");
      await sendVerificationEmail(newUser.email, verificationToken);
    } catch (error) {
      console.error("Error sending verification email:", error);
      // Don't fail registration if email fails
    }

    // Return user without password
    const formattedUser = {
      id: newUser._id.toString(),
      email: newUser.email,
      fullName: newUser.fullName,
      phone: newUser.phone || "",
      role: newUser.role,
      address: newUser.address || "",
      city: newUser.city || "",
      state: newUser.state || "",
      zipCode: newUser.zipCode || "",
      country: newUser.country || "",
      avatar: newUser.avatar || "",
      dateOfBirth: newUser.dateOfBirth?.toISOString() || null,
      gender: newUser.gender || null,
      status: newUser.status,
      emailVerified: newUser.emailVerified || false,
      createdAt: newUser.createdAt?.toISOString(),
    };

    // Create response with cookie
    const response = NextResponse.json(
      {
        success: true,
        data: formattedUser,
        token,
        message: "Đăng ký thành công",
      },
      { status: 201 }
    );

    // Set HTTP-only cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("Error registering user:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: errors.join(", ") },
        { status: 400 }
      );
    }

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "Email đã tồn tại" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to register" },
      { status: 500 }
    );
  }
}

