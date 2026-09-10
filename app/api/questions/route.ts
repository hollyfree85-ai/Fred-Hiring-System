import { NextResponse } from "next/server";
import {
  getAssessmentQuestions,
  isCandidateRole,
  roleLabels,
  seededShuffle,
  TEST_VERSION,
  toPublicQuestion,
} from "@/lib/question-bank";
import {
  familyForRole,
  isExperienceLevel,
  isJobFamily,
  isRestaurantConcept,
} from "@/lib/industry-catalog";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const role = params.get("role");
  const restaurantConcept = params.get("restaurantConcept");
  const jobFamily = params.get("jobFamily");
  const experienceLevel = params.get("experienceLevel");
  const seed = (params.get("seed") || "").trim().slice(0, 80);
  if (!isCandidateRole(role)) {
    return NextResponse.json({ error: "Choose a valid position." }, { status: 400 });
  }
  if (!isRestaurantConcept(restaurantConcept) || !isJobFamily(jobFamily) || !isExperienceLevel(experienceLevel) || seed.length < 8) {
    return NextResponse.json({ error: "Choose a valid restaurant type, job family, and experience level." }, { status: 400 });
  }
  if (familyForRole(role).id !== jobFamily) {
    return NextResponse.json({ error: "Choose a position from the selected job family." }, { status: 400 });
  }

  const questions = getAssessmentQuestions(role, { restaurantConcept, jobFamily, experienceLevel, seed }).map((question, index) => ({
    ...toPublicQuestion(question),
    options: seededShuffle(toPublicQuestion(question).options, `${seed}:${question.id}:${index}:options`),
  }));

  return NextResponse.json(
    {
      role,
      roleLabel: roleLabels[role],
      version: TEST_VERSION,
      questions,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
