import { NextResponse } from "next/server";
import { clearManagerCookie } from "@/lib/manager-auth";

export async function POST() {
  const response = NextResponse.json({ authenticated: false });
  response.headers.set("Set-Cookie", clearManagerCookie());
  response.headers.set("Cache-Control", "no-store");
  return response;
}
