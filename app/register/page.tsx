"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ToastContainer from "../common/Toast";
import { useToast } from "../common/useToast";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { toasts, toast, removeToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (password !== confirmPassword) {
      toast.error("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Error", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          fullName: name,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          "Success",
          "Please check your email to verify your account"
        );
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        toast.error("Error", result.error || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Error", "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-30 flex flex-col bg-[#f5f5f7]">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 sm:p-8"
        >
          <h2 className="text-sm sm:text-xl font-bold text-gray-900 text-center mb-6">
            SIGN UP
          </h2>

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Name */}
            <div className="flex flex-col">
              <label htmlFor="name" className="text-sm font-semibold text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
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

            {/* Confirm Password */}
            <div className="flex flex-col relative">
              <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="px-2 py-1 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition w-full"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-10 -translate-y-1/2 text-gray-500 text-sm"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* Register Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-xl shadow-md flex justify-center items-center transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Signing up...
                </>
              ) : (
                "SIGN UP"
              )}
            </motion.button>

            {/* Login link */}
            <div className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <a href="/login" className="text-green-600 font-semibold hover:underline">
                Login
              </a>
            </div>
          </form>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
