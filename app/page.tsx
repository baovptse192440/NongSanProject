import Image from "next/image";
import Header from "./common/header";
import { CircleChevronLeft, CircleChevronRight } from 'lucide-react';
import Product from "./common/product";
import Agri from "./common/AgrishowSection";
import Footer from "./common/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <Header />
      
      {/* Hero Banner Section */}
      <div className="container mx-auto px-5 py-8">
        <div className="flex flex-col lg:flex-row gap-5">
          {/* LEFT BIG BANNER */}
          <div className="relative w-full lg:w-[750px] h-[350px] lg:h-[400px] rounded-xl overflow-hidden shadow-md group border border-gray-200">
            {/* BUTTON LEFT */}
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center z-10 transition-all duration-200 opacity-0 group-hover:opacity-100 border border-gray-200"
            >
              <CircleChevronLeft className="text-gray-700" size={20} strokeWidth={1} />
            </button>

            {/* BIG IMAGE */}
            <div className="relative w-full h-full">
              <Image
                src="/banner/banner_1.jpg"
                fill
                className="object-cover"
                alt="Banner chính"
                priority
              />
            </div>

            {/* BUTTON RIGHT */}
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center z-10 transition-all duration-200 opacity-0 group-hover:opacity-100 border border-gray-200"
            >
              <CircleChevronRight className="text-gray-700" size={20} strokeWidth={1} />
            </button>

            {/* Banner Indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all ${
                    i === 1 ? "bg-white w-6" : "bg-white/40 w-1.5"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* RIGHT SMALL BANNERS */}
          <div className="flex flex-col gap-4 flex-1">
            {/* Small banner 1 */}
            <div className="relative w-full h-[120px] rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 group cursor-pointer border border-gray-200">
              <Image 
                src="/banner/banner_2.jpg" 
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300" 
                alt="Banner phụ 1"
              />
            </div>

            {/* Small banner 2 */}
            <div className="relative w-full h-[120px] rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 group cursor-pointer border border-gray-200">
              <Image 
                src="/banner/banner_3.jpg" 
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300" 
                alt="Banner phụ 2"
              />
            </div>

            {/* Small banner 3 */}
            <div className="relative w-full h-[120px] rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 group cursor-pointer border border-gray-200">
              <Image 
                src="/banner/banner_1.jpg" 
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300" 
                alt="Banner phụ 3"
              />
            </div>
          </div>
        </div>
      </div>

      <Product />
      <Agri />
      <Footer />
    </div>
  );
}
