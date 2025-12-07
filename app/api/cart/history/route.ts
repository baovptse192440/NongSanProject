import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import CartHistory from "@/models/CartHistory";
import Cart from "@/models/Cart";
import { getTokenFromRequest } from "@/lib/getTokenFromRequest";
import { verifyToken } from "@/lib/jwt";

// POST - Save cart to history (when checkout completes)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId, status = "completed" } = body;

    // Get current cart
    const cart = await Cart.findOne({ userId: decoded.userId });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cart is empty" },
        { status: 400 }
      );
    }

    // Calculate total amount
    const totalAmount = cart.items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    // Save to history
    const cartHistory = await CartHistory.create({
      userId: decoded.userId,
      orderId: orderId ? orderId : undefined,
      items: cart.items.map((item: any) => ({
        productId: item.productId,
        name: item.name,
        slug: item.slug,
        image: item.image,
        price: item.price,
        oldPrice: item.oldPrice,
        quantity: item.quantity,
        variantId: item.variantId,
        variantName: item.variantName,
      })),
      totalAmount,
      status,
    });

    // Clear cart after saving to history
    cart.items = [];
    await cart.save();

    return NextResponse.json({
      success: true,
      data: cartHistory,
      message: "Cart saved to history",
    });
  } catch (error: any) {
    console.error("Error saving cart history:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save cart history" },
      { status: 500 }
    );
  }
}

// GET - Get cart history
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    const histories = await CartHistory.find({ userId: decoded.userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await CartHistory.countDocuments({ userId: decoded.userId });

    return NextResponse.json({
      success: true,
      data: histories,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching cart history:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch cart history" },
      { status: 500 }
    );
  }
}

