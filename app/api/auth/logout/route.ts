import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // No need to clear cookie since we're using localStorage
    // Client will handle removing token from localStorage
    return NextResponse.json(
      {
        success: true,
        message: "Đăng xuất thành công",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error logging out:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to logout" },
      { status: 500 }
    );
  }
}

