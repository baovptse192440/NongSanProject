import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { verifyToken } from "@/lib/jwt";
import { getTokenFromRequest } from "@/lib/getTokenFromRequest";
import { sendOrderConfirmationToUser } from "@/lib/email";
import Order from "@/models/Order";
import User from "@/models/User";
import Notification from "@/models/Notification";

// GET - Get all orders (admin only)
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

    // Check if user is admin
    const user = await User.findById(decoded.userId).lean();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;
    const search = searchParams.get("search");

    // Build query
    const query: any = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { userEmail: { $regex: search, $options: "i" } },
        { userFullName: { $regex: search, $options: "i" } },
      ];
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
      id: order._id?.toString(),
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

// PATCH - Update order status (admin only)
export async function PATCH(request: NextRequest) {
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

    // Check if user is admin
    const user = await User.findById(decoded.userId).lean();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get request body
    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: "Order ID and status are required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    // Fetch order before update to get full details
    const existingOrder = await Order.findById(orderId).lean();
    
    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Update order
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status, updatedAt: new Date() },
      { new: true }
    ).lean();

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Send confirmation email and create notification for user when status changes
    // Only send email if status changed and is not pending
    if (existingOrder.status !== status && status !== "pending") {
      try {
        const orderDataForEmail = {
          orderId: order._id?.toString(),
          orderNumber: order.orderNumber,
          userEmail: order.userEmail,
          userFullName: order.userFullName,
          status: order.status,
          items: order.items.map((item: any) => ({
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            variantName: item.variantName,
          })),
          subtotal: order.subtotal,
          shippingFee: order.shippingFee,
          total: order.total,
          shippingAddress: order.shippingAddress,
          shippingCity: order.shippingCity,
          shippingState: order.shippingState,
          shippingZipCode: order.shippingZipCode,
          shippingCountry: order.shippingCountry,
        };

        const emailResult = await sendOrderConfirmationToUser(orderDataForEmail);
        if (!emailResult.success) {
          console.error("Failed to send order confirmation email:", emailResult.error);
          // Don't fail the request if email fails, just log it
        }

        // Create notification for user
        try {
          const statusLabels: Record<string, string> = {
            confirmed: "Order Confirmed",
            processing: "Order Processing",
            shipped: "Order Shipped",
            delivered: "Order Delivered",
            cancelled: "Order Cancelled",
          };

          const statusMessages: Record<string, string> = {
            confirmed: "Your order has been confirmed and is being prepared.",
            processing: "Your order is being processed.",
            shipped: "Your order has been shipped and is on its way.",
            delivered: "Your order has been delivered successfully.",
            cancelled: "Your order has been cancelled.",
          };

          await Notification.create({
            userId: order.userId,
            type: "order",
            title: statusLabels[status] || "Order Status Updated",
            message: statusMessages[status] || `Your order #${order.orderNumber} status has been updated to ${status}.`,
            orderId: order._id?.toString(),
            orderNumber: order.orderNumber,
            read: false,
          });
        } catch (notificationError) {
          console.error("Error creating notification:", notificationError);
          // Don't fail the request if notification creation fails
        }
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: order._id?.toString(),
        orderNumber: order.orderNumber,
        status: order.status,
      },
    });
  } catch (error: any) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update order" },
      { status: 500 }
    );
  }
}

