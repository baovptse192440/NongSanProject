"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ChevronRight as ChevronRightIcon,
  Grid3x3,
  ShoppingBag,
  Package,
  Apple,
  Wheat,
  Coffee,
} from "lucide-react";

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

function CategoryPageContent() {
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
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

  // Update searchQuery from URL on mount and when URL changes
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch);
      setCurrentPage(1); // Reset to first page when search changes
    }
  }, [searchParams, searchQuery]);

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



  const ProductCard = ({ product }: { product: Product }) => {
    // Grid View - AliExpress Style (like ListProducts)
    return (
      <div key={product.id} className="group p-0 md:group-hover:p-4 transition-all duration-300 relative">
        <Link 
          href={`/agency/product/${product.slug}`}
          className="block h-full"
        >
          <div className="bg-white group-hover:shadow-lg transition-all duration-300 h-full flex flex-col relative">
            {/* Image Container */}
            <div className="relative w-full aspect-square overflow-hidden bg-gray-50 z-0">
              <Image
                src={product.img}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
              />
            
              {/* Discount Badge */}
              {product.discount > 0 && (
                <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-red-500 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-xs font-bold shadow-lg z-10">
                  -{product.discount}%
                </div>
              )}

              <span className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 absolute bottom-2 right-2 sm:bottom-3 sm:right-3 bg-white rounded-full p-1.5 sm:p-2 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg viewBox="0 0 1024 1024" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="currentColor" aria-hidden="false" focusable="false">
                  <path d="M128.64 112.32a64 64 0 0 0 52.16 73.984l15.008 2.624c4.8 0.832 8.416 4.8 8.8 9.632L239.04 625.92a74.656 74.656 0 0 0 74.432 68.672h460.384a74.656 74.656 0 0 0 73.6-62.08l58.784-343.104a32 32 0 0 0-63.104-10.784L784.32 621.696a10.656 10.656 0 0 1-10.496 8.864H313.44a10.656 10.656 0 0 1-10.624-9.792L268.416 193.44A74.656 74.656 0 0 0 206.72 125.856l-78.08-13.504zM394.624 416a32 32 0 0 1 32-32h96V288a32 32 0 1 1 64 0v96h96a32 32 0 1 1 0 64h-96v96a32 32 0 1 1-64 0v-96h-96a32 32 0 0 1-32-32z m-68.544 443.456a54.88 54.88 0 1 1 0-109.76 54.88 54.88 0 0 1 0 109.76z m347.392-54.88a54.88 54.88 0 1 0 109.76 0 54.88 54.88 0 0 0-109.76 0z"></path>
                </svg>
              </span>
            </div>

            {/* Product Info */}
            <div className="flex flex-col flex-1 p-2 sm:p-2 px-0 relative">
              {/* Product Name */}
              <h3 className="font-medium text-xs sm:text-sm md:text-base text-gray-800 line-clamp-2 mb-1.5 sm:mb-2 group-hover:text-[#0a923c] transition-colors min-h-8 sm:min-h-10">
                {product.name}
              </h3>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-1 mb-1.5 sm:mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={10}
                      className={`sm:w-3 sm:h-3 ${
                        i < Math.floor(product.rating)
                          ? "fill-black text-black"
                          : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] sm:text-xs text-gray-500 ml-0.5 sm:ml-1">
                  {product.sold} sold
                </span>
              </div>

              {/* Price Section */}
              <div className="mt-auto pt-1.5 sm:pt-2 border-t border-gray-100">
                <div className="flex items-baseline gap-1.5 sm:gap-2">
                  <span className="text-base sm:text-lg md:text-xl font-bold text-black">
                    {formatPrice(product.price)}
                  </span>
                  {product.discount > 0 && product.oldPrice > product.price && (
                    <span className="text-[10px] sm:text-xs md:text-sm text-gray-400 line-through">
                      {formatPrice(product.oldPrice)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Link>
        
        {/* See Preview Button - Show on Hover */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full mt-1.5 sm:mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none group-hover:pointer-events-auto">
          <button
            onClick={(e) => {
              e.preventDefault();
              window.location.href = `/agency/product/${product.slug}`;
            }}
            className="w-full bg-black text-white py-2 sm:py-2.5 cursor-pointer font-medium text-xs sm:text-sm hover:bg-gray-800 active:scale-95 transition-colors shadow-lg"
          >
            See Preview
          </button>
        </div>
      </div>
    );
  };

  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "bestSeller", label: "Best Selling" },
    { value: "priceAsc", label: "Price: Low to High" },
    { value: "priceDesc", label: "Price: High to Low" },
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
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-7xl px-3 md:px-4 lg:px-6 py-4 sm:py-6 md:py-8 md:mt-20 pt-16">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* SIDEBAR - Desktop - AliExpress Style */}
          <aside className="hidden lg:block w-72 shrink-0">
            {/* Categories Sidebar */}
            <div className="bg-white border border-gray-200 sticky top-4 overflow-hidden shadow-sm">
              {/* Header */}
              <div className="px-5 py-4 bg-gradient-to-r from-[#0a923c] to-[#10723a]">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Grid3x3 className="w-5 h-5" />
                  Shop by Category
                </h3>
              </div>
              
              {/* Categories List */}
              <div className="py-3">
                {categoriesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 text-[#0a923c] animate-spin" />
                  </div>
                ) : categories.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-12 px-4">
                    No categories available
                  </p>
                ) : (
                  <nav className="flex flex-col px-2">
                    {/* All Products Link */}
                    <Link
                      href="/agency/category"
                      className="group relative px-4 py-3 mb-2 rounded-lg text-sm font-semibold text-gray-900 bg-gray-50 hover:bg-[#0a923c] hover:text-white transition-all duration-300 flex items-center justify-between shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <ShoppingBag className="w-5 h-5 text-[#0a923c] group-hover:text-white transition-colors" />
                        <span>All Products</span>
                      </div>
                      <ChevronRightIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                    
                    {/* Categories */}
                    {categories
                      .filter((cat) => !cat.parentId)
                      .map((category) => {
                        // Get category icon based on name
                        const getCategoryIcon = (name: string) => {
                          const lowerName = name.toLowerCase();
                          if (lowerName.includes('fruit') || lowerName.includes('apple')) return Apple;
                          if (lowerName.includes('coffee')) return Coffee;
                          if (lowerName.includes('wheat') || lowerName.includes('grain')) return Wheat;
                          return Package;
                        };
                        
                        const IconComponent = getCategoryIcon(category.name);
                        
                        return (
                          <Link
                            key={category.id}
                            href={`/agency/category/${category.slug}`}
                            className="group relative px-4 py-3 mb-2 rounded-lg text-sm text-gray-700 hover:bg-[#0a923c] hover:text-white transition-all duration-300 hover:shadow-md"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {category.image ? (
                                  <div className="relative w-10 h-10 rounded-md overflow-hidden shrink-0 border border-gray-200 group-hover:border-white transition-colors shadow-sm">
                                    <Image
                                      src={category.image}
                                      alt={category.name}
                                      fill
                                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                                      sizes="40px"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 rounded-md bg-gray-100 group-hover:bg-white/20 flex items-center justify-center shrink-0 transition-colors shadow-sm">
                                    <IconComponent className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <span className="font-semibold group-hover:text-white transition-colors block truncate">
                                    {category.name}
                                  </span>
                                  {category.productCount !== undefined && category.productCount > 0 && (
                                    <span className="text-xs text-gray-500 group-hover:text-white/80 mt-0.5 block">
                                      {category.productCount} items
                                    </span>
                                  )}
                                </div>
                              </div>
                              <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-white opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all ml-2 shrink-0" />
                            </div>
                          </Link>
                        );
                      })}
                  </nav>
                )}
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <div className="flex-1">
            {/* Mobile Filter/Sort Bar - AliExpress Style */}
            <div className="lg:hidden bg-white border-b border-gray-200 mb-4">
              <div className="flex items-center gap-2 overflow-x-auto px-4 py-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all duration-200 shrink-0 ${
                      sortBy === option.value
                        ? "bg-[#0a923c] text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 active:bg-gray-200"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Bar - Desktop - AliExpress Style */}
            <div className="hidden lg:block mb-6">
              <div className="bg-white border-b border-gray-200">
                <div className="flex items-center justify-between gap-4 py-3 px-4">
                  {/* Sort Options - Inline Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-600 font-medium">Sort by:</span>
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSortBy(option.value)}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                          sortBy === option.value
                            ? "bg-[#0a923c] text-white shadow-sm"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  {/* Results Count */}
                  {!loading && (
                    <div className="text-sm text-gray-600 whitespace-nowrap">
                      {totalProducts} {totalProducts === 1 ? 'product' : 'products'}
                    </div>
                  )}
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

            {/* Products Grid */}
            {!loading && !error && (
              <>
                {products.length === 0 ? (
                  <div className="bg-white rounded-sm shadow-md border border-gray-100 p-12 text-center">
                    <p className="text-gray-600 text-lg mb-2">Không tìm thấy sản phẩm nào</p>
                    <p className="text-gray-500 text-sm">Vui lòng thử lại với bộ lọc khác</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}



                {/* Pagination - AliExpress Style */}
                {totalPages > 1 && (
                  <div className="flex flex-col items-center gap-4 mt-8 mb-6">
                    <div className="flex justify-center items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 hover:border-[#0a923c] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300"
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
                              className="px-2 py-2 text-sm text-gray-400"
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
                            className={`px-3.5 py-2 min-w-9 border rounded-md text-sm font-medium transition-all duration-200 ${
                              currentPage === pageNum
                                ? "bg-[#0a923c] text-white border-[#0a923c] shadow-sm"
                                : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-[#0a923c]"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 hover:border-[#0a923c] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300"
                        disabled={currentPage === totalPages}
                        aria-label="Next page"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0a923c]" />
      </div>
    }>
      <CategoryPageContent />
    </Suspense>
  );
}
