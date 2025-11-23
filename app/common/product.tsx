"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { CircleChevronLeft, CircleChevronRight, ShoppingCart, Star, TrendingUp, Sparkles, Store, ChevronRight } from "lucide-react";

export default function ProductSection() {
  const [activeTab, setActiveTab] = useState("new");
  const products = [
    { id: 1, img: "/sp/1.jpg", name: "Cam Nam Phi - Nông Sản Fruits", sold: 707, price: "78,000 ₫", oldPrice: "200,000 ₫", discount: "-61%", rating: 4.5, reviews: 24 },
    { id: 2, img: "/sp/2.jpg", name: "Kẹo Dynamite BigBang Vị Socola Bạc Hà - Gói 120g", sold: 999, price: "60,000 ₫", oldPrice: "100,000 ₫", discount: "-40%", rating: 4.8, reviews: 156 },
    { id: 3, img: "/sp/3.jpg", name: "Thùng 24 Ly Trà Sữa (12 Oolong Nướng)", sold: 658, price: "310,000 ₫", oldPrice: "360,000 ₫", discount: "-14%", rating: 4.6, reviews: 89 },
    { id: 4, img: "/sp/4.jpg", name: "Cà Phê Cappuccino Sữa Dừa Hoà Tan - UFO Coffee", sold: 707, price: "259,000 ₫", oldPrice: "400,000 ₫", discount: "-35%", rating: 4.9, reviews: 203 },
    { id: 5, img: "/sp/5.jpg", name: "Cà Phê Cappuccino Sữa Dừa [Đà Nẵng] - UFO Coffee", sold: 60, price: "55,000 ₫", oldPrice: "90,000 ₫", discount: "-39%", rating: 4.7, reviews: 45 },
    { id: 6, img: "/sp/5.jpg", name: "Mật Ong Rừng U Minh Hạ - Chai 500ml", sold: 450, price: "180,000 ₫", oldPrice: "250,000 ₫", discount: "-28%", rating: 4.8, reviews: 112 },
  ];

 const carouselRef = useRef<HTMLDivElement>(null);

const scroll = (direction: "left" | "right") => {
  if (carouselRef.current) {
    const scrollAmount = direction === "left" ? -260 : 260;
    carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  }
};


  const ProductCard = ({ product }: { product: typeof products[0] }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex-shrink-0 w-[180px] sm:w-[200px] md:w-[220px] lg:w-[240px]"
    >
      <div className="bg-white rounded-xs shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 group cursor-pointer flex flex-col h-full">
        <div className="relative w-full h-[150px] sm:h-[180px] overflow-hidden bg-gray-50">
          <Image
            src={product.img}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-all duration-500"
          />
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-0.5 rounded text-[10px] font-semibold border border-white">
            {product.discount}
          </div>
        </div>

        <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between">
          <h3 className="font-medium text-[13px] sm:text-[15px] text-gray-900 line-clamp-2 min-h-[38px] group-hover:text-green-700 transition-colors">
            {product.name}
          </h3>

          <div className="mt-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={i < Math.floor(product.rating) ? "fill-yellow-400" : "text-gray-300"}
                />
              ))}
              <span className="text-xs text-gray-400 ml-1">({product.reviews})</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <TrendingUp className="w-4 h-4 text-green-600" strokeWidth={1} />
              <span>{product.sold} đã bán</span>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-200 mt-2">
            <p className="text-green-700 font-semibold text-lg mb-1">{product.price}</p>
            <p className="line-through text-gray-400 text-sm">{product.oldPrice}</p>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            className="mt-3 w-full cursor-pointer text-green-600 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <ShoppingCart size={16} strokeWidth={1} />
           
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="container mx-auto px-5 py-10">
      {/* PRODUCT CAROUSEL */}
      <div className="relative bg-white rounded-xs shadow-md p-3 sm:p-5 border border-gray-200">
         <div className="absolute left-0 top-0 flex bg-white rounded-xs w-[40%]  overflow-x-auto no-scrollbar  mb-5 border-white">
        {[
          { id: "new", label: "SẢN PHẨM MỚI", icon: <Sparkles size={16} /> },
          { id: "bestseller", label: "BÁN CHẠY", icon: <TrendingUp size={16} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-5 py-3 text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-[#10723a] text-white shadow-inner hover: cursor-pointer"
                : "bg-gray-50 text-[#10723a] hover:bg-[#10723a] hover:text-white cursor-pointer"
            }`}
          >
            <div className="flex items-center justify-center gap-2">{tab.icon}{tab.label}</div>
          </button>
        ))}
      </div>
        <button
          onClick={() => scroll("left")}
          className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center z-10"
        >
          <CircleChevronLeft size={20} className="text-gray-500 hover:text-green-600 transition-colors" />
        </button>

        <div
          ref={carouselRef}
          className="flex gap-2 sm:gap-2 overflow-x-hidden scroll-smooth cursor-pointer no-scrollbar pt-12 pb-2 pl-2 sm:pl-0 pr-2 sm:pr-0"
        >
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        <button
          onClick={() => scroll("right")}
          className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center z-10"
        >
          <CircleChevronRight size={20} className="text-gray-500 hover:text-green-600 transition-colors" />
        </button>
      </div>
      
      

      

      {/* PRODUCT CAROUSEL */}
       <div className="relative bg-white rounded-xs mt-10 shadow-md p-3 sm:p-5 border border-gray-200">
       <div className="flex justify-between w-full border-b border-gray-200 pb-5">
        <div className="font-semibold pl-5" >
         Trái Cây Tươi Ngon
        </div>
        <div className="flex font-semibold gap-8 w-[50%]">
          <a href="">Nội địa</a>
          <a href="">Nội địa</a>
          <a href="">Nội địa</a>
        </div>
        <div className="flex font-semibold items-center">
          <a href="">Xem All</a>
          <ChevronRight  size={16}/>
        </div>
       </div>
     <div className="w-full mt-5 h-[198px] rounded-full overflow-hidden relative">
  <a href="" className="block w-full h-full rounded-full">
    <div
      className="w-full h-full bg-center bg-cover"
      style={{ backgroundImage: "url('/sp/1.jpg')" }}
    ></div>
  </a>
</div>


        <button
          onClick={() => scroll("left")}
          className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center z-10"
        >
          <CircleChevronLeft size={25} className="text-gray-500 hover:text-green-600 transition-colors" />
        </button>

        <div
          ref={carouselRef}
          className="flex gap-2 sm:gap-2 overflow-x-hidden scroll-smooth cursor-pointer no-scrollbar pt-5 pb-2 pl-2 sm:pl-0 pr-2 sm:pr-0"
        >
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
         <div
          ref={carouselRef}
          className="flex gap-2 sm:gap-2 overflow-x-hidden scroll-smooth cursor-pointer no-scrollbar pt-5 pb-2 pl-2 sm:pl-0 pr-2 sm:pr-0"
        >
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
        
        <button
          onClick={() => scroll("right")}
          className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center z-10"
        >
          <CircleChevronRight size={25} className="text-gray-500 hover:text-green-600 transition-colors" />
        </button>
      </div>
       {/* PRODUCT CAROUSEL */}
         <div className="relative bg-white rounded-xs mt-10 shadow-md p-3 sm:p-5 border border-gray-200">
       <div className="flex justify-between w-full border-b border-gray-200 pb-5">
        <div className="font-semibold pl-5" >
         Trái Cây Tươi Ngon
        </div>
        <div className="flex font-semibold gap-8 w-[50%]">
          <a href="">Nội địa</a>
          <a href="">Nội địa</a>
          <a href="">Nội địa</a>
        </div>
        <div className="flex font-semibold items-center">
          <a href="">Xem All</a>
          <ChevronRight  size={16}/>
        </div>
       </div>
     <div className="w-full mt-5 h-[198px] rounded-full overflow-hidden relative">
  <a href="" className="block w-full h-full rounded-full">
    <div
      className="w-full h-full bg-center bg-cover"
      style={{ backgroundImage: "url('/sp/1.jpg')" }}
    ></div>
  </a>
</div>


        <button
          onClick={() => scroll("left")}
          className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center z-10"
        >
          <CircleChevronLeft size={25} className="text-gray-500 hover:text-green-600 transition-colors" />
        </button>

        <div
          ref={carouselRef}
          className="flex gap-2 sm:gap-2 overflow-x-hidden scroll-smooth cursor-pointer no-scrollbar pt-5 pb-2 pl-2 sm:pl-0 pr-2 sm:pr-0"
        >
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
         <div
          ref={carouselRef}
          className="flex gap-2 sm:gap-2 overflow-x-hidden scroll-smooth cursor-pointer no-scrollbar pt-5 pb-2 pl-2 sm:pl-0 pr-2 sm:pr-0"
        >
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
        
        <button
          onClick={() => scroll("right")}
          className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center z-10"
        >
          <CircleChevronRight size={25} className="text-gray-500 hover:text-green-600 transition-colors" />
        </button>
      </div>
       {/* PRODUCT CAROUSEL */}
   <div className="relative bg-white rounded-xs mt-10 shadow-md p-3 sm:p-5 border border-gray-200">
       <div className="flex justify-between w-full border-b border-gray-200 pb-5">
        <div className="font-semibold pl-5" >
         Trái Cây Tươi Ngon
        </div>
        <div className="flex font-semibold gap-8 w-[50%]">
          <a href="">Nội địa</a>
          <a href="">Nội địa</a>
          <a href="">Nội địa</a>
        </div>
        <div className="flex font-semibold items-center">
          <a href="">Xem All</a>
          <ChevronRight  size={16}/>
        </div>
       </div>
     <div className="w-full mt-5 h-[198px] rounded-full overflow-hidden relative">
  <a href="" className="block w-full h-full rounded-full">
    <div
      className="w-full h-full bg-center bg-cover"
      style={{ backgroundImage: "url('/sp/1.jpg')" }}
    ></div>
  </a>
</div>


        <button
          onClick={() => scroll("left")}
          className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center z-10"
        >
          <CircleChevronLeft size={25} className="text-gray-500 hover:text-green-600 transition-colors" />
        </button>

        <div
          ref={carouselRef}
          className="flex gap-2 sm:gap-2 overflow-x-hidden scroll-smooth cursor-pointer no-scrollbar pt-5 pb-2 pl-2 sm:pl-0 pr-2 sm:pr-0"
        >
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
         <div
          ref={carouselRef}
          className="flex gap-2 sm:gap-2 overflow-x-hidden scroll-smooth cursor-pointer no-scrollbar pt-5 pb-2 pl-2 sm:pl-0 pr-2 sm:pr-0"
        >
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
        
        <button
          onClick={() => scroll("right")}
          className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center z-10"
        >
          <CircleChevronRight size={25} className="text-gray-500 hover:text-green-600 transition-colors" />
        </button>
      </div>
    </div>
    
  );
}
