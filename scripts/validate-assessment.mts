import { readFile } from "node:fs/promises";
import {
  behavioralQuestionBank,
  candidateRoles,
  getAssessmentQuestions,
  technicalQuestionBank,
  TEST_VERSION,
} from "../lib/question-bank.ts";
import { familyForRole, jobFamilies, restaurantConcepts } from "../lib/industry-catalog.ts";
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

if (behavioralQuestionBank.length !== 150) throw new Error(`Expected 150 behavioral question forms, received ${behavioralQuestionBank.length}.`);
if (technicalQuestionBank.length !== 1000) throw new Error(`Expected 1,000 technical question forms, received ${technicalQuestionBank.length}.`);
if (new Set(behavioralQuestionBank.map((question) => question.id)).size !== 150) throw new Error("Behavioral question form IDs must be unique.");
if (new Set(technicalQuestionBank.map((question) => question.id)).size !== 1000) throw new Error("Technical question form IDs must be unique.");
if (restaurantConcepts.length !== 220) throw new Error(`Expected 220 restaurant concepts, received ${restaurantConcepts.length}.`);
if (jobFamilies.length !== 12) throw new Error(`Expected 12 job families, received ${jobFamilies.length}.`);
if (new Set(candidateRoles).size !== candidateRoles.length) throw new Error("Candidate position IDs must be unique.");

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

  const randomizedSelection = {
    restaurantConcept: restaurantConcepts[candidateRoles.indexOf(role) % restaurantConcepts.length].id,
    jobFamily: familyForRole(role).id,
    experienceLevel: (["none", "under_1", "1_2", "3_5", "over_5"] as const)[candidateRoles.indexOf(role) % 5],
    seed: `validation-${role}-2026-09-04`,
  };
  const randomized = getAssessmentQuestions(role, randomizedSelection);
  const repeated = getAssessmentQuestions(role, randomizedSelection);
  const alternate = getAssessmentQuestions(role, { ...randomizedSelection, seed: `${randomizedSelection.seed}-alternate` });
  if (randomized.length !== 75 || new Set(randomized.map((question) => question.id)).size !== 75) {
    throw new Error(`${role}: randomized assessment must contain 75 unique question forms.`);
  }
  if (randomized.map((question) => question.id).join("|") !== repeated.map((question) => question.id).join("|")) {
    throw new Error(`${role}: identical session seed must reproduce the same assessment.`);
  }
  if (randomized.map((question) => question.id).join("|") === alternate.map((question) => question.id).join("|")) {
    throw new Error(`${role}: different session seeds must rotate the assessment form.`);
  }
  const randomizedCounts = randomized.reduce<Record<string, number>>((current, question) => {
    current[question.category] = (current[question.category] || 0) + 1;
    return current;
  }, {});
  if (randomizedCounts.work_style !== 10 || randomizedCounts.communication !== 10 || randomizedCounts.problem_solving !== 10 || randomizedCounts.technical !== 45) {
    throw new Error(`${role}: randomized assessment must preserve the 10/10/10/45 split.`);
  }
  const randomizedStrongestAnswers = Object.fromEntries(
    randomized.map((question) => [
      question.id,
      question.options.reduce((strongest, option) => option.points > strongest.points ? option : strongest).id,
    ]),
  );
  const randomizedStrongest = scoreSubmission(role, randomizedStrongestAnswers, randomizedSelection);
  if (randomizedStrongest.fitPercentage !== 100 || randomizedStrongest.outcome !== "pass") {
    throw new Error(`${role}: randomized strongest response set must score 100% and pass.`);
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

  console.log(`${role}: randomized 75-question form · scoring + SWOT verified`);
}

if (expectedQuestions.size !== 480) {
  throw new Error(`Expected 480 unique questions across all roles, received ${expectedQuestions.size}.`);
}
console.log(`${restaurantConcepts.length} restaurant concepts · ${jobFamilies.length} job families · ${candidateRoles.length} positions · 150 behavioral forms · 1,000 technical forms verified`);

