import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { submissions } from "@/db/schema";
import { isManagerRequest } from "@/lib/manager-auth";
import { categoryLabels, isCandidateRole, type QuestionCategory, roleLabels } from "@/lib/question-bank";
import { buildDetailedAnalysis, type AnswerDetail, type ScoreResult } from "@/lib/scoring";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await isManagerRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const [row] = await getDb().select().from(submissions).where(eq(submissions.id, id)).limit(1);
  if (!row || !isCandidateRole(row.role)) {
    return NextResponse.json({ error: "Result not found." }, { status: 404 });
  }

  const stored = JSON.parse(row.answersJson) as {
    answerDetails: AnswerDetail[];
    failedRules: string[];
  };
  const biodata = JSON.parse(row.biodataJson) as Record<string, unknown>;
  const categoryScores: ScoreResult["categoryScores"] = {
    work_style: {
      score: row.workStyleScore,
      max: row.workStyleMax,
      percentage: Math.round((row.workStyleScore / row.workStyleMax) * 100),
    },
    communication: {
      score: row.communicationScore,
      max: row.communicationMax,
      percentage: Math.round((row.communicationScore / row.communicationMax) * 100),
    },
    problem_solving: {
      score: row.problemSolvingScore,
      max: row.problemSolvingMax,
      percentage: Math.round((row.problemSolvingScore / row.problemSolvingMax) * 100),
    },
    technical: {
      score: row.technicalScore,
      max: row.technicalMax,
      percentage: Math.round((row.technicalScore / row.technicalMax) * 100),
    },
  };
  const result: ScoreResult = {
    fitPercentage: row.fitPercentage,
    outcome: row.outcome === "pass" ? "pass" : "not_pass",
    totalScore: row.totalScore,
    maxScore: row.maxScore,
    categoryScores,
    criticalMisses: row.criticalMisses,
    answerDetails: stored.answerDetails,
    failedRules: stored.failedRules,
  };

  return NextResponse.json(
    {
      submission: {
        ...row,
        answersJson: undefined,
        biodataJson: undefined,
        biodata,
        roleLabel: roleLabels[row.role],
        categoryScores: (Object.keys(categoryScores) as QuestionCategory[]).map((category) => ({
          category,
          label: categoryLabels[category],
          ...categoryScores[category],
        })),
        analysis: buildDetailedAnalysis(result),
        answers: stored.answerDetails,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
