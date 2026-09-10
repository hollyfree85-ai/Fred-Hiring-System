import {
  categoryLabels,
  type CandidateRole,
  getAssessmentQuestions,
  type QuestionCategory,
} from "@/lib/question-bank";
import { translate, type AppLocale } from "@/lib/i18n";

export const categoryWeights: Record<QuestionCategory, number> = {
  work_style: 15,
  communication: 12.5,
  problem_solving: 12.5,
  technical: 60,
};

export const passingRules = {
  overall: 75,
  work_style: 65,
  communication: 65,
  problem_solving: 70,
  technical: 70,
} as const;

const criticalQuestionIds: Record<CandidateRole, Set<string>> = {
  host_cashier: new Set(["HC07", "HC08", "HC13", "HC14", "HC18", "HC23", "HC26", "HC35", "HC43", "HC44"]),
  server: new Set(["SV02", "SV06", "SV07", "SV13", "SV14", "SV15", "SV22", "SV28", "SV31", "SV34", "SV45"]),
  bartender: new Set(["BT01", "BT02", "BT06", "BT11", "BT12", "BT13", "BT14", "BT18", "BT20", "BT23", "BT27", "BT30"]),
  busser_runner: new Set(["BR05", "BR06", "BR09", "BR10", "BR14", "BR15", "BR18", "BR19", "BR21", "BR34", "BR44"]),
  assistant_manager: new Set(["AM05", "AM07", "AM08", "AM09", "AM10", "AM14", "AM15", "AM17", "AM20", "AM21", "AM22", "AM27", "AM28", "AM35", "AM37", "AM38"]),
  cook: new Set(["CK01", "CK03", "CK04", "CK05", "CK06", "CK08", "CK09", "CK10", "CK11", "CK12", "CK14", "CK15"]),
  cook_prep: new Set(["CP01", "CP03", "CP04", "CP05", "CP06", "CP08", "CP09", "CP10", "CP11", "CP12", "CP14", "CP15", "CP20", "CP26", "CP28"]),
  sushi_cook: new Set(["SC01", "SC03", "SC04", "SC05", "SC06", "SC08", "SC09", "SC10", "SC11", "SC12", "SC14", "SC15", "SC17", "SC18", "SC28", "SC38"]),
  sushi_prep: new Set(["SP01", "SP03", "SP04", "SP05", "SP06", "SP08", "SP09", "SP10", "SP11", "SP12", "SP14", "SP15", "SP16", "SP17", "SP18", "SP23", "SP24"]),
  sushi_chef: new Set(["SH01", "SH02", "SH03", "SH04", "SH05", "SH06", "SH07", "SH08", "SH09", "SH10", "SH11", "SH12", "SH13", "SH15", "SH36"]),
};

export type AnswerDetail = {
  questionId: string;
  category: QuestionCategory;
  categoryLabel: string;
  prompt: string;
  selectedOptionId: string;
  selectedText: string;
  points: number;
  maxPoints: number;
  isCritical: boolean;
  reviewNote: string;
};

export type ScoreResult = {
  fitPercentage: number;
  outcome: "pass" | "not_pass";
  totalScore: number;
  maxScore: number;
  categoryScores: Record<QuestionCategory, { score: number; max: number; percentage: number }>;
  criticalMisses: number;
  answerDetails: AnswerDetail[];
  failedRules: string[];
};

const percent = (score: number, max: number) =>
  max > 0 ? Math.round((score / max) * 100) : 0;

