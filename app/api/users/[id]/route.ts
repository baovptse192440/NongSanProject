import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// GET - Lấy user theo ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const user = await User.findById(id).select("-password").lean();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Người dùng không tồn tại" },
        { status: 404 }
      );
    }

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
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

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

    const existingUser = await User.findById(id);
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "Người dùng không tồn tại" },
        { status: 404 }
      );
    }

    // Validation - Only validate if email or fullName is provided
    if (email && !fullName) {
      return NextResponse.json(
        { success: false, error: "Họ tên là bắt buộc khi cập nhật email" },
        { status: 400 }
      );
    }

    // Check if email already exists (except for current user) - only if email is being changed
    if (email && email.toLowerCase() !== existingUser.email.toLowerCase()) {
      const emailExists = await User.findOne({ email: email.toLowerCase(), _id: { $ne: id } });
      if (emailExists) {
        return NextResponse.json(
          { success: false, error: "Email đã tồn tại" },
          { status: 400 }
        );
      }
      existingUser.email = email.toLowerCase();
    }

    // Update user fields only if provided
    if (fullName !== undefined) existingUser.fullName = fullName;
    if (role !== undefined) existingUser.role = role;
    if (status !== undefined) existingUser.status = status;

    // Update password if provided
    if (password && password.length >= 6) {
      const salt = await bcrypt.genSalt(10);
      existingUser.password = await bcrypt.hash(password, salt);
    }

    if (phone !== undefined) existingUser.phone = phone || null;
    if (address !== undefined) existingUser.address = address || null;
    if (city !== undefined) existingUser.city = city || null;
    if (state !== undefined) existingUser.state = state || null;
    if (zipCode !== undefined) existingUser.zipCode = zipCode || null;
    if (country !== undefined) existingUser.country = country || null;
    if (dateOfBirth !== undefined) existingUser.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    if (gender !== undefined) existingUser.gender = gender || null;

    await existingUser.save();

    // Return updated user without password
    const updated = await User.findById(id).select("-password").lean();

    const formattedUser = {
      id: updated?._id?.toString(),
      email: updated?.email,
      fullName: updated?.fullName,
      phone: updated?.phone || "",
      role: updated?.role,
      address: updated?.address || "",
      city: updated?.city || "",
      state: updated?.state || "",
      zipCode: updated?.zipCode || "",
      country: updated?.country || "",
      avatar: updated?.avatar || "",
      dateOfBirth: updated?.dateOfBirth?.toISOString() || null,
      gender: updated?.gender || null,
      status: updated?.status,
      emailVerified: updated?.emailVerified || false,
      lastLogin: updated?.lastLogin?.toISOString() || null,
      updatedAt: updated?.updatedAt?.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: formattedUser,
      message: "Cập nhật người dùng thành công",
    });
  } catch (error: any) {
    console.error("Error updating user:", error);

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
      { success: false, error: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE - Xóa user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Người dùng không tồn tại" },
        { status: 404 }
      );
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Xóa người dùng thành công",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete user" },
      { status: 500 }
    );
  }
}

