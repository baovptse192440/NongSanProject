import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { verifyToken } from "@/lib/jwt";
import { getTokenFromRequest } from "@/lib/getTokenFromRequest";
import Order from "@/models/Order";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get token from Authorization header
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    // Build query
    const query: any = { userId: decoded.userId };
    if (status) {
      query.status = status;
    }

    // Fetch orders
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    // Get total count
    const total = await Order.countDocuments(query);

    // Format orders
    const formattedOrders = orders.map((order) => ({
      id: order._id.toString(),
      orderNumber: order.orderNumber,
      userId: order.userId,
      userEmail: order.userEmail,
      userFullName: order.userFullName,
      userPhone: order.userPhone,
      shippingAddress: order.shippingAddress,
      shippingCity: order.shippingCity,
      shippingState: order.shippingState,
      shippingZipCode: order.shippingZipCode,
      shippingCountry: order.shippingCountry,
      items: order.items,
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      total: order.total,
      status: order.status,
      notes: order.notes,
      createdAt: order.createdAt?.toISOString(),
      updatedAt: order.updatedAt?.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: formattedOrders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
