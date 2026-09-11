import type { SubmissionDetail } from "@/lib/client-types";
import { translate, type AppLocale } from "@/lib/i18n";
import type { QuestionCategory } from "@/lib/question-bank";

type Tone = "default" | "muted" | "accent" | "success" | "warning" | "danger" | "violet";

type ReportSection = {
  label?: string;
  text: string;
  tone?: Tone;
};

type ReportCard = {
  title: string;
  tone?: Tone;
  metric?: string;
  progress?: number;
  sections: ReportSection[];
};

type ReportChapter = {
  eyebrow: string;
  title: string;
  subtitle: string;
  cards: ReportCard[];
};

type RelativeTextRow = {
  text: string;
  x: number;
  y: number;
  size: number;
  bold?: boolean;
  tone?: Tone;
};

type PreparedCard = ReportCard & {
  width: number;
  height: number;
  rows: RelativeTextRow[];
  progressY?: number;
};

type LaidOutCard = PreparedCard & {
  x: number;
  y: number;
};

type LaidOutPage = {
  chapter: ReportChapter;
  headerRows: RelativeTextRow[];
  cards: LaidOutCard[];
};

type MeasureText = (text: string, size: number, bold?: boolean) => number;

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const PAGE_LEFT = 44;
const PAGE_CONTENT_WIDTH = 524;
const PAGE_CONTENT_BOTTOM = 738;
const CARD_GAP = 10;
const BODY_FONT_SIZE = 14;
const BODY_LINE_HEIGHT = 20;

const reportCategoryLabels: Record<QuestionCategory, string> = {
  work_style: "Integrity & reliability",
  communication: "Teamwork & service",
  problem_solving: "Emotional control & adaptability",
  technical: "Technical knowledge",
};

const categoryMinimums: Record<QuestionCategory, number> = {
  work_style: 65,
  communication: 65,
  problem_solving: 70,
  technical: 70,
};

const outcomeText = (outcome: SubmissionDetail["outcome"], locale: AppLocale) =>
  outcome === "pass" ? translate(locale, "PASSED WRITTEN TEST") : translate(locale, "DID NOT PASS WRITTEN TEST");

const isCjkLocale = (locale: AppLocale) => locale === "zh-CN" || locale === "zh-TW";

function normalizeDisplayText(value: string) {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/\u00b7/g, " - ")
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function ascii(value: string) {
  return normalizeDisplayText(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\u2022/g, "-")
    .replace(/[^\x20-\x7E]/g, "?")
    .replace(/\s+/g, " ")
    .trim();
}

function pdfEscape(value: string) {
  return ascii(value).replace(/([\\()])/g, "\\$1");
}

function pdfValue(value: string, locale: AppLocale) {
  if (!isCjkLocale(locale)) return `(${pdfEscape(value)})`;
  const bytes: number[] = [];
  for (const character of normalizeDisplayText(value)) {
    const codePoint = character.codePointAt(0) || 0x3f;
    if (codePoint <= 0xffff) {
      bytes.push((codePoint >> 8) & 0xff, codePoint & 0xff);
    } else {
      const adjusted = codePoint - 0x10000;
      const high = 0xd800 + (adjusted >> 10);
      const low = 0xdc00 + (adjusted & 0x3ff);
      bytes.push((high >> 8) & 0xff, high & 0xff, (low >> 8) & 0xff, low & 0xff);
    }
  }
  return `<${bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("")}>`;
}

