"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "../../common/header";
import Footer from "../../common/footer";
import { 
  ShoppingCart, 
  Star, 
  TrendingUp, 
  Heart, 
  Share2, 
  Check, 
  Truck, 
  Shield, 
  Minus,
  Plus
} from "lucide-react";

// Mock product data - In real app, fetch from API based on ID
const getProductById = (id: string) => {
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
      description: "Cam Nam Phi tươi ngon, mọng nước, giàu vitamin C. Sản phẩm được nhập khẩu trực tiếp từ Nam Phi, đảm bảo chất lượng cao và an toàn thực phẩm.",
      origin: "Nam Phi",
      weight: "1kg",
      stock: 50,
      images: ["/sp/1.jpg", "/sp/1.jpg", "/sp/1.jpg", "/sp/1.jpg"],
      specifications: {
        "Xuất xứ": "Nam Phi",
        "Trọng lượng": "1kg",
        "Bảo quản": "Nơi khô ráo, thoáng mát",
        "Hạn sử dụng": "30 ngày",
      }
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
      description: "Kẹo Dynamite BigBang với hương vị socola bạc hà độc đáo, thơm ngon. Sản phẩm được sản xuất theo tiêu chuẩn chất lượng cao.",
      origin: "Việt Nam",
      weight: "120g",
      stock: 100,
      images: ["/sp/2.jpg", "/sp/2.jpg", "/sp/2.jpg"],
      specifications: {
        "Xuất xứ": "Việt Nam",
        "Trọng lượng": "120g",
        "Bảo quản": "Nơi khô ráo, tránh ánh nắng",
        "Hạn sử dụng": "12 tháng",
      }
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
      description: "Thùng 24 ly trà sữa Oolong nướng thơm ngon, đậm đà. Sản phẩm tiện lợi, phù hợp cho gia đình và văn phòng.",
      origin: "Đài Loan",
      weight: "24 ly",
      stock: 30,
      images: ["/sp/3.jpg", "/sp/3.jpg"],
      specifications: {
        "Xuất xứ": "Đài Loan",
        "Trọng lượng": "24 ly",
        "Bảo quản": "Nơi khô ráo, thoáng mát",
        "Hạn sử dụng": "18 tháng",
      }
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
      description: "Cà phê Cappuccino sữa dừa hoà tan thơm ngon, đậm đà. Sản phẩm được chế biến từ hạt cà phê Arabica cao cấp.",
      origin: "Việt Nam",
      weight: "500g",
      stock: 45,
      images: ["/sp/4.jpg", "/sp/4.jpg", "/sp/4.jpg", "/sp/4.jpg"],
      specifications: {
        "Xuất xứ": "Việt Nam",
        "Trọng lượng": "500g",
        "Bảo quản": "Nơi khô ráo, tránh ẩm",
        "Hạn sử dụng": "24 tháng",
      }
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
      description: "Cà phê Cappuccino sữa dừa đặc sản Đà Nẵng, thơm ngon đặc biệt. Sản phẩm được sản xuất tại Đà Nẵng với công thức độc quyền.",
      origin: "Đà Nẵng, Việt Nam",
      weight: "200g",
      stock: 20,
      images: ["/sp/5.jpg", "/sp/5.jpg"],
      specifications: {
        "Xuất xứ": "Đà Nẵng, Việt Nam",
        "Trọng lượng": "200g",
        "Bảo quản": "Nơi khô ráo, tránh ẩm",
        "Hạn sử dụng": "18 tháng",
      }
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
      description: "Mật ong rừng U Minh Hạ nguyên chất, thơm ngon tự nhiên. Sản phẩm được thu hoạch từ rừng U Minh Hạ, đảm bảo chất lượng cao.",
      origin: "U Minh Hạ, Việt Nam",
      weight: "500ml",
      stock: 35,
      images: ["/sp/1.jpg", "/sp/1.jpg", "/sp/1.jpg"],
      specifications: {
        "Xuất xứ": "U Minh Hạ, Việt Nam",
        "Trọng lượng": "500ml",
        "Bảo quản": "Nơi khô ráo, tránh ánh nắng",
        "Hạn sử dụng": "36 tháng",
      }
    },
  ];

  return products.find(p => p.id === parseInt(id)) || products[0];
};

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = getProductById(params.id);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-5 py-4">
          <div className="flex items-center gap-2.5 text-base text-gray-600">
            <Link href="/" className="hover:text-green-600 transition-colors font-medium">Trang chủ</Link>
            <span>/</span>
            <Link href="/san-pham" className="hover:text-green-600 transition-colors font-medium">Sản phẩm</Link>
            <span>/</span>
            <span className="text-gray-900 font-semibold">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-5 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* LEFT - IMAGES */}
          <div className="w-full lg:w-[550px] space-y-5">
            {/* Main Image */}
            <div className="relative w-full h-[550px] rounded-xl overflow-hidden border border-gray-200 bg-white shadow-md">
              <Image
                src={product.images[selectedImage] || product.img}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold border border-white shadow-sm">
                {product.discount}
              </div>
            </div>

            {/* Thumbnail Images */}
            <div className="flex gap-4 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-24 h-24 rounded-xl overflow-hidden border-2 shrink-0 transition-all shadow-sm ${
                    selectedImage === i 
                      ? "border-green-600 shadow-md" 
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT - PRODUCT INFO */}
          <div className="flex-1 space-y-7">
            {/* Product Name */}
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-4 leading-tight">{product.name}</h1>
              
              {/* Rating & Reviews */}
              <div className="flex items-center gap-5 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={i < Math.floor(product.rating) ? "fill-current" : ""}
                        strokeWidth={1}
                      />
                    ))}
                  </div>
                  <span className="text-base text-gray-600">({product.rating})</span>
                </div>
                <div className="flex items-center gap-2 text-base text-gray-500">
                  <TrendingUp className="w-5 h-5 text-green-600" strokeWidth={1} />
                  <span>{product.sold} đã bán</span>
                </div>
                <div className="text-base text-gray-500">
                  <span className="text-green-600 font-semibold">{product.stock}</span> sản phẩm có sẵn
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="border-t border-b border-gray-200 py-5">
              <div className="flex items-baseline gap-4">
                <p className="text-4xl font-bold text-green-700">{product.price}</p>
                <p className="text-xl line-through text-gray-400">{product.oldPrice}</p>
                <span className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-sm font-semibold border border-red-200 shadow-sm">
                  {product.discount}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Mô tả sản phẩm</h3>
              <p className="text-base text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Specifications */}
            <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-md">
              <h3 className="font-semibold text-lg mb-4">Thông tin sản phẩm</h3>
              <div className="space-y-3">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-4 text-base">
                    <span className="text-gray-600 w-28 font-medium">{key}:</span>
                    <span className="text-gray-900 font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="space-y-5">
              <div className="flex items-center gap-5">
                <span className="text-base font-semibold text-gray-700">Số lượng:</span>
                <div className="flex items-center border border-gray-200 rounded-xl shadow-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-50 transition-colors border-r border-gray-200"
                  >
                    <Minus size={18} strokeWidth={1} />
                  </button>
                  <span className="px-5 py-3 text-base font-semibold min-w-[70px] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-3 hover:bg-gray-50 transition-colors border-l border-gray-200"
                  >
                    <Plus size={18} strokeWidth={1} />
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2.5 transition-colors border border-green-700 shadow-md text-base">
                  <ShoppingCart size={20} strokeWidth={1} />
                  <span>Thêm vào giỏ hàng</span>
                </button>
                <button className="px-5 py-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                  <Heart size={20} strokeWidth={1} className="text-gray-600" />
                </button>
                <button className="px-5 py-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                  <Share2 size={20} strokeWidth={1} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-5 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center shadow-sm">
                  <Truck className="w-6 h-6 text-green-600" strokeWidth={1} />
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900">Miễn phí vận chuyển</p>
                  <p className="text-sm text-gray-500">Đơn hàng trên 500k</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center shadow-sm">
                  <Shield className="w-6 h-6 text-green-600" strokeWidth={1} />
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900">Đảm bảo chất lượng</p>
                  <p className="text-sm text-gray-500">100% chính hãng</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center shadow-sm">
                  <Check className="w-6 h-6 text-green-600" strokeWidth={1} />
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900">Đổi trả dễ dàng</p>
                  <p className="text-sm text-gray-500">Trong 7 ngày</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

