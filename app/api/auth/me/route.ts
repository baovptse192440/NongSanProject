import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/jwt";
import { getTokenFromRequest } from "@/lib/getTokenFromRequest";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get token from Authorization header
    const token = getTokenFromRequest(request);
    console.log("=== /api/auth/me ===");
    console.log("Token received:", token ? token.substring(0, 20) + "..." : "NO TOKEN");

    if (!token) {
      console.log("No token, returning 401");
      return NextResponse.json(
        { success: false, error: "Không có token" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token);
    console.log("Decoded token:", decoded);
    
    if (!decoded) {
      console.log("Token invalid, returning 401");
      return NextResponse.json(
        { success: false, error: "Token không hợp lệ" },
        { status: 401 }
      );
    }

    // Find user
    const user = await User.findById(decoded.userId).lean();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Người dùng không tồn tại" },
        { status: 404 }
      );
    }

    // Return user without password
    const formattedUser = {
      id: user._id?.toString(),
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
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: user.updatedAt?.toISOString() || new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: formattedUser,
    });
  } catch (error: any) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch user" },
      { status: 500 }
    );
  }
}

