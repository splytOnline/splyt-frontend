import axios from "axios";
import {serialize} from "cookie"
import { NextRequest, NextResponse } from "next/server";
import { getAxiosHeaders } from "@/lib/api-headers"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const header = req.headers
    const response = await axios.post(
      `${process.env.API_URL}auth/hook`,
      {
        walletAddress: body.walletAddress,
        signature: body.signature,
      },
      {
        headers: getAxiosHeaders(header, "")
      }
    );

    if(response.status !== 200) {
        return NextResponse.json(response.data, { status: response.status });
    }

    const token = response.data.data.token;
    // Set token in cookies
    const cookie = serialize("splyt-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    // Set cookie in response headers and return full response data
    const res = NextResponse.json(
      {
        success: true,
        status: 200,
        message: response.data.message || "User verified successfully",
        data: {
          walletAddress: response.data.data.walletAddress,
          displayName: response.data.data.displayName,
          token: response.data.data.token,
        },
      },
      { status: response.status }
    );
    res.headers.set("Set-Cookie", cookie);
    return res;

  } catch (error: any) {
    if (error.response) {
      return NextResponse.json(error.response.data, {
        status: error.response.status,
      });
    }

    console.log(error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
