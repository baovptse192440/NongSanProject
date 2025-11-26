"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Eye,
  Loader2,
  Package,
  MapPin,
  User,
  Mail,
  Phone,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  List as ListIcon,
  XCircle,
} from "lucide-react";
import ToastContainer from "@/app/common/Toast";
import { useToast } from "@/app/common/useToast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function OrdersPage() {
  const { toasts, toast, removeToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const limit = 20;

  useEffect(() => {
    fetchOrders();
  }, [currentPage, filterStatus, searchQuery]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      if (filterStatus !== "all") {
        params.append("status", filterStatus);
      }

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/orders?${params.toString()}`, {
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
        },
      });
      const result = await response.json();

      if (result.success) {
        setOrders(result.data);
        setTotalPages(result.pagination?.pages || 1);
        setTotalOrders(result.pagination?.total || 0);
      } else {
        toast.error("Error", result.error || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Error", "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingStatus(orderId);
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          orderId,
          status: newStatus,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Success", "Order status updated successfully");
        fetchOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus as Order["status"] });
        }
      } else {
        toast.error("Error", result.error || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Error", "Failed to update order");
    } finally {
      setUpdatingStatus(null);
    }
  };

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

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const OrderCard = ({ order }: { order: Order }) => {
    if (viewMode === "list") {
      return (
        <div
          onClick={() => setSelectedOrder(order)}
          className="bg-white rounded-lg hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-200 group cursor-pointer"
        >
          <div className="flex gap-4 p-4">
            {/* Order Info - Left */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg text-gray-800 line-clamp-1 group-hover:text-[#0a923c] transition-colors duration-200 mb-1">
                      {order.orderNumber}
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-2">
                      <User className="w-4 h-4" />
                      <span>{order.userFullName}</span>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border shrink-0 ${statusColors[order.status]}`}
                  >
                    {statusLabels[order.status]}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-4 h-4" />
                    <span>{order.items.length} item(s)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex flex-col">
                  <p className="text-[#10723a] font-bold text-xl">
                    {formatPrice(order.total)}
                  </p>
                  <p className="text-xs text-gray-500">{order.userEmail}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedOrder(order);
                  }}
                  className="flex items-center justify-center w-11 h-11 rounded-md border border-[#0a923c] bg-white text-[#0a923c] hover:bg-[#0a923c] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md active:scale-95"
                >
                  <Eye size={20} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Grid View
    return (
      <div
        onClick={() => setSelectedOrder(order)}
        className="bg-white rounded-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 group cursor-pointer flex flex-col h-full"
      >
        {/* Header */}
        <div className="p-3 md:p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-xs sm:text-[13px] md:text-[15px] text-gray-700 line-clamp-1 group-hover:text-[#0a923c] transition-colors duration-200">
              {order.orderNumber}
            </h3>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border shrink-0 ${statusColors[order.status]}`}
            >
              {statusLabels[order.status]}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <User className="w-3 h-3" />
            <span className="line-clamp-1">{order.userFullName}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 md:p-4 flex flex-col flex-1 justify-between">
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Package className="w-3 h-3" />
              <span>{order.items.length} item(s)</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Calendar className="w-3 h-3" />
              <span className="line-clamp-1">{formatDate(order.createdAt)}</span>
            </div>
            <div className="text-xs text-gray-500 line-clamp-1">
              {order.userEmail}
            </div>
          </div>

          {/* Price & View */}
          <div className="flex items-end justify-between pt-3 border-t border-gray-100">
            <div className="flex-1">
              <p className="text-[#10723a] font-bold text-base sm:text-lg mb-1">
                {formatPrice(order.total)}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedOrder(order);
              }}
              className="flex items-center justify-center md:w-10 md:h-10 w-8 h-8 rounded-sm border border-[#0a923c] bg-white text-[#0a923c] hover:bg-[#0a923c] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md active:scale-95"
            >
              <Eye size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="md:max-w-[1260px] mx-auto md:px-4 md:py-4 py-2">
        {/* Header */}
        <div className="mb-4 md:mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Orders Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage and track all customer orders</p>
        </div>

        {/* Filter Bar */}
        <div className="hidden lg:block space-y-4 mb-5">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by order number, email, or name..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#0a923c] focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <Select
                value={filterStatus}
                onValueChange={(value) => {
                  setFilterStatus(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-40 h-10">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="flex items-center gap-1 border border-gray-200 rounded-md p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`h-8 w-8 flex items-center justify-center rounded transition-colors ${
                    viewMode === "grid"
                      ? "bg-[#0a923c] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  aria-label="Grid view"
                >
                  <Grid3x3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`h-8 w-8 flex items-center justify-center rounded transition-colors ${
                    viewMode === "list"
                      ? "bg-[#0a923c] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  aria-label="List view"
                >
                  <ListIcon size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Filter Bar */}
        <div className="lg:hidden bg-white md:rounded-sm rounded-none md:shadow-md shadow-none p-3 md:mb-4 mb-2 flex justify-between items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#0a923c] focus:border-transparent text-sm"
            />
          </div>
          <Select
            value={filterStatus}
            onValueChange={(value) => {
              setFilterStatus(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[140px] h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-[#0a923c] animate-spin" />
              <p className="text-sm text-gray-600">Loading orders...</p>
            </div>
          </div>
        )}

        {/* Orders Grid/List */}
        {!loading && (
          <>
            <div className="md:bg-white bg-none rounded-sm shadow-md border border-gray-100 min-h-[400px]">
              {orders.length === 0 ? (
                <div className="bg-white rounded-sm shadow-md border border-gray-100 p-12 text-center">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg mb-2">No orders found</p>
                  <p className="text-gray-500 text-sm">Please try different filters</p>
                </div>
              ) : (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:p-4 p-2"
                      : "flex flex-col gap-3 md:gap-4 p-4 space-y-0"
                  }
                >
                  {orders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 mb-6 gap-2 flex-wrap">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="px-3 py-2 border border-gray-200 rounded-sm text-sm font-semibold hover:bg-[#0a923c] hover:text-white hover:border-[#0a923c] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-600"
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={18} />
                </button>

                {getPaginationNumbers().map((page, index) => {
                  if (page === "...") {
                    return (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-2 py-2 text-sm text-gray-500"
                      >
                        ...
                      </span>
                    );
                  }

                  const pageNum = page as number;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-4 py-2 border rounded-sm text-sm font-semibold transition-all duration-200 ${
                        currentPage === pageNum
                          ? "bg-[#0a923c] text-white border-[#0a923c] shadow-md"
                          : "border-gray-200 hover:bg-[#0a923c]/10 hover:border-[#0a923c]"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="px-3 py-2 border border-gray-200 rounded-sm text-sm font-semibold hover:bg-[#0a923c] hover:text-white hover:border-[#0a923c] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-600"
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

            {/* Page Info */}
            {totalPages > 1 && (
              <div className="text-center text-sm text-gray-600 mb-6">
                Page {currentPage} / {totalPages} ({totalOrders} orders)
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Order Details - {selectedOrder.orderNumber}</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{selectedOrder.userFullName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{selectedOrder.userEmail}</span>
                    </div>
                    {selectedOrder.userPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{selectedOrder.userPhone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Shipping Address</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        {selectedOrder.shippingAddress}
                        <br />
                        {selectedOrder.shippingCity}, {selectedOrder.shippingState} {selectedOrder.shippingZipCode}
                        <br />
                        {selectedOrder.shippingCountry}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                        <Image
                          src={item.image || "/sp/1.jpg"}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{item.productName}</div>
                        {item.variantName && (
                          <div className="text-sm text-gray-500">Variant: {item.variantName}</div>
                        )}
                        <div className="text-sm text-gray-600">Quantity: {item.quantity}</div>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-900">{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="text-gray-900">{formatPrice(selectedOrder.shippingFee)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-gray-900">{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Update Status</h3>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(value) => handleStatusUpdate(selectedOrder.id, value)}
                  disabled={updatingStatus === selectedOrder.id}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                {updatingStatus === selectedOrder.id && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating...</span>
                  </div>
                )}
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Notes</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Dates */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Created: {formatDate(selectedOrder.createdAt)}</span>
                </div>
                {selectedOrder.updatedAt !== selectedOrder.createdAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Updated: {formatDate(selectedOrder.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
