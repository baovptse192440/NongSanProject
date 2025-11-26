import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { verifyToken } from "@/lib/jwt";
import { getTokenFromRequest } from "@/lib/getTokenFromRequest";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";

// GET - Lấy thống kê tổng quan
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

    // Get date range from query params (default: last 30 days)
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "30");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Total counts
    const totalOrders = await Order.countDocuments({});
    const totalUsers = await User.countDocuments({});
    const totalProducts = await Product.countDocuments({ status: "active" });

    // Revenue stats
    const revenueStats = await Order.aggregate([
      {
        $match: {
          status: { $in: ["confirmed", "processing", "shipped", "delivered"] },
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: "$total" },
        },
      },
    ]);

    const revenue = revenueStats[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
    };

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusCounts: Record<string, number> = {};
    ordersByStatus.forEach((item) => {
      statusCounts[item._id] = item.count;
    });

    // Revenue by date (last 30 days)
    const revenueByDate = await Order.aggregate([
      {
        $match: {
          status: { $in: ["confirmed", "processing", "shipped", "delivered"] },
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Top products by sales
    const topProducts = await Order.aggregate([
      {
        $match: {
          status: { $in: ["confirmed", "processing", "shipped", "delivered"] },
          createdAt: { $gte: startDate },
        },
      },
      {
        $unwind: "$items",
      },
      {
        $group: {
          _id: "$items.productId",
          productName: { $first: "$items.productName" },
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      {
        $sort: { totalQuantity: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // Recent orders
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Format response data
    const responseData = {
      overview: {
        totalOrders: totalOrders || 0,
        totalUsers: totalUsers || 0,
        totalProducts: totalProducts || 0,
        totalRevenue: revenue.totalRevenue || 0,
        totalOrdersInPeriod: revenue.totalOrders || 0,
        averageOrderValue: revenue.averageOrderValue || 0,
      },
      ordersByStatus: statusCounts || {},
      revenueByDate: revenueByDate.map((item) => ({
        date: item._id,
        revenue: item.revenue || 0,
        orders: item.orders || 0,
      })),
      topProducts: topProducts.map((item) => ({
        productId: item._id || "",
        productName: item.productName || "Unknown Product",
        totalQuantity: item.totalQuantity || 0,
        totalRevenue: item.totalRevenue || 0,
      })),
      recentOrders: recentOrders.map((order) => ({
        id: order._id?.toString() || "",
        orderNumber: order.orderNumber || "",
        userFullName: order.userFullName || "",
        total: order.total || 0,
        status: order.status || "pending",
        createdAt: order.createdAt ? order.createdAt.toString() : new Date().toISOString(),
      })),
    };

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch dashboard stats";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

