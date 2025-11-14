"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CircleChevronLeft, CircleChevronRight, ShoppingCart, Star, TrendingUp, Sparkles } from "lucide-react";

export default function ProductSection() {
  const [activeTab, setActiveTab] = useState("new");

  const products = [
    {
      id: 1,
      img: "/sp/1.jpg",
      name: "Cam Nam Phi - Nông Sản Fruits",
      sold: 707,
      price: "78,000 ₫",
      oldPrice: "200,000 ₫",
      discount: "-61%",
      rating: 4.5,
      reviews: 24,
    },
    {
      id: 2,
      img: "/sp/2.jpg",
      name: "Kẹo Dynamite BigBang Vị Socola Bạc Hà - Gói 120g",
      sold: 999,
      price: "60,000 ₫",
      oldPrice: "100,000 ₫",
      discount: "-40%",
      rating: 4.8,
      reviews: 156,
    },
    {
      id: 3,
      img: "/sp/3.jpg",
      name: "Thùng 24 Ly Trà Sữa (12 Oolong Nướng)",
      sold: 658,
      price: "310,000 ₫",
      oldPrice: "360,000 ₫",
      discount: "-14%",
      rating: 4.6,
      reviews: 89,
    },
    {
      id: 4,
      img: "/sp/4.jpg",
      name: "Cà Phê Cappuccino Sữa Dừa Hoà Tan - UFO Coffee",
      sold: 707,
      price: "259,000 ₫",
      oldPrice: "400,000 ₫",
      discount: "-35%",
      rating: 4.9,
      reviews: 203,
    },
    {
      id: 5,
      img: "/sp/5.jpg",
      name: "Cà Phê Cappuccino Sữa Dừa [Đà Nẵng] - UFO Coffee",
      sold: 60,
      price: "55,000 ₫",
      oldPrice: "90,000 ₫",
      discount: "-39%",
      rating: 4.7,
      reviews: 45,
    },
    {
      id: 6,
      img: "/sp/1.jpg",
      name: "Mật Ong Rừng U Minh Hạ - Chai 500ml",
      sold: 450,
      price: "180,000 ₫",
      oldPrice: "250,000 ₫",
      discount: "-28%",
      rating: 4.8,
      reviews: 112,
    },
  ];

  const ProductCard = ({ product }: { product: typeof products[0] }) => (
    <Link href={`/product/${product.id}`}>
      <div
        className="min-w-[240px] bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-200 group cursor-pointer"
      >
        <div className="relative w-full h-[180px] overflow-hidden bg-gray-50">
          <Image
            src={product.img}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-0.5 rounded text-[10px] font-semibold border border-white">
            {product.discount}
          </div>
        </div>

        <div className="p-4 space-y-2.5">
          <h3 className="font-medium text-base text-gray-900 line-clamp-2 min-h-[40px] group-hover:text-green-700 transition-colors leading-snug">
            {product.name}
          </h3>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={13}
                className={i < Math.floor(product.rating) ? "fill-current" : ""}
                strokeWidth={1}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400">({product.reviews})</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <TrendingUp className="w-4 h-4 text-green-600" strokeWidth={1} />
          <span>{product.sold} đã bán</span>
        </div>

        {/* PRICE */}
        <div className="pt-2 border-t border-gray-200">
          <p className="text-green-700 font-semibold text-lg mb-1">{product.price}</p>
          <p className="line-through text-gray-400 text-sm">{product.oldPrice}</p>
        </div>

        {/* CART BUTTON */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors border border-green-700 shadow-sm"
        >
          <ShoppingCart size={16} strokeWidth={1} />
          <span>Thêm vào giỏ</span>
        </button>
      </div>
    </div>
    </Link>
  );

  return (
    <div className="container mx-auto px-5 py-10">
      {/* TAB SECTION */}
      <div className="flex bg-white rounded-xl shadow-md overflow-hidden mb-5 border border-gray-200">
        <button
          onClick={() => setActiveTab("new")}
          className={`flex-1 px-5 py-3 text-sm font-semibold transition-colors border-r border-gray-200 ${
            activeTab === "new"
              ? "bg-green-600 text-white border-green-700"
              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" strokeWidth={1} />
            <span>SẢN PHẨM MỚI</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab("bestseller")}
          className={`flex-1 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === "bestseller"
              ? "bg-green-600 text-white"
              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <TrendingUp className="w-4 h-4" strokeWidth={1} />
            <span>BÁN CHẠY</span>
          </div>
        </button>
      </div>

      {/* CONTENT BOX */}
      <div className="bg-white rounded-xl shadow-md p-5 relative border border-gray-200">
        {/* BTN LEFT */}
        <button className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg hover:shadow-xl flex justify-center items-center z-10 hover:bg-gray-50 transition-all duration-200 group border border-gray-200">
          <CircleChevronLeft className="text-gray-600 group-hover:text-green-600" size={20} strokeWidth={1} />
        </button>

        {/* PRODUCT LIST */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 scroll-smooth">
          {products.map((p, i) => (
            <ProductCard key={i} product={p} />
          ))}
        </div>

        {/* BTN RIGHT */}
        <button className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg hover:shadow-xl flex justify-center items-center z-10 hover:bg-gray-50 transition-all duration-200 group border border-gray-200">
          <CircleChevronRight className="text-gray-600 group-hover:text-green-600" size={20} strokeWidth={1} />
        </button>
      </div>

      {/* SECTION 2 — SẢN PHẨM ĐẶC SẢN */}
      <div className="mt-10">
        <div className="flex bg-white rounded-xl shadow-md overflow-hidden mb-5 border border-gray-200">
          <button
            onClick={() => setActiveTab("special")}
            className={`flex-1 px-5 py-3 text-sm font-semibold transition-colors ${
              activeTab === "special"
                ? "bg-green-600 text-white border-green-700"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" strokeWidth={1} />
              <span>ĐẶC SẢN</span>
            </div>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5 relative border border-gray-200">
          <button className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg hover:shadow-xl flex justify-center items-center z-10 hover:bg-gray-50 transition-all duration-200 group border border-gray-200">
            <CircleChevronLeft className="text-gray-600 group-hover:text-green-600" size={20} strokeWidth={1} />
          </button>

          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 scroll-smooth">
            {products.slice(0, 5).map((p, i) => (
              <ProductCard key={i} product={p} />
            ))}
          </div>

          <button className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg hover:shadow-xl flex justify-center items-center z-10 hover:bg-gray-50 transition-all duration-200 group border border-gray-200">
            <CircleChevronRight className="text-gray-600 group-hover:text-green-600" size={20} strokeWidth={1} />
          </button>
        </div>
      </div>
    </div>
  );
}
