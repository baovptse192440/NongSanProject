import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { verifyToken } from "@/lib/jwt";
import { getTokenFromRequest } from "@/lib/getTokenFromRequest";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";
import * as XLSX from "xlsx";

// GET - Export Excel tổng kết
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

    // Get date range from query params
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "30");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch data
    const orders = await Order.find({
      createdAt: { $gte: startDate },
    })
      .sort({ createdAt: -1 })
      .lean();

    const products = await Product.find({ status: "active" }).lean();
    const users = await User.find({}).lean();

    // Prepare data for Excel
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Orders Summary
    const ordersData = orders.map((order) => ({
      "Order Number": order.orderNumber,
      "Customer Name": order.userFullName,
      "Customer Email": order.userEmail,
      "Status": order.status,
      "Subtotal": order.subtotal,
      "Shipping Fee": order.shippingFee,
      "Total": order.total,
      "Items Count": order.items.length,
      "Created At": order.createdAt ? new Date(order.createdAt).toLocaleString() : "",
    }));

    const ordersSheet = XLSX.utils.json_to_sheet(ordersData);
    XLSX.utils.book_append_sheet(workbook, ordersSheet, "Orders");

    // Sheet 2: Products Summary
    const productsData = products.map((product) => ({
      "Product Name": product.name,
      "SKU": product.slug,
      "Retail Price": product.retailPrice,
      "Wholesale Price": product.wholesalePrice || 0,
      "Stock": product.stock,
      "Status": product.status,
      "Category": product.categoryId || "N/A",
      "Created At": product.createdAt ? new Date(product.createdAt).toLocaleString() : "",
    }));

    const productsSheet = XLSX.utils.json_to_sheet(productsData);
    XLSX.utils.book_append_sheet(workbook, productsSheet, "Products");

    // Sheet 3: Users Summary
    const usersData = users.map((user) => ({
      "Full Name": user.fullName,
      "Email": user.email,
      "Phone": user.phone || "N/A",
      "Role": user.role,
      "Status": user.status || "active",
      "Created At": user.createdAt ? new Date(user.createdAt).toLocaleString() : "",
    }));

    const usersSheet = XLSX.utils.json_to_sheet(usersData);
    XLSX.utils.book_append_sheet(workbook, usersSheet, "Users");

    // Sheet 4: Revenue Summary
    const revenueStats = await Order.aggregate([
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

    const revenueData = revenueStats.map((item) => ({
      Date: item._id,
      Revenue: item.revenue,
      "Orders Count": item.orders,
    }));

    const revenueSheet = XLSX.utils.json_to_sheet(revenueData);
    XLSX.utils.book_append_sheet(workbook, revenueSheet, "Revenue");

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Return file
    const filename = `dashboard-export-${new Date().toISOString().split("T")[0]}.xlsx`;
    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Error exporting dashboard:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to export dashboard" },
      { status: 500 }
    );
  }
}

