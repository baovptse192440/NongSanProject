import { NextRequest } from "next/server";

// Helper function to get token from request (from Authorization header only)
export function getTokenFromRequest(request: NextRequest): string | null {
  // Only read from Authorization header (Bearer token)
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
  
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    return token;
  }
  
  // No token found
  return null;
}

