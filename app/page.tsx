import Image from "next/image";
import Header from "./common/header";
import { Main } from "next/document";
import {CircleChevronLeft,CircleChevronRight } from 'lucide-react';
import Product from "./common/product";
import Agri from "./common/AgrishowSection";
import Footer from "./common/footer";
export default function Home() {
  return (
    <> 
      <Header></Header>

      <div className="container mx-auto mt-6 bg-white p-4">
      <div className="flex gap-4 justify-between">

    {/* LEFT BIG BANNER */}
    <div className="relative w-[820px] h-[380px] rounded-xl overflow-hidden shadow-md bg-white">

      {/* BUTTON LEFT */}
      <button
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white w-9 h-9 rounded-full shadow flex items-center justify-center"
      >
        <CircleChevronLeft className="text-gray-700" strokeWidth={1.5} />
      </button>

      {/* BIG IMAGE */}
      <img
        src="/banner.png"
        className="w-full h-full object-cover"
        alt="banner"
      />

      {/* BUTTON RIGHT */}
      <button
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white w-9 h-9 rounded-full shadow flex items-center justify-center"
      >
        <CircleChevronRight className="text-gray-700" strokeWidth={1.5} />
      </button>
    </div>

    {/* RIGHT SMALL BANNERS */}
    <div className="flex flex-col gap-3 justify-center">

      {/* Small banner 1 */}
      <div className="w-[270px] h-[110px] rounded-xl overflow-hidden shadow bg-white">
        <img src="/banner.png" className="w-full h-full object-cover" />
      </div>

      {/* Small banner 2 */}
      <div className="w-[270px] h-[110px] rounded-xl overflow-hidden shadow bg-white">
        <img src="/banner.png" className="w-full h-full object-cover" />
      </div>

      {/* Small banner 3 */}
      <div className="w-[270px] h-[110px] rounded-xl overflow-hidden shadow bg-white">
        <img src="/banner.png" className="w-full h-full object-cover" />
      </div>
    </div>
  </div>
</div>
    <Product></Product>
    <Agri></Agri>
    <Footer></Footer>
    </>
  );
}
