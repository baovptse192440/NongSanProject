"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Grid3x3,
  ShoppingCart,
  User,
} from "lucide-react";

interface NavItem {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  badge?: number;
  showBadge?: boolean;
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState<{
    fullName?: string;
    email?: string;
    role?: string;
  } | null>(null);

  // Load cart count from API
  const loadCartCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        // Load from API if logged in
        const response = await fetch("/api/cart", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data && Array.isArray(result.data)) {
            const totalItems = result.data.reduce(
              (sum: number, item: { quantity?: number }) => sum + (item.quantity || 0),
              0
            );
            setCartCount(totalItems);
          } else {
            setCartCount(0);
          }
        } else {
          setCartCount(0);
        }
      } else {
        // Fallback to localStorage if not logged in
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          const items: Array<{ quantity?: number }> = JSON.parse(savedCart);
          const total = items.reduce((sum: number, item: { quantity?: number }) => sum + (item.quantity || 0), 0);
          setCartCount(total);
        } else {
          setCartCount(0);
        }
      }
    } catch (error) {
      console.error("Error loading cart count:", error);
      // Fallback to localStorage on error
      try {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          const items: Array<{ quantity?: number }> = JSON.parse(savedCart);
          const total = items.reduce((sum: number, item: { quantity?: number }) => sum + (item.quantity || 0), 0);
          setCartCount(total);
        } else {
          setCartCount(0);
        }
      } catch {
        setCartCount(0);
      }
    }
  };

  // Load user info
  const loadUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        return;
      }
      const response = await fetch("/api/auth/me", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        setUser(result.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error loading user:", error);
      setUser(null);
    }
  };

  // Initial load
  useEffect(() => {
    // Use setTimeout to avoid synchronous setState in effect
    const timer = setTimeout(() => {
      loadCartCount();
      loadUser();
    }, 0);

    // Listen for cart updates
    const handleCartUpdate = () => {
      loadCartCount();
    };
    const handleUserLogin = () => {
      loadUser();
      loadCartCount();
    };
    const handleUserUpdate = () => {
      setTimeout(() => {
        loadUser();
      }, 100);
    };
    const handleUserLogout = () => {
      setUser(null);
      setCartCount(0);
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("storage", handleCartUpdate);
    window.addEventListener("userLoggedIn", handleUserLogin);
    window.addEventListener("userUpdated", handleUserUpdate);
    window.addEventListener("userLoggedOut", handleUserLogout);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("storage", handleCartUpdate);
      window.removeEventListener("userLoggedIn", handleUserLogin);
      window.removeEventListener("userUpdated", handleUserUpdate);
      window.removeEventListener("userLoggedOut", handleUserLogout);
    };
  }, []);

  // Check if we're in agency routes
  const isAgencyRoute = pathname?.startsWith("/agency");

  // Helper function to get agency path
  const getAgencyPath = (path: string) => {
    if (isAgencyRoute) {
      return path.startsWith("/agency") ? path : `/agency${path === "/" ? "" : path}`;
    }
    return path;
  };

  // Build nav items dynamically based on user state and route
  const navItems: NavItem[] = [
    {
      href: getAgencyPath("/"),
      icon: Home,
      label: "",
    },
    {
      href: getAgencyPath("/category"),
      icon: Grid3x3,
      label: "",
    },
    {
      href: getAgencyPath("/cart"),
      icon: ShoppingCart,
      label: "",
      badge: cartCount,
      showBadge: true,
    },
    {
      href: user ? getAgencyPath("/profile") : "/login",
      icon: User,
      label: user ? "" : "",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Backdrop blur effect - Apple style */}
      <div className="absolute inset-0 bg-white/95 backdrop-blur-2xl border-t border-gray-200/60 shadow-[0_-2px_20px_rgba(0,0,0,0.05)]" />
      
      {/* Content */}
      <div className="relative px-1 py-2.5 safe-area-bottom">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Better active state logic - handle both /agency and non-agency routes
            const isActive = 
              item.href === "/" || item.href === "/agency"
                ? pathname === "/" || pathname === "/agency"
                : pathname === item.href || pathname?.startsWith(item.href + "/");
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 min-w-0 flex-1 relative group touch-manipulation"
              >
                {/* Icon container */}
                <div className="relative">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ease-out ${
                      isActive
                        ? "text-[#0a923c]"
                        : "text-gray-500 group-active:scale-90 group-hover:bg-gray-100"
                    }`}
                  >
                    <Icon
                      size={24}
                      className={`transition-all duration-300 ${
                        isActive ? "text-[#0a923c]" : "text-gray-500 group-hover:text-[#0a923c]"
                      }`}
                    />
                  </div>
                  
                  {/* Badge for cart */}
                  {item.showBadge && item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-md border-2 border-white">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span className={`text-[10px] font-medium transition-colors ${
                  isActive ? "text-[#0a923c]" : "text-gray-500"
                }`}>
                  {item.label}
                </span>

                {/* Active indicator dot */}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#0a923c] shadow-sm" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

