import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Cart from "@/models/Cart";
import { getTokenFromRequest } from "@/lib/getTokenFromRequest";
import { verifyToken } from "@/lib/jwt";

// GET - Get user's cart
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

    const cart = await Cart.findOne({ userId: decoded.userId });
    
    if (!cart) {
      // Create empty cart if doesn't exist
      const newCart = await Cart.create({
        userId: decoded.userId,
        items: [],
      });
      return NextResponse.json({
        success: true,
        data: newCart.items,
      });
    }

    return NextResponse.json({
      success: true,
      data: cart.items,
    });
  } catch (error: any) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

// POST - Add or update item in cart
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
    const { item } = body;

    if (!item || !item.productId) {
      return NextResponse.json(
        { success: false, error: "Invalid item data" },
        { status: 400 }
      );
    }

    // Generate cart item ID (productId + variantId if exists)
    const cartItemId = item.variantId 
      ? `${item.productId}_${item.variantId}`
      : item.productId;

    let cart = await Cart.findOne({ userId: decoded.userId });

    if (!cart) {
      cart = await Cart.create({
        userId: decoded.userId,
        items: [],
      });
    }

    // Check if item already exists
    const existingItemIndex = cart.items.findIndex(
      (i: any) => {
        const existingId = i.variantId 
          ? `${i.productId}_${i.variantId}`
          : i.productId;
        return existingId === cartItemId;
      }
    );

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const existingItem = cart.items[existingItemIndex];
      const newQuantity = existingItem.quantity + (item.quantity || 1);
      
      if (newQuantity > item.stock) {
        return NextResponse.json(
          { success: false, error: `Can only add up to ${item.stock} products` },
          { status: 400 }
        );
      }

      cart.items[existingItemIndex] = {
        ...existingItem.toObject(),
        quantity: newQuantity,
        price: item.price || existingItem.price,
        oldPrice: item.oldPrice || existingItem.oldPrice,
        stock: item.stock || existingItem.stock,
      };
    } else {
      // Add new item
      cart.items.push({
        productId: item.productId,
        name: item.name,
        slug: item.slug,
        image: item.image,
        price: item.price,
        oldPrice: item.oldPrice,
        quantity: item.quantity || 1,
        variantId: item.variantId,
        variantName: item.variantName,
        stock: item.stock,
      });
    }

    await cart.save();

    return NextResponse.json({
      success: true,
      data: cart.items,
      message: "Item added to cart",
    });
  } catch (error: any) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to add to cart" },
      { status: 500 }
    );
  }
}

// PUT - Update entire cart
export async function PUT(request: NextRequest) {
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
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: "Invalid items data" },
        { status: 400 }
      );
    }

    let cart = await Cart.findOne({ userId: decoded.userId });

    if (!cart) {
      cart = await Cart.create({
        userId: decoded.userId,
        items: items,
      });
    } else {
      cart.items = items;
      await cart.save();
    }

    return NextResponse.json({
      success: true,
      data: cart.items,
      message: "Cart updated",
    });
  } catch (error: any) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update cart" },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from cart
export async function DELETE(request: NextRequest) {
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
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: "Item ID is required" },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ userId: decoded.userId });

    if (!cart) {
      return NextResponse.json(
        { success: false, error: "Cart not found" },
        { status: 404 }
      );
    }

    // Remove item by productId or productId_variantId
    cart.items = cart.items.filter((item: any) => {
      const existingId = item.variantId 
        ? `${item.productId}_${item.variantId}`
        : item.productId;
      return existingId !== itemId;
    });

    await cart.save();

    return NextResponse.json({
      success: true,
      data: cart.items,
      message: "Item removed from cart",
    });
  } catch (error: any) {
    console.error("Error removing from cart:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to remove from cart" },
      { status: 500 }
    );
  }
}

