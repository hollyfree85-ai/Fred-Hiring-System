import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { submissions } from "@/db/schema";
import { isCandidateRole, TEST_VERSION } from "@/lib/question-bank";
import { scoreSubmission } from "@/lib/scoring";

type SubmissionBody = {
  submissionKey?: unknown;
  candidateName?: unknown;
  phone?: unknown;
  role?: unknown;
  biodata?: unknown;
  answers?: unknown;
  durationSeconds?: unknown;
  website?: unknown;
};

type Biodata = {
  email: string;
  cityState: string;
  availableStartDate: string;
  restaurantExperience: "none" | "under_1" | "1_2" | "3_5" | "over_5";
  mostRecentEmployer: string;
  mostRecentRole: string;
  reasonLeaving: string;
  englishComfort: "basic" | "conversational" | "professional" | "fluent";
  availableDays: string[];
  availableShifts: string[];
  hoursDesired: "under_20" | "20_30" | "30_40" | "over_40";
  authorizedToWork: boolean;
  meetsAgeRequirement: boolean;
  alcoholTraining: "not_applicable" | "yes" | "no" | "in_progress";
  whyJoin: string;
  serviceExample: string;
};

const allowedExperience = new Set(["none", "under_1", "1_2", "3_5", "over_5"]);
const allowedEnglish = new Set(["basic", "conversational", "professional", "fluent"]);
const allowedHours = new Set(["under_20", "20_30", "30_40", "over_40"]);
const allowedDays = new Set(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]);
const allowedShifts = new Set(["Lunch", "Dinner", "Double / Long Shift"]);
const allowedTraining = new Set(["not_applicable", "yes", "no", "in_progress"]);

function parseBiodata(value: unknown, role: string): Biodata {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Complete the employment information before submitting.");
  }
  const raw = value as Record<string, unknown>;
  const text = (key: string, max: number) =>
    typeof raw[key] === "string" ? raw[key].trim().slice(0, max) : "";
  const email = text("email", 160);
  const cityState = text("cityState", 120);
  const availableStartDate = text("availableStartDate", 10);
  const restaurantExperience = text("restaurantExperience", 20);
  const englishComfort = text("englishComfort", 20);
  const hoursDesired = text("hoursDesired", 20);
  const alcoholTraining = text("alcoholTraining", 20);
  const availableDays = Array.isArray(raw.availableDays)
    ? raw.availableDays.filter((item): item is string => typeof item === "string" && allowedDays.has(item))
    : [];
  const availableShifts = Array.isArray(raw.availableShifts)
    ? raw.availableShifts.filter((item): item is string => typeof item === "string" && allowedShifts.has(item))
    : [];

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address or leave it blank.");
  if (cityState.length < 2) throw new Error("Enter your city and state.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(availableStartDate)) throw new Error("Choose your available start date.");
  if (!allowedExperience.has(restaurantExperience)) throw new Error("Choose your restaurant experience.");
  if (!allowedEnglish.has(englishComfort)) throw new Error("Choose your customer-facing English comfort level.");
  if (!allowedHours.has(hoursDesired)) throw new Error("Choose your desired weekly hours.");
  if (!availableDays.length || !availableShifts.length) throw new Error("Choose your available days and shifts.");
  if (typeof raw.authorizedToWork !== "boolean" || typeof raw.meetsAgeRequirement !== "boolean") {
    throw new Error("Complete the work-eligibility confirmations.");
  }
  if (!allowedTraining.has(alcoholTraining)) throw new Error("Choose your alcohol-training status.");
  const alcoholTrainingApplies = role === "server" || role === "bartender" || role === "assistant_manager";
  if (!alcoholTrainingApplies && alcoholTraining !== "not_applicable") {
    throw new Error("Alcohol training should be marked not applicable for this position.");
  }
  if (alcoholTrainingApplies && alcoholTraining === "not_applicable") {
    throw new Error("Choose the alcohol-training status for this position.");
  }

  return {
    email,
    cityState,
    availableStartDate,
    restaurantExperience: restaurantExperience as Biodata["restaurantExperience"],
    mostRecentEmployer: text("mostRecentEmployer", 120),
    mostRecentRole: text("mostRecentRole", 120),
    reasonLeaving: text("reasonLeaving", 600),
    englishComfort: englishComfort as Biodata["englishComfort"],
    availableDays,
    availableShifts,
    hoursDesired: hoursDesired as Biodata["hoursDesired"],
    authorizedToWork: raw.authorizedToWork,
    meetsAgeRequirement: raw.meetsAgeRequirement,
    alcoholTraining: alcoholTraining as Biodata["alcoholTraining"],
    whyJoin: text("whyJoin", 800),
    serviceExample: text("serviceExample", 1000),
  };
}

const cleanName = (value: unknown) =>
  typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";

const cleanPhone = (value: unknown) =>
  typeof value === "string" ? value.trim().replace(/[^0-9+().\-\s]/g, "") : "";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubmissionBody;
    if (body.website) {
      return NextResponse.json({ received: true });
    }

    const candidateName = cleanName(body.candidateName);
    const phone = cleanPhone(body.phone);
    const phoneDigits = phone.replace(/\D/g, "");
    const submissionKey =
      typeof body.submissionKey === "string" ? body.submissionKey.trim() : "";

    if (candidateName.length < 2 || candidateName.length > 100) {
      return NextResponse.json({ error: "Enter your full name." }, { status: 400 });
    }
    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
    }
    if (!isCandidateRole(body.role)) {
      return NextResponse.json({ error: "Choose a valid position." }, { status: 400 });
    }
    if (!submissionKey || submissionKey.length > 80) {
      return NextResponse.json({ error: "This test session is invalid. Please restart." }, { status: 400 });
    }
    if (!body.answers || typeof body.answers !== "object" || Array.isArray(body.answers)) {
      return NextResponse.json({ error: "Answers are missing." }, { status: 400 });
    }

    const biodata = parseBiodata(body.biodata, body.role);

    const score = scoreSubmission(body.role, body.answers as Record<string, string>);
    const durationSeconds = Math.max(
      0,
      Math.min(4 * 60 * 60, Math.round(Number(body.durationSeconds) || 0)),
    );
    const db = getDb();

    const existing = await db
      .select({ id: submissions.id })
      .from(submissions)
      .where(eq(submissions.submissionKey, submissionKey))
      .limit(1);
    if (existing.length) {
      return NextResponse.json({ received: true, submissionId: existing[0].id });
    }

    const id = crypto.randomUUID();
    await db.insert(submissions).values({
      id,
      submissionKey,
      candidateName,
      phone,
      role: body.role,
      biodataJson: JSON.stringify(biodata),
      fitPercentage: score.fitPercentage,
      outcome: score.outcome,
      totalScore: score.totalScore,
      maxScore: score.maxScore,
      workStyleScore: score.categoryScores.work_style.score,
      workStyleMax: score.categoryScores.work_style.max,
      communicationScore: score.categoryScores.communication.score,
      communicationMax: score.categoryScores.communication.max,
      problemSolvingScore: score.categoryScores.problem_solving.score,
      problemSolvingMax: score.categoryScores.problem_solving.max,
      technicalScore: score.categoryScores.technical.score,
      technicalMax: score.categoryScores.technical.max,
      criticalMisses: score.criticalMisses,
      answersJson: JSON.stringify({
        answerDetails: score.answerDetails,
        failedRules: score.failedRules,
      }),
      durationSeconds,
      testVersion: TEST_VERSION,
    });

    return NextResponse.json({ received: true, submissionId: id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The test could not be submitted.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
