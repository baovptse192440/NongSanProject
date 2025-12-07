"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ToastContainer from "../../../common/Toast";
import { useToast } from "../../../common/useToast";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import {
  Star,
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
  const router = useRouter();
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
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
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
                setQuantity(1);
              }
            }
          }
        } else {
          setError(result.error || "Product not found");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("An error occurred while loading the product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  // Fetch related products from same category
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product?.categoryId) return;

      try {
        const response = await fetch(
          `/api/products?categoryId=${product.categoryId}&status=active&limit=10&page=1`
        );
        const result = await response.json();

        if (result.success && result.data) {
          // Filter out current product and convert to display format
          const filtered = result.data
            .filter((p: any) => p.id !== product.id)
            .slice(0, 10)
            .map((apiProduct: any) => {
              const mainImage =
                apiProduct.images && apiProduct.images.length > 0
                  ? apiProduct.images[0]
                  : "/sp/1.jpg";

              const finalPrice =
                apiProduct.onSale && apiProduct.salePrice
                  ? apiProduct.salePrice
                  : apiProduct.retailPrice;

              const oldPrice =
                apiProduct.onSale && apiProduct.salePrice
                  ? apiProduct.retailPrice
                  : apiProduct.retailPrice;

              const discount =
                apiProduct.onSale && apiProduct.salePercentage
                  ? apiProduct.salePercentage
                  : apiProduct.onSale && apiProduct.salePrice && apiProduct.retailPrice
                  ? Math.floor(
                      ((apiProduct.retailPrice - apiProduct.salePrice) /
                        apiProduct.retailPrice) *
                        100
                    )
                  : 0;

              return {
                id: apiProduct.id,
                slug: apiProduct.slug,
                img: mainImage,
                name: apiProduct.name,
                price: finalPrice,
                oldPrice: oldPrice,
                discount: discount,
                rating: 4.0 + Math.random() * 1,
                reviews: Math.floor(Math.random() * 200),
              };
            });

          setRelatedProducts(filtered);
        }
      } catch (error) {
        console.error("Error fetching related products:", error);
      }
    };

    if (product) {
      fetchRelatedProducts();
    }
  }, [product]);

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

  // Load cart count from API
  useEffect(() => {
    const loadCartCount = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await fetch("/api/cart", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const result = await response.json();
          if (result.success && result.data?.items) {
            const totalItems = result.data.items.reduce(
              (sum: number, item: CartItem) => sum + item.quantity,
              0
            );
            setCartCount(totalItems);
          } else {
            setCartCount(0);
          }
        } else {
          const savedCart = localStorage.getItem("cart");
          if (savedCart) {
            const cartItems: CartItem[] = JSON.parse(savedCart);
            const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
            setCartCount(totalItems);
          } else {
            setCartCount(0);
          }
        }
      } catch (error) {
        console.error("Error loading cart count:", error);
        setCartCount(0);
      }
    };

    loadCartCount();

    const handleCartUpdate = () => {
      loadCartCount();
    };
    const handleStorageChange = () => {
      loadCartCount();
    };
    const handleUserLogin = () => {
      loadCartCount();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userLoggedIn", handleUserLogin);
    
    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userLoggedIn", handleUserLogin);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white md:mt-32">
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            <p className="text-xs text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white md:mt-32">
        <ToastContainer toasts={toasts} onClose={removeToast} />
        <div className="mx-auto w-full max-w-6xl px-4 py-16">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">{error || "Product not found"}</p>
            <Link
              href="/agency/category"
              className="text-xs text-[#0a923c] hover:underline"
            >
              Back to products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate price based on selected variant or product
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
    setQuantity(1);
  };

  // Add to cart function
  const handleAddToCart = async () => {
    if (!product) return;
    
    if (variants.length > 0 && !selectedVariant) {
      toast.error("Error", "Please select a variant");
      return;
    }

    if (currentStock === 0) {
      toast.error("Error", "Product is out of stock");
      return;
    }

    if (quantity > currentStock) {
      toast.error("Error", `Only ${currentStock} items available`);
      return;
    }

    setAddingToCart(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Error", "Please login to add items to cart");
        setAddingToCart(false);
        return;
      }

      const wholesalePrice = selectedVariant 
        ? selectedVariant.wholesalePrice
        : product.wholesalePrice;

      const cartItem = {
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

      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ item: cartItem }),
      });

      const result = await response.json();

      if (result.success) {
        window.dispatchEvent(new Event("cartUpdated"));
        toast.success("Success", `Added ${quantity} item${quantity > 1 ? 's' : ''} to cart`);
        setQuantity(1);
      } else {
        toast.error("Error", result.error || "Could not add product to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Error", "Could not add product to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  // Buy now function
  const handleBuyNow = async () => {
    if (!product) return;
    
    if (variants.length > 0 && !selectedVariant) {
      toast.error("Error", "Please select a variant");
      return;
    }

    if (currentStock === 0) {
      toast.error("Error", "Product is out of stock");
      return;
    }

    if (quantity > currentStock) {
      toast.error("Error", `Only ${currentStock} items available`);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Error", "Please login to proceed");
        return;
      }

      const wholesalePrice = selectedVariant 
        ? selectedVariant.wholesalePrice
        : product.wholesalePrice;

      const newItem = {
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

      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: [newItem] }),
      });

      const result = await response.json();

      if (result.success) {
        window.dispatchEvent(new Event("cartUpdated"));
        setShowBottomSheet(false);
        router.push("/agency/checkout");
      } else {
        toast.error("Error", result.error || "Could not proceed with buy now");
      }
    } catch (error) {
      console.error("Error in buy now:", error);
      toast.error("Error", "Could not proceed with buy now");
    }
  };

  return (
    <div className="min-h-screen bg-white md:mt-20 mt-16">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Breadcrumb - Minimal */}
      <div className="hidden md:block border-b border-gray-100">
        <div className="mx-auto w-full max-w-7xl px-6 py-2">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <Link href="/agency" className="hover:text-gray-900 transition-colors">Home</Link>
            <span>/</span>
            {product.categoryName ? (
              <>
                <Link
                  href={`/agency/category${product.categorySlug ? `/${product.categorySlug}` : ""}`}
                  className="hover:text-gray-900 transition-colors"
                >
                  {product.categoryName}
                </Link>
                <span>/</span>
              </>
            ) : (
              <>
                <Link href="/agency/category" className="hover:text-gray-900 transition-colors">Products</Link>
                <span>/</span>
              </>
            )}
            <span className="text-gray-900 truncate max-w-md">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Main Content - Apple Style Minimal */}
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 pt-4 md:pt-8 pb-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Image Gallery - Refined */}
          <div className="w-full lg:w-[45%] lg:sticky lg:top-24 shrink-0">
            {/* Mobile Swiper */}
            <div className="lg:hidden">
              {product.images && product.images.length > 0 ? (
                <div className="relative w-full aspect-square bg-gray-50 rounded-2xl overflow-hidden">
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
                        <div className="relative w-full aspect-square">
                          <Image
                            src={img}
                            alt={`${product.name} ${i + 1}`}
                            fill
                            className="object-contain p-6"
                            priority={i === 0}
                            sizes="100vw"
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                  {/* Minimal Dots */}
                  {product.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
                      <div className="flex gap-1.5 items-center bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-gray-200/50">
                        {product.images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              swiperRef.current?.slideTo(i);
                              setSelectedImage(i);
                            }}
                            className={`h-1 rounded-full transition-all ${
                              selectedImage === i
                                ? "bg-gray-900 w-6"
                                : "bg-gray-300 w-1.5 hover:bg-gray-400"
                            }`}
                            aria-label={`Slide ${i + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-md text-[10px] font-semibold">
                      -{discount}%
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative w-full aspect-square bg-gray-50 rounded-2xl flex items-center justify-center">
                  <span className="text-xs text-gray-400">No image</span>
                </div>
              )}
            </div>

            {/* Desktop Gallery */}
            <div className="hidden lg:block">
              <div className="flex gap-3">
                {/* Thumbnails */}
                {product.images && product.images.length > 1 && (
                  <div className="flex flex-col gap-2 overflow-y-auto pr-2 py-1 max-h-[500px] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:track-transparent [&::-webkit-scrollbar]:thumb-gray-300 [&::-webkit-scrollbar]:rounded-full">
                    {product.images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(i)}
                        className={`relative w-16 h-16 aspect-square overflow-hidden rounded-lg border-2 shrink-0 transition-all bg-white ${
                          selectedImage === i
                            ? "border-gray-900"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`${product.name} thumbnail ${i}`}
                          fill
                          className="object-contain p-1"
                          sizes="64px"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Main Image */}
                <div className="flex-1 relative w-full aspect-square max-w-[500px] bg-gray-50 rounded-2xl overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <>
                      <Image
                        src={product.images[selectedImage] || product.images[0]}
                        alt={product.name}
                        fill
                        className="object-contain p-8"
                        priority
                        sizes="500px"
                      />
                      {discount > 0 && (
                        <div className="absolute top-4 right-4 bg-red-500 text-white px-2.5 py-1 rounded-md text-[10px] font-semibold">
                          -{discount}%
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-xs text-gray-400">No image</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Product Info - Apple Style */}
          <div className="flex-1 lg:pt-4">
            {/* Title */}
            <h1 className="text-xl md:text-2xl font-medium text-gray-900 mb-2 leading-tight tracking-tight">
              {product.name}
            </h1>

            {/* Rating - Minimal */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={`${
                      i < 4
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] text-gray-600">4.5 (128)</span>
            </div>

            {/* Price - Elegant */}
            <div className="mb-5">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl md:text-3xl font-medium text-gray-900">
                  {formatPrice(finalPrice)}
                </span>
                {discount > 0 && oldPrice > finalPrice && (
                  <>
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(oldPrice)}
                    </span>
                    <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] font-medium">
                      -{discount}%
                    </span>
                  </>
                )}
              </div>
              {getWholesalePrice() > 0 && getWholesalePrice() !== finalPrice && (
                <p className="text-xs text-gray-500">
                  Wholesale: <span className="font-medium text-gray-700">{formatPrice(getWholesalePrice())}</span>
                </p>
              )}
            </div>

            {/* Variants - Minimal */}
            {variants.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-900">Packaging</span>
                  {selectedVariant && (
                    <span className="text-[10px] text-gray-500">
                      {selectedVariant.stock > 0 ? `${selectedVariant.stock} available` : 'Out of stock'}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {variants.map((variant) => {
                    const isSelected = selectedVariant?.id === variant.id;
                    const isOutOfStock = variant.stock <= 0;
                    
                    return (
                      <button
                        key={variant.id}
                        onClick={() => !isOutOfStock && handleVariantSelect(variant)}
                        disabled={isOutOfStock}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                          isSelected
                            ? "border-gray-900 bg-gray-900 text-white"
                            : isOutOfStock
                            ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                            : "border-gray-300 text-gray-700 bg-white hover:border-gray-900 hover:text-gray-900"
                        }`}
                      >
                        {variant.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity - Minimal */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-900">Quantity</span>
                {currentStock > 0 && (
                  <span className="text-[10px] text-gray-500">{currentStock} available</span>
                )}
              </div>
              <div className="inline-flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="w-9 h-9 flex items-center justify-center bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus size={14} className="text-gray-700" />
                </button>
                <div className="w-12 h-9 flex items-center justify-center border-x border-gray-300 font-medium text-sm text-gray-900">
                  {quantity}
                </div>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= (currentStock || 99)}
                  className="w-9 h-9 flex items-center justify-center bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus size={14} className="text-gray-700" />
                </button>
              </div>
            </div>

            {/* Action Buttons - Apple Style */}
            <div className="space-y-2 mb-6">
              <button
                onClick={() => {
                  if (typeof window !== "undefined" && window.innerWidth < 1024) {
                    setShowBottomSheet(true);
                  } else {
                    handleAddToCart();
                  }
                }}
                disabled={currentStock === 0 || (variants.length > 0 && !selectedVariant) || addingToCart}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 px-4 font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {addingToCart ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={16} />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleBuyNow}
                disabled={currentStock === 0 || (variants.length > 0 && !selectedVariant)}
                className="w-full border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white py-3 px-4 font-medium rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                Buy Now
              </button>
            </div>

            {/* Shipping Info - Minimal */}
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex items-center justify-between py-1">
                <span className="text-xs text-gray-600">Shipping</span>
                <span className="text-xs font-medium text-gray-900">
                  {formatPrice(shippingConfig.shippingFee)}
                </span>
              </div>
              {finalPrice < shippingConfig.minimumOrderForFreeShipping && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5">
                  <p className="text-[10px] text-blue-700">
                    Add {formatPrice(shippingConfig.minimumOrderForFreeShipping - finalPrice)} more for free shipping
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Description - Minimal */}
      {product.description && (
        <div className="mt-8 border-t border-gray-100">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-6 py-8">
            <h2 className="text-sm font-medium text-gray-900 mb-4">Product Information</h2>
            {product.shortDescription && (
              <p className="text-xs text-gray-700 leading-relaxed mb-4">{product.shortDescription}</p>
            )}
            <div
              className="prose prose-sm max-w-none text-xs text-gray-700"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        </div>
      )}

      {/* Related Products Section - Same Category */}
      {relatedProducts.length > 0 && (
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6 py-8 md:py-12 border-t border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
              More from {product.categoryName || "this category"}
            </h2>
            {product.categorySlug && (
              <Link
                href={`/agency/category${product.categorySlug ? `/${product.categorySlug}` : ""}`}
                className="text-sm text-[#0a923c] hover:text-[#04772f] font-medium flex items-center gap-1 transition-colors"
              >
                View All
                <span className="hidden md:inline">→</span>
              </Link>
            )}
          </div>

          {/* Swiper for Related Products */}
          <Swiper
            modules={[Pagination]}
            spaceBetween={12}
            slidesPerView={2}
            breakpoints={{
              640: {
                slidesPerView: 3,
                spaceBetween: 16,
              },
              768: {
                slidesPerView: 4,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 5,
                spaceBetween: 24,
              },
            }}
            className="pb-10"
          >
            {relatedProducts.map((relatedProduct) => (
              <SwiperSlide key={relatedProduct.id}>
                <div className="group p-0 md:group-hover:p-4 transition-all duration-300 relative">
                  <Link
                    href={`/agency/product/${relatedProduct.slug}`}
                    className="block h-full mb-[50px]"
                  >
                    <div className="bg-white group-hover:shadow-lg transition-all duration-300 h-full flex flex-col relative">
                      {/* Image Container */}
                      <div className="relative w-full aspect-square overflow-hidden bg-gray-50 z-0">
                        <Image
                          src={relatedProduct.img}
                          alt={relatedProduct.name}
                          fill
                          className="object-cover transition-transform duration-500"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                        />

                        {/* Discount Badge */}
                        {relatedProduct.discount > 0 && (
                          <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-red-500 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-xs font-bold shadow-lg z-10">
                            -{relatedProduct.discount}%
                          </div>
                        )}

                        {/* Quick Add to Cart Icon */}
                        <span className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 absolute bottom-2 right-2 sm:bottom-3 sm:right-3 bg-white rounded-full p-1.5 sm:p-2 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <svg
                            viewBox="0 0 1024 1024"
                            className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
                            fill="currentColor"
                            aria-hidden="false"
                            focusable="false"
                          >
                            <path d="M128.64 112.32a64 64 0 0 0 52.16 73.984l15.008 2.624c4.8 0.832 8.416 4.8 8.8 9.632L239.04 625.92a74.656 74.656 0 0 0 74.432 68.672h460.384a74.656 74.656 0 0 0 73.6-62.08l58.784-343.104a32 32 0 0 0-63.104-10.784L784.32 621.696a10.656 10.656 0 0 1-10.496 8.864H313.44a10.656 10.656 0 0 1-10.624-9.792L268.416 193.44A74.656 74.656 0 0 0 206.72 125.856l-78.08-13.504zM394.624 416a32 32 0 0 1 32-32h96V288a32 32 0 1 1 64 0v96h96a32 32 0 1 1 0 64h-96v96a32 32 0 1 1-64 0v-96h-96a32 32 0 0 1-32-32z m-68.544 443.456a54.88 54.88 0 1 1 0-109.76 54.88 54.88 0 0 1 0 109.76z m347.392-54.88a54.88 54.88 0 1 0 109.76 0 54.88 54.88 0 0 0-109.76 0z"></path>
                          </svg>
                        </span>
                      </div>

                      {/* Product Info */}
                      <div className="flex flex-col flex-1 p-2 sm:p-2 px-0 relative">
                        {/* Product Name */}
                        <h3 className="font-medium text-xs sm:text-sm md:text-base text-gray-800 line-clamp-2 mb-1.5 sm:mb-2 group-hover:text-[#0a923c] transition-colors min-h-8 sm:min-h-10">
                          {relatedProduct.name}
                        </h3>

                        {/* Rating & Reviews */}
                        <div className="flex items-center gap-1 mb-1.5 sm:mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={10}
                                className={`sm:w-3 sm:h-3 ${
                                  i < Math.floor(relatedProduct.rating)
                                    ? "fill-black text-black"
                                    : "fill-gray-200 text-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] sm:text-xs text-gray-500 ml-0.5 sm:ml-1">
                            {relatedProduct.reviews} reviews
                          </span>
                        </div>

                        {/* Price Section */}
                        <div className="mt-auto pt-1.5 sm:pt-2 border-t border-gray-100">
                          <div className="flex items-baseline gap-1.5 sm:gap-2">
                            <span className="text-base sm:text-lg md:text-xl font-bold text-black">
                              {formatPrice(relatedProduct.price)}
                            </span>
                            {relatedProduct.discount > 0 &&
                              relatedProduct.oldPrice > relatedProduct.price && (
                                <span className="text-[10px] sm:text-xs md:text-sm text-gray-400 line-through">
                                  {formatPrice(relatedProduct.oldPrice)}
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
                        window.location.href = `/agency/product/${relatedProduct.slug}`;
                      }}
                      className="w-full bg-black text-white py-2 sm:py-2.5 cursor-pointer font-medium text-xs sm:text-sm hover:bg-gray-800 active:scale-95 transition-colors shadow-lg"
                    >
                      See Preview
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* Mobile Bottom Sheet - Apple Style */}
      <AnimatePresence>
        {showBottomSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] lg:hidden"
              onClick={() => setShowBottomSheet(false)}
            />
            
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 300,
              }}
              className="fixed bottom-0 left-0 right-0 z-[9999] lg:hidden bg-white rounded-t-3xl shadow-2xl"
              style={{ maxHeight: "85vh" }}
            >
              {/* Header with Back, Handle, and Cart */}
              <div className="flex items-center justify-between px-4 pt-3 pb-2">
                <button
                  onClick={() => window.history.back()}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeft strokeWidth={2} className="text-gray-900" size={16} />
                </button>
                
                {/* Handle */}
                <div className="flex-1 flex justify-center">
                  <div className="w-10 h-1 bg-gray-300 rounded-full" />
                </div>
                
                <Link
                  href="/agency/cart"
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors relative"
                >
                  <ShoppingCart strokeWidth={2} className="text-gray-900" size={16} />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-medium rounded-full flex items-center justify-center">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
              </div>

              {/* Close */}
              <button
                onClick={() => setShowBottomSheet(false)}
                className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <X size={14} className="text-gray-600" />
              </button>

              {/* Content */}
              <div className="px-4 pb-6 overflow-y-auto" style={{ maxHeight: "calc(85vh - 50px)" }}>
                {/* Product Summary */}
                <div className="flex gap-3 mb-4">
                  {product.images && product.images.length > 0 && (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-xs text-gray-900 mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-medium text-gray-900">
                        {formatPrice(finalPrice)}
                      </span>
                      {discount > 0 && oldPrice > finalPrice && (
                        <span className="line-through text-gray-400 text-[10px]">
                          {formatPrice(oldPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-4">
                  {/* Quantity */}
                  <div>
                    <p className="font-medium text-xs text-gray-900 mb-2">Quantity</p>
                    <div className="flex w-28 h-9 border border-gray-300 rounded-lg overflow-hidden">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="flex items-center justify-center w-9 bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <div className="flex-1 flex items-center justify-center border-x border-gray-300 font-medium text-sm">
                        {quantity}
                      </div>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= (currentStock || 99)}
                        className="flex items-center justify-center w-9 bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Variants */}
                  {variants.length > 0 && (
                    <div>
                      <p className="font-medium text-xs text-gray-900 mb-2">Packaging</p>
                      <div className="flex flex-wrap gap-2">
                        {variants.map((variant) => {
                          const isSelected = selectedVariant?.id === variant.id;
                          const isOutOfStock = variant.stock <= 0;
                          
                          return (
                            <button
                              key={variant.id}
                              onClick={() => !isOutOfStock && handleVariantSelect(variant)}
                              disabled={isOutOfStock}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                                isSelected
                                  ? "border-gray-900 bg-gray-900 text-white"
                                  : isOutOfStock
                                  ? "border-gray-200 text-gray-400 bg-gray-50 opacity-50 cursor-not-allowed"
                                  : "border-gray-300 text-gray-700 bg-white active:border-gray-900 active:text-gray-900"
                              }`}
                            >
                              {variant.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-medium text-xs text-gray-900">Total</span>
                      <span className="text-lg font-medium text-gray-900">
                        {formatPrice(finalPrice * quantity)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          handleAddToCart();
                          setShowBottomSheet(false);
                        }}
                        disabled={currentStock === 0 || (variants.length > 0 && !selectedVariant) || addingToCart}
                        className="flex-1 bg-gray-900 text-white py-2.5 text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                      >
                        {addingToCart ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Adding...</span>
                          </>
                        ) : (
                          "Add to Cart"
                        )}
                      </button>
                      <button
                        onClick={handleBuyNow}
                        disabled={currentStock === 0 || (variants.length > 0 && !selectedVariant)}
                        className="flex-1 border-2 border-gray-900 text-gray-900 py-2.5 text-xs font-medium rounded-lg hover:bg-gray-900 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Cart Button - Mobile Only */}
      {!showBottomSheet && (
        <Link
          href="/agency/cart"
          className="fixed bottom-20 right-4 z-40 w-12 h-12 flex items-center justify-center rounded-full bg-gray-900 text-white shadow-lg hover:bg-gray-800 transition-all md:hidden"
        >
          <ShoppingCart strokeWidth={2} size={20} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </Link>
      )}
    </div>
  );
}
