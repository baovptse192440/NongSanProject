"use client";

import { useState, useEffect } from "react";
import Header from "./clients/components/Header";
import SEO from "./clients/components/SEO";
import AboutSection from "./clients/components/AboutSection";
import ServicesSection from "./clients/components/ServiceCardSection";
import ScrollSection from "./clients/components/ServicesScrollerSection";
import TitleSection from "./clients/components/ProductTitleSection";
import Slider from "./clients/components/ProductSlider";
import Feedback from "./clients/components/TestimonialsSection";
import Contact from "./clients/components/CTASection";
import FaqSection from "./clients/components/FaqSection";
import { ChevronLeft, ChevronRight, ArrowDown } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import CoSection from "./clients/components/CooperateSection";
import QC from "./clients/components/BrandSection";
import New from "./clients/components/BlogSection";
import Footer from "./clients/components/Footer";

const slides = [
  {
    src: "hero_banner.jpg",
    title: "Premium Vietnamese Agricultural Products",
    subtitle: "Connecting Vietnam's finest produce to Australia",
  },
  {
    src: "hero1_banner.webp",
    title: "Authentic Asian Specialty Foods",
    subtitle: "Delivering authentic flavors and quality you can trust",
  },
  {
    src: "hero2_banner.jpg",
    title: "Sustainable & Trusted Partnership",
    subtitle: "Committed to quality, transparency, and excellence",
  },
];

