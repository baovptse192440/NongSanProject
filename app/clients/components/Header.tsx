"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "lucide-react";
import Link from "next/link";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const logoSrc = scrolled ? "/logo_AU.png" : "/logo_AU_White.png";

  const linkColor = scrolled
    ? "text-gray-800 hover:text-green-700"
    : "text-white hover:text-yellow-300";

  const langColor = scrolled ? "text-gray-800" : "text-white";

  return (
    <>
      {/* ====== OVERLAY MENU ====== */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black z-40 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ====== HEADER ====== */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{
          y: 0,
          opacity: 1,
          backgroundColor: scrolled
            ? "rgba(255,255,255,0.85)"
            : "rgba(255,255,255,0)",
          backdropFilter: scrolled ? "blur(12px)" : "blur(0px)",
          boxShadow: scrolled
            ? "0 6px 25px rgba(0,0,0,0.1)"
            : "0 0 0 rgba(0,0,0,0)",
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed w-full top-0 left-0 z-50"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between py-4">

            {/* ====== LOGO ====== */}
            <motion.a
              href="/"
              className="flex items-center gap-3"
              animate={{ scale: scrolled ? 0.9 : 1 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={logoSrc}
                alt="AusGlobal"
                className="h-12 md:h-14 lg:h-16 w-auto object-contain"
              />
            </motion.a>

            {/* ====== DESKTOP NAVIGATION ====== */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-10">
              {[
                { label: "Home", href: "/" },
                { label: "About", href: "/about" },
                { label: "Services", href: "/services" },
                { label: "Contact", href: "/contact" },
              ].map((item, index) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  className={`${linkColor} font-medium text-base lg:text-lg relative group`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-300"></span>
                </motion.a>
              ))}
            </nav>

            {/* ====== LANGUAGE + ACCOUNT + MOBILE MENU ====== */}
            <div className="flex items-center gap-3 md:gap-4">

              {/* ====== LANGUAGE SWITCH (DESKTOP ONLY) ====== */}
              <motion.div
                className={`hidden lg:flex border ${
                  scrolled ? "border-gray-300" : "border-white/50"
                } px-3 py-2 rounded-xl gap-2 cursor-pointer backdrop-blur-sm`}
                whileHover={{ scale: 1.07 }}
                transition={{ duration: 0.2 }}
              >
                <button className={`${langColor} font-semibold`}>VI</button>
                <span className={langColor}>|</span>
                <button className={`${langColor} font-semibold`}>EN</button>
              </motion.div>

              {/* ====== ACCOUNT ICON ====== */}
              <Link href="/login">
                <motion.button
                  className={`p-2 rounded-full ${
                    scrolled 
                      ? "bg-gray-100 hover:bg-gray-200 text-gray-800" 
                      : "bg-white/20 hover:bg-white/40 text-white backdrop-blur-md"
                  } transition`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Account"
                >
                  <User className="w-5 h-5 md:w-6 md:h-6" />
                </motion.button>
              </Link>

              {/* ====== MOBILE TOGGLE ====== */}
              <motion.button
                className="md:hidden p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md transition"
                onClick={() => setMenuOpen(true)}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  className={`w-7 h-7 ${scrolled ? "text-gray-900" : "text-white"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ====== MOBILE MENU DRAWER ====== */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: menuOpen ? "0%" : "100%" }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="fixed top-0 right-0 w-[80%] max-w-[420px] h-full bg-white z-50 shadow-2xl p-8 rounded-l-3xl"
      >
        <button
          className="absolute top-6 right-6 text-gray-700"
          onClick={() => setMenuOpen(false)}
        >
          <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <nav className="flex flex-col mt-14 space-y-8">
          {[
            { label: "Home", href: "/" },
            { label: "About", href: "/about" },
            { label: "Services", href: "#services" },
            { label: "Contact", href: "#contact" },
          ].map((item, index) => (
            <motion.a
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="text-2xl text-gray-800 font-semibold hover:text-green-600 transition"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.06 * index }}
            >
              {item.label}
            </motion.a>
          ))}
        </nav>

      </motion.div>
    </>
  );
}

