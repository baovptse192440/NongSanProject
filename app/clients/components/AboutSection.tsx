"use client";

import { motion } from "framer-motion";
import { Phone, Tractor, Wheat } from "lucide-react";

const featureData = [
  {
    title: "Authentic Flavors",
    desc: "Genuine Vietnamese and Asian culinary traditions, preserving authentic tastes for Australian consumers.",
  },
  {
    title: "Premium Quality",
    desc: "Carefully sourced products that meet strict Australian import standards for safety and nutrition.",
  },
];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative py-12 sm:py-16 md:py-20 lg:py-24 bg-gray-50 overflow-hidden"
    >
      {/* Background decorative - hidden on mobile */}
      <div className="absolute bottom-0 right-0 w-[40%] opacity-60 pointer-events-none hidden md:block">
        <img src="/bg-web.png" alt="Decorative background" className="w-full h-auto" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
          {/* ------- IMAGE SECTION ------- */}
          <motion.div
            className="relative w-full h-[320px] sm:h-[380px] md:h-[450px] lg:h-[550px] flex justify-center items-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            {/* Main image */}
            <motion.img
              src="/about_11.jpg"
              alt="Vietnamese agricultural products for export"
              className="absolute w-[200px] h-[240px] sm:w-[250px] sm:h-[300px] md:w-[350px] md:h-[400px] lg:w-[400px] lg:h-[450px] border-4 sm:border-6 md:border-8 border-white rounded-xl sm:rounded-2xl shadow-2xl top-0 left-0 sm:left-4 z-10 object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5 }}
            />

            {/* Secondary image */}
            <motion.img
              src="/about_02.jpg"
              alt="AusGlobal Connection warehouse and logistics"
              className="absolute w-[180px] h-[220px] sm:w-[220px] sm:h-[260px] md:w-[280px] md:h-[320px] lg:w-[310px] lg:h-[360px] border-4 sm:border-6 md:border-8 border-white rounded-xl sm:rounded-2xl shadow-xl z-20 bottom-0 right-0 sm:right-4 object-cover"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
            />
          </motion.div>

          {/* ------- CONTENT SECTION ------- */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            viewport={{ once: true }}
            className="mt-8 md:mt-0"
          >
            <h4 className="inline-flex text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-green-700 tracking-wide mb-3 sm:mb-4">
              Trusted import & distribution partner
            </h4>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 sm:mb-6 text-[#164333] tracking-tight">
              About Us - <span className="text-green-700">AusGlobal Connection</span>
            </h1>

            <p className="text-gray-700 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed mb-6 sm:mb-8 md:mb-10">
              AusGlobal Connection is a reputable import and distribution company based in Australia,
              specializing in high-quality Vietnamese agricultural products and Asian food for the Australian market.
              We bring authentic flavors and nutritious products that reflect the richness of Vietnamese agriculture
              and Asian culinary traditions.
            </p>

            {/* FEATURE LIST */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8 md:mb-10">
              {featureData.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: i * 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="shrink-0">
                      <Wheat className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">
                        {f.title}
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-sm md:text-base leading-relaxed">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* LIST WITH ICON */}
            <div className="mb-6 sm:mb-8">
              {[
                "Premium Vietnamese agricultural products",
                "Authentic Asian food with traditional flavors",
                "Fully compliant import and distribution services",
              ].map((text, i) => (
                <motion.div
                  key={i}
                  className="flex gap-2 sm:gap-3 items-center pb-2 sm:pb-3 text-gray-700 text-sm sm:text-base md:text-lg"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: i * 0.15 }}
                  viewport={{ once: true }}
                >
                  <Tractor className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-orange-500 shrink-0" />
                  <span>{text}</span>
                </motion.div>
              ))}
            </div>

            {/* ACTION BUTTON + CONTACT */}
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 sm:gap-6 md:gap-8 mt-4 sm:mt-6">
              {/* CTA button */}
              <motion.a
                href="#contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="py-2.5 sm:py-3 px-5 sm:px-7 bg-[#F8C32C] text-white font-semibold rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-shadow text-sm sm:text-base text-center"
              >
                Learn more about AusGlobal
              </motion.a>

              {/* Phone contact */}
              <motion.div
                className="flex items-center gap-3 sm:gap-4"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-center items-center rounded-full bg-[#F8C32C] w-12 h-12 sm:w-14 sm:h-14 shrink-0">
                  <Phone className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                </div>

                <div>
                  <a 
                    href="tel:+61415616789"
                    className="font-bold text-base sm:text-lg md:text-xl block text-[#164333] hover:text-green-700 transition-colors"
                  >
                    +61 415 616 789
                  </a>
                  <div className="text-xs sm:text-sm text-gray-500">
                    Order & partnership hotline
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