export function scoreSubmission(
  role: CandidateRole,
  answers: Record<string, string>,
): ScoreResult {
  const questions = getAssessmentQuestions(role);
  const expectedIds = new Set(questions.map((question) => question.id));
  const providedIds = Object.keys(answers);

  if (
    providedIds.length !== questions.length ||
    providedIds.some((id) => !expectedIds.has(id))
  ) {
    throw new Error("Please answer all 75 questions before submitting.");
  }

  const categoryScores: ScoreResult["categoryScores"] = {
    work_style: { score: 0, max: 0, percentage: 0 },
    communication: { score: 0, max: 0, percentage: 0 },
    problem_solving: { score: 0, max: 0, percentage: 0 },
    technical: { score: 0, max: 0, percentage: 0 },
  };

  const answerDetails = questions.map((question): AnswerDetail => {
    const selectedOptionId = answers[question.id];
    const selected = question.options.find((option) => option.id === selectedOptionId);
    if (!selected) {
      throw new Error("One or more answers are invalid. Please review the test.");
    }
    const maxPoints = Math.max(...question.options.map((option) => option.points));
    categoryScores[question.category].score += selected.points;
    categoryScores[question.category].max += maxPoints;
    return {
      questionId: question.id,
      category: question.category,
      categoryLabel: categoryLabels[question.category],
      prompt: question.prompt,
      selectedOptionId,
      selectedText: selected.text,
      points: selected.points,
      maxPoints,
      isCritical: criticalQuestionIds[role].has(question.id),
      reviewNote: question.reviewNote,
    };
  });

  for (const category of Object.keys(categoryScores) as QuestionCategory[]) {
    const current = categoryScores[category];
    current.percentage = percent(current.score, current.max);
  }

  const weighted = (Object.keys(categoryWeights) as QuestionCategory[]).reduce(
    (sum, category) =>
      sum + (categoryScores[category].percentage * categoryWeights[category]) / 100,
    0,
  );
  const fitPercentage = Math.max(1, Math.min(100, Math.round(weighted)));
  const criticalMisses = answerDetails.filter(
    (answer) => answer.isCritical && answer.points === 0,
  ).length;

  const failedRules: string[] = [];
  if (fitPercentage < passingRules.overall) {
    failedRules.push(`Overall fit is below ${passingRules.overall}%.`);
  }
  for (const category of Object.keys(categoryWeights) as QuestionCategory[]) {
    const threshold = passingRules[category];
    if (categoryScores[category].percentage < threshold) {
      failedRules.push(`${categoryLabels[category]} is below ${threshold}%.`);
    }
  }
  if (criticalMisses > 0) {
    failedRules.push(`${criticalMisses} critical safety, payment, or authorization item(s) require review.`);
  }

  const totalScore = Object.values(categoryScores).reduce((sum, item) => sum + item.score, 0);
  const maxScore = Object.values(categoryScores).reduce((sum, item) => sum + item.max, 0);

  return {
    fitPercentage,
    outcome: failedRules.length === 0 ? "pass" : "not_pass",
    totalScore,
    maxScore,
    categoryScores,
    criticalMisses,
    answerDetails,
    failedRules,
  };
}

const categoryInterviewPrompts: Record<QuestionCategory, string> = {
  work_style:
    "Ask for a real example of a mistake they owned, how they reported it, and what they changed afterward.",
  communication:
    "Role-play a delayed guest interaction and listen for acknowledgment, clear facts, and a realistic next step.",
  problem_solving:
    "Give a wrong-order or payment-status scenario and ask them to explain the order of actions and escalation.",
  technical:
    "Ask the candidate to walk through the lowest-scoring job procedure step by step without coaching.",
};

const developmentGuidance: Record<QuestionCategory, {
  action: string;
  successMeasure: string;
  opportunity: string;
  risk: string;
}> = {
  work_style: {
    action:
      "Set written attendance, accountability, and shift-handoff expectations; use a daily checklist and brief supervisor feedback after each shift.",
    successMeasure:
      "Meets scheduled commitments, reports mistakes promptly, and completes shift handoffs consistently across 10 consecutive shifts.",
    opportunity:
      "Can become a dependable shift contributor and reduce follow-up work for the team when expectations are reinforced consistently.",
    risk:
      "Unclear accountability or inconsistent follow-through could increase handoff errors and supervisor workload.",
  },
  communication: {
    action:
      "Use guest-language scripts, menu explanation practice, and two role-plays per week with immediate coaching on clarity, tone, and escalation.",
    successMeasure:
      "Completes three observed guest or teammate interactions in a row with clear acknowledgment, accurate information, and the correct next step.",
    opportunity:
      "Can build guest trust, improve team coordination, and support smoother service recovery as communication becomes consistent.",
    risk:
      "Unclear or delayed communication could create guest frustration, incorrect expectations, or missed team handoffs.",
  },
  problem_solving: {
    action:
      "Practice wrong-order, allergy, payment, delay, and conflict scenarios using a written acknowledge-check-act-escalate sequence.",
    successMeasure:
      "Handles four supervised scenarios in a row in the correct order without skipping safety, payment, or manager-escalation steps.",
    opportunity:
      "Can help recover guest problems earlier and protect service quality once escalation judgment is reliable.",
    risk:
      "Weak prioritization or late escalation could worsen guest complaints, payment disputes, or operational incidents.",
  },
  technical: {
    action:
      "Assign role-specific station training, recipe or procedure drills, supervised repetitions, and a manager sign-off before independent work.",
    successMeasure:
      "Passes the role checklist at 90% or better and completes three consecutive supervised shifts without a critical procedure miss.",
    opportunity:
      "Can reach productive role readiness faster when training targets the exact procedures missed in the assessment.",
    risk:
      "Technical gaps could affect speed, accuracy, food safety, alcohol service, cash control, or product consistency depending on the role.",
  },
};

