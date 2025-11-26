"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Product from "../../common/product";
import ToastContainer from "../../common/Toast";
import { useToast } from "../../common/useToast";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import {
  Star,
  Check,
  Truck,
  Shield,
  Minus,
  Plus,
  Loader2,
  ArrowLeft,
  ShoppingCart,
  X,
} from "lucide-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

interface ProductData {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  images: string[];
  retailPrice: number;
  wholesalePrice: number;
  onSale: boolean;
  salePrice: number | null;
  salePercentage: number | null;
  stock: number;
  sku: string;
  categoryId: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  weight: number | null;
  dimensions: string | null;
  tags: string[];
  hasVariants?: boolean;
}

interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  retailPrice: number;
  wholesalePrice: number;
  stock: number;
  onSale: boolean;
  salePrice: number | null;
  salePercentage: number | null;
  status: string;
}

interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  oldPrice?: number;
  quantity: number;
  variantId?: string;
  variantName?: string;
  stock: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { toasts, toast, removeToast } = useToast();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [shippingConfig, setShippingConfig] = useState({
    shippingFee: 10,
    minimumOrderForFreeShipping: 50,
  });
  const swiperRef = useRef<SwiperType | null>(null);

  // Format price in AUD
  const formatPrice = (price: number): string => {
    return "$" + price.toLocaleString("en-AU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Fetch product by slug
  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/products/slug/${slug}`);
        const result = await response.json();

        if (result.success) {
          const productData = result.data;
          setProduct(productData);
          
          // Fetch variants if product has variants
          if (productData.hasVariants) {
            const variantsResponse = await fetch(`/api/products/variants?productId=${productData.id}`);
            const variantsResult = await variantsResponse.json();
            
            if (variantsResult.success && variantsResult.data && variantsResult.data.length > 0) {
              const activeVariants = variantsResult.data.filter((v: ProductVariant) => v.status === "active");
              setVariants(activeVariants);
              // Auto-select first variant
              if (activeVariants.length > 0) {
                setSelectedVariant(activeVariants[0]);
                // Reset quantity to 1 when variant changes
                setQuantity(1);
              }
            }
          }
        } else {
          setError(result.error || "Không tìm thấy sản phẩm");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Đã xảy ra lỗi khi tải sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  // Fetch shipping config
  useEffect(() => {
    const fetchShippingConfig = async () => {
      try {
        const response = await fetch("/api/config");
        const result = await response.json();
        if (result.success) {
          setShippingConfig({
            shippingFee: result.data.shippingFee ?? 10,
            minimumOrderForFreeShipping: result.data.minimumOrderForFreeShipping ?? 50,
          });
        }
      } catch (error) {
        console.error("Error fetching shipping config:", error);
      }
    };

    fetchShippingConfig();
  }, []);

  // Load cart count from localStorage
  useEffect(() => {
    const loadCartCount = () => {
      try {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          const cartItems: CartItem[] = JSON.parse(savedCart);
          const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
          setCartCount(totalItems);
        } else {
          setCartCount(0);
        }
      } catch (error) {
        console.error("Error loading cart count:", error);
        setCartCount(0);
      }
    };

    loadCartCount();

    // Listen for cart updates
    const handleCartUpdate = () => {
      loadCartCount();
    };
    const handleStorageChange = () => {
      loadCartCount();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eeeeee] mt-10 md:mt-32">
        <div className="hidden md:block">
        </div>
        <div className="flex items-center justify-center py-40">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
            <p className="text-sm text-gray-600">Đang tải sản phẩm...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#eeeeee] mt-10 md:mt-32">
        <ToastContainer toasts={toasts} onClose={removeToast} />
        <div className="hidden md:block">
        </div>
        <div className="container mx-auto px-4 py-20">
          <div className="bg-white rounded-sm shadow-md border border-gray-200 p-12 text-center">
            <p className="text-red-600 text-lg mb-2">{error || "Không tìm thấy sản phẩm"}</p>
            <Link
              href="/category"
              className="text-green-600 hover:underline font-medium"
            >
              Quay lại danh sách sản phẩm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate price based on selected variant or product - Default to wholesale price
  const getDisplayPrice = () => {
    if (selectedVariant) {
      return selectedVariant.onSale && selectedVariant.salePrice
        ? selectedVariant.salePrice
        : selectedVariant.wholesalePrice;
    }
    return product.onSale && product.salePrice
      ? product.salePrice
      : product.wholesalePrice;
  };

  const getWholesalePrice = () => {
    if (selectedVariant) {
      return selectedVariant.wholesalePrice;
    }
    return product.wholesalePrice;
  };

  const getOldPrice = () => {
    if (selectedVariant) {
      return selectedVariant.onSale && selectedVariant.salePrice
        ? selectedVariant.retailPrice
        : selectedVariant.retailPrice;
    }
    return product.onSale && product.salePrice
      ? product.retailPrice
      : product.retailPrice;
  };

  const getDiscount = () => {
    if (selectedVariant) {
      return selectedVariant.onSale && selectedVariant.salePercentage
        ? selectedVariant.salePercentage
        : (selectedVariant.onSale && selectedVariant.salePrice && selectedVariant.retailPrice
            ? Math.floor(((selectedVariant.retailPrice - selectedVariant.salePrice) / selectedVariant.retailPrice) * 100)
            : 0);
    }
    return product.onSale && product.salePercentage
      ? product.salePercentage
      : (product.onSale && product.salePrice && product.retailPrice
          ? Math.floor(((product.retailPrice - product.salePrice) / product.retailPrice) * 100)
          : 0);
  };

  const getStock = () => {
    return selectedVariant ? selectedVariant.stock : product.stock;
  };

  const finalPrice = getDisplayPrice();
  const oldPrice = getOldPrice();
  const discount = getDiscount();
  const currentStock = getStock();

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(prev + delta, currentStock || 99)));
  };

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setQuantity(1); // Reset quantity when variant changes
  };

  // Add to cart function
  const handleAddToCart = () => {
    if (!product) return;
    
    // Validate: if has variants, must select one
    if (variants.length > 0 && !selectedVariant) {
      toast.error("Lỗi", "Vui lòng chọn biến thể sản phẩm");
      return;
    }

    // Validate stock
    if (currentStock === 0) {
      toast.error("Lỗi", "Sản phẩm đã hết hàng");
      return;
    }

    if (quantity > currentStock) {
      toast.error("Lỗi", `Chỉ còn ${currentStock} sản phẩm trong kho`);
      return;
    }

    setAddingToCart(true);

    try {
      // Get cart from localStorage
      const savedCart = localStorage.getItem("cart");
      const cartItems: CartItem[] = savedCart ? JSON.parse(savedCart) : [];

      // Create cart item
      const cartItemId = selectedVariant 
        ? `${product.id}-${selectedVariant.id}`
        : product.id;

      // Check if item already exists in cart
      const existingItemIndex = cartItems.findIndex(
        (item) => item.id === cartItemId
      );

      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const existingItem = cartItems[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;
        
        if (newQuantity > currentStock) {
          toast.error("Lỗi", `Chỉ có thể thêm tối đa ${currentStock} sản phẩm vào giỏ hàng`);
          setAddingToCart(false);
          return;
        }

        cartItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
        };
      } else {
        // Add new item - Use wholesale price as default
        const wholesalePrice = selectedVariant 
          ? selectedVariant.wholesalePrice
          : product.wholesalePrice;
        
        const newItem: CartItem = {
          id: cartItemId,
          productId: product.id,
          name: product.name,
          slug: product.slug,
          image: product.images && product.images.length > 0 ? product.images[0] : "/sp/1.jpg",
          price: wholesalePrice,
          oldPrice: finalPrice > wholesalePrice ? finalPrice : undefined,
          quantity: quantity,
          variantId: selectedVariant?.id,
          variantName: selectedVariant?.name,
          stock: currentStock,
        };

        cartItems.push(newItem);
      }

      // Save to localStorage
      localStorage.setItem("cart", JSON.stringify(cartItems));

      // Dispatch event to update cart count in header
      window.dispatchEvent(new Event("cartUpdated"));

      // Show success toast
      toast.success(
        "Thành công",
        `Đã thêm ${quantity} sản phẩm vào giỏ hàng`
      );

      // Reset quantity after adding
      setQuantity(1);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Lỗi", "Không thể thêm sản phẩm vào giỏ hàng");
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eeeeee] md:mt-36">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      <div className="hidden md:block">
      </div>

      <header
        className="fixed top-0 left-0 w-full flex z-50 p-3 md:hidden">

        <div className="left-side w-1/2">
            <div
                className="bg-[rgba(45,46,50,0.5)] w-9 h-9 flex items-center justify-center rounded-full">
               <ArrowLeft strokeWidth={1} color="white" onClick={() => window.history.back()} />
            </div>
        </div>

        <div className="right-side w-1/2 flex justify-end">
            <Link
                href="/cart"
                className="bg-[rgba(45,46,50,0.5)] w-9 h-9 flex items-center justify-center rounded-full relative hover:bg-[rgba(45,46,50,0.7)] transition-colors">
                <ShoppingCart strokeWidth={1} color="white" />

                 {cartCount > 0 && (
                    <span
                        className="cart-badge absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-semibold px-1.5 py-px rounded-full min-w-[18px] flex items-center justify-center">
                        {cartCount > 99 ? '99+' : cartCount}
                    </span>
                 )}
            </Link>
        </div>

    </header>


      {/* Breadcrumb */}
      <div className="md:flex overflow-x-auto bg-[#e6e6e6] border-gray-200 hidden">
        <div className="container mx-auto px-4 py-3 overflow-x-auto">
          <div className="flex items-center gap-2 text-sm text-gray-600 overflow-x-auto">
            <Link href="/" className="hover:text-green-600">Trang chủ</Link>
            <span>/</span>
            {product.categoryName ? (
              <>
                <Link
                  href={`/category${product.categorySlug ? `/${product.categorySlug}` : ""}`}
                  className="hover:text-green-600"
                >
                  {product.categoryName}
                </Link>
                <span>/</span>
              </>
            ) : (
              <>
                <Link href="/category" className="hover:text-green-600">Sản phẩm</Link>
                <span>/</span>
              </>
            )}
            <span className="text-gray-600">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="w-full bg-white max-w-full md:max-w-[1260px] md:rounded-sm mx-auto md:py-5 xs:p-0 xs:w-full ">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT - IMAGES */}
          <div className="w-full lg:w-[500px] lg:sticky lg:top-[100px] space-y-4">
            {/* Mobile Swiper */}
            <div className="lg:hidden w-full mb-0">
              {product.images && product.images.length > 0 ? (
                <div className="relative w-full h-[350px] sm:h-[400px] rounded-xs overflow-hidden">
                  <Swiper
                    onSwiper={(swiper) => {
                      swiperRef.current = swiper;
                    }}
                    onSlideChange={(swiper) => {
                      setSelectedImage(swiper.activeIndex);
                    }}
                    modules={[Pagination]}
                    slidesPerView={1}
                    spaceBetween={0}
                    pagination={false}
                    className="w-full h-full"
                  >
                    {product.images.map((img, i) => (
                      <SwiperSlide key={i}>
                        <div className="relative w-full h-[350px] sm:h-[400px]">
                          <Image
                            src={img}
                            alt={`${product.name} ${i + 1}`}
                            fill
                            className="object-cover"
                            priority={i === 0}
                            sizes="100vw"
                          />
                          {i === 0 && discount > 0 && (
                            <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold border border-white shadow-sm z-10">
                              -{discount}%
                            </div>
                          )}
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                  {/* Custom Pagination Dots - Apple style */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                    <div className="flex gap-2 items-center bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      {product.images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            swiperRef.current?.slideTo(i);
                            setSelectedImage(i);
                          }}
                          className={`h-1.5 rounded-full transition-all duration-300 pointer-events-auto ${
                            selectedImage === i
                              ? "bg-white w-6 shadow-sm"
                              : "bg-white/50 w-1.5 hover:bg-white/70"
                          }`}
                          aria-label={`Go to slide ${i + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-[350px] sm:h-[400px] rounded-xs overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400">Không có hình ảnh</span>
                </div>
              )}
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:block space-y-4">
              <div className="relative w-full h-[500px] rounded-xs overflow-hidden border border-gray-200 bg-white shadow">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[selectedImage] || product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                    sizes="500px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-gray-400">Không có hình ảnh</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold border border-white shadow-sm">
                    -{discount}%
                  </div>
                )}
              </div>

              {product.images && product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative hover:cursor-pointer w-20 h-20 overflow-hidden border shrink-0 transition-all shadow-sm rounded-xs ${
                        selectedImage === i ? "border-green-600 shadow-md" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} ${i}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT - PRODUCT INFO */}
          <div className="flex-1 container">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">{product.name}</h1>

            <div className="flex flex-wrap gap-2 items-center text-gray-600 text-sm">
              <div className="flex items-center gap-0">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={i < 4 ? "fill-yellow-400 text-white" : "fill-yellow-400 text-white"}
                  />
                ))}
                <span>4.5</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                707 đã bán
              </div>
            </div>

            <div className="flex flex-col gap-2 py-2 border-b border-gray-200">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-semibold text-green-700">
                  {formatPrice(finalPrice)}
                </span>
                {discount > 0 && oldPrice > finalPrice && (
                  <>
                    <span className="line-through text-gray-400 text-sm">
                      {formatPrice(oldPrice)}
                    </span>
                    <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-xs font-semibold border border-red-200">
                      -{discount}%
                    </span>
                  </>
                )}
              </div>
              {getWholesalePrice() > 0 && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Giá đại lý: </span>
                  <span className="text-gray-800 font-semibold">{formatPrice(getWholesalePrice())}</span>
                </div>
              )}
            </div>


            <div className="space-y-4 text-sm text-gray-700 mt-2">
              {/* Vận chuyển đến */}
              <div>
                <p className="font-medium text-[#858383]">
                  Vận chuyển đến:{" "}
                  <span className="text-green-700 cursor-pointer">
                    Sydney, NSW
                  </span>
                </p>
              </div>

              {/* Phí vận chuyển */}
              <div>
                <p className="font-medium text-[#858383]">
                  Phí vận chuyển:{" "}
                  <span className="text-green-700">
                    {formatPrice(shippingConfig.shippingFee)}
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Free shipping on orders over {formatPrice(shippingConfig.minimumOrderForFreeShipping)}
                </p>
              </div>

              {/* Đóng gói - Variants Selection */}
              {variants.length > 0 ? (
                <div className="md:block hidden">
                  <p className="font-medium text-[#858383] mb-3">Đóng Gói:</p>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((variant) => {
                      const isSelected = selectedVariant?.id === variant.id;
                      const isOutOfStock = variant.stock <= 0;
                      
                      return (
                        <button
                          key={variant.id}
                          onClick={() => !isOutOfStock && handleVariantSelect(variant)}
                          disabled={isOutOfStock}
                          className={`hover:cursor-pointer border px-4 py-1 rounded-xs flex items-center gap-2 transition-all ${
                            isSelected
                              ? "border-green-700 text-green-700 bg-green-50"
                              : isOutOfStock
                              ? "border-gray-300 text-gray-400 bg-gray-50 opacity-50 cursor-not-allowed"
                              : "border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-700 hover:bg-green-50"
                          }`}
                        >
                          <span className={`w-3 h-3 rounded-full inline-block ${
                            isSelected
                              ? "bg-green-700"
                              : isOutOfStock
                              ? "bg-gray-300"
                              : "bg-gray-300"
                          }`}></span>
                          <span>{variant.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="md:flex items-center gap-2 hidden">
                  <p className="font-medium text-[#858383]">Đóng Gói:</p>
                  <button className="hover:cursor-pointer border border-green-700 text-green-700 px-4 py-1 rounded-xs flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-700 inline-block"></span>
                    Thùng
                  </button>
                </div>
              )}

              {/* Số lượng */}
              <div className="md:block hidden">
                <p className="font-medium text-[#858383] mb-2">Số lượng:</p>
                <div className="flex w-32 h-10 border border-gray-300 rounded-xs overflow-hidden">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="flex items-center justify-center w-10 bg-gray-200 text-xl hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus size={18} />
                  </button>
                  <div className="flex-1 flex items-center justify-center border-x border-gray-300 font-semibold">
                    {quantity}
                  </div>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= (currentStock || 99)}
                    className="flex items-center justify-center w-10 bg-gray-200 text-xl hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {/* Nút hành động */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    if (typeof window !== "undefined" && window.innerWidth < 1024) {
                      setShowBottomSheet(true);
                    } else {
                      // Desktop: add to cart directly
                      handleAddToCart();
                    }
                  }}
                  disabled={currentStock === 0 || (variants.length > 0 && !selectedVariant) || addingToCart}
                  className="flex-1 border border-green-700 text-green-700 py-3 font-semibold hover:bg-green-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {addingToCart ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Đang thêm...</span>
                    </>
                  ) : (
                    "THÊM VÀO GIỎ HÀNG"
                  )}
                </button>
                <button
                  disabled={currentStock === 0 || (variants.length > 0 && !selectedVariant)}
                  className="flex-1 bg-green-700 text-white py-3 font-semibold hover:bg-green-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  MUA NGAY
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* THÔNG TIN SẢN PHẨM */}
      {product.description && (
        <div className="container pl-0 bg-white rounded-sm mt-10 mx-auto py-0 px-0">
          <div className="bg-white border-gray-200 rounded-sm">
            {/* TIÊU ĐỀ */}
            <div className="bg-[#10723a] inline-block px-4 py-2">
              <h2 className="text-white text-lg font-semibold">Thông tin sản phẩm</h2>
            </div>

            <div className="border-t border-[#e8f5e9] space-y-4 text-gray-700 leading-relaxed p-2 px-2">
              {product.shortDescription && (
                <h1 className="text-2xl font-semibold text-black">{product.name}</h1>
              )}
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Related Products */}
      <div className="mt-10">
        <Product />
      </div>

      {/* Mobile Bottom Sheet */}
      <AnimatePresence>
        {showBottomSheet && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] lg:hidden"
              onClick={() => setShowBottomSheet(false)}
            />
            
            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 300,
                mass: 0.8,
              }}
              className="fixed bottom-0 left-0 right-0 z-[9999] lg:hidden"
              style={{ maxHeight: "90vh" }}
            >
              <div className="bg-white rounded-t-3xl shadow-2xl">
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>

              {/* Close button */}
              <button
                onClick={() => setShowBottomSheet(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
              >
                <X size={20} className="text-gray-600" />
              </button>

              {/* Content */}
              <div className="px-4 pb-6 overflow-y-auto" style={{ maxHeight: "calc(90vh - 60px)" }}>
                {/* Product Info */}
                <div className="flex gap-4 mb-4">
                  {product.images && product.images.length > 0 && (
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-sm overflow-hidden border border-gray-200 shrink-0">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-green-700">
                          {formatPrice(finalPrice)}
                        </span>
                        {discount > 0 && oldPrice > finalPrice && (
                          <span className="line-through text-gray-400 text-sm">
                            {formatPrice(oldPrice)}
                          </span>
                        )}
                      </div>
                      {getWholesalePrice() > 0 && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Giá đại lý: </span>
                          <span className="text-gray-800 font-semibold">{formatPrice(getWholesalePrice())}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-4">
                  {/* Số lượng */}
                  <div>
                    <p className="font-medium text-gray-800 mb-3">Số lượng:</p>
                    <div className="flex w-32 h-10 border border-gray-300 rounded-xs overflow-hidden">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="flex items-center justify-center w-10 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus size={18} />
                      </button>
                      <div className="flex-1 flex items-center justify-center border-x border-gray-300 font-semibold">
                        {quantity}
                      </div>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= (currentStock || 99)}
                        className="flex items-center justify-center w-10 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Đóng gói - Variants Selection */}
                  {variants.length > 0 ? (
                    <div>
                      <p className="font-medium text-gray-800 mb-3">Đóng Gói:</p>
                      <div className="flex flex-wrap gap-2">
                        {variants.map((variant) => {
                          const isSelected = selectedVariant?.id === variant.id;
                          const isOutOfStock = variant.stock <= 0;
                          
                          return (
                            <button
                              key={variant.id}
                              onClick={() => !isOutOfStock && handleVariantSelect(variant)}
                              disabled={isOutOfStock}
                              className={`border px-4 py-2 rounded-xs flex items-center gap-2 transition-all ${
                                isSelected
                                  ? "border-green-700 text-green-700 bg-green-50"
                                  : isOutOfStock
                                  ? "border-gray-300 text-gray-400 bg-gray-50 opacity-50 cursor-not-allowed"
                                  : "border-gray-300 text-gray-700 active:border-green-500 active:text-green-700 active:bg-green-50"
                              }`}
                            >
                              <span className={`w-3 h-3 rounded-full ${
                                isSelected
                                  ? "bg-green-700"
                                  : isOutOfStock
                                  ? "bg-gray-300"
                                  : "bg-gray-300"
                              }`}></span>
                              <span>{variant.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium text-gray-800 mb-2">Đóng Gói:</p>
                      <button className="border border-green-700 text-green-700 px-4 py-2 rounded-xs flex items-center gap-2 hover:bg-green-50 transition-colors">
                        <span className="w-3 h-3 rounded-full bg-green-700"></span>
                        Thùng
                      </button>
                    </div>
                  )}

                  {/* Mã giảm giá */}
                  <div>
                    <p className="font-medium text-gray-800 mb-2">Mã giảm giá:</p>
                    <div className="flex gap-2">
                      <span className="border border-green-700 text-green-700 px-3 py-1 rounded-xs text-xs">
                        FreeShip
                      </span>
                      <span className="border border-green-700 text-green-700 px-3 py-1 rounded-xs text-xs">
                        Giảm 8%
                      </span>
                    </div>
                  </div>

                  {/* Tổng tiền */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-medium text-gray-800">Tổng cộng:</span>
                      <span className="text-xl font-bold text-green-700">
                        {formatPrice(finalPrice * quantity)}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          handleAddToCart();
                          setShowBottomSheet(false);
                        }}
                        disabled={currentStock === 0 || (variants.length > 0 && !selectedVariant) || addingToCart}
                        className="flex-1 bg-green-700 text-white py-3 font-semibold rounded-sm hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {addingToCart ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Đang thêm...</span>
                          </>
                        ) : (
                          "THÊM VÀO GIỎ HÀNG"
                        )}
                      </button>
                      <button
                        onClick={() => {
                          // Buy now logic
                          setShowBottomSheet(false);
                        }}
                        disabled={currentStock === 0 || (variants.length > 0 && !selectedVariant)}
                        className="flex-1 border-2 border-green-700 text-green-700 py-3 font-semibold rounded-sm hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        MUA NGAY
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
