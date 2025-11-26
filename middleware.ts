import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

// Routes that require authentication
const protectedRoutes = ["/profile", "/checkout", "/cart"];
// Routes that require admin role
const adminRoutes = ["/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for login, register, API routes, and static files
  // Note: We can't read localStorage in middleware, so authentication
  // will be handled client-side and in API routes
  // ALLOW /admin routes to pass through - client-side will handle auth check
  if (
    pathname === "/login" || 
    pathname === "/register" || 
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/admin") || // Allow admin routes - client will check auth
    (pathname.includes(".") && !pathname.startsWith("/profile") && !pathname.startsWith("/checkout") && !pathname.startsWith("/cart"))
  ) {
    return NextResponse.next();
  }

  // For other protected routes, we'll let the client-side handle redirect
  // The API routes will verify the token from Authorization header
  // This is a simpler approach since middleware can't access localStorage
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

