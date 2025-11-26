"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight, ShoppingCart, Star, Loader2 } from "lucide-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

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

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  showOnHomepage?: boolean;
}

interface CategoryWithProducts {
  category: Category;
  products: Product[];
  loading: boolean;
}

export default function ProductSection() {
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [newProductsLoading, setNewProductsLoading] = useState(true);
  const [categoriesWithProducts, setCategoriesWithProducts] = useState<CategoryWithProducts[]>([]);
  const swiperRef1 = useRef<SwiperType | null>(null);

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
      : apiProduct.retailPrice;
    
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
      rating: 4.0 + Math.random() * 1, // TODO: Get from API if available (4.0 to 5.0)
      reviews: Math.floor(Math.random() * 200), // TODO: Get from API if available
    };
  };

  // Fetch 10 newest products
  useEffect(() => {
    const fetchNewProducts = async () => {
      try {
        setNewProductsLoading(true);
        const response = await fetch("/api/products?status=active&limit=10&page=1");
        const result = await response.json();
        
        if (result.success && result.data) {
          const convertedProducts = result.data.map(convertApiProduct);
          setNewProducts(convertedProducts);
        }
      } catch (error) {
        console.error("Error fetching new products:", error);
      } finally {
        setNewProductsLoading(false);
      }
    };

    fetchNewProducts();
  }, []);

  // Fetch categories with showOnHomepage and their products
  useEffect(() => {
    const fetchCategoriesWithProducts = async () => {
      try {
        // Fetch all categories
        const categoriesResponse = await fetch("/api/categories?status=active");
        const categoriesResult = await categoriesResponse.json();
        
        if (categoriesResult.success && categoriesResult.data) {
          // Filter categories with showOnHomepage = true
          const homeCategories: Category[] = categoriesResult.data.filter(
            (cat: Category & { showOnHomepage?: boolean }) => cat.showOnHomepage === true
          );

          // Fetch products for each category
          const categoriesData: CategoryWithProducts[] = await Promise.all(
            homeCategories.map(async (category) => {
              try {
                const productsResponse = await fetch(
                  `/api/products?status=active&categoryId=${category.id}&limit=10&page=1`
                );
                const productsResult = await productsResponse.json();
                
                const products = productsResult.success && productsResult.data
                  ? productsResult.data.map(convertApiProduct)
                  : [];

                return {
                  category,
                  products,
                  loading: false,
                };
              } catch (error) {
                console.error(`Error fetching products for category ${category.id}:`, error);
                return {
                  category,
                  products: [],
                  loading: false,
                };
              }
            })
          );

          setCategoriesWithProducts(categoriesData);
        }
      } catch (error) {
        console.error("Error fetching categories with products:", error);
      }
    };

    fetchCategoriesWithProducts();
  }, []);

  const ProductCard = ({ product }: { product: Product }) => (
    <Link href={`/product/${product.slug}`} className="h-full">
      <div className="bg-white rounded-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 group cursor-pointer flex flex-col h-full">
        {/* Image */}
        <div className="relative w-full h-[140px] sm:h-40 md:h-[180px] overflow-hidden bg-gray-50">
          <Image
            src={product.img}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
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
          <h3 className="font-semibold text-xs sm:text-[13px] md:text-[15px] text-gray-700 line-clamp-2 transition-colors duration-200 mb-2 group-hover:text-[#0a923c]">
            {product.name}
          </h3>

          {/* Rating & Sold */}
          <div className="mb-1 md:mb-3">
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
            <div className="flex items-center gap-1.5 text-sm text-gray-500 font-light md:text-[#10723a]">
              <span>{product.sold} Đã bán</span>
            </div>
          </div>

          {/* Price & Add to Cart */}
          <div className="flex items-end justify-between pt-1 md:pt-3 md:border-t md:border-gray-100">
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
              className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-sm border border-[#0a923c] bg-white text-[#0a923c] hover:bg-[#0a923c] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md active:scale-95"
          >
              <ShoppingCart size={20} strokeWidth={1.5} className="cursor-pointer" />
          </button>
          </div>
        </div>
      </div>
    </Link>
  );

  const CategoryProductSection = ({ categoryData }: { categoryData: CategoryWithProducts }) => {
    const { category, products, loading } = categoryData;
    const swiperRef = useRef<SwiperType | null>(null);

    return (
      <div className="relative bg-white rounded-xs mt-6 sm:mt-8 md:mt-10 shadow-md p-3 sm:p-4 md:p-5 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full border-b border-gray-200 pb-4 sm:pb-5 gap-3 sm:gap-0">
          <div className="font-semibold text-sm sm:text-base pl-2 sm:pl-5">
            {category.name}
          </div>
          <Link
            href={`/category/${category.slug}`}
            className="flex font-semibold items-center text-xs sm:text-sm text-[#0a923c] hover:underline"
          >
            Xem All
            <ChevronRight size={14} className="sm:w-4 sm:h-4" />
          </Link>
        </div>

        {category.image && (
          <div className="w-full mt-4 mb-4 sm:mt-5 h-[150px] sm:h-[180px] md:h-[198px] rounded-xl sm:rounded-full overflow-hidden relative">
            <Link href={`/category/${category.slug}`} className="block w-full h-full rounded-full">
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover"
                sizes="100vw"
              />
            </Link>
    </div>
        )}

        <button
          onClick={() => swiperRef.current?.slidePrev()}
          className="hidden sm:flex absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm w-[21px] h-[21px] rounded-full shadow-lg items-center justify-center z-20 transition-all duration-300 hover:scale-110 active:scale-95 group"
          aria-label="Previous slide"
        >
          <ChevronLeft 
            size={16} 
            className="text-gray-800 group-hover:text-gray-900 transition-colors" 
          />
        </button>

        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          modules={[Navigation]}
          spaceBetween={12}
          slidesPerView={1.2}
          slidesPerGroup={1}
          speed={300}
          watchOverflow={true}
          observer={true}
          observeParents={true}
          updateOnWindowResize={true}
          preventClicks={true}
          preventClicksPropagation={true}
          breakpoints={{
            320: {
              slidesPerView: 1.2,
              spaceBetween: 8,
            },
            480: {
              slidesPerView: 2,
              spaceBetween: 12,
            },
            640: {
              slidesPerView: 2.5,
              spaceBetween: 16,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 24,
            },
            1280: {
              slidesPerView: 5,
              spaceBetween: 24,
            },
          }}
          className="pt-5 sm:pt-6 pb-3 sm:pb-4 pl-3 sm:pl-4 md:pl-0 pr-3 sm:pr-4 md:pr-0"
        >
          {loading ? (
            <div className="flex items-center justify-center py-12 col-span-full">
              <Loader2 className="w-8 h-8 text-[#0a923c] animate-spin" />
            </div>
          ) : products.length > 0 ? (
            products.map((p) => (
              <SwiperSlide key={p.id}>
                <ProductCard product={p} />
              </SwiperSlide>
            ))
          ) : (
            <div className="flex items-center justify-center py-12 col-span-full">
              <p className="text-gray-500 text-sm">Chưa có sản phẩm nào</p>
            </div>
          )}
        </Swiper>
        
        <button
          onClick={() => swiperRef.current?.slideNext()}
          className="hidden sm:flex absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm w-[21px] h-[21px] rounded-full shadow-lg items-center justify-center z-20 transition-all duration-300 hover:scale-110 active:scale-95 group"
          aria-label="Next slide"
        >
          <ChevronRight 
            size={16} 
            className="text-gray-800 group-hover:text-gray-900 transition-colors" 
          />
        </button>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 sm:px-5 py-6 sm:py-10">
      {/* SẢN PHẨM MỚI */}
      <div className="relative bg-white rounded-xs shadow-md p-3 sm:p-4 md:p-5 border border-gray-200">
         <div className="flex bg-white rounded-xs w-[40%] sm:w-[35%] overflow-x-auto no-scrollbar mb-5 border-white z-10">
          <button
            className={`flex-1 px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold transition-all bg-[#10723a] text-white shadow-inner hover: cursor-pointer`}
          >
            <div className="flex items-center justify-center gap-2">SẢN PHẨM MỚI</div>
          </button>
      </div>
        <button
          onClick={() => swiperRef1.current?.slidePrev()}
          className="hidden sm:flex absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm w-[21px] h-[21px] rounded-full shadow-lg items-center justify-center z-20 transition-all duration-300 hover:scale-110 active:scale-95 group"
          aria-label="Previous slide"
        >
          <ChevronLeft 
            size={16} 
            className="text-gray-800 group-hover:text-gray-900 transition-colors" 
          />
        </button>

        <Swiper
          onSwiper={(swiper) => {
            swiperRef1.current = swiper;
          }}
          modules={[Navigation]}
          spaceBetween={12}
          slidesPerView={1.2}
          slidesPerGroup={1}
          speed={300}
          watchOverflow={true}
          observer={true}
          observeParents={true}
          updateOnWindowResize={true}
          preventClicks={true}
          preventClicksPropagation={true}
          breakpoints={{
            320: {
              slidesPerView: 1.2,
              spaceBetween: 8,
            },
            480: {
              slidesPerView: 2,
              spaceBetween: 12,
            },
            640: {
              slidesPerView: 2.5,
              spaceBetween: 16,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 24,
            },
            1280: {
              slidesPerView: 5,
              spaceBetween: 24,
            },
          }}
          className="pt-12 sm:pt-14 pb-3 sm:pb-4 pl-3 sm:pl-4 md:pl-0 pr-3 sm:pr-4 md:pr-0"
        >
          {newProductsLoading ? (
            <div className="flex items-center justify-center py-12 col-span-full">
              <Loader2 className="w-8 h-8 text-[#0a923c] animate-spin" />
            </div>
          ) : newProducts.length > 0 ? (
            newProducts.map((p) => (
            <SwiperSlide key={p.id}>
              <ProductCard product={p} />
            </SwiperSlide>
            ))
          ) : (
            <div className="flex items-center justify-center py-12 col-span-full">
              <p className="text-gray-500 text-sm">Chưa có sản phẩm nào</p>
            </div>
          )}
        </Swiper>

        <button
          onClick={() => swiperRef1.current?.slideNext()}
          className="hidden sm:flex absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm w-[21px] h-[21px] rounded-full shadow-lg items-center justify-center z-20 transition-all duration-300 hover:scale-110 active:scale-95 group"
          aria-label="Next slide"
        >
          <ChevronRight 
            size={16} 
            className="text-gray-800 group-hover:text-gray-900 transition-colors" 
          />
        </button>
      </div>
      
      {/* CATEGORIES WITH PRODUCTS */}
      {categoriesWithProducts.map((categoryData) => (
        <CategoryProductSection key={categoryData.category.id} categoryData={categoryData} />
      ))}
    </div>
  );
}
