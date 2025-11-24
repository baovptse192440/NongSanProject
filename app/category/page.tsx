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
  ChevronDown,
} from "lucide-react";

export default function CategoryPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20; // 4 cột * 5 hàng
  const [showSort, setShowSort] = useState(false);
const [showFilter, setShowFilter] = useState(false);

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
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.35 }}
  className="w-full sm:w-[200px] md:w-[220px] lg:w-[220px]"
>

           <div className="bg-white gap-2 rounded-xs shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 group cursor-pointer flex flex-col h-full
  w-full sm:w-[180px] md:w-[200px] lg:w-[220px]"
>
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
                  <div className="flex items-center gap-0">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={i < Math.floor(product.rating) ? "fill-yellow-400 text-white" : "fill-yellow-400 text-white"}
                      />
                    ))}
                    <span className="text-xs text-[#0a923c] ml-1">({product.reviews})</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <TrendingUp className="w-4 h-4 text-green-600" strokeWidth={1} />
                    <span>{product.sold} đã bán</span>
                  </div>
                </div>
      
                <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                  <div className="w-[50%]">
                  <p className="text-green-700 font-semibold text-lg mb-1">
  {product.price.toLocaleString()} đ
</p>

                 <p className="line-through decoration-1 decoration-gray-400 text-gray-400 text-sm">
  {product.oldPrice.toLocaleString()} đ
