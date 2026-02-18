import { serialize } from "cookie";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const expiredToken = serialize("splyt-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });

    const res = NextResponse.json(
      { status: 200, success: true },
      { status: 200 }
    );
    res.headers.set("Set-Cookie", expiredToken);
    return res;

  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
