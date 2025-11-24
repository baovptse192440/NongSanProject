"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "../../common/header";
import Footer from "../../common/footer";
import Product from "../../common/product";
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
    <div className="min-h-screen mt-10 bg-[#eeeeee] md:mt-32">
      <Header />

      {/* Breadcrumb */}
      <div className="hidden md:flex  bg-[#e6e6e6] border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-green-600 font-medium">Trang chủ</Link>
            <span>/</span>
            <Link href="/san-pham" className="hover:text-green-600 font-medium">Sản phẩm</Link>
            <span>/</span>
            <span className="text-gray-900 font-semibold">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container bg-white rounded-sm  mx-auto  py-5">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT - IMAGES */}
          <div className="w-full lg:w-[500px] lg:sticky lg:top-[100px] space-y-4">
            <motion.div
              className="relative w-full h-[350px] sm:h-[400px] lg:h-[500px] rounded-xs overflow-hidden border border-gray-200 bg-white shadow"
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
                  className={`relative hover:cursor-pointer w-16 h-16 sm:w-20 sm:h-20  overflow-hidden border shrink-0 transition-all shadow-sm ${
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
              <div className="flex items-center gap-0">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={i < Math.floor(product.rating) ? "fill-yellow-400 text-white" : "fill-yellow-400 text-white"}
                  />
                ))}
                <span>{product.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <TrendingUp className="w-3 h-3 text-green-600" strokeWidth={1} /> {product.sold} đã bán
              </div>
              
            </div>

            <div className="flex flex-wrap items-baseline gap-2 py-2 border-b border-gray-200">
              <span className="text-xl sm:text-2xl font-bold text-green-700">{product.price}</span>
              <span className="line-through text-gray-400 text-sm">{product.oldPrice}</span>
              <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-xs font-semibold border border-red-200">
                {product.discount}
              </span>
            </div>

          

            <div className="space-y-4 text-sm text-gray-700">

  {/* Mã giảm giá */}
  <div>
    <p className="font-medium text-[#858383]">Mã giảm giá</p>
    <div className="flex gap-2 mt-2">
      <span className="border border-green-600 text-green-600 px-3 py-1 rounded-md text-xs font-semibold">
        FreeShip
      </span>
      <span className="border border-green-600 text-green-600 px-3 py-1 rounded-md text-xs font-semibold">
        Giảm 8%
      </span>
    </div>
  </div>

  {/* Vận chuyển đến */}
  <div>
    <p className="font-medium text-[#858383]">
      Vận chuyển đến:{" "}
      <span className="text-green-700 font-semibold cursor-pointer">
        Quận 1 - Tp. HCM
      </span>
    </p>
  </div>

  {/* Phí vận chuyển */}
  <div>
   <p className="font-medium text-[#858383]">
      Phí vận chuyển:{" "}
      <span className="text-green-700 font-semibold">35.000 đ</span>
    </p>
  </div>

  {/* Đóng gói */}
  <div>
    <p className="font-medium text-[#858383]">Đóng Gói:</p>
    <button className="hover:cursor-pointer mt-2 border border-green-700 text-green-700 px-4 py-1 rounded-md flex items-center gap-2">
      <span className="w-3 h-3 rounded-full bg-green-700 inline-block"></span>
      Thùng
    </button>
  </div>

  {/* Số lượng */}
  <div>
    <p className="font-medium text-[#858383] mb-2">Số lượng:</p>
    <div className="flex w-32 h-10 border border-gray-300 rounded-xs overflow-hidden">
      <button className="flex items-center justify-center w-10 bg-gray-200 text-xl hover:cursor-pointer">-</button>
      <div className="flex-1 flex items-center justify-center border-x border-gray-300">1</div>
      <button className="flex items-center justify-center w-10 bg-gray-200 text-xl hover:cursor-pointer">+</button>
    </div>
  </div>

  {/* Nút hành động */}
  <div className="flex gap-3 pt-2">
    <button className="flex-1 border border-green-700 text-green-700 py-3  font-semibold hover:bg-green-50 cursor-pointer">
      THÊM VÀO GIỎ HÀNG
    </button>
    <button className="flex-1 bg-green-700 text-white py-3 font-semibold hover:bg-green-800 cursor-pointer">
      MUA NGAY
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
      {/* THÔNG TIN SẢN PHẨM */}
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  viewport={{ once: true }}
  className="container pl-0 bg-white rounded-sm mt-10 mx-auto py-0 px-0"
>
  <div className="bg-white border-gray-200 rounded-sm">
    
    {/* TIÊU ĐỀ ĐÃ CHỈNH */}
    <div className="bg-[#10723a] inline-block px-4 py-2 ">
      <h2 className="text-white  text-lg font-semibold">
        Thông tin sản phẩm
      </h2>
    </div>
    
    <div className="border-t border-[#e8f5e9] space-y-4 text-gray-700 leading-relaxed p-2 px-2">
    <h1 className="text-2xl font-semibold text-black">
      Cam Nam Phi tươi ngon
    </h1>
      <p>
        Cam Nam Phi tươi ngon, mọng nước, giàu vitamin C — lựa chọn tuyệt vời cho
        những bữa ăn bổ dưỡng và thanh mát mỗi ngày.
      </p>

      <img
        src="/sp/1.jpg"
        className="w-[50%]  shadow"
        alt="Thông tin hình 1"
      />

      <p>
        
        Sản phẩm được tuyển chọn kỹ lưỡng, đảm bảo độ tươi, độ ngọt và độ mọng
        nước. Hoàn toàn phù hợp để ép nước, ăn trực tiếp hoặc làm salad.
      </p>

      <img
        src="/sp/1.jpg"
        className="w-[50%]  shadow"
        alt="Thông tin hình 2"
      />

      <p>
        Hàng nhập khẩu trực tiếp từ Nam Phi, được bảo quản theo quy trình đúng chuẩn,
        đảm bảo chất lượng và an toàn sức khỏe cho người dùng.
      </p>
    </div>
  </div>
</motion.div>

   
      <Footer />
    </div>
  );
}
