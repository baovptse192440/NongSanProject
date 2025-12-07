"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Minus, Phone, Plus, Wheat } from "lucide-react";

export default function FaqSection() {
  const [isOpen, setOpen] = useState(false);

  const faqs = [
    {
      q: "What product lines do you import and distribute?",
      a: "We supply premium Vietnamese coffee, fresh agricultural products (vegetables, herbs, crops), dried fruits and nuts, Asian specialty foods, spices and seasonings, and processed/packaged foods for the Australian market.",
    },
    {
      q: "Do you provide certifications and compliance documents?",
      a: "Yes. We provide all required documentation for Australian import compliance, including origin, quality certifications, and food safety records where applicable.",
    },
    {
      q: "What are typical MOQs and lead times?",
      a: "MOQs vary by category. Coffee and packaged foods usually start from pallet quantities; fresh produce depends on seasonality. Standard lead times range from 2–6 weeks, subject to product availability and shipping schedules.",
    },
    {
      q: "Do you offer private label (OEM) or custom packaging?",
      a: "Yes. We support private label and tailored packaging for eligible SKUs, subject to design approval, MOQ, and production timelines.",
    },
    {
      q: "How do you ensure product quality and consistency?",
      a: "We work with vetted producers, implement strict supplier screening, and perform batch-level checks. Cold-chain and proper storage are used where required to maintain freshness and quality.",
    },
    {
      q: "Which regions in Australia do you service?",
      a: "We supply nationwide through our logistics partners, with regular deliveries to major hubs in VIC, NSW, QLD, SA, and WA.",
    },
    {
      q: "What payment and shipping terms are available?",
      a: "Flexible terms can be arranged depending on order size and product type. We support common trade terms and coordinate sea or air freight as needed.",
    },
    {
      q: "How can I place a wholesale order or request samples?",
      a: "Contact our team for a product catalogue, pricing, and samples. We will guide you through selection, documentation, and logistics to ensure a smooth onboarding.",
    },
  ];
  const [active, setActive] = useState(0);

  return (
    <section className=" bg-white">
      <div className="container mx-auto grid lg:grid-cols-2 gap-12 px-6">
        
       {/* LEFT CONTENT – WITH PREMIUM ANIMATIONS */}
<motion.div
  initial="hidden"
  whileInView="show"
  viewport={{ once: true, amount: 0.25 }}
  variants={{
    hidden: { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.15,
      },
    },
  }}
  className="space-y-6"
>
  {/* Subtitle */}
  <motion.h4
    variants={{
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0 },
    }}
    className="text-green-700 tracking-tight font-semibold mb-0 flex items-center gap-2"
  >
    Support & FAQs
    <Wheat className="w-6 h-6 text-yellow-400" />
  </motion.h4>

 <motion.h2
  initial={{ opacity: 0, x: -50 }}
  whileInView={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.8, ease: "easeOut" }}
  viewport={{ once: true }}
  className="text-5xl font-semiboldleading-tight text-[#164333] "
>
  <span className="block  tracking-tight text-[#43aa5c]">
    Frequently Asked
  </span>

  <span className="relative  tracking-tight inline-block mt-2">
    Questions
    <span className="absolute left-0 bottom-1 w-full h-3 bg-[#f8c32c] -z-10 rounded-md"></span>
  </span>
