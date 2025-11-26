import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Clear cookie if exists (for backward compatibility)
    const response = NextResponse.json(
      {
        success: true,
        message: "Đăng xuất thành công",
      },
      { status: 200 }
    );
    
    // Clear cookie
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expire immediately
      path: "/",
    });
    
    return response;
  } catch (error: any) {
    console.error("Error logging out:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to logout" },
      { status: 500 }
    );
  }
}

