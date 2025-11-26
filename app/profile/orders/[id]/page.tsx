"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Loader2,
  Package,
  MapPin,
  User,
  Mail,
  Phone,
  Calendar,
  ArrowLeft,
  Truck,
} from "lucide-react";
import ToastContainer from "@/app/common/Toast";
import { useToast } from "@/app/common/useToast";
import { format } from "date-fns";
import { enAU } from "date-fns/locale";

interface OrderItem {
  productId: string;
  productName: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
  variantId?: string;
  variantName?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  userFullName: string;
  userPhone?: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZipCode: string;
  shippingCountry: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  processing: "bg-purple-100 text-purple-800 border-purple-200",
  shipped: "bg-indigo-100 text-indigo-800 border-indigo-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const statusLabels = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toasts, toast, removeToast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const orderId = params?.id as string;

  useEffect(() => {
    if (!orderId) return;

    let isMounted = true;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          if (isMounted) {
            router.push("/login?redirect=/profile");
          }
          return;
        }

        const response = await fetch(`/api/orders/${orderId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        const result = await response.json();

        if (!isMounted) return;

        if (result.success) {
          setOrder(result.data);
        } else {
          toast.error("Error", result.error || "Failed to fetch order");
          router.push("/profile");
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        if (isMounted) {
          toast.error("Error", "Failed to load order");
          router.push("/profile");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOrder();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd MMM yyyy, HH:mm", { locale: enAU });
    } catch {
      return dateString;
    }
  };

  const formatPrice = (price: number) => {
    return "$" + price.toLocaleString("en-AU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eeeeee] md:mt-36">
        <div className="flex items-center justify-center py-40">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-[#0a923c] animate-spin" />
            <p className="text-sm text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#eeeeee] md:mt-36">
        <div className="container mx-auto px-4 py-20">
          <div className="bg-white rounded-sm shadow-md border border-gray-200 p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">Order not found</p>
            <Link
              href="/profile"
              className="text-[#0a923c] hover:underline text-sm"
            >
              Back to Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eeeeee] md:mt-36">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 w-full flex z-50 p-3 md:hidden bg-white shadow-sm">
        <Link
          href="/profile"
          className="bg-[rgba(45,46,50,0.5)] w-9 h-9 flex items-center justify-center rounded-full"
        >
          <ArrowLeft strokeWidth={1} color="white" />
        </Link>
        <div className="flex-1 flex justify-center items-center">
          <h1 className="text-lg font-semibold text-gray-900">Order Details</h1>
        </div>
        <div className="w-9"></div>
      </header>

      {/* Breadcrumb - Desktop */}
      <div className="hidden md:flex overflow-x-auto bg-[#e6e6e6] border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-green-600">Home</Link>
            <span>/</span>
            <Link href="/profile" className="hover:text-green-600">Profile</Link>
            <span>/</span>
            <Link href="/profile?tab=orders" className="hover:text-green-600">My Orders</Link>
            <span>/</span>
            <span className="text-gray-900">{order.orderNumber}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-10">
        {/* Header */}
        <div className="mb-6">
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0a923c] transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                Order {order.orderNumber}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusColors[order.status]}`}
            >
              {statusLabels[order.status]}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-sm shadow-md border border-gray-200">
              <div className="p-4 md:p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#0a923c]" />
                  Order Items ({order.items.length})
                </h2>
              </div>
              <div className="p-4 md:p-6 space-y-4">
                {order.items.map((item, index) => (
                  <Link
                    key={index}
                    href={`/product/${item.slug}`}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                      <Image
                        src={item.image || "/sp/1.jpg"}
                        alt={item.productName}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 group-hover:text-[#0a923c] transition-colors">
                        {item.productName}
                      </div>
                      {item.variantName && (
                        <div className="text-sm text-gray-500 mt-1">Variant: {item.variantName}</div>
                      )}
                      <div className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900 shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-sm shadow-md border border-gray-200">
              <div className="p-4 md:p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#0a923c]" />
                  Shipping Information
                </h2>
              </div>
              <div className="p-4 md:p-6">
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900 mb-1">Delivery Address</div>
                      <div>
                        {order.shippingAddress}
                        <br />
                        {order.shippingCity}, {order.shippingState} {order.shippingZipCode}
                        <br />
                        {order.shippingCountry}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="bg-white rounded-sm shadow-md border border-gray-200">
                <div className="p-4 md:p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Order Notes</h2>
                </div>
                <div className="p-4 md:p-6">
                  <p className="text-sm text-gray-600">{order.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-sm shadow-md border border-gray-200 sticky top-[100px]">
              <div className="p-4 md:p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
              </div>
              <div className="p-4 md:p-6 space-y-4">
                {/* Order Info */}
                <div>
                  <p className="text-sm text-gray-600">Order Number</p>
                  <p className="text-sm font-medium mt-1 text-gray-900">{order.orderNumber}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="text-sm font-medium mt-1 text-gray-900">
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                {order.updatedAt !== order.createdAt && (
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="text-sm font-medium mt-1 text-gray-900">
                      {formatDate(order.updatedAt)}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border mt-1 ${statusColors[order.status]}`}
                  >
                    {statusLabels[order.status]}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-900">{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="text-gray-900">{formatPrice(order.shippingFee)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-[#0a923c] text-lg">{formatPrice(order.total)}</span>
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

