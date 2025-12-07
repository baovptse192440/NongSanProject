"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { motion } from "framer-motion";

// @ts-ignore - CSS imports
import "swiper/css";

export default function BrandSection() {
  const logos = [
    "sponsor1.png",
    "sponsor2.png",
    "sponsor3.png",
    "sponsor4.png",
    "sponsor5.png",
    "sponsor6.png",
     "sponsor1.png",
    "sponsor2.png",
    "sponsor3.png",
    "sponsor4.png",
    "sponsor5.png",
    "sponsor6.png",
  ];

  return (
    <section className="py-20 w-full bg-white overflow-hidden">
      <div className="container mx-auto px-4">

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative flex items-center justify-center mb-12"
        >
          <div className="absolute w-full border-t-2 border-dashed border-gray-300"></div>
          <p className="relative z-10 bg-white px-6 font-dmSans text-lg font-medium text-[#164333] tracking-tight">
            AusGlobal Connection – Niềm Tin Toàn Cầu
          </p>
        </motion.div>

        {/* Swiper Animation Wrapper */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <Swiper
            modules={[Autoplay]}
            spaceBetween={30}
            loop
            autoplay={{
              delay: 1500,
              disableOnInteraction: false,
            }}
            breakpoints={{
              0: { slidesPerView: 2, spaceBetween: 15 },
              480: { slidesPerView: 3, spaceBetween: 20 },
              768: { slidesPerView: 4, spaceBetween: 25 },
              1024: { slidesPerView: 5, spaceBetween: 30 },
            }}
            className="py-4"
          >
            {logos.map((logo, index) => (
              <SwiperSlide key={index} className="flex items-center justify-center">
                <motion.img
                  src={logo}
                  alt="brand"
                  className="w-36 h-auto object-contain opacity-80 hover:opacity-100 transition-all"
                  whileHover={{
                    scale: 1.15,
                    transition: { duration: 0.25 },
                  }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </div>
    </section>
  );
}

