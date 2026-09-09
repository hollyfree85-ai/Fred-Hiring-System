import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { submissions } from "@/db/schema";
import { isManagerRequest } from "@/lib/manager-auth";

export async function GET(request: Request) {
  if (!(await isManagerRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await getDb()
    .select({
      id: submissions.id,
      candidateName: submissions.candidateName,
      phone: submissions.phone,
      role: submissions.role,
      fitPercentage: submissions.fitPercentage,
      outcome: submissions.outcome,
      criticalMisses: submissions.criticalMisses,
      durationSeconds: submissions.durationSeconds,
      submittedAt: submissions.submittedAt,
    })
    .from(submissions)
    .orderBy(desc(submissions.submittedAt))
    .limit(200);

  return NextResponse.json({ submissions: rows }, { headers: { "Cache-Control": "no-store" } });
}
