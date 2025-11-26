"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CircleUserRound,
  ShoppingCart,
  Waypoints,
  CloudDownload,
  Store,
  Search,
  Menu,
  ChevronDown,
  ChevronRight,
  X,
  Bell,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
interface SiteConfig {
  logo?: string;
  phone?: string;
  siteName?: string;
}

interface MenuItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
  order: number;
  status: "active" | "inactive";
  parentId?: string;
  children?: MenuItem[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  status: "active" | "inactive";
  productCount?: number;
  parentId?: string;
  children?: Category[];
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [config, setConfig] = useState<SiteConfig>({});
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [hoverCategoryMenu, setHoverCategoryMenu] = useState(false);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
  const [expandedMenuId, setExpandedMenuId] = useState<string | null>(null);
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    message: string;
    read: boolean;
    orderId?: string;
    orderNumber?: string;
    createdAt: string;
  }>>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // STATE DROPDOWN KHO HÀNG
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("Tân Phú");

  // STATE MEGA MENU DESKTOP
  const [hoverMenu, setHoverMenu] = useState<string | null>(null);

  // Load user info and cart count
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/auth/me", {
          headers: {
            "Authorization": token ? `Bearer ${token}` : "",
          },
        });
        const result = await response.json();
        if (result.success) {
          setUser(result.data);
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(result.data));
          }
        } else {
          setUser(null);
          if (typeof window !== "undefined") {
            localStorage.removeItem("user");
          }
        }
      } catch (error) {
        console.error("Error loading user:", error);
        setUser(null);
      }
    };

    const loadCartCount = () => {
      try {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          const items = JSON.parse(savedCart);
          const total = items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
          setCartCount(total);
        }
      } catch (error) {
        console.error("Error loading cart count:", error);
      }
    };

    loadUser();
    loadCartCount();

    // Listen for updates
    const handleCartUpdate = () => {
      loadCartCount();
    };

    const handleUserLogin = () => {
      loadUser();
    };

    const handleUserUpdate = () => {
      // Debounce to prevent multiple rapid calls
      setTimeout(() => {
        loadUser();
      }, 100);
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("storage", handleCartUpdate);
    window.addEventListener("userLoggedIn", handleUserLogin);
    window.addEventListener("userUpdated", handleUserUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("storage", handleCartUpdate);
      window.removeEventListener("userLoggedIn", handleUserLogin);
      window.removeEventListener("userUpdated", handleUserUpdate);
    };
  }, []);

  // Fetch notifications for logged in users
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) {
        setNotifications([]);
        setUnreadNotifications(0);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/notifications?limit=10", {
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
  }, [user]);

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
    };

    if (showNotifications || showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showNotifications, showUserMenu]);

  const handleMarkAsRead = async (notificationId?: string) => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/notifications", {
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
        const refreshResponse = await fetch("/api/notifications?limit=10", {
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
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        // Keep cart - don't remove it
        // localStorage.removeItem("cart");
      }
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
      // Still clear localStorage even if API call fails
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        // Keep cart - don't remove it
        // localStorage.removeItem("cart");
      }
      window.location.href = "/";
    }
  };

  // Fetch config và menus
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/config");
        const result = await response.json();
        if (result.success) {
          setConfig(result.data);
          if (result.data.phone) {
            setSelected(result.data.phone);
          }
        }
      } catch (error) {
        console.error("Error fetching config:", error);
      }
    };

    const fetchMenus = async () => {
      try {
        const response = await fetch("/api/menus?status=active");
        const result = await response.json();
        if (result.success && result.data) {
          // Organize menus into parent-child structure
          const allMenus: MenuItem[] = result.data;
          const parentMenus = allMenus
            .filter((menu) => !menu.parentId)
            .sort((a, b) => a.order - b.order);
          
          // Add children to parent menus
          const menusWithChildren: MenuItem[] = parentMenus.map((parent) => {
            const children = allMenus
              .filter((menu) => menu.parentId === parent.id)
              .sort((a, b) => a.order - b.order);
            return {
              ...parent,
              children: children.length > 0 ? children : undefined,
            };
          });
          
          setMenus(menusWithChildren);
        }
      } catch (error) {
        console.error("Error fetching menus:", error);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories?status=active");
        const result = await response.json();
        if (result.success && result.data) {
          // Organize categories into parent-child structure
          const allCategories: Category[] = result.data;
          const parentCategories = allCategories
            .filter((cat) => !cat.parentId)
            .sort((a, b) => {
              // Sort by name or by a specific order if available
              return a.name.localeCompare(b.name);
            });
          
          // Add children to parent categories
          const categoriesWithChildren: Category[] = parentCategories.map((parent) => {
            const children = allCategories
              .filter((cat) => cat.parentId === parent.id)
              .sort((a, b) => a.name.localeCompare(b.name));
            return {
              ...parent,
              children: children.length > 0 ? children : undefined,
            };
          });
          
          setCategories(categoriesWithChildren);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchConfig();
    fetchMenus();
    fetchCategories();
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
      {/* ▬▬▬ TOP BAR ▬▬▬ */}
      <div className="hidden md:flex bg-[#10723a] text-white h-[35px]">
        <div className="container mx-auto px-4 flex justify-end items-center space-x-6 text-sm">
          <div className="flex items-center space-x-1">
            <span>HOTLINE</span>
            <a
              href={`tel:${config.phone || "0786457401"}`}
              className="font-bold hover:text-yellow-300 transition"
            >
              {config.phone || "0786457401"}
            </a>
          </div>

          <button className="flex items-center space-x-1 hover:text-yellow-300 transition">
            <CloudDownload size={16} />
            <span>Download App</span>
          </button>

          <Link
            href="/cong-tac-vien"
            className="flex items-center space-x-1 hover:text-yellow-300 transition"
          >
            <Waypoints size={16} />
            <span>For Partners</span>
          </Link>
        </div>
      </div>

      {/* ▬▬▬ MAIN HEADER ▬▬▬ */}
      <div className="bg-[#0a923c] text-white h-full flex items-center">
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* LOGO */}
          <div className="flex justify-start my-2">
            <Link href="/" className="flex items-center ">
              {config.logo ? (
                <img src={config.logo}
                alt={config.siteName || "Logo"} className="w-[120px] h-[50px]" />
              ) : (
                <motion.img
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  src="/logo_AU.png"
                  className="w-[120px] h-[40px]"
                  alt="AU Logo"
                />
              )}
            </Link>
          </div>

          {/* SEARCH DESKTOP */}
          <div className="hidden md:flex justify-end flex-1 ">
            <form className="flex ">
              <input
                type="text"
                placeholder="Search..."
                className="flex-1 w-[280px] h-[30px] px-4 py-2 bg-white rounded-l-sm text-gray-800 outline-none"
              />
              <button className="bg-white px-4 rounded-r-sm flex justify-center items-center">
                <Search size={20} className="text-green-700" />
              </button>
            </form>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-4 items-center text-sm pl-4">
            {/* Notifications - Only show if user is logged in */}
            {user && (
              <div className="relative notification-dropdown">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative group hover:text-yellow-300 transition"
                >
                  <div className="flex gap-0.5 items-center">
                    <Bell size={24} />
                    {unreadNotifications > 0 && (
                      <span className="absolute left-3 -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                        {unreadNotifications > 9 ? "9+" : unreadNotifications}
                      </span>
                    )}
                    <span className="hidden lg:block ml-1">Notifications</span>
                  </div>
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
                                window.location.href = `/profile/orders/${notif.orderId}`;
                              }
                              setShowNotifications(false);
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
                          href="/profile?tab=orders"
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
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center hover:text-yellow-300 transition"
                >
                  <CircleUserRound size={24} />
                  <span className="hidden lg:inline ml-1 truncate max-w-[120px]">
                    {user.fullName || "Account"}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`ml-1 transition-transform ${showUserMenu ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50"
                      onMouseLeave={() => setShowUserMenu(false)}
                    >
                      <div className="py-2">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          Account Information
                        </Link>
                        <Link
                          href="/cart"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          Shopping Cart
                        </Link>
                        <div className="border-t border-gray-200 my-1"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
            <Link
                  href="/login"
              className="flex items-center hover:text-yellow-300 transition"
            >
              <CircleUserRound size={24} />
                  <span className="hidden lg:inline ml-1">Login</span>
            </Link>

            <span className="hidden md:block opacity-50">|</span>

            <Link
                  href="/register"
              className="hidden sm:inline hover:text-yellow-300 transition"
            >
                  Sign Up
            </Link>
              </>
            )}

            {/* KHO HÀNG */}
            <div className="hidden md:flex items-center text-sm text-white relative ">
              <div className="flex items-center bg-white/10 hover:bg-white/20 transition px-3 py-2 rounded-lg cursor-pointer">
                <Store size={16} className="mr-2 text-white/90" />
                <span className="opacity-90">Ship from warehouse:</span>

                <div className=" relative">
                  <motion.button
                    onClick={() => setOpen(!open)}
                    className="flex items-center font-semibold outline-none"
                  >
                    {selected}
                    <motion.span
                      animate={{ rotate: open ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-1"
                    >
                    </motion.span>
                  </motion.button>
                </div>
              </div>
            </div>

            {/* CART */}
            <Link
              href="/cart"
              className="relative hover:text-yellow-300 m-0"
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 w-5 h-5 text-[10px] rounded-full flex justify-center items-center text-white font-semibold">
                  {cartCount > 99 ? "99+" : cartCount}
              </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* ▬▬▬ SEARCH MOBILE ▬▬▬ */}
      <div className="md:hidden bg-[#0a923c] py-2">
      
        <div className="container flex items-center">
          {/* MENU MOBILE */}
          <button
            className="md:hidden mr-2"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={30} color="white" />
          </button>

          <form className="flex w-full md:w-auto">
            <input
              type="text"
              placeholder="Search..."
              className="flex-1 h-8 px-3 rounded-l-md text-sm outline-none bg-white w-full"
            />
            <button className="bg-white w-12 rounded-r-md flex justify-center items-center">
              <Search size={20} className="text-[#10723a]" />
            </button>
          </form>
        </div>

        
      </div>

      {/* ▬▬▬ NAVIGATION DESKTOP ▬▬▬ */}
      <div className="hidden md:block bg-[#0a923c]">
        <div className="container mx-auto px-2.5 flex items-center justify-between">
          <div className="flex items-center text-white w-full">
            <div
              className="relative"
              onMouseEnter={() => setHoverCategoryMenu(true)}
              onMouseLeave={() => setHoverCategoryMenu(false)}
            >
              <button className="flex items-center bg-[#04772f] px-3 py-2.5 text-sm font-semibold hover:text-yellow-300 cursor-pointer transition">
                <Menu size={20} className="mr-2" />
                PRODUCT CATEGORIES
                <ChevronDown
                  size={16}
                  className={`ml-1 transition-transform ${
                    hoverCategoryMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* CATEGORIES DROPDOWN */}
              <AnimatePresence>
                {hoverCategoryMenu && categories.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-1 w-72 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50"
                  >
                    <div className="max-h-[600px] overflow-y-auto">
                      {categories.map((category) => (
                        <div
                          key={category.id}
                          className="relative"
                          onMouseEnter={() => setHoveredCategoryId(category.id)}
                          onMouseLeave={() => setHoveredCategoryId(null)}
                        >
                          <Link
                            href={`/category/${category.slug}`}
                            className={`flex items-center gap-3 px-4 py-3 transition-colors border-b border-gray-100 last:border-b-0 ${
                              hoveredCategoryId === category.id
                                ? "bg-[#0a923c] text-white"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            {category.image && (
                              <div className="w-10 h-10 rounded-md overflow-hidden shrink-0 bg-gray-100">
                                <Image
                                  src={category.image}
                                  alt={category.name}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-semibold truncate ${
                                hoveredCategoryId === category.id ? "text-white" : "text-gray-900"
                              }`}>
                                {category.name}
                              </p>
                              {category.productCount !== undefined && category.productCount > 0 && (
                                <p className={`text-xs ${
                                  hoveredCategoryId === category.id ? "text-white/80" : "text-gray-500"
                                }`}>
                                  {category.productCount} products
                                </p>
                              )}
                            </div>
                            {category.children && category.children.length > 0 && (
                              <ChevronRight
                                size={16}
                                className={`shrink-0 ${
                                  hoveredCategoryId === category.id ? "text-white" : "text-gray-400"
                                }`}
                              />
                            )}
                          </Link>

                          {/* SUB-CATEGORIES */}
                          {category.children && category.children.length > 0 && hoveredCategoryId === category.id && (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              transition={{ duration: 0.2 }}
                              className="absolute left-full top-0 ml-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50"
                            >
                              <div className="max-h-[400px] overflow-y-auto">
                                {category.children.map((child) => (
                                  <Link
                                    key={child.id}
                                    href={`/category/${child.slug}`}
                                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#0a923c] hover:text-white transition-colors border-b border-gray-100 last:border-b-0"
                                  >
                                    {child.image && (
                                      <div className="w-8 h-8 rounded-md overflow-hidden shrink-0 bg-gray-100">
                                        <Image
                                          src={child.image}
                                          alt={child.name}
                                          width={32}
                                          height={32}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 hover:text-white truncate">
                                        {child.name}
                                      </p>
                                      {child.productCount !== undefined && child.productCount > 0 && (
                                        <p className="text-xs text-gray-500 hover:text-white/80">
                                          {child.productCount} products
                                        </p>
                                      )}
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* --- NAVIGATION WITH SUBMENU --- */}
            <nav className="hidden ml-1 lg:flex relative lg:gap-4 lg:before:content-[''] lg:before:absolute lg:before:left-0 lg:before:right-0 lg:before:top-0 lg:before:bg-[#10723a] lg:before:h-[1px]">
              {menus.map((menu) => (
                <div
                  key={menu.id}
                  onMouseEnter={() => setHoverMenu(menu.id)}
                  onMouseLeave={() => setHoverMenu(null)}
                  className="relative px-3 py-2.5 hover:bg-[#04772f] transition-all duration-200"
                >
                  <Link
                    href={menu.url || "#"}
                    className="flex items-center space-x-1 transition"
                  >
                    <span className="text-sm cursor-pointer">{menu.title}</span>
                    {menu.children && menu.children.length > 0 && (
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${
                          hoverMenu === menu.id ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </Link>

                  {/* --- MENU CON (MEGA MENU) --- */}
                  <AnimatePresence>
                    {menu.children && menu.children.length > 0 && hoverMenu === menu.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        style={{ marginTop: "10px" }}
                        className="absolute bg-[#0a923c] text-white w-[260px] shadow-md z-50 "
                      >
                        <ul className="space-y-1 text-sm">
                          {menu.children.map((child) => (
                            <li key={child.id}>
                              <Link
                                href={child.url || "#"}
                                className="block px-3 py-2 cursor-pointer transition-all duration-200 ease-in-out"
                              >
                                {child.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* ▬▬▬ MOBILE MENU ▬▬▬ */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* BACKDROP */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm md:hidden z-50"
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* MENU PANEL */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed right-0 top-0 w-[85%] max-w-sm h-full bg-white md:hidden z-50 shadow-2xl"
            >
              <div className="flex flex-col h-full">
                {/* HEADER */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-[#0a923c]">
                  <span className="text-lg font-semibold text-white">Menu</span>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setExpandedMenuId(null);
                      setExpandedCategoryId(null);
                    }}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X size={20} className="text-white" />
                  </button>
                </div>

                {/* SCROLLABLE CONTENT */}
                <div className="flex-1 overflow-y-auto">
                  <nav className="px-4 py-3">
                    {/* HOME */}
                    <Link
                      href="/"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors mb-1"
                    >
                      <Store size={20} className="text-[#0a923c]" />
                      <span className="text-[15px] font-medium text-gray-900">Home</span>
                    </Link>

                    {/* PRODUCT CATEGORIES */}
                    {categories.length > 0 && (
                      <div className="mb-2">
                        <button
                          onClick={() => setExpandedCategoryId(expandedCategoryId === "categories" ? null : "categories")}
                          className="w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Menu size={20} className="text-[#0a923c]" />
                            <span className="text-[15px] font-medium text-gray-900">Product Categories</span>
                          </div>
                          <ChevronRight
                            size={18}
                            className={`text-gray-400 transition-transform duration-200 ${
                              expandedCategoryId === "categories" ? "rotate-90" : ""
                            }`}
                          />
                        </button>
                        
                        <AnimatePresence>
                          {expandedCategoryId === "categories" && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="pl-11 pr-4 py-2 space-y-1">
                                {categories.map((category) => (
                                  <div key={category.id}>
                                    <button
                                      onClick={() => setExpandedCategoryId(expandedCategoryId === category.id ? null : category.id)}
                                      className="w-full flex items-center justify-between gap-2 py-2.5 px-3 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
                                    >
                                      <span className="text-[14px] text-gray-700">{category.name}</span>
                                      {category.children && category.children.length > 0 && (
                                        <ChevronRight
                                          size={16}
                                          className={`text-gray-400 transition-transform duration-200 ${
                                            expandedCategoryId === category.id ? "rotate-90" : ""
                                          }`}
                                        />
                                      )}
                                    </button>
                                    
                                    {category.children && category.children.length > 0 && (
                                      <AnimatePresence>
                                        {expandedCategoryId === category.id && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden pl-2"
                                          >
                                            <div className="space-y-1">
                                              {category.children.map((child) => (
                                                <Link
                                                  key={child.id}
                                                  href={`/category/${child.slug}`}
                                                  onClick={() => {
                                                    setIsMenuOpen(false);
                                                    setExpandedCategoryId(null);
                                                  }}
                                                  className="block py-2 px-4 text-[13px] text-gray-600 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
                                                >
                                                  {child.name}
                                                </Link>
                                              ))}
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* MENU ITEMS */}
                    {menus.map((menu) => (
                      <div key={menu.id} className="mb-1">
                        {menu.children && menu.children.length > 0 ? (
                          <>
                            <button
                              onClick={() => setExpandedMenuId(expandedMenuId === menu.id ? null : menu.id)}
                              className="w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors"
                            >
                              <span className="text-[15px] font-medium text-gray-900">{menu.title}</span>
                              <ChevronRight
                                size={18}
                                className={`text-gray-400 transition-transform duration-200 ${
                                  expandedMenuId === menu.id ? "rotate-90" : ""
                                }`}
                              />
                            </button>
                            
                            <AnimatePresence>
                              {expandedMenuId === menu.id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="pl-4 pr-4 py-2 space-y-1">
                                    {menu.children.map((child) => (
                                      <Link
                                        key={child.id}
                                        href={child.url || "#"}
                                        onClick={() => {
                                          setIsMenuOpen(false);
                                          setExpandedMenuId(null);
                                        }}
                                        className="block py-2.5 px-4 text-[14px] text-gray-700 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
                                      >
                                        {child.title}
                                      </Link>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </>
                        ) : (
                          <Link
                            href={menu.url || "#"}
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors"
                          >
                            <span className="text-[15px] font-medium text-gray-900">{menu.title}</span>
                          </Link>
                        )}
                      </div>
                    ))}

                    {/* DIVIDER */}
                    <div className="h-px bg-gray-200 my-3" />

                    {/* WAREHOUSE */}
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                        <Store size={18} className="text-gray-600" />
                        <div>
                          <p className="text-[12px] text-gray-500">Ship from warehouse</p>
                          <p className="text-[14px] font-semibold text-gray-900">{selected}</p>
                        </div>
                      </div>
                    </div>
                  </nav>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
