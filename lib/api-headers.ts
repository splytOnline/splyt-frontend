import { Headers } from "next/dist/compiled/@edge-runtime/primitives";

export function getAxiosHeaders(headers: Headers, token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    accept: headers.get("accept"),
    "user-agent": headers.get("user-agent"),
    referer: headers.get("referer"),
    "x-forwarded-for": headers.get("x-forwarded-for"),
    "x-forwarded-host": headers.get("x-forwarded-host"),
    "x-forwarded-proto": headers.get("x-forwarded-proto"),
    "x-forwarded-port": headers.get("x-forwarded-port"),
    "sec-ch-ua": headers.get("sec-ch-ua"),
    "sec-ch-ua-mobile": headers.get("sec-ch-ua-mobile"),
    "sec-ch-ua-platform": headers.get("sec-ch-ua-platform"),
    "sec-ch-ua-arch": headers.get("sec-ch-ua-arch"),
    "sec-ch-ua-bitness": headers.get("sec-ch-ua-bitness"),
    "sec-ch-ua-full-version": headers.get("sec-ch-ua-full-version"),
    "sec-ch-ua-full-version-list": headers.get("sec-ch-ua-full-version-list"),
    "sec-ch-ua-model": headers.get("sec-ch-ua-model"),
    "sec-ch-ua-platform-version": headers.get("sec-ch-ua-platform-version"),
    "sec-ch-ua-wow64": headers.get("sec-ch-ua-wow64"),
    "sec-ch-ua-wow64-bitness": headers.get("sec-ch-ua-wow64-bitness"),
    "sec-ch-ua-wow64-arch": headers.get("sec-ch-ua-wow64-arch"),
    
  };
} 