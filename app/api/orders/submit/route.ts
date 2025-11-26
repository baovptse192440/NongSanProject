import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { verifyToken } from "@/lib/jwt";
import { getTokenFromRequest } from "@/lib/getTokenFromRequest";
import { sendOrderNotificationToAdmin } from "@/lib/email";
import Order from "@/models/Order";
import User from "@/models/User";
import Notification from "@/models/Notification";

interface OrderItem {
  productId: string;
  productName: string;
  slug?: string;
  image?: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  price: number;
}

export async function POST(request: NextRequest) {
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

    // Get request body
    const body = await request.json();
    const { items, subtotal, shippingFee, total, notes } = body;

    // Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order items are required" },
        { status: 400 }
      );
    }

    if (typeof subtotal !== "number" || typeof total !== "number") {
      return NextResponse.json(
        { success: false, error: "Invalid order totals" },
        { status: 400 }
      );
    }

    // Get user from database to get shipping info
    const User = (await import("@/models/User")).default;
    const user = await User.findById(decoded.userId).lean();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Validate user has shipping address
    if (!user.fullName || !user.email || !user.address || !user.city || !user.state || !user.zipCode) {
      return NextResponse.json(
        { success: false, error: "Please complete your shipping address" },
        { status: 400 }
      );
    }

    // Generate unique order number (OD + timestamp + random)
    let orderNumber: string;
    let attempts = 0;
    do {
      const timestamp = Date.now().toString().slice(-8);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
      orderNumber = `OD${timestamp}${random}`;
      
      // Check if order number already exists
      const existingOrder = await Order.findOne({ orderNumber });
      if (!existingOrder) {
        break;
      }
      
      attempts++;
      if (attempts > 10) {
        return NextResponse.json(
          { success: false, error: "Failed to generate unique order number. Please try again." },
          { status: 500 }
        );
      }
      
      // Small delay to ensure different timestamp for next attempt
      await new Promise(resolve => setTimeout(resolve, 10));
    } while (true);

    // Prepare order items with all required fields
    const orderItems = items.map((item: OrderItem) => ({
      productId: item.productId,
      productName: item.productName,
      slug: item.slug || "",
      image: item.image || "/sp/1.jpg",
      price: item.price,
      quantity: item.quantity,
      variantId: item.variantId || undefined,
      variantName: item.variantName || undefined,
    }));

    // Create order in database
    const order = new Order({
      orderNumber,
      userId: decoded.userId,
      userEmail: user.email,
      userFullName: user.fullName,
      userPhone: user.phone || undefined,
      shippingAddress: user.address,
      shippingCity: user.city,
      shippingState: user.state,
      shippingZipCode: user.zipCode,
      shippingCountry: user.country || "Australia",
      items: orderItems,
      subtotal,
      shippingFee: shippingFee || 0,
      total,
      status: "pending",
      notes: notes || undefined,
    });

    // Save order to database
    await order.save();

    // Prepare order data for email
    const orderData = {
      orderNumber,
      userFullName: user.fullName,
      userEmail: user.email,
      userPhone: user.phone || undefined,
      shippingAddress: user.address,
      shippingCity: user.city,
      shippingState: user.state,
      shippingZipCode: user.zipCode,
      shippingCountry: user.country || "Australia",
      items: items.map((item: OrderItem) => ({
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        variantName: item.variantName || undefined,
      })),
      subtotal,
      shippingFee: shippingFee || 0,
      total,
      notes: notes || undefined,
    };

    // Get all admin users and their emails
    try {
      const adminUsers = await User.find({ role: "admin" }).select("_id email").lean();
      const adminEmails = adminUsers.map((admin) => admin.email).filter(Boolean) as string[];
      
      // Send email to all admins
      if (adminEmails.length > 0) {
        const emailResult = await sendOrderNotificationToAdmin(orderData, adminEmails);
        if (!emailResult.success) {
          console.error("Failed to send order notification email:", emailResult.error);
          // Don't fail the request if email fails, just log it
        }
      }

      // Create notifications for all admin users
      const notifications = adminUsers.map((admin) => ({
        userId: admin._id.toString(),
        type: "order" as const,
        title: "New Order Received",
        message: `New order ${orderNumber} from ${user.fullName} (${user.email})`,
        orderId: order._id.toString(),
        orderNumber: orderNumber,
        read: false,
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    } catch (notifError) {
      console.error("Error creating notifications or sending emails:", notifError);
      // Don't fail the request if notification creation fails
    }

    // Return success response with order ID
    return NextResponse.json({
      success: true,
      data: {
        orderId: order._id.toString(),
        orderNumber,
        message: "Order submitted successfully. Admin will contact you soon.",
      },
    });
  } catch (error: any) {
    console.error("Error submitting order:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit order" },
      { status: 500 }
    );
  }
}

