import type { SubmissionDetail } from "@/lib/client-types";
import { translate, type AppLocale } from "@/lib/i18n";
import type { QuestionCategory } from "@/lib/question-bank";

type Tone = "default" | "muted" | "accent" | "success" | "warning";

type CardSection = {
  label?: string;
  labelMaxLines?: number;
  text: string;
  tone?: Tone;
  maxLines?: number;
};

type ReportCard = {
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  tone?: Tone;
  metric?: string;
  sections: CardSection[];
};

type ReportPage = {
  eyebrow: string;
  title: string;
  subtitle: string;
  cards: ReportCard[];
};

type TextRow = {
  text: string;
  x: number;
  y: number;
  size: number;
  bold?: boolean;
  tone?: Tone;
};

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const REPORT_PAGE_COUNT = 3;

const reportCategoryLabels: Record<QuestionCategory, string> = {
  work_style: "Integrity & reliability",
  communication: "Teamwork & service",
  problem_solving: "Emotional control & adaptability",
  technical: "Technical knowledge",
};

const outcomeText = (outcome: SubmissionDetail["outcome"], locale: AppLocale) =>
  outcome === "pass" ? translate(locale, "PASSED WRITTEN TEST") : translate(locale, "DID NOT PASS WRITTEN TEST");

const isCjkLocale = (locale: AppLocale) => locale === "zh-CN" || locale === "zh-TW";

