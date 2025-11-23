"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BellRing,
  CircleUserRound,
  ShoppingCart,
  Waypoints,
  CloudDownload,
  Store,
  Search,
  Menu,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // STATE DROPDOWN KHO HÀNG
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("Tân Phú");

  // STATE MEGA MENU DESKTOP
  const [hoverMenu, setHoverMenu] = useState<string | null>(null);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
      {/* ▬▬▬ TOP BAR ▬▬▬ */}
      <div className="hidden md:flex bg-[#10723a] text-white h-[35px]">
        <div className="container mx-auto px-4 flex justify-end items-center space-x-6 text-sm">
          <div className="flex items-center space-x-1">
            <span>HOTLINE</span>
            <a
              href="tel:0786457401"
              className="font-bold hover:text-yellow-300 transition"
            >
              0786457401
            </a>
          </div>

          <button className="flex items-center space-x-1 hover:text-yellow-300 transition">
            <CloudDownload size={16} />
            <span>Tải ứng dụng</span>
          </button>

          <Link
            href="/cong-tac-vien"
            className="flex items-center space-x-1 hover:text-yellow-300 transition"
          >
            <Waypoints size={16} />
            <span>Dành cho Cộng tác viên</span>
          </Link>
        </div>
      </div>

      {/* ▬▬▬ MAIN HEADER ▬▬▬ */}
      <div className="bg-[#0a923c] text-white h-[48px] flex items-center">
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* LOGO */}
          <div className="flex justify-start">
            <Link href="/" className="flex items-center ">
              <motion.img
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                src="/logo_AU.png"
                className="w-[120px] h-[40px]"
                alt="AU Logo"
              />
            </Link>
          </div>

          {/* SEARCH DESKTOP */}
          <div className="hidden md:flex justify-center flex-1 ">
            <form className="flex ">
              <input
                type="text"
                placeholder="Nhập nội dung tìm kiếm..."
                className="flex-1 w-[280px] h-[30px] px-4 py-2 bg-white rounded-l-sm text-gray-800 outline-none"
              />
              <button className="bg-white px-4 rounded-r-sm flex justify-center items-center">
                <Search size={20} className="text-green-700" />
              </button>
            </form>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-4 items-center text-sm font-semibold">
            <Link
              href="/thong-bao"
              className="relative group hover:text-yellow-300 transition"
            >
              <div className="flex gap-0.5">
              <BellRing size={20} />
              <span className="absolute left-3 -top-1 -right-1 w-3 h-3 bg-red-500 text-[8px] flex items-center justify-center rounded-full">
                3
              </span>
               Thông báo của tôi 
              </div>
              
            </Link>

            <Link
              href="login"
              className="flex items-center hover:text-yellow-300 transition"
            >
              <CircleUserRound size={24} />
              <span className="hidden lg:inline ml-1">Đăng nhập</span>
            </Link>

            <span className="hidden md:block opacity-50">|</span>

            <Link
              href="register"
              className="hidden sm:inline hover:text-yellow-300 transition"
            >
              Đăng ký
            </Link>

            {/* KHO HÀNG */}
            <div className="hidden md:flex items-center text-sm text-white relative ">
              <div className="flex items-center bg-white/10 hover:bg-white/20 transition px-3 py-2 rounded-lg cursor-pointer">
                <Store size={16} className="mr-2 text-white/90" />
                <span className="opacity-90">Giao từ kho:</span>

                <div className=" relative">
                  <motion.button
                    onClick={() => setOpen(!open)}
                    className="flex items-center font-semibold outline-none"
                  >
                    {selected}
                    <motion.span
                      animate={{ rotate: open ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-1"
                    >
                      <ChevronDown size={16} />
                    </motion.span>
                  </motion.button>

                  <AnimatePresence>
                    {open && (
                      <motion.ul
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                        className="absolute mt-2 left-0 w-[140px] bg-white text-black rounded-xl shadow-lg border overflow-hidden z-50"
                      >
                        {["Tân Phú", "Quận 1", "Quận 7"].map((loc) => (
                          <li
                            key={loc}
                            onClick={() => {
                              setSelected(loc);
                              setOpen(false);
                            }}
                            className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                          >
                            {loc}
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* CART */}
            <Link
              href="/cart"
              className="relative hover:text-yellow-300 m-0"
            >
              <ShoppingCart size={24} />
              <span className="absolute -top-1 -right-2 bg-red-500 w-4 h-4 text-[10px] rounded-full flex justify-center items-center">
                0
              </span>
            </Link>

            {/* MENU MOBILE */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu size={32} />
            </button>
          </div>
        </div>
      </div>

      {/* ▬▬▬ SEARCH MOBILE ▬▬▬ */}
      <div className="md:hidden bg-[#0a923c] px-4 py-2">
        <form className="flex">
          <input
            type="text"
            placeholder="Nhập nội dung tìm kiếm..."
            className="flex-1 h-8 px-3 rounded-l-md text-sm outline-none bg-white"
          />
          <button className="bg-white w-12 rounded-r-md flex justify-center items-center">
            <Search size={20} className="text-[#10723a]" />
          </button>
        </form>
      </div>

      {/* ▬▬▬ NAVIGATION DESKTOP ▬▬▬ */}
      <div className="hidden md:block bg-[#0a923c] h-[48px]">
        <div className="container mx-auto px-2.5 flex items-center justify-between pt-2">
          <div className="flex items-center text-white w-full">
            <button className="flex items-center bg-[#04772f] px-3 py-2.5 text-sm font-semibold hover:text-yellow-300 cursor-pointer transition ">
              <Menu size={20} className="mr-2" />
              DANH MỤC SẢN PHẨM
            </button>

            {/* --- NAVIGATION WITH SUBMENU --- */}
            <nav className="hidden lg:flex space-x-8 ml-8 relative">
              {[
                { title: "ĐI CHỢ ONLINE", key: "cho-online" },
                { title: "TRÁI CÂY", key: "trai-cay" },
                { title: "TRÀ - CÀ PHÊ", key: "tra-ca-phe" },
                { title: "ĐẶC SẢN", key: "dac-san" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onMouseEnter={() => setHoverMenu(item.key)}
                  onMouseLeave={() => setHoverMenu(null)}
                  className="relative"
                >
                  <button className="flex items-center space-x-1 hover:text-yellow-300 transition">
                    <span className="text-sm font-semibold cursor-pointer">{item.title}</span>
                    <ChevronDown size={16} />
                  </button>

                  {/* --- MENU CON (MEGA MENU) --- */}
                  <AnimatePresence>
                    {hoverMenu === item.key && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bg-[#0a923c] text-white w-[260px] rounded-sm shadow-xl p-4 z-50"
                      >
                        <ul className="space-y-2 text-sm">
                          <li className="px-3 py-2 cursor-pointer transition-all duration-200 ease-in-out hover:translate-x-2">
                            Sản phẩm mới
                          </li>
                          <li className="px-3 py-2 cursor-pointer transition-all duration-200 ease-in-out hover:translate-x-2">
                            Sản phẩm bán chạy
                          </li>
                          <li className="px-3 py-2 cursor-pointer transition-all duration-200 ease-in-out hover:translate-x-2">
                            Khuyến mãi
                          </li>
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* ▬▬▬ MOBILE MENU ▬▬▬ */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 md:hidden z-50"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-0 w-full h-full bg-[#0a923c] text-white p-6 flex flex-col"
            >
              {/* HEADER MENU MOBILE */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-2xl font-bold">Menu</span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="text-white text-3xl font-bold"
                >
                  &times;
                </button>
              </div>

              {/* MENU ITEMS */}
              <nav className="flex flex-col gap-4 text-lg">
  <Link
    href="/"
    className="py-2 border-b border-white/20 text-white hover:text-white hover:translate-x-2 transition-transform duration-200"
    onClick={() => setIsMenuOpen(false)}
  >
    Trang chủ
  </Link>

  <Link
    href="/sale"
    className="py-2 border-b border-white/20 hover:translate-x-2 transition-transform duration-200"
    onClick={() => setIsMenuOpen(false)}
  >
    Sale
  </Link>

  {[ 
    { title: "Đi chợ online", key: "cho-online" },
    { title: "Trái cây", key: "trai-cay" },
    { title: "Trà - Cà phê", key: "tra-ca-phe" },
    { title: "Đặc sản", key: "dac-san" },
  ].map((item) => (
    <motion.div
      key={item.key}
      className="flex flex-col border-b border-white/20"
      whileHover={{ x: 8 }} // dịch sang phải 8px
      transition={{ type: "spring", stiffness: 300 }}
    >
      <button
        className="py-2 flex justify-between items-center w-full text-left"
        onClick={() => setIsMenuOpen(false)}
      >
        {item.title}
      </button>
    </motion.div>
  ))}

  <Link
    href="/dang-nhap"
    className="py-2 border-b border-white/20 hover:translate-x-2 transition-transform duration-200"
    onClick={() => setIsMenuOpen(false)}
  >
    Đăng nhập
  </Link>

  <Link
    href="/dang-ky"
    className="py-2 border-b border-white/20 hover:translate-x-2 transition-transform duration-200"
    onClick={() => setIsMenuOpen(false)}
  >
    Đăng ký
  </Link>

  <Link
    href="/gio-hang"
    className="py-2 border-b border-white/20 hover:translate-x-2 transition-transform duration-200"
    onClick={() => setIsMenuOpen(false)}
  >
    Giỏ hàng
  </Link>
</nav>



              {/* KHO HÀNG */}
              <div className="mt-6 border-t border-white/20 pt-4 text-lg">
                Giao hàng từ kho: <b>{selected}</b>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
