"use client";

import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <section className="relative mb-20 bg-[#F8F7F0] pt-20">
      
      <div className="container mx-auto relative z-10">

        <div
          className="
            relative flex flex-col md:flex-row items-start md:items-center 
            justify-between gap-8 md:gap-12
            py-12 md:py-[70px] px-6 md:px-[40px] 
            rounded-xl bg-[#1f4e3d]
          "
          style={{
            backgroundImage: "url('/bg-rom.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >

          {/* Heading */}
          <div className="flex flex-col text-left w-full md:w-2/3 lg:w-1/2">
            <h2 className="text-xl sm:text-xl tracking-tight md:text-3xl font-extrabold leading-tight text-white">
               Chất Lượng Nông Sản
            </h2>

            <h2 className="text-xl tracking-tight sm:text-xl md:text-3xl font-extrabold leading-tight text-white mt-2">
             Sản Phẩm Tốt Nhất!
            </h2>
          </div>

          {/* Button */}
          <div className="w-full">
            <a
              href="https://wp25.dynamiclayers.net/agrox/contact/"
              className="
                inline-block bg-[#cfb23d] text-white font-semibold  
                px-6 py-3 sm:px-7 sm:py-4 
                rounded-md hover:bg-[#b99a2a] transition text-center
              "
            >
              Liên Hệ Ngay
            </a>
          </div>

          {/* Farmer Image */}
          <div className="hidden md:block absolute right-0 bottom-0">
            <img
              src="luan.png"
              alt="Farmer"
              className="w-[170px] md:w-[200px] lg:w-[400px] object-contain"
            />
          </div>

        </div>
      </div>
    </section>
  );
}

