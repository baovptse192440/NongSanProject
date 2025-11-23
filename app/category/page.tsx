"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import Header from "../common/header";
import Footer from "../common/footer";
import Agrishow from "../common/AgrishowSection";

import {
  Filter,
  X,
  Star,
  ShoppingCart,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  List,
} from "lucide-react";

export default function CategoryPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20; // 4 cột * 5 hàng

  // DUMMY DATA  
  const categories = [
    { id: "fruit", name: "Trái cây", count: 125 },
    { id: "vegetable", name: "Rau củ", count: 89 },
    { id: "coffee", name: "Cà phê", count: 45 },
    { id: "tea", name: "Trà", count: 67 },
    { id: "honey", name: "Mật ong", count: 23 },
    { id: "special", name: "Đặc sản", count: 112 },
  ];

  const brands = [
    { id: "au", name: "AU Nông Sản", count: 89 },
    { id: "fruits", name: "Fruits", count: 67 },
    { id: "ufo", name: "UFO Coffee", count: 45 },
  ];

  const products = Array.from({ length: 60 }, (_, i) => ({
    id: i + 1,
    img: `/sp/${(i % 5) + 1}.jpg`,
    name: `Sản phẩm mẫu ${i + 1}`,
    sold: Math.floor(Math.random() * 1000),
    price: Math.floor(Math.random() * 500000) + 20000,
    oldPrice: Math.floor(Math.random() * 500000) + 50000,
    discount: Math.floor(Math.random() * 50) + 10,
    rating: Math.floor(Math.random() * 5) + 1,
    reviews: Math.floor(Math.random() * 200),
  }));

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const ProductCard = ({ product }: { product: typeof products[0] }) => (
    <Link href={`/product/${product.id}`}>
      <motion.div
  whileHover={{ scale: 1.03 }}
  className={`
    bg-white rounded-xs shadow-md hover:shadow-xl transition-all duration-300 
    overflow-hidden border border-gray-200 group cursor-pointer
    ${viewMode === "grid" ? "flex flex-col h-full" : "flex"}
  `}
>
  {/* IMAGE WRAPPER */}
  <div
    className={`
      relative overflow-hidden bg-gray-50 
      ${viewMode === "grid" ? "w-full h-[200px]" : "w-[500px] h-full"}
    `}
  >
    <Image
      src={product.img || "/no-image.png"}   // đảm bảo luôn có ảnh
      alt={product.name}
      fill
      sizes="100vw"                          // BẮT BUỘC khi dùng fill
      className="object-cover group-hover:scale-105 transition-transform duration-300"
    />

    {/* DISCOUNT LABEL */}
    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold border border-white shadow-sm">
      -{product.discount}%
    </div>
  </div>

  {/* BODY */}
  <div className="p-4 flex-1 flex flex-col justify-between">
    <div>
      <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-[#0a923c] transition-colors">
        {product.name}
      </h3>

      {/* RATING */}
      <div className="flex items-center gap-2 mt-1">
        <div className="flex items-center text-yellow-400">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={13}
              className={i < product.rating ? "fill-current" : ""}
              strokeWidth={1}
            />
          ))}
        </div>
        <span className="text-xs text-gray-400">({product.reviews})</span>
      </div>

      {/* SOLD */}
      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
        <TrendingUp className="w-4 h-4 text-[#0a923c]" strokeWidth={1} />
        <span>{product.sold} đã bán</span>
      </div>
    </div>

    {/* PRICE */}
    <div className="pt-2 border-t border-gray-200">
      <p className="text-[#0a923c] font-semibold text-lg mb-1">
        {formatPrice(product.price)}
      </p>
      <p className="line-through text-gray-400 text-sm">
        {formatPrice(product.oldPrice)}
      </p>
    </div>

    {/* BUTTON */}
    <button className="mt-2 cursor-pointer w-full bg-[#0a923c] hover:bg-[#0d7a33] text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors border border-[#0d7a33] shadow-sm">
      <ShoppingCart size={16} strokeWidth={1} />
      Thêm vào giỏ
    </button>
  </div>
</motion.div>

    </Link>
  );

  // Pagination
  const totalPages = Math.ceil(products.length / productsPerPage);
  const displayedProducts = products.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <Header />

      <div className="pt-[150px] container mx-auto px-4 py-6 flex gap-6">

      {/* ============ SIDEBAR ============ */}
