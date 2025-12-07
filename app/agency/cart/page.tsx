"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingCart, ArrowLeft, Loader2, Check } from "lucide-react";
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
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
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

  // Helper function to generate cart item ID (same format as API)
  const getCartItemId = (item: CartItem): string => {
    return item.variantId 
      ? `${item.productId}_${item.variantId}`
      : item.productId;
  };

  // Load cart from API (user is authenticated in agency)
  useEffect(() => {
    const loadCartData = async () => {
      try {
        setLoading(true);
        
        // Load cart from API
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          setLoading(false);
          return;
        }

        const response = await fetch("/api/cart", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (result.success) {
          const items = result.data || [];
          setCartItems(items);
          // Auto-select all items by default
          setSelectedItems(new Set(items.map((item: CartItem) => getCartItemId(item))));
        } else {
          console.error("Error loading cart:", result.error);
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

  // Save cart to API
  const saveCart = async (items: CartItem[]) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items }),
      });

      const result = await response.json();

      if (result.success) {
        setCartItems(items);
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        console.error("Error saving cart:", result.error);
      }
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  };

  // Update quantity
  const updateQuantity = async (id: string, delta: number) => {
    setUpdating(id);
    const updatedItems = cartItems.map((item) => {
      if (getCartItemId(item) === id) {
        const newQuantity = Math.max(1, Math.min(item.quantity + delta, item.stock || 99));
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    
    setTimeout(async () => {
      await saveCart(updatedItems);
      setUpdating(null);
    }, 150);
  };

  // Remove item
  const removeItem = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      // Remove from API
      const response = await fetch(`/api/cart?itemId=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setCartItems(result.data);
        // Remove from selected items
        const newSelected = new Set(selectedItems);
        newSelected.delete(id);
        setSelectedItems(newSelected);
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        console.error("Error removing item:", result.error);
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  // Toggle item selection
  const toggleItemSelection = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map(item => getCartItemId(item))));
    }
  };

  // Calculate totals using selected items only
  const selectedCartItems = cartItems.filter(item => selectedItems.has(getCartItemId(item)));
  const subtotal = selectedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal >= shippingConfig.minimumOrderForFreeShipping 
    ? 0 
    : shippingConfig.shippingFee;
  const total = subtotal + shippingFee;
  const totalItems = selectedCartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="bg-gray-50 pt-20 md:pt-24">
        <div className="flex items-center justify-center py-40">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-[#0a923c] animate-spin" />
            <p className="text-sm text-gray-600">Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 pt-20 md:pt-36 pb-8">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        {/* Page Title */}

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 md:p-16 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                <ShoppingCart className="w-10 h-10 text-gray-400" />
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-900 mb-1">Your cart is empty</p>
                <p className="text-sm text-gray-600">Start shopping to add items to your cart</p>
              </div>
              <Link
                href="/agency/category"
                className="mt-4 px-8 py-3 bg-black text-white rounded-md font-semibold hover:bg-gray-800 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Cart Items - Left Side */}
            <div className="flex-1">
              {/* Cart Header with Select All */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={toggleSelectAll}
                    className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-all ${
                      selectedItems.size === cartItems.length && cartItems.length > 0
                        ? 'bg-[#0a923c] border-[#0a923c]'
                        : 'border-gray-300 hover:border-[#0a923c]'
                    }`}
                  >
                    {selectedItems.size === cartItems.length && cartItems.length > 0 && (
                      <Check size={14} className="text-white" />
                    )}
                  </button>
                  <span className="text-sm font-medium text-gray-700">
                    Select all ({selectedItems.size}/{cartItems.length})
                  </span>
                  {selectedItems.size > 0 && (
                    <button
                      onClick={() => {
                        selectedItems.forEach(id => removeItem(id));
                        setSelectedItems(new Set());
                      }}
                      className="ml-auto text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Delete Selected
                    </button>
                  )}
                </div>
              </div>

              {/* Cart Items List */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <AnimatePresence mode="popLayout">
                  {cartItems.map((item, index) => (
                    <motion.div
                      key={getCartItemId(item)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      className={`p-4 md:p-5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${
                        index === 0 ? "" : ""
                      }`}
                    >
                      <div className="flex gap-4">
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleItemSelection(getCartItemId(item))}
                          className={`flex items-center justify-center w-5 h-5 rounded border-2 mt-1 transition-all shrink-0 ${
                            selectedItems.has(getCartItemId(item))
                              ? 'bg-[#0a923c] border-[#0a923c]'
                              : 'border-gray-300 hover:border-[#0a923c]'
                          }`}
                        >
                          {selectedItems.has(getCartItemId(item)) && (
                            <Check size={14} className="text-white" />
                          )}
                        </button>

                        {/* Product Image */}
                        <Link
                          href={`/agency/product/${item.slug}`}
                          className="relative w-20 h-20 md:w-24 md:h-24 rounded-md overflow-hidden border border-gray-200 bg-gray-100 shrink-0 group"
                        >
                          <Image
                            src={item.image || "/sp/1.jpg"}
                            alt={item.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="96px"
                          />
                        </Link>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/agency/product/${item.slug}`}
                                className="block text-sm md:text-base font-medium text-gray-900 hover:text-[#0a923c] transition-colors line-clamp-2 mb-2"
                              >
                                {item.name}
                              </Link>
                              {item.variantName && (
                                <p className="text-xs text-gray-500 mb-2">
                                  {item.variantName}
                                </p>
                              )}
                              <div className="flex items-baseline gap-2">
                                <span className="text-base md:text-lg font-bold text-gray-900">
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
                              onClick={() => removeItem(getCartItemId(item))}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors shrink-0"
                              title="Remove item"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>

                          {/* Controls Row */}
                          <div className="flex items-center justify-between gap-4 mt-4">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                              <button
                                onClick={() => updateQuantity(getCartItemId(item), -1)}
                                disabled={item.quantity <= 1 || updating === getCartItemId(item)}
                                className="flex items-center justify-center w-9 h-9 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-r border-gray-300"
                              >
                                {updating === getCartItemId(item) ? (
                                  <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                                ) : (
                                  <Minus size={16} className="text-gray-600" />
                                )}
                              </button>
                              <div className="flex items-center justify-center w-12 h-9 font-semibold text-gray-900 bg-white border-x border-gray-300">
                                {item.quantity}
                              </div>
                              <button
                                onClick={() => updateQuantity(getCartItemId(item), 1)}
                                disabled={item.quantity >= item.stock || updating === getCartItemId(item)}
                                className="flex items-center justify-center w-9 h-9 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-l border-gray-300"
                              >
                                {updating === getCartItemId(item) ? (
                                  <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                                ) : (
                                  <Plus size={16} className="text-gray-600" />
                                )}
                              </button>
                            </div>

                            {/* Item Total */}
                            <div className="text-right">
                              <p className="text-base md:text-lg font-bold text-gray-900">
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
            <div className="w-full lg:w-80 shrink-0">
              <div className="bg-white rounded-lg border border-gray-200 sticky top-24 overflow-hidden">
                {/* Summary Header */}
                <div className="px-5 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
                </div>

                <div className="px-5 py-5 space-y-4">
                  {/* Summary Items */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'}):</span>
                      <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping:</span>
                      <span className="font-semibold text-gray-900">
                        {shippingFee === 0 ? (
                          <span className="text-[#0a923c]">Free</span>
                        ) : (
                          formatPrice(shippingFee)
                        )}
                      </span>
                    </div>
                    {subtotal > 0 && subtotal < shippingConfig.minimumOrderForFreeShipping && (
                      <div className="text-xs text-orange-600 bg-orange-50 p-2.5 rounded-md border border-orange-200">
                        Add {formatPrice(shippingConfig.minimumOrderForFreeShipping - subtotal)} more for free shipping
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total:</span>
                      <span className="text-2xl font-bold text-gray-900">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-2">
                    {selectedItems.size > 0 ? (
                      <Link
                        href="/agency/checkout"
                        onClick={() => {
                          // Save selected items for checkout
                          const selectedItemsForCheckout = cartItems.filter(item => selectedItems.has(getCartItemId(item)));
                          localStorage.setItem("checkoutItems", JSON.stringify(selectedItemsForCheckout));
                        }}
                        className="block w-full py-3 text-center font-semibold rounded-md transition-colors bg-[#0a923c] text-white hover:bg-[#04772f]"
                      >
                        Checkout ({selectedItems.size} {selectedItems.size === 1 ? 'item' : 'items'})
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="block w-full py-3 text-center font-semibold rounded-md bg-gray-300 text-gray-500 cursor-not-allowed"
                      >
                        Checkout (0 items)
                      </button>
                    )}
                    <Link
                      href="/agency/category"
                      className="block w-full border-2 border-gray-300 text-gray-700 py-3 text-center font-semibold rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </div>

                {/* Benefits */}
                <div className="px-5 pb-5 pt-4 border-t border-gray-200 space-y-2 bg-gray-50">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0a923c]"></div>
                    <span>Free shipping on orders over {formatPrice(shippingConfig.minimumOrderForFreeShipping)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0a923c]"></div>
                    <span>Quality guarantee</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0a923c]"></div>
                    <span>Secure checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
