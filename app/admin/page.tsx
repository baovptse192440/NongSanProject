"use client";

import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  Download,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ToastContainer from "@/app/common/Toast";
import { useToast } from "@/app/common/useToast";

interface DashboardStats {
  overview: {
    totalOrders: number;
    totalUsers: number;
    totalProducts: number;
    totalRevenue: number;
    totalOrdersInPeriod: number;
    averageOrderValue: number;
  };
  ordersByStatus: Record<string, number>;
  revenueByDate: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  topProducts: Array<{
    productId: string;
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    userFullName: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
}

const COLORS = ["#0a923c", "#10723a", "#0d7a33", "#e8f5e9", "#c8e6c9"];

export default function DashboardPage() {
  const { toasts, toast, removeToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [days, setDays] = useState("30");
  const [exporting, setExporting] = useState(false);

  // Format price
  const formatPrice = (price: number): string => {
    return "$" + price.toLocaleString("en-AU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
    });
  };

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/dashboard/stats?days=${days}`, {
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
        },
      });
      const result = await response.json();

      if (result.success && result.data) {
        setStats(result.data);
      } else {
        console.error("API Error:", result);
        toast.error("Error", result.error || "Failed to load dashboard stats");
        // Set default empty stats to prevent "No data available"
        setStats({
          overview: {
            totalOrders: 0,
            totalUsers: 0,
            totalProducts: 0,
            totalRevenue: 0,
            totalOrdersInPeriod: 0,
            averageOrderValue: 0,
          },
          ordersByStatus: {},
          revenueByDate: [],
          topProducts: [],
          recentOrders: [],
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Error", "Failed to load dashboard stats");
      // Set default empty stats
      setStats({
        overview: {
          totalOrders: 0,
          totalUsers: 0,
          totalProducts: 0,
          totalRevenue: 0,
          totalOrdersInPeriod: 0,
          averageOrderValue: 0,
        },
        ordersByStatus: {},
        revenueByDate: [],
        topProducts: [],
        recentOrders: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  // Export Excel
  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/dashboard/export?days=${days}`, {
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to export");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dashboard-export-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Success", "Excel file downloaded successfully");
    } catch (error) {
      console.error("Error exporting:", error);
      toast.error("Error", "Failed to export Excel file");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          <p className="text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Always show dashboard even if no stats (will show zeros)
  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          <p className="text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const statusData = Object.entries(stats.ordersByStatus || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const topProductsData = (stats.topProducts || []).slice(0, 5).map((product) => ({
    name: product.productName.length > 20 
      ? product.productName.substring(0, 20) + "..." 
      : product.productName,
    quantity: product.totalQuantity,
    revenue: product.totalRevenue,
  }));

  // Ensure revenueByDate is an array
  const revenueByDate = stats.revenueByDate || [];
  const recentOrders = stats.recentOrders || [];

  return (
    <div className="space-y-4">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of your business</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleExportExcel}
            disabled={exporting}
            className="bg-green-700 hover:bg-green-800 text-white"
          >
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatPrice(stats.overview.totalRevenue)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.overview.totalOrdersInPeriod} orders
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats.overview.totalOrders.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats.overview.totalProducts.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">Active products</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-700" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats.overview.totalUsers.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">Registered users</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Average Order Value */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Average Order Value</h2>
          <TrendingUp className="w-5 h-5 text-green-600" />
        </div>
        <p className="text-3xl font-bold text-green-700">
          {formatPrice(stats.overview.averageOrderValue)}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Based on {stats.overview.totalOrdersInPeriod} orders in the selected period
        </p>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h2>
          {revenueByDate.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueByDate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => formatDate(value)}
                style={{ fontSize: "12px" }}
              />
              <YAxis 
                tickFormatter={(value) => `$${value}`}
                style={{ fontSize: "12px" }}
              />
              <Tooltip 
                formatter={(value: number) => formatPrice(value)}
                labelFormatter={(label) => formatDate(label)}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#0a923c" 
                strokeWidth={2}
                name="Revenue"
              />
              <Line 
                type="monotone" 
                dataKey="orders" 
                stroke="#10723a" 
                strokeWidth={2}
                name="Orders"
              />
            </LineChart>
          </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              <p>No revenue data available for the selected period</p>
            </div>
          )}
        </div>

        {/* Orders by Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Orders by Status</h2>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              <p>No orders data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h2>
        {topProductsData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProductsData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" style={{ fontSize: "12px" }} />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={150}
              style={{ fontSize: "12px" }}
            />
            <Tooltip 
              formatter={(value: number) => value.toLocaleString()}
            />
            <Legend />
            <Bar dataKey="quantity" fill="#0a923c" name="Quantity Sold" />
            <Bar dataKey="revenue" fill="#10723a" name="Revenue" />
          </BarChart>
        </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            <p>No product sales data available for the selected period</p>
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Order #</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                    {order.orderNumber}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">{order.userFullName}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 font-semibold">
                    {formatPrice(order.total)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </td>
                </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No recent orders
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
