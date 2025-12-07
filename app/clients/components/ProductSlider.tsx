"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
// @ts-ignore - CSS imports
import "swiper/css";
// @ts-ignore - CSS imports
import "swiper/css/navigation";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const products = [
  {
    title: "Cà Phê Xoài",
    category: "Coffee",
    description:
      "Hòa quyện hương xoài tự nhiên với cà phê rang mộc, mang đến trải nghiệm độc đáo và thơm ngon.",
    image: "/cf_xoai.jpg",
  },
  {
    title: "Cà Phê Arabica",
    category: "Coffee",
    description:
      "Hạt Arabica tuyển chọn từ vùng cao nguyên Việt Nam, mang hương vị nhẹ nhàng, tinh tế và đậm đà.",
    image: "/cf_ara.jpg",
  },
  {
    title: "Cà Phê Bạc Hà",
    category: "Coffee",
    description:
      "Cà phê kết hợp hương bạc hà tươi mát, sảng khoái, lý tưởng để bắt đầu một ngày mới đầy năng lượng.",
    image: "/cf_bh.jpg",
  },
  {
    title: "Cà Phê Dừa",
    category: "Coffee",
    description:
      "Hương dừa ngọt ngào kết hợp cà phê rang vừa, tạo nên thức uống độc đáo, thơm lừng và hấp dẫn.",
    image: "/cf_dua.jpg",
  },
  {
    title: "Nước Mắm Phú Nhĩ",
    category: "Condiments",
    description:
      "Nước mắm truyền thống Phú Nhĩ, lên men tự nhiên, hương vị đậm đà, thích hợp cho mọi món ăn Việt.",
    image: "/nuocmam.jpg",
  },
 {
    title: "Cà Phê Xoài",
    category: "Coffee",
    description:
      "Hòa quyện hương xoài tự nhiên với cà phê rang mộc, mang đến trải nghiệm độc đáo và thơm ngon.",
    image: "/cf_xoai.jpg",
  },
  {
    title: "Cà Phê Arabica",
    category: "Coffee",
    description:
      "Hạt Arabica tuyển chọn từ vùng cao nguyên Việt Nam, mang hương vị nhẹ nhàng, tinh tế và đậm đà.",
    image: "/cf_ara.jpg",
  },
  {
    title: "Cà Phê Bạc Hà",
    category: "Coffee",
    description:
      "Cà phê kết hợp hương bạc hà tươi mát, sảng khoái, lý tưởng để bắt đầu một ngày mới đầy năng lượng.",
    image: "/cf_bh.jpg",
  },
  {
    title: "Cà Phê Dừa",
    category: "Coffee",
    description:
      "Hương dừa ngọt ngào kết hợp cà phê rang vừa, tạo nên thức uống độc đáo, thơm lừng và hấp dẫn.",
    image: "/cf_dua.jpg",
  },
  {
    title: "Nước Mắm Phú Nhĩ",
    category: "Condiments",
    description:
      "Nước mắm truyền thống Phú Nhĩ, lên men tự nhiên, hương vị đậm đà, thích hợp cho mọi món ăn Việt.",
    image: "/nuocmam.jpg",
  },
  {
    title: "Cà Phê Xoài",
    category: "Coffee",
    description:
      "Hòa quyện hương xoài tự nhiên với cà phê rang mộc, mang đến trải nghiệm độc đáo và thơm ngon.",
    image: "/cf_xoai.jpg",
  },
  {
    title: "Cà Phê Arabica",
    category: "Coffee",
    description:
      "Hạt Arabica tuyển chọn từ vùng cao nguyên Việt Nam, mang hương vị nhẹ nhàng, tinh tế và đậm đà.",
    image: "/cf_ara.jpg",
  },
];


export default function ProductSlider() {
  return (
    <div className="relative w-full">
     <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={15}
        slidesPerView="auto"
        centeredSlides={true}
        centeredSlidesBounds={true}
        loop={true}
        autoplay={{ delay: 4000 }}
        navigation={{
          nextEl: ".swiper-button-next-custom",
          prevEl: ".swiper-button-prev-custom",
        }}
        style={{
          paddingLeft: "120px",
          paddingRight: "120px",
        }}
      >
        {products.map((product, index) => (
          <SwiperSlide key={index} className="!w-[350px] md:!w-[410px]">
            <motion.div
              className="relative !w-[350px] md:!w-[410px] h-[480px] overflow-hidden rounded-xl cursor-pointer group"
              initial="rest"
              whileHover="hover"
              animate="rest"
            >
              {/* Image */}
              <img
                src={product.image}
                alt={product.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Span + H3 */}
              <motion.div
                className="absolute bottom-0 left-0 w-full px-6 py-6 bg-gradient-to-t from-[#1f4e3d] via-[#1f4e3d]/85 to-transparent z-20"
              
              >
                <motion.span
                  className="text-md text-yellow-300 block"
                  variants={{ rest: { y: 0 }, hover: { y: -95 } }}
                  transition={{ duration: 0.5 }}
                >
                  {product.category}
                </motion.span>
                <motion.h3
                  className="text-2xl text-white font-semibold"
                  variants={{ rest: { y: 0 }, hover: { y: -95 } }}
                  transition={{ duration: 0.5 }}
                >
                  {product.title}
                </motion.h3>
              </motion.div>

              {/* Description */}
              <motion.p
                className="absolute left-0 bottom-[30px] w-[calc(100%-48px)] mx-6 z-100 text-white text-[16px] leading-relaxed opacity-0"
                variants={{
                  rest: { opacity: 0, y: 20 },
                  hover: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              >
                {product.description}
              </motion.p>

              {/* Arrow icon */}
              <motion.div
                className="absolute right-5 top-5 p-4 rounded-full bg-amber-300 opacity-0 scale-75"
                variants={{
                  rest: { opacity: 0, scale: 0.75, y: -10 },
                  hover: { opacity: 1, scale: 1, y: 0 },
                }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
              >
                <ArrowRight color="white" size={26} />
              </motion.div>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation buttons */}
      <div className="hidden md:block absolute top-1/2 -translate-y-1/2 left-25 z-50">
      
        <div className="swiper-button-prev-custom p-3 rounded-full bg-green-600 hover:bg-green-700 transition-colors cursor-pointer">
          <ArrowLeft color="white" size={24} />
        </div>
       
      </div>
      <div className="hidden  md:block absolute top-1/2 -translate-y-1/2 right-25 z-50">
        <div className="swiper-button-next-custom p-3 rounded-full bg-green-600 hover:bg-green-700 transition-colors cursor-pointer">
          <ArrowRight color="white" size={24} />
        </div>
      </div>
    </div>
  );
}

