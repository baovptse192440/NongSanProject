"use client";

import { useState } from 'react';
import Link from 'next/link';
import {BellRing,CircleUserRound,ShoppingCart,Waypoints,CloudDownload,Store,Search,Menu } from 'lucide-react';
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="Header">
      {/* Top Bar */}
      <div className="flex bg-[#10723a] h-[35px] text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-end h-full">
            {/* Hotline */}
            <div className="flex items-center justify-center text-sm pr-4 pl-5">
              HOTLINE 
              <a href="tel:0786457401" className="font-bold text-sm pl-1 hover:text-yellow-300 transition-colors">
                0786457401
              </a>
            </div>
            
            {/* Download App */}
            <div className="relative flex items-center justify-center text-sm pr-4 pl-5 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-px before:h-4 before:bg-white/30">
              <button className="hover:text-yellow-300 transition-colors flex items-center">
                <span className="mr-1"><CloudDownload /></span>
                Tải ứng dụng
              </button>
            </div>
            
            {/* Collaborator */}
            <div className="relative flex items-center justify-center text-sm pr-4 pl-5 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-px before:h-4 before:bg-white/30">
              <Link href="/cong-tac-vien" className="hover:text-yellow-300 transition-colors flex items-center">
                <span className="mr-1"><Waypoints /></span>
                Dành cho Cộng tác viên
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="flex bg-[#0a923c] h-[68px] text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <Link className="flex items-center" href="/">
              <div className="w-[200px] h-[70px]">
                <img className="w-[200px] h-[70px] py-2" src="/logo_AU.png" alt="" />
              </div>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <form action="/search" className="flex w-full">
                <input 
                  type="text" 
                  placeholder="Nhập nội dung tìm kiếm..." 
                  className="flex-1 bg-white px-4 py-2 text-gray-800 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <button className="bg-white px-6 rounded-r-lg font-semibold transition-colors">
                  <Search color='black'/>
                </button>
              </form>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-6">
              {/* Search Button - Mobile */}
              <button 
                className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <span className="text-xl"><Search /></span>
              </button>

              {/* Notifications */}
              <Link href="/thong-bao" className="hidden sm:flex items-center hover:text-yellow-300 transition-colors group relative">
                <span className="text-xl mr-1"><BellRing /></span>
                <span className="hidden lg:inline">Thông báo</span>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  3
                </span>
              </Link>

              {/* Login */}
              <Link href="/dang-nhap" className="hidden sm:flex items-center hover:text-yellow-300 transition-colors">
                <span className="text-xl mr-1"><CircleUserRound /></span>
                <span className="hidden lg:inline">Đăng nhập</span>
              </Link>

              {/* Register */}
              <Link href="/dang-ky" className="hidden sm:flex items-center hover:text-yellow-300 transition-colors">
                <span className="hidden lg:inline">Đăng ký</span>
              </Link>

              {/* Cart */}
              <Link href="/gio-hang" className="flex items-center hover:text-yellow-300 transition-colors group relative">
                <span className="text-xl mr-1"><ShoppingCart /></span>
                <span className="hidden lg:inline">Giỏ hàng</span>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  0
                </span>
              </Link>

              {/* Mobile Menu Button */}
              <button 
                className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                  <span className={`block w-full h-0.5 bg-white transition-all ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                  <span className={`block w-full h-0.5 bg-white transition-all ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                  <span className={`block w-full h-0.5 bg-white transition-all ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <div className="md:hidden bg-white py-3 px-4 border-b">
          <form action="/search" className="flex">
            <input 
              type="text" 
              placeholder="Nhập nội dung tìm kiếm..." 
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button className="bg-green-500 hover:bg-green-600 text-white px-4 rounded-r-lg transition-colors">
              🔍
            </button>
          </form>
        </div>
      )}

      {/* Navigation Menu */}
      <div className="bg-[#0a923c] shadow-md border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Categories Menu */}
            <div className="flex items-center">
              <button className="flex items-center bg-green-600 text-white px-4 py-3 font-semibold hover:bg-green-700 transition-colors">
                <span className="mr-2"><Menu strokeWidth={1.75} /></span>
                Danh mục sản phẩm
              </button>
              
              {/* Main Navigation */}
              <nav className="hidden lg:flex items-center space-x-8 ml-8">
                <Link href="/sale" className="py-3 text-red-500 font-semibold hover:text-red-600 transition-colors flex items-center">
                  <span className="mr-1">🔥</span>
                  SALE 11.11
                </Link>
                <Link href="/di-cho-online" className="py-3 text-white hover:text-green-600 transition-colors">
                  ĐI CHỢ ONLINE
                </Link>
                <Link href="/trai-cay" className="py-3 text-white hover:text-green-600 transition-colors">
                  TRÁI CÂY
                </Link>
                <Link href="/tra-ca-phe" className="py-3 text-white hover:text-green-600 transition-colors">
                  TRÀ - CÀ PHÊ
                </Link>
                <Link href="/dac-san" className="py-3 text-white hover:text-green-600 transition-colors">
                  ĐẶC SẢN
                </Link>
              </nav>
            </div>

            {/* Location Selector */}
            <div className="hidden md:flex items-center text-sm text-white">
              <span className="mr-1"><Store /></span>
              Giao hàng từ kho: 
              <select className="ml-2 border-none bg-transparent focus:outline-none font-semibold text-white">
                <option>Tân Phú</option>
                <option>Quận 1</option>
                <option>Quận 7</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="space-y-4">
              <Link href="/thong-bao" className="flex items-center py-2 border-b border-gray-200">
                <span className="mr-3">🔔</span>
                Thông báo của tôi
              </Link>
              
              <Link href="/dang-nhap" className="flex items-center py-2 border-b border-gray-200">
                <span className="mr-3">👤</span>
                Đăng nhập
              </Link>
              
              <Link href="/dang-ky" className="flex items-center py-2 border-b border-gray-200">
                Đăng ký
              </Link>

              <div className="flex items-center py-2 border-b border-gray-200">
                <span className="mr-3">📍</span>
                Giao hàng từ kho: <b className="text-green-600 ml-1">Tân Phú</b>
              </div>

              {/* Mobile Navigation */}
              <nav className="pt-4 space-y-3">
                <Link href="/sale" className="block py-2 text-red-500 font-semibold">
                  🔥 SALE 11.11
                </Link>
                <Link href="/di-cho-online" className="block py-2 text-gray-700">
                  🛒 ĐI CHỢ ONLINE
                </Link>
                <Link href="/trai-cay" className="block py-2 text-gray-700">
                  🍎 TRÁI CÂY
                </Link>
                <Link href="/tra-ca-phe" className="block py-2 text-gray-700">
                  ☕ TRÀ - CÀ PHÊ
                </Link>
                <Link href="/dac-san" className="block py-2 text-gray-700">
                  🎁 ĐẶC SẢN
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}