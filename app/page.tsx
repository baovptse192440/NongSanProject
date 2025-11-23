"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "./common/header";
import Footer from "./common/footer";
import Agri from "./common/AgrishowSection";
import Product from "./common/product";
import {
  CircleChevronLeft,
  CircleChevronRight,
  ShoppingCart,
  Star,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Banners gộp hero + nhỏ
const banners = ["/banner/banner_1.jpg", "/banner/banner_2.jpg", "/banner/banner_3.jpg"];

const sideSmallBanners = [
  "/banner/small_1.jpg",
  "/banner/small_2.jpg",
  "/banner/small_3.jpg",
];

export default function Home() {
  const [currentBanner, setCurrentBanner] = useState(0);

  const prevBanner = () =>
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  const nextBanner = () => setCurrentBanner((prev) => (prev + 1) % banners.length);

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <Header />

      {/* HERO BANNER + RIGHT COLUMN */}
      <div className="container mx-auto px-5 py-8 mt-30 pb-0 grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* MAIN BANNER (3 cột) */}
        <div className="col-span-3 relative w-full h-[200px] sm:h-[280px] lg:h-[400px] rounded-sm overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBanner}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.6 }}
              className="absolute w-full h-full"
            >
              <Image
                src={banners[currentBanner]}
                alt={`Banner ${currentBanner + 1}`}
                fill
                className="object-cover rounded-sm"
                priority
              />
            </motion.div>
          </AnimatePresence>

          {/* BUTTONS */}
          <button
            onClick={prevBanner}
            className="absolute left-2 sm:left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white w-8 sm:w-10 h-8 sm:h-10 rounded-full shadow flex items-center justify-center z-10"
          >
            <CircleChevronLeft size={20} className="text-gray-700" />
          </button>

          <button
            onClick={nextBanner}
            className="absolute right-2 sm:right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white w-8 sm:w-10 h-8 sm:h-10 rounded-full shadow flex items-center justify-center z-10"
          >
            <CircleChevronRight size={20} className="text-gray-700" />
          </button>

          {/* DOTS */}
          <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {banners.map((_, i) => (
              <div
                key={i}
                className={`h-1 sm:h-1.5 rounded-full transition-all ${
                  i === currentBanner ? "bg-white w-6 sm:w-6" : "bg-white/40 w-2 sm:w-2"
                }`}
              />
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN (TIN NỔI BẬT + SMALL BANNERS) */}
        <div className=" col-span-1 space-y-3">
          {/* TITLE BLOCK */}
          

          {/* SMALL BANNER TOP */}
<div className="relative h-[120px] mb-4.5 rounded-xs overflow-hidden shadow flex">
  <div className="absolute bg-[#0a923c] px-2 py-1 text-white font-semibold text-sm rounded-br-md z-20">
TIN NỔI BẬT
</div>
{/* LEFT IMAGE */}
<div className=" flex items-center pl-2 pt-6 w-2/5 h-full">
<img src="/banner/banner_1.jpg" alt="banner nhỏ" className=" w-full h-[80%] object-cover" />
</div>


{/* RIGHT CONTENT */}
<div className=" flex items-center w-3/5 p-2 relative bg-white">
{/* TITLE TAG */}



{/* TEXT */}
<a href="" className="text-sm text-gray-700">
  Tuyển sỉ quà Tết 2026 cùng AU
</a>


</div>
</div>

          {/* TWO SMALL BANNERS BELOW */}
          <div className="grid grid-cols-1 gap-4">
            {sideSmallBanners.slice(1).map((img, idx) => (
              <div
                key={idx}
                className="relative h-[120px] rounded-xs overflow-hidden shadow"
              >
                <img src="/banner/banner_1.jpg" alt="" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PRODUCT SECTION */}
      <Product />

      {/* AGRISHOW SECTION */}
      <Agri />

      {/* FOOTER */}
      <Footer />
    </div>
  );
}