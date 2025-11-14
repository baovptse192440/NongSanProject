import React from "react";
import Image from "next/image";
import { ChevronRight, Calendar, User, Sparkles } from "lucide-react";

export default function AgrishowSection() {
  const categories = [
    "Nông Nghiệp 360",
    "Câu Chuyện Và Nhân Vật",
    "Podcast - Agrishow",
    "Trải Nghiệm Nông Nghiệp",
    "Agritech",
    "Nông Nghiệp Bền Vững",
    "Xuất Nhập Khẩu",
    "Trồng Cây Nuôi Con",
  ];

  const newsItems = [
    { title: "AU Tuyển Sỉ Bánh Trung Thu 2025 – Giá Chiết Khấu Siêu Hấp Dẫn" },
    { title: "Mùa Hồng Treo Gió Đà Lạt vào thời điểm nào?" },
    { title: "Cà phê Giảng - Cà phê nổi tiếng thế giới" },
    { title: "Xuất khẩu nông sản Việt Nam đạt kỷ lục mới" },
    { title: "Công nghệ AI trong nông nghiệp hiện đại" },
  ];

  return (
    <div className="w-full bg-[#f5f5f7] py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* LEFT MENU */}
          <div className="w-full lg:w-[240px] bg-white rounded-lg shadow-sm p-4 h-fit sticky top-4 border border-gray-200">
            <div className="flex items-center gap-1.5 mb-4">
              <Sparkles className="w-4 h-4 text-green-600" />
              <h2 className="font-semibold text-lg text-green-700">AGRISHOW</h2>
            </div>
            <ul className="space-y-1.5">
              {categories.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 cursor-pointer group hover:bg-green-50 p-2 rounded-lg transition-colors"
                >
                  <ChevronRight 
                    size={14} 
                    className="text-green-600 group-hover:text-green-700 group-hover:translate-x-0.5 transition-transform" 
                  />
                  <span className="text-sm text-gray-700 group-hover:text-green-700 transition-colors">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* MAIN ARTICLE */}
          <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden max-w-[700px] border border-gray-200">
            <div className="relative w-full h-[280px]">
              <Image
                src="/banner/banner_1.jpg"
                alt="main banner"
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-lg leading-snug text-gray-900 hover:text-green-700 transition-colors cursor-pointer">
                Tuyển sỉ quà Tết 2026 cùng AU – Đồng hành cùng doanh nghiệp trong
                hành trình trao gửi tri ân và giá trị Việt
              </h3>

              <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span className="font-medium">Vu Vy</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>22/10/2025</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-sm text-gray-900 mb-3">Bài viết liên quan</h4>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-green-50 transition-colors cursor-pointer group">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-1.5 shrink-0"></div>
                    <p className="text-sm text-gray-700 group-hover:text-green-700 font-medium transition-colors">
                      Mùa Hồng Treo Gió Đà Lạt vào thời điểm nào?
                    </p>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-green-50 transition-colors cursor-pointer group">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-1.5 shrink-0"></div>
                    <p className="text-sm text-gray-700 group-hover:text-green-700 font-medium transition-colors">
                      Cà phê Giảng - Cà phê nổi tiếng thế giới
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT NEWS LIST */}
          <div className="w-full lg:w-[320px] bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-base text-gray-900 mb-4 pb-2 border-b border-gray-100">
              Tin tức nổi bật
            </h3>
            <div className="space-y-3">
              {newsItems.map((item, i) => (
                <div
                  key={i}
                  className="flex gap-3 cursor-pointer group hover:bg-green-50 p-2 rounded-lg transition-colors"
                >
                  <div className="relative w-[100px] h-[70px] rounded-lg overflow-hidden shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                    <Image
                      src={`/sp/${(i % 5) + 1}.jpg`}
                      alt="news thumb"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium leading-snug text-gray-800 group-hover:text-green-700 transition-colors line-clamp-3">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-gray-400">
                      <Calendar className="w-2.5 h-2.5" />
                      <span>22/10/2025</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}