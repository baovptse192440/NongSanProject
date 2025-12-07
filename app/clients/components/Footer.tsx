"use client";

import Image from "next/image";
import { Facebook, Twitter, Instagram, Youtube, Send } from "lucide-react";

export default function Footer() {
  return (
    <footer
      className="relative text-white bg-cover bg-center py-16 mt-20"
      style={{ backgroundImage: "url('/footer-background.jpg')" }}
    >
      <div className="w-full h-full absolute bg-[#164333]/90 bottom-0 z-1"></div>
      <div className="container mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 z-20 relative">
        
        {/* BRAND + ABOUT */}
        <div>
          <Image
            src="/logo_AU_White.png"
            alt="Logo"
            width={150}
            height={60}
            className="mb-5"
          />
          <p className="text-gray-200 leading-relaxed text-sm">
            Cam kết phát triển nông nghiệp bền vững và sáng tạo,
            cung cấp nông sản chất lượng cao đồng thời bảo vệ môi trường.
          </p>

          {/* Social Icons */}
          <div className="flex gap-2 mt-6">
            {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="p-2 rounded-xs bg-[#43aa5c] hover:bg-[#f8c32c] transition"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* MENU */}
        <div>
          <h3 className="text-lg font-semibold mb-5">Thông tin</h3>
          <ul className="space-y-3 text-gray-200 text-sm">
            <li><a href="#" className="hover:text-[#f8c32c] transition">Về công ty</a></li>
            <li><a href="#" className="hover:text-[#f8c32c] transition">Nông dân của chúng tôi</a></li>
            <li><a href="#" className="hover:text-[#f8c32c] transition">Dịch vụ nông nghiệp</a></li>
            <li><a href="#" className="hover:text-[#f8c32c] transition">Hướng dẫn & FAQ</a></li>
            <li><a href="#" className="hover:text-[#f8c32c] transition">Liên hệ</a></li>
          </ul>
        </div>

        {/* CONTACT */}
<div>
  <h3 className="text-lg font-semibold mb-5">Liên hệ</h3>
  <ul className="space-y-4 text-sm">
    <li>
      <p className="text-[#f8c32c] font-semibold">Địa chỉ:</p>
      <p className="text-gray-200">77 - 83 Derrimut Drive, Derrimut VIC 3026</p>
    </li>
    <li>
      <p className="text-[#f8c32c] font-semibold">Điện thoại:</p>
      <p className="text-gray-200">+61.415.616.789</p>
    </li>
    <li>
      <p className="text-[#f8c32c] font-semibold">Email:</p>
      <a href="mailto:honglegalbco@gmail.com" className="text-gray-200 hover:text-[#f8c32c]">
        honglegalbco@gmail.com
      </a>
    </li>
  </ul>
</div>


        {/* NEWSLETTER */}
        <div>
          <h3 className="text-lg font-semibold mb-5">Đăng ký nhận tin</h3>

          <form className="flex relative flex-col gap-3">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="px-4 py-3 rounded-md bg-white text-[#164333] outline-none"
            />

            <button
              type="submit"
              className="absolute right-0 px-4 py-3 rounded-md bg-[#f8c32c] text-[#164333] font-semibold hover:cursor-pointer transition"
            >
              <Send />
            </button>
          </form>

          <p className="text-gray-200 text-sm mt-4">
            Nhận thông tin cập nhật và ưu đãi mới nhất về dịch vụ nông nghiệp hàng năm.
          </p>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="text-center z-20 relative text-gray-300 text-sm mt-16 border-t border-white/10 pt-6">
        © {new Date().getFullYear()} AusGlobal Connection. Bảo lưu mọi quyền.
      </div>
    </footer>
  );
}

