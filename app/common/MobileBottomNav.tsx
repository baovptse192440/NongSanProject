"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Grid3x3,
  Newspaper,
  Ticket,
  ShoppingCart,
  User,
} from "lucide-react";

interface NavItem {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  badge?: number;
}

const navItems: NavItem[] = [
  {
    href: "/",
    icon: Home,
    label: "Trang chủ",
  },
  {
    href: "/category",
    icon: Grid3x3,
    label: "Danh mục",
  },
  {
    href: "/tin-tuc",
    icon: Newspaper,
    label: "Tin tức",
  },
  {
    href: "/cart",
    icon: ShoppingCart,
    label: "Giỏ hàng",
    badge: 0, // Có thể lấy từ state/context sau
  },
  {
    href: "/login",
    icon: User,
    label: "Tài khoản",
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Backdrop blur effect - Apple style */}
      <div className="absolute inset-0 bg-white/95 backdrop-blur-2xl border-t border-gray-200/60 shadow-[0_-2px_20px_rgba(0,0,0,0.05)]" />
      
      {/* Content */}
      <div className="relative px-1 py-2.5 safe-area-bottom mb-[10px]">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Better active state logic
            const isActive = 
              item.href === "/" 
                ? pathname === "/"
                : pathname?.startsWith(item.href);
            
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
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-md border-2 border-white">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </div>

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

