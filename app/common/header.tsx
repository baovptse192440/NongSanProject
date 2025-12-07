"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CircleUserRound,
  ShoppingCart,
  Store,
  Search,
  Menu,
  ChevronDown,
  ChevronRight,
  X,
  Bell,
  LogOut,
  User
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
  const pathname = usePathname();
  const isAgencyRoute = pathname?.startsWith("/agency");
  
  // Helper function to add /agency prefix if in agency route
  const getAgencyPath = (path: string) => {
    if (isAgencyRoute && !path.startsWith("/agency") && !path.startsWith("http")) {
      return `/agency${path}`;
    }
    return path;
  };
  
  const [config, setConfig] = useState<SiteConfig>({});
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [hoverCategoryMenu, setHoverCategoryMenu] = useState(false);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<Array<{
    id: string;
    name: string;
    slug: string;
    image: string;
    price: number;
  }>>([]);
  const [loadingCategoryProducts, setLoadingCategoryProducts] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState<{
    fullName?: string;
    email?: string;
    role?: string;
  } | null>(null);

  // Load cart count function (can be called from anywhere)
  const loadCartCount = async () => {
    try {
      // If user is logged in, load from API
      const currentUser = user || (typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "null") : null);
      if (currentUser) {
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const response = await fetch("/api/cart", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            const result = await response.json();
            if (result.success && result.data) {
              const total = result.data.reduce((sum: number, item: { quantity?: number }) => sum + (item.quantity || 0), 0);
              setCartCount(total);
              return;
            }
          } catch (error) {
            console.error("Error loading cart from API:", error);
          }
        }
      }
      
      // Fallback to localStorage for non-logged in users
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        const items: Array<{ quantity?: number }> = JSON.parse(savedCart);
        const total = items.reduce((sum: number, item: { quantity?: number }) => sum + (item.quantity || 0), 0);
        setCartCount(total);
      } else {
        setCartCount(0);
      }
    } catch (error) {
      console.error("Error loading cart count:", error);
      setCartCount(0);
    }
  };
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<{
    products: Array<{
      id: string;
      name: string;
      slug: string;
      image: string;
      price: number;
    }>;
    categories: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
  }>({ products: [], categories: [] });
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
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
  const [selected, setSelected] = useState("Tân Phú");

  // STATE MEGA MENU DESKTOP
  const [hoverMenu, setHoverMenu] = useState<string | null>(null);

  // Load user info and cart count
  useEffect(() => {
    const loadUser = async () => {
      try {
        // First check if token exists
        const token = localStorage.getItem("token");
        if (!token) {
          setUser(null);
          if (typeof window !== "undefined") {
            localStorage.removeItem("user");
          }
          return;
        }

        const response = await fetch("/api/auth/me", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        const result = await response.json();
        if (result.success && result.data) {
          setUser(result.data);
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(result.data));
          }
        } else {
          // Token invalid or expired
          setUser(null);
          if (typeof window !== "undefined") {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
          }
        }
      } catch (error) {
        console.error("Error loading user:", error);
        setUser(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      }
    };


    loadUser();
    loadCartCount();

    // Listen for updates
    const handleCartUpdate = () => {
      loadCartCount();
    };
    
    // Reload cart count when user logs in
    const handleUserLoginForCart = () => {
      setTimeout(() => {
        loadCartCount();
      }, 500);
    };

    const handleUserLogin = () => {
      loadUser();
      // Reload cart count after user login
      setTimeout(() => {
        loadCartCount();
      }, 500);
    };

    const handleUserUpdate = () => {
      // Debounce to prevent multiple rapid calls
      setTimeout(() => {
        loadUser();
      }, 100);
    };

    const handleUserLogout = () => {
      // Immediately clear user on logout
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token" && !e.newValue) {
        // Token was removed, clear user
        setUser(null);
      } else if (e.key === "cart") {
        loadCartCount();
      }
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userLoggedIn", handleUserLogin);
    window.addEventListener("userUpdated", handleUserUpdate);
    window.addEventListener("userLoggedOut", handleUserLogout);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userLoggedIn", handleUserLogin);
      window.removeEventListener("userUpdated", handleUserUpdate);
      window.removeEventListener("userLoggedOut", handleUserLogout);
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
      if (showLangMenu && !target.closest('.language-dropdown')) {
        setShowLangMenu(false);
      }
    };

    if (showNotifications || showUserMenu || showLangMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showNotifications, showUserMenu, showLangMenu]);

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
    } catch (error) {
      console.error("Error calling logout API:", error);
    } finally {
      // Clear all auth data
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        // Keep cart - don't remove it
        // localStorage.removeItem("cart");
        
        // Clear cookie if exists (for backward compatibility)
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        
        // Dispatch event to notify other components
        window.dispatchEvent(new Event("userLoggedOut"));
      }
      // Force redirect to home page
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

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("recentSearches");
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch (error) {
          console.error("Error loading recent searches:", error);
        }
      }
      // Set popular searches (could be from API later)
      setPopularSearches(["vegetables", "fruits", "organic", "fresh", "local"]);
    }
  }, []);

  // Save search query to recent searches
  const saveSearchHistory = (query: string) => {
    if (typeof window !== "undefined" && query.trim()) {
      const current = JSON.parse(localStorage.getItem("recentSearches") || "[]");
      const updated = [query.trim(), ...current.filter((q: string) => q !== query.trim())].slice(0, 5);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
      setRecentSearches(updated);
    }
  };

  // Fetch products when hovering over a category
  useEffect(() => {
    const fetchCategoryProducts = async () => {
      if (!hoveredCategoryId) {
        setCategoryProducts([]);
        return;
      }

      setLoadingCategoryProducts(true);
      try {
        const response = await fetch(`/api/products?categoryId=${hoveredCategoryId}&limit=8&status=active`);
        const result = await response.json();
        if (result.success && result.data) {
          const products = result.data.map((product: {
            id: string;
            name: string;
            slug: string;
            images: string[];
            retailPrice: number;
            salePrice: number | null;
            onSale: boolean;
          }) => ({
            id: product.id,
            name: product.name,
            slug: product.slug,
            image: product.images && product.images.length > 0 ? product.images[0] : "/sp/1.jpg",
            price: product.onSale && product.salePrice ? product.salePrice : product.retailPrice,
          }));
          setCategoryProducts(products);
        }
      } catch (error) {
        console.error("Error fetching category products:", error);
        setCategoryProducts([]);
      } finally {
        setLoadingCategoryProducts(false);
      }
    };

    fetchCategoryProducts();
  }, [hoveredCategoryId]);

  // Fetch search suggestions with debounce
  useEffect(() => {
    const fetchSuggestions = async () => {
      // If no query or less than 2 characters, clear suggestions but keep dropdown open
      if (!searchQuery.trim() || searchQuery.length < 1) {
        setSearchSuggestions({ products: [], categories: [] });
        setLoadingSuggestions(false);
        return;
      }

      if (searchQuery.trim().length < 2) {
        setSearchSuggestions({ products: [], categories: [] });
        setLoadingSuggestions(false);
        return;
      }

      setLoadingSuggestions(true);
      try {
        // Fetch products
        const productsResponse = await fetch(`/api/products?status=active&search=${encodeURIComponent(searchQuery.trim())}&limit=5`);
        const productsResult = await productsResponse.json();

        // Filter categories from existing categories list (client-side search)
        const queryLower = searchQuery.trim().toLowerCase();
        const filteredCategories = categories
          .filter((cat) => cat.name.toLowerCase().includes(queryLower))
          .slice(0, 5)
          .map((category) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
          }));

        const suggestions = {
          products: (productsResult.success && productsResult.data ? productsResult.data : []).map((product: {
            id: string;
            name: string;
            slug: string;
            images: string[];
            retailPrice: number;
            salePrice: number | null;
            onSale: boolean;
          }) => ({
            id: product.id,
            name: product.name,
            slug: product.slug,
            image: product.images && product.images.length > 0 ? product.images[0] : "/sp/1.jpg",
            price: product.onSale && product.salePrice ? product.salePrice : product.retailPrice,
          })),
          categories: filteredCategories,
        };

        setSearchSuggestions(suggestions);
      } catch (error) {
        console.error("Error fetching search suggestions:", error);
        setSearchSuggestions({ products: [], categories: [] });
      } finally {
        setLoadingSuggestions(false);
      }
    };

    // Debounce: Wait 300ms after user stops typing
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, categories]);

  // Highlight search term in text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-gray-900 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm">
      {/* ▬▬▬ MAIN HEADER - AliExpress Style ▬▬▬ */}
      <div className="bg-white">
        <div className="mx-auto w-full max-w-7xl pl-[0.4rem] pr-[0.4rem] md:pl-4 md:pr-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* LOGO - Left */}
            <div className="shrink-0">
              <Link href="/agency" className="flex items-center">
                {config.logo ? (
                  <Image
                    src={config.logo}
                    alt={config.siteName || "Logo"}
                    width={140}
                    height={50}
                    className="h-10 md:h-12 w-auto object-contain"
                  />
                ) : (
                  <motion.img
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    src="/logo_AU.png"
                    className="h-10 md:h-12 w-auto"
                    alt="AU Logo"
                  />
                )}
              </Link>
            </div>

            {/* SEARCH BAR - Center (Large) */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8 relative">
              <form 
                className="flex w-full"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    saveSearchHistory(searchQuery);
                    setShowSearchSuggestions(false);
                    window.location.href = getAgencyPath(`/category?search=${encodeURIComponent(searchQuery.trim())}`);
                  }
                }}
              >
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSearchSuggestions(true);
                    }}
                    onFocus={() => {
                      setShowSearchSuggestions(true);
                    }}
                    onBlur={() => {
                      // Delay to allow click on suggestions
                      setTimeout(() => setShowSearchSuggestions(false), 200);
                    }}
                    placeholder="Search products, posts..."
                    className="w-full h-9 pl-4 pr-14 py-2 bg-white border border-black rounded-3xl text-gray-800 outline-none"
                  />
                  {/* Search Button Inside Input */}
                  <button 
                    type="submit"
                    className="absolute right-0 top-1/2 -translate-y-1/2 h-[30px] mr-1 p-1 w-10 text-white rounded-2xl bg-black transition-all flex items-center justify-center"
                    title="Search"
                  >
                    <Search size={18} />
                  </button>
                </div>
              </form>

              {/* SEARCH SUGGESTIONS DROPDOWN */}
              <AnimatePresence>
                {showSearchSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[500px] overflow-y-auto z-50"
                  >
                    {loadingSuggestions && searchQuery.trim().length >= 2 ? (
                      <div className="p-6 text-center">
                        <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-[#0a923c]"></div>
                      </div>
                    ) : searchQuery.trim().length >= 2 && (searchSuggestions.products.length > 0 || searchSuggestions.categories.length > 0) ? (
                      <div className="py-1">
                        {/* Categories */}
                        {searchSuggestions.categories.length > 0 && (
                          <div className="border-b border-gray-100">
                            <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Categories</div>
                            {searchSuggestions.categories.map((category) => (
                              <Link
                                key={category.id}
                                href={getAgencyPath(`/category/${category.slug}`)}
                                onClick={() => {
                                  setShowSearchSuggestions(false);
                                  saveSearchHistory(searchQuery);
                                  setSearchQuery("");
                                }}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors"
                              >
                                <Search size={14} className="text-gray-400 shrink-0" />
                                <span className="text-xs text-gray-700">{highlightText(category.name, searchQuery)}</span>
                              </Link>
                            ))}
                          </div>
                        )}

                        {/* Products */}
                        {searchSuggestions.products.length > 0 && (
                          <div>
                            <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Products</div>
                            {searchSuggestions.products.map((product) => (
                              <Link
                                key={product.id}
                                href={getAgencyPath(`/product/${product.slug}`)}
                                onClick={() => {
                                  setShowSearchSuggestions(false);
                                  saveSearchHistory(searchQuery);
                                  setSearchQuery("");
                                }}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors group"
                              >
                                <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-gray-100">
                                  <Image
                                    src={product.image}
                                    alt={product.name}
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-gray-900 line-clamp-1">
                                    {highlightText(product.name, searchQuery)}
                                  </p>
                                  <p className="text-xs font-bold text-[#0a923c] mt-0.5">
                                    ${product.price.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}

                        {/* View All Results */}
                        {searchQuery.trim() && (searchSuggestions.products.length > 0 || searchSuggestions.categories.length > 0) && (
                          <div className="border-t border-gray-100 mt-1">
                            <Link
                              href={getAgencyPath(`/category?search=${encodeURIComponent(searchQuery.trim())}`)}
                              onClick={() => {
                                setShowSearchSuggestions(false);
                                saveSearchHistory(searchQuery);
                              }}
                              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-[#0a923c] hover:bg-gray-50 transition-colors"
                            >
                              View all results for "{searchQuery}"
                              <ChevronRight size={14} />
                            </Link>
                          </div>
                        )}
                      </div>
                    ) : searchQuery.trim().length >= 2 ? (
                      <div className="p-6 text-center text-xs text-gray-500">
                        No results found
                      </div>
                    ) : (
                      <div className="py-2">
                        {/* Recent Searches */}
                        {recentSearches.length > 0 && (
                          <div className="border-b border-gray-100">
                            <div className="px-3 py-1.5 flex items-center justify-between">
                              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Recent Searches</div>
                              <button
                                onClick={() => {
                                  localStorage.removeItem("recentSearches");
                                  setRecentSearches([]);
                                }}
                                className="text-[10px] text-gray-400 hover:text-gray-600"
                              >
                                Clear
                              </button>
                            </div>
                            {recentSearches.map((search, index) => (
                              <Link
                                key={index}
                                href={getAgencyPath(`/category?search=${encodeURIComponent(search)}`)}
                                onClick={() => {
                                  setShowSearchSuggestions(false);
                                  saveSearchHistory(search);
                                  setSearchQuery("");
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 transition-colors"
                              >
                                <Search size={14} className="text-gray-400 shrink-0" />
                                <span className="text-xs text-gray-700">{search}</span>
                              </Link>
                            ))}
                          </div>
                        )}

                        {/* Popular Searches */}
                        {popularSearches.length > 0 && (
                          <div>
                            <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Popular Searches</div>
                            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                              {popularSearches.map((search, index) => (
                                <Link
                                  key={index}
                                  href={getAgencyPath(`/category?search=${encodeURIComponent(search)}`)}
                                  onClick={() => {
                                    setShowSearchSuggestions(false);
                                    saveSearchHistory(search);
                                    setSearchQuery("");
                                  }}
                                  className="px-2.5 py-1 text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                                >
                                  {search}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* MOBILE SEARCH ICON */}
            <button
              onClick={() => {
                setShowMobileSearch(true);
                setSearchQuery("");
                setShowSearchSuggestions(true);
              }}
              className="md:hidden p-2 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Search"
            >
              <Search size={24} className="text-gray-700" />
            </button>

            {/* RIGHT SIDE ACTIONS */}
            <div className="hidden md:flex items-center gap-2 md:gap-4 shrink-0">

              {/* Notifications - Only show if user is logged in */}
              {user && (
                <div className="relative notification-dropdown">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <Bell className="w-5 h-5 text-gray-700" />
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadNotifications > 9 ? "9+" : unreadNotifications}
                      </span>
                    )}
                  </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto notification-dropdown">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">Notifications</h3>
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
                                window.location.href = getAgencyPath(`/profile/orders/${notif.orderId}`);
                              }
                              setShowNotifications(false);
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                                !notif.read ? "bg-[#0a923c]" : "bg-gray-300"
                              }`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900">{notif.title}</p>
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
                          href={getAgencyPath("/profile?tab=orders")}
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

              {/* User Account */}
              {user ? (
                <div 
                  className="relative user-menu-dropdown"
                  onMouseEnter={() => setShowUserMenu(true)}
                  onMouseLeave={() => setShowUserMenu(false)}
                >
                  <button className="flex items-center transition-colors px-3 py-2 min-w-[60px] gap-1">
                    <CircleUserRound size={29} className="text-gray-700" />
                    <div className="text-xs mt-0.5 hidden md:block">
                      <div className="font-light">Hello,</div>
                      <div className="font-bold truncate max-w-24">{user.fullName || "Account"}</div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50"
                      >
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                          <div className="font-bold text-gray-900">{user.fullName || "Account"}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{user.email}</div>
                        </div>
                        <div className="py-2">
                          <Link
                            href={getAgencyPath("/profile")}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <CircleUserRound size={18} className="text-gray-500" />
                            <span>My Account</span>
                          </Link>
                          <Link
                            href={getAgencyPath("/profile?tab=orders")}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Store size={18} className="text-gray-500" />
                            <span>My Orders</span>
                          </Link>
                          <Link
                            href={getAgencyPath("/cart")}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <ShoppingCart size={18} className="text-gray-500" />
                            <span>Shopping Cart</span>
                          </Link>
                          <div className="border-t border-gray-200 my-1"></div>
                          <button
                            onClick={() => {
                              handleLogout();
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut size={18} />
                            <span>Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div 
                  className="relative"
                  onMouseEnter={() => setShowUserDropdown(true)}
                  onMouseLeave={() => setShowUserDropdown(false)}
                >
                  <Link
                    href="/login"
                    className="flex items-center transition-colors px-3 py-2 min-w-[60px] gap-1"
                  >
                    <User size={29} />
                    <div className="text-xs mt-0.5 hidden md:block">
                      <div className="font-light">Welcome</div>
                      <div className="font-bold">Sign in / Register</div>
                    </div>
                  </Link>

                  {/* User Dropdown Menu */}
                  <AnimatePresence>
                    {showUserDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                      >
                        <div className="py-2">
                          <Link
                            href="/login"
                            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setShowUserDropdown(false)}
                          >
                            <div className="font-bold text-gray-900">Sign in</div>
                            <div className="text-xs text-gray-500 mt-0.5">New customer? Start here</div>
                          </Link>
                          <div className="border-t border-gray-200 my-1"></div>
                          <Link
                            href="/register"
                            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setShowUserDropdown(false)}
                          >
                            <div className="font-bold text-gray-900">Register</div>
                            <div className="text-xs text-gray-500 mt-0.5">Create your account</div>
                          </Link>
                          <div className="border-t border-gray-200 my-1"></div>
                          <Link
                            href={getAgencyPath("/profile?tab=orders")}
                            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setShowUserDropdown(false)}
                          >
                            <div className="font-medium text-gray-900">My Orders</div>
                          </Link>
                          <Link
                            href={getAgencyPath("/cart")}
                            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setShowUserDropdown(false)}
                          >
                            <div className="font-medium text-gray-900">Shopping Cart</div>
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Shopping Cart */}
              <Link
                href={getAgencyPath("/cart")}
                className="relative flex items-center transition-colors px-3 py-2 min-w-[60px] gap-2"
              >
                <ShoppingCart  size={29} />
                <div className="flex items-center flex-col">
                  {cartCount > 0 && (
                    <span className="px-2 bg-red-500 text-white text-[10px] font-bold rounded-3xl flex justify-center items-center">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                  <span className="text-xs font-bold mt-0.5 hidden md:block">Cart</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ▬▬▬ NAVIGATION BAR - AliExpress Style ▬▬▬ */}
      

      {/* ▬▬▬ MOBILE SEARCH MODAL ▬▬▬ */}
      <AnimatePresence>
        {showMobileSearch && (
          <>
            {/* BACKDROP */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm md:hidden z-50"
              onClick={() => {
                setShowMobileSearch(false);
                setShowSearchSuggestions(false);
              }}
            />
            
            {/* SEARCH PANEL */}
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed top-0 left-0 right-0 bg-white md:hidden z-50 shadow-xl max-h-screen flex flex-col"
            >
              <div className="p-4 border-b border-gray-200">
                <form 
                  className="flex items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim()) {
                      saveSearchHistory(searchQuery);
                      setShowMobileSearch(false);
                      setShowSearchSuggestions(false);
                      window.location.href = getAgencyPath(`/category?search=${encodeURIComponent(searchQuery.trim())}`);
                    }
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setShowMobileSearch(false);
                      setShowSearchSuggestions(false);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-md transition-colors shrink-0"
                  >
                    <X size={20} className="text-gray-700" />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSearchSuggestions(true);
                      }}
                      onFocus={() => {
                        setShowSearchSuggestions(true);
                      }}
                      placeholder="Search products, posts..."
                      autoFocus
                      className="w-full h-9 pl-4 pr-14 py-2 bg-white border border-black rounded-3xl text-gray-800 outline-none"
                    />
                    {/* Search Button Inside Input */}
                    <button 
                      type="submit"
                      className="absolute right-0 top-1/2 -translate-y-1/2 h-[30px] mr-1 p-1 w-10 text-white rounded-2xl bg-black transition-all flex items-center justify-center"
                      title="Search"
                    >
                      <Search size={18} />
                    </button>
                  </div>
                </form>
              </div>

              {/* MOBILE SEARCH SUGGESTIONS */}
              <div className="flex-1 overflow-y-auto">
                {loadingSuggestions && searchQuery.trim().length >= 2 ? (
                  <div className="p-6 text-center">
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-[#0a923c]"></div>
                  </div>
                ) : searchQuery.trim().length >= 2 && (searchSuggestions.products.length > 0 || searchSuggestions.categories.length > 0) ? (
                  <div className="py-1">
                    {/* Categories */}
                    {searchSuggestions.categories.length > 0 && (
                      <div className="border-b border-gray-100">
                        <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Categories</div>
                        {searchSuggestions.categories.map((category) => (
                          <Link
                            key={category.id}
                            href={getAgencyPath(`/category/${category.slug}`)}
                            onClick={() => {
                              setShowMobileSearch(false);
                              setShowSearchSuggestions(false);
                              saveSearchHistory(searchQuery);
                              setSearchQuery("");
                            }}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors"
                          >
                            <Search size={14} className="text-gray-400 shrink-0" />
                            <span className="text-xs text-gray-700">{highlightText(category.name, searchQuery)}</span>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Products */}
                    {searchSuggestions.products.length > 0 && (
                      <div>
                        <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Products</div>
                        {searchSuggestions.products.map((product) => (
                          <Link
                            key={product.id}
                            href={getAgencyPath(`/product/${product.slug}`)}
                            onClick={() => {
                              setShowMobileSearch(false);
                              setShowSearchSuggestions(false);
                              saveSearchHistory(searchQuery);
                              setSearchQuery("");
                            }}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors group"
                          >
                            <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-gray-100">
                              <Image
                                src={product.image}
                                alt={product.name}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-900 line-clamp-1">
                                {highlightText(product.name, searchQuery)}
                              </p>
                              <p className="text-xs font-bold text-[#0a923c] mt-0.5">
                                ${product.price.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* View All Results */}
                    {searchQuery.trim() && (searchSuggestions.products.length > 0 || searchSuggestions.categories.length > 0) && (
                      <div className="border-t border-gray-100 mt-1">
                        <Link
                          href={getAgencyPath(`/category?search=${encodeURIComponent(searchQuery.trim())}`)}
                          onClick={() => {
                            setShowMobileSearch(false);
                            setShowSearchSuggestions(false);
                            saveSearchHistory(searchQuery);
                          }}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-[#0a923c] hover:bg-gray-50 transition-colors"
                        >
                          View all results for "{searchQuery}"
                          <ChevronRight size={14} />
                        </Link>
                      </div>
                    )}
                  </div>
                ) : searchQuery.trim().length >= 2 ? (
                  <div className="p-6 text-center text-xs text-gray-500">
                    No results found
                  </div>
                ) : (
                  <div className="py-2">
                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                      <div className="border-b border-gray-100">
                        <div className="px-3 py-1.5 flex items-center justify-between">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Recent Searches</div>
                          <button
                            onClick={() => {
                              localStorage.removeItem("recentSearches");
                              setRecentSearches([]);
                            }}
                            className="text-[10px] text-gray-400 hover:text-gray-600"
                          >
                            Clear
                          </button>
                        </div>
                        {recentSearches.map((search, index) => (
                          <Link
                            key={index}
                            href={getAgencyPath(`/category?search=${encodeURIComponent(search)}`)}
                            onClick={() => {
                              setShowMobileSearch(false);
                              setShowSearchSuggestions(false);
                              saveSearchHistory(search);
                              setSearchQuery("");
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 transition-colors"
                          >
                            <Search size={14} className="text-gray-400 shrink-0" />
                            <span className="text-xs text-gray-700">{search}</span>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Popular Searches */}
                    {popularSearches.length > 0 && (
                      <div>
                        <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Popular Searches</div>
                        <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                          {popularSearches.map((search, index) => (
                            <Link
                              key={index}
                              href={getAgencyPath(`/category?search=${encodeURIComponent(search)}`)}
                              onClick={() => {
                                setShowMobileSearch(false);
                                setShowSearchSuggestions(false);
                                saveSearchHistory(search);
                                setSearchQuery("");
                              }}
                              className="px-2.5 py-1 text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                            >
                              {search}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