// Typing Effect Component
function TypingText({ text, isActive, slideKey }: { text: string; isActive: boolean; slideKey: number }) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setDisplayedText("");
      setCurrentIndex(0);
      return;
    }

    // Reset when slide changes
    setDisplayedText("");
    setCurrentIndex(0);
  }, [slideKey, isActive]);

  useEffect(() => {
    if (!isActive || currentIndex >= text.length) return;

    const timer = setTimeout(() => {
      setDisplayedText(text.slice(0, currentIndex + 1));
      setCurrentIndex(currentIndex + 1);
    }, 60); // Typing speed (slower for better effect)
    
    return () => clearTimeout(timer);
  }, [currentIndex, text, isActive]);

  return (
    <span>
      {displayedText}
      {isActive && currentIndex < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="inline-block w-0.5 h-5 sm:h-6 md:h-7 bg-white ml-1.5 align-middle"
        />
      )}
    </span>
  );
}

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  };

  // Structured Data for Home Page
  const homeStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AusGlobal Connection",
    url: "https://globalconnection.vn",
    logo: "https://globalconnection.vn/logo_AU.png",
    description: "Trusted importer and distributor of premium Vietnamese agricultural products and authentic Asian specialty foods in Australia.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "AU",
      addressLocality: "Australia",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+61-415-616-789",
      contactType: "Customer Service",
      areaServed: "AU",
      availableLanguage: ["en", "vi"],
    },
    sameAs: [
      "https://www.facebook.com/MEETMOREAUSTRALIA",
      "https://globalconnection.vn/",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "500",
    },
  };

  const productStructuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: [
      {
        "@type": "Product",
        name: "Vietnamese Coffee",
        description: "Premium Vietnamese coffee beans and specialty coffee products",
        category: "Coffee",
      },
      {
        "@type": "Product",
        name: "Fresh Agricultural Products",
        description: "High-quality Vietnamese agricultural products",
        category: "Agricultural Products",
      },
      {
        "@type": "Product",
        name: "Asian Specialty Foods",
        description: "Authentic Asian specialty foods and ingredients",
        category: "Food Products",
      },
    ],
  };

  return (
    <main className="relative overflow-x-hidden">
      <SEO
        title="Premium Vietnamese Agricultural Products & Asian Foods in Australia"
        description="AusGlobal Connection imports and distributes premium Vietnamese agricultural products and authentic Asian specialty foods across Australia. Quality guaranteed, authentic flavors, reliable service."
        canonical="https://globalconnection.vn"
        ogImage="/hero_banner.jpg"
        structuredData={[homeStructuredData, productStructuredData]}
      />
      <Header />

      {/* Hero Slider - Enhanced */}
      <div className="relative h-screen w-full overflow-hidden">
        {/* All slides rendered for seamless transition */}
        {slides.map((slide, index) => (
          <motion.div
            key={index}
            initial={false}
            animate={{
              opacity: index === current ? 1 : 0,
              scale: index === current ? 1 : 1.05,
            }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0"
            style={{ zIndex: index === current ? 1 : 0 }}
          >
            {/* Background Image with Slower Parallax */}
            <motion.img
              src={slide.src}
              alt={`${slide.title} - ${slide.subtitle}`}
              className="w-full h-full object-cover"
              style={{
                transform: `translateY(${scrollY * 0.15}px) scale(1.05)`,
              }}
            />

            {/* Simple Modern Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-green-900/20 via-transparent to-yellow-900/15"></div>
          </motion.div>
        ))}

        {/* Center Content - Enhanced with Typing Effect */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center z-10">
          {slides.map((slide, index) => (
            <motion.div
              key={index}
              initial={false}
              animate={{
                opacity: index === current ? 1 : 0,
                y: index === current ? 0 : 20,
              }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="absolute max-w-4xl"
              style={{ pointerEvents: index === current ? "auto" : "none" }}
            >
              {/* Title with Typing Effect - Simple & Modern */}
              <motion.h1
                className="text-white font-semibold leading-tight text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-3 sm:mb-4"
                style={{
                  textShadow: "0 2px 20px rgba(0,0,0,0.5), 0 0 30px rgba(34, 197, 94, 0.2), 0 0 40px rgba(250, 204, 21, 0.15)",
                }}
              >
                <TypingText text={slide.title} isActive={index === current} slideKey={index} />
              </motion.h1>
              
              {/* Subtitle - Simple & Clean */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: index === current ? 1 : 0,
                  y: index === current ? 0 : 10
                }}
                transition={{ delay: slide.title.length * 0.05 + 0.3, duration: 0.6 }}
                className="text-white/90 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
                style={{
                  textShadow: "0 2px 15px rgba(0,0,0,0.4), 0 0 20px rgba(34, 197, 94, 0.15)",
                }}
              >
                {slide.subtitle}
              </motion.p>
            </motion.div>
          ))}
        </div>

        {/* Navigation Arrows - Simple & Modern */}
        <motion.button
          onClick={prevSlide}
          whileHover={{ scale: 1.1, x: -3 }}
          whileTap={{ scale: 0.95 }}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-green-500/30 backdrop-blur-md shadow-md transition-all p-2.5 md:p-3 rounded-full z-20 border border-white/20 hover:border-green-400/50"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </motion.button>

        <motion.button
          onClick={nextSlide}
          whileHover={{ scale: 1.1, x: 3 }}
          whileTap={{ scale: 0.95 }}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-yellow-500/30 backdrop-blur-md shadow-md transition-all p-2.5 md:p-3 rounded-full z-20 border border-white/20 hover:border-yellow-400/50"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </motion.button>

        {/* Dot Indicators - Simple & Modern */}
        <div className="absolute bottom-6 md:bottom-10 w-full flex justify-center gap-2.5 z-20">
          {slides.map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => setCurrent(idx)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className={`
                h-2 rounded-full cursor-pointer transition-all duration-300
                ${idx === current 
                  ? "bg-white w-8 md:w-10 shadow-md" 
                  : "bg-white/40 hover:bg-white/60 w-2"
                }
              `}
            />
          ))}
        </div>

        {/* Scroll Indicator - Simple & Modern */}
        <motion.button
          onClick={scrollToContent}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          whileHover={{ y: 5 }}
          className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <span className="text-xs font-medium tracking-wider uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2 backdrop-blur-sm hover:border-white/60 transition-colors"
          >
            <ArrowDown className="w-4 h-4 text-white" />
          </motion.div>
        </motion.button>
      </div>

     <AboutSection></AboutSection>
      <ServicesSection></ServicesSection>
      <ScrollSection></ScrollSection>
      <TitleSection></TitleSection>
      <Slider></Slider>
      <Feedback></Feedback>
      <Contact></Contact>
      <FaqSection></FaqSection>
      <QC></QC>
      <CoSection></CoSection>
      <New></New>
      <Footer></Footer>
    </main>
  );
}
