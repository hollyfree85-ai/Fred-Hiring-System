import { and, count, eq, gte } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { managerLoginAttempts } from "@/db/schema";
import {
  createManagerCookie,
  requestFingerprint,
  validManagerCredentials,
} from "@/lib/manager-auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { username?: unknown; passcode?: unknown };
    const username = typeof body.username === "string" ? body.username : "";
    const passcode = typeof body.passcode === "string" ? body.passcode : "";
    const fingerprint = await requestFingerprint(request);
    const db = getDb();
    const since = new Date(Date.now() - 15 * 60 * 1000).toISOString().replace("T", " ").slice(0, 19);
    const [recent] = await db
      .select({ value: count() })
      .from(managerLoginAttempts)
      .where(
        and(
          eq(managerLoginAttempts.fingerprint, fingerprint),
          eq(managerLoginAttempts.succeeded, false),
          gte(managerLoginAttempts.createdAt, since),
        ),
      );

    if ((recent?.value ?? 0) >= 5) {
      return NextResponse.json(
        { error: "Too many attempts. Wait 15 minutes and try again." },
        { status: 429, headers: { "Cache-Control": "no-store" } },
      );
    }

    const succeeded = validManagerCredentials(username, passcode);
    await db.insert(managerLoginAttempts).values({ fingerprint, succeeded });
    if (!succeeded) {
      return NextResponse.json(
        { error: "Manager name or passcode is incorrect." },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }

    const response = NextResponse.json({ authenticated: true, managerName: "Fred" });
    response.headers.set("Set-Cookie", await createManagerCookie("Fred"));
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    return NextResponse.json(
      { error: "Manager login is temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
