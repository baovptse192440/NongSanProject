"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
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
  Plus,
} from "lucide-react";

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
      description:
        "Cam Nam Phi tươi ngon, mọng nước, giàu vitamin C. Sản phẩm nhập khẩu trực tiếp từ Nam Phi, đảm bảo chất lượng cao và an toàn thực phẩm.",
      stock: 50,
      images: ["/sp/1.jpg", "/sp/1.jpg", "/sp/1.jpg", "/sp/1.jpg"],
      specifications: {
        "Xuất xứ": "Nam Phi",
        "Trọng lượng": "1kg",
        "Bảo quản": "Nơi khô ráo, thoáng mát",
        "Hạn sử dụng": "30 ngày",
      },
    },
  ];
  return products.find((p) => p.id === parseInt(id)) || products[0];
};

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = getProductById(params.id);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="min-h-screen mt-10 bg-[#f5f5f7] md:mt-32">
      <Header />

      {/* Breadcrumb */}
      <div className="hidden md:flex bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-2">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-green-600 font-medium">Trang chủ</Link>
            <span>/</span>
            <Link href="/san-pham" className="hover:text-green-600 font-medium">Sản phẩm</Link>
            <span>/</span>
            <span className="text-gray-900 font-semibold">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT - IMAGES */}
          <div className="w-full lg:w-[500px] lg:sticky lg:top-[100px] space-y-4">
            <motion.div
              className="relative w-full h-[350px] sm:h-[400px] lg:h-[500px] rounded-lg overflow-hidden border border-gray-200 bg-white shadow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src={product.images[selectedImage] || product.img}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold border border-white shadow-sm">
                {product.discount}
              </div>
            </motion.div>

            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <motion.button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  whileHover={{ scale: 1.05 }}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-all shadow-sm ${
                    selectedImage === i ? "border-green-600 shadow-md" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Image src={img} alt={`${product.name} ${i}`} fill className="object-cover" />
                </motion.button>
              ))}
            </div>
          </div>

          {/* RIGHT - PRODUCT INFO */}
          <div className="flex-1 space-y-5">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{product.name}</h1>

            <div className="flex flex-wrap gap-2 items-center text-gray-600 text-sm">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < Math.floor(product.rating) ? "fill-yellow-400" : "text-gray-300"}
                  />
                ))}
                <span>{product.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <TrendingUp className="w-3 h-3 text-green-600" strokeWidth={1} /> {product.sold} đã bán
              </div>
              <div>
                <span className="text-green-600 font-semibold">{product.stock}</span> có sẵn
              </div>
            </div>

            <div className="flex flex-wrap items-baseline gap-2 py-2 border-b border-gray-200">
              <span className="text-xl sm:text-2xl font-bold text-green-700">{product.price}</span>
              <span className="line-through text-gray-400 text-sm">{product.oldPrice}</span>
              <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-xs font-semibold border border-red-200">
                {product.discount}
              </span>
            </div>

            <p className="text-gray-700 text-sm">{product.description}</p>

            <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm text-sm">
              <h3 className="font-semibold mb-2">Thông tin sản phẩm</h3>
              <div className="space-y-1">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="font-medium">{key}:</span>
                    <span className="font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden text-sm">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-1 hover:bg-gray-50">
                  <Minus size={14} />
                </button>
                <span className="px-3 py-1 text-center font-semibold min-w-[40px]">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-3 py-1 hover:bg-gray-50">
                  <Plus size={14} />
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                className="flex-1 bg-green-600 hover:bg-green-700 cursor-pointer text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-1 shadow-sm text-sm"
              >
                <ShoppingCart size={16} /> Thêm vào giỏ hàng
              </motion.button>

              <div className="flex gap-2">
                <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <Heart size={18} className="text-gray-600" />
                </button>
                <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <Share2 size={18} className="text-gray-600" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-gray-200 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shadow-sm">
                  <Truck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Miễn phí vận chuyển</p>
                  <p className="text-gray-500">Đơn hàng trên 500k</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shadow-sm">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Đảm bảo chất lượng</p>
                  <p className="text-gray-500">100% chính hãng</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shadow-sm">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Đổi trả dễ dàng</p>
                  <p className="text-gray-500">Trong 7 ngày</p>
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
