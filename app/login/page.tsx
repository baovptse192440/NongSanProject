"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Header from "../common/header";
import Footer from "../common/footer";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: add login logic here
    console.log("Email:", email);
    console.log("Password:", password);
  };

  return (
    <div className="mt-30 flex flex-col bg-[#f5f5f7]">
      <Header />

      <main className="flex-1  flex items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 sm:p-8"
        >
          <h2 className="text-sm sm:text-xl font-bold text-gray-900 text-center mb-6">
            ĐĂNG NHẬP 
          </h2>

          <form onSubmit={handleLogin} className="space-y-5">
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
                placeholder="Nhập email của bạn"
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

            {/* Login Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-xl shadow-md flex justify-center items-center transition"
            >
              ĐĂNG NHẬP 
            </motion.button>

            {/* Forgot password */}
            <div className="text-center text-sm text-gray-500">
              <a href="#" className="hover:underline">
                Quên mật khẩu?
              </a>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center my-2">
            <span className="flex-1 border-b border-gray-300"></span>
            <span className="px-3 text-gray-400 text-sm">Hoặc</span>
            <span className="flex-1 border-b border-gray-300"></span>
          </div>

         
          {/* Register link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Chưa có tài khoản?{" "}
            <a href="/register" className="text-green-600 font-semibold hover:underline">
              Đăng ký
            </a>
          </p>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
