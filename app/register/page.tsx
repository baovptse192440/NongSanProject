"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Header from "../common/header";
import Footer from "../common/footer";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: add registration logic here
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Confirm Password:", confirmPassword);
  };

  return (
    <div className="mt-30 flex flex-col bg-[#f5f5f7]">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 sm:p-8"
        >
          <h2 className="text-sm sm:text-xl font-bold text-gray-900 text-center mb-6">
            ĐĂNG KÝ
          </h2>

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Name */}
            <div className="flex flex-col">
              <label htmlFor="name" className="text-sm font-semibold text-gray-700 mb-1">
                Họ và tên
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập họ và tên"
                className="px-2 py-1 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition"
                required
              />
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email"
                className="px-2 py-1 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition"
                required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col relative">
              <label htmlFor="password" className="text-sm font-semibold text-gray-700 mb-1">
                Mật khẩu
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="px-2 py-1 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition w-full"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-10 -translate-y-1/2 text-gray-500 text-sm"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Ẩn" : "Hiện"}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col relative">
              <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 mb-1">
                Nhập lại mật khẩu
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                className="px-2 py-1 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition w-full"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-10 -translate-y-1/2 text-gray-500 text-sm"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "Ẩn" : "Hiện"}
              </button>
            </div>

            {/* Register Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-xl shadow-md flex justify-center items-center transition"
            >
              ĐĂNG KÝ
            </motion.button>

            {/* Login link */}
            <div className="text-center text-sm text-gray-500">
              Bạn đã có tài khoản?{" "}
              <a href="/login" className="text-green-600 font-semibold hover:underline">
                Đăng nhập
              </a>
            </div>
          </form>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
