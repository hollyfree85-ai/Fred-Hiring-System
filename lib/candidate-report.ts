import type { SubmissionDetail } from "@/lib/client-types";
import { translate, type AppLocale } from "@/lib/i18n";

type ReportLine = {
  text: string;
  size: number;
  leading: number;
  bold?: boolean;
  indent?: number;
  gapAfter?: number;
  tone?: "default" | "muted" | "accent" | "success" | "warning";
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

function wrapText(value: string, maxCharacters: number, locale: AppLocale) {
  const text = isCjkLocale(locale) ? value.replace(/\s+/g, " ").trim() : ascii(value);
  if (!text) return ["Not provided"];
  if (isCjkLocale(locale)) {
    const characters = Array.from(text);
    return Array.from({ length: Math.ceil(characters.length / maxCharacters) }, (_, index) => (
      characters.slice(index * maxCharacters, (index + 1) * maxCharacters).join("")
    ));
  }
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (!current) {
      current = word;
    } else if (`${current} ${word}`.length <= maxCharacters) {
      current += ` ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function lineWidthFor(size: number, indent = 0, locale: AppLocale = "en") {
  const usablePoints = 512 - indent;
  return Math.max(isCjkLocale(locale) ? 18 : 36, Math.floor(usablePoints / (size * (isCjkLocale(locale) ? 1 : 0.51))));
}

function addWrapped(
  rows: ReportLine[],
  text: string,
  options: Omit<ReportLine, "text">,
  locale: AppLocale,
) {
  const lines = wrapText(text, lineWidthFor(options.size, options.indent, locale), locale);
  lines.forEach((line, index) => rows.push({
    ...options,
    text: line,
    gapAfter: index === lines.length - 1 ? options.gapAfter : 0,
  }));
}

function buildReportLines(detail: SubmissionDetail, locale: AppLocale) {
  const rows: ReportLine[] = [];
  const t = (source: string, values: Record<string, string | number> = {}) => translate(locale, source, values);
  const bio = detail.biodata;
  const heading = (text: string) => addWrapped(rows, isCjkLocale(locale) ? text : text.toUpperCase(), {
    size: 16,
    leading: 23,
    bold: true,
    tone: "accent",
    gapAfter: 5,
  }, locale);
  const item = (label: string, value: string) => {
    addWrapped(rows, `${label}: ${value || t("Not provided")}`, {
      size: 14,
      leading: 20,
      gapAfter: 3,
    }, locale);
  };
  const bullet = (value: string, tone: ReportLine["tone"] = "default") => {
    addWrapped(rows, `- ${value}`, {
      size: 14,
      leading: 20,
      indent: 12,
      tone,
      gapAfter: 2,
    }, locale);
  };
  const spacer = (height = 8) => rows.push({ text: "", size: 8, leading: height });

  addWrapped(rows, "FRED HIRING SYSTEM", {
    size: 12,
    leading: 17,
    bold: true,
    tone: "accent",
    gapAfter: 4,
  }, locale);
  addWrapped(rows, t("Candidate Assessment Report"), {
    size: 26,
    leading: 31,
    bold: true,
    gapAfter: 3,
  }, locale);
  addWrapped(rows, t("CONFIDENTIAL - Authorized manager use only"), {
    size: 11,
    leading: 16,
    bold: true,
    tone: "warning",
    gapAfter: 12,
  }, locale);

  heading(t("Candidate & result"));
  item(t("Candidate"), detail.candidateName);
  item(t("Phone"), detail.phone);
  item(t("Email"), bio.email || t("Not provided"));
  item(t("Restaurant type"), detail.restaurantConceptLabel);
  item(t("Job family"), detail.jobFamilyLabel);
  item(t("Position"), detail.roleLabel);
  item(t("Experience level"), detail.experienceLevelLabel);
  item(t("Submitted"), detail.submittedAt);
  item(t("Completion time"), t("{minutes} minutes", { minutes: Math.max(0, Math.round(detail.durationSeconds / 60)) }));
  item(t("Position-fit score"), `${detail.fitPercentage}%`);
  item(t("Written result"), outcomeText(detail.outcome, locale));
  item(t("Critical zero-point items"), String(detail.criticalMisses));
  spacer();

  heading(t("Assessment conclusion"));
  addWrapped(rows, detail.analysis.summary, {
    size: 14,
    leading: 20,
    gapAfter: 8,
  }, locale);

  heading(t("Hiring recommendation"));
  item(t("Position-fit score"), `${detail.analysis.hiringRecommendation.fitPercentage}%`);
  item(t("Recommendation"), detail.analysis.hiringRecommendation.label);
  addWrapped(rows, detail.analysis.hiringRecommendation.rationale, {
    size: 14,
    leading: 20,
    tone: detail.analysis.hiringRecommendation.status === "recommended" ? "success" : "warning",
    gapAfter: 8,
  }, locale);

  if (detail.analysis.psychologyProfile.length) {
    heading(t("Work psychology profile"));
    addWrapped(rows, t("Six non-clinical work traits based on the first 30 responses."), {
      size: 14,
      leading: 20,
      tone: "muted",
      gapAfter: 6,
    }, locale);
    detail.analysis.psychologyProfile.forEach((trait) => {
      addWrapped(rows, `${trait.label} — ${trait.percentage}% · ${trait.bandLabel}`, {
        size: 14,
        leading: 20,
        bold: true,
        tone: trait.band === "strong" ? "success" : "warning",
        gapAfter: 2,
      }, locale);
      addWrapped(rows, trait.interpretation, {
        size: 14,
        leading: 20,
        gapAfter: 2,
      }, locale);
      bullet(`${t("Manager follow-up:")} ${trait.managerFollowUp}`, "accent");
      spacer(4);
    });
    addWrapped(rows, t("This profile describes job-related response patterns. It is not a clinical test, personality diagnosis, or substitute for a structured interview."), {
      size: 14,
      leading: 20,
      tone: "warning",
      gapAfter: 8,
    }, locale);
  }

  heading(t("SWOT hiring analysis"));
  ([
    [t("Strengths"), detail.analysis.swot.strengths, "success"],
    [t("Weaknesses"), detail.analysis.swot.weaknesses, "warning"],
    [t("Opportunities if hired"), detail.analysis.swot.opportunities, "accent"],
    [t("Threats / hiring risks"), detail.analysis.swot.threats, "warning"],
  ] as const).forEach(([label, entries, tone]) => {
    addWrapped(rows, label, {
      size: 14,
      leading: 20,
      bold: true,
      tone,
      gapAfter: 2,
    }, locale);
    entries.forEach((entry) => bullet(`${entry.title}: ${entry.detail}`, tone));
    spacer(3);
  });

  heading(t("If hired - improvement plan"));
  detail.analysis.developmentPlan.forEach((plan) => {
    addWrapped(rows, `${plan.priority}. ${plan.area}${plan.currentPercentage === null ? "" : ` - ${t("current score {percentage}%", { percentage: plan.currentPercentage })}`}`, {
      size: 14,
      leading: 20,
      bold: true,
      tone: "accent",
      gapAfter: 1,
    }, locale);
    bullet(`${t("Action")}: ${plan.action}`);
    bullet(`${t("Estimated time")}: ${plan.estimatedTimeline}`, "warning");
    bullet(`${t("Success check")}: ${plan.successMeasure}`, "success");
    spacer(3);
  }, locale);
  addWrapped(rows, detail.analysis.developmentNote, {
    size: 14,
    leading: 20,
    tone: "muted",
    gapAfter: 8,
  }, locale);

  heading(t("Section evidence"));
  detail.categoryScores.forEach((score) => {
    item(score.label, t("{percentage}% ({score} of {max} points)", { percentage: score.percentage, score: score.score, max: score.max }));
  });
  spacer();

  heading(t("Decision criteria"));
  addWrapped(rows, detail.analysis.methodology, {
    size: 14,
    leading: 20,
    gapAfter: 5,
  }, locale);
  if (detail.analysis.failedRules.length) {
    detail.analysis.failedRules.forEach((rule) => bullet(rule, "warning"));
  } else {
    bullet(t("All written-assessment minimums were met."), "success");
  }
  spacer();

  heading(t("Demonstrated strengths"));
  if (detail.analysis.strengths.length) {
    detail.analysis.strengths.forEach((entry) =>
      bullet(`${entry.label} (${entry.percentage}%): ${entry.statement}`, "success"),
    );
  } else {
    bullet(t("No section reached the 75% strength marker."));
  }
  spacer();

  heading(t("Priority review areas"));
  if (detail.analysis.priorities.length) {
    detail.analysis.priorities.forEach((entry) =>
      bullet(`${entry.label} (${entry.percentage}%): ${entry.statement}`, "warning"),
    );
  } else {
    bullet(t("No major section priority was identified; verify technical knowledge in interview."));
  }
  spacer();

  heading(t("Structured interview follow-up"));
  detail.analysis.interviewPrompts.forEach((prompt, index) => bullet(`${index + 1}. ${prompt}`));
  spacer();

  heading(t("Biodata"));
  item(t("City / state"), bio.cityState);
  item(t("Available start"), bio.availableStartDate);
  item(t("Restaurant experience"), t(bio.restaurantExperience));
  item(t("Most recent employer"), bio.mostRecentEmployer);
  item(t("Most recent role"), bio.mostRecentRole);
  item(t("Reason for leaving / searching"), bio.reasonLeaving);
  item(t("Customer-facing English"), t(bio.englishComfort));
  item(t("Available days"), bio.availableDays.map((value) => t(value)).join(", "));
  item(t("Available shifts"), bio.availableShifts.map((value) => t(value)).join(", "));
  item(t("Desired hours"), t(bio.hoursDesired));
  item(t("U.S. work authorization self-report"), t(bio.authorizedToWork ? "Yes" : "No"));
  item(t("Minimum-age self-report"), t(bio.meetsAgeRequirement ? "Yes" : "No"));
  item(t("Alcohol-service training"), t(bio.alcoholTraining));
  item(t("Why join"), bio.whyJoin);
  item(t("Service example"), bio.serviceExample);
  spacer();

  heading(t("Priority answer evidence"));
  detail.analysis.reviewItems.forEach((answer) => {
    addWrapped(rows, `${answer.questionId} - ${answer.categoryLabel} - ${answer.points}/${answer.maxPoints}${answer.isCritical ? ` - ${t("CRITICAL")}` : ""}`, {
      size: 14,
      leading: 20,
      bold: true,
      tone: answer.isCritical && answer.points === 0 ? "warning" : "default",
      gapAfter: 1,
    }, locale);
    bullet(`${t("Question")}: ${answer.prompt}`);
    bullet(`${t("Selected")}: ${answer.selectedText}`);
    bullet(`${t("Manager lens")}: ${answer.reviewNote}`, "muted");
    spacer(5);
  });

  heading(t("Complete answer appendix - all 75 items"));
  detail.answers.forEach((answer) => {
    addWrapped(rows, `${answer.questionId} - ${answer.categoryLabel} - ${answer.points}/${answer.maxPoints}${answer.isCritical ? ` - ${t("CRITICAL")}` : ""}`, {
      size: 14,
      leading: 20,
      bold: true,
      tone: answer.isCritical && answer.points === 0 ? "warning" : "default",
      gapAfter: 1,
    }, locale);
    bullet(`${t("Question")}: ${answer.prompt}`);
    bullet(`${t("Selected")}: ${answer.selectedText}`);
    bullet(`${t("Manager lens")}: ${answer.reviewNote}`, "muted");
    spacer(4);
  });

  heading(t("Use limitation"));
  addWrapped(rows, detail.analysis.limitation, {
    size: 14,
    leading: 20,
    tone: "warning",
    gapAfter: 4,
  }, locale);
  addWrapped(rows, t("This is a written-assessment aid, not a final hiring decision or legal advice. Apply consistent, job-related human review and reasonable-accommodation procedures."), {
    size: 14,
    leading: 20,
    tone: "muted",
  }, locale);

  return rows;
}

function colorCommand(tone: ReportLine["tone"]) {
  switch (tone) {
    case "accent": return "0.03 0.42 0.50 rg";
    case "success": return "0.05 0.43 0.28 rg";
    case "warning": return "0.65 0.20 0.12 rg";
    case "muted": return "0.34 0.39 0.43 rg";
    default: return "0.06 0.10 0.13 rg";
  }
}

function canvasColor(tone: ReportLine["tone"]) {
  switch (tone) {
    case "accent": return "#087080";
    case "success": return "#0d6e47";
    case "warning": return "#a6331f";
    case "muted": return "#57646e";
    default: return "#0f1a21";
  }
}

function paginate(rows: ReportLine[]) {
  const pages: ReportLine[][] = [[]];
  let y = 714;
  for (const row of rows) {
    const required = row.leading + (row.gapAfter || 0);
    if (y - required < 58 && pages[pages.length - 1].length) {
      pages.push([]);
      y = 714;
    }
    pages[pages.length - 1].push(row);
    y -= required;
  }
  return pages;
}

function isSectionHeading(row: ReportLine) {
  return Boolean(row.bold && row.tone === "accent" && row.size >= 16);
}

function vectorSurface(row: ReportLine) {
  if (isSectionHeading(row)) return "0.03 0.42 0.50 rg";
  switch (row.tone) {
    case "success": return "0.91 0.98 0.94 rg";
    case "warning": return "1 0.95 0.91 rg";
    case "accent": return "0.91 0.97 0.98 rg";
    case "muted": return "0.95 0.96 0.97 rg";
    default: return "1 1 1 rg";
  }
}

function canvasSurface(row: ReportLine) {
  if (isSectionHeading(row)) return "#087080";
  switch (row.tone) {
    case "success": return "#e8f8ee";
    case "warning": return "#fff1e8";
    case "accent": return "#e8f7fa";
    case "muted": return "#f1f4f6";
    default: return "#ffffff";
  }
}

function pageStream(page: ReportLine[], pageNumber: number, totalPages: number, candidate: string, locale: AppLocale) {
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
  let y = 714;
  page.forEach((row) => {
    if (row.text) {
      const heading = isSectionHeading(row);
      const rectangleY = y - row.leading + 2;
      const rectangleHeight = row.leading + 7;
      commands.push(
        vectorSurface(row),
        `44 ${rectangleY} 524 ${rectangleHeight} re f`,
        heading ? "1 1 1 rg" : colorCommand(row.tone),
        `BT /${row.bold ? boldFont : bodyFont} ${row.size} Tf 1 0 0 1 ${56 + (row.indent || 0)} ${y} Tm ${pdfValue(row.text, locale)} Tj ET`,
      );
    }
    y -= row.leading + (row.gapAfter || 0);
  });
  commands.push(
    "0.03 0.12 0.18 rg 0 0 612 44 re f",
    "0.78 0.86 0.88 rg",
    `BT /${bodyFont} 9 Tf 50 18 Td ${pdfValue(`${translate(locale, "Confidential")} - ${candidate}`, locale)} Tj ET`,
    `BT /${boldFont} 9 Tf 520 18 Td ${pdfValue(`${pageNumber} / ${totalPages}`, locale)} Tj ET`,
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
  const pages = paginate(buildReportLines(detail, locale));
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
    const stream = pageStream(page, index + 1, pages.length, detail.candidateName, locale);
    objects[pageObject] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents ${contentObject} 0 R >>`;
    objects[contentObject] = `<< /Length ${stream.length} >>\nstream\n${stream}endstream`;
  });

  let pdf = "%PDF-1.4\n% Fred Hiring System candidate report\n";
  const offsets: number[] = [0];
  for (let index = 1; index < objects.length; index += 1) {
    offsets[index] = pdf.length;
    pdf += `${index} 0 obj\n${objects[index]}\nendobj\n`;
  }
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length}\n`;
  pdf += "0000000000 65535 f \n";
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
  const pages = paginate(buildReportLines(detail, locale));
  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = 612 * scale;
  canvas.height = 792 * scale;
  const context = canvas.getContext("2d");
  if (!context) return createVectorCandidateReportPdf(detail, locale);

  const pageImages = pages.map((page, pageIndex) => {
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.fillStyle = "#f4f7f8";
    context.fillRect(0, 0, 612, 792);
    context.textBaseline = "alphabetic";
    context.fillStyle = "#071f2f";
    context.fillRect(0, 0, 612, 56);
    context.fillStyle = "#42e1ea";
    context.fillRect(0, 52, 612, 4);
    context.fillStyle = "#ffffff";
    context.font = "700 11px Arial, 'Microsoft YaHei', 'PingFang SC', sans-serif";
    context.fillText("FRED HIRING SYSTEM", 50, 34);
    context.fillStyle = "#bfd8dd";
    context.font = "400 8px Arial, 'Microsoft YaHei', 'PingFang SC', sans-serif";
    context.textAlign = "right";
    context.fillText(translate(locale, "Confidential report"), 562, 34);
    context.textAlign = "left";

    let y = 78;
    for (const row of page) {
      if (row.text) {
        const heading = isSectionHeading(row);
        context.fillStyle = canvasSurface(row);
        context.fillRect(44, y - row.size - 5, 524, row.leading + 7);
        context.fillStyle = heading ? "#ffffff" : canvasColor(row.tone);
        context.font = `${row.bold ? 700 : 400} ${row.size}px Arial, 'Microsoft YaHei', 'PingFang SC', 'Noto Sans CJK SC', sans-serif`;
        context.fillText(row.text, 56 + (row.indent || 0), y);
      }
      y += row.leading + (row.gapAfter || 0);
    }

    context.fillStyle = "#071f2f";
    context.fillRect(0, 748, 612, 44);
    context.fillStyle = "#c7dade";
    context.font = "400 9px Arial, 'Microsoft YaHei', 'PingFang SC', sans-serif";
    context.fillText(`${translate(locale, "Confidential")} - ${detail.candidateName}`, 50, 774);
    context.textAlign = "right";
    context.font = "700 9px Arial, 'Microsoft YaHei', 'PingFang SC', sans-serif";
    context.fillText(`${pageIndex + 1} / ${pages.length}`, 562, 774);
    context.textAlign = "left";

    return base64Bytes(canvas.toDataURL("image/jpeg", 0.9).split(",", 2)[1]);
  });

  const encoder = new TextEncoder();
  const objects: Array<Array<Uint8Array>> = [];
  const pageObjectNumbers = pageImages.map((_, index) => 3 + index * 3);
  objects[1] = [encoder.encode("<< /Type /Catalog /Pages 2 0 R >>")];
  objects[2] = [encoder.encode(`<< /Type /Pages /Kids [${pageObjectNumbers.map((number) => `${number} 0 R`).join(" ")}] /Count ${pageImages.length} >>`)];

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
    objects[contentObject] = [
      encoder.encode(`<< /Length ${stream.length} >>\nstream\n`),
      stream,
      encoder.encode("endstream"),
    ];
  });

  const chunks: Uint8Array[] = [encoder.encode("%PDF-1.4\n% Fred Hiring System CJK report\n")];
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
  return [
    t("Fred Hiring System candidate assessment: {name}", { name: detail.candidateName }),
    t("Position: {position}", { position: detail.roleLabel }),
    t("Restaurant type: {restaurant}", { restaurant: detail.restaurantConceptLabel }),
    t("Position-fit score: {percentage}%", { percentage: detail.fitPercentage }),
    t("Hiring recommendation: {recommendation}", { recommendation: detail.analysis.hiringRecommendation.label }),
    t("Written result: {result}", { result: outcomeText(detail.outcome, locale) }),
    t("The confidential PDF report contains the detailed analysis and answer evidence."),
  ].join("\n");
}
