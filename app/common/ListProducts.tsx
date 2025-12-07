"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, Loader2 } from "lucide-react";

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
}

export default function ListProducts() {
  const pathname = usePathname();
  const isAgencyRoute = pathname?.startsWith("/agency");
  
  // Helper function to add /agency prefix if in agency route
  const getAgencyPath = (path: string) => {
    if (isAgencyRoute && !path.startsWith("/agency") && !path.startsWith("http")) {
      return `/agency${path}`;
    }
    return path;
  };
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Format price in AUD
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
    
    // Use wholesale price (đại lý) instead of retail price
    const finalPrice = apiProduct.wholesalePrice;
    
    // Old price only shows when product is on sale (compare with retail price)
    const oldPrice = apiProduct.onSale && apiProduct.salePrice 
      ? apiProduct.retailPrice 
      : apiProduct.wholesalePrice;
    
    // Calculate discount percentage based on retail price vs sale price
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
      rating: 4.0 + Math.random() * 1, // TODO: Get from API if available (4.0 to 5.0)
      reviews: Math.floor(Math.random() * 200), // TODO: Get from API if available
    };
  };

  // Fetch products
  const fetchProducts = useCallback(async (pageNum: number, isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await fetch(`/api/products?status=active&limit=10&page=${pageNum}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        const convertedProducts = result.data.map(convertApiProduct);
        
        if (isInitial) {
          setProducts(convertedProducts);
        } else {
          setProducts((prev) => [...prev, ...convertedProducts]);
        }

        // Check if there are more products
        // If API returns totalPages, use it; otherwise check if returned products < limit
        if (result.totalPages !== undefined) {
          setHasMore(pageNum < result.totalPages);
        } else {
          // Fallback: if returned products < limit, no more products
          setHasMore(convertedProducts.length === 10);
        }
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      if (isInitial) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchProducts(1, true);
  }, [fetchProducts]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchProducts(nextPage, false);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore, loading, page, fetchProducts]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#0a923c] animate-spin" />
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
      <div className="bg-white py-6 md:py-8">
        <div className="mx-auto w-full max-w-7xl pl-[0.4rem] pr-[0.4rem] md:pl-4 md:pr-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Latest Products</h2>
          </div>
          <Link
            href={getAgencyPath("/category")}
            className="text-sm md:text-base text-[#0a923c] hover:text-[#04772f] font-medium flex items-center gap-1 transition-colors"
          >
            View All
            <span className="hidden md:inline">→</span>
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
          {products.map((product) => (
            <div key={product.id} className="group p-0 md:group-hover:p-4 transition-all duration-300 relative">
              <Link 
                href={getAgencyPath(`/product/${product.slug}`)}
                className="block h-full"
              >
                <div className="bg-white group-hover:shadow-lg transition-all duration-300 h-full flex flex-col relative">
                  {/* Image Container */}
                  <div className="relative w-full aspect-square overflow-hidden bg-gray-50 z-0">
                    <Image
                      src={product.img}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 "
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
                    window.location.href = getAgencyPath(`/product/${product.slug}`);
                  }}
                  className="w-full bg-black text-white py-2 sm:py-2.5 cursor-pointer font-medium text-xs sm:text-sm hover:bg-gray-800 active:scale-95 transition-colors shadow-lg"
                >
                  See Preview
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Loading More Indicator */}
        {loadingMore && (
          <div className="flex items-center justify-center py-8 mt-4">
            <Loader2 className="w-6 h-6 text-[#0a923c] animate-spin" />
            <span className="ml-2 text-sm text-gray-600">Loading more products...</span>
          </div>
        )}

        {/* Observer Target for Infinite Scroll */}
        {hasMore && !loadingMore && (
          <div ref={observerTarget} className="h-4 w-full" />
        )}

        {/* End of Products Message */}
        {!hasMore && products.length > 0 && (
          <div className="text-center py-8 mt-4">
            <p className="text-sm text-gray-500">No more products to load</p>
          </div>
        )}
      </div>
    </div>
  );
}

