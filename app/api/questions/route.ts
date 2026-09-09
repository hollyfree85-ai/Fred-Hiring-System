import { NextResponse } from "next/server";
import {
  getAssessmentQuestions,
  isCandidateRole,
  roleLabels,
  TEST_VERSION,
  toPublicQuestion,
} from "@/lib/question-bank";

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

export async function GET(request: Request) {
  const role = new URL(request.url).searchParams.get("role");
  if (!isCandidateRole(role)) {
    return NextResponse.json({ error: "Choose a valid position." }, { status: 400 });
  }

  const questions = getAssessmentQuestions(role).map((question) => ({
    ...toPublicQuestion(question),
    options: shuffle(toPublicQuestion(question).options),
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
