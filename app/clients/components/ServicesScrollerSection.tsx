"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import { GiWheat } from "react-icons/gi";

const services = [
  "Nhập khẩu nông sản sạch",
  "Phân phối thực phẩm chất lượng cao",
  "Giải pháp nông nghiệp bền vững",
  "Kiểm soát nguồn gốc minh bạch",
  "Hỗ trợ đối tác tại Úc",
];


export default function ServicesScrollerSection() {
  const controls = useAnimation();

  useEffect(() => {
    // Khởi động animation infinite scroll
    controls.start({
      x: ["0%", "-50%"], // scroll 1 nửa, duplicate items cho loop
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: 60, // tốc độ scroll
          ease: "linear",
        },
      },
    });
  }, [controls]);

  return (
    <section className="py-7 bg-[#43aa5c] overflow-hidden">
     

       
        {/* Marquee Scroller */}
        <div
          className="overflow-hidden relative group cursor-pointer"
          onMouseEnter={() => controls.stop()}   // hover pause
          onMouseLeave={() =>
            controls.start({
              x: ["0%", "-50%"],
              transition: {
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 40,
                  ease: "linear",
                },
              },
            })
          }
        >
          <motion.ul
            animate={controls}
            className="flex gap-8 whitespace-nowrap"
          >
            {/* Duplicate items để tạo infinite scroll */}
            {[...services, ...services].map((service, idx) => (
              <li
                key={idx}
                className="flex items-center gap-10 text-white font-semibold text-lg md:text-xl flex-shrink-0 transform transition-transform duration-300 hover:scale-105"
              >
                {service}
                <GiWheat color="yellow" size={30} />
              </li>
            ))}
          </motion.ul>
        </div>
      
    </section>
  );
}

