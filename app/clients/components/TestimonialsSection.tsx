"use client";

import { motion } from "framer-motion";
import { Star,ArrowLeft, ArrowRight , Quote } from "lucide-react";
import { GiWheat } from "react-icons/gi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
const subHeading = "Testimonials";
const headingText = "From Our Partners & Customers!";
const testimonials = [
  {
    name: "Michael Chen",
    position: "CEO, Fresh Market Australia",
    avatar: "avatar_1.jpg",
    image: "chili.png",
    quote: "AusGlobal Connection has been our trusted partner for over 3 years. Their Vietnamese coffee and agricultural products consistently meet our quality standards. Excellent service and reliable supply chain.",
    rating: 5,
  },
  {
    name: "Sarah Williams",
    position: "Procurement Manager, Asian Foods Co.",
    avatar: "avatar_1.jpg",
    image: "chili.png",
    quote: "Working with AusGlobal Connection has transformed our product offerings. The authentic flavors of Vietnamese coffee and Asian specialty foods have been a huge hit with our customers. Highly recommended!",
    rating: 5,
  },
  {
    name: "David Thompson",
    position: "Restaurant Owner, Melbourne",
    avatar: "avatar_1.jpg",
    image: "chili.png",
    quote: "The quality of fresh agricultural products from AusGlobal Connection is outstanding. Our customers love the authentic Vietnamese herbs and vegetables. Great partnership and consistent quality.",
    rating: 5,
  },
  {
    name: "Emma Rodriguez",
    position: "Retail Chain Director",
    avatar: "avatar_1.jpg",
    image: "chili.png",
    quote: "AusGlobal Connection delivers premium products with transparent sourcing. Their dried fruits and nuts are top-quality, and their commitment to compliance makes them our preferred supplier.",
    rating: 5,
  },
  {
    name: "James Anderson",
    position: "Food Import Specialist",
    avatar: "avatar_1.jpg",
    image: "chili.png",
    quote: "Professional service, authentic products, and reliable logistics. AusGlobal Connection understands the Australian market and delivers exactly what we need. A true business partner.",
    rating: 5,
  },
  {
    name: "Lisa Park",
    position: "Grocery Store Owner, Sydney",
    avatar: "avatar_1.jpg",
    image: "chili.png",
    quote: "Our customers keep coming back for AusGlobal's Vietnamese coffee and Asian specialty foods. The authentic taste and quality are unmatched. Thank you for bringing these products to Australia!",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  // Split text thành array các ký tự
  const splitText = headingText.split("");

  return (
    <section className="relative bg-[#F8F7F0]  py-20 ">
        <div className="absolute">
            <img src="dust-bg.png" alt="" />
        </div>
      <div className="container mx-auto px-6 text-center md:text-left">
        {/* Subheading */}
        <div className="flex flex-col justify-center items-center">

        
        <h4 className="flex items-center justify-center md:justify-start gap-2 text-green-700 text-lg font-semibold mb-4 relative">
          
          <span className="relative overflow-hidden">
            
            {subHeading}
          </span>
          <GiWheat size={28} color="yellow" />
        </h4>

        {/* Main heading */}
        <h2 className="text-[#164333]  text-[46px] font-bold leading-[54px] tracking-[-1px]">
            Feedback From
        </h2>
        <h2 className="text-[#164333]  text-[46px] font-bold leading-[54px] tracking-[-1px] mb-5 ">
            our Community!
        </h2>
        {/* Paragraph */}
        <motion.p
          className=" text-[17px] font-normal text-center leading-7 tracking-[-0.2px] text-[#797F7D]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          Australian customers and business partners consistently praise AusGlobal Connection for exceptional product quality, authentic flavors, and reliable service. Their feedback highlights our commitment to bringing the finest Vietnamese and Asian products to Australia.
        </motion.p>
      </div>
       <div className="relative w-full py-10 group">
      <Swiper
        modules={[Navigation, Autoplay, Pagination]}
        slidesPerView={3}
        spaceBetween={20}
        centeredSlides={false}
        loop={true}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        navigation={{
          nextEl: ".swiper-button-next-custom",
          prevEl: ".swiper-button-prev-custom",
        }}
        pagination={{
          el: ".swiper-pagination",
          clickable: true,
        }}
        breakpoints={{
          320: { slidesPerView: 1, spaceBetween: 15 },
          768: { slidesPerView: 2, spaceBetween: 15 },
          1024: { slidesPerView: 3, spaceBetween: 20 },
        }}
      >

        {testimonials.map((item, index) => (
         <SwiperSlide key={index} className="py-4">
  <div className="
    relative bg-white rounded-2xl shadow-md 
    overflow-hidden cursor-pointer
    px-7 py-10
    h-[460px] sm:h-[500px] md:h-[520px]
    flex flex-col
  ">
    
    {/* Background Icon */}
    <div className="absolute h-full opacity-30 left-0 top-0">
      <img src="chili.png" alt="" className="h-full" />
    </div>

    {/* Background Image */}
    <img
      src={item.image}
      alt=""
      className="absolute top-0 left-0 h-full w-full object-cover opacity-10"
    />

    {/* Quote Icon */}
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-4xl text-yellow-500 z-10">
      <Quote className="w-7 h-7" />
    </div>

    {/* Avatar + Info */}
    <div className="flex gap-5 mb-5 relative z-10">
      <div className="w-[70px] h-[70px] sm:w-20 sm:h-20 shrink-0">
        <img
          className="w-full h-full rounded-full object-cover"
          src={item.avatar}
          alt={item.name}
        />
      </div>

      <div className="flex flex-col justify-center">
        <h3 className="text-xl md:text-2xl font-semibold text-[#164333] mb-1">
          {item.name}
        </h3>
        <h4 className="text-lg md:text-xl font-medium text-[#F8C32C]">
          {item.position}
        </h4>
      </div>
    </div>

    {/* Quote Text – CLAMPED */}
    <p
      className="
        text-base md:text-lg leading-7 text-[#164333]
        relative z-10
        line-clamp-4   /* Giữ form UI, không cho text đẩy card cao */
        flex-1         /* Chiếm đều không gian còn lại */
      "
    >
      "{item.quote}"
    </p>

    {/* Rating */}
    <ul className="flex mt-4 relative z-10">
      {Array.from({ length: item.rating }).map((_, i) => (
        <li key={i}>
          <Star color="#FF9529" fill="#FF9529" size={20} strokeWidth={1.5} />
        </li>
      ))}
    </ul>
  </div>
</SwiperSlide>


        ))}
      </Swiper>

      {/* Navigation Buttons */}
      <div className="absolute top-1/2 -translate-y-1/2 left-[-25px] z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="swiper-button-prev-custom p-3 rounded-full bg-green-600 hover:bg-green-700 transition-colors cursor-pointer">
          <ArrowLeft color="white" size={24} />
        </div>
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 right-[-25px] z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="swiper-button-next-custom p-3 rounded-full bg-green-600 hover:bg-green-700 transition-colors cursor-pointer">
          <ArrowRight color="white" size={24} />
        </div>
      </div>
    </div>
    <div className="swiper-pagination mt-6"></div>
      </div>
      

    </section>
  );
}