function ascii(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2013\u2014]/g, "-")
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
  for (const character of value) {
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

function cleanText(value: string, locale: AppLocale) {
  return isCjkLocale(locale) ? value.replace(/\s+/g, " ").trim() : ascii(value);
}

function truncateLine(value: string) {
  if (value.length <= 3) return value;
  return `${value.slice(0, -3).trimEnd()}...`;
}

function wrapText(value: string, maxCharacters: number, maxLines: number, locale: AppLocale) {
  const text = cleanText(value, locale) || translate(locale, "Not provided");
  let lines: string[] = [];
  if (isCjkLocale(locale)) {
    const characters = Array.from(text);
    lines = Array.from({ length: Math.ceil(characters.length / maxCharacters) }, (_, index) => (
      characters.slice(index * maxCharacters, (index + 1) * maxCharacters).join("")
    ));
  } else {
    const words = text.split(" ");
    let current = "";
    for (const word of words) {
      if (!current) current = word;
      else if (`${current} ${word}`.length <= maxCharacters) current += ` ${word}`;
      else {
        lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
  }
  if (lines.length <= maxLines) return lines;
  return [...lines.slice(0, maxLines - 1), truncateLine(lines[maxLines - 1])];
}

function maxCharacters(width: number, size: number, locale: AppLocale) {
  const characterWidth = size * (isCjkLocale(locale) ? 1 : 0.52);
  return Math.max(isCjkLocale(locale) ? 8 : 14, Math.floor(width / characterWidth));
}

function toneFill(tone: Tone = "default") {
  switch (tone) {
    case "success": return { canvas: "#eaf8f0", vector: "0.92 0.98 0.95 rg", border: "#a8ddbe", vectorBorder: "0.66 0.87 0.75 RG" };
    case "warning": return { canvas: "#fff2eb", vector: "1 0.95 0.92 rg", border: "#f0b9a7", vectorBorder: "0.94 0.73 0.65 RG" };
    case "accent": return { canvas: "#e9f8fa", vector: "0.91 0.97 0.98 rg", border: "#a9dce2", vectorBorder: "0.66 0.86 0.89 RG" };
    case "muted": return { canvas: "#f2f5f7", vector: "0.95 0.96 0.97 rg", border: "#d6dde1", vectorBorder: "0.84 0.87 0.88 RG" };
    default: return { canvas: "#ffffff", vector: "1 1 1 rg", border: "#d7e0e4", vectorBorder: "0.84 0.88 0.89 RG" };
  }
}

function toneText(tone: Tone = "default") {
  switch (tone) {
    case "success": return { canvas: "#0d6e47", vector: "0.05 0.43 0.28 rg" };
    case "warning": return { canvas: "#a43d26", vector: "0.64 0.24 0.15 rg" };
    case "accent": return { canvas: "#087080", vector: "0.03 0.44 0.50 rg" };
    case "muted": return { canvas: "#5d6971", vector: "0.36 0.41 0.44 rg" };
    default: return { canvas: "#101b22", vector: "0.06 0.11 0.13 rg" };
  }
}

function cardTextRows(card: ReportCard, locale: AppLocale) {
  const rows: TextRow[] = [];
  const innerWidth = card.width - 32;
  const titleWidth = card.metric ? innerWidth - 90 : innerWidth;
  const titleLines = wrapText(card.title, maxCharacters(titleWidth, 14, locale), 2, locale);
  titleLines.forEach((line, index) => rows.push({
    text: line,
    x: card.x + 16,
    y: card.y + 26 + index * 17,
    size: 14,
    bold: true,
    tone: card.tone || "default",
  }));
  if (card.metric) {
    rows.push({
      text: card.metric,
      x: card.x + card.width - 72,
      y: card.y + 29,
      size: 22,
      bold: true,
      tone: card.tone || "default",
    });
  }

  let cursor = card.y + Math.max(52, 35 + titleLines.length * 17);
  const bottom = card.y + card.height - 13;
  for (const section of card.sections) {
    if (cursor >= bottom) break;
    if (section.label) {
      const labelLines = wrapText(
        isCjkLocale(locale) ? section.label : section.label.toUpperCase(),
        maxCharacters(innerWidth, 10, locale),
        section.labelMaxLines || 1,
        locale,
      );
      labelLines.forEach((line) => {
        rows.push({ text: line, x: card.x + 16, y: cursor, size: 10, bold: true, tone: section.tone || "muted" });
        cursor += 14;
      });
      cursor += 4;
    }
    const availableLines = Math.max(1, Math.floor((bottom - cursor) / 18) + 1);
    const limit = Math.min(section.maxLines || 2, availableLines);
    const lines = wrapText(section.text, maxCharacters(innerWidth, 14, locale), limit, locale);
    lines.forEach((line) => {
      rows.push({ text: line, x: card.x + 16, y: cursor, size: 14, tone: section.tone || "default" });
      cursor += 18;
    });
    cursor += 8;
  }
  return rows;
}

function joinAnalysisPoints(points: Array<{ title: string; detail: string }>, locale: AppLocale, fallback: string) {
  if (!points.length) return fallback;
  const point = points[0];
  return `${point.title}: ${point.detail}`;
}

function buildReportPages(detail: SubmissionDetail, locale: AppLocale): ReportPage[] {
  const t = (source: string, values: Record<string, string | number> = {}) => translate(locale, source, values);
  const profile = detail.analysis.psychologyProfile.slice(0, 6);
  const traitCards = profile.map((trait, index): ReportCard => ({
    x: index % 2 === 0 ? 44 : 310,
    y: 154 + Math.floor(index / 2) * 184,
    width: 258,
    height: 174,
    title: trait.label,
    metric: `${trait.percentage}%`,
    tone: trait.band === "strong" ? "success" : trait.band === "develop" ? "accent" : "warning",
    sections: [
      { label: trait.bandLabel, text: trait.interpretation, maxLines: 5 },
    ],
  }));

  const minimums = [65, 65, 70, 70];
  const categoryCards = detail.categoryScores.slice(0, 4).map((score, index): ReportCard => ({
    x: index % 2 === 0 ? 44 : 311,
    y: 404 + Math.floor(index / 2) * 72,
    width: 257,
    height: 60,
    title: t(reportCategoryLabels[score.category]),
    metric: `${score.percentage}%`,
    tone: score.percentage >= minimums[index] ? "success" : "warning",
    sections: [{
      text: score.percentage >= minimums[index] ? t("Minimum met") : t("Below minimum"),
      maxLines: 1,
    }],
  }));

  const strongest = detail.analysis.strengths[0];
  const priority = detail.analysis.priorities[0];
  const strengthSections: CardSection[] = strongest
    ? [{
        label: `${t(reportCategoryLabels[strongest.category])} · ${strongest.percentage}%`,
        text: strongest.statement,
        maxLines: 4,
      }]
    : [{ text: t("No section reached the strength marker; confirm capability in a structured interview."), maxLines: 4 }];
  const prioritySections: CardSection[] = priority
    ? [{
        label: `${t(reportCategoryLabels[priority.category])} · ${priority.percentage}%`,
        text: priority.statement,
        maxLines: 4,
      }]
    : [{ text: t("No major section priority was identified; verify technical knowledge in the interview."), maxLines: 4 }];

  const alternatives = detail.analysis.alternativePositions || [];
  const alternativeSections: CardSection[] = alternatives.length
    ? [
        {
          text: t("These adjacent roles may better match the current evidence. Each requires a separate role-specific interview or skills check."),
          maxLines: 3,
          tone: "muted",
        },
        ...alternatives.slice(0, 3).map((position) => ({
          label: position.label,
          text: t("Separate role-specific verification required."),
          maxLines: 1,
        })),
      ]
    : [{
        label: t("Recommended path"),
        text: t("The requested position remains the recommended path. Continue with the standard structured interview and reference process."),
        maxLines: 4,
        tone: "success",
      }];

  const developmentSections: CardSection[] = detail.analysis.developmentPlan.slice(0, 2).map((plan) => ({
    label: `${plan.priority}. ${plan.area}`,
    labelMaxLines: 2,
    text: `${plan.estimatedTimeline}: ${plan.action}`,
    maxLines: 3,
  }));

  return [
    {
      eyebrow: t("PAGE 1 · PERSONALITY"),
      title: t("Candidate personality profile"),
      subtitle: `${detail.candidateName} · ${detail.roleLabel} · ${t("Job-related, non-clinical work traits")}`,
      cards: traitCards,
    },
    {
      eyebrow: t("PAGE 2 · JOB FIT"),
      title: t("Fit with the requested position"),
      subtitle: `${detail.candidateName} · ${detail.roleLabel} · ${outcomeText(detail.outcome, locale)}`,
      cards: [
        {
          x: 44, y: 154, width: 524, height: 140,
          title: t("Hiring recommendation"),
          metric: `${detail.fitPercentage}%`,
          tone: detail.analysis.hiringRecommendation.status === "recommended" ? "success" : "warning",
          sections: [
            { label: t("Recommendation"), text: detail.analysis.hiringRecommendation.label, maxLines: 1 },
            { text: detail.analysis.hiringRecommendation.rationale, maxLines: 3 },
          ],
        },
        { x: 44, y: 306, width: 168, height: 86, title: t("Requested position"), tone: "accent", sections: [{ text: detail.roleLabel, maxLines: 2 }] },
        { x: 222, y: 306, width: 168, height: 86, title: t("Restaurant type"), tone: "accent", sections: [{ text: detail.restaurantConceptLabel, maxLines: 2 }] },
        { x: 400, y: 306, width: 168, height: 86, title: t("Experience level"), tone: "accent", sections: [{ text: detail.experienceLevelLabel, maxLines: 2 }] },
        ...categoryCards,
        {
          x: 44, y: 548, width: 257, height: 164,
          title: t("Evidence supporting fit"),
          tone: "success",
          sections: strengthSections,
        },
        {
          x: 311, y: 548, width: 257, height: 164,
          title: t("Evidence requiring verification"),
          tone: priority ? "warning" : "muted",
          sections: prioritySections,
        },
      ],
    },
    {
      eyebrow: t("PAGE 3 · DECISION SUPPORT"),
      title: t("SWOT, development & next-best roles"),
      subtitle: t("Practical guidance for a consistent, job-related manager review"),
      cards: [
        {
          x: 44, y: 154, width: 257, height: 139,
          title: t("Strengths"), tone: "success",
          sections: [{ text: joinAnalysisPoints(detail.analysis.swot.strengths, locale, t("No verified strength signal.")), maxLines: 4 }],
        },
        {
          x: 311, y: 154, width: 257, height: 139,
          title: t("Weaknesses"), tone: "warning",
          sections: [{ text: joinAnalysisPoints(detail.analysis.swot.weaknesses, locale, t("No major weakness identified.")), maxLines: 4 }],
        },
        {
          x: 44, y: 303, width: 257, height: 139,
          title: t("Opportunities"), tone: "accent",
          sections: [{ text: joinAnalysisPoints(detail.analysis.swot.opportunities, locale, t("Continue structured development.")), maxLines: 4 }],
        },
        {
          x: 311, y: 303, width: 257, height: 139,
          title: t("Threats / hiring risks"), tone: "warning",
          sections: [{ text: joinAnalysisPoints(detail.analysis.swot.threats, locale, t("Verify performance under live restaurant conditions.")), maxLines: 4 }],
        },
        {
          x: 44, y: 454, width: 257, height: 258,
          title: t("What to develop"), tone: "accent",
          sections: developmentSections,
        },
        {
          x: 311, y: 454, width: 257, height: 258,
          title: alternatives.length ? t("Alternative positions to explore") : t("Position recommendation"),
          tone: alternatives.length ? "warning" : "success",
          sections: alternativeSections,
        },
      ],
    },
  ];
}

function pageHeaderRows(page: ReportPage, locale: AppLocale) {
  const rows: TextRow[] = [];
  rows.push({ text: page.eyebrow, x: 44, y: 83, size: 10, bold: true, tone: "accent" });
  wrapText(page.title, maxCharacters(524, 24, locale), 1, locale).forEach((text) => {
    rows.push({ text, x: 44, y: 113, size: 24, bold: true });
  });
  wrapText(page.subtitle, maxCharacters(524, 14, locale), 1, locale).forEach((text) => {
    rows.push({ text, x: 44, y: 137, size: 14, tone: "muted" });
  });
  return rows;
}

function vectorY(topBaseline: number) {
  return PAGE_HEIGHT - topBaseline;
}

function pageStream(page: ReportPage, pageNumber: number, candidate: string, locale: AppLocale) {
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

  const drawText = (row: TextRow) => {
    commands.push(
      toneText(row.tone).vector,
      `BT /${row.bold ? boldFont : bodyFont} ${row.size} Tf 1 0 0 1 ${row.x} ${vectorY(row.y)} Tm ${pdfValue(row.text, locale)} Tj ET`,
    );
  };

  pageHeaderRows(page, locale).forEach(drawText);
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
    cardTextRows(card, locale).forEach(drawText);
  });

  commands.push(
    "0.03 0.12 0.18 rg 0 0 612 44 re f",
    "0.78 0.86 0.88 rg",
    `BT /${bodyFont} 9 Tf 50 18 Td ${pdfValue(`${translate(locale, "Confidential")} - ${candidate}`, locale)} Tj ET`,
    `BT /${boldFont} 9 Tf 520 18 Td ${pdfValue(`${pageNumber} / ${REPORT_PAGE_COUNT}`, locale)} Tj ET`,
  );
  return `${commands.join("\n")}\n`;
}

export function candidateReportFilename(detail: SubmissionDetail) {
  const safeName = ascii(detail.candidateName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "candidate";
  return `fred-hiring-assessment-${safeName}.pdf`;
}

function createVectorCandidateReportPdf(detail: SubmissionDetail, locale: AppLocale) {
  const pages = buildReportPages(detail, locale);
  const objects: string[] = [];
  const firstPageObject = 7;
  const pageRefs = pages.map((_, index) => `${firstPageObject + index * 2} 0 R`).join(" ");

  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Kids [${pageRefs}] /Count ${REPORT_PAGE_COUNT} >>`;
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
    const stream = pageStream(page, index + 1, detail.candidateName, locale);
    objects[pageObject] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents ${contentObject} 0 R >>`;
    objects[contentObject] = `<< /Length ${stream.length} >>\nstream\n${stream}endstream`;
  });

  let pdf = "%PDF-1.4\n% Fred Hiring System three-page candidate report\n";
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
  const pages = buildReportPages(detail, locale);
  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = PAGE_WIDTH * scale;
  canvas.height = PAGE_HEIGHT * scale;
  const context = canvas.getContext("2d");
  if (!context) return createVectorCandidateReportPdf(detail, locale);

  const fontFamily = "Arial, 'Microsoft YaHei', 'PingFang SC', 'Noto Sans CJK SC', sans-serif";
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

    const drawText = (row: TextRow) => {
      context.fillStyle = toneText(row.tone).canvas;
      context.font = `${row.bold ? 700 : 400} ${row.size}px ${fontFamily}`;
      context.fillText(row.text, row.x, row.y);
    };

    pageHeaderRows(page, locale).forEach(drawText);
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
      cardTextRows(card, locale).forEach(drawText);
    });

    context.fillStyle = "#071f2f";
    context.fillRect(0, 748, PAGE_WIDTH, 44);
    context.fillStyle = "#c7dade";
    context.font = `400 9px ${fontFamily}`;
    context.fillText(`${translate(locale, "Confidential")} - ${detail.candidateName}`, 50, 774);
    context.textAlign = "right";
    context.font = `700 9px ${fontFamily}`;
    context.fillText(`${pageIndex + 1} / ${REPORT_PAGE_COUNT}`, 562, 774);
    context.textAlign = "left";

    return base64Bytes(canvas.toDataURL("image/jpeg", 0.92).split(",", 2)[1]);
  });

  const encoder = new TextEncoder();
  const objects: Array<Array<Uint8Array>> = [];
  const pageObjectNumbers = pageImages.map((_, index) => 3 + index * 3);
  objects[1] = [encoder.encode("<< /Type /Catalog /Pages 2 0 R >>")];
  objects[2] = [encoder.encode(`<< /Type /Pages /Kids [${pageObjectNumbers.map((number) => `${number} 0 R`).join(" ")}] /Count ${REPORT_PAGE_COUNT} >>`)];

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

  const chunks: Uint8Array[] = [encoder.encode("%PDF-1.4\n% Fred Hiring System Arial report\n")];
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
    t("The confidential PDF contains a three-page personality, job-fit, and SWOT/development report."),
  ].join("\n");
}
