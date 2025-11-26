"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingCart, ArrowLeft, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  oldPrice?: number;
  quantity: number;
  variantId?: string;
  variantName?: string;
  stock: number;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [shippingConfig, setShippingConfig] = useState({
    shippingFee: 10,
    minimumOrderForFreeShipping: 50,
  });

  // Format price in AUD
  const formatPrice = (price: number): string => {
    return "$" + price.toLocaleString("en-AU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Load cart - no authentication required
  useEffect(() => {
    const loadCartData = async () => {
      try {
        // Load cart from localStorage (no login required)
        try {
          const savedCart = localStorage.getItem("cart");
          if (savedCart) {
            const items = JSON.parse(savedCart);
            setCartItems(items);
          }
        } catch (error) {
          console.error("Error loading cart:", error);
        }

        // Load shipping config
        try {
          const configResponse = await fetch("/api/config");
          const configResult = await configResponse.json();
          if (configResult.success) {
            setShippingConfig({
              shippingFee: configResult.data.shippingFee ?? 10,
              minimumOrderForFreeShipping: configResult.data.minimumOrderForFreeShipping ?? 50,
            });
          }
        } catch (error) {
          console.error("Error fetching shipping config:", error);
        }
      } catch (error) {
        console.error("Error loading cart data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCartData();

    // Listen for cart updates
    const handleCartUpdate = () => {
      loadCartData();
    };
    const handleStorageChange = () => {
      loadCartData();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Save cart to localStorage
  const saveCart = (items: CartItem[]) => {
    try {
      localStorage.setItem("cart", JSON.stringify(items));
      setCartItems(items);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  };

  // Update quantity
  const updateQuantity = (id: string, delta: number) => {
    setUpdating(id);
    const updatedItems = cartItems.map((item) => {
      if (item.id === id) {
        const newQuantity = Math.max(1, Math.min(item.quantity + delta, item.stock || 99));
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    
    setTimeout(() => {
      saveCart(updatedItems);
      setUpdating(null);
    }, 150);
  };

  // Remove item
  const removeItem = (id: string) => {
    const updatedItems = cartItems.filter((item) => item.id !== id);
    saveCart(updatedItems);
  };

  // Calculate totals using config
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal >= shippingConfig.minimumOrderForFreeShipping 
    ? 0 
    : shippingConfig.shippingFee;
  const total = subtotal + shippingFee;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="bg-[#eeeeee] mt-10 md:mt-32">
        <div className="flex items-center justify-center py-40">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
            <p className="text-sm text-gray-600">Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#eeeeee] md:mt-36">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 w-full flex z-50 p-3 md:hidden">
        <div className="left-side w-1/2">
          <div className="bg-[rgba(45,46,50,0.5)] w-9 h-9 flex items-center justify-center rounded-full">
            <ArrowLeft strokeWidth={1} color="white" onClick={() => window.history.back()} />
          </div>
        </div>
        <div className="right-side w-1/2 flex justify-end items-center">
          <h1 className="text-base font-semibold text-white">Cart</h1>
        </div>
      </header>

      {/* Breadcrumb - Desktop */}
      <div className="md:flex overflow-x-auto bg-[#e6e6e6] border-gray-200 hidden">
        <div className="container mx-auto px-4 py-3 overflow-x-auto">
          <div className="flex items-center gap-2 text-sm text-gray-600 overflow-x-auto">
            <Link href="/" className="hover:text-green-600">Home</Link>
            <span>/</span>
            <span className="text-gray-900">Cart</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full bg-white md:max-w-[1260px] md:rounded-sm mx-auto md:py-5 xs:px-0 xs:py-0">
        <div className="px-4 md:px-6 py-6 md:py-5">
          {/* Page Title */}
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6 md:mb-8 pt-12 md:pt-0">
            Shopping Cart {totalItems > 0 && <span className="text-gray-500 font-normal">({totalItems})</span>}
          </h1>

        {cartItems.length === 0 ? (
            <div className="bg-white rounded-sm border border-gray-200 p-12 md:p-16 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <ShoppingCart className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900 mb-1">Your cart is empty</p>
                  <p className="text-sm text-gray-600">Add items to continue shopping</p>
                </div>
            <Link
                  href="/category"
                  className="mt-2 px-6 py-2.5 bg-green-700 text-white rounded-xs font-semibold hover:bg-green-800 transition-colors text-sm"
            >
                  Continue Shopping
            </Link>
              </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
              {/* Cart Items - Left Side */}
              <div className="flex-1">
                <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
                  <AnimatePresence mode="popLayout">
                    {cartItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2, delay: index * 0.02 }}
                        className={`p-4 md:p-5 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors ${
                          index === 0 ? "border-t-0" : ""
                        }`}
                  >
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <Link
                            href={`/product/${item.slug}`}
                            className="relative w-20 h-20 md:w-24 md:h-24 rounded-xs overflow-hidden border border-gray-200 bg-gray-100 shrink-0"
                          >
                            <Image
                              src={item.image || "/sp/1.jpg"}
                        alt={item.name}
                              fill
                              className="object-cover"
                              sizes="96px"
                            />
                          </Link>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <Link
                                  href={`/product/${item.slug}`}
                                  className="block text-sm md:text-base font-semibold text-gray-900 hover:text-green-700 transition-colors line-clamp-2 mb-1"
                                >
                                  {item.name}
                                </Link>
                                {item.variantName && (
                                  <p className="text-xs text-gray-500 mb-2">
                                    Packaging: {item.variantName}
                                  </p>
                                )}
                                <div className="flex items-baseline gap-2 mb-3">
                                  <span className="text-base font-semibold text-green-700">
                                    {formatPrice(item.price)}
                                  </span>
                                  {item.oldPrice && item.oldPrice > item.price && (
                                    <span className="text-xs text-gray-400 line-through">
                                      {formatPrice(item.oldPrice)}
                                    </span>
                                  )}
                      </div>
                    </div>

                              {/* Remove Button */}
                        <button
                                onClick={() => removeItem(item.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xs transition-colors shrink-0"
                                title="Remove item"
                        >
                                <Trash2 size={18} />
                        </button>
                            </div>

                            {/* Controls Row */}
                            <div className="flex items-center justify-between gap-4 mt-2">
                              {/* Quantity Controls */}
                              <div className="flex items-center border border-gray-300 rounded-xs overflow-hidden">
                        <button
                                  onClick={() => updateQuantity(item.id, -1)}
                                  disabled={item.quantity <= 1 || updating === item.id}
                                  className="flex items-center justify-center w-10 h-10 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                                  {updating === item.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                                  ) : (
                                    <Minus size={18} />
                                  )}
                        </button>
                                <div className="flex items-center justify-center w-12 h-10 border-x border-gray-300 font-semibold text-gray-900">
                                  {item.quantity}
                      </div>
                      <button
                                  onClick={() => updateQuantity(item.id, 1)}
                                  disabled={item.quantity >= item.stock || updating === item.id}
                                  className="flex items-center justify-center w-10 h-10 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                                  {updating === item.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                                  ) : (
                                    <Plus size={18} />
                                  )}
                      </button>
                              </div>

                              {/* Item Total */}
                              <div className="text-right">
                                <span className="text-sm text-gray-600">Subtotal:</span>
                                <p className="text-base font-bold text-green-700">
                                  {formatPrice(item.price * item.quantity)}
                                </p>
                              </div>
                            </div>
                          </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
              </div>

              {/* Order Summary - Right Side */}
              <div className="w-full lg:w-96">
                <div className="bg-white rounded-sm border border-gray-200 sticky top-[100px] overflow-hidden">
                  {/* Summary Header */}
                  <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
                  </div>

                  <div className="px-5 py-5 space-y-4">
                    {/* Summary Items */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal ({totalItems} items):</span>
                        <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Shipping:</span>
                        <span className="font-semibold text-gray-900">
                          {shippingFee === 0 ? (
                            <span className="text-green-700">Free</span>
                          ) : (
                            formatPrice(shippingFee)
                          )}
                        </span>
                      </div>
                      {subtotal < shippingConfig.minimumOrderForFreeShipping && (
                        <div className="text-xs text-orange-600 bg-orange-50 p-2.5 rounded-xs border border-orange-200">
                          Add {formatPrice(shippingConfig.minimumOrderForFreeShipping - subtotal)} more for free shipping
                        </div>
                      )}
                    </div>

                    {/* Total */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Total:</span>
                        <span className="text-2xl font-bold text-green-700">
                          {formatPrice(total)}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-2">
                      <Link
                        href="/checkout"
                        className="block w-full bg-green-700 text-white py-3 text-center font-semibold rounded-xs hover:bg-green-800 transition-colors"
                      >
                        Checkout
                      </Link>
                      <Link
                        href="/category"
                        className="block w-full border border-green-700 text-green-700 py-3 text-center font-semibold rounded-xs hover:bg-green-50 transition-colors"
                      >
                        Continue Shopping
                      </Link>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="px-5 pb-5 pt-4 border-t border-gray-200 space-y-2 bg-gray-50">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-green-600"></div>
                      <span>Free shipping on orders over {formatPrice(shippingConfig.minimumOrderForFreeShipping)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-green-600"></div>
                      <span>Quality guarantee</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 rounded-full bg-green-600"></div>
                      <span>7-day returns</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
            </div>
          </div>
    </div>
  );
}
