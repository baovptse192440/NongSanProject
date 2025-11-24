"use client";

import {
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  DollarSign,
  Truck,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const stats = [
    {
      title: "Tổng sản phẩm",
      value: "1,245",
      change: "+12.5%",
      trend: "up",
      icon: Package,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      href: "/admin/products",
    },
    {
      title: "Tổng đơn hàng",
      value: "3,847",
      change: "+8.2%",
      trend: "up",
      icon: ShoppingBag,
      color: "text-green-500",
      bgColor: "bg-green-50",
      href: "/admin/orders",
    },
    {
      title: "Khách hàng",
      value: "12,456",
      change: "+15.3%",
      trend: "up",
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      href: "/admin/customers",
    },
    {
      title: "Doanh thu tháng này",
      value: "2.5 tỷ",
      change: "+22.1%",
      trend: "up",
      icon: DollarSign,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      href: "/admin/analytics",
    },
    {
      title: "Nhà cung cấp",
      value: "45",
      change: "+3",
      trend: "up",
      icon: Truck,
      color: "text-indigo-500",
      bgColor: "bg-indigo-50",
      href: "/admin/supply",
    },
  ];

  const recentOrders = [
    { id: "#ORD-001", customer: "Nguyễn Văn A", amount: "250,000", status: "completed" },
    { id: "#ORD-002", customer: "Trần Thị B", amount: "180,000", status: "pending" },
    { id: "#ORD-003", customer: "Lê Văn C", amount: "450,000", status: "processing" },
    { id: "#ORD-004", customer: "Phạm Thị D", amount: "320,000", status: "completed" },
    { id: "#ORD-005", customer: "Hoàng Văn E", amount: "195,000", status: "pending" },
  ];

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Tổng quan</h1>
        <p className="text-sm text-gray-500">Chào mừng trở lại, Admin!</p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={index}
              href={stat.href}
              className="bg-white rounded-xl p-5 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                {stat.trend === "up" ? (
                  <div className="flex items-center gap-1 text-green-500">
                    <ArrowUpRight size={16} />
                    <span className="text-xs font-semibold">{stat.change}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-500">
                    <ArrowDownRight size={16} />
                    <span className="text-xs font-semibold">{stat.change}</span>
                  </div>
                )}
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500 font-medium group-hover:text-[#0a923c] transition-colors">
                {stat.title}
              </p>
            </Link>
          );
        })}
      </div>

      {/* CHARTS & RECENT ORDERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART PLACEHOLDER */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Doanh thu 7 ngày qua</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-400 text-sm">Biểu đồ doanh thu sẽ được hiển thị ở đây</p>
          </div>
        </div>

        {/* RECENT ORDERS */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Đơn hàng gần đây</h2>
            <Link
              href="/admin/orders"
              className="text-sm font-semibold text-[#0a923c] hover:underline"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">{order.id}</p>
                  <p className="text-xs text-gray-500">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{order.amount} ₫</p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                      order.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : order.status === "processing"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.status === "completed"
                      ? "Hoàn thành"
                      : order.status === "processing"
                      ? "Đang xử lý"
                      : "Chờ xử lý"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/products?action=add"
            className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
          >
            <Package className="w-8 h-8 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold text-gray-900">Thêm sản phẩm</span>
          </Link>
          <Link
            href="/admin/supply?action=add"
            className="flex flex-col items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
          >
            <Truck className="w-8 h-8 text-green-500 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold text-gray-900">Thêm nhà cung cấp</span>
          </Link>
          <Link
            href="/admin/analytics"
            className="flex flex-col items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
          >
            <TrendingUp className="w-8 h-8 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold text-gray-900">Xem báo cáo</span>
          </Link>
          <Link
            href="/admin/settings"
            className="flex flex-col items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group"
          >
            <Users className="w-8 h-8 text-orange-500 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold text-gray-900">Cài đặt</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

