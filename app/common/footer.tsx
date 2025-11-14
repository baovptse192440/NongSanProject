import Image from "next/image";
import { MapPin, Building2, Mail, Phone } from "lucide-react";

export default function FooterAU() {
  return (
    <footer className="w-full bg-[#0a923c] border-t border-white/20 mt-12 pt-8 pb-6 text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* LEFT INFO */}
          <div className="col-span-1 lg:col-span-2 space-y-4 max-w-[500px]">
            <div className="relative w-[180px] h-[90px]">
              <Image 
                src="/logo_AU.png" 
                alt="AU logo" 
                fill
                className="object-contain"
                priority
              />
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-sm uppercase tracking-wide">
                CÔNG TY TNHH CÔNG NGHỆ VÀ THƯƠNG MẠI AU
              </h3>

              <div className="space-y-2 text-xs leading-relaxed">
                <p className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-white/70" />
                  <span>Địa chỉ ĐKKD: Tầng 1, Tòa nhà số 109-111, Xã Bình Hưng, TP. Hồ Chí Minh, Việt Nam</span>
                </p>
                <p className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-white/70" />
                  <span>Địa chỉ liên hệ: 262/3 Lũy Bán Bích, Quận Tân Phú, TP. Hồ Chí Minh</span>
                </p>
                <p className="flex items-start gap-2">
                  <Building2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-white/70" />
                  <span>Kho Tân Phú: 284/11 Lũy Bán Bích, Quận Tân Phú</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 shrink-0 text-white/70" />
                  <a href="mailto:info@au.vn" className="hover:text-white/80 transition-colors">info@au.vn</a>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 shrink-0 text-white/70" />
                  <a href="tel:02877702614" className="hover:text-white/80 transition-colors font-medium">
                    02877702614 (8h00 - 18h00)
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* ACCOUNT + INFO */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm mb-3 pb-1.5 border-b border-white/30">TÀI KHOẢN</h3>
              <ul className="space-y-2 text-xs">
                <li className="hover:text-white/80 cursor-pointer transition-colors">
                  Tài khoản của tôi
                </li>
                <li className="hover:text-white/80 cursor-pointer transition-colors">
                  Điểm thưởng
                </li>
                <li className="hover:text-white/80 cursor-pointer transition-colors">
                  Giỏ hàng
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-3 pb-1.5 border-b border-white/20">THÔNG TIN</h3>
              <ul className="space-y-2 text-xs">
                <li className="hover:text-white/80 cursor-pointer transition-colors">
                  Về AU
                </li>
                <li className="hover:text-white/80 cursor-pointer transition-colors">
                  Điều khoản
                </li>
                <li className="hover:text-white/80 cursor-pointer transition-colors">
                  Bảo mật
                </li>
                <li className="hover:text-white/80 cursor-pointer transition-colors">
                  Xuất khẩu
                </li>
                <li className="hover:text-white/80 cursor-pointer transition-colors">
                  Tuyển dụng
                </li>
              </ul>
            </div>
          </div>

          {/* CONNECT + APP */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm mb-3 pb-1.5 border-b border-white/20">KẾT NỐI</h3>
              <div className="space-y-3">
                <div className="relative w-full h-[45px] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  
                </div>

                <div className="flex gap-2">
                  <div className="relative w-[55px] h-[55px] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    
                  </div>
                  <div className="relative w-[55px] h-[55px] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-3 pb-1.5 border-b border-white/20">ỨNG DỤNG</h3>
              <div className="flex gap-3">
                <div className="relative w-[85px] h-[85px] rounded-lg overflow-hidden shadow-sm bg-white p-1.5">
                  
                </div>
                <div className="space-y-2 flex-1">
                  <div className="relative w-full h-[35px] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    
                  </div>
                  <div className="relative w-full h-[35px] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="text-center text-white/70 text-xs mt-8 pt-6 border-t border-white/20">
          <p>Copyright © AU 2025. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}