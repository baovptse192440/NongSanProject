import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { verifyToken } from "@/lib/jwt";
import { getTokenFromRequest } from "@/lib/getTokenFromRequest";
import Notification from "@/models/Notification";
import User from "@/models/User";

// GET - Get notifications for current user
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

    // Get user
    const user = await User.findById(decoded.userId).lean();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const read = searchParams.get("read");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build query
    const query: any = { userId: decoded.userId };
    if (read !== null) {
      query.read = read === "true";
    }

    // Fetch notifications
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      userId: decoded.userId,
      read: false,
    });

    // Format notifications
    const formattedNotifications = notifications.map((notif) => ({
      id: notif._id?.toString(),
      type: notif.type,
      title: notif.title,
      message: notif.message,
      orderId: notif.orderId,
      orderNumber: notif.orderNumber,
      read: notif.read,
      createdAt: notif.createdAt?.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: formattedNotifications,
      unreadCount,
    });
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// PATCH - Mark notification as read
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

    // Get request body
    const body = await request.json();
    const { notificationId, markAllAsRead } = body;

    if (markAllAsRead) {
      // Mark all notifications as read for this user
      await Notification.updateMany(
        { userId: decoded.userId, read: false },
        { read: true }
      );

      return NextResponse.json({
        success: true,
        message: "All notifications marked as read",
      });
    }

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: "Notification ID is required" },
        { status: 400 }
      );
    }

    // Update notification
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: decoded.userId },
      { read: true },
      { new: true }
    ).lean();

    if (!notification) {
      return NextResponse.json(
        { success: false, error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: notification._id?.toString(),
        read: notification.read,
      },
    });
  } catch (error: any) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update notification" },
      { status: 500 }
    );
  }
}

