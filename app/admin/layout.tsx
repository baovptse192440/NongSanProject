"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  ShoppingBag,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Store,
  FolderTree,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Tooltip from "@/app/common/Tooltip";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const saved = localStorage.getItem("sidebarCollapsed");
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });
  const [isDesktop, setIsDesktop] = useState(false);
  const pathname = usePathname();

  // Check if desktop on mount and window resize
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  // Save collapsed state to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebarCollapsed", JSON.stringify(sidebarCollapsed));
    }
  }, [sidebarCollapsed]);

  const menuItems = [
    {
      title: "Tổng quan",
      icon: LayoutDashboard,
      href: "/admin",
      active: pathname === "/admin",
    },
    {
      title: "Danh mục",
      icon: FolderTree,
      href: "/admin/categories",
      active: pathname?.startsWith("/admin/categories"),
    },
    {
      title: "Sản phẩm",
      icon: Package,
      href: "/admin/products",
      active: pathname?.startsWith("/admin/products"),
    },
    {
      title: "Đơn hàng",
      icon: ShoppingBag,
      href: "/admin/orders",
      active: pathname?.startsWith("/admin/orders"),
    },
    {
      title: "Nhà cung cấp",
      icon: Truck,
      href: "/admin/supply",
      active: pathname?.startsWith("/admin/supply"),
    },
    {
      title: "Khách hàng",
      icon: Users,
      href: "/admin/customers",
      active: pathname?.startsWith("/admin/customers"),
    },
    {
      title: "Thống kê",
      icon: BarChart3,
      href: "/admin/analytics",
      active: pathname?.startsWith("/admin/analytics"),
    },
    {
      title: "Cài đặt",
      icon: Settings,
      href: "/admin/settings",
      active: pathname?.startsWith("/admin/settings"),
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* SIDEBAR */}
      <motion.aside
        animate={{
          width: sidebarCollapsed ? 80 : 260,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed top-0 left-0 z-40 h-screen bg-white border-r border-gray-200 shadow-lg lg:shadow-none flex flex-col overflow-hidden`}
      >
        {/* LOGO & TOGGLE */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#0a923c] min-h-18">
          <AnimatePresence mode="wait">
            {!sidebarCollapsed ? (
              <motion.div
                key="logo-full"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 overflow-hidden"
              >
                <Store className="w-6 h-6 text-white shrink-0" />
                <span className="text-white font-bold text-lg whitespace-nowrap">
                  Admin Panel
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="logo-icon"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center w-full"
              >
                <Store className="w-6 h-6 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:bg-white/20 p-1 rounded transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION MENU */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const menuItem = (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  item.active
                    ? "bg-[#0a923c] text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100 hover:text-[#0a923c]"
                } ${
                  sidebarCollapsed
                    ? "justify-center px-3"
                    : "justify-start"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} strokeWidth={2} className="shrink-0" />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      {item.title}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );

            return sidebarCollapsed ? (
              <Tooltip key={item.href} content={item.title} side="right">
                {menuItem}
              </Tooltip>
            ) : (
              menuItem
            );
          })}
        </nav>

        {/* USER SECTION */}
        <div className="p-4 border-t border-gray-200">
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 mb-3 px-2 overflow-hidden"
              >
                <div className="w-10 h-10 rounded-full bg-[#0a923c] flex items-center justify-center text-white font-semibold shrink-0">
                  A
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    Admin
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    admin@example.com
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {sidebarCollapsed ? (
            <Tooltip content="Đăng xuất" side="right">
              <Link
                href="/"
                className="flex items-center justify-center px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
              >
                <LogOut size={18} strokeWidth={2} />
              </Link>
            </Tooltip>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
            >
              <LogOut size={18} strokeWidth={2} />
              <span>Đăng xuất</span>
            </Link>
          )}
        </div>

      </motion.aside>

      {/* OVERLAY FOR MOBILE */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* MAIN CONTENT */}
      <motion.div
        animate={
          isDesktop
            ? {
                marginLeft: sidebarCollapsed ? 80 : 260,
              }
            : { marginLeft: 0 }
        }
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="min-h-screen"
      >
        {/* TOP BAR */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu size={24} />
              </button>
              <Tooltip
                content={sidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
                side="bottom"
              >
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hidden lg:flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-[#0a923c] transition-all duration-200"
                >
                  {sidebarCollapsed ? (
                    <ChevronRight size={20} />
                  ) : (
                    <ChevronLeft size={20} />
                  )}
                </button>
              </Tooltip>
            </div>
            <div className="flex items-center gap-4 ml-auto">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600 font-medium">Xin chào,</span>
                <span className="text-sm font-semibold text-[#0a923c]">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="p-6">{children}</main>
      </motion.div>
    </div>
  );
}

