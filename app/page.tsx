"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Agri from "./common/AgrishowSection";
import Product from "./common/product";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

interface Banner {
  id: string;
  type: "main" | "side";
  image: string;
  title?: string;
  link?: string;
  order: number;
  status: "active" | "inactive";
}

export default function Home() {
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mainBanners, setMainBanners] = useState<Banner[]>([]);
  const [sideBanners, setSideBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch banners from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/banners?status=active");
        const result = await response.json();
        if (result.success && result.data) {
          const banners: Banner[] = result.data;
          // Filter and sort main banners
          const main = banners
            .filter((b) => b.type === "main")
            .sort((a, b) => a.order - b.order);
          // Filter and sort side banners (only 2)
          const side = banners
            .filter((b) => b.type === "side")
            .sort((a, b) => a.order - b.order)
            .slice(0, 2);
          setMainBanners(main);
          setSideBanners(side);
        }
      } catch (error) {
        console.error("Error fetching banners:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* HERO BANNER + RIGHT COLUMN */}
      <div className="container mx-auto px-4 sm:px-5 py-4 sm:py-6 md:py-8 mt-30 pb-0">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* MAIN BANNER (3 cột) */}
          <div className="col-span-1 lg:col-span-3 relative w-full h-[250px] sm:h-[320px] lg:h-[400px] rounded-sm overflow-hidden shadow-lg">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <Loader2 className="w-8 h-8 text-[#0a923c] animate-spin" />
              </div>
            ) : mainBanners.length > 0 ? (
            <Swiper
              onSwiper={(swiper: SwiperType) => {
                swiperRef.current = swiper;
                setActiveIndex(swiper.realIndex);
              }}
              onSlideChange={(swiper: SwiperType) => {
                setActiveIndex(swiper.realIndex);
              }}
              modules={[Navigation, Pagination, Autoplay, EffectFade]}
              effect="fade"
              fadeEffect={{ crossFade: true }}
              spaceBetween={0}
              slidesPerView={1}
                loop={mainBanners.length > 1}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              speed={800}
              pagination={false}
              className="h-full w-full"
            >
                {mainBanners.map((banner, index) => (
                  <SwiperSlide key={banner.id}>
                    {banner.link ? (
                      <Link href={banner.link} className="relative w-full h-full block">
                        <Image
                          src={banner.image}
                          alt={banner.title || `Banner ${index + 1}`}
                          fill
                          className="object-cover"
                          priority={index === 0}
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 66vw, 75vw"
                        />
                      </Link>
                    ) : (
                  <div className="relative w-full h-full">
                    <Image
                          src={banner.image}
                          alt={banner.title || `Banner ${index + 1}`}
                      fill
                      className="object-cover"
                      priority={index === 0}
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 66vw, 75vw"
                    />
                  </div>
                    )}
                </SwiperSlide>
              ))}
            </Swiper>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <p className="text-gray-500 text-sm">Chưa có banner</p>
              </div>
            )}

            {/* CUSTOM PAGINATION - Apple style */}
            {mainBanners.length > 1 && !loading && (
              <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20">
                <div className="flex gap-2 items-center bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  {mainBanners.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        swiperRef.current?.slideToLoop(i);
                        setActiveIndex(i);
                      }}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        activeIndex === i
                          ? "bg-white w-6 shadow-sm" 
                          : "bg-white/50 w-1.5 hover:bg-white/70"
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Navigation buttons - only show if more than 1 banner */}
            {mainBanners.length > 1 && !loading && (
              <>
            <button
              onClick={() => swiperRef.current?.slidePrev()}
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm w-6 h-6 sm:w-8 sm:h-8 rounded-full shadow-lg flex items-center justify-center z-20 transition-all duration-300 hover:scale-110 active:scale-95 group"
              aria-label="Previous slide"
            >
              <ChevronLeft 
                size={24} 
                className="text-gray-800 group-hover:text-gray-900 transition-colors" 
              />
            </button>

            <button
              onClick={() => swiperRef.current?.slideNext()}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm w-6 h-6 sm:w-8 sm:h-8 rounded-full shadow-lg flex items-center justify-center z-20 transition-all duration-300 hover:scale-110 active:scale-95 group"
              aria-label="Next slide"
            >
              <ChevronRight 
                size={24} 
                className="text-gray-800 group-hover:text-gray-900 transition-colors" 
              />
            </button>
              </>
            )}
          </div>

          {/* RIGHT COLUMN (SMALL BANNERS) - Hidden on mobile */}
          <div className="hidden lg:flex lg:flex-col col-span-1 h-[400px] gap-4">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-sm">
                <Loader2 className="w-6 h-6 text-[#0a923c] animate-spin" />
              </div>
            ) : sideBanners.length > 0 ? (
              sideBanners.map((banner, index) => (
                <div
                  key={banner.id}
                  className="relative flex-1 min-h-0 rounded-sm overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  {banner.link ? (
                    <Link href={banner.link} className="relative w-full h-full block">
              <Image 
                        src={banner.image}
                        alt={banner.title || `Banner phụ ${index + 1}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300" 
                sizes="25vw"
              />
                    </Link>
                  ) : (
                    <div className="relative w-full h-full">
              <Image 
                        src={banner.image}
                        alt={banner.title || `Banner phụ ${index + 1}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300" 
                sizes="25vw"
              />
            </div>
                  )}
                </div>
              ))
            ) : (
              // Placeholder if no side banners
              Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={`placeholder-${index}`}
                  className="relative flex-1 min-h-0 rounded-sm overflow-hidden shadow-lg bg-gray-100 flex items-center justify-center"
                >
                  <p className="text-xs text-gray-400">Banner phụ {index + 1}</p>
                </div>
              ))
            )}
          </div>
          
        </div>
      </div>

      {/* PRODUCT SECTION */}
      <Product />

      {/* AGRISHOW SECTION */}
      <Agri />
    </div>
  );
}