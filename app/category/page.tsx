"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "../common/header";
import Footer from "../common/footer";
import { 
  Filter, X, Star, ShoppingCart, TrendingUp, 
  ChevronDown, ChevronUp, SlidersHorizontal,
  Grid3x3, List, ChevronLeft, ChevronRight
} from "lucide-react";

export default function CategoryPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("default");
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    price: true,
    category: true,
    rating: true,
    brand: true,
  });

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

  const products = [
    {
      id: 1,
      img: "/sp/1.jpg",
      name: "Cam Nam Phi - Nông Sản Fruits",
      sold: 707,
      price: 78000,
      oldPrice: 200000,
      discount: 61,
      rating: 4.5,
      reviews: 24,
      category: "fruit",
      brand: "fruits",
    },
    {
      id: 2,
      img: "/sp/2.jpg",
      name: "Kẹo Dynamite BigBang Vị Socola Bạc Hà - Gói 120g",
      sold: 999,
      price: 60000,
      oldPrice: 100000,
      discount: 40,
      rating: 4.8,
      reviews: 156,
      category: "special",
      brand: "au",
    },
    {
      id: 3,
      img: "/sp/3.jpg",
      name: "Thùng 24 Ly Trà Sữa (12 Oolong Nướng)",
      sold: 658,
      price: 310000,
      oldPrice: 360000,
      discount: 14,
      rating: 4.6,
      reviews: 89,
      category: "tea",
      brand: "au",
    },
    {
      id: 4,
      img: "/sp/4.jpg",
      name: "Cà Phê Cappuccino Sữa Dừa Hoà Tan - UFO Coffee",
      sold: 707,
      price: 259000,
      oldPrice: 400000,
      discount: 35,
      rating: 4.9,
      reviews: 203,
      category: "coffee",
      brand: "ufo",
    },
    {
      id: 5,
      img: "/sp/5.jpg",
      name: "Cà Phê Cappuccino Sữa Dừa [Đà Nẵng] - UFO Coffee",
      sold: 60,
      price: 55000,
      oldPrice: 90000,
      discount: 39,
      rating: 4.7,
      reviews: 45,
      category: "coffee",
      brand: "ufo",
    },
    {
      id: 6,
      img: "/sp/1.jpg",
      name: "Mật Ong Rừng U Minh Hạ - Chai 500ml",
      sold: 450,
      price: 180000,
      oldPrice: 250000,
      discount: 28,
      rating: 4.8,
      reviews: 112,
      category: "honey",
      brand: "au",
    },
    {
      id: 7,
      img: "/sp/2.jpg",
      name: "Dưa Hấu Không Hạt - Nông Sản Sạch",
      sold: 320,
      price: 45000,
      oldPrice: 70000,
      discount: 36,
      rating: 4.4,
      reviews: 67,
      category: "fruit",
      brand: "fruits",
    },
    {
      id: 8,
      img: "/sp/3.jpg",
      name: "Trà Oolong Đài Loan Cao Cấp",
      sold: 189,
      price: 320000,
      oldPrice: 450000,
      discount: 29,
      rating: 4.9,
      reviews: 134,
      category: "tea",
      brand: "au",
    },
    {
      id: 9,
      img: "/sp/4.jpg",
      name: "Cà Phê Robusta Tây Nguyên",
      sold: 523,
      price: 125000,
      oldPrice: 180000,
      discount: 31,
      rating: 4.6,
      reviews: 89,
      category: "coffee",
      brand: "ufo",
    },
    {
      id: 10,
      img: "/sp/5.jpg",
      name: "Bưởi Da Xanh Ruột Hồng",
      sold: 412,
      price: 95000,
      oldPrice: 150000,
      discount: 37,
      rating: 4.7,
      reviews: 98,
      category: "fruit",
      brand: "fruits",
    },
    {
      id: 11,
      img: "/sp/1.jpg",
      name: "Mật Ong Hoa Nhãn Nguyên Chất",
      sold: 278,
      price: 220000,
      oldPrice: 300000,
      discount: 27,
      rating: 4.8,
      reviews: 156,
      category: "honey",
      brand: "au",
    },
    {
      id: 12,
      img: "/sp/2.jpg",
      name: "Trà Atiso Đà Lạt - Hộp 20 Gói",
      sold: 345,
      price: 89000,
      oldPrice: 120000,
      discount: 26,
      rating: 4.5,
      reviews: 78,
      category: "tea",
      brand: "au",
    },
  ];

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleRating = (rating: number) => {
    setSelectedRatings((prev) =>
      prev.includes(rating)
        ? prev.filter((r) => r !== rating)
        : [...prev, rating]
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const ProductCard = ({ product }: { product: typeof products[0] }) => (
    <Link href={`/product/${product.id}`}>
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-200 group cursor-pointer h-full flex flex-col">
        <div className="relative w-full h-[200px] overflow-hidden bg-gray-50">
          <Image
            src={product.img}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold border border-white shadow-sm">
            -{product.discount}%
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col space-y-2.5">
          <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 min-h-[40px] group-hover:text-[#0a923c] transition-colors leading-snug">
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
            <TrendingUp className="w-4 h-4 text-[#0a923c]" strokeWidth={1} />
            <span>{product.sold} đã bán</span>
          </div>

          {/* PRICE */}
          <div className="pt-2 border-t border-gray-200">
            <p className="text-[#0a923c] font-semibold text-lg mb-1">{formatPrice(product.price)}</p>
            <p className="line-through text-gray-400 text-sm">{formatPrice(product.oldPrice)}</p>
          </div>

          {/* CART BUTTON */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="w-full bg-[#0a923c] hover:bg-[#0d7a33] text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors border border-[#0d7a33] shadow-sm"
          >
            <ShoppingCart size={16} strokeWidth={1} />
            <span>Thêm vào giỏ</span>
          </button>
        </div>
      </div>
    </Link>
  );

  const ProductListItem = ({ product }: { product: typeof products[0] }) => (
    <Link href={`/product/${product.id}`}>
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-200 group cursor-pointer flex gap-4">
        <div className="relative w-[200px] h-[200px] flex-shrink-0 overflow-hidden bg-gray-50">
          <Image
            src={product.img}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold border border-white shadow-sm">
            -{product.discount}%
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-base text-gray-900 group-hover:text-[#0a923c] transition-colors mb-2">
              {product.name}
            </h3>

            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < Math.floor(product.rating) ? "fill-current" : ""}
                      strokeWidth={1}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-400">({product.reviews} đánh giá)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <TrendingUp className="w-4 h-4 text-[#0a923c]" strokeWidth={1} />
                <span>{product.sold} đã bán</span>
              </div>
            </div>

            <p className="text-gray-600 text-sm line-clamp-2">
              Sản phẩm chất lượng cao, đảm bảo tươi ngon, giao hàng nhanh chóng trong ngày.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <div>
              <p className="text-[#0a923c] font-semibold text-xl mb-1">{formatPrice(product.price)}</p>
              <p className="line-through text-gray-400 text-sm">{formatPrice(product.oldPrice)}</p>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="bg-[#0a923c] hover:bg-[#0d7a33] text-white px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors border border-[#0d7a33] shadow-sm"
            >
              <ShoppingCart size={16} strokeWidth={1} />
              <span>Thêm vào giỏ</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#0a923c] transition-colors font-semibold">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-semibold">Danh mục sản phẩm</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* FILTER SIDEBAR */}
          <aside
            className={`${
              isFilterOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            } fixed lg:static top-0 left-0 z-40 w-[280px] h-full lg:h-auto bg-white rounded-xl shadow-lg lg:shadow-md border border-gray-200 p-5 transition-transform duration-300 overflow-y-auto`}
          >
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <SlidersHorizontal size={20} className="text-[#0a923c]" />
                Bộ lọc
              </h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="lg:hidden p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* PRICE RANGE */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection("price")}
                className="w-full flex items-center justify-between text-base font-semibold text-gray-900 mb-3"
              >
                <span>Khoảng giá</span>
                {expandedSections.price ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
              {expandedSections.price && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Từ"
                      value={priceRange[0]}
                      onChange={(e) =>
                        setPriceRange([Number(e.target.value), priceRange[1]])
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a923c]"
                    />
                    <input
                      type="number"
                      placeholder="Đến"
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], Number(e.target.value)])
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a923c]"
                    />
                  </div>
                  <div className="flex gap-2">
                    {[
                      { label: "Dưới 100k", range: [0, 100000] },
                      { label: "100k - 300k", range: [100000, 300000] },
                      { label: "300k - 500k", range: [300000, 500000] },
                      { label: "Trên 500k", range: [500000, 5000000] },
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => setPriceRange(preset.range)}
                        className="flex-1 px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-[#0a923c] hover:text-white rounded transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CATEGORIES */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection("category")}
                className="w-full flex items-center justify-between text-base font-semibold text-gray-900 mb-3"
              >
                <span>Danh mục</span>
                {expandedSections.category ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
              {expandedSections.category && (
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat.id)}
                          onChange={() => toggleCategory(cat.id)}
                          className="w-4 h-4 text-[#0a923c] border-gray-300 rounded focus:ring-[#0a923c]"
                        />
                        <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                      </div>
                      <span className="text-xs text-gray-400">({cat.count})</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* RATING */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection("rating")}
                className="w-full flex items-center justify-between text-base font-semibold text-gray-900 mb-3"
              >
                <span>Đánh giá</span>
                {expandedSections.rating ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
              {expandedSections.rating && (
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <label
                      key={rating}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRatings.includes(rating)}
                        onChange={() => toggleRating(rating)}
                        className="w-4 h-4 text-[#0a923c] border-gray-300 rounded focus:ring-[#0a923c]"
                      />
                      <div className="flex items-center text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < rating ? "fill-current" : ""}
                            strokeWidth={1}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-700">Từ {rating} sao trở lên</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* BRANDS */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection("brand")}
                className="w-full flex items-center justify-between text-base font-semibold text-gray-900 mb-3"
              >
                <span>Thương hiệu</span>
                {expandedSections.brand ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
              {expandedSections.brand && (
                <div className="space-y-2">
                  {brands.map((brand) => (
                    <label
                      key={brand.id}
                      className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-700">{brand.name}</span>
                      <span className="text-xs text-gray-400">({brand.count})</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* CLEAR FILTERS */}
            <button
              onClick={() => {
                setSelectedCategories([]);
                setSelectedRatings([]);
                setPriceRange([0, 5000000]);
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              Xóa bộ lọc
            </button>
          </aside>

          {/* OVERLAY FOR MOBILE */}
          {isFilterOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setIsFilterOpen(false)}
            />
          )}

          {/* MAIN CONTENT */}
          <div className="flex-1">
            {/* HEADER BAR */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsFilterOpen(true)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold transition-colors"
                  >
                    <Filter size={18} />
                    Bộ lọc
                  </button>
                  <span className="text-sm text-gray-600 font-medium">
                    Tìm thấy <span className="text-[#0a923c] font-semibold">{products.length}</span> sản phẩm
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {/* SORT */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0a923c] cursor-pointer"
                  >
                    <option value="default">Sắp xếp mặc định</option>
                    <option value="price-asc">Giá tăng dần</option>
                    <option value="price-desc">Giá giảm dần</option>
                    <option value="rating">Đánh giá cao nhất</option>
                    <option value="sold">Bán chạy nhất</option>
                    <option value="newest">Mới nhất</option>
                  </select>

                  {/* VIEW MODE */}
                  <div className="flex items-center gap-2 border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 transition-colors ${
                        viewMode === "grid"
                          ? "bg-[#0a923c] text-white"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Grid3x3 size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 transition-colors ${
                        viewMode === "list"
                          ? "bg-[#0a923c] text-white"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <List size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* PRODUCT GRID/LIST */}
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
                  : "space-y-4 mb-6"
              }
            >
              {products.map((product) =>
                viewMode === "grid" ? (
                  <ProductCard key={product.id} product={product} />
                ) : (
                  <ProductListItem key={product.id} product={product} />
                )
              )}
            </div>

            {/* PAGINATION */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
              <div className="flex items-center justify-center gap-2">
                <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <ChevronLeft size={18} />
                </button>
                {[1, 2, 3, 4, 5].map((page) => (
                  <button
                    key={page}
                    className={`px-4 py-2 border rounded-lg text-sm font-semibold transition-colors ${
                      page === 1
                        ? "bg-[#0a923c] text-white border-[#0a923c]"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
