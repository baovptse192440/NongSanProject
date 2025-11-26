import { NextRequest } from "next/server";

// Helper function to get token from request (from Authorization header)
export function getTokenFromRequest(request: NextRequest): string | null {
  // Try Authorization header first (Bearer token)
  const authHeader = request.headers.get("authorization");
  console.log("Authorization header:", authHeader ? authHeader.substring(0, 20) + "..." : "NOT FOUND");
  
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    console.log("Token extracted from Bearer:", token.substring(0, 20) + "...");
    return token;
  }
  
  // Also try lowercase "Authorization" header (some browsers may send it lowercase)
  const authHeaderLower = request.headers.get("Authorization");
  if (authHeaderLower?.startsWith("Bearer ")) {
    const token = authHeaderLower.substring(7);
    console.log("Token extracted from Authorization (lowercase):", token.substring(0, 20) + "...");
    return token;
  }
  
  // Fallback: try cookie (for backward compatibility during migration)
  const cookieToken = request.cookies.get("token")?.value;
  if (cookieToken) {
    console.log("Token found in cookie:", cookieToken.substring(0, 20) + "...");
    return cookieToken;
  }
  
  console.log("No token found in request");
  return null;
}

