"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, ChevronRight } from "lucide-react";

interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  status: "active" | "inactive";
  productCount?: number;
  parentId?: string | null;
  showOnHomepage?: boolean;
}

interface Category {
  id: string;
  slug: string;
  img: string;
  name: string;
  productCount: number;
  description?: string;
}

export default function ListCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Convert API category to display format
  const convertApiCategory = (apiCategory: ApiCategory): Category => {
    const mainImage = apiCategory.image || "/sp/1.jpg";
    
    return {
      id: apiCategory.id,
      slug: apiCategory.slug,
      img: mainImage,
      name: apiCategory.name,
      productCount: apiCategory.productCount || 0,
      description: apiCategory.description,
    };
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Fetch categories with showOnHomepage flag or all active categories
        const response = await fetch("/api/categories?status=active&limit=10");
        const result = await response.json();
        
        if (result.success && result.data) {
          // Filter categories that are shown on homepage or parent categories
          const parentCategories = result.data
            .filter((cat: ApiCategory) => !cat.parentId)
            .slice(0, 8); // Limit to 8 categories
          
          const convertedCategories = parentCategories.map(convertApiCategory);
          setCategories(convertedCategories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="bg-white py-6 md:py-8">
        <div className="mx-auto w-full max-w-7xl pl-[0.4rem] pr-[0.4rem] md:pl-4 md:pr-4">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#0a923c] animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="bg-white py-6 md:py-8">
      <div className="mx-auto w-full max-w-7xl pl-[0.4rem] pr-[0.4rem] md:pl-4 md:pr-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Shop by Category</h2>
          </div>
          <Link
            href="/category"
            className="text-sm md:text-base text-[#0a923c] hover:text-[#04772f] font-medium flex items-center gap-1 transition-colors"
          >
            View All
            <span className="hidden md:inline">→</span>
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4">
          {categories.map((category) => (
            <div key={category.id} className="group relative">
              <Link 
                href={`/category/${category.slug}`}
                className="block h-full"
              >
                <div className="bg-white group-hover:shadow-lg transition-all duration-300 h-full flex flex-col relative rounded-md overflow-hidden">
                  {/* Image Container */}
                  <div className="relative w-full aspect-square overflow-hidden bg-gray-50">
                    <Image
                      src={category.img}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 12.5vw"
                    />
                  </div>

                  {/* Category Info */}
                  <div className="flex flex-col flex-1 p-2 sm:p-3">
                    {/* Category Name */}
                    <h3 className="font-medium text-xs sm:text-sm md:text-base text-gray-900 line-clamp-2 mb-1 group-hover:text-[#0a923c] transition-colors text-center min-h-[2rem] sm:min-h-[2.5rem] flex items-center justify-center">
                      {category.name}
                    </h3>

                    {/* Product Count */}
                    {category.productCount > 0 && (
                      <p className="text-[10px] sm:text-xs text-gray-500 text-center">
                        {category.productCount} {category.productCount === 1 ? 'item' : 'items'}
                      </p>
                    )}
                  </div>

                  {/* Hover Arrow Indicator */}
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ChevronRight className="w-5 h-5 text-[#0a923c]" />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