function splitLongToken(token: string, maxWidth: number, size: number, bold: boolean, measure: MeasureText) {
  const chunks: string[] = [];
  let current = "";
  for (const character of Array.from(token)) {
    const candidate = `${current}${character}`;
    if (current && measure(candidate, size, bold) > maxWidth) {
      chunks.push(current);
      current = character;
    } else {
      current = candidate;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

function wrapMeasuredText(
  value: string,
  maxWidth: number,
  size: number,
  bold: boolean,
  measure: MeasureText,
  locale: AppLocale,
) {
  const normalized = normalizeDisplayText(value) || translate(locale, "Not provided");
  const paragraphs = normalized.split(/\r?\n/);
  const lines: string[] = [];

  for (const paragraphValue of paragraphs) {
    const paragraph = paragraphValue.trim();
    if (!paragraph) {
      lines.push("");
      continue;
    }

    if (isCjkLocale(locale)) {
      lines.push(...splitLongToken(paragraph, maxWidth, size, bold, measure));
      continue;
    }

    const words = paragraph.split(/\s+/);
    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (measure(candidate, size, bold) <= maxWidth) {
        current = candidate;
        continue;
      }
      if (current) lines.push(current);
      if (measure(word, size, bold) <= maxWidth) {
        current = word;
      } else {
        const chunks = splitLongToken(word, maxWidth, size, bold, measure);
        lines.push(...chunks.slice(0, -1));
        current = chunks.at(-1) || "";
      }
    }
    if (current) lines.push(current);
  }

  return lines.length ? lines : [translate(locale, "Not provided")];
}

function toneFill(tone: Tone = "default") {
  switch (tone) {
    case "success": return { canvas: "#eaf8f0", vector: "0.92 0.98 0.95 rg", border: "#a8ddbe", vectorBorder: "0.66 0.87 0.75 RG" };
    case "warning": return { canvas: "#fff7e8", vector: "1 0.97 0.91 rg", border: "#efd19a", vectorBorder: "0.94 0.82 0.60 RG" };
    case "danger": return { canvas: "#fff0ed", vector: "1 0.94 0.93 rg", border: "#efb2a8", vectorBorder: "0.94 0.70 0.66 RG" };
    case "accent": return { canvas: "#e9f8fa", vector: "0.91 0.97 0.98 rg", border: "#a9dce2", vectorBorder: "0.66 0.86 0.89 RG" };
    case "violet": return { canvas: "#f4f0ff", vector: "0.96 0.94 1 rg", border: "#d3c6f7", vectorBorder: "0.83 0.78 0.97 RG" };
    case "muted": return { canvas: "#f2f5f7", vector: "0.95 0.96 0.97 rg", border: "#d6dde1", vectorBorder: "0.84 0.87 0.88 RG" };
    default: return { canvas: "#ffffff", vector: "1 1 1 rg", border: "#d7e0e4", vectorBorder: "0.84 0.88 0.89 RG" };
  }
}

function toneText(tone: Tone = "default") {
  switch (tone) {
    case "success": return { canvas: "#0d6e47", vector: "0.05 0.43 0.28 rg" };
    case "warning": return { canvas: "#8a5a08", vector: "0.54 0.35 0.03 rg" };
    case "danger": return { canvas: "#a43d26", vector: "0.64 0.24 0.15 rg" };
    case "accent": return { canvas: "#087080", vector: "0.03 0.44 0.50 rg" };
    case "violet": return { canvas: "#5b3aa9", vector: "0.36 0.23 0.66 rg" };
    case "muted": return { canvas: "#5d6971", vector: "0.36 0.41 0.44 rg" };
    default: return { canvas: "#101b22", vector: "0.06 0.11 0.13 rg" };
  }
}

function toneForPercentage(percentage: number, minimum = 75): Tone {
  if (percentage >= Math.max(80, minimum)) return "success";
  if (percentage >= minimum) return "accent";
  return percentage >= minimum - 10 ? "warning" : "danger";
}

function durationText(seconds: number, t: (source: string, values?: Record<string, string | number>) => string) {
  const minutes = Math.max(0, Math.round(seconds / 60));
  return minutes < 60
    ? t("{minutes} min", { minutes })
    : t("{hours}h {minutes}m", { hours: Math.floor(minutes / 60), minutes: minutes % 60 });
}

function buildReportChapters(detail: SubmissionDetail, locale: AppLocale): ReportChapter[] {
  const t = (source: string, values: Record<string, string | number> = {}) => translate(locale, source, values);
  const candidateSubtitle = `${detail.candidateName} - ${detail.roleLabel}`;

  const personalityCards: ReportCard[] = detail.analysis.psychologyProfile.length
    ? detail.analysis.psychologyProfile.map((trait) => ({
        title: trait.label,
        metric: `${trait.percentage}%`,
        progress: trait.percentage,
        tone: trait.band === "strong" ? "success" : trait.band === "develop" ? "warning" : "danger",
        sections: [
          { label: trait.bandLabel, text: trait.interpretation },
          { label: t("Manager follow-up:"), text: trait.managerFollowUp, tone: "muted" },
        ],
      }))
    : detail.categoryScores
        .filter((score) => score.category !== "technical")
        .map((score, index) => {
          const strength = detail.analysis.strengths.find((item) => item.category === score.category);
          const priority = detail.analysis.priorities.find((item) => item.category === score.category);
          return {
            title: t(reportCategoryLabels[score.category]),
            metric: `${score.percentage}%`,
            progress: score.percentage,
            tone: toneForPercentage(score.percentage, categoryMinimums[score.category]),
            sections: [
              { text: strength?.statement || priority?.statement || detail.analysis.interviewPrompts[index] || detail.analysis.summary },
              ...(detail.analysis.interviewPrompts[index]
                ? [{ label: t("Manager follow-up:"), text: detail.analysis.interviewPrompts[index], tone: "muted" as Tone }]
                : []),
            ],
          };
        });

  const eligibilityNotes = [
    !detail.biodata.authorizedToWork ? t("Candidate did not self-confirm U.S. work authorization.") : null,
    !detail.biodata.meetsAgeRequirement ? t("Candidate did not self-confirm the position’s minimum age requirement.") : null,
  ].filter(Boolean) as string[];

  const jobFitCards: ReportCard[] = [
    {
      title: t("Candidate & result"),
      tone: "accent",
      sections: [
        { label: t("Candidate"), text: detail.candidateName },
        { label: t("Phone"), text: detail.phone },
        { label: t("Requested position"), text: detail.roleLabel },
        { label: t("Job family"), text: detail.jobFamilyLabel },
        { label: t("Restaurant type"), text: detail.restaurantConceptLabel },
        { label: t("Experience level"), text: detail.experienceLevelLabel },
        { label: t("Written result"), text: outcomeText(detail.outcome, locale) },
      ],
    },
    {
      title: t("Assessment conclusion"),
      tone: detail.outcome === "pass" ? "success" : "warning",
      sections: [{ text: detail.analysis.summary }],
    },
    {
      title: t("Hiring recommendation"),
      metric: `${detail.analysis.hiringRecommendation.fitPercentage}%`,
      progress: detail.analysis.hiringRecommendation.fitPercentage,
      tone: detail.analysis.hiringRecommendation.status === "recommended"
        ? "success"
        : detail.analysis.hiringRecommendation.status === "conditional"
          ? "warning"
          : "danger",
      sections: [
        { label: t("Recommendation"), text: detail.analysis.hiringRecommendation.label },
        { text: detail.analysis.hiringRecommendation.rationale },
        { text: t("Decision support only: Owner or Manager must confirm job-related evidence through the same structured process used for comparable candidates."), tone: "muted" },
      ],
    },
    ...detail.categoryScores.map((score) => ({
      title: t(score.label || reportCategoryLabels[score.category]),
      metric: `${score.percentage}%`,
      progress: score.percentage,
      tone: toneForPercentage(score.percentage, categoryMinimums[score.category]),
      sections: [{ text: score.percentage >= categoryMinimums[score.category] ? t("Minimum met") : t("Below minimum") }],
    } satisfies ReportCard)),
    ...(detail.analysis.strengths.length
      ? detail.analysis.strengths.map((item) => ({
          title: `${t("Demonstrated strengths")} - ${t(item.label)}`,
          metric: `${item.percentage}%`,
          tone: "success" as Tone,
          sections: [{ text: item.statement }],
        }))
      : [{
          title: t("Demonstrated strengths"),
          tone: "muted" as Tone,
          sections: [{ text: t("No section reached the 75% strength marker. Use the follow-up prompts to verify capability.") }],
        }]),
    ...(detail.analysis.priorities.length
      ? detail.analysis.priorities.map((item) => ({
          title: `${t("Priority review areas")} - ${t(item.label)}`,
          metric: `${item.percentage}%`,
          tone: "warning" as Tone,
          sections: [{ text: item.statement }],
        }))
      : [{
          title: t("Priority review areas"),
          tone: "muted" as Tone,
          sections: [{ text: t("No major section priority was identified. Still verify technical knowledge in interview.") }],
        }]),
    {
      title: t("Decision criteria"),
      tone: "muted",
      sections: [
        { text: detail.analysis.methodology },
        ...(detail.analysis.failedRules.length
          ? detail.analysis.failedRules.map((rule, index) => ({ label: `${index + 1}`, text: rule, tone: "danger" as Tone }))
          : [{ text: t("All written-assessment minimums were met."), tone: "success" as Tone }]),
        { label: t("Completed in {duration}", { duration: durationText(detail.durationSeconds, t) }), text: outcomeText(detail.outcome, locale), tone: "muted" },
      ],
    },
    ...detail.analysis.reviewItems.map((item) => ({
      title: `${item.questionId} - ${t(item.categoryLabel)}`,
      tone: item.isCritical && item.points === 0 ? "danger" as Tone : "warning" as Tone,
      sections: [
        ...(item.isCritical ? [{ label: t("Critical"), text: t("Critical procedure verification"), tone: "danger" as Tone }] : []),
        { text: item.prompt },
        { label: t("Selected:"), text: item.selectedText },
        { label: t("Manager lens:"), text: item.reviewNote, tone: "muted" as Tone },
      ],
    })),
    ...detail.analysis.interviewPrompts.map((prompt, index) => ({
      title: `${t("Structured interview follow-up")} ${index + 1}`,
      tone: "accent" as Tone,
      sections: [{ text: prompt }],
    })),
  ];

  if (eligibilityNotes.length) {
    jobFitCards.push({
      title: t("Separate eligibility verification needed"),
      tone: "warning",
      sections: [
        ...eligibilityNotes.map((note) => ({ text: note, tone: "warning" as Tone })),
        { text: t("These self-reported items are shown separately and are not included in the 1–100% assessment score."), tone: "muted" },
      ],
    });
  }

  const swotCards: ReportCard[] = [
    {
      title: t("Strengths"),
      tone: "success",
      sections: detail.analysis.swot.strengths.length
        ? detail.analysis.swot.strengths.map((point) => ({ label: point.title, text: point.detail }))
        : [{ text: t("No verified strength signal.") }],
    },
    {
      title: t("Weaknesses"),
      tone: "warning",
      sections: detail.analysis.swot.weaknesses.length
        ? detail.analysis.swot.weaknesses.map((point) => ({ label: point.title, text: point.detail }))
        : [{ text: t("No major weakness identified.") }],
    },
    {
      title: t("Opportunities"),
      tone: "accent",
      sections: detail.analysis.swot.opportunities.length
        ? detail.analysis.swot.opportunities.map((point) => ({ label: point.title, text: point.detail }))
        : [{ text: t("Continue structured development.") }],
    },
    {
      title: t("Threats / hiring risks"),
      tone: "danger",
      sections: detail.analysis.swot.threats.length
        ? detail.analysis.swot.threats.map((point) => ({ label: point.title, text: point.detail }))
        : [{ text: t("Verify performance under live restaurant conditions.") }],
    },
    ...detail.analysis.developmentPlan.map((plan) => ({
      title: `${plan.priority}. ${plan.area}`,
      metric: plan.estimatedTimeline,
      tone: "violet" as Tone,
      sections: [
        { label: t("Action"), text: plan.action },
        { label: t("Success check"), text: plan.successMeasure, tone: "success" as Tone },
      ],
    })),
    {
      title: t("If hired: improvement plan"),
      tone: "violet",
      sections: [{ text: detail.analysis.developmentNote }],
    },
  ];

  if (detail.analysis.alternativePositions.length) {
    swotCards.push(
      ...detail.analysis.alternativePositions.map((position) => ({
        title: `${t("Alternative positions to explore")} - ${position.label}`,
        tone: "accent" as Tone,
        sections: [{ text: position.reason }],
      })),
      {
        title: t("Position recommendation"),
        tone: "muted",
        sections: [{ text: t("Alternative roles are exploratory, not automatic placement decisions.") }],
      },
    );
  } else {
    swotCards.push({
      title: t("Position recommendation"),
      tone: "success",
      sections: [
        { label: t("Recommended path"), text: t("The requested position remains the recommended path. Continue with the standard structured interview and reference process.") },
      ],
    });
  }

  swotCards.push({
    title: t("Important limitation:"),
    tone: "muted",
    sections: [{ text: detail.analysis.limitation }],
  });

  return [
    {
      eyebrow: t("SECTION 1 · PERSONALITY"),
      title: t("Candidate personality profile"),
      subtitle: `${candidateSubtitle} - ${t("Job-related, non-clinical work traits")}`,
      cards: personalityCards,
    },
    {
      eyebrow: t("SECTION 2 · JOB FIT"),
      title: t("Fit with the requested position"),
      subtitle: `${candidateSubtitle} - ${outcomeText(detail.outcome, locale)}`,
      cards: jobFitCards,
    },
    {
      eyebrow: t("SECTION 3 · DECISION SUPPORT"),
      title: t("SWOT, development & next-best roles"),
      subtitle: t("Practical guidance for a consistent, job-related manager review"),
      cards: swotCards,
    },
  ];
}

function preparePageHeader(chapter: ReportChapter, measure: MeasureText, locale: AppLocale) {
  const rows: RelativeTextRow[] = [];
  rows.push({ text: normalizeDisplayText(chapter.eyebrow), x: PAGE_LEFT, y: 82, size: 10, bold: true, tone: "accent" });

  let cursor = 106;
  const titleLines = wrapMeasuredText(chapter.title, PAGE_CONTENT_WIDTH, 24, true, measure, locale);
  titleLines.forEach((text) => {
    rows.push({ text, x: PAGE_LEFT, y: cursor, size: 24, bold: true });
    cursor += 28;
  });

  cursor += 1;
  const subtitleLines = wrapMeasuredText(chapter.subtitle, PAGE_CONTENT_WIDTH, 12, false, measure, locale);
  subtitleLines.forEach((text) => {
    rows.push({ text, x: PAGE_LEFT, y: cursor, size: 12, tone: "muted" });
    cursor += 17;
  });

  return { rows, contentStart: cursor + 10 };
}

function prepareCard(card: ReportCard, width: number, measure: MeasureText, locale: AppLocale): PreparedCard {
  const rows: RelativeTextRow[] = [];
  const padding = 16;
  const innerWidth = width - padding * 2;
  const metric = card.metric ? normalizeDisplayText(card.metric) : "";
  const measuredMetricWidth = metric ? measure(metric, 18, true) : 0;
  const inlineMetric = Boolean(metric) && measuredMetricWidth <= 160;
  const metricWidth = inlineMetric ? Math.max(86, measuredMetricWidth + 12) : 0;
  const titleWidth = innerWidth - metricWidth;
  const titleLines = wrapMeasuredText(card.title, titleWidth, 16, true, measure, locale);

  let cursor = padding;
  titleLines.forEach((text) => {
    rows.push({ text, x: padding, y: cursor + 15, size: 16, bold: true, tone: card.tone });
    cursor += 20;
  });

  if (metric && inlineMetric) {
    rows.push({
      text: metric,
      x: width - padding - measure(metric, 18, true),
      y: padding + 17,
      size: 18,
      bold: true,
      tone: card.tone,
    });
    cursor = Math.max(cursor, padding + 24);
  } else if (metric) {
    cursor += 2;
    wrapMeasuredText(metric, innerWidth, 11, true, measure, locale).forEach((text) => {
      rows.push({ text, x: padding, y: cursor + 11, size: 11, bold: true, tone: card.tone });
      cursor += 15;
    });
  }

  let progressY: number | undefined;
  if (typeof card.progress === "number") {
    progressY = cursor + 4;
    cursor += 12;
  }

  if (card.sections.length) cursor += 7;
  card.sections.forEach((section, sectionIndex) => {
    if (sectionIndex > 0) cursor += 9;
    if (section.label) {
      const labelLines = wrapMeasuredText(section.label, innerWidth, 10, true, measure, locale);
      labelLines.forEach((text) => {
        rows.push({ text, x: padding, y: cursor + 10, size: 10, bold: true, tone: section.tone || "muted" });
        cursor += 14;
      });
      cursor += 2;
    }

    const bodyLines = wrapMeasuredText(section.text, innerWidth, BODY_FONT_SIZE, false, measure, locale);
    bodyLines.forEach((text) => {
      rows.push({ text, x: padding, y: cursor + 14, size: BODY_FONT_SIZE, tone: section.tone || "default" });
      cursor += BODY_LINE_HEIGHT;
    });
  });

  return {
    ...card,
    width,
    height: cursor + padding,
    rows,
    progressY,
  };
}

function splitOversizedCard(
  card: ReportCard,
  width: number,
  maximumHeight: number,
  measure: MeasureText,
  locale: AppLocale,
) {
  const prepared = prepareCard(card, width, measure, locale);
  if (prepared.height <= maximumHeight) return [card];

  const segments: ReportCard[] = [];
  let currentSections: ReportSection[] = [];
  const flush = () => {
    if (!currentSections.length) return;
    segments.push({
      ...card,
      metric: segments.length ? undefined : card.metric,
      progress: segments.length ? undefined : card.progress,
      sections: currentSections,
    });
    currentSections = [];
  };

  for (const section of card.sections) {
    const candidate = {
      ...card,
      metric: segments.length ? undefined : card.metric,
      progress: segments.length ? undefined : card.progress,
      sections: [...currentSections, section],
    };
    if (currentSections.length && prepareCard(candidate, width, measure, locale).height > maximumHeight) flush();

    const standalone = {
      ...card,
      metric: segments.length ? undefined : card.metric,
      progress: segments.length ? undefined : card.progress,
      sections: [section],
    };
    if (prepareCard(standalone, width, measure, locale).height <= maximumHeight) {
      currentSections.push(section);
      continue;
    }

    const innerWidth = width - 32;
    const labelHeight = section.label
      ? wrapMeasuredText(section.label, innerWidth, 10, true, measure, locale).length * 14 + 2
      : 0;
    const titleHeight = wrapMeasuredText(card.title, innerWidth, 16, true, measure, locale).length * 20;
    const availableLines = Math.max(1, Math.floor((maximumHeight - titleHeight - labelHeight - 66) / BODY_LINE_HEIGHT));
    const lines = wrapMeasuredText(section.text, innerWidth, BODY_FONT_SIZE, false, measure, locale);
    for (let index = 0; index < lines.length; index += availableLines) {
      flush();
      const chunk = lines.slice(index, index + availableLines).join("\n");
      segments.push({
        ...card,
        metric: segments.length ? undefined : card.metric,
        progress: segments.length ? undefined : card.progress,
        sections: [{ ...section, text: chunk }],
      });
    }
  }
  flush();
  return segments;
}

function layoutReport(detail: SubmissionDetail, locale: AppLocale, measure: MeasureText) {
  const chapters = buildReportChapters(detail, locale);
  const pages: LaidOutPage[] = [];

  for (const chapter of chapters) {
    const header = preparePageHeader(chapter, measure, locale);
    const maximumCardHeight = PAGE_CONTENT_BOTTOM - header.contentStart;
    let page: LaidOutPage = { chapter, headerRows: header.rows, cards: [] };
    let cursor = header.contentStart;

    for (const sourceCard of chapter.cards) {
      const segments = splitOversizedCard(sourceCard, PAGE_CONTENT_WIDTH, maximumCardHeight, measure, locale);
      for (const segment of segments) {
        const prepared = prepareCard(segment, PAGE_CONTENT_WIDTH, measure, locale);
        if (page.cards.length && cursor + prepared.height > PAGE_CONTENT_BOTTOM) {
          pages.push(page);
          page = { chapter, headerRows: header.rows, cards: [] };
          cursor = header.contentStart;
        }
        page.cards.push({ ...prepared, x: PAGE_LEFT, y: cursor });
        cursor += prepared.height + CARD_GAP;
      }
    }
    pages.push(page);
  }

  return pages;
}

function approximateMeasure(locale: AppLocale): MeasureText {
  return (text, size, bold = false) => Array.from(normalizeDisplayText(text)).reduce((sum, character) => {
    if (/\s/.test(character)) return sum + size * 0.28;
    if (isCjkLocale(locale) || character.codePointAt(0)! > 0xff) return sum + size;
    if (/[ilI1.,:;'|]/.test(character)) return sum + size * 0.28;
    if (/[MW@#%]/.test(character)) return sum + size * 0.86;
    return sum + size * (bold ? 0.58 : 0.53);
  }, 0);
}

function vectorY(topBaseline: number) {
  return PAGE_HEIGHT - topBaseline;
}

function pageStream(
  page: LaidOutPage,
  pageNumber: number,
  totalPages: number,
  candidate: string,
  locale: AppLocale,
  measure: MeasureText,
) {
  const bodyFont = isCjkLocale(locale) ? "F3" : "F1";
  const boldFont = isCjkLocale(locale) ? "F3" : "F2";
  const commands: string[] = [
    "0.96 0.97 0.98 rg 0 0 612 792 re f",
    "0.03 0.12 0.18 rg 0 736 612 56 re f",
    "0.26 0.88 0.92 rg 0 736 612 4 re f",
    "1 1 1 rg",
    `BT /${boldFont} 11 Tf 50 758 Td ${pdfValue("FRED HIRING SYSTEM", locale)} Tj ET`,
    "0.72 0.86 0.89 rg",
    `BT /${bodyFont} 8 Tf 445 758 Td ${pdfValue(translate(locale, "Confidential report"), locale)} Tj ET`,
  ];

  const drawText = (row: RelativeTextRow, xOffset = 0, yOffset = 0) => {
    commands.push(
      toneText(row.tone).vector,
      `BT /${row.bold ? boldFont : bodyFont} ${row.size} Tf 1 0 0 1 ${row.x + xOffset} ${vectorY(row.y + yOffset)} Tm ${pdfValue(row.text, locale)} Tj ET`,
    );
  };

  page.headerRows.forEach((row) => drawText(row));
  page.cards.forEach((card) => {
    const fill = toneFill(card.tone);
    const rectangleY = PAGE_HEIGHT - card.y - card.height;
    commands.push(
      fill.vector,
      fill.vectorBorder,
      "0.8 w",
      `${card.x} ${rectangleY} ${card.width} ${card.height} re B`,
      toneText(card.tone).vector,
      `${card.x} ${PAGE_HEIGHT - card.y - 4} ${card.width} 4 re f`,
    );
    if (typeof card.progress === "number" && typeof card.progressY === "number") {
      const trackWidth = card.width - 32;
      commands.push(
        "0.84 0.88 0.89 rg",
        `${card.x + 16} ${PAGE_HEIGHT - card.y - card.progressY - 4} ${trackWidth} 4 re f`,
        toneText(card.tone).vector,
        `${card.x + 16} ${PAGE_HEIGHT - card.y - card.progressY - 4} ${trackWidth * Math.max(0, Math.min(100, card.progress)) / 100} 4 re f`,
      );
    }
    card.rows.forEach((row) => drawText(row, card.x, card.y));
  });

  const footerLeft = `${translate(locale, "Confidential")} - ${candidate}`;
  const footerRight = `${pageNumber} / ${totalPages}`;
  commands.push(
    "0.03 0.12 0.18 rg 0 0 612 44 re f",
    "0.78 0.86 0.88 rg",
    `BT /${bodyFont} 9 Tf 50 18 Td ${pdfValue(footerLeft, locale)} Tj ET`,
    `BT /${boldFont} 9 Tf ${562 - measure(footerRight, 9, true)} 18 Td ${pdfValue(footerRight, locale)} Tj ET`,
  );
  return `${commands.join("\n")}\n`;
}

export function candidateReportFilename(detail: SubmissionDetail) {
  const safeName = ascii(detail.candidateName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "candidate";
  return `fred-hiring-assessment-${safeName}-complete.pdf`;
}

function createVectorCandidateReportPdf(detail: SubmissionDetail, locale: AppLocale) {
  const measure = approximateMeasure(locale);
  const pages = layoutReport(detail, locale, measure);
  const objects: string[] = [];
  const firstPageObject = 7;
  const pageRefs = pages.map((_, index) => `${firstPageObject + index * 2} 0 R`).join(" ");

  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Kids [${pageRefs}] /Count ${pages.length} >>`;
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
  objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";
  const cjkFont = locale === "zh-TW" ? "MSung-Light" : "STSong-Light";
  const cjkEncoding = locale === "zh-TW" ? "UniCNS-UCS2-H" : "UniGB-UCS2-H";
  const cjkOrdering = locale === "zh-TW" ? "CNS1" : "GB1";
  objects[5] = `<< /Type /Font /Subtype /Type0 /BaseFont /${cjkFont} /Encoding /${cjkEncoding} /DescendantFonts [6 0 R] >>`;
  objects[6] = `<< /Type /Font /Subtype /CIDFontType0 /BaseFont /${cjkFont} /CIDSystemInfo << /Registry (Adobe) /Ordering (${cjkOrdering}) /Supplement 4 >> >>`;

  pages.forEach((page, index) => {
    const pageObject = firstPageObject + index * 2;
    const contentObject = pageObject + 1;
    const stream = pageStream(page, index + 1, pages.length, detail.candidateName, locale, measure);
    objects[pageObject] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents ${contentObject} 0 R >>`;
    objects[contentObject] = `<< /Length ${stream.length} >>\nstream\n${stream}endstream`;
  });

  let pdf = "%PDF-1.4\n% Fred Hiring System complete candidate analysis\n";
  const offsets: number[] = [0];
  for (let index = 1; index < objects.length; index += 1) {
    offsets[index] = pdf.length;
    pdf += `${index} 0 obj\n${objects[index]}\nendobj\n`;
  }
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let index = 1; index < objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}

function base64Bytes(value: string) {
  const binary = window.atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function createRasterCandidateReportPdf(detail: SubmissionDetail, locale: AppLocale) {
  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = PAGE_WIDTH * scale;
  canvas.height = PAGE_HEIGHT * scale;
  const context = canvas.getContext("2d");
  if (!context) return createVectorCandidateReportPdf(detail, locale);

  const fontFamily = "Arial";
  const measure: MeasureText = (text, size, bold = false) => {
    context.font = `${bold ? 700 : 400} ${size}px ${fontFamily}`;
    return context.measureText(normalizeDisplayText(text)).width;
  };
  const pages = layoutReport(detail, locale, measure);

  const pageImages = pages.map((page, pageIndex) => {
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.fillStyle = "#f4f7f8";
    context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
    context.textBaseline = "alphabetic";
    context.fillStyle = "#071f2f";
    context.fillRect(0, 0, PAGE_WIDTH, 56);
    context.fillStyle = "#42e1ea";
    context.fillRect(0, 52, PAGE_WIDTH, 4);
    context.fillStyle = "#ffffff";
    context.font = `700 11px ${fontFamily}`;
    context.fillText("FRED HIRING SYSTEM", 50, 34);
    context.fillStyle = "#bfd8dd";
    context.font = `400 8px ${fontFamily}`;
    context.textAlign = "right";
    context.fillText(translate(locale, "Confidential report"), 562, 34);
    context.textAlign = "left";

    const drawText = (row: RelativeTextRow, xOffset = 0, yOffset = 0) => {
      context.fillStyle = toneText(row.tone).canvas;
      context.font = `${row.bold ? 700 : 400} ${row.size}px ${fontFamily}`;
      context.fillText(row.text, row.x + xOffset, row.y + yOffset);
    };

    page.headerRows.forEach((row) => drawText(row));
    page.cards.forEach((card) => {
      const fill = toneFill(card.tone);
      context.beginPath();
      context.roundRect(card.x, card.y, card.width, card.height, 12);
      context.fillStyle = fill.canvas;
      context.fill();
      context.strokeStyle = fill.border;
      context.lineWidth = 0.8;
      context.stroke();
      context.save();
      context.beginPath();
      context.roundRect(card.x, card.y, card.width, card.height, 12);
      context.clip();
      context.fillStyle = toneText(card.tone).canvas;
      context.fillRect(card.x, card.y, card.width, 4);
      context.restore();

      if (typeof card.progress === "number" && typeof card.progressY === "number") {
        const trackWidth = card.width - 32;
        context.fillStyle = "#d5e0e3";
        context.fillRect(card.x + 16, card.y + card.progressY, trackWidth, 4);
        context.fillStyle = toneText(card.tone).canvas;
        context.fillRect(card.x + 16, card.y + card.progressY, trackWidth * Math.max(0, Math.min(100, card.progress)) / 100, 4);
      }
      card.rows.forEach((row) => drawText(row, card.x, card.y));
    });

    context.fillStyle = "#071f2f";
    context.fillRect(0, 748, PAGE_WIDTH, 44);
    context.fillStyle = "#c7dade";
    context.font = `400 9px ${fontFamily}`;
    context.fillText(`${translate(locale, "Confidential")} - ${detail.candidateName}`, 50, 774);
    context.textAlign = "right";
    context.font = `700 9px ${fontFamily}`;
    context.fillText(`${pageIndex + 1} / ${pages.length}`, 562, 774);
    context.textAlign = "left";

    return base64Bytes(canvas.toDataURL("image/jpeg", 0.94).split(",", 2)[1]);
  });

  const encoder = new TextEncoder();
  const objects: Array<Array<Uint8Array>> = [];
  const pageObjectNumbers = pageImages.map((_, index) => 3 + index * 3);
  objects[1] = [encoder.encode("<< /Type /Catalog /Pages 2 0 R >>")];
  objects[2] = [encoder.encode(`<< /Type /Pages /Kids [${pageObjectNumbers.map((number) => `${number} 0 R`).join(" ")}] /Count ${pages.length} >>`)];

  pageImages.forEach((image, index) => {
    const pageObject = pageObjectNumbers[index];
    const imageObject = pageObject + 1;
    const contentObject = pageObject + 2;
    const imageName = `Im${index}`;
    const stream = encoder.encode(`q\n612 0 0 792 0 0 cm\n/${imageName} Do\nQ\n`);
    objects[pageObject] = [encoder.encode(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /${imageName} ${imageObject} 0 R >> >> /Contents ${contentObject} 0 R >>`)];
    objects[imageObject] = [
      encoder.encode(`<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.length} >>\nstream\n`),
      image,
      encoder.encode("\nendstream"),
    ];
    objects[contentObject] = [encoder.encode(`<< /Length ${stream.length} >>\nstream\n`), stream, encoder.encode("endstream")];
  });

  const chunks: Uint8Array[] = [encoder.encode("%PDF-1.4\n% Fred Hiring System complete Arial candidate analysis\n")];
  const offsets: number[] = [0];
  let byteLength = chunks[0].length;
  for (let index = 1; index < objects.length; index += 1) {
    offsets[index] = byteLength;
    const prefix = encoder.encode(`${index} 0 obj\n`);
    const suffix = encoder.encode("\nendobj\n");
    chunks.push(prefix, ...objects[index], suffix);
    byteLength += prefix.length + objects[index].reduce((sum, chunk) => sum + chunk.length, 0) + suffix.length;
  }
  const xrefOffset = byteLength;
  let xref = `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let index = 1; index < objects.length; index += 1) {
    xref += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  xref += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  chunks.push(encoder.encode(xref));
  return new Blob(chunks.map((chunk) => new Uint8Array(chunk).buffer), { type: "application/pdf" });
}

export function createCandidateReportPdf(detail: SubmissionDetail, locale: AppLocale = "en") {
  if (typeof document !== "undefined" && typeof window !== "undefined") {
    return createRasterCandidateReportPdf(detail, locale);
  }
  return createVectorCandidateReportPdf(detail, locale);
}

export function candidateShareText(detail: SubmissionDetail, locale: AppLocale = "en") {
  const t = (source: string, values: Record<string, string | number> = {}) => translate(locale, source, values);
  const alternatives = detail.analysis.alternativePositions || [];
  return [
    t("Fred Hiring System candidate assessment: {name}", { name: detail.candidateName }),
    t("Position: {position}", { position: detail.roleLabel }),
    t("Position-fit score: {percentage}%", { percentage: detail.fitPercentage }),
    t("Hiring recommendation: {recommendation}", { recommendation: detail.analysis.hiringRecommendation.label }),
    t("Written result: {result}", { result: outcomeText(detail.outcome, locale) }),
    ...(alternatives.length
      ? [t("Alternative positions to explore: {positions}", { positions: alternatives.map((item) => item.label).join(", ") })]
      : []),
    t("The confidential PDF report contains the detailed analysis and answer evidence."),
  ].join("\n");
}
