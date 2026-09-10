import type { AnswerReview, PublicQuestion } from "@/lib/client-types";
import type { AppLocale } from "@/lib/i18n";

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

const cache = new Map<AppLocale, Promise<QuestionCatalog | null>>();

function catalogUrl(locale: AppLocale) {
  return new URL(`locales/${locale}/questions.json`, document.baseURI).toString();
}

export async function loadQuestionCatalog(locale: AppLocale) {
  if (locale === "en") return null;
  const cached = cache.get(locale);
  if (cached) return cached;
  const request = fetch(catalogUrl(locale), { cache: "force-cache" })
    .then(async (response) => {
      if (!response.ok) throw new Error(`Language file could not be loaded (${response.status}).`);
      return await response.json() as QuestionCatalog;
    })
    .catch(() => null);
  cache.set(locale, request);
  return request;
}

export async function localizeQuestions(questions: PublicQuestion[], locale: AppLocale) {
  const catalog = await loadQuestionCatalog(locale);
  if (!catalog) return questions;
  return questions.map((question) => {
    const localized = catalog.questions[question.id];
    if (!localized) return question;
    return {
      ...question,
      prompt: localized.prompt || question.prompt,
      options: question.options.map((option) => ({
        ...option,
        text: localized.options[option.id] || option.text,
      })),
    };
  });
}

export async function localizeAnswerReviews(answers: AnswerReview[], locale: AppLocale) {
  const catalog = await loadQuestionCatalog(locale);
  if (!catalog) return answers;
  return answers.map((answer) => {
    const localized = catalog.questions[answer.questionId];
    if (!localized) return answer;
    return {
      ...answer,
      prompt: localized.prompt || answer.prompt,
      selectedText: localized.options[answer.selectedOptionId] || answer.selectedText,
      reviewNote: localized.reviewNote || answer.reviewNote,
    };
  });
}
