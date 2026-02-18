import axios from "axios";
import {parse} from "cookie"
import { NextRequest, NextResponse } from "next/server";
import { getAxiosHeaders } from "@/lib/api-headers"

export async function POST(req: NextRequest) {
  try {
    const header = req.headers

     const cookies = req.headers.get("cookie");
     const parsedCookies = cookies ? parse(cookies) : {};
     const token = parsedCookies["splyt-token"];

    if(!token) {
      return NextResponse.json({ status:401,success:false,message: "Unauthorized" }, { status: 401 });
    }

     const body = await req.json();


    const response = await axios.post(
      `${process.env.API_URL}split/create`,
      body,
      {
        headers: getAxiosHeaders(header, token),
      }
    );

    return NextResponse.json(response.data, { status: response.status });

  } catch (error: any) {
    if (error.response) {
      return NextResponse.json(error.response.data, {
        status: error.response.status,
      });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
