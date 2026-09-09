import { candidateRoles, getAssessmentQuestions } from "../lib/question-bank.ts";
import { buildDetailedAnalysis, scoreSubmission } from "../lib/scoring.ts";

if (candidateRoles.length !== 10) {
  throw new Error(`Expected 10 candidate roles, received ${candidateRoles.length}.`);
}

for (const role of candidateRoles) {
  const questions = getAssessmentQuestions(role);
  const questionIds = new Set(questions.map((question) => question.id));
  const optionIds = new Set(questions.flatMap((question) => question.options.map((option) => option.id)));
  const counts = questions.reduce<Record<string, number>>((current, question) => {
    current[question.category] = (current[question.category] || 0) + 1;
    return current;
  }, {});

  if (questions.length !== 75 || questionIds.size !== 75 || optionIds.size !== 300) {
    throw new Error(`${role}: expected 75 unique questions and 300 unique options.`);
  }
  if (counts.work_style !== 10 || counts.communication !== 10 || counts.problem_solving !== 10 || counts.technical !== 45) {
    throw new Error(`${role}: expected category split 10/10/10/45.`);
  }
  if (questions.some((question) => question.options.length !== 4)) {
    throw new Error(`${role}: every question must have exactly four choices.`);
  }

  const strongestAnswers = Object.fromEntries(
    questions.map((question) => [
      question.id,
      question.options.reduce((strongest, option) => option.points > strongest.points ? option : strongest).id,
    ]),
  );
  const weakestAnswers = Object.fromEntries(
    questions.map((question) => [
      question.id,
      question.options.reduce((weakest, option) => option.points < weakest.points ? option : weakest).id,
    ]),
  );
  const strongestResult = scoreSubmission(role, strongestAnswers);
  const weakestResult = scoreSubmission(role, weakestAnswers);
  if (strongestResult.fitPercentage !== 100 || strongestResult.outcome !== "pass") {
    throw new Error(`${role}: strongest valid response set must score 100% and pass.`);
  }
  if (weakestResult.fitPercentage !== 1 || weakestResult.outcome !== "not_pass") {
    throw new Error(`${role}: weakest valid response set must score 1% and not pass.`);
  }
  const strongestAnalysis = buildDetailedAnalysis(strongestResult);
  const weakestAnalysis = buildDetailedAnalysis(weakestResult);
  if (
    strongestAnalysis.hiringRecommendation.status !== "recommended"
    || strongestAnalysis.swot.strengths.length === 0
    || strongestAnalysis.developmentPlan.length === 0
  ) {
    throw new Error(`${role}: strongest response set must produce a complete recommended SWOT report.`);
  }
  if (
    weakestAnalysis.hiringRecommendation.status !== "not_recommended"
    || weakestAnalysis.swot.weaknesses.length === 0
    || weakestAnalysis.swot.threats.length === 0
    || !weakestAnalysis.developmentPlan.some((item) => item.estimatedTimeline === "60–90 days")
  ) {
    throw new Error(`${role}: weakest response set must produce hiring risks and a long-range improvement plan.`);
  }

  console.log(`${role}: 75 questions · 30 behavioral · 45 technical · scoring + SWOT verified`);
}
