"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Agrishow from "../common/AgrishowSection";
import {
  Filter,
  Star,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  List,
  ChevronDown,
  Search,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  images: string[];
  retailPrice: number;
  wholesalePrice: number;
  onSale: boolean;
  salePrice: number | null;
  salePercentage: number | null;
  stock: number;
  status: string;
  categoryId: string | null;
  categoryName: string | null;
  createdAt: string;
  description?: string;
  shortDescription?: string;
  weight?: number | null;
  dimensions?: string | null;
  tags?: string[];
}

interface Product {
  id: string;
  slug: string;
  img: string;
  name: string;
  sold: number;
  price: number;
  oldPrice: number;
  discount: number;
  rating: number;
  reviews: number;
  category: {
    id: string | null;
    name: string | null;
  };
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
}

interface ApiResponse {
  success: boolean;
  data: ApiProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function CategoryPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [showSort, setShowSort] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 20;
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  // Filter states
  const [minRating, setMinRating] = useState<string>("");
  const [filterOnSale, setFilterOnSale] = useState<boolean>(false);
  const [filterInStock, setFilterInStock] = useState<boolean>(false);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await fetch("/api/categories?status=active");
        const result = await response.json();
        if (result.success && result.data) {
          setCategories(result.data);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const brands = [
    { id: "au", name: "AU Nông Sản", count: 89 },
    { id: "fruits", name: "Fruits", count: 67 },
    { id: "ufo", name: "UFO Coffee", count: 45 },
  ];

  // Format price in AUD (Australian Dollar) - price is already in AUD
  const formatPrice = (price: number): string => {
    return "$" + price.toLocaleString("en-AU", { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  // Convert API product to display format
  const convertApiProduct = (apiProduct: ApiProduct): Product => {
    const mainImage = apiProduct.images && apiProduct.images.length > 0 
      ? apiProduct.images[0] 
      : "/sp/1.jpg";
    
    // Determine final price (sale price if on sale, otherwise retail price)
    const finalPrice = apiProduct.onSale && apiProduct.salePrice 
      ? apiProduct.salePrice 
      : apiProduct.retailPrice;
    
    // Old price only shows when product is on sale
    const oldPrice = apiProduct.onSale && apiProduct.salePrice 
      ? apiProduct.retailPrice 
      : apiProduct.retailPrice; // Same as final price if not on sale
    
    // Calculate discount percentage
    const discount = apiProduct.onSale && apiProduct.salePercentage 
      ? apiProduct.salePercentage 
      : (apiProduct.onSale && apiProduct.salePrice && apiProduct.retailPrice
          ? Math.floor(((apiProduct.retailPrice - apiProduct.salePrice) / apiProduct.retailPrice) * 100)
          : 0);

    return {
      id: apiProduct.id,
      slug: apiProduct.slug,
      img: mainImage,
      name: apiProduct.name,
      sold: Math.floor(Math.random() * 1000), // TODO: Get from API if available
      price: finalPrice,
      oldPrice: oldPrice,
      discount: discount,
      rating: 4.0 + Math.random(), // TODO: Get from API if available
      reviews: Math.floor(Math.random() * 200), // TODO: Get from API if available
      category: {
        id: apiProduct.categoryId,
        name: apiProduct.categoryName,
      },
    };
  };

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams({
          status: "active",
          page: currentPage.toString(),
          limit: productsPerPage.toString(),
        });

        if (searchQuery) {
          params.append("search", searchQuery);
        }

        if (selectedCategory) {
          params.append("categoryId", selectedCategory);
        }

        const response = await fetch(`/api/products?${params.toString()}`);
        const result: ApiResponse = await response.json();

        if (result.success) {
          // Filter API products first (before conversion) to have access to stock and onSale
          const filteredApiProducts = result.data.filter((apiProduct) => {
            // On sale filter
            if (filterOnSale && !apiProduct.onSale) return false;
            
            // In stock filter
            if (filterInStock && apiProduct.stock <= 0) return false;
            
            return true;
          });
          
          // Convert filtered products
          let convertedProducts = filteredApiProducts.map(convertApiProduct);
          
          // Apply client-side filters that need converted data
          convertedProducts = convertedProducts.filter((product) => {
            // Rating filter (after conversion because rating is calculated)
            if (minRating && product.rating < parseFloat(minRating)) return false;
            
            return true;
          });
          
          // Apply client-side sorting if needed
          const sortedProducts = [...convertedProducts];
          if (sortBy !== "newest") {
            sortedProducts.sort((a, b) => {
              switch (sortBy) {
                case "priceAsc":
                  return a.price - b.price;
                case "priceDesc":
                  return b.price - a.price;
                case "bestSeller":
                  return b.sold - a.sold;
                default:
                  return 0;
              }
            });
          }

          setProducts(sortedProducts);
          setTotalProducts(sortedProducts.length);
          setTotalPages(Math.ceil(sortedProducts.length / productsPerPage));
        } else {
          setError("Không thể tải sản phẩm");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Đã xảy ra lỗi khi tải sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, searchQuery, selectedCategory, sortBy, minRating, filterOnSale, filterInStock]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedBrand, sortBy, minRating, filterOnSale, filterInStock]);

  // Count active filters
  const activeFiltersCount = () => {
    let count = 0;
    if (selectedCategory) count++;
    if (selectedBrand) count++;
    if (minRating) count++;
    if (filterOnSale) count++;
    if (filterInStock) count++;
    return count;
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategory("");
    setSelectedBrand("");
    setMinRating("");
    setFilterOnSale(false);
    setFilterInStock(false);
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".dropdown-container")) {
        setShowSort(false);
        setShowFilter(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const ProductCard = ({ product }: { product: Product }) => {
    if (viewMode === "list") {
      // List View - Horizontal Layout
      return (
        <Link href={`/product/${product.slug}`} className="block">
          <div className="bg-white rounded-lg hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-200 group cursor-pointer">
            <div className="flex gap-4 p-4">
              {/* Image - Small, Left Side */}
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 shrink-0 overflow-hidden bg-gray-50 rounded-md">
                <Image
                  src={product.img}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="160px"
                />
                {product.discount > 0 && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-0.5 rounded-sm text-xs font-bold shadow-md">
                    -{product.discount}%
                  </div>
                )}
              </div>

              {/* Content - Right Side */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                {/* Top Section */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg text-gray-800 line-clamp-2 group-hover:text-[#0a923c] transition-colors duration-200 mb-1">
                        {product.name}
                      </h3>
                      {product.category.name && (
                        <div className="flex items-center gap-1.5 text-sm text-[#10723a] mb-2">
                          <span className="font-medium">{product.category.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rating & Sold */}
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={`${
                            i < Math.floor(product.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-gray-200 text-gray-200"
                          } transition-colors`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 font-medium ml-1">
                        ({product.reviews})
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <span>{product.sold} Đã bán</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Section - Price & Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex flex-col">
                    <p className="text-[#10723a] font-bold text-xl">
                      {formatPrice(product.price)}
                    </p>
                    {product.discount > 0 && product.oldPrice > product.price && (
                      <p className="line-through text-gray-400 text-sm">
                        {formatPrice(product.oldPrice)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      // Add to cart logic
                    }}
                    className="flex items-center justify-center w-11 h-11 rounded-md border border-[#0a923c] bg-white text-[#0a923c] hover:bg-[#0a923c] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md active:scale-95"
                  >
                    <ShoppingCart size={20} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Link>
      );
    }

    // Grid View - Original Layout
    return (
      <Link href={`/product/${product.slug}`} className="h-full">
        <div className="bg-white rounded-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 group cursor-pointer flex flex-col h-full">
          {/* Image */}
          <div className="relative w-full h-[140px] sm:h-40 md:h-[180px] overflow-hidden bg-gray-50">
            <Image
              src={product.img}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            {product.discount > 0 && (
              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-0.5 rounded-sm text-[10px] font-bold border-white shadow-md">
                -{product.discount}%
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-2 md:p-4 flex flex-col flex-1 justify-between">
            <h3 className="font-semibold text-xs sm:text-[13px] md:text-[15px] text-gray-700 line-clamp-2  transition-colors duration-200 mb-2">
              {product.name}
            </h3>

            {product.category.name && (
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[#10723a] md:mb-2 mb-1">
                <span className="font-medium">{product.category.name}</span>
              </div>
            )}

            {/* Rating & Sold */}
            <div className="Md:mb-3 mb-1">
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={`${
                      i < Math.floor(product.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200"
                    } transition-colors`}
                  />
                ))}
                <span className="text-xs text-[#10723a] font-medium ml-1">
                  ({product.reviews})
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm md:text-[#10723a] text-gray-500 font-light">
                <span>{product.sold} Đã bán</span>
              </div>
            </div>

            {/* Price & Add to Cart */}
            <div className="flex items-end justify-between md:pt-3 pt-1 md:border-t md:border-gray-100">
              <div className="flex-1">
                <p className="text-[#10723a] font-bold text-base sm:text-lg mb-1">
                  {formatPrice(product.price)}
                </p>
                {product.discount > 0 && product.oldPrice > product.price && (
                  <p className="line-through text-gray-400 text-xs sm:text-sm">
                    {formatPrice(product.oldPrice)}
                  </p>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  // Add to cart logic
                }}
                className="flex items-center justify-center md:w-10 md:h-10 w-8 h-8 rounded-sm border border-[#0a923c] bg-white text-[#0a923c] hover:bg-[#0a923c] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md active:scale-95"
              >
                <ShoppingCart size={20} strokeWidth={1.5} className="cursor-pointer" />
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  const sortOptions = [
    { value: "newest", label: "Mới nhất" },
    { value: "bestSeller", label: "Bán chạy" },
    { value: "priceAsc", label: "Giá: từ thấp đến cao" },
    { value: "priceDesc", label: "Giá: từ cao đến thấp" },
  ];

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <div className="md:max-w-[1260px] mx-auto md:px-4 md:py-4 py-2 md:mt-36 mt-30">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* SIDEBAR - Desktop */}
          <aside className="hidden lg:block w-60 space-y-6">
            {/* Categories Sidebar */}
            <div className="bg-white rounded-sm shadow-lg border border-gray-100 sticky top-4">
              <div className="bg-[#0a923c] text-white text-center font-semibold text-base py-3 rounded-t-sm">
                TẤT CẢ SẢN PHẨM
              </div>
              <div className="p-4 sm:p-5">

                {categoriesLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 text-[#0a923c] animate-spin" />
                  </div>
                ) : categories.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Chưa có danh mục nào
                  </p>
                ) : (
                  categories
                    .filter((cat) => !cat.parentId) // Only show parent categories in sidebar
                    .map((category, index, filteredCategories) => (
                      <div key={category.id}>
                        <Link
                          href={`/category/${category.slug}`}
                          className="block py-2 px-2 rounded-sm hover:bg-[#0a923c]/5 transition-colors cursor-pointer group"
                        >
                          <p className="font-semibold text-sm text-gray-800 group-hover:text-[#0a923c] transition-colors">
                            {category.name}
                          </p>
                          {category.productCount !== undefined && category.productCount > 0 && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {category.productCount} sản phẩm
                            </p>
                          )}
                        </Link>
                        {index < filteredCategories.length - 1 && (
                          <hr className="border-gray-200 my-3" />
                        )}
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Brands Sidebar */}
            {/* <div className="bg-white rounded-sm shadow-lg border border-gray-100">
              <div className="bg-[#0a923c] text-white text-center font-bold text-base py-3 rounded-t-sm">
                Thương hiệu uy tín
              </div>
              <div className="p-4 grid grid-cols-3 gap-2">
                {Array.from({ length: 18 }, (_, i) => (
                  <Link
                    key={i}
                    href="/brands"
                    className="relative aspect-square rounded-sm overflow-hidden border border-gray-100 hover:border-[#0a923c] transition-colors group"
                  >
                    <Image
                      src={`/sp/${(i % 5) + 1}.jpg`}
                      alt={`Brand ${i + 1}`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      sizes="80px"
                    />
                  </Link>
                ))}
              </div>
            </div> */}
          </aside>

          {/* MAIN CONTENT */}
          <div className="flex-1">
            {/* Mobile Filter/Sort Bar */}
            <div className="lg:hidden bg-white md:rounded-sm rounded-none md:shadow-md shadow-none p-3 md:mb-4 mb-2 flex justify-between items-center gap-2 dropdown-container">
              <div className="relative flex-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSort(!showSort);
                    setShowFilter(false);
                  }}
                  className="w-full flex items-center justify-between gap-2 font-medium text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-sm border border-gray-200 hover:border-[#0a923c] transition-colors"
                >
                  <span>{sortOptions.find((opt) => opt.value === sortBy)?.label || "Sắp xếp"}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showSort ? "rotate-180" : ""}`} />
                </button>
                {showSort && (
                  <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-sm shadow-lg z-50">
                    <ul className="text-sm">
                      {sortOptions.map((option) => (
                        <li
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value);
                            setShowSort(false);
                          }}
                          className={`px-4 py-2.5 hover:bg-[#0a923c]/5 cursor-pointer transition-colors ${
                            sortBy === option.value ? "bg-[#0a923c]/10 text-[#0a923c] font-semibold" : "text-gray-700"
                          }`}
                        >
                          {option.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <Dialog open={showFilter} onOpenChange={(open) => {
                setShowFilter(open);
                if (!open) setShowSort(false);
              }}>
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFilter(true);
                    setShowSort(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  <span>Lọc</span>
                  {activeFiltersCount() > 0 && (
                    <Badge variant="default" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {activeFiltersCount()}
                    </Badge>
                  )}
                </Button>
                {/*  */}
              </Dialog>
            </div>

            {/* Filter Bar - Desktop */}
            <div className="hidden lg:block space-y-4 mb-5">
              {/* Search Bar */}

              {/* Filters Row */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">

                  {/* Sort */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40 h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* View Toggle */}
                  <div className="flex items-center gap-1 border border-gray-200 rounded-md p-1">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode("grid")}
                      className={`h-8 w-8 ${viewMode === "grid" ? "bg-[#0a923c] hover:bg-[#0a923c]/90 text-white" : ""}`}
                      aria-label="Grid view"
                    >
                      <Grid3x3 size={16} />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode("list")}
                      className={`h-8 w-8 ${viewMode === "list" ? "bg-[#0a923c] hover:bg-[#0a923c]/90 text-white" : ""}`}
                      aria-label="List view"
                    >
                      <List size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-8 h-8 text-[#0a923c] animate-spin" />
                  <p className="text-sm text-gray-600">Đang tải sản phẩm...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-50 border border-red-200 rounded-sm p-4 mb-5">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Products Grid/List */}
            {!loading && !error && (
              <>
                <div className='md:bg-white bg-none rounded-sm shadow-md border border-gray-100 min-h-[1000px]'>
                {products.length === 0 ? (
                  <div className="bg-white rounded-sm shadow-md border border-gray-100 p-12 text-center">
                    <p className="text-gray-600 text-lg mb-2">Không tìm thấy sản phẩm nào</p>
                    <p className="text-gray-500 text-sm">Vui lòng thử lại với bộ lọc khác</p>
                  </div>
                ) : (
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:p-4 p-2"
                        : "flex flex-col gap-3 md:gap-4 p-4 space-y-0"
                    }
                  >
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
                </div>



                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-8 mb-6 gap-2 flex-wrap">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      className="px-3 py-2 border border-gray-200 rounded-sm text-sm font-semibold hover:bg-[#0a923c] hover:text-white hover:border-[#0a923c] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-600"
                      disabled={currentPage === 1}
                      aria-label="Previous page"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    {getPaginationNumbers().map((page, index) => {
                      if (page === "...") {
                        return (
                          <span
                            key={`ellipsis-${index}`}
                            className="px-2 py-2 text-sm text-gray-500"
                          >
                            ...
                          </span>
                        );
                      }

                      const pageNum = page as number;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-4 py-2 border rounded-sm text-sm font-semibold transition-all duration-200 ${
                            currentPage === pageNum
                              ? "bg-[#0a923c] text-white border-[#0a923c] shadow-md"
                              : "border-gray-200 hover:bg-[#0a923c]/10 hover:border-[#0a923c]"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      className="px-3 py-2 border border-gray-200 rounded-sm text-sm font-semibold hover:bg-[#0a923c] hover:text-white hover:border-[#0a923c] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-600"
                      disabled={currentPage === totalPages}
                      aria-label="Next page"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}

                {/* Page Info */}
                {totalPages > 1 && (
                  <div className="text-center text-sm text-gray-600 mb-6">
                    Trang {currentPage} / {totalPages} ({totalProducts} sản phẩm)
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Agrishow />
    </div>
  );
}
