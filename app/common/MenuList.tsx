"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

export default function MenuList() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);

  useEffect(() => {
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
          const menusWithChildren = parentMenus.map((parent) => {
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

    fetchMenus();
  }, []);

  if (menus.length === 0) {
    return null;
  }

  return (
    <nav className="hidden lg:flex items-center gap-1">
      {menus.map((menu) => (
        <div
          key={menu.id}
          className="relative"
          onMouseEnter={() => menu.children && setHoveredMenu(menu.id)}
          onMouseLeave={() => setHoveredMenu(null)}
        >
          <Link
            href={menu.url || "#"}
            className="flex items-center gap-1 px-4 py-2 text-sm font-semibold hover:text-yellow-300 transition-colors rounded-md"
          >
            <span>{menu.title}</span>
            {menu.children && menu.children.length > 0 && (
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  hoveredMenu === menu.id ? "rotate-180" : ""
                }`}
              />
            )}
          </Link>

          {/* Sub-menu dropdown */}
          <AnimatePresence>
            {menu.children && menu.children.length > 0 && hoveredMenu === menu.id && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
              >
                {menu.children.map((child) => (
                  <Link
                    key={child.id}
                    href={child.url || "#"}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#0a923c] hover:text-white transition-colors"
                  >
                    {child.title}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </nav>
  );
}

