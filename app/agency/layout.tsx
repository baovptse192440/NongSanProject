"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AgencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      if (!mounted) return;

      try {
        // Check if token exists in localStorage
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("❌ No token found, redirecting to login");
          const currentPath = window.location.pathname + window.location.search;
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
          return;
        }

        // Verify token with API
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (result.success && result.data) {
          // Check if user has valid role (user or admin)
          const userRole = String(result.data.role).toLowerCase().trim();
          
          if (userRole === "admin") {
            // Admin can access agency, but we could redirect to admin if needed
            console.log("✅ Admin user accessing agency");
            setIsAuthenticated(true);
          } else if (userRole === "user") {
            console.log("✅ User authenticated");
            setIsAuthenticated(true);
          } else {
            console.log("❌ Invalid user role, redirecting to login");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            const currentPath = window.location.pathname + window.location.search;
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
            return;
          }
        } else {
          console.log("❌ API returned error:", result.error);
          // Token invalid or expired
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          const currentPath = window.location.pathname + window.location.search;
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
          return;
        }
      } catch (error) {
        console.error("❌ Error checking authentication:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        const currentPath = window.location.pathname + window.location.search;
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        return;
      } finally {
        setIsLoading(false);
      }
    };

    if (mounted) {
      checkAuth();
    }
  }, [mounted, pathname]);

  // Show loading state while checking authentication
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#0a923c] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Only render children if authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#0a923c] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

