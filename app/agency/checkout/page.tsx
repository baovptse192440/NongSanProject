"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ToastContainer from "../../common/Toast";
import { useToast } from "../../common/useToast";
import { ArrowLeft, Loader2, MapPin, User, Mail, Phone, FileText } from "lucide-react";

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

interface UserData {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  avatar: string;
  dateOfBirth: string | null;
  gender: "male" | "female" | "other" | null;
  status: string;
  emailVerified: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { toasts, toast, removeToast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");
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

  // Load cart, user data, and shipping config
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        // Check authentication first
        const token = localStorage.getItem("token");
        const authResponse = await fetch("/api/auth/me", { 
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            "Authorization": token ? `Bearer ${token}` : "",
          }
        });
        const authResult = await authResponse.json();

        if (!isMounted) return;

        if (!authResult.success || !authResult.data) {
          // User not logged in, redirect to login
          window.location.replace("/login?redirect=/agency/checkout");
          return;
        }

        // Set user
        setUser(authResult.data);

        // Load cart from API (user is authenticated)
        const cartResponse = await fetch("/api/cart", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const cartResult = await cartResponse.json();
        
        if (cartResult.success && cartResult.data && isMounted) {
          setCartItems(cartResult.data);
        } else if (isMounted) {
          // If no cart from API, check localStorage as fallback
          const savedCart = localStorage.getItem("cart");
          if (savedCart) {
            try {
              const items = JSON.parse(savedCart);
              setCartItems(items);
            } catch (error) {
              console.error("Error parsing cart from localStorage:", error);
              setCartItems([]);
            }
          } else {
            setCartItems([]);
          }
        }

        // Load shipping config
        const configResponse = await fetch("/api/config");
        const configResult = await configResponse.json();
        if (configResult.success && isMounted) {
          setShippingConfig({
            shippingFee: configResult.data.shippingFee ?? 10,
            minimumOrderForFreeShipping: configResult.data.minimumOrderForFreeShipping ?? 50,
          });
        }
      } catch (error) {
        console.error("Error loading data:", error);
        if (isMounted) {
          toast.error("Error", "Failed to load checkout data");
          window.location.replace("/login?redirect=/agency/checkout");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    // Listen for storage changes (when token is removed on logout)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token" && !e.newValue) {
        // Token was removed, redirect to login
        window.location.replace("/login?redirect=/agency/checkout");
      }
    };

