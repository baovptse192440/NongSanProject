"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Users,
  UserCircle,
  ShoppingBag,
  Settings,
  LogOut,
  Menu,
  X,
  Store,
  FolderTree,
  ChevronLeft,
  ChevronRight,
  List,
  Globe,
  Layout,
  FileText,
  Bell,
  Search,
  ExternalLink,
  HelpCircle,
  Moon,
  Sun,
  ChevronDown,
  User,
  Key,
} from "lucide-react";
import Tooltip from "@/app/common/Tooltip";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    message: string;
    read: boolean;
    orderId?: string;
    createdAt: string;
  }>>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<{
    fullName?: string;
    email?: string;
    role?: string;
  } | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Initialize from localStorage and check desktop on mount
  useEffect(() => {
    setMounted(true);
    
    // Load sidebar state from localStorage
    try {
      const saved = localStorage.getItem("sidebarCollapsed");
      if (saved) {
        setSidebarCollapsed(JSON.parse(saved));
      }
    } catch {
      // Ignore localStorage errors
    }

    // Check if desktop
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  // Fetch user info and check admin role
  useEffect(() => {
    const fetchUser = async () => {
      // Wait a bit to ensure localStorage is ready and page is fully loaded
      await new Promise(resolve => setTimeout(resolve, 200));
      
      try {
        const token = localStorage.getItem("token");
        console.log("=== ADMIN LAYOUT CHECK ===");
        console.log("Token exists:", !!token);
        console.log("Current path:", window.location.pathname);
        
        if (!token) {
          console.log("❌ No token found, redirecting to login");
          const currentPath = window.location.pathname + window.location.search;
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
          return;
        }
        
        console.log("✅ Token found, calling API...");
        const response = await fetch("/api/auth/me", { 
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        });
        
        const result = await response.json();
        console.log("API Response success:", result.success);
        console.log("API Response error:", result.error);
        
        if (result.success && result.data) {
          console.log("✅ User authenticated");
          console.log("User data:", result.data);
          console.log("User role:", result.data.role);
          console.log("Role type:", typeof result.data.role);
          console.log("Role check (=== 'admin'):", result.data.role === "admin");
          console.log("Role check (== 'admin'):", result.data.role == "admin");
          
          // Check if user is admin - use strict comparison and also check lowercase
          const userRole = String(result.data.role).toLowerCase().trim();
          if (userRole !== "admin") {
            console.log("❌ User is NOT admin, redirecting to home");
            console.log("Actual role value:", JSON.stringify(result.data.role));
            console.log("Normalized role:", userRole);
            // Redirect non-admin users immediately
            window.location.href = "/";
            return;
          }
          
          console.log("✅ User is admin, setting user state");
          setUser(result.data);
        } else {
          console.log("❌ API returned error:", result.error);
          // Not authenticated, redirect to login
          const currentPath = window.location.pathname + window.location.search;
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
      } catch (error) {
        console.error("❌ Error fetching user:", error);
        const currentPath = window.location.pathname + window.location.search;
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    };

    if (mounted) {
      fetchUser();
    }
  }, [mounted]);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/admin/notifications?limit=10", {
          headers: {
            "Authorization": token ? `Bearer ${token}` : "",
          },
        });
        const result = await response.json();
        if (result.success) {
          setNotifications(result.data || []);
          setUnreadNotifications(result.unreadCount || 0);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load dark mode preference
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved) {
      const isDark = JSON.parse(saved);
      setDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", JSON.stringify(newMode));
    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showNotifications && !target.closest('.notification-dropdown')) {
        setShowNotifications(false);
      }
      if (showUserMenu && !target.closest('.user-menu-dropdown')) {
        setShowUserMenu(false);
      }
      if (showSearch && !target.closest('.search-dropdown')) {
        setShowSearch(false);
      }
    };

    if (showNotifications || showUserMenu || showSearch) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showNotifications, showUserMenu, showSearch]);

  const handleMarkAsRead = async (notificationId?: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          notificationId,
          markAllAsRead: !notificationId,
        }),
      });

      const result = await response.json();
      if (result.success) {
        // Refresh notifications
        const refreshResponse = await fetch("/api/admin/notifications?limit=10", {
          headers: {
            "Authorization": token ? `Bearer ${token}` : "",
          },
        });
        const refreshResult = await refreshResponse.json();
        if (refreshResult.success) {
          setNotifications(refreshResult.data || []);
          setUnreadNotifications(refreshResult.unreadCount || 0);
        }
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch("/api/auth/logout", { 
        method: "POST",
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
        },
      });
    } catch (error) {
      console.error("Error calling logout API:", error);
    } finally {
      // Clear authentication data but keep cart
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Keep cart - don't remove it
        // localStorage.removeItem("cart");
        localStorage.removeItem("sidebarCollapsed");
        // Keep darkMode preference if needed, or remove it too
        // localStorage.removeItem("darkMode");
      }
      // Redirect to login
      window.location.href = "/login";
    }
  };

  // Quick search handler
  const handleQuickSearch = (query: string) => {
    if (!query.trim()) return;
    
    // Navigate based on search query
    if (query.startsWith("/")) {
      window.location.href = query;
    } else {
      // Search in orders
      window.location.href = `/admin/orders?search=${encodeURIComponent(query)}`;
    }
    setShowSearch(false);
    setSearchQuery("");
  };

  // Save collapsed state to localStorage
  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      localStorage.setItem("sidebarCollapsed", JSON.stringify(sidebarCollapsed));
    }
  }, [sidebarCollapsed, mounted]);

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
      title: "Banner",
      icon: Layout,
      href: "/admin/banners",
      active: pathname?.startsWith("/admin/banners"),
    },
    {
      title: "Menu",
      icon: List,
      href: "/admin/menu",
      active: pathname?.startsWith("/admin/menu"),
    },
    {
      title: "Posts",
      icon: FileText,
      href: "/admin/posts",
      active: pathname?.startsWith("/admin/posts"),
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
      title: "Người dùng",
      icon: UserCircle,
      href: "/admin/users",
      active: pathname?.startsWith("/admin/users"),
    },
    {
      title: "Khách hàng",
      icon: Users,
      href: "/admin/customers",
      active: pathname?.startsWith("/admin/customers"),
    },
    {
      title: "Cấu hình",
      icon: Globe,
      href: "/admin/config",
      active: pathname?.startsWith("/admin/config"),
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
          {mounted ? (
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
          ) : (
            <div className="flex items-center gap-2 overflow-hidden">
              <Store className="w-6 h-6 text-white shrink-0" />
              <span className="text-white font-bold text-lg whitespace-nowrap">
                Admin Panel
              </span>
            </div>
          )}
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
                {mounted && (
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
                )}
                {!mounted && !sidebarCollapsed && (
                  <span className="whitespace-nowrap overflow-hidden">{item.title}</span>
                )}
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
          {mounted ? (
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
          ) : (
            !sidebarCollapsed && (
              <div className="flex items-center gap-3 mb-3 px-2 overflow-hidden">
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
              </div>
            )
          )}
          
        </div>

        {sidebarCollapsed ? (
            <Tooltip content="Đăng xuất" side="right">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
              >
                <LogOut size={18} strokeWidth={2} />
              </button>
            </Tooltip>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
            >
              <LogOut size={18} strokeWidth={2} />
              <span>Đăng xuất</span>
            </button>
          )}

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
            {/* Left Section */}
            <div className="flex items-center gap-3 flex-1">
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

              {/* Search Bar */}
              <div className="hidden md:flex items-center flex-1 max-w-md relative search-dropdown">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search orders, products, users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleQuickSearch(searchQuery);
                      }
                    }}
                    onFocus={() => setShowSearch(true)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a923c]/20 focus:border-[#0a923c] text-sm"
                  />
                </div>
                {showSearch && searchQuery && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 z-50 search-dropdown">
                    <div className="p-2">
                      <button
                        onClick={() => handleQuickSearch(searchQuery)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md text-sm flex items-center gap-2"
                      >
                        <Search className="w-4 h-4 text-gray-400" />
                        <span>Search for &quot;{searchQuery}&quot;</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* View Website */}
              <Tooltip content="View Website" side="bottom">
                <Link
                  href="/"
                  target="_blank"
                  className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-[#0a923c] transition-all duration-200"
                >
                  <ExternalLink size={20} />
                </Link>
              </Tooltip>

              {/* Dark Mode Toggle */}
              <Tooltip content={darkMode ? "Light Mode" : "Dark Mode"} side="bottom">
                <button
                  onClick={toggleDarkMode}
                  className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-[#0a923c] transition-all duration-200"
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </Tooltip>

              {/* Help */}
              <Tooltip content="Help & Support" side="bottom">
                <button className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-[#0a923c] transition-all duration-200">
                  <HelpCircle size={20} />
                </button>
              </Tooltip>

              {/* Notifications */}
              <div className="relative notification-dropdown">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                      {unreadNotifications > 9 ? "9+" : unreadNotifications}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto notification-dropdown">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      {unreadNotifications > 0 && (
                        <button
                          onClick={() => handleMarkAsRead()}
                          className="text-xs text-[#0a923c] hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="divide-y divide-gray-200">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-sm text-gray-500">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                              !notif.read ? "bg-blue-50" : ""
                            }`}
                            onClick={() => {
                              if (!notif.read) {
                                handleMarkAsRead(notif.id);
                              }
                              if (notif.orderId) {
                                window.location.href = `/admin/orders?order=${notif.orderId}`;
                              }
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                                !notif.read ? "bg-[#0a923c]" : "bg-gray-300"
                              }`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900">{notif.title}</p>
                                <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {new Date(notif.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="p-2 border-t border-gray-200">
                        <Link
                          href="/admin/orders"
                          className="block text-center text-xs text-[#0a923c] hover:underline py-2"
                          onClick={() => setShowNotifications(false)}
                        >
                          View all notifications
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative user-menu-dropdown">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#0a923c] flex items-center justify-center text-white font-semibold text-sm">
                    {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.fullName || "Admin"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.role || "admin"}
                    </p>
                  </div>
                  <ChevronDown className="hidden md:block w-4 h-4 text-gray-500" />
                </button>

                {/* User Menu Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 user-menu-dropdown">
                    <div className="p-4 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">
                        {user?.fullName || "Admin User"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {user?.email || "admin@example.com"}
                      </p>
                    </div>
                    <div className="py-2">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        href="/admin/config"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                      <Link
                        href="/profile?tab=change-password"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Key className="w-4 h-4" />
                        <span>Change Password</span>
                      </Link>
                    </div>
                    <div className="border-t border-gray-200 py-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
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

