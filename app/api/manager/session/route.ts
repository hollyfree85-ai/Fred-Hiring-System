import { NextResponse } from "next/server";
import { isManagerRequest } from "@/lib/manager-auth";

export async function GET(request: Request) {
  const authenticated = await isManagerRequest(request);
  return NextResponse.json(
    { authenticated, managerName: authenticated ? "Fred" : null },
    { headers: { "Cache-Control": "no-store" } },
  );
}
