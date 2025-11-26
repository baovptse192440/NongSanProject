"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ToastContainer from "../common/Toast";
import { useToast } from "../common/useToast";
import { Loader2 } from "lucide-react";

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
        credentials: "include", // Important: include credentials to receive cookies
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Success", "Welcome back!");
        
        // Store token and user info in localStorage FIRST
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
        
        // Get redirect URL before redirecting
        const urlParams = new URLSearchParams(window.location.search);
        let redirectUrl = urlParams.get("redirect");
        
        // Decode URL if needed
        if (redirectUrl) {
          try {
            redirectUrl = decodeURIComponent(redirectUrl);
          } catch (e) {
            console.error("Error decoding redirect URL:", e);
          }
        }
        
        // Determine redirect destination based on role
        let destination = "/";
        
        if (result.data.role === "admin") {
          // Admin: redirect to admin route or dashboard
          if (redirectUrl && redirectUrl.startsWith("/admin")) {
            destination = redirectUrl;
          } else {
            destination = "/admin";
          }
        } else {
          // Regular user: cannot access admin routes
          if (redirectUrl && !redirectUrl.startsWith("/admin")) {
            destination = redirectUrl;
          } else {
            destination = "/";
          }
        }
        
        console.log("=== LOGIN SUCCESS ===");
        console.log("User role:", result.data.role);
        console.log("Redirect URL:", redirectUrl);
        console.log("Destination:", destination);
        console.log("Token exists:", !!result.token);
        
        // Verify token is saved before redirecting
        const verifyToken = localStorage.getItem("token");
        if (!verifyToken) {
          console.error("❌ Token not found in localStorage after saving!");
          toast.error("Error", "Failed to save authentication token");
          return;
        }
        
        console.log("✅ Token verified in localStorage, redirecting...");
        
        // Wait a bit to ensure localStorage is persisted, then redirect
        setTimeout(() => {
          console.log("🚀 Redirecting to:", destination);
          // Force a full page reload to ensure token is available
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
    <div className="mt-30 flex flex-col bg-[#f5f5f7]">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      

      <main className="flex-1  flex items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 sm:p-8"
        >
          <h2 className="text-sm sm:text-xl font-bold text-gray-900 text-center mb-6">
            LOGIN
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
                placeholder="Enter your email"
                className="px-2 py-1 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition"
                required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col relative">
              <label htmlFor="password" className="text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="px-2 py-1 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition w-full"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-10 -translate-y-1/2 text-gray-500 text-sm"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* Login Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-xl shadow-md flex justify-center items-center transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Logging in...
                </>
              ) : (
                "LOGIN"
              )}
            </motion.button>

            {/* Forgot password */}
            <div className="text-center text-sm text-gray-500">
              <a href="#" className="hover:underline">
                Forgot password?
              </a>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center my-2">
            <span className="flex-1 border-b border-gray-300"></span>
            <span className="px-3 text-gray-400 text-sm">Or</span>
            <span className="flex-1 border-b border-gray-300"></span>
          </div>

         
          {/* Register link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{" "}
            <a href="/register" className="text-green-600 font-semibold hover:underline">
              Sign up
            </a>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
