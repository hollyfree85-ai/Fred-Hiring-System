import type { SubmissionDetail } from "@/lib/client-types";

type ReportLine = {
  text: string;
  size: number;
  leading: number;
  bold?: boolean;
  indent?: number;
  gapAfter?: number;
  tone?: "default" | "muted" | "accent" | "success" | "warning";
};

const outcomeText = (outcome: SubmissionDetail["outcome"]) =>
  outcome === "pass" ? "LULUS TES TERTULIS" : "BELUM LULUS TES TERTULIS";

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

function wrapText(value: string, maxCharacters: number) {
  const text = ascii(value);
  if (!text) return ["Not provided"];
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

function lineWidthFor(size: number, indent = 0) {
  const usablePoints = 512 - indent;
  return Math.max(36, Math.floor(usablePoints / (size * 0.51)));
}

function addWrapped(
  rows: ReportLine[],
  text: string,
  options: Omit<ReportLine, "text">,
) {
  const lines = wrapText(text, lineWidthFor(options.size, options.indent));
  lines.forEach((line, index) => rows.push({
    ...options,
    text: line,
    gapAfter: index === lines.length - 1 ? options.gapAfter : 0,
  }));
}

function buildReportLines(detail: SubmissionDetail) {
  const rows: ReportLine[] = [];
  const bio = detail.biodata;
  const heading = (text: string) => addWrapped(rows, text.toUpperCase(), {
    size: 12,
    leading: 17,
    bold: true,
    tone: "accent",
    gapAfter: 5,
  });
  const item = (label: string, value: string) => {
    addWrapped(rows, `${label}: ${value || "Not provided"}`, {
      size: 9.5,
      leading: 13,
      gapAfter: 2,
    });
  };
  const bullet = (value: string, tone: ReportLine["tone"] = "default") => {
    addWrapped(rows, `- ${value}`, {
      size: 9.5,
      leading: 13,
      indent: 10,
      tone,
      gapAfter: 2,
    });
  };
  const spacer = (height = 8) => rows.push({ text: "", size: 8, leading: height });

  addWrapped(rows, "THE JUICY SEAFOOD & BAR", {
    size: 10,
    leading: 14,
    bold: true,
    tone: "accent",
    gapAfter: 4,
  });
  addWrapped(rows, "Candidate Assessment Report", {
    size: 21,
    leading: 25,
    bold: true,
    gapAfter: 3,
  });
  addWrapped(rows, "CONFIDENTIAL - Authorized manager use only", {
    size: 8.5,
    leading: 12,
    bold: true,
    tone: "warning",
    gapAfter: 12,
  });

  heading("Candidate & result");
  item("Candidate", detail.candidateName);
  item("Phone", detail.phone);
  item("Email", bio.email || "Not provided");
  item("Position", detail.roleLabel);
  item("Submitted", detail.submittedAt);
  item("Completion time", `${Math.max(0, Math.round(detail.durationSeconds / 60))} minutes`);
  item("Position-fit score", `${detail.fitPercentage}%`);
  item("Written result", outcomeText(detail.outcome));
  item("Critical zero-point items", String(detail.criticalMisses));
  spacer();

  heading("Assessment conclusion");
  addWrapped(rows, detail.analysis.summary, {
    size: 10,
    leading: 14,
    gapAfter: 8,
  });

  heading("Hiring recommendation");
  item("Position-fit score", `${detail.analysis.hiringRecommendation.fitPercentage}%`);
  item("Recommendation", detail.analysis.hiringRecommendation.label);
  addWrapped(rows, detail.analysis.hiringRecommendation.rationale, {
    size: 9.5,
    leading: 13,
    tone: detail.analysis.hiringRecommendation.status === "recommended" ? "success" : "warning",
    gapAfter: 8,
  });

  heading("SWOT hiring analysis");
  ([
    ["Strengths", detail.analysis.swot.strengths, "success"],
    ["Weaknesses", detail.analysis.swot.weaknesses, "warning"],
    ["Opportunities if hired", detail.analysis.swot.opportunities, "accent"],
    ["Threats / hiring risks", detail.analysis.swot.threats, "warning"],
  ] as const).forEach(([label, entries, tone]) => {
    addWrapped(rows, label, {
      size: 10,
      leading: 14,
      bold: true,
      tone,
      gapAfter: 2,
    });
    entries.forEach((entry) => bullet(`${entry.title}: ${entry.detail}`, tone));
    spacer(3);
  });

  heading("If hired - improvement plan");
  detail.analysis.developmentPlan.forEach((plan) => {
    addWrapped(rows, `${plan.priority}. ${plan.area}${plan.currentPercentage === null ? "" : ` - current score ${plan.currentPercentage}%`}`, {
      size: 9.5,
      leading: 13,
      bold: true,
      tone: "accent",
      gapAfter: 1,
    });
    bullet(`Action: ${plan.action}`);
    bullet(`Estimated time: ${plan.estimatedTimeline}`, "warning");
    bullet(`Success check: ${plan.successMeasure}`, "success");
    spacer(3);
  });
  addWrapped(rows, detail.analysis.developmentNote, {
    size: 8.5,
    leading: 12,
    tone: "muted",
    gapAfter: 8,
  });

  heading("Section evidence");
  detail.categoryScores.forEach((score) => {
    item(score.label, `${score.percentage}% (${score.score} of ${score.max} points)`);
  });
  spacer();

  heading("Decision criteria");
  addWrapped(rows, detail.analysis.methodology, {
    size: 9.5,
    leading: 13,
    gapAfter: 5,
  });
  if (detail.analysis.failedRules.length) {
    detail.analysis.failedRules.forEach((rule) => bullet(rule, "warning"));
  } else {
    bullet("All written-assessment minimums were met.", "success");
  }
  spacer();

  heading("Demonstrated strengths");
  if (detail.analysis.strengths.length) {
    detail.analysis.strengths.forEach((entry) =>
      bullet(`${entry.label} (${entry.percentage}%): ${entry.statement}`, "success"),
    );
  } else {
    bullet("No section reached the 75% strength marker.");
  }
  spacer();

  heading("Priority review areas");
  if (detail.analysis.priorities.length) {
    detail.analysis.priorities.forEach((entry) =>
      bullet(`${entry.label} (${entry.percentage}%): ${entry.statement}`, "warning"),
    );
  } else {
    bullet("No major section priority was identified; verify technical knowledge in interview.");
  }
  spacer();

  heading("Structured interview follow-up");
  detail.analysis.interviewPrompts.forEach((prompt, index) => bullet(`${index + 1}. ${prompt}`));
  spacer();

  heading("Biodata");
  item("City / state", bio.cityState);
  item("Available start", bio.availableStartDate);
  item("Restaurant experience", bio.restaurantExperience);
  item("Most recent employer", bio.mostRecentEmployer);
  item("Most recent role", bio.mostRecentRole);
  item("Reason for leaving / searching", bio.reasonLeaving);
  item("Customer-facing English", bio.englishComfort);
  item("Available days", bio.availableDays.join(", "));
  item("Available shifts", bio.availableShifts.join(", "));
  item("Desired hours", bio.hoursDesired);
  item("U.S. work authorization self-report", bio.authorizedToWork ? "Yes" : "No");
  item("Minimum-age self-report", bio.meetsAgeRequirement ? "Yes" : "No");
  item("Alcohol-service training", bio.alcoholTraining);
  item("Why join", bio.whyJoin);
  item("Service example", bio.serviceExample);
  spacer();

  heading("Priority answer evidence");
  detail.analysis.reviewItems.forEach((answer) => {
    addWrapped(rows, `${answer.questionId} - ${answer.categoryLabel} - ${answer.points}/${answer.maxPoints}${answer.isCritical ? " - CRITICAL" : ""}`, {
      size: 9.5,
      leading: 13,
      bold: true,
      tone: answer.isCritical && answer.points === 0 ? "warning" : "default",
      gapAfter: 1,
    });
    bullet(`Question: ${answer.prompt}`);
    bullet(`Selected: ${answer.selectedText}`);
    bullet(`Manager lens: ${answer.reviewNote}`, "muted");
    spacer(5);
  });

  heading("Complete answer appendix - all 75 items");
  detail.answers.forEach((answer) => {
    addWrapped(rows, `${answer.questionId} - ${answer.categoryLabel} - ${answer.points}/${answer.maxPoints}${answer.isCritical ? " - CRITICAL" : ""}`, {
      size: 8.7,
      leading: 12,
      bold: true,
      tone: answer.isCritical && answer.points === 0 ? "warning" : "default",
      gapAfter: 1,
    });
    bullet(`Question: ${answer.prompt}`);
    bullet(`Selected: ${answer.selectedText}`);
    bullet(`Manager lens: ${answer.reviewNote}`, "muted");
    spacer(4);
  });

  heading("Use limitation");
  addWrapped(rows, detail.analysis.limitation, {
    size: 9.5,
    leading: 13,
    tone: "warning",
    gapAfter: 4,
  });
  addWrapped(rows, "This is a written-assessment aid, not a final hiring decision or legal advice. Apply consistent, job-related human review and reasonable-accommodation procedures.", {
    size: 8.5,
    leading: 12,
    tone: "muted",
  });

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

function paginate(rows: ReportLine[]) {
  const pages: ReportLine[][] = [[]];
  let y = 742;
  for (const row of rows) {
    const required = row.leading + (row.gapAfter || 0);
    if (y - required < 52 && pages[pages.length - 1].length) {
      pages.push([]);
      y = 742;
    }
    pages[pages.length - 1].push(row);
    y -= required;
  }
  return pages;
}

function pageStream(page: ReportLine[], pageNumber: number, totalPages: number, candidate: string) {
  const commands: string[] = [
    "0.03 0.12 0.18 rg",
    "BT /F2 8 Tf 50 765 Td (THE JUICY SEAFOOD & BAR) Tj ET",
    "0.75 0.82 0.84 RG 0.5 w 50 756 m 562 756 l S",
  ];
  let y = 742;
  page.forEach((row) => {
    if (row.text) {
      commands.push(
        colorCommand(row.tone),
        `BT /${row.bold ? "F2" : "F1"} ${row.size} Tf 1 0 0 1 ${50 + (row.indent || 0)} ${y} Tm (${pdfEscape(row.text)}) Tj ET`,
      );
    }
    y -= row.leading + (row.gapAfter || 0);
  });
  commands.push(
    "0.75 0.82 0.84 RG 0.5 w 50 40 m 562 40 l S",
    "0.34 0.39 0.43 rg",
    `BT /F1 7.5 Tf 50 27 Td (${pdfEscape(`Confidential - ${candidate}`)}) Tj ET`,
    `BT /F1 7.5 Tf 500 27 Td (${pageNumber} / ${totalPages}) Tj ET`,
  );
  return `${commands.join("\n")}\n`;
}

export function candidateReportFilename(detail: SubmissionDetail) {
  const safeName = ascii(detail.candidateName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "candidate";
  return `juicy-assessment-${safeName}.pdf`;
}

export function createCandidateReportPdf(detail: SubmissionDetail) {
  const pages = paginate(buildReportLines(detail));
  const objects: string[] = [];
  const firstPageObject = 5;
  const pageRefs = pages.map((_, index) => `${firstPageObject + index * 2} 0 R`).join(" ");

  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Kids [${pageRefs}] /Count ${pages.length} >>`;
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
  objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";

  pages.forEach((page, index) => {
    const pageObject = firstPageObject + index * 2;
    const contentObject = pageObject + 1;
    const stream = pageStream(page, index + 1, pages.length, detail.candidateName);
    objects[pageObject] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObject} 0 R >>`;
    objects[contentObject] = `<< /Length ${stream.length} >>\nstream\n${stream}endstream`;
  });

  let pdf = "%PDF-1.4\n% Juicy candidate report\n";
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

export function candidateShareText(detail: SubmissionDetail) {
  return [
    `The Juicy Seafood & Bar candidate assessment: ${detail.candidateName}`,
    `Position: ${detail.roleLabel}`,
    `Position-fit score: ${detail.fitPercentage}%`,
    `Hiring recommendation: ${detail.analysis.hiringRecommendation.label}`,
    `Written result: ${outcomeText(detail.outcome)}`,
    "The confidential PDF report contains the detailed analysis and answer evidence.",
  ].join("\n");
}