<aside className="w-[260px] hidden lg:block  top-[150px] self-start bg-white rounded-sm shadow-md border border-gray-200 ">

  {/* HEADER */}
  <div className="bg-[#0a923c] text-white text-center font-semibold text-lg py-3 rounded-t-sm">
    TẤT CẢ SẢN PHẨM
  </div>

  <div className="p-5">

    {/* ======= GROUP 1 ======= */}
    <div className="mb-5">
      <h3 className="font-semibold text-[15px] text-gray-800">Đi chợ online</h3>

      <div className="mt-3">
        <p className="text-[#0a923c] font-semibold text-sm mb-2">Nhu yếu phẩm</p>

        <ul className="ml-3 space-y-2 text-[13px] text-gray-600">
          <li>Gạo – Mì – Cháo – Miến – Phở</li>
          <li>Gia vị – Mật – Đồ ăn kèm</li>
          <li>Hạt – Bơ – Sữa – Trứng – Bột</li>
        </ul>
      </div>
    </div>

    <hr className="border-gray-200 my-3" />

    {/* ======= GROUP 2 ======= */}
    <div className="py-3 cursor-pointer hover:bg-gray-50 px-2 rounded">
      <p className="font-semibold text-[15px] text-gray-800">Trái cây tươi ngon</p>
    </div>

    <hr className="border-gray-200 my-3" />

    {/* ======= GROUP 3 ======= */}
    <div className="py-3 cursor-pointer hover:bg-gray-50 px-2 rounded">
      <p className="font-semibold text-[15px] text-gray-800">Đặc sản vùng miền</p>
    </div>

    <hr className="border-gray-200 my-3" />

    {/* ======= GROUP 4 ======= */}
    <div className="py-3 cursor-pointer hover:bg-gray-50 px-2 rounded">
      <p className="font-semibold text-[15px] text-gray-800">Trà – Cà phê – Socola</p>
    </div>

    <hr className="border-gray-200 my-3" />

    {/* ======= GROUP 5 ======= */}
    <div className="py-3 cursor-pointer hover:bg-gray-50 px-2 rounded">
      <p className="font-semibold text-[15px] text-gray-800">Đồ uống có cồn</p>
    </div>

    <hr className="border-gray-200 my-3" />

    {/* ======= GROUP 6 ======= */}
    <div className="py-3 cursor-pointer hover:bg-gray-50 px-2 rounded">
      <p className="font-semibold text-[15px] text-gray-800">Đồ sấy – Ăn vặt</p>
    </div>

    <hr className="border-gray-200 my-3" />

    {/* ======= GROUP 7 ======= */}
    <div className="py-3 cursor-pointer hover:bg-gray-50 px-2 rounded">
      <p className="font-semibold text-[15px] text-gray-800">Đồ uống</p>
    </div>

  </div>
</aside>


        {/* ============ MAIN CONTENT ============ */}
        <div className="flex-1">

          {/* ============ NAVBAR LỌC + SEARCH ============ */}
          <div className="top-[150px] z-40 bg-white rounded-sm  shadow-md p-4 mb-5 flex flex-wrap items-center justify-between gap-4">

            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="shadow-md rounded-lg px-4 py-2 w-[260px] focus:outline-[#0a923c]"
            />

            <select className="shadow-md rounded-lg px-3 py-2">
              <option value="">Danh mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select className="shadow-md rounded-lg px-3 py-2">
              <option value="">Thương hiệu</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>

            <select className="shadow-md rounded-lg px-3 py-2">
              <option value="">Sắp xếp</option>
              <option value="priceAsc">Giá tăng dần</option>
              <option value="priceDesc">Giá giảm dần</option>
              <option value="bestSeller">Bán chạy</option>
              <option value="rating">Đánh giá cao</option>
            </select>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg border ${
                  viewMode === "grid" ? "bg-[#0a923c] text-white border-[#0a923c]" : "border-gray-300"
                }`}
              >
                <Grid3x3 size={18} />
              </button>

              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg border ${
                  viewMode === "list" ? "bg-[#0a923c] text-white border-[#0a923c]" : "border-gray-300"
                }`}
              >
                <List size={18} />
              </button>
            </div>

            <span className="text-sm text-gray-600">{products.length} sản phẩm</span>
          </div>

          {/* ============ GRID ============ */}
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2"
                : "flex flex-col gap-4"
            }
          >
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* ============ PAGINATION ============ */}
          <div className="flex justify-center mt-8 mb-12 gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-2 border rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage === 1}
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 border rounded-lg text-sm font-semibold transition-colors ${
                  currentPage === i + 1
                    ? "bg-[#0a923c] text-white border-[#0a923c]"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="px-3 py-2 border rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={18} />
            </button>
          </div>

        </div>
      </div>

      <Agrishow />
      <Footer />
    </div>
  );
}