function estimatedImprovementTimeline(percentage: number) {
  if (percentage < 50) return "60–90 days";
  if (percentage < 65) return "30–60 days";
  if (percentage < 80) return "2–4 weeks";
  return "1–2 weeks";
}

export function buildDetailedAnalysis(result: ScoreResult, locale: AppLocale = "en") {
  const t = (source: string, values: Record<string, string | number> = {}) => translate(locale, source, values);
  const categoryLabel = (category: QuestionCategory) => t(categoryLabels[category]);
  const ordered = (Object.keys(result.categoryScores) as QuestionCategory[])
    .map((category) => ({ category, ...result.categoryScores[category] }))
    .sort((a, b) => b.percentage - a.percentage);
  const strengths = ordered
    .filter((item) => item.percentage >= 75)
    .map((item) => ({
      category: item.category,
      label: categoryLabel(item.category),
      percentage: item.percentage,
      statement:
        item.percentage >= 90
          ? t("Answers consistently matched the expected job standard.")
          : t("Answers generally matched the expected job standard, with some room to confirm in interview."),
    }));
  const priorities = [...ordered]
    .reverse()
    .filter((item) => item.percentage < 80)
    .slice(0, 3)
    .map((item) => ({
      category: item.category,
      label: categoryLabel(item.category),
      percentage: item.percentage,
      statement:
        item.percentage < 65
          ? t("Multiple responses did not match expected procedure; direct follow-up and retraining evidence are needed.")
          : t("Some responses need clarification through a structured follow-up interview."),
    }));

  const reviewItems = result.answerDetails
    .filter((answer) => answer.points < answer.maxPoints)
    .sort((a, b) => {
      if (a.isCritical !== b.isCritical) return a.isCritical ? -1 : 1;
      return a.points - b.points;
    })
    .slice(0, 10);

  const focusCategories = priorities.length
    ? priorities.map((item) => item.category)
    : (["technical", "problem_solving"] as QuestionCategory[]);

  const weakestFirst = [...ordered].reverse();
  const swotStrengthCategories = ordered.filter((item) => item.percentage >= 75).slice(0, 3);
  const swotWeaknessCategories = weakestFirst.filter((item) => item.percentage < 80).slice(0, 3);
  const swotStrengths = swotStrengthCategories.length
    ? swotStrengthCategories.map((item) => ({
        title: t("{category} · {percentage}%", { category: categoryLabel(item.category), percentage: item.percentage }),
        detail:
          item.percentage >= 90
            ? t("Written responses consistently matched the job standard and indicate a strong area to verify during the structured interview.")
            : t("Written responses generally matched the job standard and provide a positive role-fit signal to confirm in live examples."),
      }))
    : [{
        title: t("Relative strength · {category} {percentage}%", { category: categoryLabel(ordered[0].category), percentage: ordered[0].percentage }),
        detail:
          t("This was the candidate's highest section, but it remains below the 75% strength marker and still needs direct verification."),
      }];
  const swotWeaknesses = swotWeaknessCategories.length
    ? swotWeaknessCategories.map((item) => ({
        title: t("{category} · {percentage}%", { category: categoryLabel(item.category), percentage: item.percentage }),
        detail:
          item.percentage < passingRules[item.category]
            ? t("This section is below its {minimum}% minimum. Responses showed inconsistent alignment with expected job decisions.", { minimum: passingRules[item.category] })
            : t("This section met its minimum but remains below the 80% coaching marker, so consistent execution should be confirmed on the job."),
      }))
    : [{
        title: t("Performance not yet observed"),
        detail:
          t("No major written section gap was identified, but the assessment does not show pace, consistency, or real-shift performance."),
      }];
  const opportunityCategories = (swotStrengthCategories.length
    ? swotStrengthCategories
    : ordered.slice(0, 2)).slice(0, 2);
  const swotOpportunities = opportunityCategories.map((item) => ({
    title: t("{category} contribution", { category: categoryLabel(item.category) }),
    detail: t(developmentGuidance[item.category].opportunity),
  }));

  const criticalReviewItems = result.answerDetails.filter(
    (answer) => answer.isCritical && answer.points === 0,
  );
  const swotThreats = [
    ...(criticalReviewItems.length
      ? [{
          title: t("{count} critical response(s) require verification", { count: criticalReviewItems.length }),
          detail:
            t("Do not assign the related task independently until the candidate explains and demonstrates the correct safety, payment, alcohol-service, or authorization procedure."),
        }]
      : []),
    ...swotWeaknessCategories.slice(0, criticalReviewItems.length ? 2 : 3).map((item) => ({
      title: t("{category} execution risk", { category: categoryLabel(item.category) }),
      detail: t(developmentGuidance[item.category].risk),
    })),
  ];
  if (!swotThreats.length) {
    swotThreats.push({
      title: t("Written-score overconfidence"),
      detail:
        t("A strong written score may not predict speed, consistency, teamwork, or performance under live restaurant pressure; verify these during structured interviews and supervised shifts."),
    });
  }

  const planCategories = (swotWeaknessCategories.length
    ? swotWeaknessCategories
    : weakestFirst.slice(0, 2)).slice(0, 3);
  const developmentPlan = [
    ...(criticalReviewItems.length
      ? [{
          priority: 1,
          area: t("Critical procedure verification"),
          currentPercentage: null,
          action:
            t("Review every zero-point critical answer, retrain the related procedure, and require a supervised demonstration before independent assignment."),
          estimatedTimeline: t("Before the first independent shift; recheck within 7 days"),
          successMeasure:
            t("Explains and demonstrates every flagged critical procedure correctly with manager sign-off."),
        }]
      : []),
    ...planCategories.map((item, index) => ({
      priority: index + (criticalReviewItems.length ? 2 : 1),
      area: categoryLabel(item.category),
      currentPercentage: item.percentage,
      action: t(developmentGuidance[item.category].action),
      estimatedTimeline: t(estimatedImprovementTimeline(item.percentage)),
      successMeasure: t(developmentGuidance[item.category].successMeasure),
    })),
  ];

  const hiringRecommendation = result.outcome === "pass"
    ? {
        status: "recommended" as const,
        label: result.fitPercentage >= 85
          ? t("Strong fit — recommended to advance")
          : t("Good fit — recommended to advance"),
        fitPercentage: result.fitPercentage,
        rationale:
          t("The candidate met every written-assessment minimum and had no zero-point critical response. Continue with the same structured interview and reference process used for other candidates in this role."),
      }
    : result.fitPercentage >= 65 && result.criticalMisses <= 1
      ? {
          status: "conditional" as const,
          label: t("Conditional — verify gaps before hiring"),
          fitPercentage: result.fitPercentage,
          rationale:
            t("The overall signal is near the hiring standard, but at least one minimum was missed. Advance only if a structured interview and job-related demonstration resolve every listed concern."),
        }
      : {
          status: "not_recommended" as const,
          label: t("Not recommended at this stage"),
          fitPercentage: result.fitPercentage,
          rationale:
            t("The written evidence does not currently support role readiness. Do not rely on this label alone; document the job-related gaps and apply the same review process used for comparable candidates."),
        };

  return {
    summary:
      result.outcome === "pass"
        ? t("The candidate met the written-assessment standard with a {percentage}% role-fit score and no failed minimum criterion.", { percentage: result.fitPercentage })
        : t("The candidate earned a {percentage}% role-fit score but did not meet every written-assessment minimum. Review the listed criteria before making any hiring decision.", { percentage: result.fitPercentage }),
    hiringRecommendation,
    swot: {
      strengths: swotStrengths,
      weaknesses: swotWeaknesses,
      opportunities: swotOpportunities,
      threats: swotThreats,
    },
    developmentPlan,
    developmentNote:
      t("Training times are planning estimates based on written-score gaps, not guarantees. A manager should adjust them after observing learning pace and job performance; never use a disability or other protected characteristic to set the timeline."),
    strengths,
    priorities,
    reviewItems,
    interviewPrompts: [...new Set(focusCategories)].map(
      (category) => t(categoryInterviewPrompts[category]),
    ),
    failedRules: [
      ...(result.fitPercentage < passingRules.overall
        ? [t("Overall fit is below {minimum}%.", { minimum: passingRules.overall })]
        : []),
      ...(Object.keys(categoryWeights) as QuestionCategory[])
        .filter((category) => result.categoryScores[category].percentage < passingRules[category])
        .map((category) => t("{category} is below {minimum}%.", {
          category: categoryLabel(category),
          minimum: passingRules[category],
        })),
      ...(result.criticalMisses > 0
        ? [t("{count} critical safety, payment, or authorization item(s) require review.", { count: result.criticalMisses })]
        : []),
    ],
    methodology:
      t("Weighted score: Role Technical Knowledge 60%, Work Style & Reliability 15%, Communication 12.5%, and Customer Problem Solving 12.5%. The first three behavioral sections contain 30 questions total; the role section contains 45 questions. Passing requires 75% overall, every section minimum, and no zero-point answer on a designated critical item."),
    limitation:
      t("This is a job-related situational assessment, not a clinical or validated psychological diagnosis. Use it consistently as one input alongside a structured interview, references, and any reasonable accommodation—not as the sole hiring decision."),
  };
}
