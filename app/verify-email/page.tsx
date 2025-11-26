"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ToastContainer from "../common/Toast";
import { useToast } from "../common/useToast";
import { CheckCircle2, XCircle, Loader2, ArrowLeft, Mail } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toasts, toast, removeToast } = useToast();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Invalid verification token");
        toast.error("Error", "Invalid verification token");
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const result = await response.json();

        if (result.success) {
          setStatus("success");
          setMessage(result.message || "Email verified successfully!");
          toast.success("Success", "Email verified successfully!");

          // Update user in localStorage if logged in
          if (typeof window !== "undefined") {
            try {
              const userStr = localStorage.getItem("user");
              if (userStr) {
                const user = JSON.parse(userStr);
                user.emailVerified = true;
                localStorage.setItem("user", JSON.stringify(user));
              }
            } catch (error) {
              console.error("Error updating user in localStorage:", error);
            }
          }
        } else {
          setStatus("error");
          setMessage(result.error || "Email verification failed");
          toast.error("Error", result.error || "Email verification failed");
        }
      } catch (error) {
        console.error("Error verifying email:", error);
        setStatus("error");
        setMessage("An error occurred while verifying email");
        toast.error("Error", "An error occurred while verifying email");
      }
    };

    verifyEmail();
  }, [searchParams, toast]);

  return (
    <div className="min-h-screen bg-[#eeeeee] mt-10 md:mt-32">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      <div className="hidden md:block">
        <Header />
      </div>

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 w-full flex z-50 p-3 md:hidden bg-white shadow-sm">
        <Link
          href="/"
          className="bg-[rgba(45,46,50,0.5)] w-9 h-9 flex items-center justify-center rounded-full"
        >
          <ArrowLeft strokeWidth={1} color="white" />
        </Link>
        <div className="flex-1 flex justify-center items-center">
          <h1 className="text-lg font-semibold text-gray-900">Verify Email</h1>
        </div>
        <div className="w-9"></div>
      </header>

      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
          {status === "loading" && (
            <>
              <div className="flex justify-center mb-6">
                <Loader2 className="w-16 h-16 text-green-600 animate-spin" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Verifying email...
              </h1>
              <p className="text-gray-600">Please wait a moment</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Verification Successful!
              </h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/profile"
                  className="flex-1 bg-green-700 text-white px-6 py-3 rounded-sm font-semibold hover:bg-green-800 transition-colors"
                >
                  Go to Profile
                </Link>
                <Link
                  href="/"
                  className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-red-600" />
                </div>
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Verification Failed
              </h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="space-y-3">
                <Link
                  href="/profile"
                  className="block w-full bg-green-700 text-white px-6 py-3 rounded-sm font-semibold hover:bg-green-800 transition-colors"
                >
                  Resend Verification Email
                </Link>
                <Link
                  href="/"
                  className="block w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

