"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ToastContainer from "../common/Toast";
import { useToast } from "../common/useToast";
import { Loader2, User, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const { toasts, toast, removeToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Success", "Welcome back!");
        
        if (typeof window !== "undefined") {
          if (result.token) {
            localStorage.setItem("token", result.token);
            console.log("✅ Token saved to localStorage");
          } else {
            console.error("❌ No token in response!");
            toast.error("Error", "Login failed: No token received");
            return;
          }
          localStorage.setItem("user", JSON.stringify(result.data));
          console.log("✅ User data saved, role:", result.data.role);
          window.dispatchEvent(new Event("userLoggedIn"));
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        let redirectUrl = urlParams.get("redirect");
        
        if (redirectUrl) {
          try {
            redirectUrl = decodeURIComponent(redirectUrl);
          } catch (e) {
            console.error("Error decoding redirect URL:", e);
          }
        }
        
        let destination = "/";
        
        if (result.data.role === "admin") {
          if (redirectUrl && redirectUrl.startsWith("/admin")) {
            destination = redirectUrl;
          } else {
            destination = "/admin";
          }
        } else {
          if (redirectUrl && !redirectUrl.startsWith("/admin")) {
            destination = redirectUrl;
          } else {
            destination = "/agency";
          }
        }
        
        console.log("=== LOGIN SUCCESS ===");
        console.log("User role:", result.data.role);
        console.log("Redirect URL:", redirectUrl);
        console.log("Destination:", destination);
        console.log("Token exists:", !!result.token);
        
        const verifyToken = localStorage.getItem("token");
        if (!verifyToken) {
          console.error("❌ Token not found in localStorage after saving!");
          toast.error("Error", "Failed to save authentication token");
          return;
        }
        
        console.log("✅ Token verified in localStorage, redirecting...");
        
        setTimeout(() => {
          console.log("🚀 Redirecting to:", destination);
          window.location.href = destination;
        }, 500);
      } else {
        toast.error("Error", result.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Error", "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-white to-green-50 relative overflow-hidden">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-100 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-100 rounded-full blur-3xl opacity-20"></div>
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Left Side - Branding & Image */}
          <div className="hidden lg:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-[#164333] to-[#43aa5c] text-white relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-400/20 rounded-full blur-2xl"></div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative z-10 text-center"
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="mx-auto mb-6 flex align-center justify-center"
              >
                <Image
                  src="/logo_AU_White.png"
                  alt="AusGlobal Connection Logo"
                  width={200}
                  height={80}
                  className="w-auto h-16 md:h-20 object-contain"
                  priority
                />
              </motion.div>
              
              <h2 className="text-4xl font-bold mb-4">AusGlobal <span className="text-yellow-300">Connection</span></h2>
              <p className="text-lg text-white/90 mb-6">
                Premium Vietnamese Agricultural Products
              </p>
              <div className="w-24 h-1 bg-yellow-400 mx-auto rounded-full"></div>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-white/80 text-sm leading-relaxed max-w-sm"
              >
                Welcome back! Sign in to access your account and continue managing your agricultural product orders.
              </motion.p>
            </motion.div>
          </div>

          {/* Right Side - Login Form */}
          <div className="p-8 sm:p-12 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Mobile Logo */}
              <div className="lg:hidden md:flex items-center justify-center! flex-col gap-3 mb-8">
                <Image
                  src="/logo_AU.png"
                  alt="AusGlobal Connection Logo"
                  width={120}
                  height={48}
                  className="h-12 w-auto object-contain"
                  priority
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">AusGlobal Connection</h3>
                  <p className="text-sm text-gray-600">Premium Agricultural Products</p>
                </div>
              </div>

              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  Welcome Back
                </h1>
                <p className="text-gray-600">
                  Sign in to your account to continue
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email Input */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#43aa5c] focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                      required
                    />
                  </div>
                </motion.div>

                {/* Password Input */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#43aa5c] focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </motion.div>

                {/* Forgot Password */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-end"
                >
                  <a
                    href="#"
                    className="text-sm text-[#43aa5c] hover:text-[#164333] font-medium transition-colors"
                  >
                    Forgot password?
                  </a>
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full bg-gradient-to-r from-[#164333] to-[#43aa5c] text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Divider */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center my-6"
              >
                <span className="flex-1 border-b border-gray-200"></span>
                <span className="px-4 text-gray-400 text-sm">Or</span>
                <span className="flex-1 border-b border-gray-200"></span>
              </motion.div>

              {/* Register Link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-center"
              >
                <p className="text-sm text-gray-600">
                  Don&apos;t have an account?{" "}
                  <a
                    href="/register"
                    className="text-[#43aa5c] hover:text-[#164333] font-semibold transition-colors inline-flex items-center gap-1 group"
                  >
                    Sign up
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
