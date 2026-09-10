import type { AnswerReview, PublicQuestion } from "@/lib/client-types";
import type { AppLocale } from "@/lib/i18n";
import type { QuestionContextLead } from "@/lib/question-bank";

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

const contextLeadTranslations: Record<Exclude<AppLocale, "en">, Record<QuestionContextLead, string>> = {
  id: {
    opening_preparation: "Saat persiapan buka restoran:",
    peak_service: "Saat jam pelayanan tersibuk:",
    shift_handoff: "Saat serah terima shift:",
    closing_duties: "Saat mengerjakan tugas penutupan:",
    full_service: "Di restoran full-service:",
    fine_dining: "Di restoran upscale atau fine dining:",
    counter_service: "Di restoran counter-service dengan volume tinggi:",
    off_premise: "Untuk layanan takeout atau delivery:",
    buffet_service: "Dalam operasional buffet atau self-service:",
    bar_service: "Saat menjalankan pelayanan bar:",
    seafood_service: "Di restoran seafood:",
    seafood_boil: "Di restoran seafood boil:",
    steakhouse_service: "Di restoran steakhouse:",
    barbecue_service: "Dalam operasional BBQ atau smokehouse:",
    sushi_service: "Dalam pelayanan sushi:",
    hibachi_show: "Di restoran hibachi show atau teppanyaki:",
    hibachi_express: "Dalam operasional hibachi express:",
    asian_kitchen: "Di restoran dengan konsep dapur Asia:",
    breakfast_service: "Saat pelayanan breakfast atau brunch:",
    event_service: "Saat melayani banquet, catering, atau acara:",
    entry_supervised: "Untuk karyawan pemula yang bekerja di bawah pengawasan:",
    experienced_peak: "Untuk karyawan berpengalaman saat shift sibuk:",
    lead_quality: "Untuk lead yang bertanggung jawab atas quality control:",
  },
  es: {
    opening_preparation: "Durante la preparación antes de abrir:",
    peak_service: "Durante la hora de mayor actividad:",
    shift_handoff: "Durante el cambio de turno:",
    closing_duties: "Durante las tareas de cierre:",
    full_service: "En un restaurante de servicio completo:",
    fine_dining: "En un restaurante de categoría alta o de alta cocina:",
    counter_service: "En un restaurante de servicio en mostrador y alto volumen:",
    off_premise: "En pedidos para llevar o entrega a domicilio:",
    buffet_service: "En una operación de buffet o autoservicio:",
    bar_service: "Durante el servicio de bar:",
    seafood_service: "En un restaurante de mariscos:",
    seafood_boil: "En un restaurante especializado en seafood boil:",
    steakhouse_service: "En un steakhouse:",
    barbecue_service: "En una operación de BBQ o ahumados:",
    sushi_service: "Durante el servicio de sushi:",
    hibachi_show: "En un restaurante hibachi show o teppanyaki:",
    hibachi_express: "En una operación de hibachi express:",
    asian_kitchen: "En un concepto de cocina asiática:",
    breakfast_service: "Durante el servicio de desayuno o brunch:",
    event_service: "Durante un banquete, catering o evento:",
    entry_supervised: "Para una persona principiante que trabaja bajo supervisión:",
    experienced_peak: "Para una persona con experiencia durante un turno de alta demanda:",
    lead_quality: "Para un líder responsable del control de calidad:",
  },
  "zh-CN": {
    opening_preparation: "在开店准备期间：", peak_service: "在营业高峰期间：", shift_handoff: "在交接班期间：", closing_duties: "在闭店工作期间：",
    full_service: "在全服务餐厅：", fine_dining: "在高档或精致餐饮环境：", counter_service: "在高客流的柜台服务餐厅：", off_premise: "在外带或外送服务中：",
    buffet_service: "在自助餐或自助服务运营中：", bar_service: "在酒吧服务期间：", seafood_service: "在海鲜餐厅：", seafood_boil: "在海鲜手抓餐厅：",
    steakhouse_service: "在牛排馆：", barbecue_service: "在烧烤或烟熏餐厅运营中：", sushi_service: "在寿司服务中：", hibachi_show: "在铁板烧表演餐厅：",
    hibachi_express: "在快捷铁板烧餐厅运营中：", asian_kitchen: "在亚洲餐饮厨房：", breakfast_service: "在早餐或早午餐服务期间：", event_service: "在宴会、外烩或活动服务期间：",
    entry_supervised: "对于在监督下工作的初级员工：", experienced_peak: "对于在繁忙班次工作的资深员工：", lead_quality: "对于负责质量控制的领班：",
  },
  "zh-TW": {
    opening_preparation: "在開店準備期間：", peak_service: "在營業高峰期間：", shift_handoff: "在交接班期間：", closing_duties: "在閉店工作期間：",
    full_service: "在全服務餐廳：", fine_dining: "在高檔或精緻餐飲環境：", counter_service: "在高客流的櫃檯服務餐廳：", off_premise: "在外帶或外送服務中：",
    buffet_service: "在自助餐或自助服務營運中：", bar_service: "在酒吧服務期間：", seafood_service: "在海鮮餐廳：", seafood_boil: "在海鮮手抓餐廳：",
    steakhouse_service: "在牛排館：", barbecue_service: "在燒烤或煙燻餐廳營運中：", sushi_service: "在壽司服務中：", hibachi_show: "在鐵板燒表演餐廳：",
    hibachi_express: "在快捷鐵板燒餐廳營運中：", asian_kitchen: "在亞洲餐飲廚房：", breakfast_service: "在早餐或早午餐服務期間：", event_service: "在宴會、外燴或活動服務期間：",
    entry_supervised: "對於在監督下工作的初級員工：", experienced_peak: "對於在繁忙班次工作的資深員工：", lead_quality: "對於負責品質控制的領班：",
  },
};

function localizedContextLead(locale: AppLocale, contextLead?: QuestionContextLead) {
  if (!contextLead || locale === "en") return "";
  return contextLeadTranslations[locale][contextLead] || "";
}

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
    const localized = catalog.questions[question.sourceQuestionId || question.id];
    if (!localized) return question;
    const lead = localizedContextLead(locale, question.contextLead);
    return {
      ...question,
      prompt: lead ? `${lead} ${localized.prompt || question.prompt}` : localized.prompt || question.prompt,
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
    const localized = catalog.questions[answer.sourceQuestionId || answer.questionId];
    if (!localized) return answer;
    const lead = localizedContextLead(locale, answer.contextLead);
    return {
      ...answer,
      prompt: lead ? `${lead} ${localized.prompt || answer.prompt}` : localized.prompt || answer.prompt,
      selectedText: localized.options[answer.selectedOptionId] || answer.selectedText,
      reviewNote: localized.reviewNote || answer.reviewNote,
    };
  });
}