</motion.h2>


  {/* Description */}
  <motion.p
    variants={{
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0 },
    }}
    className="text-gray-600 mt-4"
  >
   We're here to help with wholesale, compliance, logistics, and product enquiries for the Australian market.
  </motion.p>

  {/* VIDEO SECTION */}
  <motion.div
    variants={{
      hidden: { opacity: 0, scale: 0.9 },
      show: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, ease: "easeOut" },
      },
    }}
    className="mt-8 relative rounded-xl h-[200px] w-[75%] overflow-hidden group cursor-pointer"
    whileHover={{
      scale: 1.02,
      boxShadow: "0px 15px 30px rgba(0,0,0,0.18)",
      transition: { type: "spring", stiffness: 140, damping: 12 },
    }}
  >
    <img
      src="QA.jpg"
      
      className="rounded-xl object-cover w-full h-full"
    />

    {/* Play Overlay */}
    <motion.div
      onClick={() => setOpen(true)}
      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
    >
      <motion.div
        whileHover={{ scale: 1.15 }}
        className="w-20 h-20 rounded-full border border-white flex items-center justify-center"
      >
        <svg width="60" height="60">
          <polygon fill="white" points="20,15 45,30 20,45" />
        </svg>
      </motion.div>
    </motion.div>
  </motion.div>

  {/* CTA + PHONE */}
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      show: {
        opacity: 1,
        y: 0,
        transition: { delay: 0.4 },
      },
    }}
    className="mt-10 flex items-start gap-10"
  >
    {/* CTA BUTTON */}
   <motion.a
  href="/contact"
  whileHover={{
    scale: 1.07,
    backgroundColor: "#ffcf3f",
    boxShadow: "0px 8px 20px rgba(252,185,0,0.35)",
  }}
  whileTap={{ scale: 0.95 }}
  className="
    bg-[#fcb900] 
    text-white 
    px-6 py-3 
    md:px-8 md:py-3 
    rounded-lg 
    shadow-md 
    transition 
    font-semibold 
    text-sm md:text-base 
    inline-block 
    text-center
  "
>
Contact Us
</motion.a>


   {/* PHONE BOX */}
<motion.div
  whileHover={{
    scale: 1.06,
    boxShadow: "0 10px 25px rgba(252,185,0,0.28)",
  }}
  transition={{ type: "spring", stiffness: 120, damping: 12 }}
  className="
    flex items-center gap-3 
    sm:gap-4
  "
>
  {/* ICON WRAPPER */}
  <div
    className="
      p-2.5 sm:p-3 
      rounded-full 
      bg-[#fcb900] 
      text-green-700 
      shadow-md 
      flex items-center justify-center
    "
  >
    <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
  </div>

  {/* TEXT */}
  <div className="leading-tight">
    <h3
      className="
        font-bold 
        text-base sm:text-lg 
        text-gray-900
      "
    >
      +61.415.616.789
    </h3>
    <p className="text-gray-600 text-xs sm:text-sm">Business & Wholesale Enquiries</p>
  </div>
</motion.div>

  </motion.div>
</motion.div>

{/* RIGHT SIDE – ACCORDION */}
<motion.div
  initial="hidden"
  whileInView="show"
  viewport={{ once: true, amount: 0.2 }}
  variants={{
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.15, duration: 0.4 },
    },
  }}
>
  {faqs.map((item, index) => {
    const isActive = active === index;

    return (
      <motion.div
        key={index}
        onClick={() => setActive(isActive ? -1 : index)}
        variants={{
          hidden: { opacity: 0, y: 20 },
          show: { opacity: 1, y: 0 },
        }}
        whileHover={{
          scale: 1.01,
          transition: { type: "spring", stiffness: 120, damping: 12 },
        }}
        animate={{
          borderColor: isActive ? "#F8C32C" : "#dddddd",
          boxShadow: isActive
            ? "0px 6px 18px rgba(248, 195, 44, 0.25)"
            : "0px 0px 0px rgba(0,0,0,0)",
          paddingBottom: isActive ? 26 : 16,
        }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="cursor-pointer border  px-4 py-4 rounded-xl mb-4"
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <motion.h3
            animate={{
              color: isActive ? "#F8C32C" : "#164333",
              x: isActive ? 3 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="text-lg font-semibold"
          >
            {item.q}
          </motion.h3>

          {/* Icon */}
          <motion.span
  animate={{
    rotate: isActive ? 180 : 0,
    color: isActive ? "#F8C32C" : "#777",
  }}
  transition={{
    type: "spring",
    stiffness: 180,
    damping: 12,
  }}
  className="text-xl"
>
  {isActive ? <Minus size={18} /> : <Plus size={18} />}
</motion.span>
        </div>

        {/* CONTENT */}
        <motion.div
          initial={false}
          animate={{
            height: isActive ? "auto" : 0,
            opacity: isActive ? 1 : 0,
          }}
          transition={{
            height: { duration: 0.38 },
            opacity: { duration: 0.25 },
          }}
          className="overflow-hidden"
        >
          <motion.p
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{
              opacity: isActive ? 1 : 0,
              y: isActive ? 0 : -10,
              scale: isActive ? 1 : 0.98,
            }}
            transition={{ duration: 0.34, ease: "easeOut" }}
            className="text-gray-700 mt-3 pl-1 pr-2"
          >
            {item.a}
          </motion.p>
        </motion.div>
      </motion.div>
    );
  })}
</motion.div>



      </div>
    </section>
  );
}

