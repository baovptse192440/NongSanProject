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
    
    // Handle both array and single document cases
    const userDoc = Array.isArray(newUser) ? newUser[0] : newUser;
    const userObj: {
      _id?: { toString(): string } | string;
      email: string;
      fullName: string;
      phone?: string;
      role: string;
      address?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
      avatar?: string;
      dateOfBirth?: Date;
      gender?: string;
      status: string;
      emailVerified?: boolean;
      createdAt?: Date;
    } = userDoc.toObject ? userDoc.toObject() : (userDoc as {
      _id?: { toString(): string } | string;
      email: string;
      fullName: string;
      phone?: string;
      role: string;
      address?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
      avatar?: string;
      dateOfBirth?: Date;
      gender?: string;
      status: string;
      emailVerified?: boolean;
      createdAt?: Date;
    });
    
    const userId = userObj._id?.toString() || "";

    // Generate JWT token for session
    const token = generateToken({
      userId,
      email: userObj.email,
      role: userObj.role,
    });

    // Generate verification token for email
    const verificationToken = generateToken({
      userId,
      email: userObj.email,
      role: userObj.role,
    });

    // Send verification email
    try {
      const { sendVerificationEmail } = await import("@/lib/email");
      await sendVerificationEmail(userObj.email, verificationToken);
    } catch (error) {
      console.error("Error sending verification email:", error);
      // Don't fail registration if email fails
    }

    // Return user without password
    const formattedUser = {
      id: userId,
      email: userObj.email,
      fullName: userObj.fullName,
      phone: userObj.phone || "",
      role: userObj.role,
      address: userObj.address || "",
      city: userObj.city || "",
      state: userObj.state || "",
      zipCode: userObj.zipCode || "",
      country: userObj.country || "",
      avatar: userObj.avatar || "",
      dateOfBirth: userObj.dateOfBirth?.toISOString() || null,
      gender: userObj.gender || null,
      status: userObj.status,
      emailVerified: userObj.emailVerified || false,
      createdAt: userObj.createdAt?.toISOString(),
    };

    // Return response with token (client will store in localStorage)
    return NextResponse.json(
      {
        success: true,
        data: formattedUser,
        token,
        message: "Đăng ký thành công",
      },
      { status: 201 }
    );
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