    // Listen for custom logout event
    const handleLogout = () => {
      window.location.replace("/login?redirect=/agency/checkout");
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userLoggedOut", handleLogout);

    return () => {
      isMounted = false;
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userLoggedOut", handleLogout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate totals using config
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal >= shippingConfig.minimumOrderForFreeShipping 
    ? 0 
    : shippingConfig.shippingFee;
  const total = subtotal + shippingFee;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Validate checkout data
  const validateCheckout = (): boolean => {
    if (cartItems.length === 0) {
      toast.error("Error", "Your cart is empty");
      router.push("/agency/cart");
      return false;
    }

    if (!user) {
      toast.error("Error", "Please login to continue");
      router.push("/login?redirect=/agency/checkout");
      return false;
    }

    if (!user.fullName || !user.email) {
      toast.error("Error", "Please complete your profile information");
      router.push("/agency/profile");
      return false;
    }

    if (!user.address || !user.city || !user.state || !user.zipCode) {
      toast.error("Error", "Please complete your shipping address");
      router.push("/agency/profile");
      return false;
    }

    return true;
  };

  // Submit order
  const handleSubmitOrder = async () => {
    if (!validateCheckout() || !user) return;

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/orders/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: item.productId,
            productName: item.name,
            slug: item.slug,
            image: item.image,
            variantId: item.variantId,
            variantName: item.variantName,
            quantity: item.quantity,
            price: item.price,
          })),
          subtotal,
          shippingFee,
          total,
          notes: notes.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Save cart to history and clear cart
        const token = localStorage.getItem("token");
        if (token) {
          try {
            // Save cart history (this will also clear the cart in the API)
            const historyResponse = await fetch("/api/cart/history", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                orderId: result.data?.id || result.data?._id,
                status: "completed",
              }),
            });
            
            if (!historyResponse.ok) {
              console.error("Failed to save cart history");
            }
          } catch (error) {
            console.error("Error saving cart history:", error);
            // Don't block the success flow if history save fails
          }
        }
        
        // Clear localStorage cart as fallback
        localStorage.removeItem("cart");
        window.dispatchEvent(new Event("cartUpdated"));

        // Show success message
        toast.success("Success", "Order submitted successfully! Admin will contact you soon.");

        // Redirect to home after 2 seconds
        setTimeout(() => {
          router.push("/agency");
        }, 2000);
      } else {
        toast.error("Error", result.error || "Failed to submit order");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error("Error", "Failed to submit order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eeeeee] mt-10 md:mt-32">
        <div className="flex items-center justify-center py-40">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
            <p className="text-sm text-gray-600">Loading checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#eeeeee] md:mt-36">
        <ToastContainer toasts={toasts} onClose={removeToast} />
        <div className="w-full bg-white md:container md:rounded-sm mx-auto md:py-5 xs:px-0 xs:py-0">
          <div className="px-4 md:px-6 py-12 text-center">
            <p className="text-lg text-gray-600 mb-4">Your cart is empty</p>
            <Link
              href="/agency/category"
              className="inline-block px-6 py-2.5 bg-green-700 text-white rounded-xs font-semibold hover:bg-green-800 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#eeeeee] md:mt-[80px] mt-16">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 w-full flex z-50 p-3 md:hidden">
        <div className="left-side w-1/2">
          <div className="bg-[rgba(45,46,50,0.5)] w-9 h-9 flex items-center justify-center rounded-full">
            <ArrowLeft strokeWidth={1} color="white" onClick={() => router.back()} />
          </div>
        </div>
      </header>

      {/* Breadcrumb - Desktop */}
      <div className="md:flex overflow-x-auto bg-[#e6e6e6] border-gray-200 hidden">
        <div className="mx-auto w-full max-w-7xl pl-[0.4rem] pr-[0.4rem] md:pl-4 md:pr-4 py-3 overflow-x-auto">
          <div className="flex items-center gap-2 text-sm text-gray-600 overflow-x-auto">
            <Link href="/agency" className="hover:text-green-600">Home</Link>
            <span>/</span>
            <Link href="/agency/cart" className="hover:text-green-600">Cart</Link>
            <span>/</span>
            <span className="text-gray-900">Checkout</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full bg-white md:container md:rounded-sm mx-auto md:py-5 xs:px-0 xs:py-0">
        <div className="px-4 md:px-6 py-6 md:py-5">

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Side - Order Details */}
            <div className="flex-1 space-y-6">
              {/* Customer Information */}
              <div className="bg-white rounded-sm border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-green-700" />
                  <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Full Name</p>
                    <p className="text-base font-medium text-gray-900">{user?.fullName || "N/A"}</p>
                  </div>
                  <div className="flex flex-col md:flex-row md:gap-6">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        Email
                      </p>
                      <p className="text-base font-medium text-gray-900">{user?.email || "N/A"}</p>
                    </div>
                    {user?.phone && (
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          Phone
                        </p>
                        <p className="text-base font-medium text-gray-900">{user.phone}</p>
                      </div>
                    )}
                  </div>
                  {(!user?.fullName || !user?.email || !user?.address || !user?.city || !user?.state || !user?.zipCode) && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xs p-3">
                      <p className="text-sm text-yellow-800">
                        Please complete your profile information before checkout.
                      </p>
                      <Link
                        href="/agency/profile"
                        className="text-sm text-yellow-700 hover:underline mt-1 inline-block"
                      >
                        Update Profile →
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-sm border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-green-700" />
                  <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
                </div>
                {user?.address && user?.city && user?.state && user?.zipCode ? (
                  <div className="space-y-1">
                    <p className="text-base text-gray-900">{user.address}</p>
                    <p className="text-base text-gray-900">
                      {user.city}, {user.state} {user.zipCode}
                    </p>
                    <p className="text-base text-gray-900">{user.country || "Australia"}</p>
                    <Link
                      href="/agency/profile"
                      className="text-sm text-green-700 font-medium hover:underline mt-2 inline-block"
                    >
                      Change Address →
                    </Link>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xs p-3">
                    <p className="text-sm text-yellow-800 mb-2">
                      Shipping address is incomplete.
                    </p>
                    <Link
                      href="/agency/profile"
                      className="text-sm text-yellow-700 font-medium hover:underline"
                    >
                      Add Shipping Address →
                    </Link>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-sm border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-green-700" />
                  <h2 className="text-lg font-semibold text-gray-900">Order Items ({totalItems})</h2>
                </div>
                <div className="space-y-4">
                  {cartItems.map((item, index) => {
                    // Generate ID same as in API
                    const itemId = item.variantId 
                      ? `${item.productId}_${item.variantId}`
                      : item.productId;
                    return (
                    <div key={itemId || index} className="flex gap-4 pb-4 border-b border-gray-200 last:border-b-0 last:pb-0">
                      <Link
                        href={`/agency/product/${item.slug}`}
                        className="relative w-20 h-20 rounded-xs overflow-hidden border border-gray-200 bg-gray-100 shrink-0"
                      >
                        <Image
                          src={item.image || "/sp/1.jpg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/agency/product/${item.slug}`}
                          className="block text-sm md:text-base font-semibold text-gray-900 hover:text-green-700 transition-colors line-clamp-2 mb-1"
                        >
                          {item.name}
                        </Link>
                        {item.variantName && (
                          <p className="text-xs text-gray-500 mb-2">Packaging: {item.variantName}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Quantity: {item.quantity}</span>
                          <span className="text-base font-semibold text-green-700">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-sm border border-gray-200 p-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Order Notes (Optional)</h2>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any special instructions or notes for your order..."
                  className="w-full min-h-[100px] p-3 border border-gray-300 rounded-xs focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{notes.length}/500 characters</p>
              </div>
            </div>

            {/* Right Side - Order Summary */}
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

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmitOrder}
                    disabled={
                      submitting ||
                      !user?.fullName ||
                      !user?.email ||
                      !user?.address ||
                      !user?.city ||
                      !user?.state ||
                      !user?.zipCode
                    }
                    className="w-full bg-green-700 text-white py-3 text-center font-semibold rounded-xs hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      "Submit Order Request"
                    )}
                  </button>

                  {(!user?.fullName || !user?.email || !user?.address || !user?.city || !user?.state || !user?.zipCode) && (
                    <p className="text-xs text-yellow-600 text-center">
                      Please complete your profile to submit order
                    </p>
                  )}
                </div>

                {/* Benefits */}
                <div className="px-5 pb-5 pt-4 border-t border-gray-200 space-y-2 bg-gray-50">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 rounded-full bg-green-600"></div>
                    <span>Free shipping on orders over {formatPrice(shippingConfig.minimumOrderForFreeShipping)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 rounded-full bg-green-600"></div>
                    <span>Admin will contact you to confirm</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 rounded-full bg-green-600"></div>
                    <span>Quality guarantee</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

