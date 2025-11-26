import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// GET - Lấy tất cả users với pagination
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Build query
    const query: any = {};

    // Filter by role
    if (role && role !== "all") {
      query.role = role;
    }

    // Filter by status
    if (status && status !== "all") {
      query.status = status;
    }

    // Search
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { fullName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await User.countDocuments(query);

    // Get paginated users (exclude password from response)
    const users = await User.find(query)
      .select("-password") // Exclude password field
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Format users
    const formattedUsers = users.map((user) => ({
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
    }));

    return NextResponse.json({
      success: true,
      data: formattedUsers,
      total: total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST - Tạo user mới
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      email,
      password,
      fullName,
      phone,
      role,
      address,
      city,
      state,
      zipCode,
      country,
      dateOfBirth,
      gender,
      status,
    } = body;

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
    const userData: any = {
      email: email.toLowerCase(),
      password: hashedPassword,
      fullName,
      role: role || "user",
      status: status || "active",
    };

    if (phone) userData.phone = phone;
    if (address) userData.address = address;
    if (city) userData.city = city;
    if (state) userData.state = state;
    if (zipCode) userData.zipCode = zipCode;
    if (country) userData.country = country;
    if (dateOfBirth) userData.dateOfBirth = new Date(dateOfBirth);
    if (gender) userData.gender = gender;

    const newUser = await User.create(userData);
    
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
    } = userDoc.toObject ? userDoc.toObject() : (userDoc as {
      _id?: { toString(): string } | string;
      email: string;
      fullName: string;
      phone?: string;
      role: string;
      address?: string;
      city?: string;
    });

    // Return user without password
    const formattedUser = {
      id: userObj._id?.toString() || "",
      email: userObj.email,
      fullName: userObj.fullName,
      phone: userObj.phone || "",
      role: userObj.role,
      address: userObj.address || "",
      city: userObj.city || "",
      state: newUser.state || "",
      zipCode: newUser.zipCode || "",
      country: newUser.country || "",
      avatar: newUser.avatar || "",
      dateOfBirth: newUser.dateOfBirth?.toISOString() || null,
      gender: newUser.gender || null,
      status: newUser.status,
      emailVerified: newUser.emailVerified || false,
      lastLogin: newUser.lastLogin?.toISOString() || null,
      createdAt: newUser.createdAt?.toISOString(),
      updatedAt: newUser.updatedAt?.toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: formattedUser,
        message: "Tạo người dùng thành công",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating user:", error);

    // Handle mongoose validation errors
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
      { success: false, error: error.message || "Failed to create user" },
      { status: 500 }
    );
  }
}

