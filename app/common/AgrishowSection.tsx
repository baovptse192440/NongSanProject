import React from "react";
import { ChevronRight } from "lucide-react";

export default function AgrishowSection() {
  return (
    <div className="w-full bg-[#f2f4f5] p-6 flex gap-6 text-black justify-center">
      {/* LEFT MENU */}
      <div className="w-[260px] bg-white rounded-xl shadow-md p-4 h-fit">
        <h2 className="font-bold text-2xl text-green-700 mb-4">AGRISHOW</h2>
        <ul className="space-y-4 text-[16px]">
          {[
            "Nông Nghiệp 360",
            "Câu Chuyện Và Nhân Vật",
            "Podcast - Agrishow",
            "Trải Nghiệm Nông Nghiệp",
            "Agritech",
            "Nông Nghiệp Bền Vững",
            "Xuất Nhập Khẩu",
            "Trồng Cây Nuôi Con",
          ].map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 cursor-pointer hover:text-green-700 font-medium"
            >
              <ChevronRight size={18} />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* MAIN ARTICLE */}
      <div className="flex-1 bg-white rounded-xl shadow-md p-4 max-w-[780px]">
        <img
          src="/banner.png"
          alt="main banner"
          className="rounded-xl w-full"
        />

        <h3 className="mt-4 font-semibold text-2xl leading-8 text-gray-800">
          Tuyển sĩ quà Tết 2026 cùng AU  – Đồng hành cùng doanh nghiệp trong
          hành trình trao gửi tri ân và giá trị Việt
        </h3>

        <p className="text-sm text-gray-500 mt-2">
          Đăng bởi <span className="font-semibold">Vu Vy</span> • ngày 22/10/2025
        </p>

        <div className="mt-4 space-y-3 text-lg text-gray-800">
          <p className="cursor-pointer hover:underline">
            Mùa Hồng Treo Gió Đà Lạt vào thời điểm nào?
          </p>
          <p className="cursor-pointer hover:underline">
            Cà phê Giảng - Cà phê nổi tiếng thế giới
          </p>
        </div>
      </div>

      {/* RIGHT NEWS LIST */}
      <div className="w-[360px] bg-white rounded-xl shadow-md p-4 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex gap-3 cursor-pointer group"
          >
            <img
              src="/banner.png"
              alt="news thumb"
              className="rounded-lg w-[140px] h-[90px] object-cover"
            />
            <p className="text-sm font-semibold leading-5 text-gray-800 group-hover:underline">
              AU  Tuyển Sỉ Bánh Trung Thu 2025 – Giá Chiết Khấu Siêu Hấp Dẫn
            </p>
          </div>
        ))}
      </div>
    </div>
    
  );
}