</p>


                 
                    </div>
                    <div className="flex items-center justify-end w-[50%] ">
                       <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center w-[50%] border rounded-sm cursor-pointer text-green-600 py-2  hover:bg-[#0A923C] hover:text-white text-sm font-semibold transition-all shadow-sm"
                >
                  <ShoppingCart size={20} strokeWidth={2} />
                 
                </motion.button>
                    </div>
                </div>
      
                
              </div>
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
{/* Filter button mobile */}
<div className="lg:hidden px-4 mt-4">
  <button
    className="w-full bg-[#0a923c] text-white py-2 rounded-md font-semibold shadow"
  >
    Bộ lọc sản phẩm
  </button>
</div>

      <div className="block pt-18  md:pt-[150px] container mx-auto px-2 md:px-4 py-6 md:flex gap-6">


      {/* ============ SIDEBAR ============ */}
      <div className="flex mb-2 justify-between items-center bg-white p-3 rounded-xs shadow-md sm:hidden">
  {/* Sort Dropdown */}
  <div className="relative">
    <button
      className="flex items-center gap-1 font-medium text-gray-700"
      onClick={() => setShowSort(!showSort)
        
      }
    >
      Mới nhất
      <ChevronDown className="w-4 h-4" />
    </button>
    {showSort && (
      <div className="absolute left-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-10">
        <ul className="text-sm text-gray-700">
          <li className="px-3 py-2 hover:bg-gray-100 cursor-pointer">Mới nhất</li>
          <li className="px-3 py-2 hover:bg-gray-100 cursor-pointer">Bán chạy</li>
          <li className="px-3 py-2 hover:bg-gray-100 cursor-pointer">Giá tăng dần</li>
          <li className="px-3 py-2 hover:bg-gray-100 cursor-pointer">Giá giảm dần</li>
        </ul>
      </div>
    )}
  </div>

  {/* Filter Dropdown */}
  <div className="relative">
    <button
      className="flex items-center gap-1 font-medium text-gray-700"
      onClick={() => setShowFilter(!showFilter)}
    >
      Bộ lọc
      <Filter className="w-4 h-4" />
    </button>
    {showFilter && (
      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-10">
        <ul className="text-sm text-gray-700">
          <li className="px-3 py-2 hover:bg-gray-100 cursor-pointer">Danh mục</li>
          <li className="px-3 py-2 hover:bg-gray-100 cursor-pointer">Thương hiệu</li>
          <li className="px-3 py-2 hover:bg-gray-100 cursor-pointer">Giá cả</li>
          <li className="px-3 py-2 hover:bg-gray-100 cursor-pointer">Đánh giá</li>
        </ul>
      </div>
    )}
  </div>
</div>

      <div className="flex gap-8 flex-col ">
        <aside className="w-[280px] hidden lg:block  top-[150px] self-start bg-white rounded-sm shadow-md border border-gray-200 ">

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
    <div className="py-1.5 cursor-pointer hover:bg-gray-50 px-2 rounded">
      <p className="font-semibold text-[15px] text-gray-800">Trái cây tươi ngon</p>
    </div>

    <hr className="border-gray-200 my-3" />

    {/* ======= GROUP 3 ======= */}
    <div className="py-1.5 cursor-pointer hover:bg-gray-50 px-2 rounded">
      <p className="font-semibold text-[15px] text-gray-800">Đặc sản vùng miền</p>
    </div>

    <hr className="border-gray-200 my-3" />

    {/* ======= GROUP 4 ======= */}
    <div className="py-1.5 cursor-pointer hover:bg-gray-50 px-2 rounded">
      <p className="font-semibold text-[15px] text-gray-800">Trà – Cà phê – Socola</p>
    </div>

    <hr className="border-gray-200 my-3" />

    {/* ======= GROUP 5 ======= */}
    <div className="py-1.5 cursor-pointer hover:bg-gray-50 px-2 rounded">
      <p className="font-semibold text-[15px] text-gray-800">Đồ uống có cồn</p>
    </div>

    <hr className="border-gray-200 my-3" />

    {/* ======= GROUP 6 ======= */}
    <div className="py-1.5 cursor-pointer hover:bg-gray-50 px-2 rounded">
      <p className="font-semibold text-[15px] text-gray-800">Đồ sấy – Ăn vặt</p>
    </div>

    <hr className="border-gray-200 my-3" />

    {/* ======= GROUP 7 ======= */}
    <div className="py-1.5 cursor-pointer hover:bg-gray-50 px-2 rounded">
      <p className="font-semibold text-[15px] text-gray-800">Đồ uống</p>
    </div>

  </div>
</aside>

 <aside className="w-[280px] hidden lg:block  top-[150px] self-start bg-white rounded-sm shadow-md border border-gray-200 ">

  {/* HEADER */}
 <div className="bg-[#0a923c] text-white text-center font-semibold text-lg py-3 rounded-t-sm">
    Những thương hiệu uy tín
  </div>

  <div className="flex w-full flex-wrap mt-5 p-2 ">
  <div className="w-1/3 p-1">
    <a href="">
      <img className="w-full h-auto" src="/sp/1.jpg" alt="" />
    </a>
  </div>

  <div className="w-1/3 p-1">
    <a href="">
      <img className="w-full h-auto" src="/sp/1.jpg" alt="" />
    </a>
  </div>

  <div className="w-1/3 p-1">
    <a href="">
      <img className="w-full h-auto" src="/sp/1.jpg" alt="" />
    </a>
  </div>

  <div className="w-1/3 p-1">
    <a href="">
      <img className="w-full h-auto" src="/sp/1.jpg" alt="" />
    </a>
  </div>

  <div className="w-1/3 p-1">
    <a href="">
      <img className="w-full h-auto" src="/sp/1.jpg" alt="" />
    </a>
  </div>

  <div className="w-1/3 p-1">
    <a href="">
      <img className="w-full h-auto" src="/sp/1.jpg" alt="" />
    </a>
  </div>
  <div className="w-1/3 p-1">
    <a href="">
      <img className="w-full h-auto" src="/sp/1.jpg" alt="" />
    </a>
  </div>
  <div className="w-1/3 p-1">
    <a href="">
      <img className="w-full h-auto" src="/sp/1.jpg" alt="" />
    </a>
  </div>
  <div className="w-1/3 p-1">
    <a href="">
      <img className="w-full h-auto" src="/sp/1.jpg" alt="" />
    </a>
  </div>
  <div className="w-1/3 p-1">
    <a href="">
      <img className="w-full h-auto" src="/sp/1.jpg" alt="" />
    </a>
  </div>
  <div className="w-1/3 p-1">
    <a href="">
      <img className="w-full h-auto" src="/sp/1.jpg" alt="" />
    </a>
  </div>
  <div className="w-1/3 p-1">
    <a href="">
      <img className="w-full h-auto" src="/sp/1.jpg" alt="" />
    </a>
  </div>
  <div className="w-1/3 p-1">
    <a href="">
      <img className="w-full h-auto" src="/sp/1.jpg" alt="" />
    </a>
  </div>
  <div className="w-1/3 p-1">
    <a href="">
      <img className="w-full h-auto" src="/sp/1.jpg" alt="" />
    </a>
  </div>
  <div className="w-1/3 p-1">
    <a href="">
      <img className="w-full h-auto" src="/sp/1.jpg" alt="" />
    </a>
  </div>
  <div className="w-1/3 p-1">
    <a href="">
      <img className="w-full h-auto" src="/sp/1.jpg" alt="" />
    </a>
  </div>
  <div className="w-1/3 p-1">
    <a href="">
      <img className="w-full h-auto" src="/sp/1.jpg" alt="" />
    </a>
  </div>
  <div className="w-1/3 p-1">
    <a href="">
      <img className="w-full h-auto" src="/sp/1.jpg" alt="" />
    </a>
  </div>

</div>


</aside>
      </div>



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
      ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
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
              className="hover:cursor-pointer  px-3 py-2 border rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage === 1}
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`hover:cursor-pointer px-4 py-2 border rounded-lg text-sm font-semibold transition-colors ${
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
              className="hover:cursor-pointer  px-3 py-2 border rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