const localizedLocales = ["id", "es", "zh-CN", "zh-TW"] as const;
const localizationRedFlags: Record<(typeof localizedLocales)[number], string[]> = {
  id: [
    "pelari",
    "pameran",
    "tuan rumah",
    "fondant",
    "mandi es",
    "pencairan server",
    "memutar walk-in",
    "juru masak antrean",
    "rasa suka",
    "panggung batch",
    "pegawai bagian makanan",
    "integritas paket",
    "pengelolaan layar dingin",
    "langkah mematikan",
    "butiran dan struktur otot",
    "prosedur layanan atau penguncian",
    "Roti gulung",
    "roti gulung",
    "pemeriksaan terpisah",
    "baru baru",
    "resep standar restoran standar",
    "mengembalikannya ke kepatuhan",
  ],
  es: [
    "huésped",
    "corredor",
    "servidor",
    "panecillo",
    "entrada sin cita previa",
    "apósito",
    "dla comanda",
    "un comanda",
    "las platos",
    "embargar el trabajo",
    "billetes de varias estaciones",
    "visualización en frío",
    "latas de sonido",
    "producción de pruebas",
    "paso de eliminación",
    "medidas caseras exactas",
    "pestaña",
    "varios comandas",
    "todos los comandas",
    "dispare en secuencia",
    "segmentación crítica",
    "producción de circuito cerrado",
    "siguiente tiempo",
    "preparar previamente el plato",
    "producción de stock",
    "descomponer un pescado",
  ],
  "zh-CN": [
    "最合适烈",
    "重拍",
    "售票时间",
    "消费者代表",
    "不安全的复杂性",
    "罚单",
    "世博会",
    "服务器",
    "机票",
    "车牌",
    "一个大型一组",
    "升级/文件",
    "电镀",
    "音量协调",
    "住宿升级",
    "冷显示管理",
    "熟面包卷",
    "多种清酒",
    "通行证",
    "展览说明",
    "室内测量",
    "杀灭步骤",
    "肌肉颗粒",
    "升级",
    "选项卡",
    "一组顾顾客",
    "正确的回答",
    "将表格标记为",
    "忽略该表",
    "家庭食谱",
    "步入室",
    "排队厨师",
    "鱼边是在",
    "什么控制？",
  ],
  "zh-TW": [
    "最合適烈",
    "重拍",
    "售票時間",
    "消費者代表",
    "不安全的複雜性",
    "罰單",
    "世博會",
    "伺服器",
    "機票",
    "車牌",
    "一個大型一組",
    "升級/文件",
    "電鍍",
    "音量協調",
    "住宿升級",
    "冷顯示管理",
    "熟麵包捲",
    "多種清酒",
    "通行證",
    "展覽說明",
    "室內測量",
    "殺滅步驟",
    "肌肉顆粒",
    "升級",
    "選項卡",
    "一組顧顧客",
    "正確的答案",
    "將表格標記為",
    "忽略該表",
    "家庭食譜",
    "步入室",
    "排隊廚師",
    "魚邊是在",
    "什麼控制？",
  ],
};

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
  for (const questionId of ["CK05", "CP05", "SC05", "SP05"]) {
    const temperatureAnswer = catalog.questions[questionId]?.options[`${questionId}-a`] || "";
    if (!temperatureAnswer.includes("41°F") || !temperatureAnswer.includes("5°C")) {
      throw new Error(`${locale}/${questionId}: cold-holding threshold must remain 41°F (5°C).`);
    }
  }
  const serializedCatalog = JSON.stringify(catalog).toLocaleLowerCase(locale);
  const redFlags = localizationRedFlags[locale].filter((term) =>
    serializedCatalog.includes(term.toLocaleLowerCase(locale)),
  );
  if (redFlags.length > 0) {
    throw new Error(`${locale}: unnatural literal translation detected: ${redFlags.join(", ")}`);
  }
  console.log(`${locale}: 480 localized competency sources covering 1,150 rotated forms · version ${TEST_VERSION} verified`);
}

const uiTranslations = JSON.parse(
  await readFile(new URL("../lib/ui-translations.json", import.meta.url), "utf8"),
) as Record<(typeof localizedLocales)[number], Record<string, string>>;
const uiSources = Object.keys(uiTranslations.id || {}).sort();
if (uiSources.length < 450) throw new Error(`Expected at least 450 UI/report translations, received ${uiSources.length}.`);

const uiLocalizationRedFlags: Record<(typeof localizedLocales)[number], string[]> = {
  id: ["yang yang"],
  es: ["al gerente al gerente"],
  "zh-CN": ["称称"],
  "zh-TW": ["稱稱"],
};

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
  const serializedUi = JSON.stringify(catalog).toLocaleLowerCase(locale);
  const uiRedFlags = uiLocalizationRedFlags[locale].filter((term) =>
    serializedUi.includes(term.toLocaleLowerCase(locale)),
  );
  if (uiRedFlags.length > 0) {
    throw new Error(`${locale}: unnatural UI translation detected: ${uiRedFlags.join(", ")}`);
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
