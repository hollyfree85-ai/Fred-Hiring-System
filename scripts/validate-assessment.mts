import { readFile } from "node:fs/promises";
import { candidateRoles, getAssessmentQuestions, TEST_VERSION } from "../lib/question-bank.ts";
import { buildDetailedAnalysis, scoreSubmission } from "../lib/scoring.ts";

type LocalizedQuestion = {
  prompt: string;
  reviewNote: string;
  options: Record<string, string>;
};

type QuestionCatalog = {
  language: string;
  testVersion: string;
  questions: Record<string, LocalizedQuestion>;
};

const expectedQuestions = new Map<ReturnType<typeof getAssessmentQuestions>[number]["id"], ReturnType<typeof getAssessmentQuestions>[number]>();

if (candidateRoles.length !== 10) {
  throw new Error(`Expected 10 candidate roles, received ${candidateRoles.length}.`);
}

for (const role of candidateRoles) {
  const questions = getAssessmentQuestions(role);
  for (const question of questions) expectedQuestions.set(question.id, question);
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

if (expectedQuestions.size !== 480) {
  throw new Error(`Expected 480 unique questions across all roles, received ${expectedQuestions.size}.`);
}

const localizedLocales = ["id", "es", "zh-CN", "zh-TW"] as const;
for (const locale of localizedLocales) {
  const catalog = JSON.parse(
    await readFile(new URL(`../public/locales/${locale}/questions.json`, import.meta.url), "utf8"),
  ) as QuestionCatalog;
  const questionIds = Object.keys(catalog.questions);
  if (catalog.language !== locale || catalog.testVersion !== TEST_VERSION || questionIds.length !== expectedQuestions.size) {
    throw new Error(`${locale}: invalid language, test version, or question count.`);
  }
  for (const [questionId, source] of expectedQuestions) {
    const localized = catalog.questions[questionId];
    if (!localized?.prompt.trim() || !localized.reviewNote.trim()) {
      throw new Error(`${locale}/${questionId}: missing prompt or review note.`);
    }
    const sourceOptionIds = source.options.map((option) => option.id).sort();
    const localizedOptionIds = Object.keys(localized.options).sort();
    if (sourceOptionIds.join("|") !== localizedOptionIds.join("|")) {
      throw new Error(`${locale}/${questionId}: localized option IDs do not match the source question.`);
    }
    if (Object.values(localized.options).some((value) => !value.trim())) {
      throw new Error(`${locale}/${questionId}: empty localized option.`);
    }
  }
  console.log(`${locale}: 480 localized questions · version ${TEST_VERSION} verified`);
}

const uiTranslations = JSON.parse(
  await readFile(new URL("../lib/ui-translations.json", import.meta.url), "utf8"),
) as Record<(typeof localizedLocales)[number], Record<string, string>>;
const uiSources = Object.keys(uiTranslations.id || {}).sort();
if (uiSources.length < 450) throw new Error(`Expected at least 450 UI/report translations, received ${uiSources.length}.`);

for (const locale of localizedLocales) {
  const catalog = uiTranslations[locale];
  const keys = Object.keys(catalog || {}).sort();
  if (keys.join("\n") !== uiSources.join("\n")) {
    throw new Error(`${locale}: UI/report translation keys do not match the Indonesian source set.`);
  }
  for (const source of uiSources) {
    const localized = catalog[source];
    if (!localized?.trim()) throw new Error(`${locale}: empty UI/report translation for ${source}`);
    const expected = [...source.matchAll(/\{([a-zA-Z0-9_]+)\}/g)].map((match) => match[1]).sort();
    const actual = [...localized.matchAll(/\{([a-zA-Z0-9_]+)\}/g)].map((match) => match[1]).sort();
    if (expected.join("|") !== actual.join("|")) {
      throw new Error(`${locale}: placeholder mismatch for ${source}`);
    }
  }
  console.log(`${locale}: ${keys.length} UI/report translations · placeholders verified`);
}

const manifest = JSON.parse(
  await readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"),
) as { name?: string; start_url?: string; scope?: string; display?: string; icons?: unknown[] };
if (
  manifest.name !== "Fred Hiring System"
  || manifest.start_url !== "./"
  || manifest.scope !== "./"
  || manifest.display !== "standalone"
  || !Array.isArray(manifest.icons)
  || manifest.icons.length < 3
) {
  throw new Error("PWA manifest is incomplete or has an unsafe GitHub Pages scope.");
}
console.log("PWA manifest: install scope and icons verified");
